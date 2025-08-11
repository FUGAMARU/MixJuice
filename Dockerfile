FROM node:18.18.0-alpine AS base
WORKDIR /app

# Next.js（SWC）や sharp のプリビルドをAlpineで安定させるための互換レイヤ
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

COPY package.json package-lock.json .npmrc ./
RUN npm ci || npm install

# ビルドステージ
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

COPY . .

ENV NODE_ENV=production
RUN npm run build

# 実行ステージ
FROM base AS runner
ENV NODE_ENV=production
# ポート番号
ENV PORT=8086

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001


COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./


RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 8086

CMD ["npm", "run", "start", "--", "-p", "8086"]
