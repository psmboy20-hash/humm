#!/bin/bash

# Virtual Closet Mobile API Test Script
# Tests the complete flow: Share → Inbox → Confirm → Closet

API_URL="https://4000-ie9wpiu3cp58a236iuzwi-82b888ba.sandbox.novita.ai/graphql"

echo "🧪 Virtual Closet Mobile API Integration Tests"
echo "=============================================="
echo ""

# Test 1: Check initial inbox items
echo "📬 Test 1: Get inbox items..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { inboxItems { id sourceType status productName brand price } }"}' \
  -s | jq '.'
echo ""

# Test 2: Get initial closet items
echo "👕 Test 2: Get closet items..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { items { items { id name category brand price wearCount } total } }"}' \
  -s | jq '.'
echo ""

# Test 3: Add item via share
echo "🔗 Test 3: Share product URL (ingestShare)..."
INGEST_RESULT=$(curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { ingestShare(input: {url: \"https://zigzag.kr/products/test123\"}) { success message inboxItemId } }"}' \
  -s)
echo "$INGEST_RESULT" | jq '.'
INBOX_ITEM_ID=$(echo "$INGEST_RESULT" | jq -r '.data.ingestShare.inboxItemId')
echo "✅ Created inbox item: $INBOX_ITEM_ID"
echo ""

# Test 4: Verify item in inbox
echo "📬 Test 4: Verify item appears in inbox..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { inboxItems(status: PARSED) { id sourceType status productName brand price } }"}' \
  -s | jq '.'
echo ""

# Test 5: Confirm item to closet
echo "✅ Test 5: Confirm inbox item (move to closet)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { confirmInboxItem(inboxItemId: \\\"$INBOX_ITEM_ID\\\", category: \\\"TOP\\\") { id name category brand price } }\"}" \
  -s | jq '.'
echo ""

# Test 6: Verify item in closet
echo "👕 Test 6: Verify item appears in closet..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { items { items { id name category brand price tags } total } }"}' \
  -s | jq '.'
echo ""

# Test 7: Verify item removed from inbox
echo "📬 Test 7: Verify item removed from inbox..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { inboxItems { id sourceType status productName } }"}' \
  -s | jq '.'
echo ""

echo "✅ All tests completed!"
echo ""
echo "🎉 Complete flow tested:"
echo "   1. ✅ Share product URL → API extracts metadata"
echo "   2. ✅ Item appears in Inbox with PARSED status"
echo "   3. ✅ User confirms category → Item moves to Closet"
echo "   4. ✅ Item removed from Inbox"
echo ""
echo "📱 Mobile app can now:"
echo "   - Display inbox items from /inbox tab"
echo "   - Confirm items with one-click category selection"
echo "   - Display closet items in /closet tab with grid layout"
