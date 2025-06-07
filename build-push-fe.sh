#!/usr/bin/env bash
#
# Build & push the front-end image to ECR – **tier-aware**.
# ─────────────────────────────────────────────────────────────
#   ./build-push-fe.sh  [demo|prod]  <tag>
#     – tier argument is optional; defaults to demo
# ─────────────────────────────────────────────────────────────
set -euo pipefail
trap 'echo "💥  aborted at line $LINENO (exit $?)"' ERR

###############################################################################
# 0️⃣  Tier & base config  (★★ NEW – tier support)
###############################################################################
TIER="demo"
if [[ ${1:-} =~ ^(demo|prod)$ ]]; then
  TIER="$1"; shift
fi

AWS_REGION=${AWS_REGION:-eu-west-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-230551530547}

# repo name and .env file depend on the tier
if [[ $TIER == "prod" ]]; then
  REPO="fe-agroetica-prod"
  ENV_FILE=".env.prod"
else
  REPO="fe-agroetica-dev"
  ENV_FILE=".env.demo"
fi

###############################################################################
# 1️⃣  Determine image tag (unchanged)
###############################################################################
if [[ -n "${1-}" ]]; then
  TAG="$1"
elif git rev-parse --git-dir >/dev/null 2>&1; then
  TAG=$(git rev-parse --short HEAD)
else
  TAG=latest
fi
IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:$TAG"

###############################################################################
# 2️⃣  Load tier-specific .env file (★★ NEW)
###############################################################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ ! -f "$SCRIPT_DIR/$ENV_FILE" ]]; then
  echo "❌  $ENV_FILE missing – aborting." >&2; exit 1
fi
set -a;  source "$SCRIPT_DIR/$ENV_FILE";  set +a   # export into shell

GRAPHQL="$NEXT_PUBLIC_GRAPHQL_ENDPOINT"
BASEURL="$NEXT_PUBLIC_KEYSTONE_BASE_URL"

echo
echo "────────────────────────── BUILD INFO ──────────────────────────"
printf " Tier          : %s\n Image         : %s\n" "$TIER" "$IMAGE_URI"
printf " GraphQL URL   : %s\n Keystone URL  : %s\n" "$GRAPHQL" "$BASEURL"
echo "─────────────────────────────────────────────────────────────────"
echo

###############################################################################
# 3️⃣  ECR login (unchanged)
###############################################################################
aws ecr get-login-password --region "$AWS_REGION" \
| docker login --username AWS --password-stdin \
  "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

###############################################################################
# 4️⃣  Build image (unchanged logic)
###############################################################################
docker build \
  --build-arg NEXT_PUBLIC_GRAPHQL_ENDPOINT="$GRAPHQL" \
  --build-arg NEXT_PUBLIC_KEYSTONE_BASE_URL="$BASEURL" \
  -t "$IMAGE_URI" .

###############################################################################
# 5️⃣  Push with retry (unchanged)
###############################################################################
for i in {1..4}; do
  echo "📤 docker push attempt $i/4 ..."
  if docker push "$IMAGE_URI"; then
    echo "✅  Image pushed: $IMAGE_URI"; exit 0
  fi
  echo "⏳  Push failed – sleeping 10 s …"; sleep 10
done

echo "❌  docker push failed after 4 attempts."; exit 1
