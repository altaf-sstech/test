# Microservices Management Guide

## Quick Start

### Local Development (Windows 11)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Check service status
docker-compose ps
```

## Pipeline Hierarchy

```
Root Jenkinsfile (Orchestrator)
├── Builds all services in parallel
├── Runs quality gates
├── Pushes to Docker Hub
└── Deploys using docker-compose

Individual Service Pipelines
├── frontend/Jenkinsfile
├── backend/content/Jenkinsfile
└── backend/user/Jenkinsfile
```

## Service Management

### 1. Frontend Service

**Responsibilities:**
- React UI application
- Static asset serving
- Client-side routing
- API communication

**Health Check:**
```bash
curl http://localhost:3000
```

**Managing:**
```bash
# View logs
docker logs demo-frontend

# Restart
docker-compose restart frontend

# Rebuild
docker-compose build --no-cache frontend
```

### 2. Content Service

**Responsibilities:**
- Content CRUD operations
- Content validation
- Database/storage operations

**Health Check:**
```bash
curl http://localhost:5001/health
```

**Managing:**
```bash
docker logs demo-content-service
docker-compose restart content-service
docker-compose build --no-cache content-service
```

### 3. User Service

**Responsibilities:**
- User management
- Authentication/Authorization
- User profile operations

**Health Check:**
```bash
curl http://localhost:5002/health
```

**Managing:**
```bash
docker logs demo-user-service
docker-compose restart user-service
docker-compose build --no-cache user-service
```

## Jenkins Configuration

### Required Credentials

Create in Jenkins **Manage Credentials → System → Global credentials**:

1. **dockerhub-credentials** (Username/Password)
   - Username: Docker Hub account
   - Password: Docker Hub access token

2. **sonar-token** (Secret text)
   - Value: SonarQube authentication token

3. **ec2-ssh-key** (SSH Key) - *Optional for cloud deployment*
   - Private SSH key for EC2 access

### Pipeline Triggers

**Via Git Webhook:**
1. Go to Jenkins Job → Configure → Build Triggers
2. Select "GitHub hook trigger for GITScm polling"
3. In GitHub repository → Settings → Webhooks
4. Add: `http://jenkins-server/github-webhook/`

**Manual Trigger:**
```
Jenkins → Job → Build Now
```

## Monitoring Services

### Docker Container Monitoring

```bash
# Check all containers
docker ps

# View container resource usage
docker stats

# View container details
docker inspect demo-frontend

# Check container logs
docker logs -f --tail 100 demo-content-service
```

### Service Logs

Each service logs to:
- Docker stdout/stderr
- Aggregate with: `docker-compose logs`
- Filter by service: `docker-compose logs frontend`

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port already in use | `netstat -ano \| findstr :PORT` → Kill process |
| Service won't start | Check Docker logs: `docker logs <container>` |
| No connectivity | Check Docker network: `docker network ls` |
| Out of disk space | `docker system prune -a` |
| Memory issues | Increase Docker resources or restart services |

## Deployment Workflows

### Development (Continuous)
```
Git Push → Jenkins Trigger → Build & Test → Deploy to Local
```

### Staging
```
Git Push to 'staging' → Manual Approval → Deploy to Staging Server
```

### Production
```
Git Push to 'main' → Automated Tests → Manual Approval → Deploy to Production
```

## Environment Management

### Local Environment (docker-compose.yml)

```yaml
environment:
  - NODE_ENV=development
  - DEBUG=true
  - LOG_LEVEL=debug
```

### Production Environment (.env file)

```
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=prod-db-connection
REDIS_URL=prod-redis-url
```

**Usage:**
```bash
docker-compose --env-file .env.prod up -d
```

## Scaling Services

### Horizontal Scaling (Multiple Instances)

**Using Docker Compose:**
```bash
# Scale services
docker-compose up -d --scale content-service=3 --scale user-service=2
```

**Using Docker Swarm:**
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml demo

