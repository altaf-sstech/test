# Build Docker image
docker build -t frontend .

# Run container from image
docker run -d -p 80:80 frontend

# List running containers
docker ps

# List all containers (running + stopped)
docker ps -a

# Stop a container
docker stop <CONTAINER_ID>

# Remove a stopped container
docker rm <CONTAINER_ID>

# Force remove a container (running or stopped)
docker rm -f <CONTAINER_ID>

# View container logs
docker logs <CONTAINER_ID>

# List Docker images
docker images

# Remove an image
docker rmi <IMAGE_ID>

# Login to Docker Hub
docker login

# Tag the image for Docker Hub
docker tag frontend:latest altaf7258/frontend:latest

# Push image to Docker Hub
docker push altaf7258/frontend:latest
