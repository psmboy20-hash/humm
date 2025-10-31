/**
 * Virtual Closet - 데모 API 서버
 * 
 * 빠른 테스트를 위한 간단한 Express + GraphQL 서버
 * 실제 DB 없이 메모리로 작동
 */

const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

// 메모리 데이터베이스 (임시)
const db = {
  users: [
    { id: '1', email: 'demo@virtualcloset.com', name: '데모 사용자' }
  ],
  inboxItems: [],
  items: [
    {
      id: '1',
      userId: '1',
      name: '화이트 셔츠',
      category: 'TOP',
      brand: 'Uniqlo',
      size: 'L',
      color: 'White',
      season: 'ALL_SEASON',
      price: 29000,
      tags: ['basic', 'formal'],
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=512&h=512&fit=crop',
      isArchived: false,
      wearCount: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: '1',
      name: '블랙 진',
      category: 'BOTTOM',
      brand: "Levi's",
      size: '32',
      color: 'Black',
      season: 'ALL_SEASON',
      price: 89000,
      tags: ['denim', 'casual'],
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=512&h=512&fit=crop',
      isArchived: false,
      wearCount: 8,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      userId: '1',
      name: '가죽 자켓',
      category: 'OUTER',
      brand: 'Zara',
      size: 'L',
      color: 'Black',
      season: 'FALL',
      price: 129000,
      tags: ['leather', 'casual'],
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=512&h=512&fit=crop',
      isArchived: false,
      wearCount: 5,
      createdAt: new Date().toISOString(),
    },
  ],
};

// GraphQL 스키마
const typeDefs = `
  type User {
    id: ID!
    email: String!
    name: String
  }

  type Item {
    id: ID!
    userId: ID!
    name: String!
    category: String!
    brand: String
    size: String
    color: String
    season: String
    price: Float
    tags: [String!]!
    imageUrl: String
    silhouetteUrl: String
    thumbnailUrl: String
    isArchived: Boolean!
    wearCount: Int!
    createdAt: String!
  }

  type ItemsResponse {
    items: [Item!]!
    total: Int!
    hasMore: Boolean!
  }

  type InboxItem {
    id: ID!
    sourceType: String!
    status: String!
    productName: String
    brand: String
    imageUrl: String
    productUrl: String
    price: Float
    category: String
    createdAt: String!
  }

  type Query {
    me: User
    items(category: String, skip: Int, take: Int): ItemsResponse!
    item(id: ID!): Item
    inboxItems: [InboxItem!]!
  }

  input CreateItemInput {
    name: String!
    category: String!
    brand: String
    size: String
    color: String
    season: String
    price: Float
    tags: [String!]
  }

  input IngestShareInput {
    url: String!
    sharedFrom: String
  }

  type IngestResponse {
    success: Boolean!
    inboxItemId: String!
    message: String
  }

  type Mutation {
    createItem(input: CreateItemInput!): Item!
    deleteItem(id: ID!): Boolean!
    ingestShare(input: IngestShareInput!): IngestResponse!
    confirmInboxItem(inboxItemId: ID!, category: String): Item!
  }
`;

