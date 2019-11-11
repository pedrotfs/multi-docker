docker build -t pedrotfs/multi-client:latest -t pedrotfs/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t pedrotfs/multi-server:latest -t pedrotfs/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t pedrotfs/multi-worker:latest -t pedrotfs/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push pedrotfs/multi-client:latest
docker push pedrotfs/multi-server:latest
docker push pedrotfs/multi-worker:latest

docker push pedrotfs/multi-client:$SHA
docker push pedrotfs/multi-server:$SHA
docker push pedrotfs/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/server-deployment server=pedrotfs/multi-server:$SHA
kubectl set image deployments/client-deployment client=pedrotfs/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=pedrotfs/multi-worker:$SHA