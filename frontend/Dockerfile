FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Build Next.js app
RUN npm run build

# Start in production
CMD ["npm", "start"]
