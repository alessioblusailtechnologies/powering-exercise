# Dockerfile single-stage per l'API Bun + Hono.
# Single-stage perché il linker isolato di Bun crea symlink dentro
# node_modules che puntano alla cache `/root/.bun/install/cache`: copiare
# node_modules da uno stage all'altro romperebbe quei symlink.
#
# Build context: root del monorepo.
# Build: docker build -f apps/api/Dockerfile -t powering-api .

FROM oven/bun:1.3-alpine
WORKDIR /app
ENV NODE_ENV=production

# Layer cacheable: tutti i package.json dei workspace + lockfile.
# Cambia di rado, viene riusato finché non si toccano le deps.
COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN bun install --frozen-lockfile

# Sorgenti (cambia ad ogni commit applicativo).
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

EXPOSE 3001
CMD ["bun", "run", "apps/api/src/index.ts"]
