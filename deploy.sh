#!/bin/bash

# Looma.sh Production Deployment Script
# This script deploys all components to production

set -e  # Exit on error

echo "🚗 Looma.sh - Production Deployment"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}  # production, staging, or development
SKIP_TESTS=${SKIP_TESTS:-false}

echo -e "${BLUE}Deploying to: ${ENVIRONMENT}${NC}"
echo ""

# Function to print section header
print_header() {
    echo ""
    echo "=========================================="
    echo "  $1"
    echo "=========================================="
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Preflight checks
print_header "1. Preflight Checks"

# Check required commands
REQUIRED_COMMANDS=("node" "npm" "python3" "wrangler")
for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if command_exists "$cmd"; then
        echo -e "${GREEN}✓ $cmd is installed${NC}"
    else
        echo -e "${RED}✗ $cmd is not installed${NC}"
        exit 1
    fi
done

# Check for environment files
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f "ai/.env.production" ]; then
        echo -e "${YELLOW}⚠ ai/.env.production not found (will use defaults)${NC}"
    fi
    if [ ! -f "app/.env.production" ]; then
        echo -e "${YELLOW}⚠ app/.env.production not found (will use defaults)${NC}"
    fi
fi

# Run tests (unless skipped)
if [ "$SKIP_TESTS" != "true" ]; then
    print_header "2. Running Tests"

    echo "Running Python tests..."
    export PYTHONPATH="${PWD}:${PWD}/ai:${PYTHONPATH}"
    if python3 -m pytest tests/test_intent_classifier.py tests/test_intent_endpoint.py -v --tb=short; then
        echo -e "${GREEN}✓ Python tests passed${NC}"
    else
        echo -e "${RED}✗ Python tests failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Skipping tests (SKIP_TESTS=true)${NC}"
fi

# Deploy Cloudflare Workers
print_header "3. Deploying Cloudflare Workers"

echo "Deploying Relay Worker..."
cd relay
if npm run deploy -- --env "$ENVIRONMENT" 2>/dev/null || npx wrangler deploy --env "$ENVIRONMENT"; then
    echo -e "${GREEN}✓ Relay deployed${NC}"
else
    echo -e "${RED}✗ Relay deployment failed${NC}"
    exit 1
fi
cd ..

echo "Deploying Edge API..."
cd api
if npm run deploy -- --env "$ENVIRONMENT" 2>/dev/null || npx wrangler deploy --env "$ENVIRONMENT"; then
    echo -e "${GREEN}✓ Edge API deployed${NC}"
else
    echo -e "${RED}✗ Edge API deployment failed${NC}"
    exit 1
fi
cd ..

# Create KV namespaces if needed
print_header "4. Setting up Cloudflare KV Namespaces"

if [ "$ENVIRONMENT" = "production" ]; then
    echo "Creating production KV namespaces..."

    # Relay KV
    wrangler kv:namespace create "LOOMAFEED" --preview false || echo "KV namespace may already exist"

    # Edge API KV
    wrangler kv:namespace create "RATE_LIMIT" --preview false || echo "KV namespace may already exist"
    wrangler kv:namespace create "METRICS" --preview false || echo "KV namespace may already exist"

    echo -e "${GREEN}✓ KV namespaces ready${NC}"
fi

# Build and deploy frontend
print_header "5. Building Frontend"

cd app
echo "Installing dependencies..."
npm install

echo "Building Next.js application..."
if [ "$ENVIRONMENT" = "production" ]; then
    NODE_ENV=production npm run build
else
    npm run build
fi

echo -e "${GREEN}✓ Frontend built${NC}"
echo -e "${YELLOW}Note: Deploy frontend to your hosting provider (Vercel, Netlify, etc.)${NC}"
cd ..

# AI Service deployment instructions
print_header "6. AI Service Deployment"

echo -e "${YELLOW}AI Service needs to be deployed to a server or container platform${NC}"
echo ""
echo "Option 1: Docker"
echo "  cd ai && docker build -t looma-ai:$ENVIRONMENT ."
echo "  docker run -p 9000:9000 --env-file .env.production looma-ai:$ENVIRONMENT"
echo ""
echo "Option 2: Direct deployment"
echo "  cd ai"
echo "  pip install -r requirements.txt"
echo "  uvicorn main:app --host 0.0.0.0 --port 9000 --workers 4"
echo ""
echo "Option 3: Platform-specific (Railway, Render, Fly.io, etc.)"
echo "  Follow platform-specific deployment guides"
echo ""

# Set secrets
print_header "7. Setting Cloudflare Secrets"

echo "Setting secrets for Edge API..."
echo "Run these commands manually:"
echo ""
echo "  cd api"
echo "  wrangler secret put ADMIN_TOKEN --env $ENVIRONMENT"
echo ""
echo "  cd ../relay"
echo "  # (Optional) wrangler secret put ALLOWED_ORIGINS --env $ENVIRONMENT"
echo ""

# Database setup
print_header "8. Database Setup"

echo "Database configuration:"
echo "  - SQLite: Set DATABASE_TYPE=sqlite in .env.production"
echo "  - PostgreSQL: Set DATABASE_TYPE=postgresql and DATABASE_URL"
echo "  - Supabase: Set DATABASE_TYPE=supabase, SUPABASE_URL, and SUPABASE_KEY"
echo ""
echo "Run database migrations if using PostgreSQL/Supabase"
echo ""

# Summary
print_header "Deployment Summary"

echo -e "${GREEN}✓ Relay Worker deployed to Cloudflare${NC}"
echo -e "${GREEN}✓ Edge API deployed to Cloudflare${NC}"
echo -e "${GREEN}✓ Frontend built (ready for deployment)${NC}"
echo -e "${YELLOW}⚠ AI Service needs manual deployment${NC}"
echo -e "${YELLOW}⚠ Secrets need to be set manually${NC}"
echo -e "${YELLOW}⚠ Database needs to be configured${NC}"
echo ""

echo "Next steps:"
echo "  1. Deploy AI service to your server/container platform"
echo "  2. Deploy frontend to Vercel/Netlify"
echo "  3. Set Cloudflare secrets (wrangler secret put)"
echo "  4. Configure database connection"
echo "  5. Test endpoints:"
echo "     - Frontend: https://app.looma.sh"
echo "     - Relay: https://relay.looma.sh/health"
echo "     - Edge API: https://edge.looma.sh/health"
echo "     - AI Service: https://api.looma.sh/health"
echo ""

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🚀${NC}"
echo -e "${GREEN}==========================================${NC}"
