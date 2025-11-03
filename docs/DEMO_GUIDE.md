# 📱 Virtual Closet 데모 가이드

## 🎉 이제 사진이 보입니다!

서버를 업데이트해서 실제 이미지 URL을 추가했습니다!

---

## 🔗 데모 링크

### 옷장 그리드 데모
**URL**: https://3000-ie9wpiu3cp58a236iuzwi-82b888ba.sandbox.novita.ai/demo-closet-grid.html

### API 엔드포인트
**URL**: https://4000-ie9wpiu3cp58a236iuzwi-82b888ba.sandbox.novita.ai/graphql

---

## 👕 현재 옷장에 있는 아이템

### 1. 화이트 셔츠 (Uniqlo)
- **카테고리**: 상의 (TOP)
- **사이즈**: L
- **색상**: White
- **가격**: 29,000원
- **착용 횟수**: 3회
- **이미지**: ✅ Unsplash 실제 셔츠 사진

### 2. 블랙 진 (Levi's)
- **카테고리**: 하의 (BOTTOM)
- **사이즈**: 32
- **색상**: Black
- **가격**: 89,000원
- **착용 횟수**: 8회 🔥 (인기 아이템!)
- **이미지**: ✅ Unsplash 실제 청바지 사진

### 3. 가죽 자켓 (Zara)
- **카테고리**: 아우터 (OUTER)
- **사이즈**: L
- **색상**: Black
- **가격**: 129,000원
- **착용 횟수**: 5회 🔥 (인기 아이템!)
- **이미지**: ✅ Unsplash 실제 자켓 사진

---

## 🎨 데모 화면 기능

### 1. 반응형 그리드
브라우저 창 크기를 조절하면:
- **PC (넓은 화면)**: 4열 그리드
- **태블릿 (중간)**: 3열 그리드
- **모바일 (좁은)**: 2열 그리드

### 2. 카테고리 필터
상단 필터 버튼을 클릭하면:
- **전체**: 모든 아이템 (3개)
- **상의**: 화이트 셔츠만 (1개)
- **하의**: 블랙 진만 (1개)
- **아우터**: 가죽 자켓만 (1개)
- **신발**: 아직 없음 (0개)

### 3. 통계 카드
실시간으로 업데이트되는 통계:
- **아이템**: 현재 필터된 개수
- **카테고리**: 전체 카테고리 수
- **총 착용**: 모든 아이템의 착용 횟수 합계 (3+8+5=16)

### 4. 인기 배지 🔥
착용 횟수가 5회 이상인 아이템에 표시:
- 블랙 진: 8회 🔥
- 가죽 자켓: 5회 🔥

### 5. API 상태 표시
상단 파란색 카드:
- ✅ API 연결 완료 (3개 아이템) ← 성공
- 🔵 API 연결 중... ← 로딩
- ❌ API 연결 실패 ← 오류

---

## 🧪 직접 테스트해보기

### 테스트 1: 카테고리 필터링
1. "전체" 버튼 클릭 → 3개 아이템 표시
2. "상의" 버튼 클릭 → 화이트 셔츠만 표시
3. "하의" 버튼 클릭 → 블랙 진만 표시
4. "아우터" 버튼 클릭 → 가죽 자켓만 표시

### 테스트 2: 반응형 그리드
1. 브라우저 창을 최대화 → 4열 그리드
2. 창 너비를 좁게 조절 → 3열로 변경
3. 더 좁게 조절 → 2열로 변경
4. F12 개발자 도구 → 모바일 모드로 변경

### 테스트 3: 새 아이템 추가 (API 직접 호출)

#### 3-1. 인박스에 아이템 추가
```bash
curl -X POST https://4000-ie9wpiu3cp58a236iuzwi-82b888ba.sandbox.novita.ai/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { ingestShare(input: {url: \"https://zigzag.kr/products/new123\"}) { success inboxItemId message } }"}'
```

**응답**:
```json
{
  "data": {
    "ingestShare": {
      "success": true,
      "inboxItemId": "inbox_1761908123456",
      "message": "상품 정보를 가져왔습니다. 인박스에서 확인해주세요."
    }
  }
}
```

#### 3-2. 인박스 확인
```bash
curl -X POST https://4000-ie9wpiu3cp58a236iuzwi-82b888ba.sandbox.novita.ai/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { inboxItems { id productName brand price status } }"}'
```

#### 3-3. 옷장에 추가 (카테고리 확인)
```bash
curl -X POST https://4000-ie9wpiu3cp58a236iuzwi-82b888ba.sandbox.novita.ai/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { confirmInboxItem(inboxItemId: \"inbox_1761908123456\", category: \"SHOES\") { id name category } }"}'
```

#### 3-4. 데모 페이지 새로고침
→ 새 아이템이 옷장에 나타납니다!

---

## 🎯 화면 구성 상세

### 헤더 (Header)
```
┌─────────────────────────────────┐
│ 내 옷장                    🔍 ⚙️ │
└─────────────────────────────────┘
```
- 제목: "내 옷장" (28sp bold)
- 검색 아이콘 (🔍)
- 설정 아이콘 (⚙️)

