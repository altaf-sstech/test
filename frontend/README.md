
docker build -t frontend .

docker run -d -p 80:80 frontend

docker ps

docker ps -a

docker stop <ID>

docker rm <ID>

docker rm -f <ID>

docker logs <ID>



docker images

docker rmi <ID>


docker login

docker tag frontend:latest altaf7258/frontend:latest

docker push altaf7258/frontend:latest


