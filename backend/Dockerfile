FROM node:20-alpine

WORKDIR /app

# Install only production deps using lockfile
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Backend listens on PORT (default 5000)
EXPOSE 5000

CMD ["node", "server.js"]
