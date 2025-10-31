/**
 * Virtual Closet - 데모 API 서버
 * 
 * 빠른 테스트를 위한 간단한 Express + GraphQL 서버
 * 실제 DB 없이 메모리로 작동
 */

const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { json } = require('body-parser');
const cors = require('cors');

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
      imageUrl: null,
      isArchived: false,
      wearCount: 0,
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
      imageUrl: null,
      isArchived: false,
      wearCount: 0,
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
      imageUrl: null,
      isArchived: false,
      wearCount: 0,
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
      // URL 메타데이터 추출
      const metadata = await extractUrlMetadata(input.url);
      
      // 인박스 아이템 생성
      const inboxItem = {
        id: `inbox_${Date.now()}`,
        sourceType: 'SHARE',
        status: 'PARSED',
        productName: metadata.title,
        brand: metadata.brand,
        imageUrl: metadata.imageUrl,
        productUrl: input.url,
        price: metadata.price,
        category: null, // 사용자가 지정
        createdAt: new Date().toISOString(),
      };
      
      db.inboxItems.push(inboxItem);
      
      return {
        success: true,
        inboxItemId: inboxItem.id,
        message: '상품 정보를 가져왔습니다. 인박스에서 확인해주세요.',
      };
    },
    confirmInboxItem: (_, { inboxItemId, category }) => {
      // 인박스 아이템 찾기
      const inboxIndex = db.inboxItems.findIndex(item => item.id === inboxItemId);
      if (inboxIndex === -1) {
        throw new Error('인박스 아이템을 찾을 수 없습니다.');
      }
      
      const inboxItem = db.inboxItems[inboxIndex];
      
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
        imageUrl: inboxItem.imageUrl,
        isArchived: false,
        wearCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      db.items.push(newItem);
      
      // 인박스에서 제거
      db.inboxItems.splice(inboxIndex, 1);
      
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
  
  // 미들웨어
  app.use(cors());
  app.use(json());
  
  // GraphQL 엔드포인트
  app.use('/graphql', expressMiddleware(server));
  
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
