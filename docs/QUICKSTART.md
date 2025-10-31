# Quick Start Guide

> Virtual Closet 프로젝트를 빠르게 시작하는 가이드

## 🚀 5분 안에 시작하기

### 1. 사전 요구사항 확인

```bash
# Node.js 버전 확인 (>= 18.0.0)
node --version

# pnpm 설치 확인
pnpm --version

# 없다면 설치
npm install -g pnpm@8.12.0
```

### 2. 프로젝트 설정

```bash
# 의존성 설치 (루트 디렉토리에서)
pnpm install

# 환경변수 설정
cp .env.example .env
```

### 3. Docker로 개발 환경 시작 (추천)

```bash
# PostgreSQL + Redis 시작
cd infra/docker
docker-compose up -d

# 데이터베이스 마이그레이션
cd ../..
pnpm db:migrate
```

### 4. 개발 서버 실행

```bash
# 전체 서비스 실행
pnpm dev

# 또는 개별 실행
pnpm api:dev      # http://localhost:4000
pnpm mobile:dev   # Expo 개발 서버
pnpm workers:dev  # http://localhost:8000
```

### 5. 확인

- **GraphQL Playground**: http://localhost:4000/graphql
- **Python Workers API Docs**: http://localhost:8000/docs
- **Expo Dev Tools**: http://localhost:19000

## 📱 모바일 앱 실행

### iOS (Mac 필요)

```bash
cd apps/mobile
pnpm ios
```

### Android

```bash
cd apps/mobile
pnpm android
```

### 웹 (빠른 테스트)

```bash
cd apps/mobile
pnpm web
```

### Expo Go 앱 사용

1. 스마트폰에 Expo Go 앱 설치
2. `pnpm mobile:dev` 실행
3. QR 코드 스캔

## 🧪 테스트 데이터 생성

```bash
# 시드 데이터 생성
pnpm db:seed
```

## 💡 주요 명령어

```bash
# 개발
pnpm dev              # 전체 개발 서버
pnpm api:dev          # 백엔드만
pnpm mobile:dev       # 모바일만

# 빌드
pnpm build            # 전체 빌드

# 테스트
pnpm test             # 전체 테스트

# 데이터베이스
pnpm db:migrate       # 마이그레이션 실행
pnpm db:studio        # Prisma Studio 열기

# 정리
pnpm clean            # 빌드 파일 삭제
```

## 🎯 첫 GraphQL 쿼리 실행

http://localhost:4000/graphql 접속 후:

```graphql
# 옷장 아이템 생성
mutation {
  createItem(input: {
    name: "화이트 셔츠"
    category: TOP
    brand: "Uniqlo"
    size: "L"
    color: "White"
    season: ALL_SEASON
    price: 29000
  }) {
    id
    name
    category
    brand
    createdAt
  }
}

# 옷장 아이템 조회
query {
  items(filters: { category: TOP }) {
    items {
      id
      name
      category
      brand
      imageUrl
    }
    total
    hasMore
  }
}
```

## 🔧 문제 해결

### 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :4000  # API 포트
lsof -i :8000  # Workers 포트
lsof -i :5432  # PostgreSQL 포트

# 프로세스 종료
kill -9 <PID>
```

### Docker 컨테이너 재시작

```bash
cd infra/docker
docker-compose down
docker-compose up -d
```

### node_modules 문제

```bash
pnpm clean
rm -rf node_modules
pnpm install
```

### 데이터베이스 초기화

```bash
pnpm db:migrate:reset
pnpm db:migrate
pnpm db:seed
```

## 📚 다음 단계

1. **백엔드 개발**: [DEVELOPMENT.md](./DEVELOPMENT.md) 참고
2. **아키텍처 이해**: [ARCHITECTURE.md](./ARCHITECTURE.md) 참고
3. **API 문서**: [API.md](./API.md) 참고
4. **기여 가이드**: [CONTRIBUTING.md](./CONTRIBUTING.md) 참고 (작성 예정)

## 🆘 도움이 필요하신가요?

- GitHub Issues: 버그 리포트 및 기능 요청
- Discussions: 질문 및 아이디어 공유
- Slack/Discord: 팀 커뮤니케이션 (내부)

---

**Happy Coding! 🎉**
