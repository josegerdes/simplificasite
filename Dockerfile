# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Variáveis NEXT_PUBLIC_* são embutidas no bundle do client NA HORA DO BUILD, não em
# runtime — diferente das outras env vars do container, precisam chegar como build arg
# (o `environment:` do docker-compose só existe depois que a imagem já foi construída).
ARG NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
ENV NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=${NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY}
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["node", "server.js"]
