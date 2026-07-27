#!/bin/bash
# Quick fix script to kill Chrome processes before running automation

echo "🔧 Fixing Chrome processes..."

# Kill Chrome processes
pkill -f "Google Chrome" 2>/dev/null
pkill -f "chrome" 2>/dev/null
pkill -f "Chromium" 2>/dev/null

sleep 2

echo "✅ Chrome processes killed (if any were running)"
echo "💡 Now you can run: npm run generate"


