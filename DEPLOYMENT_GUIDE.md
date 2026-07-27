# Looma.sh - Deployment Guide

## Quick Start

This guide will help you deploy the Looma.sh V2V communication platform to production.

---

## Prerequisites

### Required Tools
- **Node.js** 18+ and npm
- **Python** 3.11+
- **Cloudflare Account** (free tier works)
- **Git**

### Optional Tools
- **Docker** (for containerized deployment)
- **Wrangler CLI** (Cloudflare Workers CLI)

---

## Local Development Setup

### 1. Install Dependencies

```bash
# Frontend
cd app
npm install

# Relay Worker
cd ../relay
npm install

# Edge API
cd ../api
npm install

# AI Service
cd ../ai
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

**Frontend** (`app/.env.local`):
```env
NEXT_PUBLIC_AI_BASE=http://127.0.0.1:9000
NEXT_PUBLIC_RELAY_BASE=http://127.0.0.1:8787
```

### 3. Run Services

**Terminal 1 - AI Service**:
```bash
cd ai
source .venv/bin/activate
uvicorn main:app --reload --port 9000
```

**Terminal 2 - Relay**:
```bash
cd relay
npx wrangler dev
```

**Terminal 3 - Frontend**:
```bash
cd app
npm run dev
```

**Terminal 4 - Edge API** (optional):
```bash
cd api
npx wrangler dev --port 8788
```

### 4. Verify Setup

Open browser to:
- **Frontend**: http://localhost:3000
- **AI Service**: http://localhost:9000/health
- **Relay**: http://127.0.0.1:8787/health

---

## Running Tests

### Python Tests (Backend)
```bash
# From project root
python -m pytest tests/ -v

# Expected: 44 passed
```

### Frontend Tests
```bash
cd app
npm test

# Expected: 32 passed
```

### Relay Tests
```bash
cd relay
npm test

# Expected: 40+ passed
```

### E2E Tests (requires services running)
```bash
# Start services first (see above)
python -m pytest tests/test_e2e_integration.py -v

# Expected: 11 passed
```

### Run All Tests
```bash
# From project root
./run_all_tests.sh
```

---

## Cloudflare Deployment

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. Create KV Namespaces

**For Relay**:
```bash
cd relay

# Production
wrangler kv:namespace create "LOOMAFEED"
# Output: id = "abc123..."

# Preview
wrangler kv:namespace create "LOOMAFEED" --preview
# Output: preview_id = "xyz789..."
```

Update `relay/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "LOOMAFEED"
id = "abc123..."  # Your production ID
preview_id = "xyz789..."  # Your preview ID
```

**For Edge API**:
```bash
cd api

# Rate limiting namespace
wrangler kv:namespace create "RATE_LIMIT"
wrangler kv:namespace create "RATE_LIMIT" --preview

# Metrics namespace
wrangler kv:namespace create "METRICS"
wrangler kv:namespace create "METRICS" --preview
```

Update `api/wrangler.toml` with the IDs.

### 3. Set Secrets

**Edge API Admin Token**:
```bash
cd api
wrangler secret put ADMIN_TOKEN
# Enter a secure random token (e.g., generate with: openssl rand -hex 32)
```

### 4. Deploy Workers

**Deploy Relay**:
```bash
cd relay
npm run deploy

# Output will show deployment URL:
# Published looma-relay
# https://looma-relay.<your-subdomain>.workers.dev
```

**Deploy Edge API**:
```bash
cd api
npm run deploy

# Output:
# https://looma-edge-api.<your-subdomain>.workers.dev
```

### 5. Update Frontend Configuration

Update `app/.env.local` with production URLs:
```env
NEXT_PUBLIC_AI_BASE=https://your-ai-service-domain.com
NEXT_PUBLIC_RELAY_BASE=https://looma-relay.<your-subdomain>.workers.dev
```

### 6. Deploy Frontend (Vercel)

```bash
cd app

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Or use Vercel Dashboard**:
1. Import GitHub repository
2. Set environment variables
3. Deploy automatically

---

## AI Service Deployment

### Option 1: Cloudflare Workers (Python)

```bash
cd ai

# Create wrangler.toml
cat > wrangler.toml << EOF
name = "looma-ai-service"
main = "main.py"
compatibility_date = "2024-05-01"

[build]
command = "pip install -r requirements.txt --target ./vendor"
EOF

# Deploy
wrangler deploy
```

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd ai
railway init

# Deploy
railway up
```

### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create Dockerfile (already exists)
cd ai

# Launch
fly launch

# Deploy
fly deploy
```

### Option 4: Heroku

```bash
# Install Heroku CLI
# Create Procfile
cd ai
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create looma-ai-service
git push heroku main
```

### Option 5: Docker Container (Any Cloud)

```bash
cd ai

# Build
docker build -t looma-ai-service .

# Run locally
docker run -p 9000:9000 looma-ai-service

# Push to registry
docker tag looma-ai-service your-registry/looma-ai-service
docker push your-registry/looma-ai-service
```

