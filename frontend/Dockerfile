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

# Replace default nginx config with ours (serves SPA + proxies /api to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
