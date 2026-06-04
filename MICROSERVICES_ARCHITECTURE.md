# Microservices Architecture Management Guide

## Overview
This project uses a **microservices architecture** with:
- **Frontend**: React-based UI service
- **Content Service**: Backend API for content management
- **User Service**: Backend API for user management
- **Orchestration**: Jenkins for CI/CD pipeline management

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Repository                            │
│  (Frontend | Backend/Content | Backend/User | Docker Setup) │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Jenkins CI/CD Pipeline (Orchestrator)           │
├─────────────────────────────────────────────────────────────┤
│  1. Trigger (Git Push)                                      │
│  2. Run Service-Specific Pipelines (Parallel)               │
│  3. Build & Test Each Microservice                          │
│  4. Create Docker Images                                    │
│  5. Push to Docker Registry                                 │
│  6. Deploy Services (Orchestrated)                          │
│  7. Run Health Checks                                       │
└────┬────────────────────────────────────────┬───────────────┘
     │                                        │
     ▼                                        ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Frontend Container│  │ Content Service   │  │ User Service     │
│  Port: 3000       │  │ Port: 5001        │  │ Port: 5002       │
│  (React App)      │  │ (Node.js API)     │  │ (Node.js API)    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                    │                     │
         └────────┬───────────┴─────────────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │  Docker Network      │
         │  (Communication)     │
         └──────────────────────┘
```

## Key Components

### 1. **Pipeline Organization**
- **Parent Pipeline**: `Jenkinsfile` (root) - Orchestrates all services
- **Service Pipelines**: Individual Jenkinsfiles in each service directory
- **Shared Configuration**: Environment variables, credentials, build tools

### 2. **Service-Specific Pipelines**

#### Frontend Service
```
Build Triggers
    ↓
Install Dependencies (npm)
    ↓
Run Tests (Jest)
    ↓
Lint Code (ESLint)
    ↓
Build Bundle
    ↓
Build Docker Image
    ↓
Push to Registry
    ↓
Deploy
```

#### Backend Services (Content & User)
```
Build Triggers
    ↓
Install Dependencies (npm)
    ↓
Run Tests (Jest/Mocha)
    ↓
SonarQube Code Analysis
    ↓
Build Docker Image
    ↓
Security Scan (Trivy)
    ↓
Push to Registry
    ↓
Deploy
```

## Jenkins Pipeline Execution Flow

### Stage 1: Trigger & Checkout
- Git webhook triggers pipeline on push
- All code checked out to Jenkins workspace

### Stage 2: Parallel Service Builds
- **Frontend**, **Content Service**, **User Service** build simultaneously
- Each runs its own tests and quality checks
- Docker images created independently

### Stage 3: Quality Gates
- SonarQube analysis results reviewed
- Security scans (Trivy) validate container images
- Failed quality gates can block deployment

### Stage 4: Registry Push
- All Docker images pushed to Docker Hub
- Images tagged with git SHA and "latest"

### Stage 5: Deployment
- Services deployed in dependency order
- Environment variables injected at runtime
- Health checks performed

### Stage 6: Monitoring & Rollback
- Services health verified
- Rollback triggered if health checks fail

## Deployment Strategies

### Development Environment (Local Windows)
```
├── Frontend → http://localhost:3000
├── Content Service → http://localhost:5001
└── User Service → http://localhost:5002
```

**Using docker-compose.yml**:
```bash
docker-compose up -d
```

### Production Environment (AWS/Cloud)
- Deploy via Kubernetes or Docker Swarm
- Use docker-compose with `.env` files for secrets
- Enable auto-scaling and load balancing

## Credentials Management

Store in Jenkins:
- `dockerhub-credentials`: Docker registry authentication
- `sonar-token`: SonarQube authentication
- `ec2-ssh-key`: AWS EC2 SSH key (if using remote deployment)
- `git-credentials`: Git repository access (optional)

## Environment Variables

Set per service:
```
DOCKER_USER = altaf7258
NODE_ENV = production
PORT = 5001 (or service-specific)
LOG_LEVEL = info
DATABASE_URL = connection string
```

## Dependency Management

### Service Dependencies
```
Frontend
├── Calls Content Service (API)
└── Calls User Service (API)

Content Service
└── Database/Storage

User Service
└── Database/Storage
```

### Deployment Order
1. Content Service (if has dependencies)
2. User Service (if has dependencies)
3. Frontend (depends on backend services)

## Health Check Strategy

Each service exposes health endpoint:
```
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

Jenkins verifies:
```bash
curl http://localhost:PORT/health
```

## Monitoring & Logging

### Log Aggregation
- Collect logs from all services
- Use ELK Stack or CloudWatch
- Centralize for debugging

### Metrics Collection
- CPU, Memory, Network usage
- Application-specific metrics (requests/sec, errors)
- Dashboard in Grafana or CloudWatch

## Scaling Considerations

### Horizontal Scaling
```
Load Balancer
├── Frontend Instance 1
├── Frontend Instance 2
├── Content Service 1
├── Content Service 2
└── User Service 1
    User Service 2
```

### Docker Swarm / Kubernetes
```yaml
services:
  frontend:
    replicas: 3
  content-service:
    replicas: 2
  user-service:
    replicas: 2
```

## CI/CD Best Practices

1. **Immutable Deployments**: Docker images are immutable
2. **Blue-Green Deployment**: Run old + new versions, switch traffic
3. **Canary Deployments**: Deploy to small % of traffic first
4. **Automated Rollback**: Revert on health check failures
5. **Configuration as Code**: All infrastructure in git
6. **Secrets Management**: Use Jenkins credentials store
7. **Build Caching**: Cache Docker layers for speed
8. **Parallel Execution**: Build services simultaneously

## File Structure

```
project/
├── Jenkinsfile (root - orchestrator)
├── docker-compose.yml (local orchestration)
├── .env.example (environment template)
├── frontend/
│   ├── Jenkinsfile (frontend-specific)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── backend/
│   ├── content/
│   │   ├── Jenkinsfile (content-specific)
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── index.js
│   └── user/
│       ├── Jenkinsfile (user-specific)
│       ├── Dockerfile
│       ├── package.json
│       └── index.js
└── MICROSERVICES_ARCHITECTURE.md
```

## Troubleshooting

### Service Won't Start
1. Check Docker logs: `docker logs <container_id>`
2. Verify ports aren't in use: `netstat -ano | findstr :PORT`
3. Check environment variables: `docker inspect <container>`

### Build Failures
1. View Jenkins console output
2. Check SonarQube gate status
3. Verify Docker image builds locally
4. Check Docker Hub credentials

### Deployment Issues
1. Verify health endpoints responding
2. Check service-to-service connectivity
3. Review Docker network configuration
4. Check firewall rules (port access)

## References
- Docker: https://docs.docker.com
- Jenkins Pipelines: https://jenkins.io/doc/book/pipeline/
- Docker Compose: https://docs.docker.com/compose/
- SonarQube: https://docs.sonarqube.org/
