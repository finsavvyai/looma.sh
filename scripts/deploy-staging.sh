#!/bin/bash

# Staging Deployment Script for Looma.sh
# Usage: ./scripts/deploy-staging.sh

set -e

echo "🚀 Starting Staging Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run from project root."
    exit 1
fi

# Build the application
print_status "Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Run tests
print_status "Running tests..."
npm test

if [ $? -eq 0 ]; then
    print_status "All tests passed"
else
    print_error "Tests failed"
    exit 1
fi

# Deploy to staging
print_status "Deploying to staging environment..."
wrangler pages deploy out/ --project-name looma-sh-staging --branch staging --commit-dirty=true

if [ $? -eq 0 ]; then
    staging_url="https://looma-sh-staging.pages.dev"
    print_status "Successfully deployed to staging!"
    print_status "Staging URL: $staging_url"

    # Health check
    print_status "Running health checks on staging..."
    sleep 5
    http_status=$(curl -s -o /dev/null -w "%{http_code}" $staging_url)

    if [ $http_status -eq 200 ]; then
        print_status "Staging deployment is healthy"
    else
        print_warning "Staging deployment returned HTTP $http_status"
    fi

    # Open in browser (optional)
    if command -v open &> /dev/null; then
        open $staging_url
    fi
else
    print_error "Deployment to staging failed"
    exit 1
fi

echo "🎉 Staging deployment completed!"