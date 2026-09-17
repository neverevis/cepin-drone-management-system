# syntax=docker/dockerfile:1
# Dockerfile simples e robusto (prioriza confiabilidade em ambiente
# institucional em detrimento do tamanho mínimo da imagem).

FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
ENV NEXTAUTH_SECRET="build-time-placeholder"
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
# Ao subir o container, sincroniza o schema com o banco (útil para SQLite em
# desenvolvimento/demonstração) e inicia o servidor Next.js.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run start"]
