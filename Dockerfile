###############################################################################
# 1️⃣  Build stage – Node 18 + native headers
###############################################################################
FROM --platform=$BUILDPLATFORM node:18-bullseye-slim AS builder
WORKDIR /app

# ── tool-chain + canvas headers ──────────────────────────────────────────────
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      python3 make g++ \
      libcairo2-dev libpango1.0-dev libjpeg62-turbo-dev libgif-dev \
  && rm -rf /var/lib/apt/lists/*

# ── JS deps ──────────────────────────────────────────────────────────────────
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --legacy-peer-deps

# ── arm64 helper binaries for lightningcss + tailwind-oxide ──────────────────
RUN node - <<'NODE'
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function pkgRoot(entry){let d=path.dirname(entry);while(!fs.existsSync(path.join(d,'package.json')))d=path.dirname(d);return d;}
function addHelper(main, helperBase, outName){
  const root=pkgRoot(require.resolve(main));
  const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version;
  const helper=`${helperBase}-linux-arm64-gnu@${version}`;
  execSync(`npm i --no-save ${helper}`,{stdio:'inherit'});
  const hDir=path.join('node_modules',`${helperBase}-linux-arm64-gnu`);
  const bin=fs.readdirSync(hDir).find(f=>f.endsWith('.node'));
  if(!bin) throw new Error('binary not found');
  fs.copyFileSync(path.join(hDir,bin),path.join(root,`${outName}.linux-arm64-gnu.node`));
}
addHelper('lightningcss','lightningcss','lightningcss');
addHelper('@tailwindcss/oxide','@tailwindcss/oxide','oxide');
NODE

# ── project sources ──────────────────────────────────────────────────────────
COPY . .

# >>> public env-vars baked into the browser bundle (build-time) <<<
ARG NEXT_PUBLIC_GRAPHQL_ENDPOINT
ENV NEXT_PUBLIC_GRAPHQL_ENDPOINT=$NEXT_PUBLIC_GRAPHQL_ENDPOINT

ARG NEXT_PUBLIC_KEYSTONE_BASE_URL
ENV NEXT_PUBLIC_KEYSTONE_BASE_URL=$NEXT_PUBLIC_KEYSTONE_BASE_URL

# ── Next.js standalone build ────────────────────────────────────────────────
RUN npm run build



###############################################################################
# 2️⃣  Runtime stage – slim image
###############################################################################
FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# ── make the *same* public env-vars available at runtime ─────────────────────
ARG NEXT_PUBLIC_GRAPHQL_ENDPOINT
ENV NEXT_PUBLIC_GRAPHQL_ENDPOINT=${NEXT_PUBLIC_GRAPHQL_ENDPOINT}

ARG NEXT_PUBLIC_KEYSTONE_BASE_URL
ENV NEXT_PUBLIC_KEYSTONE_BASE_URL=${NEXT_PUBLIC_KEYSTONE_BASE_URL}

# ── shared libs needed by @napi-rs/canvas etc. ───────────────────────────────
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      libcairo2 libpango-1.0-0 libjpeg62-turbo libgif7 \
  && rm -rf /var/lib/apt/lists/*

# ── app bundle ───────────────────────────────────────────────────────────────
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public       ./public
COPY --from=builder /app/secrets      ./secrets

EXPOSE 3000
CMD ["node", "server.js"]
