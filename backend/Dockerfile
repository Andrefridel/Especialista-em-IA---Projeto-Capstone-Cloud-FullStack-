# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# ── Stage 2: Production ───────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "app.js"]
