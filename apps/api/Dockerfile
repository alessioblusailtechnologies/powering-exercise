# Dockerfile multi-stage per l'API Bun + Hono.
# Build context: root del monorepo.
# Build: docker build -f apps/api/Dockerfile -t powering-api .

FROM oven/bun:1.3-alpine AS deps
WORKDIR /app
# Copia TUTTI i package.json dei workspace per allineare il lockfile
# anche se installiamo solo le deps di apps/api.
COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN bun install --frozen-lockfile

FROM oven/bun:1.3-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia node_modules + i sorgenti (Bun esegue TS direttamente, niente build step)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

EXPOSE 3001
CMD ["bun", "run", "apps/api/src/index.ts"]
