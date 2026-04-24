.PHONY: dev db backend backend-local app app-ios app-android down clean logs help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

dev: ## Start backend + Postgres via Docker (hot reload on code changes)
	docker-compose up --build

db: ## Start only Postgres
	docker-compose up -d postgres

backend: ## Start only the backend container (requires db)
	docker-compose up --build backend

backend-local: ## Run backend locally without Docker (requires Postgres on :5432)
	cd backend && go run .

app: ## Start Expo app (opens in Expo Go)
	cd app && npx expo start

app-ios: ## Open directly in iOS simulator
	cd app && npx expo start --ios

app-android: ## Open directly in Android emulator
	cd app && npx expo start --android

down: ## Stop all Docker services
	docker-compose down

clean: ## Stop all services and wipe the database volume
	docker-compose down -v

logs: ## Tail backend logs
	docker-compose logs -f backend

setup: ## First-time setup: copy env files
	@test -f .env || (cp .env.example .env && echo "Created .env — fill in your SUPABASE_JWT_SECRET")
	@test -f app/.env || (cp app/.env.example app/.env && echo "Created app/.env — fill in your Supabase URL and anon key")
	@test -f backend/.env || (cp backend/.env.example backend/.env && echo "Created backend/.env")
