FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]
