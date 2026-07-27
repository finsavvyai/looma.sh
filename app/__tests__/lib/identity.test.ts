import { loadOrCreateIdentity, signMessage, sendV2VMessage, fetchV2VFeed } from '@/app/lib/identity';
import * as location from '@/app/lib/location';

// Mock fetch globally
global.fetch = jest.fn();

// Mock location module
jest.mock('@/app/lib/location');

describe('Identity Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('loadOrCreateIdentity', () => {
    it('should load existing identity from localStorage', async () => {
      const mockIdentity = {
        deviceId: 'test-device-id',
        publicKeyHex: 'abcd1234',
        privateKeyHex: 'private5678',
        carModel: 'Tesla Model 3',
        nickname: 'Test Car',
      };

      localStorage.setItem('looma_identity_v1', JSON.stringify(mockIdentity));

      const identity = await loadOrCreateIdentity();

      expect(identity).toEqual(mockIdentity);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should create new identity if none exists', async () => {
      const mockResponse = {
        device_id: 'new-device-id',
        public_key: 'new-public-key',
        car_model: 'DEV_SIMULATOR',
        nickname: 'Shachar Dev Car',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const identity = await loadOrCreateIdentity();

      expect(identity.deviceId).toBe('new-device-id');
      expect(identity.publicKeyHex).toBeTruthy();
      expect(identity.privateKeyHex).toBeTruthy();
      expect(identity.carModel).toBe('DEV_SIMULATOR');
      expect(identity.nickname).toBe('Shachar Dev Car');

      // Should save to localStorage
      const saved = localStorage.getItem('looma_identity_v1');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!).deviceId).toBe('new-device-id');
    });

    it('should throw error on failed registration', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(loadOrCreateIdentity()).rejects.toThrow('Failed identity registration');
    });

    it('should generate valid ed25519 keys', async () => {
      const mockResponse = {
        device_id: 'test-id',
        public_key: 'test-key',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const identity = await loadOrCreateIdentity();

      // Ed25519 keys are 32 bytes = 64 hex characters
      expect(identity.publicKeyHex).toHaveLength(64);
      expect(identity.privateKeyHex).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(identity.publicKeyHex)).toBe(true);
      expect(/^[0-9a-f]+$/.test(identity.privateKeyHex)).toBe(true);
    });
  });

  describe('signMessage', () => {
    it('should sign a message with ed25519', () => {
      const identity = {
        deviceId: 'test-device',
        publicKeyHex: 'a'.repeat(64),
        privateKeyHex: 'b'.repeat(64),
      };

      const payload = { type: 'HARD_BRAKE', message: 'Emergency stop' };

      const signature = signMessage(identity, payload);

      // Ed25519 signature is 64 bytes = 128 hex characters
      expect(signature).toHaveLength(128);
      expect(/^[0-9a-f]+$/.test(signature)).toBe(true);
    });

    it('should produce different signatures for different payloads', () => {
      const identity = {
        deviceId: 'test-device',
        publicKeyHex: 'a'.repeat(64),
        privateKeyHex: 'b'.repeat(64),
      };

      const sig1 = signMessage(identity, { message: 'payload1' });
      const sig2 = signMessage(identity, { message: 'payload2' });

      expect(sig1).not.toBe(sig2);
    });

    it('should produce consistent signatures for same payload', () => {
      const identity = {
        deviceId: 'test-device',
        publicKeyHex: 'a'.repeat(64),
        privateKeyHex: 'b'.repeat(64),
      };

      const payload = { message: 'consistent' };

      const sig1 = signMessage(identity, payload);
      const sig2 = signMessage(identity, payload);

      expect(sig1).toBe(sig2);
    });
  });

  describe('sendV2VMessage', () => {
    const mockIdentity = {
      deviceId: 'test-device-id',
      publicKeyHex: 'a'.repeat(64),
      privateKeyHex: 'b'.repeat(64),
    };

    it('should send message with GPS data', async () => {
      const mockGPS = { lat: 37.7749, lng: -122.4194, speed: 60, heading: 180 };
      (location.getLocation as jest.Mock).mockResolvedValueOnce(mockGPS);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message_id: 'msg-123' }),
      });

      const payload = { type: 'HAZARD_AHEAD', message: 'Pothole ahead' };
      const result = await sendV2VMessage(mockIdentity, payload);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2v/message'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.device_id).toBe('test-device-id');
      expect(callBody.public_key).toBe('a'.repeat(64));
      expect(callBody.signature).toHaveLength(128);
      expect(callBody.payload._gps).toEqual(mockGPS);
      expect(callBody.timestamp).toBeGreaterThan(0);
      expect(result.message_id).toBe('msg-123');
    });

    it('should send message without GPS if geolocation fails', async () => {
      (location.getLocation as jest.Mock).mockRejectedValueOnce(new Error('GPS unavailable'));

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message_id: 'msg-456' }),
      });

      const payload = { type: 'MERGE_SOON', message: 'Merging left' };
      await sendV2VMessage(mockIdentity, payload);

      const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.payload._gps).toBeNull();
    });

    it('should throw error on relay rejection', async () => {
      (location.getLocation as jest.Mock).mockResolvedValueOnce(null);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Invalid signature',
      });

      const payload = { type: 'TEST' };

      await expect(sendV2VMessage(mockIdentity, payload)).rejects.toThrow(
        'Relay rejected: Invalid signature'
      );
    });
  });

  describe('fetchV2VFeed', () => {
    it('should fetch feed with GPS parameters', async () => {
      const mockMessages = [
        { device_id: 'device1', payload: { type: 'HAZARD' }, distance: 0.5 },
        { device_id: 'device2', payload: { type: 'TRAFFIC' }, distance: 1.2 },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      });

      const result = await fetchV2VFeed(37.7749, -122.4194, 5000);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2v/feed?lat=37.7749&lng=-122.4194&radius=5000')
      );
      expect(result.messages).toEqual(mockMessages);
    });

    it('should throw error on failed feed fetch', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchV2VFeed(0, 0, 1000)).rejects.toThrow('Feed fetch failed');
    });

    it('should handle empty feed', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      });

      const result = await fetchV2VFeed(37.7749, -122.4194, 1000);

      expect(result.messages).toEqual([]);
    });
  });
});
