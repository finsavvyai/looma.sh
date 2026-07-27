import pytest
from fastapi.testclient import TestClient
from ai.main import app

client = TestClient(app)


class TestIntentEndpoint:
    """Integration tests for /intent API endpoint."""
    
    # Valid Request Tests
    
    def test_post_intent_with_valid_text(self):
        """Test POST /intent returns 200 with valid text."""
        response = client.post("/intent", json={"text": "hard brake ahead"})
        assert response.status_code == 200
    
    def test_response_contains_required_fields(self):
        """Test response contains all required fields."""
        response = client.post("/intent", json={"text": "hard brake"})
        data = response.json()
        
        assert "intent_code" in data
        assert "original_text" in data
        assert "severity" in data
        assert "category" in data
        assert "description" in data
        assert "confidence" in data
    
    def test_response_preserves_original_text(self):
        """Test response preserves original input text."""
        original_text = "HARD BRAKE AHEAD"
        response = client.post("/intent", json={"text": original_text})
        data = response.json()
        
        assert data["original_text"] == original_text
    
    # Classification Accuracy Tests
    
    def test_hard_brake_classification(self):
        """Test hard brake messages are classified correctly."""
        test_cases = [
            "hard brake",
            "emergency brake ahead",
            "panic brake now",
            "slamming brakes"
        ]
        
        for text in test_cases:
            response = client.post("/intent", json={"text": text})
            data = response.json()
            assert data["intent_code"] == "HARD_BRAKE_AHEAD"
            assert data["severity"] == "danger"
            assert data["category"] == "brake"
    
    def test_merge_classification(self):
        """Test merge messages are classified correctly."""
        test_cases = [
            "merge ahead",
            "merging left",
            "changing lanes",
            "lane change"
        ]
        
        for text in test_cases:
            response = client.post("/intent", json={"text": text})
            data = response.json()
            assert data["intent_code"] == "MERGE_SOON"
            assert data["severity"] == "warning"
            assert data["category"] == "merge"
    
    def test_hazard_classification(self):
        """Test hazard messages are classified correctly."""
        test_cases = [
            "hazard ahead",
            "debris on road",
            "obstacle",
            "danger ahead"
        ]
        
        for text in test_cases:
            response = client.post("/intent", json={"text": text})
            data = response.json()
            assert data["intent_code"] == "HAZARD_AHEAD"
            assert data["severity"] == "danger"
    
    def test_traffic_classification(self):
        """Test traffic messages are classified correctly."""
        test_cases = [
            "traffic ahead",
            "slow down",
            "congestion",
            "traffic jam"
        ]
        
        for text in test_cases:
            response = client.post("/intent", json={"text": text})
            data = response.json()
            assert data["intent_code"] == "TRAFFIC_AHEAD"
            assert data["severity"] == "warning"
    
    def test_weather_classification(self):
        """Test weather messages are classified correctly."""
        test_cases = [
            "heavy rain",
            "fog ahead",
            "icy road",
            "wet road conditions"
        ]
        
        for text in test_cases:
            response = client.post("/intent", json={"text": text})
            data = response.json()
            assert data["intent_code"] == "WEATHER_HAZARD"
            assert data["severity"] == "warning"
    
    def test_generic_classification(self):
        """Test unmatched messages return GENERIC_MESSAGE."""
        test_cases = [
            "hello world",
            "good morning",
            "test message"
        ]
        
        for text in test_cases:
            response = client.post("/intent", json={"text": text})
            data = response.json()
            assert data["intent_code"] == "GENERIC_MESSAGE"
            assert data["severity"] == "generic"
            assert data["confidence"] == 0.5
    
    # Error Handling Tests
    
    def test_empty_text_returns_400(self):
        """Test empty text returns 400 Bad Request."""
        response = client.post("/intent", json={"text": ""})
        assert response.status_code == 400
        assert "empty" in response.json()["detail"].lower()
    
    def test_whitespace_only_returns_400(self):
        """Test whitespace-only text returns 400."""
        response = client.post("/intent", json={"text": "   "})
        assert response.status_code == 400
    
    def test_missing_text_field_returns_422(self):
        """Test missing text field returns 422 Unprocessable Entity."""
        response = client.post("/intent", json={})
        assert response.status_code == 422
    
    def test_invalid_json_returns_422(self):
        """Test invalid JSON returns 422."""
        response = client.post(
            "/intent",
            data="not json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_null_text_returns_422(self):
        """Test null text value returns 422."""
        response = client.post("/intent", json={"text": None})
        assert response.status_code == 422
    
    # Confidence Score Tests
    
    def test_exact_match_high_confidence(self):
        """Test exact matches have high confidence."""
        response = client.post("/intent", json={"text": "merge"})
        data = response.json()
        assert data["confidence"] >= 0.7
    
    def test_substring_match_moderate_confidence(self):
        """Test substring matches have moderate confidence."""
        response = client.post("/intent", json={"text": "there is a merge ahead"})
        data = response.json()
        assert 0.5 < data["confidence"] < 0.8
    
    def test_confidence_in_valid_range(self):
        """Test confidence is always between 0.0 and 1.0."""
        test_cases = [
            "hard brake",
            "merge",
            "traffic",
            "hello world"
        ]
        
        for text in test_cases:
            response = client.post("/intent", json={"text": text})
            data = response.json()
            assert 0.0 <= data["confidence"] <= 1.0
    
    # Concurrent Request Tests
    
    def test_concurrent_requests(self):
        """Test handling multiple concurrent requests."""
        import concurrent.futures
        
        def make_request(text):
            response = client.post("/intent", json={"text": text})
            return response.status_code, response.json()
        
        test_texts = [
            "hard brake",
            "merge ahead",
            "traffic jam",
            "heavy rain",
            "hazard ahead"
        ] * 10  # 50 requests
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(make_request, test_texts))
        
        # All requests should succeed
        for status_code, data in results:
            assert status_code == 200
            assert "intent_code" in data
    
    # Backward Compatibility Tests
    
    def test_backward_compatible_response(self):
        """Test response includes original fields for backward compatibility."""
        response = client.post("/intent", json={"text": "hard brake"})
        data = response.json()
        
        # Original fields that existed before
        assert "intent_code" in data
        assert "original_text" in data
        
        # New fields added
        assert "severity" in data
        assert "category" in data
        assert "description" in data
        assert "confidence" in data
    
    # Case Sensitivity Tests
    
    def test_case_insensitive_classification(self):
        """Test classification is case-insensitive."""
        test_cases = [
            ("HARD BRAKE", "HARD_BRAKE_AHEAD"),
            ("hard brake", "HARD_BRAKE_AHEAD"),
            ("Hard Brake", "HARD_BRAKE_AHEAD"),
            ("MERGE", "MERGE_SOON"),
            ("merge", "MERGE_SOON")
        ]
        
        for text, expected_intent in test_cases:
            response = client.post("/intent", json={"text": text})
            data = response.json()
            assert data["intent_code"] == expected_intent
    
    # Health Check Test
    
    def test_health_endpoint(self):
        """Test health endpoint is accessible."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
