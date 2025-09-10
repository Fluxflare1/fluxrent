# Build image for Next.js dev usage
FROM node:18-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./frontend/
WORKDIR /app/frontend

RUN npm ci

COPY frontend/ ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