### 카테고리 필터 (Filter Chips)
```
┌──────────────────────────────────────┐
│ [📱 전체] [👕 상의] [👖 하의] ...    │
└──────────────────────────────────────┘
```
- 가로 스크롤 가능
- 선택된 항목: 보라색 배경 (#5C6BFF)
- 미선택 항목: 회색 배경 (#F3F4F6)

### API 상태 카드
```
┌──────────────────────────────────────┐
│ 🔵 ✅ API 연결 완료 (3개 아이템)    │
└──────────────────────────────────────┘
```
- 연한 보라색 배경 (#EEF2FF)
- 실시간 상태 표시

### 통계 카드 (Statistics)
```
┌──────────────────────────────────────┐
│    3        3        16              │
│  아이템   카테고리   총 착용          │
└──────────────────────────────────────┘
```
- 숫자: 24sp bold 보라색 (#5C6BFF)
- 레이블: 12sp 회색

### 그리드 컨테이너 (Item Grid)
```
PC (4열):
┌────┬────┬────┬────┐
│ 👕 │ 👖 │ 🧥 │    │
│Uni │Levi│Zara│    │
│L·W │32·B│L·B │    │
└────┴────┴────┴────┘
```

### 아이템 카드 (Item Card)
```
┌──────────┐
│  [사진]  │ 🔥 ← 인기 배지 (착용 5회 이상)
│  -----   │
│  Uniqlo  │ ← 브랜드 (13sp bold)
│  L · W   │ ← 사이즈 · 색상 (11sp)
└──────────┘
```

### 플로팅 액션 버튼 (FAB)
```
                           ┌───┐
                           │ + │ ← 인박스로 이동
                           └───┘
```
- 우측 하단 고정
- 보라색 배경 (#5C6BFF)
- 그림자 효과

---

## 📊 현재 데이터 흐름

### 1. 페이지 로드
```javascript
fetchItems()
  ↓
GraphQL API 호출
  ↓
items { items { ... } }
  ↓
allItems 배열에 저장
  ↓
renderItems() 실행
```

### 2. 카테고리 필터 클릭
```javascript
클릭 이벤트
  ↓
currentCategory 업데이트
  ↓
updateStats() - 통계 재계산
  ↓
renderItems() - 그리드 재렌더링
```

### 3. 30초 자동 새로고침
```javascript
setInterval(fetchItems, 30000)
  ↓
최신 데이터 가져오기
  ↓
화면 자동 업데이트
```

---

## 🎨 디자인 스펙 상세

### 색상 (Colors)
```css
Primary:     #5C6BFF  (보라색 - 버튼, 강조)
Text:        #111827  (검정 - 제목)
Text-Sub:    #6B7280  (회색 - 설명)
Text-Light:  #9CA3AF  (연한 회색 - 메타)
Background:  #F9FAFB  (연한 회색 - 배경)
Surface:     #FFFFFF  (흰색 - 카드)
Border:      #F3F4F6  (연한 회색 - 경계선)
Badge:       #FFF5F5  (연한 빨강 - 배지 배경)
```

### 간격 (Spacing)
```css
XXS: 2px
XS:  4px
S:   8px   ← 그리드 간격
M:   12px  ← 카드 내부 패딩
L:   16px  ← 섹션 마진
XL:  20px  ← 헤더 패딩
XXL: 24px
```

### 둥근 모서리 (Border Radius)
```css
Chip:   20px  (완전 둥근)
Card:   16px  (중간 둥근)
Badge:  12px  (작게 둥근)
Button: 28px  (FAB - 원형)
```

### 그림자 (Shadow)
```css
Card:    0 2px 4px rgba(0,0,0,0.08)
Card-Hover: 0 4px 12px rgba(0,0,0,0.15)
FAB:     0 4px 8px rgba(92,107,255,0.3)
Stats:   0 2px 8px rgba(0,0,0,0.05)
```

---

## 💻 기술 스택

### 프론트엔드
- **HTML5** - 시맨틱 마크업
- **CSS3** - Flexbox, Grid, Media Queries
- **Vanilla JavaScript** - Fetch API, DOM 조작

### 백엔드
- **Node.js** - 런타임
- **Express** - HTTP 서버
- **Apollo Server** - GraphQL API
- **Axios + Cheerio** - 웹 스크래핑

### 이미지
- **Unsplash API** - 무료 고화질 이미지
- 자동 리사이즈 (`?w=512&h=512&fit=crop`)

---

## 🚀 다음 단계

### 1. 배경 제거 (Background Removal)
- Python rembg 라이브러리 사용
- 투명 PNG 생성
- 옷만 남기고 배경 제거

### 2. 실제 쇼핑몰 통합
- 지그재그 API 연동
- 무신사 크롤링
- 29CM 데이터 추출

### 3. 모바일 앱 완성
- React Native 빌드
- iOS/Android 배포
- 딥링크 설정

### 4. 고급 기능
- 코디 추천 AI
- 날씨 기반 추천
- 착용 통계 분석

---

## 📝 요약

✅ **사진이 이제 보입니다!**
- Unsplash에서 실제 의류 사진 사용
- 화이트 셔츠, 블랙 진, 가죽 자켓

✅ **완벽한 반응형**
- PC: 4열, 태블릿: 3열, 모바일: 2열

✅ **실시간 API 연동**
- GraphQL로 데이터 가져오기
- 30초 자동 새로고침

✅ **디자인 스펙 완벽 구현**
- 모든 색상, 간격, 그림자 정확히 매칭

---

**데모 URL**: https://3000-ie9wpiu3cp58a236iuzwi-82b888ba.sandbox.novita.ai/demo-closet-grid.html

지금 바로 확인해보세요! 🎉
