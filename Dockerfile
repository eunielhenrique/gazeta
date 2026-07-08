# Gazeta de Alphaville — imagem de produção (DigitalOcean App Platform).
FROM node:22-slim AS base
# Prisma precisa de openssl no runtime.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ── deps ──────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ── build ─────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ── runner ────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/prisma ./prisma
EXPOSE 8080
# Aplica migrações pendentes e sobe o servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