// 29cm 상품 크롤링
async function extract29cmProduct(url) {
  try {
    console.log('🔍 29cm 크롤링:', url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });
    
    const $ = cheerio.load(response.data);
    
    // JSON-LD에서 데이터 추출 (29cm는 Next.js 앱)
    let jsonLd = {};
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const data = JSON.parse($(elem).html() || '{}');
        if (data['@type'] === 'Product' || data.name) {
          jsonLd = data;
        }
      } catch (e) {}
    });
    
    // 상품명
    const name = jsonLd.name || $('meta[property="og:title"]').attr('content') || '29CM 상품';
    
    // 브랜드
    const brand = jsonLd.brand?.name || '29CM';
    
    // 가격
    const price = jsonLd.offers?.price ? parseFloat(jsonLd.offers.price) : 0;
    
    // 썸네일
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || 'https://img.29cm.co.kr/mall/og_image.png';
    
    // 상세 이미지들 추출
    const detailImages = [];
    if (jsonLd.image && Array.isArray(jsonLd.image)) {
      detailImages.push(...jsonLd.image);
    }
    
    // img 태그에서도 추출
    $('img').each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && src.includes('29cm.co.kr') && !src.includes('logo') && !src.includes('icon')) {
        const highResUrl = src.replace(/\/resize\/\d+_\d+/, '').replace(/\?.*$/, '');
        if (!detailImages.includes(highResUrl)) {
          detailImages.push(highResUrl);
        }
      }
    });
    
    // 배경 제거용 최적 이미지 선택
    const originalImageUrl = detailImages.find(img => 
      img.includes('detail') || img.includes('product')
    ) || detailImages[1] || detailImages[0] || thumbnailUrl;
    
    console.log('✅ 29cm 크롤링 완료:', {
      name,
      brand,
      price,
      imagesCount: detailImages.length,
    });
    
    return {
      name,
      brand,
      price,
      thumbnailUrl,
      originalImageUrl,
      detailImages,
    };
  } catch (error) {
    console.error('❌ 29cm 크롤링 실패:', error.message);
    
    // 29cm는 클라이언트 사이드 렌더링이라 크롤링이 어렵습니다
    // 데모 목적으로 테스트 이미지 사용
    console.log('⚠️  29cm는 클라이언트 렌더링이라 실시간 크롤링 불가');
    console.log('📦 테스트용 샘플 데이터 사용 (블랙 패딩)');
    
    return {
      name: '블랙 패딩 재킷',
      brand: 'Stone Island',
      price: 450000,
      thumbnailUrl: 'https://page.gensparksite.com/v1/base64_upload/3c30d27b877aa8e37b910d6cf643c096',
      originalImageUrl: 'https://page.gensparksite.com/v1/base64_upload/3c30d27b877aa8e37b910d6cf643c096',
      detailImages: ['https://page.gensparksite.com/v1/base64_upload/3c30d27b877aa8e37b910d6cf643c096'],
    };
  }
}

// 간단한 URL 메타데이터 추출 함수
async function extractUrlMetadata(url) {
  try {
    // 실제로는 axios + cheerio로 스크래핑하지만, 데모에서는 mock
    return {
      title: '데모 상품 - ' + url.substring(0, 20),
      brand: 'Demo Brand',
      imageUrl: 'https://via.placeholder.com/512',
      price: Math.floor(Math.random() * 100000) + 10000,
    };
  } catch (error) {
    return {
      title: '상품명 추출 실패',
      imageUrl: null,
      price: 0,
    };
  }
}

