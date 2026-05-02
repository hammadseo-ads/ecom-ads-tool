# --- Stage 1: build the React app ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Vite picks up .env.production automatically when mode=production
RUN npm run build

# --- Stage 2: serve with nginx ---
FROM nginx:1.27-alpine

# nginx:alpine auto-runs `envsubst` over every file in /etc/nginx/templates/
# at container startup and writes the result into /etc/nginx/conf.d/.
# This lets BACKEND_HOST and BACKEND_PORT env vars be filled in at runtime
# (different on Railway vs docker-compose vs anywhere else).
#
# IMPORTANT: NGINX_ENVSUBST_FILTER restricts envsubst to ONLY these names —
# without it, envsubst would also replace nginx's own $host, $remote_addr,
# $proxy_add_x_forwarded_for, $scheme, $uri etc. with empty strings, breaking
# the proxy entirely.
# Defaults for template dir (/etc/nginx/templates), suffix (.template), and
# output dir (/etc/nginx/conf.d) are kept as-is.
ENV NGINX_ENVSUBST_FILTER="BACKEND_HOST|BACKEND_PORT|RESOLVER_IP"
ENV BACKEND_HOST="backend"
ENV BACKEND_PORT="5000"

# Remove default nginx config so ours wins
RUN rm /etc/nginx/conf.d/default.conf

# nginx.conf is a TEMPLATE — copied to the templates dir so it gets envsubsted
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Auto-detect DNS resolver from /etc/resolv.conf at container start so the
# RESOLVER_IP env var is set BEFORE the envsubst hook runs. nginx:alpine
# executes scripts in /docker-entrypoint.d/ in alphanumeric order — this
# script's "00-" prefix ensures it runs before "20-envsubst-on-templates.sh".
#
# IMPORTANT: file extension must be .envsh — nginx:alpine SOURCES *.envsh
# files (so `export` survives) but EXECUTES *.sh files in a subshell (env
# vars get lost).
COPY docker-entrypoint-resolver.envsh /docker-entrypoint.d/00-export-resolver.envsh
RUN chmod +x /docker-entrypoint.d/00-export-resolver.envsh

# Copy built React assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Standard nginx entrypoint runs envsubst then nginx
CMD ["nginx", "-g", "daemon off;"]
