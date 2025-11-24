build-project:
	cd frontend/ && npm install && npm run build && \
	cd ../_deploy/ && \
	docker compose up -d --build

clean-project:
	cd _deploy/ && \
	docker compose down && \
	docker system prune -a --volumes --force && \
    cd .. && rm -rf backend/build/ backend/static/ database/ frontend/node_modules/

start-system:
	cd _deploy/ && \
	docker compose up -d

stop-system:
	cd _deploy/ && \
	docker compose down

restart-system:
	cd _deploy/ && \
	docker compose down && \
	docker compose up -d

list-images:
	docker images

list-containers:
	docker ps -a

container ?= app
container-terminal:
	cd _deploy/ && \
	docker compose exec $(container) sh

container-logs:
	cd _deploy/ && \
	docker compose logs -f $(container)
