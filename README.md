# Virtual Closet (가상 옷장)

> 내 옷장을 디지털로 관리하고, AI 코디 추천을 받는 스마트 패션 플랫폼

## 🎯 프로젝트 개요

**Virtual Closet**은 사용자의 패션 아이템을 체계적으로 관리하고, 날씨와 일정에 맞춰 최적의 코디를 추천해주는 모바일 중심 서비스입니다.

### 핵심 기능

1. **스마트 옷장 관리**
   - 이메일 영수증 자동 파싱 (Gmail/네이버)
   - 공유하기 URL 메타데이터 자동 추출
   - 스크린샷 OCR 보조 입력
   - 브랜드/사이즈/구매일/링크 등 상세 정보 관리

2. **가상 피팅 & 코디**
   - 정면 누끼 이미지 스티커 방식 코디
   - TOP/BOTTOM/OUTER/SHOES 레이어 관리
   - 룩 저장 및 공유 기능

3. **AI 코디 추천**
   - 날씨 기반 적합성 분석
   - 일정 고려 TPO 추천
   - 체형 프리셋 맞춤 추천 (고도화 단계)
   - 부족 아이템 링크아웃 추천

4. **소셜 & 커머스 (후순위)**
   - 인플루언서 Public Closet 팔로우
   - 2차 거래 연계
   - 어필리에이트 수익화

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                  Mobile App                         │
│              (React Native + Expo)                  │
│         - 옷장 관리  - 코디  - 추천                  │
└──────────────────┬──────────────────────────────────┘
                   │ GraphQL
┌──────────────────┴──────────────────────────────────┐
│              Backend API (NestJS)                    │
│    GraphQL BFF + REST Internal APIs                 │
└─────┬────────────────────────┬──────────────────────┘
      │                        │
┌─────┴────────┐    ┌──────────┴─────────┐
│ PostgreSQL   │    │  Python Workers    │
│ + pgvector   │    │  - 이메일 파싱     │
│ + Redis      │    │  - OCR             │
└──────────────┘    │  - 이미지 처리     │
                    └────────────────────┘
```

## 📦 모노레포 구조

```
virtual-closet/
├── apps/
│   ├── mobile/          # React Native + Expo 모바일 앱
│   └── web-admin/       # 관리자 콘솔 (Next.js)
├── packages/
│   ├── api/            # NestJS + GraphQL Backend
│   ├── database/       # Prisma 스키마 & 마이그레이션
│   ├── shared/         # 공통 타입/유틸/상수
│   └── workers/        # Python FastAPI 워커
├── infra/
│   ├── docker/         # Docker Compose 개발 환경
│   └── k8s/           # Kubernetes 배포 매니페스트
└── docs/              # 상세 문서
```

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.11
- PostgreSQL >= 15
- Redis >= 7.0

### 설치

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일 편집 필요

# 데이터베이스 마이그레이션
pnpm db:migrate

# 개발 서버 실행
pnpm dev
```

### 개별 앱 실행

```bash
# 백엔드 API
pnpm api:dev

# 모바일 앱 (Expo)
pnpm mobile:dev

# Python 워커
pnpm workers:dev
```

## 📚 기술 스택

### Frontend (Mobile)
- React Native + Expo
- React Native Skia (캔버스)
- TanStack Query (상태 관리)
- React Navigation
- NativeWind (Tailwind CSS)

### Backend
- NestJS (TypeScript)
- GraphQL (Apollo Server)
- Prisma ORM
- PostgreSQL + pgvector
- Redis (캐싱)

### Workers
- Python 3.11+
- FastAPI
- Celery (작업 큐)
- OpenCV / Tesseract (OCR)
- Pillow (이미지 처리)

### Infra & DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS S3 / Google Cloud Storage
- CloudFront / Cloud CDN
- Firebase (Dynamic Links, FCM)

### Analytics & Monitoring
- Segment / Amplitude
- GrowthBook (A/B Testing)
- Sentry (에러 트래킹)

## 🗓️ 개발 로드맵

### Phase 1: 베타 버전 (12주)
- [x] 프로젝트 구조 및 모노레포 설정
- [ ] 백엔드 API 서버 구축
- [ ] 데이터베이스 스키마 설계
- [ ] 모바일 앱 기본 UI/UX
- [ ] 옷장 인벤토리 CRUD
- [ ] 이메일/공유 인입 기능
- [ ] 스티커 코디 캔버스
- [ ] 날씨 기반 코디 추천
- [ ] 룩 저장/공유 기능

### Phase 2: 고도화
- [ ] 체형 프리셋 시스템
- [ ] 개인화 재랭킹 알고리즘
- [ ] 인플루언서 Public Closet
- [ ] 2차 거래 연계
- [ ] 어필리에이트 정식화

## 🔐 보안 & 개인정보

- PII 데이터 분리 저장
- 이메일 접근 동의 명시
- 데이터 보관기간 정책
- GDPR/CCPA 준수
- End-to-end 암호화 (민감 정보)

## 📄 라이선스

Private - All Rights Reserved

## 👥 팀

- Product: [Your Name]
- Backend: [Your Name]
- Mobile: [Your Name]
- AI/ML: [Your Name]

---

**Made with ❤️ for fashion lovers**
