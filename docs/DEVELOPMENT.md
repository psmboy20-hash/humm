# Development Guide

## 개발 환경 설정

### 필수 요구사항

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Python**: >= 3.11
- **Docker**: >= 24.0.0 (선택사항)
- **PostgreSQL**: >= 15.0
- **Redis**: >= 7.0

### 초기 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd virtual-closet

# 2. 의존성 설치
pnpm install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일을 에디터로 열어 수정

# 4. Docker 컨테이너 시작 (PostgreSQL, Redis)
cd infra/docker
docker-compose up -d postgres redis

# 5. 데이터베이스 마이그레이션
pnpm db:migrate

# 6. 시드 데이터 생성 (선택사항)
pnpm db:seed
```

### 개발 서버 실행

```bash
# 전체 개발 환경 실행
pnpm dev

# 또는 개별 서비스 실행
pnpm api:dev      # Backend API (포트 4000)
pnpm mobile:dev   # Mobile App (Expo)
pnpm workers:dev  # Python Workers (포트 8000)
```

## 프로젝트 구조

```
virtual-closet/
├── apps/
│   ├── mobile/              # React Native 모바일 앱
│   │   ├── app/            # Expo Router 페이지
│   │   ├── src/
│   │   │   ├── components/ # 재사용 가능한 컴포넌트
│   │   │   ├── hooks/      # 커스텀 훅
│   │   │   ├── services/   # API 서비스
│   │   │   ├── store/      # 상태 관리 (Zustand)
│   │   │   └── utils/      # 유틸리티 함수
│   │   └── assets/         # 이미지, 폰트 등
│   └── web-admin/          # 관리자 웹 (후순위)
│
├── packages/
│   ├── api/                # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/       # 인증 모듈
│   │   │   ├── users/      # 사용자 모듈
│   │   │   ├── items/      # 아이템 모듈
│   │   │   ├── outfits/    # 코디 모듈
│   │   │   ├── recommendations/ # 추천 모듈
│   │   │   └── common/     # 공통 (Prisma, Guards 등)
│   │   └── test/           # 테스트
│   │
│   ├── database/           # Prisma 스키마 & 마이그레이션
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── package.json
│   │
│   ├── shared/             # 공유 타입 & 유틸
│   │   └── src/
│   │       ├── types/
│   │       ├── constants/
│   │       └── utils/
│   │
│   └── workers/            # Python Workers
│       ├── src/
│       │   ├── api/        # FastAPI 서버
│       │   ├── email_parser/
│       │   ├── ocr/
│       │   └── image_processor/
│       └── tests/
│
├── infra/
│   ├── docker/             # Docker 설정
│   └── k8s/               # Kubernetes 매니페스트
│
└── docs/                   # 문서
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT.md
    └── API.md
```

## 코딩 컨벤션

### TypeScript/JavaScript

- **포맷팅**: Prettier (자동 포맷)
- **린팅**: ESLint
- **네이밍**:
  - 파일: `kebab-case.ts`
  - 컴포넌트: `PascalCase.tsx`
  - 함수/변수: `camelCase`
  - 상수: `UPPER_SNAKE_CASE`
  - 타입/인터페이스: `PascalCase`

```typescript
// ✅ Good
export interface UserProfile {
  userId: string;
  bodyType?: string;
}

const API_BASE_URL = 'https://api.example.com';

function getUserProfile(userId: string): Promise<UserProfile> {
  // ...
}

// ❌ Bad
export interface user_profile {
  user_id: string;
}
```

### Python

- **스타일**: PEP 8
- **포맷팅**: Black
- **린팅**: Ruff
- **타입 힌트**: 필수

```python
# ✅ Good
from typing import Optional

def parse_email(
    email_html: str, 
    provider: str
) -> Optional[dict]:
    """이메일 HTML을 파싱하여 아이템 정보 추출"""
    pass

# ❌ Bad
def ParseEmail(emailHtml, provider):
    pass
