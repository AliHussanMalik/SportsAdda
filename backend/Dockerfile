# Production Dockerfile for SportsAdda Node.js Backend API & Real-Time Engine
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose HTTP API & WebSocket Port
EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
