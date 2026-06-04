# Microservices Architecture - Complete Management Guide

## 📋 Overview

This project implements a **microservices architecture** with automated CI/CD pipelines using Jenkins. It consists of three main services:

- **Frontend**: React-based UI application
- **Content Service**: Node.js backend API for content management
- **User Service**: Node.js backend API for user operations

## 📁 Project Structure

```
project/
├── Jenkinsfile                          # Root orchestrator pipeline
├── docker-compose.yml                   # Local service orchestration
├── .env.example                         # Environment template
├── MICROSERVICES_ARCHITECTURE.md        # Architecture documentation
├── MANAGEMENT_GUIDE.md                  # Operational guide
├── README.md                            # This file
│
├── frontend/
│   ├── Jenkinsfile                      # Frontend-specific pipeline
│   ├── Dockerfile                       # Frontend container definition
│   ├── package.json
│   ├── public/
│   └── src/
│
├── backend/
│   ├── content/
│   │   ├── Jenkinsfile                  # Content service pipeline
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── index.js
│   │
│   └── user/
│       ├── Jenkinsfile                  # User service pipeline
│       ├── Dockerfile
│       ├── package.json
│       └── index.js
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 16+ installed
- Git installed
- Jenkins (for automated pipelines)

### Local Development (Windows 11)

```bash
# 1. Clone the repository
git clone <repository-url>
cd project

# 2. Copy environment template
copy .env.example .env.local

# 3. Start all services
docker-compose up -d

# 4. Verify services are running
docker-compose ps

# 5. Access services
# Frontend:        http://localhost:3000
# Content API:     http://localhost:5001
# User API:        http://localhost:5002
# SonarQube:       http://localhost:9000
```

## 🏗️ Architecture & Management

### Pipeline Hierarchy

```
┌─────────────────────────────────────────────────┐
│  Git Repository (Push to main or feature branch)│
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Jenkins Trigger     │
        │  (Webhook or Manual) │
        └──────────┬───────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │  Root Jenkinsfile (Orchestrator) │
    │  - Pre-flight checks             │
    │  - Checkout source code          │
    │  - Parallel builds               │
    │  - Quality gates                 │
    │  - Security scans                │
    │  - Docker image push             │
    │  - Service deployment            │
    │  - Health checks                 │
    └──────────┬───────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Frontend│ │Content │ │ User   │
│Service │ │Service │ │Service │
└────────┘ └────────┘ └────────┘
    │          │          │
    └──────────┼──────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Docker Containers   │
    │  (Running Services)  │
    └──────────────────────┘
```

### Service Communication

```
Frontend (Port 3000)
    ├─► Content API (Port 5001) via HTTP
    ├─► User API (Port 5002) via HTTP
    └─► Health checks every 30s

Content Service (Port 5001)
    ├─► Exposes: GET /health
    └─► Database/Storage

User Service (Port 5002)
    ├─► Exposes: GET /health
    └─► Database/Storage
```

## 📊 Pipeline Stages Explained

### 1. Pre-Flight Checks
- Verify system requirements (Node.js, Docker, Git)
- Check dependencies available
- Validate configuration

### 2. Checkout
- Pull latest source code from Git
- Display commit history

### 3. Build & Test (Parallel)
- **Frontend**: npm install → test → build
- **Content**: npm install → test
- **User**: npm install → test

All three build simultaneously for speed.

### 4. Code Quality
- SonarQube analysis on all source code
- Quality gate evaluation
- Security analysis

### 5. Docker Build (Parallel)
- Build frontend image
- Build content service image
- Build user service image

### 6. Security Scanning
- Trivy scans each Docker image
- Identifies vulnerabilities
- Reports HIGH/CRITICAL issues

### 7. Registry Push
- Push images to Docker Hub
- Tag with git commit SHA
- Tag with "latest"

### 8. Deployment
- Stop old containers
- Pull latest images
- Start new containers
- Verify health

## 🔧 Configuration Management

### Environment Variables

Each service gets specific environment:

**Frontend**
```
REACT_APP_API_BASE_URL=http://localhost:5001
REACT_APP_USER_API_URL=http://localhost:5002
NODE_ENV=production
```

**Content Service**
```
PORT=5001
NODE_ENV=production
SERVICE_NAME=content-service
LOG_LEVEL=info
```

**User Service**
```
PORT=5002
NODE_ENV=production
SERVICE_NAME=user-service
LOG_LEVEL=info
```

### Managing Configurations

```bash
# Development (.env.dev)
docker-compose --env-file .env.dev up

