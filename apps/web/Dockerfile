# Dockerfile multi-stage per il FE Vite + React.
# Stage 1: build con Bun (runtime monorepo coerente con il BE).
# Stage 2: serve gli statici con nginx + SPA fallback.
# Build context: root del monorepo.

FROM oven/bun:1.3-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
RUN bun install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Render passa env var del Blueprint anche come build ARG quando dichiarate qui.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun run --cwd apps/web build

# ─── Runner ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
