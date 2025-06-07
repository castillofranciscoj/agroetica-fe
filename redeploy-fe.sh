#!/usr/bin/env bash
#
# Redeploy the front-end service – **tier-aware**.
# ─────────────────────────────────────────────────────────────
#   ./redeploy-fe.sh  [demo|prod]  <tag>
# ─────────────────────────────────────────────────────────────
set -euo pipefail
trap 'echo "💥  aborted at line $LINENO (exit $?)"' ERR

###############################################################################
# 0️⃣  Tier & arguments
###############################################################################
TIER="demo"
if [[ ${1:-} =~ ^(demo|prod)$ ]]; then
  TIER="$1"; shift
fi

TAG="${1:-}"
[[ -z $TAG ]] && { echo "Usage: $0 [demo|prod] <image-tag>" >&2; exit 1; }

###############################################################################
# 1️⃣  Static per-tier settings
###############################################################################
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="230551530547"

if [[ $TIER == "prod" ]]; then               # ■■■ PROD ■■■
  TD_FAMILY="fe-agroetica-prod"
  CLUSTER="cluster-agroetica-fe-prod"
  SERVICE="fe-agroetica-prod-service"
  SECRET_ID="agroetica/prod/fe-agroetica-prod-env"
else                                         # ■■■ DEMO ■■■
  TD_FAMILY="fe-agroetica-dev"
  CLUSTER="cluster-agroetica-keystone-dev"
  SERVICE="fe-agroetica-dev-service"
  SECRET_ID="agroetica/dev/fe-agroetica-dev-env"
fi

IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${TD_FAMILY}:${TAG}"

echo
echo "────────────────────────── DEPLOY INFO ─────────────────────────"
printf " Tier       : %s\n Cluster    : %s\n Service    : %s\n" \
       "$TIER" "$CLUSTER" "$SERVICE"
printf " TD family  : %s\n Image      : %s\n Secrets ID : %s\n" \
       "$TD_FAMILY" "$IMAGE" "$SECRET_ID"
echo "─────────────────────────────────────────────────────────────────"
echo

###############################################################################
# 2️⃣  Fetch latest task-definition
###############################################################################
aws ecs describe-task-definition \
  --task-definition "$TD_FAMILY" \
  --region "$AWS_REGION" \
  --query taskDefinition --output json > /tmp/td.orig.json

###############################################################################
# 3️⃣  Patch image, NODE_ENV **and APP_TIER** (★★ NEW)
###############################################################################
jq --arg img     "$IMAGE" \
   --arg secret  "$SECRET_ID" \
   --arg region  "$AWS_REGION" \
   --arg acct    "$AWS_ACCOUNT_ID" \
   --arg tier    "$TIER" '
  .containerDefinitions |=
  (map(
     if .name=="frontend" then
       .image = $img
       | .environment = (
           (.environment // [])
           | map(select(.name != "NODE_ENV" and .name != "APP_TIER"))
           + [ {name:"NODE_ENV", value:"production"},
               {name:"APP_TIER", value:$tier} ]
         )
       | .secrets = (
           ["NEXTAUTH_URL","NEXTAUTH_SECRET","NEXT_PUBLIC_GRAPHQL_ENDPOINT",
            "KEYSTONE_BASE_URL","KEYSTONE_API_TOKEN","NEXT_PUBLIC_APP_URL",
            "GOOGLE_APPLICATION_CREDENTIALS","GOOGLE_CLOUD_PROJECT",
            "GOOGLE_VERTEX_LOCATION","GOOGLE_CLIENT_ID","GOOGLE_CLIENT_SECRET",
            "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY","FACEBOOK_CLIENT_ID",
            "FACEBOOK_CLIENT_SECRET","STRIPE_SECRET_KEY",
            "STRIPE_WEBHOOK_SECRET","STRIPE_PRICE_STARTER","STRIPE_PRICE_PRO",
            "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]
           | map({
               name: .,
               valueFrom:
                 ("arn:aws:secretsmanager:" + $region + ":" + $acct
                  + ":secret:" + $secret + ":" + . + "::")
             })
         )
     else . end
   ))
  | del(.taskDefinitionArn,.revision,.status,.requiresAttributes,
        .compatibilities,.registeredAt,.registeredBy)
' /tmp/td.orig.json > /tmp/td.new.json

###############################################################################
# 4️⃣  Register & deploy
###############################################################################
TD_ARN=$(aws ecs register-task-definition \
           --cli-input-json file:///tmp/td.new.json \
           --region "$AWS_REGION" \
           --query 'taskDefinition.taskDefinitionArn' --output text)
echo "✅  Registered   $TD_ARN"

aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --task-definition "$TD_ARN" \
  --force-new-deployment \
  --region "$AWS_REGION"

echo -e "\n🚀  Deployment started – wait for stability with:\n" \
        "aws ecs wait services-stable --cluster $CLUSTER \\\n" \
        "  --services $SERVICE --region $AWS_REGION"
