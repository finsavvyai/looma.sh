#!/usr/bin/env bash

# -----------------------------------------
# Looma.sh — Local Development Runner
# Starts: 
#   1. Next.js frontend (port 3000)
#   2. FastAPI Intent Engine (port 9000)
#   3. Cloudflare Worker Relay (port 8787)
# -----------------------------------------

echo "🚀 Starting Looma.sh local environment..."
echo

# Detect shell
SHELL_NAME=$(basename "$SHELL")

# -----------------------------------------
# 1. Start Next.js App
# -----------------------------------------
echo "▶️  Starting Next.js app (http://localhost:3000)"
(
  cd app || exit

  # Install dependencies if missing
  if [ ! -d "node_modules" ]; then
    echo "📦 Installing app dependencies..."
    npm install
  fi

  npm run dev
) &
APP_PID=$!

# -----------------------------------------
# 2. Start FastAPI AI Intent Engine
# -----------------------------------------
echo "▶️  Starting AI Intent Engine (http://localhost:9000)"
(
  cd ai || exit

  # Create venv if missing
  if [ ! -d ".venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv .venv
  fi

  # Activate venv
  if [ "$SHELL_NAME" = "zsh" ]; then
    source .venv/bin/activate
  else
    source .venv/bin/activate
  fi

  # Install dependencies if missing
  if [ ! -d ".venv/lib" ]; then
    echo "📦 Installing AI dependencies..."
    pip install -r requirements.txt
  fi

  uvicorn main:app --reload --port 9000
) &
AI_PID=$!

# -----------------------------------------
# 3. Start Cloudflare Worker Relay
# -----------------------------------------
echo "▶️  Starting Cloudflare Worker Relay (http://127.0.0.1:8787/ping)"
(
  cd api || exit

  # Install dependencies if missing
  if [ ! -d "node_modules" ]; then
    echo "📦 Installing API dependencies..."
    npm install
  fi

  npx wrangler dev src/index.js
) &
API_PID=$!

# -----------------------------------------
# Wait and handle exit
# -----------------------------------------
trap "echo '🛑 Stopping services...'; kill $APP_PID $AI_PID $API_PID; exit" INT

echo
echo "🌐 Looma.sh is running!"
echo "Frontend ───────────▶ http://localhost:3000"
echo "AI Intent Engine ───▶ http://localhost:9000/health"
echo "Edge Relay ─────────▶ http://127.0.0.1:8787/ping"
echo
echo "Press CTRL+C to stop all services."
echo

wait