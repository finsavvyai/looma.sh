#!/usr/bin/env bash

echo "🔍 Running Looma.sh sanity checks..."

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

check() {
  local URL=$1
  local NAME=$2

  echo -n "⏳ Checking $NAME... "
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

  if [ "$RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${RED}FAIL (HTTP $RESPONSE)${NC}"
  fi
}

echo "---------------------------------------------"

check "http://localhost:3000" "Next.js Frontend"
check "http://localhost:9000/health" "AI Intent Engine"
check "http://127.0.0.1:8787/ping" "Cloudflare Worker /ping"
check "http://127.0.0.1:8787/health" "Cloudflare Worker /health"

echo "---------------------------------------------"

echo "🧪 Testing Worker Relay POST..."
RELAY=$(curl -s -X POST http://127.0.0.1:8787/relay -H "Content-Type: application/json" -d '{"text":"merge soon"}')

echo "Response:"
echo "$RELAY"

echo "---------------------------------------------"
echo "✨ Sanity test finished."