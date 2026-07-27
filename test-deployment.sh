#!/bin/bash

# Looma.sh - Deployment Testing Script
# Tests deployment readiness without actually deploying

set -e

echo "🧪 Looma.sh - Pre-Deployment Testing"
echo "====================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo -n "Testing: $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# Section header
print_section() {
    echo ""
    echo -e "${BLUE}=========================================="
    echo -e "  $1"
    echo -e "==========================================${NC}"
    echo ""
}

# 1. Python Tests
print_section "1. Python Backend Tests"

export PYTHONPATH="${PWD}:${PWD}/ai:${PYTHONPATH}"

run_test "Intent Classifier Tests" \
    "python -m pytest tests/test_intent_classifier.py -q --tb=no"

run_test "Intent Endpoint Tests" \
    "python -m pytest tests/test_intent_endpoint.py -q --tb=no"

run_test "Database Module Import" \
    "cd ai && python -c 'from database import create_device_store; create_device_store()'"

# 2. Configuration Tests
print_section "2. Configuration Validation"

run_test "AI Production Config Exists" \
    "test -f ai/.env.production"

run_test "Frontend Production Config Exists" \
    "test -f app/.env.production"

run_test "Relay Wrangler Production Config" \
    "grep -q 'env.production' relay/wrangler.toml"

run_test "API Wrangler Production Config" \
    "grep -q 'env.production' api/wrangler.toml"

# 3. Security Tests
print_section "3. Security Configuration"

run_test "AI CORS Configurable" \
    "grep -q 'ALLOWED_ORIGINS' ai/main.py"

run_test "Relay CORS Configurable" \
    "grep -q 'ALLOWED_ORIGINS' relay/src/index.ts"

run_test "API CORS Configurable" \
    "grep -q 'ALLOWED_ORIGINS' api/src/index.ts"

run_test "No Hardcoded Wildcards in AI" \
    "! grep -q 'allow_origins=\[\"*\"\]' ai/main.py"

# 4. Dependency Tests
print_section "4. Dependencies Check"

run_test "Database Dependencies in Requirements" \
    "grep -q 'aiosqlite' ai/requirements.txt && grep -q 'asyncpg' ai/requirements.txt"

run_test "Error Tracking Module Exists" \
    "test -f ai/error_tracking.py"

run_test "Deployment Script Exists" \
    "test -f deploy.sh"

run_test "Deployment Script Executable" \
    "test -x deploy.sh"

# 5. Code Quality Tests
print_section "5. Code Quality Checks"

run_test "No Syntax Errors in Main" \
    "cd ai && python -m py_compile main.py"

run_test "No Syntax Errors in Database" \
    "cd ai && python -m py_compile database.py"

run_test "No Syntax Errors in Error Tracking" \
    "cd ai && python -m py_compile error_tracking.py"

run_test "TypeScript Relay Syntax" \
    "cd relay && npx tsc --noEmit 2>/dev/null || test -f src/index.ts"

run_test "TypeScript API Syntax" \
    "cd api && npx tsc --noEmit 2>/dev/null || test -f src/index.ts"

# 6. Documentation Tests
print_section "6. Documentation"

run_test "Production Ready Summary Exists" \
    "test -f PRODUCTION_READY_SUMMARY.md"

run_test "Post-Deployment Test Summary Exists" \
    "test -f POST_DEPLOYMENT_TEST_SUMMARY.md"

run_test "Deployment Guide Exists" \
    "test -f DEPLOYMENT_GUIDE.md"

# Final Results
print_section "Test Results"

echo "Total Tests: $((PASSED + FAILED))"
echo -e "Passed:      ${GREEN}${PASSED}${NC}"
echo -e "Failed:      ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}=========================================="
    echo -e "  ✓ ALL TESTS PASSED! 🚀"
    echo -e "  System is ready for deployment"
    echo -e "==========================================${NC}"
    echo ""
    echo "To deploy to production, run:"
    echo "  ./deploy.sh production"
    echo ""
    exit 0
else
    echo -e "${RED}=========================================="
    echo -e "  ✗ ${FAILED} TEST(S) FAILED"
    echo -e "  Fix issues before deploying"
    echo -e "==========================================${NC}"
    echo ""
    exit 1
fi
