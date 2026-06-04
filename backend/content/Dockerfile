# Content Service Dockerfile
# Node.js backend API for content management

# Stage 1: Build dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Production image
FROM node:20-alpine

# Set metadata
LABEL org.opencontainers.image.source="demo/content-service"
LABEL maintainer="Your Team"
LABEL description="Content Management Microservice"

# Set working directory
WORKDIR /app

# Copy built dependencies from stage 1
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=production \
    PORT=5001 \
    SERVICE_NAME=content-service

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5001/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })"

# Start application
CMD ["node", "index.js"]
