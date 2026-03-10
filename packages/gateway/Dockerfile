FROM node:20-slim AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN yarn build

# ── runtime ───────────────────────────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

# Required args: -k <private-key> -d <rpc-url> -c <l2-resolver-contract-address>
# Optional:      -p <port> (default: 8080)
ENTRYPOINT ["node", "dist/index.js"]
