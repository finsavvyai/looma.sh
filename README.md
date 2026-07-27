# Looma.sh — Fun Bootstrap Version 🎉

This repo is a **runnable MVP skeleton** for Looma.sh:

- `app/` – Next.js + Tailwind landing page
- `api/` – Cloudflare Worker (Hono) relay API
- `ai/` – FastAPI-based AI intent microservice
- `docs/` – Placeholder for future docs
- `docker-compose.yml` – Run app + AI together
- `Makefile` – Handy dev commands

## Quickstart

```bash
# 1. App (Next.js)
cd app
npm install
npm run dev

# 2. AI Service (FastAPI)
cd ../ai
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 9000

# 3. Edge Relay (Cloudflare Worker)
cd ../api
npm install
npx wrangler dev
```

Then open:

- App: http://localhost:3000
- AI: http://localhost:9000/health
- Worker: http://127.0.0.1:8787/ping
