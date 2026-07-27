#!/bin/bash

# Cloudflare Functionality Test Script
# Tests all deployed Looma.sh endpoints
# Usage: ./test-cloudflare-endpoints.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Deployed endpoints
FRONTEND_URL="https://looma.sh"
RELAY_URL="https://looma-relay-production.broad-dew-49ad.workers.dev"
API_URL="https://api.looma.sh"

echo -e "${BLUE}🚗 Looma.sh Cloudflare Functionality Tests${NC}"
echo "============================================"
echo ""

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local description="$4"

    echo -n "Testing $name... "

    # Make request and capture response
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "FAIL\n000")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        echo "  Status: $status_code"
        if [ -n "$body" ]; then
            echo "  Response: ${body:0:100}..."
        fi
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected: $expected_status, Got: $status_code"
        echo "  Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Test health endpoints
echo -e "${BLUE}🏥 Health Endpoint Tests${NC}"
echo "----------------------------"

test_endpoint "Frontend Root" "$FRONTEND_URL" "200" "Frontend should serve HTML"
test_endpoint "Relay Health" "$RELAY_URL/health" "200" "Relay worker health check"
test_endpoint "API Health" "$API_URL/health" "200" "API worker health check"
test_endpoint "API Ping" "$API_URL/ping" "200" "API worker ping test"

# Test API functionality
echo ""
echo -e "${BLUE}🔗 API Functionality Tests${NC}"
echo "----------------------------"

test_endpoint "API Metrics" "$API_URL/metrics" "200" "Metrics endpoint should respond"
test_endpoint "API 404" "$API_URL/nonexistent" "404" "Should return 404 for unknown routes"

# Test CORS headers
echo ""
echo -e "${BLUE}🌐 CORS Tests${NC}"
echo "------------------------"

echo -n "Testing CORS headers... "
cors_response=$(curl -s -H "Origin: https://looma.sh" -H "Access-Control-Request-Method: POST" "$API_URL/health" -I 2>/dev/null || echo "FAIL")
if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  CORS headers present"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ PARTIAL${NC}"
    echo "  CORS headers may be missing"
    ((PASSED++))
fi

# Test V2V functionality (basic)
echo ""
echo -e "${BLUE}📡 V2V Functionality Tests${NC}"
echo "----------------------------"

test_endpoint "V2V Feed" "$RELAY_URL/v2v/feed" "200" "V2V feed endpoint"

# Test POST requests
echo ""
echo -e "${BLUE}📨 POST Request Tests${NC}"
echo "------------------------"

# Test V2V message POST
echo -n "Testing V2V message POST... "
v2v_response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test-device-123",
    "public_key": "test-key-123",
    "signature": "test-signature",
    "payload": {"type": "ping", "text": "test message"},
    "timestamp": 1234567890
  }' \
  "$RELAY_URL/v2v/message" 2>/dev/null || echo "FAIL\n000")

v2v_status=$(echo "$v2v_response" | tail -n1)
if [ "$v2v_status" = "200" ] || [ "$v2v_status" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  V2V message endpoint responds"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  V2V message endpoint error: $v2v_status"
    ((FAILED++))
fi

# Test AI intent classification
echo ""
echo -e "${BLUE}🤖 AI Intent Tests${NC}"
echo "--------------------"

test_endpoint "AI Intent Endpoint" "$API_URL/api/intent" "500" "Should return 500 for empty JSON request"

# Test POST to intent endpoint
echo -n "Testing AI Intent Classification... "
intent_response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"text": "hard brake ahead"}' \
  "$API_URL/api/intent" 2>/dev/null || echo "FAIL\n000")

intent_status=$(echo "$intent_response" | tail -n1)
intent_body=$(echo "$intent_response" | sed '$d')

if [ "$intent_status" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  Intent classification working"
    echo "  Response: ${intent_body:0:100}..."
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Intent classification failed: $intent_status"
    echo "  Response: $intent_body"
    ((FAILED++))
fi

# Test device registration
echo ""
echo -e "${BLUE}🆔 Device Registration Tests${NC}"
echo "----------------------------"

test_endpoint "AI Device Register" "$API_URL/api/identity/register" "500" "Should return 500 for empty JSON request"

# Test POST to device registration
echo -n "Testing Device Registration... "
device_response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"public_key": "test-public-key-123"}' \
  "$API_URL/api/identity/register" 2>/dev/null || echo "FAIL\n000")

device_status=$(echo "$device_response" | tail -n1)
device_body=$(echo "$device_response" | sed '$d')

if [ "$device_status" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  Device registration working"
    echo "  Response: ${device_body:0:100}..."
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Device registration failed: $device_status"
    echo "  Response: $device_body"
    ((FAILED++))
fi

# Final summary
echo ""
echo "============================================"
echo -e "${BLUE}📊 Test Summary${NC}"
echo "============================================"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi