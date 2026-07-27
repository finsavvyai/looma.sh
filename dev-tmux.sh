#!/usr/bin/env bash

SESSION="looma"

# Kill old session
tmux kill-session -t $SESSION 2>/dev/null

tmux new-session -d -s $SESSION -n app "cd app && npm run dev"
tmux split-window -v "cd ai && source .venv/bin/activate && uvicorn main:app --reload --port 9000"
tmux split-window -h "cd api && npx wrangler dev src/index.js"

tmux select-layout tiled

echo "🚀 Looma.sh tmux environment started."
echo "Attach using: tmux attach -t looma"