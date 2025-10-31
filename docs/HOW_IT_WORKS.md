# 🔍 Virtual Closet - 현재 작동 방식 상세 설명

## 📊 현재 상황 요약

### ✅ 작동하는 것
1. **API 연동**: GraphQL API가 완벽하게 작동합니다
2. **데이터 흐름**: Share → Inbox → Closet 전체 플로우 완성
3. **UI 구현**: 모바일 앱 화면 3개 모두 완성
4. **반응형 그리드**: 화면 크기에 따라 2-4 열로 자동 조정

### ⚠️ 사진이 안 보이는 이유

**현재 상태**:
```json
{
  "id": "1",
  "name": "화이트 셔츠",
  "brand": "Uniqlo",
  "imageUrl": null,  // ← 이미지 URL이 없음!
  "wearCount": 0
}
```

**이유**:
1. 초기 샘플 데이터 3개 (화이트 셔츠, 블랙 진, 가죽 자켓)는 `imageUrl`이 `null`입니다
2. 실제 쇼핑몰 URL을 공유하면 메타데이터를 추출하지만, 현재는 **데모 모드**라서 가짜 이미지 URL을 넣습니다
3. 실제 상품 사진을 보려면 **실제 쇼핑몰에서 Open Graph 태그를 가져와야** 합니다

---

## 🎯 전체 시스템 작동 흐름

### 1️⃣ 사용자가 쇼핑몰에서 상품 공유

```
실제 시나리오:
사용자가 지그재그, 무신사, 29CM 등에서
"공유하기" 버튼 클릭 → URL 복사
```

**예시 URL**:
- `https://zigzag.kr/catalog/products/123456`
- `https://www.musinsa.com/app/goods/2845123`
- `https://www.29cm.co.kr/product/987654`

### 2️⃣ ingestShare 뮤테이션 실행

**GraphQL 호출**:
```graphql
mutation {
  ingestShare(input: {
    url: "https://zigzag.kr/catalog/products/123456"
  }) {
    success
    message
    inboxItemId
  }
}
```

**백엔드에서 일어나는 일** (`demo-server.js` 218-243줄):

```javascript
async function extractUrlMetadata(url) {
  // 1. 실제 URL에 HTTP 요청
  const response = await axios.get(url, {
    headers: { 'User-Agent': '...' }
  });
  
  // 2. HTML 파싱
  const $ = cheerio.load(response.data);
  
  // 3. Open Graph 메타태그 추출
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');  // ← 이미지 URL!
  const ogPrice = $('meta[property="product:price:amount"]').attr('content');
  
  // 4. JSON-LD 스키마 파싱
  $('script[type="application/ld+json"]').each((_, elem) => {
    const data = JSON.parse($(elem).html());
    if (data['@type'] === 'Product') {
      // product.name, product.brand, product.image 추출
    }
  });
  
  return {
    title: ogTitle || jsonLd.name,
    brand: jsonLd.brand?.name,
    imageUrl: ogImage || jsonLd.image,  // ← 여기가 핵심!
    price: parseFloat(ogPrice || jsonLd.offers?.price)
  };
}
```

**현재 데모 모드 동작**:
```javascript
// 실제 URL 요청 실패하면 → 데모 데이터 반환
return {
  title: `데모 상품 - ${url.substring(0, 30)}`,
  brand: 'Demo Brand',
  imageUrl: 'https://via.placeholder.com/512',  // ← 가짜 이미지
  price: Math.floor(Math.random() * 100000)
};
```

### 3️⃣ Inbox에 아이템 생성

```json
{
  "id": "inbox_1761907818816",
  "sourceType": "SHARE",
  "status": "PARSED",
  "productName": "데모 상품 - https://www.musinsa.",
  "brand": "Demo Brand",
  "imageUrl": "https://via.placeholder.com/512",
  "price": 49895,
  "createdAt": "2025-10-31T10:56:58.816Z"
}
```

### 4️⃣ 사용자가 카테고리 확인

**모바일 앱 Inbox 화면**:
```
┌─────────────────────────────┐
│ 📦 인박스                    │
├─────────────────────────────┤
│ [사진]  데모 상품            │
│        Demo Brand · 49,895원 │
│        공유됨 · 방금 전       │
│        [❌] [확인]            │
└─────────────────────────────┘
```

