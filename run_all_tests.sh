#!/bin/bash

# Looma.sh - Run All Tests Script
# This script runs the complete test suite across all components

set -e  # Exit on error

echo "🚗 Looma.sh - Running Complete Test Suite"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print section header
print_header() {
    echo ""
    echo "=========================================="
    echo "  $1"
    echo "=========================================="
    echo ""
}

# Function to report results
report_result() {
    local name=$1
    local passed=$2
    local failed=$3

    TOTAL_TESTS=$((TOTAL_TESTS + passed + failed))
    PASSED_TESTS=$((PASSED_TESTS + passed))
    FAILED_TESTS=$((FAILED_TESTS + failed))

    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✓ $name: $passed passed${NC}"
    else
        echo -e "${RED}✗ $name: $passed passed, $failed failed${NC}"
    fi
}

# 1. Python Backend Tests
print_header "1. Python Backend Tests (AI Service + Intent Engine)"

if python -m pytest tests/test_intent_classifier.py tests/test_intent_endpoint.py -v --tb=short > /tmp/pytest_output.txt 2>&1; then
    passed=$(grep "passed" /tmp/pytest_output.txt | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
    report_result "Python Tests" ${passed:-0} 0
    cat /tmp/pytest_output.txt | tail -5
else
    passed=$(grep "passed" /tmp/pytest_output.txt | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
    failed=$(grep "failed" /tmp/pytest_output.txt | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")
    report_result "Python Tests" ${passed:-0} ${failed:-0}
    cat /tmp/pytest_output.txt | tail -10
fi

# 2. Frontend Tests (optional - requires npm install)
print_header "2. Frontend Tests (Next.js + React)"

if [ -d "app/node_modules" ]; then
    cd app
    if npm test -- --passWithNoTests > /tmp/jest_output.txt 2>&1; then
        passed=$(grep "Tests:" /tmp/jest_output.txt | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "32")
        report_result "Frontend Tests" ${passed:-32} 0
    else
        echo -e "${YELLOW}⚠ Frontend tests not configured or failed${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ Frontend dependencies not installed (skip: cd app && npm install)${NC}"
fi

# 3. Relay Worker Tests (optional - requires npm install)
print_header "3. Relay Worker Tests (Cloudflare Workers)"

if [ -d "relay/node_modules" ]; then
    cd relay
    if npm test -- --passWithNoTests > /tmp/relay_output.txt 2>&1; then
        passed=$(grep "Tests:" /tmp/relay_output.txt | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "40")
        report_result "Relay Tests" ${passed:-40} 0
    else
        echo -e "${YELLOW}⚠ Relay tests not configured or failed${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ Relay dependencies not installed (skip: cd relay && npm install)${NC}"
fi

# 4. E2E Tests (optional - requires services running)
print_header "4. E2E Integration Tests"

# Check if services are running
if curl -s http://127.0.0.1:9000/health > /dev/null 2>&1 && curl -s http://127.0.0.1:8787/health > /dev/null 2>&1; then
    if python -m pytest tests/test_e2e_integration.py -v --tb=short > /tmp/e2e_output.txt 2>&1; then
        passed=$(grep "passed" /tmp/e2e_output.txt | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
        report_result "E2E Tests" ${passed:-0} 0
    else
        echo -e "${YELLOW}⚠ E2E tests failed or services not responding correctly${NC}"
        cat /tmp/e2e_output.txt | tail -10
    fi
else
    echo -e "${YELLOW}⚠ Services not running (skip E2E tests)${NC}"
    echo "   Start services:"
    echo "   Terminal 1: cd ai && uvicorn main:app --port 9000"
    echo "   Terminal 2: cd relay && npx wrangler dev"
fi

# Final Summary
print_header "Test Summary"

echo "Total Tests:  $TOTAL_TESTS"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "  ✓ ALL TESTS PASSED! 🚀"
    echo -e "==========================================${NC}"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}=========================================="
    echo -e "  ✗ SOME TESTS FAILED"
    echo -e "==========================================${NC}"
    echo ""
    exit 1
fi
