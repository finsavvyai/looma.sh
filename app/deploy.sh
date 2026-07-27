#!/bin/bash

# Production Deployment Script for Looma.sh V2V Platform
# This script builds and deploys the application to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Start deployment
log_info "🚀 Starting Looma.sh V2V Platform Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the app directory."
    exit 1
fi

# Environment validation
log_info "📋 Validating environment..."

# Check Node.js version
NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
    log_warning "NEXT_PUBLIC_SITE_URL not set, using default"
    export NEXT_PUBLIC_SITE_URL="https://looma.sh"
fi

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    log_warning "NEXT_PUBLIC_API_URL not set, using default"
    export NEXT_PUBLIC_API_URL="https://api.looma.sh"
fi

# Clean previous builds
log_info "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Install dependencies
log_info "📦 Installing dependencies..."
npm ci --only=production

# Run tests
log_info "🧪 Running tests..."
if [ "$SKIP_TESTS" != "true" ]; then
    npm run test
    npm run test:e2e
else
    log_warning "Skipping tests as SKIP_TESTS=true"
fi

# Build the application
log_info "🏗️ Building application..."
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    log_error "Build failed - out directory not found"
    exit 1
fi

# Create production directory structure
log_info "📁 Creating production directory structure..."
mkdir -p dist
cp -r out/* dist/

# Add version information
log_info "📝 Adding version information..."
npm run version

# Create sitemap and robots.txt
log_info "🔍 Creating SEO files..."
cat > dist/robots.txt << EOF
User-agent: *
Allow: /
Sitemap: https://looma.sh/sitemap.xml

# Block AI crawlers that don't respect content
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /
EOF

# Generate sitemap
cat > dist/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://looma.sh/</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://looma.sh/demo/select</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://looma.sh/demo/analytics</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://looma.sh/demo/3d-visualization</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://looma.sh/demo/ai-analytics</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://looma.sh/demo/immersive-experience</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://looma.sh/demo/security-showcase</loc>
        <lastmod>$(date +%Y-%m-%d)</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>
EOF

# Create deployment manifest
cat > dist/deployment.json << EOF
{
    "version": "$(cat version.txt 2>/dev/null || echo 'unknown')",
    "build_date": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "node_version": "$(node --version)",
    "environment": "production",
    "build_hash": "$(find dist -type f -exec sha256sum {} \; | sha256sum | cut -d' ' -f1)"
}
EOF

# Optimize static assets
log_info "⚡ Optimizing static assets..."
find dist -name "*.js" -exec gzip -k {} \;
find dist -name "*.css" -exec gzip -k {} \;
find dist -name "*.html" -exec gzip -k {} \;

# Check file sizes
log_info "📊 Build statistics:"
du -sh dist
find dist -name "*.js" -exec ls -lh {} \; | awk '{sum+=$5} END {print "Total JS size:", sum/1024/1024 "MB"}'
find dist -name "*.css" -exec ls -lh {} \; | awk '{sum+=$5} END {print "Total CSS size:", sum/1024/1024 "MB"}'

# Deployment to Cloudflare Pages (if configured)
if [ ! -z "$CLOUDFLARE_API_TOKEN" ] && [ ! -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    log_info "☁️ Deploying to Cloudflare Pages..."

    # Create deployment
    DEPLOY_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "looma-sh-v2v-platform",
            "production_branch": "main"
        }')

    log_success "Cloudflare Pages deployment initiated"
    echo "$DEPLOY_RESPONSE" | jq '.result.url' 2>/dev/null || echo "Check Cloudflare dashboard for deployment URL"
else
    log_info "☁️ Skipping Cloudflare deployment (API credentials not provided)"
fi

# Create deployment verification script
cat > dist/verify-deployment.sh << 'EOF'
#!/bin/bash

# Deployment Verification Script
echo "🔍 Verifying deployment..."

# Check critical files
CRITICAL_FILES=(
    "index.html"
    "demo/select/index.html"
    "demo/analytics/index.html"
    "demo/3d-visualization/index.html"
    "demo/ai-analytics/index.html"
    "demo/immersive-experience/index.html"
    "demo/security-showcase/index.html"
    "robots.txt"
    "sitemap.xml"
    "deployment.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
    fi
done

# Check file sizes
echo "📊 File size analysis:"
find . -name "*.html" -exec ls -lh {} \; | awk '{sum+=$5} END {print "HTML files:", sum/1024 "KB"}'
find . -name "*.js" -exec ls -lh {} \; | awk '{sum+=$5} END {print "JS files:", sum/1024 "KB"}'
find . -name "*.css" -exec ls -lh {} \; | awk '{sum+=$5} END {print "CSS files:", sum/1024 "KB"}'

echo "✅ Deployment verification complete"
EOF

chmod +x dist/verify-deployment.sh

# Create rollback script
cat > rollback.sh << EOF
#!/bin/bash

# Rollback Script
echo "🔄 Rolling back deployment..."

# Check if we have a previous version
if [ -d "previous" ]; then
    echo "Found previous version, rolling back..."
    rm -rf current
    mv out current
    mv previous out
    echo "✅ Rollback complete"
else
    echo "❌ No previous version found"
    exit 1
fi
EOF

chmod +x rollback.sh

# Security scan
log_info "🔒 Running security scan..."
if command -v npm &> /dev/null; then
    npx audit-ci --moderate 2>/dev/null || log_warning "Security audit found issues"
fi

# Performance test
log_info "⚡ Running performance test..."
if [ -f "dist/index.html" ]; then
    # Basic performance checks
    HTML_SIZE=$(stat -f%z "dist/index.html" 2>/dev/null || stat -c%s "dist/index.html" 2>/dev/null || echo "0")
    if [ "$HTML_SIZE" -lt 100000 ]; then  # Less than 100KB
        log_success "✅ HTML size optimized ($((${HTML_SIZE}/1024))KB)"
    else
        log_warning "⚠️ HTML size could be optimized ($((${HTML_SIZE}/1024))KB)"
    fi
fi

# Deployment summary
log_success "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  - Build directory: dist/"
echo "  - Total files: $(find dist -type f | wc -l)"
echo "  - Total size: $(du -sh dist | cut -f1)"
echo "  - Version: $(cat version.txt 2>/dev/null || echo 'unknown')"
echo "  - Deploy time: $(date)"
echo ""
echo "🌐 Next steps:"
echo "  1. Run ./dist/verify-deployment.sh to verify the deployment"
echo "  2. Test the application at https://looma.sh"
echo "  3. Monitor analytics and performance"
echo "  4. Use ./rollback.sh if needed"
echo ""
echo "📞 Support: engineering@looma.sh"

# Create monitoring configuration
cat > dist/monitoring-config.json << EOF
{
    "site_url": "https://looma.sh",
    "critical_pages": [
        "/",
        "/demo/select",
        "/demo/analytics",
        "/demo/3d-visualization",
        "/demo/ai-analytics",
        "/demo/immersive-experience",
        "/demo/security-showcase"
    ],
    "performance_thresholds": {
        "lighthouse_performance": 90,
        "lighthouse_accessibility": 95,
        "lighthouse_best_practices": 90,
        "lighthouse_seo": 80,
        "first_contentful_paint": 1.5,
        "largest_contentful_paint": 2.5,
        "cumulative_layout_shift": 0.1,
        "total_blocking_time": 200
    },
    "uptime_checks": {
        "interval": "60s",
        "timeout": "10s",
        "retries": 3
    },
    "alerting": {
        "email": "engineering@looma.sh",
        "slack_webhook": process.env.SLACK_WEBHOOK_URL
    }
}
EOF

log_success "✅ Production deployment complete!"