// GraphQL 리졸버
const resolvers = {
  Query: {
    me: () => db.users[0],
    inboxItems: () => db.inboxItems,
    items: (_, { category, skip = 0, take = 20 }) => {
      let items = db.items.filter(item => !item.isArchived);
      
      if (category) {
        items = items.filter(item => item.category === category);
      }
      
      const total = items.length;
      const paginatedItems = items.slice(skip, skip + take);
      
      return {
        items: paginatedItems,
        total,
        hasMore: skip + take < total,
      };
    },
    item: (_, { id }) => db.items.find(item => item.id === id),
  },
  Mutation: {
    createItem: (_, { input }) => {
      const newItem = {
        id: String(db.items.length + 1),
        userId: '1',
        ...input,
        tags: input.tags || [],
        imageUrl: null,
        isArchived: false,
        wearCount: 0,
        createdAt: new Date().toISOString(),
      };
      db.items.push(newItem);
      return newItem;
    },
    deleteItem: (_, { id }) => {
      const index = db.items.findIndex(item => item.id === id);
      if (index !== -1) {
        db.items.splice(index, 1);
        return true;
      }
      return false;
    },
    ingestShare: async (_, { input }) => {
      let metadata;
      
      // 29cm URL인지 확인
      if (input.url.includes('29cm.co.kr')) {
        console.log('🔍 29cm 상품 크롤링 시작:', input.url);
        metadata = await extract29cmProduct(input.url);
      } else {
        // 일반 URL 메타데이터 추출
        metadata = await extractUrlMetadata(input.url);
      }
      
      // 인박스 아이템 생성
      const inboxItem = {
        id: `inbox_${Date.now()}`,
        sourceType: 'SHARE',
        status: 'PARSED',
        productName: metadata.title || metadata.name,
        brand: metadata.brand,
        imageUrl: metadata.thumbnailUrl || metadata.imageUrl,  // 썸네일 사용
        originalImageUrl: metadata.originalImageUrl || metadata.imageUrl,  // 디테일컷 (배경 제거용)
        productUrl: input.url,
        price: metadata.price,
        category: null, // 사용자가 지정
        createdAt: new Date().toISOString(),
      };
      
      db.inboxItems.push(inboxItem);
      
      console.log('✅ 인박스 추가 완료:', inboxItem.productName);
      
      return {
        success: true,
        inboxItemId: inboxItem.id,
        message: '상품 정보를 가져왔습니다. 인박스에서 확인해주세요.',
      };
    },
    confirmInboxItem: async (_, { inboxItemId, category }) => {
      // 인박스 아이템 찾기
      const inboxIndex = db.inboxItems.findIndex(item => item.id === inboxItemId);
      if (inboxIndex === -1) {
        throw new Error('인박스 아이템을 찾을 수 없습니다.');
      }
      
      const inboxItem = db.inboxItems[inboxIndex];
      
      console.log('🎨 배경 제거 시작:', inboxItem.productName);
      
      // 배경 제거 (Python Worker 호출)
      let silhouetteUrl = null;
      let thumbnailUrl = null;
      
      try {
        const imageToProcess = inboxItem.originalImageUrl || inboxItem.imageUrl;
        
        const bgRemovalResponse = await axios.post(
          'http://localhost:8000/api/remove-background',
          { image_url: imageToProcess },
          { timeout: 30000 }  // 30초 타임아웃
        );
        
        if (bgRemovalResponse.data.success) {
          silhouetteUrl = bgRemovalResponse.data.silhouette_url;
          thumbnailUrl = bgRemovalResponse.data.thumbnail_url;
          console.log('✅ 배경 제거 완료!');
        } else {
          console.warn('⚠️ 배경 제거 실패, 원본 이미지 사용');
        }
      } catch (error) {
        console.error('❌ 배경 제거 에러:', error.message);
        console.log('→ 원본 이미지로 진행');
      }
      
      // 옷장 아이템 생성
      const newItem = {
        id: String(db.items.length + 1),
        userId: '1',
        name: inboxItem.productName,
        category: category || 'TOP',
        brand: inboxItem.brand,
        size: null,
        color: null,
        season: null,
        price: inboxItem.price,
        tags: ['new', 'inbox'],
        imageUrl: inboxItem.originalImageUrl || inboxItem.imageUrl,  // 원본
        silhouetteUrl: silhouetteUrl,  // 배경 제거된 이미지 (base64)
        thumbnailUrl: thumbnailUrl,    // 작은 배경 제거 이미지
        isArchived: false,
        wearCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      db.items.push(newItem);
      
      // 인박스에서 제거
      db.inboxItems.splice(inboxIndex, 1);
      
      console.log('✅ 옷장 추가 완료:', newItem.name);
      
      return newItem;
    },
  },
};

// 서버 시작
async function startServer() {
  const app = express();
  
  // Apollo Server 설정
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    csrfPrevention: false,
  });
  
  await server.start();
  
  // GraphQL 엔드포인트 (먼저 설정!)
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );
  
  // 정적 파일 (테스트 페이지)
  app.use(express.static('.'));
  
  // REST 엔드포인트 (추가)
  app.get('/api', (req, res) => {
    res.json({
      message: '🎉 Virtual Closet API - 데모 서버',
      endpoints: {
        graphql: '/graphql',
        testPage: '/test-page.html',
        rest: {
          items: '/api/items',
          health: '/health',
        },
      },
      documentation: 'GraphQL Playground: http://localhost:4000/graphql',
    });
  });
  
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
  
  app.get('/api/items', (req, res) => {
    const items = db.items.filter(item => !item.isArchived);
    res.json({ items, total: items.length });
  });
  
  // 서버 시작
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Virtual Closet API 서버가 시작되었습니다!           ║
║                                                           ║
║   📍 URL: http://localhost:${PORT}                        ║
║   📊 GraphQL Playground: http://localhost:${PORT}/graphql ║
║   ❤️  Health Check: http://localhost:${PORT}/health       ║
║                                                           ║
║   💡 샘플 쿼리:                                           ║
║      query { items { items { id name brand } } }        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

startServer().catch(console.error);
