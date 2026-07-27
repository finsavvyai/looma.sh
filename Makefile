sanity:
	./sanity.sh
app:
	cd app && npm run dev

ai:
	cd ai && uvicorn main:app --reload --port 9000

api:
	cd api && npx wrangler dev

up-app-ai:
	docker compose up --build app ai
