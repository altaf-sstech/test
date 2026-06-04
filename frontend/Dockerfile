# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 80

# CMD ["npm", "start"]








# # Stage 1: Build the React application
FROM node:20-bullseye-slim AS build
WORKDIR /app
COPY package*.json ./
# Install build tools for native modules
RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential ca-certificates && rm -rf /var/lib/apt/lists/*
# Use npm install here because package-lock may be out-of-sync in the repo
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: Serve the production build with Nginx (pin stable tag)
FROM nginx:1.26.1-alpine
LABEL org.opencontainers.image.source="demo/frontend"
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Ensure correct ownership and run as non-root where possible
RUN chown -R nginx:nginx /usr/share/nginx/html
EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -q -O- http://localhost:3000/ || exit 1
CMD ["nginx", "-g", "daemon off;"]