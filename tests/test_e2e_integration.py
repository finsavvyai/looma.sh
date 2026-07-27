"""
E2E Integration Tests for Looma.sh Platform

Tests the complete flow:
1. AI Service - Device registration and intent classification
2. Relay Service - Message submission and feed retrieval
3. Frontend - Identity generation and V2V messaging
"""

import pytest
import requests
import time
import json
from typing import Dict, Any
from ed25519 import SigningKey, VerifyingKey


# Test configuration
AI_BASE = "http://127.0.0.1:9000"
RELAY_BASE = "http://127.0.0.1:8787"


class TestE2EIntegration:
    """End-to-end integration tests"""

    @pytest.fixture
    def ed25519_keypair(self):
        """Generate Ed25519 keypair for testing"""
        signing_key = SigningKey.generate()
        verifying_key = signing_key.get_verifying_key()
        return {
            "private_key": signing_key.to_bytes().hex(),
            "public_key": verifying_key.to_bytes().hex(),
            "signing_key": signing_key,
        }

    @pytest.fixture
    def registered_device(self, ed25519_keypair):
        """Register a device with AI service"""
        response = requests.post(
            f"{AI_BASE}/identity/register",
            json={
                "public_key": ed25519_keypair["public_key"],
                "car_model": "Tesla Model 3",
                "nickname": "Test Vehicle",
            },
        )
        assert response.status_code == 200
        device = response.json()
        device["private_key"] = ed25519_keypair["private_key"]
        device["signing_key"] = ed25519_keypair["signing_key"]
        return device

    def test_complete_v2v_flow(self, registered_device):
        """Test complete V2V message flow from device to feed"""

        # Step 1: Device sends V2V message
        payload = {
            "type": "HARD_BRAKE",
            "message": "Emergency stop ahead",
            "_gps": {
                "lat": 37.7749,
                "lng": -122.4194,
                "speed": 0,
                "heading": 0,
            },
        }

        # Sign the payload
        payload_bytes = json.dumps(payload).encode()
        signature = registered_device["signing_key"].sign(payload_bytes).hex()

        # Submit to relay
        submit_response = requests.post(
            f"{RELAY_BASE}/v2v/message",
            json={
                "device_id": registered_device["device_id"],
                "public_key": registered_device["public_key"],
                "signature": signature,
                "payload": payload,
                "timestamp": int(time.time() * 1000),
            },
        )

        assert submit_response.status_code == 202
        submit_data = submit_response.json()
        assert submit_data["status"] == "received"
        assert "message_id" in submit_data

        # Step 2: Retrieve message from feed
        feed_response = requests.get(
            f"{RELAY_BASE}/v2v/feed",
            params={"lat": 37.7749, "lng": -122.4194, "radius": 1000},
        )

        assert feed_response.status_code == 200
        feed_data = feed_response.json()
        assert feed_data["count"] > 0

        # Find our message in the feed
        our_message = next(
            (m for m in feed_data["messages"]
             if m["device_id"] == registered_device["device_id"]),
            None,
        )
        assert our_message is not None
        assert our_message["payload"]["type"] == "HARD_BRAKE"
        assert our_message["verified"] is True

    def test_intent_classification_integration(self):
        """Test intent classification through AI service"""

        test_cases = [
            {
                "text": "hard brake",
                "expected_intent": "HARD_BRAKE_AHEAD",
                "expected_severity": "danger",
            },
            {
                "text": "merge soon",
                "expected_intent": "MERGE_SOON",
                "expected_severity": "warning",
            },
            {
                "text": "hazard on road",
                "expected_intent": "HAZARD_AHEAD",
                "expected_severity": "danger",
            },
            {
                "text": "traffic jam",
                "expected_intent": "TRAFFIC_AHEAD",
                "expected_severity": "warning",
            },
            {
                "text": "random message",
                "expected_intent": "GENERIC_MESSAGE",
                "expected_severity": "generic",
            },
        ]

        for case in test_cases:
            response = requests.post(
                f"{AI_BASE}/intent",
                json={"text": case["text"]},
            )
            assert response.status_code == 200
            result = response.json()

            assert result["intent_code"] == case["expected_intent"]
            assert result["severity"] == case["expected_severity"]
            assert result["confidence"] > 0
            assert result["original_text"] == case["text"]

    def test_multiple_devices_communication(self, ed25519_keypair):
        """Test multiple devices registering and communicating"""

        # Register multiple devices
        devices = []
        for i in range(3):
            signing_key = SigningKey.generate()
            verifying_key = signing_key.get_verifying_key()

            response = requests.post(
                f"{AI_BASE}/identity/register",
                json={
                    "public_key": verifying_key.to_bytes().hex(),
                    "car_model": f"Car {i+1}",
                    "nickname": f"Vehicle {i+1}",
                },
            )
            assert response.status_code == 200
            device = response.json()
            device["signing_key"] = signing_key
            devices.append(device)

        # Each device sends a message
        message_types = ["HARD_BRAKE", "MERGE_SOON", "HAZARD_AHEAD"]
        for idx, device in enumerate(devices):
            payload = {
                "type": message_types[idx],
                "message": f"Message from device {idx+1}",
                "_gps": {
                    "lat": 37.7749 + (idx * 0.001),  # Slightly different locations
                    "lng": -122.4194,
                    "speed": 10 * idx,
                    "heading": 90,
                },
            }

            payload_bytes = json.dumps(payload).encode()
            signature = device["signing_key"].sign(payload_bytes).hex()

            response = requests.post(
                f"{RELAY_BASE}/v2v/message",
                json={
                    "device_id": device["device_id"],
                    "public_key": device["public_key"],
                    "signature": signature,
                    "payload": payload,
                    "timestamp": int(time.time() * 1000),
                },
            )
            assert response.status_code == 202

        # Retrieve feed and verify all messages
        feed_response = requests.get(
            f"{RELAY_BASE}/v2v/feed",
            params={"lat": 37.7749, "lng": -122.4194, "radius": 500},
        )

        assert feed_response.status_code == 200
        feed_data = feed_response.json()

        # Should have at least the 3 messages we sent
        assert feed_data["count"] >= 3

        # Verify each device's message is in the feed
        device_ids = {d["device_id"] for d in devices}
        feed_device_ids = {m["device_id"] for m in feed_data["messages"]}
        assert device_ids.issubset(feed_device_ids)

    def test_device_registration_persistence(self, ed25519_keypair):
        """Test that device registration is idempotent"""

        public_key = ed25519_keypair["public_key"]

        # Register device first time
        response1 = requests.post(
            f"{AI_BASE}/identity/register",
            json={
                "public_key": public_key,
                "car_model": "BMW X5",
                "nickname": "My Car",
            },
        )
        assert response1.status_code == 200
        device1 = response1.json()

        # Register same device again (same public key)
        response2 = requests.post(
            f"{AI_BASE}/identity/register",
            json={
                "public_key": public_key,
                "car_model": "BMW X5 Updated",
                "nickname": "My Car Updated",
            },
        )
        assert response2.status_code == 200
        device2 = response2.json()

        # Should return same device_id
        assert device1["device_id"] == device2["device_id"]
        assert device1["public_key"] == device2["public_key"]

    def test_proximity_filtering(self, registered_device):
        """Test that feed correctly filters by proximity"""

        # Send message from registered device at specific location
        near_location = {"lat": 37.7749, "lng": -122.4194}
        payload_near = {
            "type": "HAZARD_AHEAD",
            "message": "Nearby hazard",
            "_gps": {**near_location, "speed": 0, "heading": 0},
        }

        payload_bytes = json.dumps(payload_near).encode()
        signature = registered_device["signing_key"].sign(payload_bytes).hex()

        requests.post(
            f"{RELAY_BASE}/v2v/message",
            json={
                "device_id": registered_device["device_id"],
                "public_key": registered_device["public_key"],
                "signature": signature,
                "payload": payload_near,
                "timestamp": int(time.time() * 1000),
            },
        )

        # Query from nearby location (should include message)
        feed_near = requests.get(
            f"{RELAY_BASE}/v2v/feed",
            params={
                "lat": near_location["lat"],
                "lng": near_location["lng"],
                "radius": 1000,  # 1km
            },
        ).json()

        # Query from far location (should NOT include message)
        feed_far = requests.get(
            f"{RELAY_BASE}/v2v/feed",
            params={
                "lat": 40.7128,  # New York (far from SF)
                "lng": -74.0060,
                "radius": 1000,
            },
        ).json()

        # Verify proximity filtering
        near_message_ids = {m["device_id"] for m in feed_near["messages"]}
        far_message_ids = {m["device_id"] for m in feed_far["messages"]}

        assert registered_device["device_id"] in near_message_ids
        assert registered_device["device_id"] not in far_message_ids

    def test_health_endpoints(self):
        """Test all health/status endpoints"""

        # AI Service health
        ai_health = requests.get(f"{AI_BASE}/health")
        assert ai_health.status_code == 200
        assert ai_health.json()["status"] == "ok"

        # Relay ping
        relay_ping = requests.get(f"{RELAY_BASE}/ping")
        assert relay_ping.status_code == 200
        assert relay_ping.json()["status"] == "ok"

        # Relay health
        relay_health = requests.get(f"{RELAY_BASE}/health")
        assert relay_health.status_code == 200
        assert relay_health.json()["status"] == "ok"

    def test_concurrent_message_submission(self, registered_device):
        """Test system under concurrent load"""
        import concurrent.futures

        def send_message(idx):
            payload = {
                "type": "TRAFFIC_AHEAD",
                "message": f"Message {idx}",
                "_gps": {"lat": 37.7749, "lng": -122.4194, "speed": 20, "heading": 90},
            }

            payload_bytes = json.dumps(payload).encode()
            signature = registered_device["signing_key"].sign(payload_bytes).hex()

            response = requests.post(
                f"{RELAY_BASE}/v2v/message",
                json={
                    "device_id": registered_device["device_id"],
                    "public_key": registered_device["public_key"],
                    "signature": signature,
                    "payload": payload,
                    "timestamp": int(time.time() * 1000),
                },
            )
            return response.status_code

        # Send 10 concurrent messages
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(send_message, i) for i in range(10)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        # All should succeed
        assert all(status == 202 for status in results)

    def test_invalid_signature_rejection(self, registered_device):
        """Test that relay rejects invalid signatures"""

        payload = {
            "type": "TEST",
            "message": "Test message",
            "_gps": {"lat": 37.7749, "lng": -122.4194, "speed": 0, "heading": 0},
        }

        # Use wrong signature
        invalid_signature = "a" * 128  # Invalid hex signature

        response = requests.post(
            f"{RELAY_BASE}/v2v/message",
            json={
                "device_id": registered_device["device_id"],
                "public_key": registered_device["public_key"],
                "signature": invalid_signature,
                "payload": payload,
                "timestamp": int(time.time() * 1000),
            },
        )

        assert response.status_code == 400
        assert "signature" in response.json()["error"].lower()


@pytest.mark.skipif(
    not all([
        requests.get(f"{AI_BASE}/health", timeout=1).status_code == 200,
        requests.get(f"{RELAY_BASE}/ping", timeout=1).status_code == 200,
    ]),
    reason="Services not running"
)
class TestE2EWithServicesRunning(TestE2EIntegration):
    """Run E2E tests only if services are running"""
    pass
