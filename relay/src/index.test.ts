import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import worker from './index';
import { ed25519 } from '@noble/curves/ed25519.js';

// Mock Cloudflare KV
class MockKV {
  private store: Map<string, string> = new Map();
  private keys: Array<{ name: string }> = [];

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    if (!this.keys.find((k) => k.name === key)) {
      this.keys.push({ name: key });
    }
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }> {
    if (options?.prefix) {
      return {
        keys: this.keys.filter((k) => k.name.startsWith(options.prefix)),
      };
    }
    return { keys: this.keys };
  }

  clear() {
    this.store.clear();
    this.keys = [];
  }
}

describe('Looma Relay Worker', () => {
  let mockKV: MockKV;
  let env: any;

  beforeEach(() => {
    mockKV = new MockKV();
    env = { LOOMAFEED: mockKV };
  });

  describe('Health Endpoints', () => {
    it('should respond to /ping', async () => {
      const request = new Request('http://localhost/ping');
      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ status: 'ok', service: 'Looma Relay' });
    });

    it('should respond to /health', async () => {
      const request = new Request('http://localhost/health');
      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.relay).toBe('looma-edge');
      expect(data.timestamp).toBeGreaterThan(0);
    });

    it('should handle OPTIONS for CORS', async () => {
      const request = new Request('http://localhost/v2v/message', {
        method: 'OPTIONS',
      });
      const response = await worker.fetch(request, env);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });

  describe('POST /v2v/message - Message Submission', () => {
    it('should accept valid signed message', async () => {
      // Generate real Ed25519 keypair
      const privateKey = ed25519.utils.randomPrivateKey();
      const publicKey = ed25519.getPublicKey(privateKey);

      const payload = {
        type: 'HARD_BRAKE',
        message: 'Emergency stop ahead',
        _gps: { lat: 37.7749, lng: -122.4194, speed: 0, heading: 0 },
      };

      // Sign the payload
      const msgBytes = new TextEncoder().encode(JSON.stringify(payload));
      const signature = ed25519.sign(msgBytes, privateKey);

      const body = {
        device_id: 'test-device-123',
        public_key: Buffer.from(publicKey).toString('hex'),
        signature: Buffer.from(signature).toString('hex'),
        payload,
        timestamp: Date.now(),
      };

      const request = new Request('http://localhost/v2v/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.status).toBe('received');
      expect(data.message_id).toContain('msg:');
      expect(data.message_id).toContain('test-device-123');

      // Verify message was stored in KV
      const storedKeys = await mockKV.list({ prefix: 'msg:' });
      expect(storedKeys.keys.length).toBe(1);

      const storedValue = await mockKV.get(storedKeys.keys[0].name);
      const storedMsg = JSON.parse(storedValue!);
      expect(storedMsg.device_id).toBe('test-device-123');
      expect(storedMsg.verified).toBe(true);
      expect(storedMsg.payload.type).toBe('HARD_BRAKE');
    });

    it('should reject message with invalid signature', async () => {
      const privateKey = ed25519.utils.randomPrivateKey();
      const publicKey = ed25519.getPublicKey(privateKey);

      const payload = { type: 'TEST', message: 'Test message' };

      // Sign different payload
      const wrongPayload = { type: 'WRONG', message: 'Wrong' };
      const msgBytes = new TextEncoder().encode(JSON.stringify(wrongPayload));
      const signature = ed25519.sign(msgBytes, privateKey);

      const body = {
        device_id: 'test-device',
        public_key: Buffer.from(publicKey).toString('hex'),
        signature: Buffer.from(signature).toString('hex'),
        payload, // Different from what was signed
        timestamp: Date.now(),
      };

      const request = new Request('http://localhost/v2v/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid signature');

      // Verify nothing was stored
      const storedKeys = await mockKV.list({ prefix: 'msg:' });
      expect(storedKeys.keys.length).toBe(0);
    });

    it('should reject message with missing required fields', async () => {
      const request = new Request('http://localhost/v2v/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'test' }), // Missing other fields
      });

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('should reject malformed JSON', async () => {
      const request = new Request('http://localhost/v2v/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid{json',
      });

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON');
    });

    it('should use provided timestamp or default to now', async () => {
      const privateKey = ed25519.utils.randomPrivateKey();
      const publicKey = ed25519.getPublicKey(privateKey);
      const payload = { type: 'TEST' };
      const msgBytes = new TextEncoder().encode(JSON.stringify(payload));
      const signature = ed25519.sign(msgBytes, privateKey);

      const customTimestamp = 1234567890000;

      const body = {
        device_id: 'test-device',
        public_key: Buffer.from(publicKey).toString('hex'),
        signature: Buffer.from(signature).toString('hex'),
        payload,
        timestamp: customTimestamp,
      };

      const request = new Request('http://localhost/v2v/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.message_id).toContain(`msg:${customTimestamp}:`);
    });
  });

  describe('GET /v2v/feed - Feed Retrieval', () => {
    beforeEach(async () => {
      // Seed some test messages with GPS data
      const messages = [
        {
          id: 'msg:1:device1:uuid1',
          device_id: 'device1',
          payload: {
            type: 'HAZARD',
            _gps: { lat: 37.7749, lng: -122.4194, speed: 0, heading: 0 },
          },
          timestamp: Date.now() - 1000,
          verified: true,
        },
        {
          id: 'msg:2:device2:uuid2',
          device_id: 'device2',
          payload: {
            type: 'TRAFFIC',
            _gps: { lat: 37.7750, lng: -122.4195, speed: 15, heading: 90 },
          },
          timestamp: Date.now() - 2000,
          verified: true,
        },
        {
          id: 'msg:3:device3:uuid3',
          device_id: 'device3',
          payload: {
            type: 'MERGE',
            _gps: { lat: 37.8000, lng: -122.4500, speed: 30, heading: 180 }, // Far away
          },
          timestamp: Date.now() - 3000,
          verified: true,
        },
      ];

      for (const msg of messages) {
        await mockKV.put(msg.id, JSON.stringify(msg));
      }
    });

    it('should return nearby messages within radius', async () => {
      const request = new Request(
        'http://localhost/v2v/feed?lat=37.7749&lng=-122.4194&radius=200'
      );

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBeGreaterThan(0);
      expect(data.messages).toBeDefined();
      expect(Array.isArray(data.messages)).toBe(true);

      // Should include messages within 200m, sorted by distance
      data.messages.forEach((msg: any, idx: number) => {
        expect(msg._distance).toBeDefined();
        if (idx > 0) {
          expect(msg._distance).toBeGreaterThanOrEqual(data.messages[idx - 1]._distance);
        }
      });
    });

    it('should filter out messages beyond radius', async () => {
      const request = new Request(
        'http://localhost/v2v/feed?lat=37.7749&lng=-122.4194&radius=50' // Very small radius
      );

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should have fewer messages with small radius
      expect(data.count).toBeLessThanOrEqual(3);
    });

    it('should return all messages if no user location provided', async () => {
      const request = new Request('http://localhost/v2v/feed');

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(3);
      expect(data.messages.length).toBe(3);
    });

    it('should use default radius of 300m', async () => {
      const request = new Request('http://localhost/v2v/feed?lat=37.7749&lng=-122.4194');

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('messages');
    });

    it('should skip messages without GPS data', async () => {
      // Add message without GPS
      await mockKV.put(
        'msg:4:device4:uuid4',
        JSON.stringify({
          id: 'msg:4:device4:uuid4',
          device_id: 'device4',
          payload: { type: 'NO_GPS' }, // No _gps field
          timestamp: Date.now(),
          verified: true,
        })
      );

      const request = new Request(
        'http://localhost/v2v/feed?lat=37.7749&lng=-122.4194&radius=1000'
      );

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should not include the message without GPS
      expect(data.messages.every((m: any) => m.payload._gps)).toBe(true);
    });

    it('should return empty feed if no messages match', async () => {
      mockKV.clear();

      const request = new Request(
        'http://localhost/v2v/feed?lat=37.7749&lng=-122.4194&radius=1000'
      );

      const response = await worker.fetch(request, env);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(0);
      expect(data.messages).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const request = new Request('http://localhost/unknown');
      const response = await worker.fetch(request, env);

      expect(response.status).toBe(404);
    });

    it('should include CORS headers in all responses', async () => {
      const request = new Request('http://localhost/ping');
      const response = await worker.fetch(request, env);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });
});