# Scale service
docker service scale demo_content-service=3
```

## Backup & Recovery

### Backup Procedures

```bash
# Backup application data
docker exec demo-content-service npm run backup

# Backup configurations
xcopy %DEPLOYMENT_DIR% %BACKUP_DIR%\deployment /E /I /Y
```

### Recovery Procedures

```bash
# Restore from backup
docker-compose down
xcopy %BACKUP_DIR%\deployment %DEPLOYMENT_DIR% /E /I /Y
docker-compose up -d
```

## Performance Optimization

### Docker Image Optimization

1. **Multi-stage builds** - Reduce image size
```dockerfile
FROM node:18 AS builder
RUN npm install
RUN npm run build

FROM node:18-alpine
COPY --from=builder /app/build ./build
```

2. **Layer caching** - Order dependencies before code
```dockerfile
COPY package*.json ./
RUN npm install
COPY . .
```

3. **Minimize images** - Use alpine base images

### Service Performance

1. **Memory limits**
```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
```

2. **CPU limits**
```yaml
services:
  content-service:
    deploy:
      resources:
        limits:
          cpus: '0.5'
```

## Security Best Practices

### 1. Credential Management
- Never commit secrets to git
- Use Jenkins credentials store
- Rotate credentials regularly

### 2. Image Security
- Scan with Trivy before deployment
- Use specific base image versions
- Keep dependencies updated

### 3. Network Security
- Use Docker networks (isolated)
- Implement firewall rules
- Use HTTPS for external APIs

### 4. Access Control
- Restrict Jenkins access
- Use role-based access control
- Audit pipeline executions

## Disaster Recovery Plan

### RTO & RPO Goals
- **RTO** (Recovery Time Objective): < 15 minutes
- **RPO** (Recovery Point Objective): < 5 minutes

### Recovery Steps

```bash
# 1. Check service health
docker-compose ps

# 2. View error logs
docker-compose logs

# 3. Restart failed services
docker-compose restart <service>

# 4. If complete failure: restore from backup
docker-compose down
# Restore backup
docker-compose up -d

# 5. Verify all services healthy
curl http://localhost:3000
curl http://localhost:5001/health
curl http://localhost:5002/health
```

## Maintenance Schedule

| Task | Frequency | Time |
|------|-----------|------|
| Update dependencies | Weekly | After hours |
| Security scans | Daily | Automated |
| Log rotation | Daily | Automated |
| Backup verification | Weekly | Friday 6 PM |
| Performance tuning | Monthly | End of month |
| Disaster recovery drill | Quarterly | Saturday |

## Commands Reference

```bash
# Docker Compose Common Commands
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose ps                 # Check status
docker-compose logs -f            # View logs
docker-compose logs --tail 50     # View last 50 lines
docker-compose build              # Rebuild images
docker-compose pull               # Pull latest images
docker-compose restart frontend   # Restart one service
docker-compose exec frontend sh   # Enter container

# Docker Commands
docker ps                         # List containers
docker logs <container>           # View logs
docker inspect <container>        # Check details
docker stats                      # Resource usage
docker image ls                   # List images
docker image prune                # Clean unused images
docker system prune -a            # Clean everything

# Windows Commands
netstat -ano | findstr :PORT      # Check port usage
taskkill /PID <PID> /F            # Kill process
dir C:\deployment                 # List deployment files
```

## Support & Troubleshooting

### Getting Logs
```bash
# All services
docker-compose logs > logs.txt

# Specific service
docker logs demo-frontend > frontend.log

# Last 100 lines
docker-compose logs --tail 100 --timestamps
```

### Debugging Container
```bash
# Enter container shell
docker-compose exec frontend sh

# Run commands inside
docker exec demo-content-service npm list

# Check environment variables
docker exec demo-frontend env
```

### Jenkins Troubleshooting
1. Check Jenkins logs: `C:\ProgramData\Jenkins\.jenkins\logs\`
2. Pipeline logs: Jenkins UI → Job → Console Output
3. Verify credentials configured
4. Check system has required tools (Docker, Node.js, Git)
