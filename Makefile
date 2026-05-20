include .env
export

export PROJECT_ROOT=$(shell pwd)

env-up:
	@docker compose up -d barovik-postgres

env-down:
	@docker compose stop barovik-postgres

barovik-run:
	@go run cmd/main.go