# Production (.env.prod)
docker-compose --env-file .env.prod up

# Staging (.env.staging)
docker-compose --env-file .env.staging up
```

## 🎯 Common Management Tasks

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart frontend

# Stop specific service
docker-compose stop content-service
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend

# Last 50 lines with timestamps
docker-compose logs --tail 50 --timestamps

# Export logs
docker-compose logs > all-logs.txt
```

### Health Monitoring

```bash
# Check status
docker-compose ps

# Check service health
curl http://localhost:3000          # Frontend
curl http://localhost:5001/health   # Content API
curl http://localhost:5002/health   # User API

# Resource usage
docker stats

# Container details
docker inspect demo-frontend
```

### Rebuilding Services

```bash
# Rebuild without cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache frontend

# Rebuild and restart
docker-compose up -d --build
```

### Cleanup & Optimization

```bash
# Remove unused images
docker image prune -f

# Remove dangling volumes
docker volume prune -f

# Complete cleanup
docker system prune -a
```

## 🔐 Security

### Jenkins Credentials Setup

1. **Go to**: Jenkins → Manage Credentials → System → Global credentials
2. **Create credentials**:
   - `dockerhub-credentials`: Docker Hub authentication
   - `sonar-token`: SonarQube token
   - `ec2-ssh-key`: For cloud deployment

### Secrets Management

```bash
# Never commit secrets
git add .env
git commit -m "Do not commit .env"

# Use template
copy .env.example .env.local
# Edit .env.local with real values
```

### Best Practices

- ✓ Use environment variables for sensitive data
- ✓ Rotate credentials regularly
- ✓ Enable 2FA on Docker Hub
- ✓ Scan images before deployment
- ✓ Keep dependencies updated

## 📈 Scaling & Performance

### Scaling Services

```bash
# Scale content service to 3 instances
docker-compose up -d --scale content-service=3

# Scale user service to 2 instances
docker-compose up -d --scale user-service=2
```

### Performance Monitoring

```bash
# Resource limits (docker-compose.yml)
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🔄 Continuous Integration/Deployment

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to trigger Jenkins
git push origin feature/new-feature

# Create Pull Request

# After approval, merge to main
# This triggers production deployment
```

### Pipeline Triggers

1. **Webhook (Automatic)**: Git push → Jenkins pipeline runs
2. **Manual**: Jenkins UI → Build Now
3. **Scheduled**: Cron expression in Jenkins

## 📊 Monitoring & Alerts

### Check Service Health

```bash
# Frontend up?
curl http://localhost:3000

# Content API responding?
curl http://localhost:5001/health

# User API responding?
curl http://localhost:5002/health

# All services?
docker-compose ps
```

### Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific time range
docker-compose logs --since 1h
```

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Service Won't Start

```bash
# Check logs
docker logs demo-frontend

# Check configuration
docker inspect demo-frontend

# Restart
docker-compose restart frontend
```

### Out of Disk Space

```bash
# Clean up
docker system prune -a

# Remove old images
docker image prune --filter "until=72h"
```

## 📚 Documentation Files

- **[MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md)** - Detailed architecture diagrams and concepts
- **[MANAGEMENT_GUIDE.md](MANAGEMENT_GUIDE.md)** - Operational procedures and commands
- **[.env.example](.env.example)** - Environment configuration template

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m "Add new feature"`
3. Push to branch: `git push origin feature/new-feature`
4. Create Pull Request

## 📞 Support

For issues and questions:

1. Check [MANAGEMENT_GUIDE.md](MANAGEMENT_GUIDE.md) troubleshooting section
2. View service logs: `docker-compose logs -f`
3. Check Jenkins console output
4. Review SonarQube analysis at http://localhost:9000

## 📝 License

Specify your license here.

---

**Last Updated**: 2026-06-04  
**Version**: 1.0.0  
**Maintainer**: Your Team
