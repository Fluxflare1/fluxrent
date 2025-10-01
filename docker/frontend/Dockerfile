# docker/frontend/Dockerfile

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps
COPY ./frontend/package*.json ./
RUN npm install

# Copy app source
COPY ./frontend ./

# Build Next.js
RUN npm run build

# ---- Stage 2: Runner ----
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]
