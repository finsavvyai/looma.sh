/**
 * Looma.sh Edge API - Full-Featured Gateway
 *
 * Features:
 * - Rate limiting per IP
 * - Request logging and metrics
 * - Intent classification proxy
 * - Device management proxy
 * - Health monitoring
 * - CORS handling
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

export interface Env {
  RATE_LIMIT: KVNamespace;
  METRICS: KVNamespace;
  AI_SERVICE_URL?: string;
  ALLOWED_ORIGINS?: string;  // Comma-separated list of allowed origins
  ADMIN_TOKEN?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Dynamic CORS middleware
app.use('/*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS || "*";
  const requestOrigin = c.req.header("Origin") || "";

  // Set CORS headers based on configuration
  if (allowedOrigins === "*") {
    c.header("Access-Control-Allow-Origin", "*");
  } else {
    const origins = allowedOrigins.split(",").map(o => o.trim());
    if (origins.includes(requestOrigin)) {
      c.header("Access-Control-Allow-Origin", requestOrigin);
      c.header("Access-Control-Allow-Credentials", "true");
    } else {
      c.header("Access-Control-Allow-Origin", origins[0] || "");
    }
  }

  c.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();
});

app.use('/*', logger());

// Rate limiting middleware
const rateLimitMiddleware = async (c: any, next: () => Promise<void>) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // 100 requests per minute

  const key = `ratelimit:${ip}:${Math.floor(now / windowMs)}`;

  try {
    const currentStr = await c.env.RATE_LIMIT?.get(key);
    const current = currentStr ? parseInt(currentStr) : 0;

    if (current >= maxRequests) {
      return c.json(
        { error: 'Rate limit exceeded', retryAfter: windowMs / 1000 },
        429
      );
    }

    await c.env.RATE_LIMIT?.put(key, (current + 1).toString(), { expirationTtl: 120 });
  } catch (error) {
    console.error('Rate limit error:', error);
    // Continue on error
  }

  await next();
};

// Apply rate limiting to all routes except health
app.use('/api/*', rateLimitMiddleware);

// ============ HEALTH & STATUS ============

app.get('/', (c) => {
  return c.json({
    service: 'Looma.sh Edge API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      intent: '/api/intent',
      identity: '/api/identity/*',
    },
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'looma-edge-api',
    timestamp: Date.now(),
    uptime: null, // Cloudflare Workers don't have process.uptime
  });
});

app.get('/ping', (c) => {
  return c.json({ status: 'ok', pong: Date.now() });
});

app.get('/favicon.ico', (c) => c.body(null, 204));

// ============ METRICS ============

app.get('/metrics', async (c) => {
  try {
    const metrics = await c.env.METRICS?.get('global_metrics');
    return c.json({
      metrics: metrics ? JSON.parse(metrics) : {
        totalRequests: 0,
        intentClassifications: 0,
        deviceRegistrations: 0,
        errors: 0,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch metrics' }, 500);
  }
});

// Helper to increment metrics
async function incrementMetric(env: Env, metric: string) {
  try {
    const current = await env.METRICS?.get('global_metrics');
    const metrics = current ? JSON.parse(current) : {
      totalRequests: 0,
      intentClassifications: 0,
      deviceRegistrations: 0,
      errors: 0,
    };

    metrics[metric] = (metrics[metric] || 0) + 1;
    metrics.totalRequests = (metrics.totalRequests || 0) + 1;

    await env.METRICS?.put('global_metrics', JSON.stringify(metrics));
  } catch (error) {
    console.error('Metric increment error:', error);
  }
}

// ============ INTENT CLASSIFICATION ============

// Simple intent classification rules
const intentRules = [
  {
    name: "hard_brake",
    intent_code: "HARD_BRAKE_AHEAD",
    severity: "danger",
    category: "brake",
    description: "Hard braking detected",
    patterns: ["hard brake", "emergency brake", "sudden stop", "abrupt braking"],
    weight: 1.0
  },
  {
    name: "merge_soon",
    intent_code: "MERGE_SOON",
    severity: "warning",
    category: "merge",
    description: "Vehicle preparing to merge",
    patterns: ["merge", "lane change", "changing lanes", "merging traffic"],
    weight: 0.9
  },
  {
    name: "accident_ahead",
    intent_code: "ACCIDENT_AHEAD",
    severity: "danger",
    category: "hazard",
    description: "Accident detected ahead",
    patterns: ["accident", "crash", "collision", "wreck", "pileup"],
    weight: 1.0
  },
  {
    name: "traffic_slow",
    intent_code: "TRAFFIC_SLOW",
    severity: "info",
    category: "traffic",
    description: "Slow traffic conditions",
    patterns: ["slow traffic", "heavy traffic", "congestion", "stop and go"],
    weight: 0.7
  },
  {
    name: "weather_alert",
    intent_code: "WEATHER_ALERT",
    severity: "warning",
    category: "weather",
    description: "Weather-related driving condition",
    patterns: ["rain", "snow", "ice", "fog", "heavy rain", "snowing"],
    weight: 0.8
  }
];

function classifyIntent(text: string) {
  const lowerText = text.toLowerCase();
  let bestMatch = {
    intent_code: "UNKNOWN",
    original_text: text,
    severity: "info",
    category: "general",
    description: "No specific intent detected",
    confidence: 0.1,
    ai_contribution: 0.0,
    rule_name: null
  };

  for (const rule of intentRules) {
    for (const pattern of rule.patterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        const confidence = rule.weight * (pattern.length / text.length);
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            intent_code: rule.intent_code,
            original_text: text,
            severity: rule.severity,
            category: rule.category,
            description: rule.description,
            confidence: Math.min(confidence, 0.95),
            ai_contribution: 0.0,
            rule_name: rule.name
          };
        }
        break;
      }
    }
  }

  return bestMatch;
}

app.post('/api/intent', async (c) => {
  try {
    const body = await c.req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return c.json({ error: 'Text must be a non-empty string' }, 400);
    }

    // Use built-in intent classification
    const result = classifyIntent(text);

    await incrementMetric(c.env, 'intentClassifications');

    return c.json(result);
  } catch (error) {
    await incrementMetric(c.env, 'errors');
    return c.json(
      { error: 'Internal server error', message: (error as Error).message },
      500
    );
  }
});

// ============ DEVICE IDENTITY ============

app.post('/api/identity/register', async (c) => {
  try {
    const body = await c.req.json();
    const { public_key, car_model, nickname } = body;

    if (!public_key || typeof public_key !== 'string') {
      return c.json({ error: 'public_key is required' }, 400);
    }

    // Validate hex format
    if (!/^[0-9a-fA-F]+$/.test(public_key)) {
      return c.json({ error: 'public_key must be valid hex string' }, 400);
    }

    // Generate device ID from public key (simple hash)
    const deviceId = `device_${public_key.substring(0, 16).toLowerCase()}`;

    // Create device record
    const device = {
      device_id: deviceId,
      public_key: public_key,
      car_model: car_model || null,
      nickname: nickname || null,
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString()
    };

    // Store device in KV
    await c.env.METRICS?.put(`device:${deviceId}`, JSON.stringify(device));

    await incrementMetric(c.env, 'deviceRegistrations');

    return c.json({
      device_id: deviceId,
      public_key: public_key,
      car_model: car_model || null,
      nickname: nickname || null,
      created_at: device.created_at,
      status: "registered"
    });
  } catch (error) {
    await incrementMetric(c.env, 'errors');
    return c.json(
      { error: 'Internal server error', message: (error as Error).message },
      500
    );
  }
});

app.get('/api/identity/:device_id', async (c) => {
  try {
    const deviceId = c.req.param('device_id');

    if (!deviceId) {
      return c.json({ error: 'device_id is required' }, 400);
    }

    // Retrieve device from KV
    const deviceData = await c.env.METRICS?.get(`device:${deviceId}`);

    if (!deviceData) {
      return c.json({ error: 'Device not found' }, 404);
    }

    const device = JSON.parse(deviceData);
    return c.json(device);
  } catch (error) {
    await incrementMetric(c.env, 'errors');
    return c.json(
      { error: 'Internal server error', message: (error as Error).message },
      500
    );
  }
});

// ============ ADMIN ============

app.post('/api/admin/clear-rate-limits', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader !== `Bearer ${c.env.ADMIN_TOKEN || 'admin-secret-token'}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // List and delete all rate limit keys
    const list = await c.env.RATE_LIMIT?.list({ prefix: 'ratelimit:' });
    let deleted = 0;

    if (list?.keys) {
      for (const key of list.keys) {
        await c.env.RATE_LIMIT?.delete(key.name);
        deleted++;
      }
    }

    return c.json({ message: 'Rate limits cleared', deleted });
  } catch (error) {
    return c.json({ error: 'Failed to clear rate limits' }, 500);
  }
});

app.post('/api/admin/reset-metrics', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader !== `Bearer ${c.env.ADMIN_TOKEN || 'admin-secret-token'}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    await c.env.METRICS?.put('global_metrics', JSON.stringify({
      totalRequests: 0,
      intentClassifications: 0,
      deviceRegistrations: 0,
      errors: 0,
    }));

    return c.json({ message: 'Metrics reset successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to reset metrics' }, 500);
  }
});

// ============ ERROR HANDLING ============

app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
      stack: undefined, // Cloudflare Workers don't have process.env
    },
    500
  );
});

export default app;
