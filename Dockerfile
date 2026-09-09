# Build stage
FROM node:24.14.1-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files and build admin panel
COPY . .
RUN npm run build

# Production stage
FROM node:24.14.1-alpine AS production
WORKDIR /app

# Copy built application from builder
COPY --from=builder /app .

# Remove dev dependencies for smaller image
RUN npm prune --production

# Create uploads directory with correct permissions
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads

# Expose Strapi port
EXPOSE 1337

# Start Strapi in production mode
CMD ["npm", "run", "start"]