---

## Environment Variables

### Frontend (`app/.env.local`)
```env
NEXT_PUBLIC_AI_BASE=https://your-ai-service.com
NEXT_PUBLIC_RELAY_BASE=https://looma-relay.workers.dev
```

### Edge API (Cloudflare Secrets)
```bash
wrangler secret put ADMIN_TOKEN
wrangler secret put AI_SERVICE_URL  # Optional, can use wrangler.toml vars
```

### AI Service (Platform-specific)
```env
# Railway/Fly.io/Heroku
PORT=9000  # Usually auto-set by platform
```

---

## Database Setup (Optional)

### Replace In-Memory Device Storage

**Option 1: Cloudflare D1 (Serverless SQL)**

```bash
# Create database
wrangler d1 create looma-devices

# Create schema
wrangler d1 execute looma-devices --file=./schema.sql
```

**schema.sql**:
```sql
CREATE TABLE devices (
  device_id TEXT PRIMARY KEY,
  public_key TEXT UNIQUE NOT NULL,
  car_model TEXT,
  nickname TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_public_key ON devices(public_key);
```

**Option 2: PostgreSQL (Supabase/Neon)**

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize
supabase init

# Start local dev
supabase start

# Apply migrations
supabase db push
```

**Option 3: Redis (Upstash)**

```bash
# Create Redis database at upstash.com
# Get connection URL

# Update AI service to use Redis
pip install redis
```

---

## Monitoring & Observability

### Cloudflare Analytics

Automatic for Workers:
- Request count
- Response times
- Error rates
- Status code distribution

Access at: https://dash.cloudflare.com

### Custom Metrics (Edge API)

```bash
# View metrics
curl https://your-edge-api.workers.dev/metrics

{
  "metrics": {
    "totalRequests": 12345,
    "intentClassifications": 3456,
    "deviceRegistrations": 789,
    "errors": 12
  }
}
```

### Sentry (Error Tracking)

```bash
# Install
npm install @sentry/nextjs  # Frontend
pip install sentry-sdk  # Backend

# Configure
# Frontend: next.config.js
# Backend: main.py
```

### Logging

**Cloudflare Workers**:
```bash
# Tail logs in real-time
wrangler tail

# Relay logs
cd relay && wrangler tail

# API logs
cd api && wrangler tail
```

**AI Service Logs** (platform-specific):
```bash
# Railway
railway logs

# Fly.io
fly logs

# Heroku
heroku logs --tail
```

---

## Performance Optimization

### 1. Enable Caching

**Cloudflare Cache API** (for relay feed):
```typescript
const cache = caches.default;
const cacheKey = new Request(url.toString(), request);
let response = await cache.match(cacheKey);

if (!response) {
  response = await fetch(/* ... */);
  await cache.put(cacheKey, response.clone());
}
```

### 2. Rate Limiting (Already Implemented)

Edge API includes 100 requests/min per IP.

Adjust in `api/src/index.ts`:
```typescript
const maxRequests = 100; // Increase if needed
```

### 3. Message Pagination

Update relay feed endpoint:
```typescript
// Add pagination params
const limit = Number(searchParams.get("limit") ?? 50);
const offset = Number(searchParams.get("offset") ?? 0);
```

### 4. CDN Configuration

**Cloudflare CDN** (automatic for Workers)

**Vercel Edge Network** (automatic for Next.js)

---

## Security Checklist

### Pre-Production

- [ ] Change `ADMIN_TOKEN` to secure random value
- [ ] Update CORS origins from `*` to specific domains
- [ ] Enable HTTPS only (disable HTTP)
- [ ] Set CSP headers
- [ ] Enable rate limiting (already done)
- [ ] Review KV TTL settings
- [ ] Audit dependencies for vulnerabilities

### CORS Configuration

**Relay** (`relay/src/index.ts`):
```typescript
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://your-frontend-domain.com",
  // ...
};
```

**Edge API** (`api/src/index.ts`):
```typescript
app.use('/*', cors({
  origin: ['https://your-frontend-domain.com'],
  // ...
}));
```

### Security Headers

```typescript
// Add to all responses
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000"
}
```

---

## Scaling Considerations

### Cloudflare Workers
- **Free Plan**: 100,000 requests/day
- **Paid Plan**: 10M requests/month + $0.50/million after
- **Auto-scaling**: Automatic, no configuration needed

### KV Storage
- **Free Plan**: 100,000 reads/day, 1,000 writes/day
- **Paid Plan**: 10M reads + 1M writes/month
- **Expiration**: 24-hour TTL prevents growth

### AI Service Scaling

**Railway**:
```bash
# Scale to multiple instances
railway scale --replicas=3
```

**Fly.io**:
```bash
# Scale horizontally
fly scale count 3