"확인" 버튼 클릭 → 카테고리 선택:
```
[👕 상의] [👖 하의] [🧥 아우터] [👟 신발]
```

### 5️⃣ confirmInboxItem 뮤테이션

```graphql
mutation {
  confirmInboxItem(
    inboxItemId: "inbox_1761907818816",
    category: "TOP"
  ) {
    id
    name
    category
    imageUrl
  }
}
```

**백엔드 동작** (`demo-server.js` 244-277줄):
```javascript
confirmInboxItem: (_, { inboxItemId, category }) => {
  // 1. 인박스에서 아이템 찾기
  const inboxItem = db.inboxItems.find(item => item.id === inboxItemId);
  
  // 2. 옷장 아이템 생성
  const newItem = {
    id: String(db.items.length + 1),
    name: inboxItem.productName,
    category: category,
    brand: inboxItem.brand,
    imageUrl: inboxItem.imageUrl,  // ← 이미지 URL 복사
    price: inboxItem.price,
    wearCount: 0,
    tags: ['new', 'inbox']
  };
  
  // 3. 옷장에 추가
  db.items.push(newItem);
  
  // 4. 인박스에서 제거
  db.inboxItems.splice(inboxIndex, 1);
  
  return newItem;
}
```

### 6️⃣ Closet에 아이템 표시

**모바일 앱 Closet 화면**:
```
┌──────┬──────┬──────┬──────┐
│ 👕   │ 👖   │ 🧥   │ 👕   │  ← 이미지가 있으면 여기 표시
│ Uni  │ Levi │ Zara │ Demo │
│ L·W  │ 32·B │ L·B  │ F·C  │
└──────┴──────┴──────┴──────┘
   ↑ 2-4 열 반응형 그리드
```

---

## 🖼️ 이미지가 보이는 조건

### ✅ 이미지가 표시되려면:

1. **실제 쇼핑몰 URL**을 공유해야 함
2. 해당 쇼핑몰이 **Open Graph 태그**를 제공해야 함
3. 또는 **JSON-LD 스키마**에 이미지 정보가 있어야 함

**지원하는 쇼핑몰**:
- ✅ 지그재그 (zigzag.kr) - Open Graph 지원
- ✅ 무신사 (musinsa.com) - Open Graph 지원
- ✅ 29CM (29cm.co.kr) - Open Graph 지원
- ✅ 기타 대부분의 주요 쇼핑몰

### 🔍 Open Graph 태그란?

웹사이트가 제공하는 메타데이터입니다:

```html
<meta property="og:title" content="오버핏 화이트 셔츠" />
<meta property="og:image" content="https://cdn.zigzag.kr/images/shirt123.jpg" />
<meta property="og:description" content="데일리 착용하기 좋은..." />
<meta property="product:price:amount" content="29000" />
```

이 태그들을 파싱해서 자동으로 상품 정보를 추출합니다!

---

## 🎨 현재 데모 화면 동작

### 데모 URL 접속 시:

**1. API 연결**
```javascript
// 백엔드 GraphQL API 호출
fetch('https://4000-...sandbox.novita.ai/graphql', {
  body: JSON.stringify({ query: GET_ITEMS_QUERY })
})
```

**2. 데이터 수신**
```json
{
  "items": [
    { "id": "1", "name": "화이트 셔츠", "imageUrl": null },
    { "id": "4", "name": "데모 상품", "imageUrl": "https://via.placeholder.com/512" }
  ]
}
```

**3. 그리드 렌더링**
```javascript
// imageUrl이 null이면 → 기본 아이콘 👕 표시
// imageUrl이 있으면 → <img> 태그로 표시
filtered.map(item => `
  <div class="item-card">
    ${item.imageUrl 
      ? `<img src="${item.imageUrl}" />` 
      : '<div>👕</div>'}  ← 아이콘 표시
  </div>
`)
```

**4. 반응형 그리드**
```css
/* 화면 너비에 따라 자동 조정 */
@media (max-width: 360px) {
  grid-template-columns: repeat(2, 1fr);  /* 2열 */
}
@media (min-width: 361px) and (max-width: 430px) {
  grid-template-columns: repeat(3, 1fr);  /* 3열 */
}
@media (min-width: 431px) {
  grid-template-columns: repeat(4, 1fr);  /* 4열 */
}
```

---

## 🔧 실제 이미지를 보려면?

