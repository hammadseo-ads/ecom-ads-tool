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
ENV NGINX_ENVSUBST_FILTER="BACKEND_HOST|BACKEND_PORT"
ENV BACKEND_HOST="backend"
ENV BACKEND_PORT="5000"

# Remove default nginx config so ours wins
RUN rm /etc/nginx/conf.d/default.conf

# nginx.conf is a TEMPLATE — copied to the templates dir so it gets envsubsted
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built React assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Standard nginx entrypoint runs envsubst then nginx
CMD ["nginx", "-g", "daemon off;"]