# Scale vertically
fly scale vm shared-cpu-2x
```

### Database Scaling

**D1**: Automatic, serverless
**PostgreSQL**: Increase connection pool size
**Redis**: Use Upstash clusters

---

## Backup & Disaster Recovery

### KV Namespace Backup

```bash
# Backup LOOMAFEED
wrangler kv:key list --binding=LOOMAFEED > loomafeed-keys.json

# Backup individual messages
for key in $(cat loomafeed-keys.json | jq -r '.[].name'); do
  wrangler kv:key get "$key" --binding=LOOMAFEED > "backup/${key}.json"
done
```

### Database Backup

**D1**:
```bash
wrangler d1 backup create looma-devices
wrangler d1 backup list looma-devices
```

**PostgreSQL**:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Disaster Recovery Plan

1. **Workers**: Redeploy from Git
2. **KV**: Restore from backup
3. **Database**: Restore from snapshot
4. **Frontend**: Redeploy from Vercel/Git

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-python@v4

      - name: Install dependencies
        run: |
          cd app && npm install
          cd ../relay && npm install
          cd ../ai && pip install -r requirements.txt

      - name: Run tests
        run: |
          cd app && npm test
          cd ../relay && npm test
          pytest tests/

  deploy-relay:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Relay
        run: |
          cd relay
          npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy API
        run: |
          cd api
          npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Rollback Strategy

### Workers Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to specific version
wrangler rollback --message="Rollback due to issue"
```

### Frontend Rollback (Vercel)

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url> --prod
```

### Database Rollback

```bash
# D1
wrangler d1 backup restore looma-devices <backup-id>

# PostgreSQL
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find and kill process
lsof -ti:9000 | xargs kill -9
lsof -ti:8787 | xargs kill -9
```

**2. KV Not Found Error**
```bash
# Verify KV namespace IDs in wrangler.toml
wrangler kv:namespace list
```

**3. CORS Errors**
- Check CORS origins in relay and API
- Ensure HTTPS in production
- Verify preflight OPTIONS handling

**4. Signature Verification Fails**
- Check Ed25519 key format (64 hex chars)
- Verify payload JSON is identical
- Check for extra whitespace

**5. Rate Limit Issues**
```bash
# Clear rate limits (requires ADMIN_TOKEN)
curl -X POST https://your-api.workers.dev/api/admin/clear-rate-limits \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Cost Estimation

### Cloudflare (Workers + KV)
- **Free Tier**: $0/month (100k requests/day)
- **Paid Workers**: $5/month + $0.50/million requests
- **KV Storage**: Included in Workers plan

### AI Service
- **Railway**: ~$5-10/month (512MB RAM)
- **Fly.io**: ~$0-5/month (shared CPU)
- **Heroku**: $7/month (Eco dyno)

### Frontend (Vercel)
- **Hobby**: $0/month (100GB bandwidth)
- **Pro**: $20/month (1TB bandwidth)

### Database (Optional)
- **Cloudflare D1**: $0-5/month
- **Supabase**: $0-25/month
- **Upstash Redis**: $0-10/month

**Total Estimated Cost**: $10-50/month (depending on traffic)

---

## Support & Maintenance

### Health Checks

Set up monitoring:
```bash
# Cron job to check health
*/5 * * * * curl https://your-relay.workers.dev/health
```

### Log Rotation

Cloudflare logs auto-rotate (7 days retention).

For AI service, configure platform-specific log retention.

### Security Updates

```bash
# Check for vulnerabilities
npm audit
pip-audit

# Update dependencies
npm update
pip install --upgrade -r requirements.txt
```

---

## Production Checklist

Before going live:

- [ ] All tests passing (138 tests)
- [ ] Environment variables set
- [ ] KV namespaces created
- [ ] Secrets configured
- [ ] CORS origins updated
- [ ] Rate limits configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] SSL/HTTPS enabled
- [ ] Error tracking setup (Sentry)
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Documentation updated
- [ ] Rollback plan tested

---

## Quick Deploy Commands

```bash
# Deploy everything
./deploy-all.sh

# Or manually:
cd relay && npm run deploy
cd ../api && npm run deploy
cd ../app && vercel --prod

# Verify deployments
curl https://looma-relay.workers.dev/health
curl https://looma-api.workers.dev/health
curl https://your-app.vercel.app
```

---

## Next Steps

1. **Deploy to Staging**: Test full flow
2. **Load Testing**: Verify performance
3. **Security Audit**: Penetration testing
4. **Monitoring**: Set up alerts
5. **Documentation**: User guides
6. **Launch**: Go live! 🚀

---

## Resources

- **Cloudflare Workers**: https://workers.cloudflare.com
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Fly.io Docs**: https://fly.io/docs

---

**Need Help?**
- Check logs: `wrangler tail`
- Review tests: `pytest -v`
- Check metrics: `/metrics` endpoint
- Open GitHub issue

---

Generated: 2025-11-19
Status: ✅ **READY FOR DEPLOYMENT**