```

## Git 워크플로우

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정
- `hotfix/*`: 긴급 수정

### 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 형식 사용:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**타입**:
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

**예시**:
```
feat(items): 이메일 파싱 기반 아이템 추가 기능

- Gmail API 연동
- 쇼핑 영수증 파서 구현
- 자동 메타데이터 추출

Closes #123
```

### Pull Request

1. `develop` 브랜치에서 feature 브랜치 생성
2. 기능 개발 및 테스트
3. Pull Request 생성
4. 코드 리뷰
5. `develop`에 머지
6. 정기적으로 `main`에 릴리스

## 테스팅

### Backend (NestJS)

```bash
# 유닛 테스트
pnpm --filter @virtual-closet/api test

# e2e 테스트
pnpm --filter @virtual-closet/api test:e2e

# 커버리지
pnpm --filter @virtual-closet/api test:cov
```

**예시**:
```typescript
describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ItemsService, PrismaService],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should create an item', async () => {
    const input = {
      name: 'Test Shirt',
      category: ItemCategory.TOP,
    };
    const result = await service.create('user-id', input);
    expect(result.name).toBe('Test Shirt');
  });
});
```

### Mobile (React Native)

```bash
# Jest 테스트
pnpm --filter @virtual-closet/mobile test
```

### Python Workers

```bash
cd packages/workers
poetry run pytest
poetry run pytest --cov=src tests/
```

## 디버깅

### Backend API

1. **VSCode 디버거 설정** (`.vscode/launch.json`):

```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to NestJS",
  "port": 9229,
  "restart": true,
  "cwd": "${workspaceFolder}/packages/api"
}
```

2. **디버그 모드 실행**:
```bash
pnpm --filter @virtual-closet/api dev:debug
```

### Mobile App

```bash
# Chrome DevTools로 디버깅
pnpm mobile:dev
# 브라우저에서 http://localhost:19000 접속
```

### Python Workers

```bash
# pdb 사용
import pdb; pdb.set_trace()

# 또는 ipdb
import ipdb; ipdb.set_trace()
```

## 데이터베이스 작업

### 스키마 변경

1. `packages/database/prisma/schema.prisma` 수정
2. 마이그레이션 생성:
```bash
cd packages/database
pnpm migrate
# 마이그레이션 이름 입력
```

### Prisma Studio

```bash
cd packages/database
pnpm studio
# http://localhost:5555 에서 GUI 확인
```

### 데이터 시딩

`packages/database/prisma/seed.ts` 수정 후:
```bash
pnpm db:seed
```

## 환경변수 관리

### 로컬 개발

`.env.local` 파일 사용 (Git 무시됨):
```bash
cp .env.example .env.local
```

### 프로덕션

환경변수는 배포 플랫폼에서 주입:
- Kubernetes Secrets
- AWS Parameter Store
- Vercel/Railway 환경변수

## 문제 해결

### pnpm 캐시 문제

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### 데이터베이스 연결 오류

```bash
# Docker 컨테이너 상태 확인
docker ps

# PostgreSQL 로그 확인
docker logs virtual-closet-db
```

### Expo 캐시 클리어

```bash
cd apps/mobile
pnpm expo start -c
```

## 유용한 명령어

```bash
# 전체 빌드
pnpm build

# 린팅 & 포맷
pnpm lint
pnpm format

# 의존성 업데이트
pnpm update --recursive

# 특정 패키지만 실행
pnpm --filter @virtual-closet/api <command>

# Turbo 캐시 클리어
pnpm clean
```

## 리소스

- [NestJS 문서](https://docs.nestjs.com/)
- [Prisma 문서](https://www.prisma.io/docs)
- [React Native 문서](https://reactnative.dev/)
- [Expo 문서](https://docs.expo.dev/)
- [FastAPI 문서](https://fastapi.tiangolo.com/)

---

**문의**: 개발팀 이메일 또는 Slack 채널
