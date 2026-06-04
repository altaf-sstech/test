# Dockerfiles Created for Backend Services

## ✅ Created Files

### 1. **backend/content/Dockerfile**
- Multi-stage build for optimized image size
- Node.js 20 Alpine base image
- Non-root user for security
- Health check endpoint monitoring
- Environment: PORT=5001, SERVICE_NAME=content-service

### 2. **backend/user/Dockerfile**
- Multi-stage build for optimized image size
- Node.js 20 Alpine base image
- Non-root user for security
- Health check endpoint monitoring
- Environment: PORT=5002, SERVICE_NAME=user-service

### 3. **backend/content/.dockerignore**
- Optimizes Docker build context
- Excludes unnecessary files (node_modules, tests, docs, etc.)

### 4. **backend/user/.dockerignore**
- Optimizes Docker build context
- Excludes unnecessary files

## 📋 Dockerfile Structure

Both backend Dockerfiles follow this pattern:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Security: Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5001 (or 5002)

# Health check
HEALTHCHECK ...

# Start
CMD ["node", "index.js"]
```

## 🏗️ Build Details

### Multi-Stage Build Benefits
- ✅ Smaller final image (dependencies stage is discarded)
- ✅ Faster builds (node_modules cached separately)
- ✅ Better layer caching
- ✅ Production-optimized

### Security Features
- ✓ Non-root user (nodejs:nodejs)
- ✓ Only production dependencies
- ✓ Health check monitoring
- ✓ Minimal base image (Alpine)

## 🔍 Health Check

Both services include Docker health checks:

```groovy
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5001/health', ...)"
```

**Your services need to implement:**
```javascript
// Add to your index.js
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## ⚙️ Environment Variables

### Content Service (Port 5001)
```
NODE_ENV=production
PORT=5001
SERVICE_NAME=content-service
DATABASE_URL=postgresql://user:pass@host:5432/content_db
```

### User Service (Port 5002)
```
NODE_ENV=production
PORT=5002
SERVICE_NAME=user-service
DATABASE_URL=postgresql://user:pass@host:5432/user_db
```

## 🚀 Building Docker Images

### Manual Build
```bash
# Content Service
docker build -t demo-content-service:latest ./backend/content

# User Service
docker build -t demo-user-service:latest ./backend/user
```

### Jenkins (Automated)
```
Jenkins → Build Now
→ Builds both automatically
→ Deploys to localhost:5001 and :5002
```

### Docker Compose
```bash
docker-compose up -d
```

## ✨ What's Included

| Component | Status |
|-----------|--------|
| **Frontend Dockerfile** | ✅ Already existed |
| **Content Service Dockerfile** | ✅ **CREATED** |
| **User Service Dockerfile** | ✅ **CREATED** |
| **.dockerignore (Content)** | ✅ **CREATED** |
| **.dockerignore (User)** | ✅ **CREATED** |

## 🔗 Docker Image Hierarchy

```
Node 20 Alpine Base
├─ Stage 1: Dependencies installation
│  └─ npm ci --only=production
└─ Stage 2: Production runtime
   ├─ Copy node_modules
   ├─ Copy source code
   ├─ Create non-root user
   └─ Health check + Start
```

## 📊 Image Sizes (Estimated)

| Image | Size |
|-------|------|
| node:20-alpine | ~200 MB |
| + dependencies | ~100-200 MB |
| **Final image** | **~200-300 MB** |

**Alpine reduces size by ~60% vs debian-based images**

## 🎯 Next Steps

1. **Add health check endpoint** to your services:
   ```javascript
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });
   ```

2. **Test locally**:
   ```bash
   docker-compose up -d
   docker logs demo-content-service
   docker logs demo-user-service
   ```

3. **Verify builds**:
   ```bash
   docker images | grep demo-
   ```

4. **Check running**:
   ```bash
   curl http://localhost:5001/health
   curl http://localhost:5002/health
   ```

## 🔧 Customization

### Change Base Image
```dockerfile
FROM node:20-alpine      # Current (recommended)
FROM node:20-bullseye    # Debian-based, larger
FROM node:20-slim        # Slim, medium size
```

### Adjust Health Check
```dockerfile
# Less frequent checks
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=5 \
```

### Add Custom Metadata
```dockerfile
LABEL version="1.0.0"
LABEL environment="production"
LABEL team="your-team"
```

## 🆘 Troubleshooting

### Build fails: "npm ci: not found"
```
Solution: Use "npm install" instead of "npm ci" in Dockerfile
```

### Build fails: "package.json not found"
```
Solution: Ensure package.json exists in backend/content and backend/user
```

### Health check failing
```
Solution: Implement GET /health endpoint in your Express app
```

### Container exits immediately
```
Solution: Check logs: docker logs demo-content-service
         Check DATABASE_URL is set
```

## 📚 Files Structure Now

```
backend/
├── content/
│   ├── Dockerfile           ✅ NEW
│   ├── .dockerignore        ✅ NEW
│   ├── index.js
│   ├── package.json
│   └── Jenkinsfile
├── user/
│   ├── Dockerfile           ✅ NEW
│   ├── .dockerignore        ✅ NEW
│   ├── index.js
│   ├── package.json
│   └── Jenkinsfile
└── ✅ Both services now have Dockerfiles!
```

---

**Status**: ✅ All Dockerfiles Created  
**Ready to Deploy**: ✅ Yes  
**Next**: Add health check endpoints to your services
