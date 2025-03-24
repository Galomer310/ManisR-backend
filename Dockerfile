# =========== Stage 1: Build ===========
FROM node:18-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# =========== Stage 2: Production ===========
FROM node:18-alpine

WORKDIR /app

# Copy only the compiled dist folder and package files
COPY package*.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN npm install --production

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/app.js"]
