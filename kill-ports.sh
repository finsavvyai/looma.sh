#!/usr/bin/env bash

echo "🧹 Cleaning ports 3000, 3001, 3002..."

for P in 3000 3001 3002; do
  PID=$(lsof -t -i:$P)
  if [ ! -z "$PID" ]; then
    echo "🔪 Killing PID $PID on port $P"
    kill -9 $PID
  fi
done

echo "✨ Done."