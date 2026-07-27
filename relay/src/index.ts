import { ed25519 } from "@noble/curves/ed25519.js";

export interface Env {
  LOOMAFEED: KVNamespace;
  ALLOWED_ORIGINS?: string;  // Comma-separated list of allowed origins
}

function getCorsHeaders(env: Env, origin?: string): Record<string, string> {
  const allowedOrigins = env.ALLOWED_ORIGINS || "*";

  // If wildcard, allow any origin
  if (allowedOrigins === "*") {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
  }

  // Check if origin is in allowed list
  const origins = allowedOrigins.split(",").map(o => o.trim());
  const requestOrigin = origin || "";

  if (origins.includes(requestOrigin)) {
    return {
      "Access-Control-Allow-Origin": requestOrigin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true"
    };
  }

  // Default: deny
  return {
    "Access-Control-Allow-Origin": origins[0] || "",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function jsonResponse(body: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

function hexToBytes(hex: string): Uint8Array {
  if (!hex || typeof hex !== "string") return new Uint8Array();
  const clean = hex.replace(/^0x/, "");
  if (clean.length % 2 !== 0) throw new Error("Invalid hex length");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const origin = request.headers.get("Origin") || undefined;
    const corsHeaders = getCorsHeaders(env, origin);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health + ping
    if (pathname === "/ping") {
      return jsonResponse({ status: "ok", service: "Looma Relay" }, 200, corsHeaders);
    }

    if (pathname === "/health") {
      return jsonResponse({
        status: "ok",
        relay: "looma-edge",
        timestamp: Date.now()
      }, 200, corsHeaders);
    }

    // ---------- V2V MESSAGE: verify + store ----------
    if (pathname === "/v2v/message" && request.method === "POST") {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON" }, 400, corsHeaders);
      }

      const { device_id, public_key, signature, payload, timestamp } = body;

      if (!device_id || !public_key || !signature || !payload) {
        return jsonResponse(
          { error: "device_id, public_key, signature, payload required" },
          400,
          corsHeaders
        );
      }

      // Verify Ed25519 signature over JSON(payload)
      let verified = false;
      try {
        const msgBytes = new TextEncoder().encode(JSON.stringify(payload));
        const sigBytes = hexToBytes(signature);
        const pubBytes = hexToBytes(public_key);

        verified = ed25519.verify(sigBytes, msgBytes, pubBytes);
      } catch (e) {
        console.error("Verify error:", e);
        verified = false;
      }

      if (!verified) {
        return jsonResponse({ error: "Invalid signature" }, 400, corsHeaders);
      }

      const ts = typeof timestamp === "number" ? timestamp : Date.now();
      const key = `msg:${ts}:${device_id}:${crypto.randomUUID()}`;

      const record = {
        id: key,
        device_id,
        public_key,
        signature,
        payload,
        timestamp: ts,
        verified: true
      };

      // Store with 24-hour TTL
      const ttlSeconds = 24 * 60 * 60; // 24 hours
      await env.LOOMAFEED.put(key, JSON.stringify(record), { expirationTtl: ttlSeconds });

      return jsonResponse({ status: "received", message_id: key }, 202, corsHeaders);
    }

    // ---------- V2V FEED: nearby messages ----------
    if (pathname === "/v2v/feed" && request.method === "GET") {
      const userLat = Number(searchParams.get("lat"));
      const userLng = Number(searchParams.get("lng"));
      const radius = Number(searchParams.get("radius") ?? 300); // meters

      const list = await env.LOOMAFEED.list({ prefix: "msg:" });
      const messages: any[] = [];

      for (const k of list.keys) {
        const value = await env.LOOMAFEED.get(k.name);
        if (!value) continue;

        try {
          const msg = JSON.parse(value);
          const gps = msg.payload?._gps;
          if (!gps || isNaN(gps.lat) || isNaN(gps.lng)) continue;

          if (!isFinite(userLat) || !isFinite(userLng)) {
            // no user location → include but without distance filter
            messages.push(msg);
            continue;
          }

          const dist = haversine(userLat, userLng, gps.lat, gps.lng);
          if (dist <= radius) {
            msg._distance = dist;
            messages.push(msg);
          }
        } catch {
          // ignore malformed
        }
      }

      messages.sort((a, b) => {
        const da = a._distance ?? Infinity;
        const db = b._distance ?? Infinity;
        return da - db;
      });

      return jsonResponse({
        count: messages.length,
        messages,
        now: Date.now()
      }, 200, corsHeaders);
    }

    // ---------- WEBSOCKET SUPPORT FOR REAL-TIME UPDATES ----------
    if (pathname === "/v2v/ws") {
      try {
        const pair = new WebSocketPair();
        const client = pair[0];
        const server = pair[1];

        // Accept the WebSocket connection immediately
        server.accept();
        console.log("WebSocket client connected for V2V updates");

        // Extract URL parameters for this connection
        const userLat = Number(searchParams.get("lat") || 32.0898);
        const userLng = Number(searchParams.get("lng") || 34.8168);
        const radius = Number(searchParams.get("radius") || 1000);

        console.log(`WebSocket params: lat=${userLat}, lng=${userLng}, radius=${radius}`);

        // Function to send new messages to this client
        const sendUpdate = async () => {
          try {
            const list = await env.LOOMAFEED.list({ prefix: "msg:" });
            const messages: any[] = [];

            for (const k of list.keys) {
              const value = await env.LOOMAFEED.get(k.name);
              if (!value) continue;

              try {
                const msg = JSON.parse(value);
                const gps = msg.payload?._gps;
                if (!gps || isNaN(gps.lat) || isNaN(gps.lng)) continue;

                const dist = haversine(userLat, userLng, gps.lat, gps.lng);
                if (dist <= radius) {
                  msg._distance = dist;
                  messages.push(msg);
                }
              } catch {
                // ignore malformed
              }
            }

            messages.sort((a, b) => {
              const da = a._distance ?? Infinity;
              const db = b._distance ?? Infinity;
              return da - db;
            });

            const update = {
              type: "feed_update",
              data: {
                count: messages.length,
                messages: messages.slice(-10), // Only send latest 10 messages
                now: Date.now()
              }
            };

            server.send(JSON.stringify(update));
          } catch (error) {
            console.error("WebSocket send error:", error);
          }
        };

        // Send initial data
        sendUpdate();

        // Set up periodic updates
        const updateInterval = setInterval(sendUpdate, 5000); // Update every 5 seconds

        // Clean up on disconnect
        server.addEventListener("close", () => {
          clearInterval(updateInterval);
          console.log("WebSocket client disconnected");
        });

        server.addEventListener("error", (error) => {
          console.error("WebSocket error:", error);
          clearInterval(updateInterval);
        });

        // Return the WebSocket response
        return new Response(null, {
          status: 101,
          webSocket: client
        });

      } catch (error) {
        console.error("WebSocket creation failed:", error);
        // Fall back to HTTP response if WebSocket fails
        return jsonResponse({
          error: "WebSocket not available",
          fallback_url: `${env.ALLOWED_ORIGINS?.split(',')[0] || 'https://looma.sh'}/v2v/feed`
        }, 501, corsHeaders);
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};