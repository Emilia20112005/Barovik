include .env
export

export PROJECT_ROOT=$(shell pwd)

env-up:
	@docker compose up -d barovik-postgres

env-down:
	@docker compose stop barovik-postgres

migrate-seed:
	@docker exec -i barovik-postgres psql -U postgres -d barovik < migrations/002_seed.sql

barovik-run:
	@go run cmd/main.go