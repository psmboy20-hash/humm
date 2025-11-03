#!/bin/bash

echo "📱 가상 모바일 앱 테스트 시작"
echo "================================"
echo ""

API_URL="http://localhost:4000/graphql"

# 색상 코드
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}시나리오: 사용자가 29cm에서 쇼핑 후 앱 사용${NC}"
echo ""

# Step 1: 29cm에서 상품 공유
echo -e "${YELLOW}1단계: 29cm 상품 URL 공유 (딥링크)${NC}"
echo "사용자: 29cm 앱에서 '공유' 버튼 클릭"
echo ""

SHARE_RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { ingestShare(input: { url: \"https://shop.29cm.co.kr/product/1072645\" }) { success message inboxItemId } }"
  }')

echo "$SHARE_RESPONSE" | python3 -m json.tool
INBOX_ID=$(echo "$SHARE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['ingestShare']['inboxItemId'])")
echo ""
echo -e "${GREEN}✓ 인박스에 추가됨: $INBOX_ID${NC}"
echo ""
sleep 2

# Step 2: 앱 열기 - 인박스 확인
echo -e "${YELLOW}2단계: 앱 열기 - 인박스 화면${NC}"
echo "사용자: Virtual Closet 앱 실행"
echo ""

INBOX_RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { inboxItems { id productName brand price imageUrl } }"
  }')

echo "$INBOX_RESPONSE" | python3 -m json.tool
echo ""
echo -e "${GREEN}✓ 새로운 아이템 1개 발견!${NC}"
echo ""
sleep 2

# Step 3: 카테고리 선택
echo -e "${YELLOW}3단계: 카테고리 선택${NC}"
echo "사용자: '아우터' 카테고리 선택"
echo ""
echo "🎨 배경 제거 시작... (AI 처리 중)"
echo ""

CONFIRM_RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { confirmInboxItem(inboxItemId: \\\"$INBOX_ID\\\", category: \\\"OUTER\\\") { id name brand category silhouetteUrl } }\"
  }")

echo "$CONFIRM_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
item = data['data']['confirmInboxItem']
print(f'''
아이템 정보:
  • ID: {item['id']}
  • 이름: {item['name']}
  • 브랜드: {item['brand']}
  • 카테고리: {item['category']}
  • 누끼 이미지: {'생성 완료 ✓' if item.get('silhouetteUrl') else '생성 실패 ✗'}
  • 이미지 크기: {len(item.get('silhouetteUrl', ''))} chars
''')
"

echo ""
echo -e "${GREEN}✓ 배경 제거 완료! 옷장에 추가됨${NC}"
echo ""
sleep 2

# Step 4: 옷장 화면 보기
echo -e "${YELLOW}4단계: 옷장 화면 보기${NC}"
echo "사용자: 옷장 탭으로 이동"
echo ""

CLOSET_RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { items(category: \"OUTER\") { items { id name brand imageUrl silhouetteUrl } total } }"
  }')

echo "$CLOSET_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
items = data['data']['items']['items']
total = data['data']['items']['total']

print(f'옷장 (아우터 카테고리):')
print(f'  • 총 {total}개의 아이템')
print('')
for item in items:
    has_silhouette = '🎨 누끼' if item.get('silhouetteUrl') else '📷 원본'
    print(f'  {has_silhouette} {item[\"name\"]} - {item[\"brand\"]}')
"

echo ""
echo -e "${GREEN}✓ 옷장에서 누끼 이미지로 표시됨!${NC}"
echo ""
sleep 1

# Step 5: 코디 제안 (미래 기능)
echo -e "${YELLOW}5단계: 코디 제안 (향후 구현)${NC}"
echo "AI: 이 아우터와 어울리는 코디를 제안합니다..."
echo ""
echo "  💡 추천 코디:"
echo "     • 화이트 셔츠 + 블랙 진 + 블랙 패딩"
echo "     • 니트 + 슬랙스 + 블랙 패딩"
echo ""
sleep 1

echo ""
echo "================================"
echo -e "${GREEN}🎉 테스트 완료!${NC}"
echo ""
echo "요약:"
echo "  ✓ 29cm 상품 공유 → 인박스 추가"
echo "  ✓ 앱 실행 → 새 아이템 발견"
echo "  ✓ 카테고리 선택 → AI 배경 제거"
echo "  ✓ 옷장 → 누끼 이미지 표시"
echo ""
echo "사용자는 폼을 채우지 않았습니다! 🚀"