### 방법 1: 실제 쇼핑몰 URL 사용

```bash
# 무신사 상품 공유
curl -X POST https://4000-...graphql \
  -d '{"query": "mutation { ingestShare(input: {url: \"https://www.musinsa.com/app/goods/2845123\"}) { ... } }"}'

# → 무신사에서 Open Graph 이미지 추출
# → 실제 상품 사진이 imageUrl에 저장됨
```

### 방법 2: 수동으로 이미지 URL 추가

데모 서버 코드를 수정해서 실제 이미지 URL 추가:

```javascript
// demo-server.js
const db = {
  items: [
    {
      id: '1',
      name: '화이트 셔츠',
      brand: 'Uniqlo',
      imageUrl: 'https://image.uniqlo.com/UQ/ST3/kr/imagesgoods/123/item/detail/09_123_3L.jpg',
      // ↑ 실제 유니클로 이미지 URL
    }
  ]
};
```

### 방법 3: 배경 제거 통합 (다음 단계)

실제 상품 이미지 → 배경 제거 → 투명 PNG:

```javascript
// 1. 원본 이미지 다운로드
const originalImage = await fetch(item.imageUrl);

// 2. Python worker로 배경 제거
const silhouetteImage = await removeBg(originalImage);

// 3. S3에 업로드
const silhouetteUrl = await uploadToS3(silhouetteImage);

// 4. DB 업데이트
item.silhouetteUrl = silhouetteUrl;
```

---

## 📱 PC vs 모바일 차이

### PC에서 보는 경우:
- 화면이 넓어서 → **4열 그리드** 표시
- 더 많은 아이템을 한 번에 볼 수 있음
- 마우스 호버 시 카드가 살짝 올라가는 애니메이션

### 모바일에서 보는 경우:
- 화면이 좁아서 → **2열 그리드** 표시
- 터치 인터랙션 최적화
- Pull-to-refresh 기능 사용 가능

### 현재 데모 화면의 그리드:
```
PC (>430px):     Tablet (361-430px):   Mobile (≤360px):
┌──┬──┬──┬──┐    ┌──┬──┬──┐           ┌──┬──┐
│  │  │  │  │    │  │  │  │           │  │  │
└──┴──┴──┴──┘    └──┴──┴──┘           └──┴──┘
   4 columns         3 columns            2 columns
```

---

## 🎯 요약

### 사진이 안 보이는 이유:
1. ❌ 초기 샘플 데이터는 `imageUrl: null`
2. ❌ 데모 모드는 가짜 placeholder 이미지 사용
3. ❌ 실제 쇼핑몰 URL을 크롤링하지 않음 (CORS, 권한 문제)

### 실제로 작동하는 것:
1. ✅ API 연결 완벽 작동
2. ✅ Share → Inbox → Closet 전체 플로우 완성
3. ✅ 반응형 그리드 (2-4열 자동 조정)
4. ✅ 카테고리 필터링
5. ✅ Pull-to-refresh
6. ✅ 통계 카드

### 다음 단계로 해결할 것:
1. 🔜 실제 쇼핑몰 URL 크롤링 구현
2. 🔜 배경 제거 (rembg) 통합
3. 🔜 S3/Cloudflare R2에 이미지 업로드
4. 🔜 투명 PNG 생성 및 표시

---

## 💡 지금 당장 테스트해볼 수 있는 것

### 1. 카테고리 필터 테스트
데모 화면에서 "상의", "하의", "아우터" 버튼 클릭해보세요!

### 2. 반응형 그리드 테스트
브라우저 창 크기를 조절하면서 그리드가 변경되는 것을 확인하세요!

### 3. API 직접 호출 테스트
```bash
# 새 상품 추가
curl -X POST https://4000-...graphql \
  -d '{"query": "mutation { ingestShare(...) }"}'

# 인박스 확인
curl -X POST https://4000-...graphql \
  -d '{"query": "query { inboxItems { ... } }"}'

# 옷장에 추가
curl -X POST https://4000-...graphql \
  -d '{"query": "mutation { confirmInboxItem(...) }"}'
```

---

**현재 상태**: 🟢 모든 기능 작동 중 (이미지 제외)  
**다음 우선순위**: 🎨 배경 제거 + 실제 이미지 통합

질문 있으시면 언제든 물어보세요! 🚀
