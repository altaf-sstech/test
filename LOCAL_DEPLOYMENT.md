# Local Deployment Configuration (No Docker Hub)

## Overview

All Jenkinsfiles have been updated to **skip Docker Hub** and deploy directly to your Windows 11 system using locally built Docker images.

## Key Changes

### 1. Removed Docker Hub Dependencies

**Before:**
```groovy
environment {
    DOCKER_USER = 'altaf7258'
    DOCKER_REGISTRY = 'docker.io'
}

stage('Docker Login') {
    // Login to Docker Hub
}

stage('Push to Docker Hub') {
    // Push images to registry
}
```

**After:**
```groovy
// No DOCKER_USER or registry variables
// No login/push stages
// Images built and used locally
```

### 2. Updated Image Names

**Before:**
```bash
docker build -t altaf7258/demo-frontend:abc1234
docker push altaf7258/demo-frontend:abc1234
```

**After:**
```bash
docker build -t demo-frontend:latest
# Use directly without push
```

### 3. Updated Deployment Method

**Before (File-based):**
```batch
xcopy frontend\build C:\deployment\frontend\ /E /I /Y
```

**After (Docker-based):**
```batch
docker stop demo-frontend
docker rm demo-frontend
docker run -d --name demo-frontend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  demo-frontend:latest
```

## Deployment Workflow

```
Git Push (Webhook)
    ↓
Jenkins Trigger (Root Jenkinsfile)
    ↓
┌─ Parallel Build ─────────────┐
│  • Frontend                   │
│  • Content Service            │
│  • User Service               │
└──────────────────────────────┘
    ↓
Quality Checks (SonarQube)
    ↓
Security Scans (Trivy)
    ↓
┌─ Build Local Docker Images ──┐
│  demo-frontend:latest        │
│  demo-content-service:latest │
│  demo-user-service:latest    │
└──────────────────────────────┘
    ↓
┌─ Deploy to Local Windows ────┐
│  docker run ... -d           │
│  docker ps (verify)          │
│  Health checks               │
└──────────────────────────────┘
```

## Files Modified

1. **Root Jenkinsfile** (`Jenkinsfile`)
   - Removed: Docker Hub login stage
   - Changed: Image tag to local format (no DOCKER_USER)
   - Changed: Removed push to Docker Hub stage
   - Added: Image verification stage

2. **Frontend Jenkinsfile** (`frontend/Jenkinsfile`)
   - Removed: Docker Hub credentials
   - Removed: Login/push stages
   - Changed: Deploy method to docker run
   - Simplified: Uses local image names only

3. **Content Service Jenkinsfile** (`backend/content/Jenkinsfile`)
   - Removed: Docker Hub credentials
   - Removed: Login/push stages
   - Changed: Deploy method to docker run with proper environment variables
   - Fixed: Trivy scan references local images

4. **User Service Jenkinsfile** (`backend/user/Jenkinsfile`)
   - Same changes as Content Service

5. **docker-compose.yml**
   - Already configured for local builds (no changes needed)
   - Uses `build.context` to build from local Dockerfiles

## Running the Pipeline

### Option 1: Manual Jenkins Trigger
```
1. Open Jenkins UI
2. Navigate to job → Build Now
3. Monitor console output
4. Services automatically deployed locally
```

### Option 2: Git Webhook (Automatic)
```
1. Push to main branch
2. GitHub/GitLab webhook triggers Jenkins
3. Pipeline runs automatically
4. Services deployed and running
```

## Services After Deployment

All services run as Docker containers on Windows 11:

```
Frontend
├─ Container: demo-frontend
├─ Port: 3000
└─ URL: http://localhost:3000

Content Service
├─ Container: demo-content-service
├─ Port: 5001
└─ URL: http://localhost:5001/health

User Service
├─ Container: demo-user-service
├─ Port: 5002
└─ URL: http://localhost:5002/health

SonarQube (Optional)
├─ Container: demo-sonarqube
├─ Port: 9000
└─ URL: http://localhost:9000
```

## Verification

### Check Running Containers
```bash
docker ps | findstr demo-
```

**Expected Output:**
```
CONTAINER ID  IMAGE                        PORTS
abc123        demo-frontend:latest         3000->3000/tcp
def456        demo-content-service:latest  5001->5001/tcp
ghi789        demo-user-service:latest     5002->5002/tcp
```

### Test Service Health

```bash
# Frontend (just HTTP 200)
curl http://localhost:3000

# Content API (JSON health status)
curl http://localhost:5001/health

# User API (JSON health status)
curl http://localhost:5002/health
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs demo-frontend
```

## Benefits of Local Deployment

✅ **No Registry Overhead** - Skip Docker Hub entirely  
✅ **Faster Deployment** - No upload/download time  
✅ **No Credentials Needed** - No Docker Hub account required  
✅ **Simpler Pipeline** - Fewer stages, easier maintenance  
✅ **Direct Control** - Full control over when/where services run  
✅ **Cost Savings** - No registry costs or bandwidth charges  
✅ **Privacy** - Images stay on your system  
✅ **Offline Support** - Once built, no internet needed  

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs demo-frontend

# Check if port is in use
netstat -ano | findstr :3000

# Restart service
docker-compose restart frontend
```

### Old Container Still Running

```bash
# Force remove old container
docker stop demo-frontend
docker rm demo-frontend

# Verify removed
docker ps | findstr demo-frontend
```

### Out of Disk Space

```bash
# Clean up old images
docker image prune -f

# Check disk usage
docker system df
```

### Build Fails

```bash
# Check Jenkins console output for detailed errors
# Common causes:
# 1. Node.js not installed
# 2. Port already in use
# 3. Docker daemon not running
# 4. Insufficient permissions

# Verify Docker is running
docker ps
```

## Next Steps

1. **Ensure Jenkins is running**
   ```bash
   # Windows Service
   sc query Jenkins
   
   # Or direct command
   Jenkins.exe
   ```

2. **Configure Git webhook** (optional, for auto-trigger)
   - GitHub/GitLab Settings → Webhooks
   - Add: `http://your-jenkins-url/github-webhook/`

3. **Run first build**
   - Jenkins UI → Job → Build Now

4. **Monitor deployment**
   - Jenkins Console → Check logs
   - Docker: `docker ps` → Verify containers

5. **Test services**
   - Access http://localhost:3000
   - Verify health endpoints responding

## Quick Reference

| Task | Command |
|------|---------|
| Start all services | `docker-compose up -d` |
| Stop all services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Check status | `docker-compose ps` |
| Rebuild one service | `docker-compose build --no-cache frontend` |
| Clean up images | `docker image prune -f` |
| Enter container | `docker exec -it demo-frontend sh` |

---

**Configuration Type**: Local Deployment (No Docker Hub)  
**Updated**: 2026-06-04  
**Status**: Ready for Windows 11 System
