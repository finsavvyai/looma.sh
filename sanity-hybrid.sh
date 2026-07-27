#!/usr/bin/env bash

echo "🔍 Running Looma.sh Hybrid Sanity Tests (Docker optional)"

GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

# Check if Docker is running
if docker info >/dev/null 2>&1; then
  USE_DOCKER=true
  echo "🐳 Docker detected, using containerized curl"
else
  USE_DOCKER=false
  echo "⚠️ Docker not running, falling back to local curl"
fi

# -----------------------------------------------------------
# DETECT NEXT.JS PORT *CORRECTLY*
# -----------------------------------------------------------
detect_next_port() {
  PORT_CANDIDATES="3000 3001 3002 3003 3004 3005"

  for P in $PORT_CANDIDATES; do
    # Must be a node process AND responding with an HTTP page
    if lsof -nP -iTCP:$P -sTCP:LISTEN 2>/dev/null | grep -q "node"; then
      CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$P)
      if [ "$CODE" = "200" ] || [ "$CODE" = "304" ]; then
        echo $P
        return
      fi
    fi
  done

  # fallback if all else fails
  echo 3000
}

NEXT_PORT=$(detect_next_port)
echo "🌐 Using Next.js port: $NEXT_PORT"

# -----------------------------------------------------------
# HTTP CALLER
# -----------------------------------------------------------
call() {
  local URL=$1
  local NAME=$2
  local CODE

  echo -n "⏳ Checking $NAME... "

  if [ "$USE_DOCKER" = true ]; then
    CODE=$(docker run --network=host curlimages/curl:8.6.0 -s -o /dev/null -w "%{http_code}" "$URL")
  else
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  fi

  if [[ "$CODE" = "200" || "$CODE" = "304" ]]; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${RED}FAIL (HTTP $CODE)${NC}"
  fi
}

# -----------------------------------------------------------
# DO CHECKS
# -----------------------------------------------------------
echo "---------------------------------------------"
call "http://localhost:$NEXT_PORT" "Next.js Frontend"
call "http://localhost:9000/health" "AI Intent Engine"
call "http://127.0.0.1:8787/ping" "Worker /ping"
call "http://127.0.0.1:8787/health" "Worker /health"
echo "---------------------------------------------"

# Relay test
echo "🧪 Relay POST test..."
if [ "$USE_DOCKER" = true ]; then
  docker run --network=host curlimages/curl:8.6.0 -s \
    -X POST http://127.0.0.1:8787/relay \
    -H "Content-Type: application/json" \
    -d '{"text":"merge soon"}'
else
  curl -s -X POST http://127.0.0.1:8787/relay \
    -H "Content-Type: application/json" \
    -d '{"text":"merge soon"}'
fi

echo
echo "---------------------------------------------"
echo "✨ Hybrid sanity test complete."