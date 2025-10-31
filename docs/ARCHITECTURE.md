# Virtual Closet Architecture

## 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                │
├─────────────────────────────────────────────────────────────────────┤
│  Mobile App (React Native + Expo)                                   │
│  - 옷장 관리 UI                                                       │
│  - 가상 피팅 캔버스 (React Native Skia)                              │
│  - 코디 추천 뷰                                                       │
│  - 프로필 & 설정                                                      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ GraphQL (Apollo Client)
┌───────────────────────────┴─────────────────────────────────────────┐
│                      Backend API Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│  NestJS API Server                                                   │
│  - GraphQL BFF (Backend for Frontend)                               │
│  - REST Internal APIs                                                │
│  - Authentication & Authorization (JWT)                              │
│  - Business Logic                                                    │
└─────┬──────────────┬──────────────┬──────────────┬─────────────────┘
      │              │              │              │
┌─────┴────┐  ┌──────┴──────┐ ┌────┴─────┐  ┌────┴──────────────────┐
│PostgreSQL│  │    Redis    │ │   S3     │  │  Python Workers       │
│+pgvector │  │   (Cache)   │ │  (CDN)   │  │  - Email Parser       │
└──────────┘  └─────────────┘ └──────────┘  │  - OCR Engine         │
                                             │  - Image Processor    │
                                             └───────────────────────┘
                                                      │
                                              ┌───────┴───────┐
                                              │  Celery Queue │
                                              │    (Redis)    │
                                              └───────────────┘
```

## 주요 컴포넌트

### 1. Mobile App (React Native + Expo)

**역할**: 사용자 인터페이스 제공

**핵심 기능**:
- 옷장 아이템 CRUD 및 필터링
- 이미지 업로드 및 관리
- React Native Skia 기반 가상 피팅 캔버스
- 날씨/일정 기반 코디 추천 뷰
- 이메일/URL 공유 인입

**기술 스택**:
- React Native 0.73+
- Expo SDK 50+
- React Native Skia (캔버스)
- TanStack Query (상태 관리)
- Zustand (로컬 상태)
- GraphQL Request (API 통신)

### 2. Backend API (NestJS)

**역할**: 비즈니스 로직 및 데이터 관리

**핵심 모듈**:
- **Auth Module**: JWT 기반 인증, 소셜 로그인
- **Users Module**: 사용자 프로필, 체형 정보 관리
- **Items Module**: 옷장 아이템 CRUD, 필터링, 검색
- **Outfits Module**: 코디 생성, 수정, 공유
- **Recommendations Module**: 코디 추천 로직, 피드백 수집

**기술 스택**:
- NestJS 10+
- GraphQL (Apollo Server)
- Prisma ORM
- TypeScript
- Redis (캐싱)

### 3. Database (PostgreSQL + pgvector)

**역할**: 영구 데이터 저장

**주요 테이블**:
- `users`: 사용자 계정
- `user_profiles`: 체형, 선호도
- `clothing_items`: 옷장 아이템
- `outfits`: 코디
- `outfit_items`: 코디-아이템 관계
- `recommendations`: 추천 이력
- `email_consents`: 이메일 동의 관리

**특징**:
- pgvector 확장으로 벡터 임베딩 저장 (향후 유사도 검색)
- Prisma 마이그레이션 관리

### 4. Python Workers (FastAPI + Celery)

**역할**: 백그라운드 작업 처리

**주요 워커**:
1. **Email Parser**
   - Gmail/네이버 쇼핑 영수증 파싱
   - 구매 정보 추출 (브랜드, 가격, 날짜, 링크)

2. **OCR Engine**
   - Tesseract OCR
   - 스크린샷에서 텍스트 추출
   - 한글/영어 지원

3. **Image Processor**
   - 리사이징 (썸네일 생성)
   - 배경 제거 (누끼)
   - pHash 기반 중복 감지

**기술 스택**:
- FastAPI
- Celery (작업 큐)
- Redis (메시지 브로커)
- OpenCV (이미지 처리)
- Tesseract OCR
- Pillow

### 5. Storage & CDN

**역할**: 이미지 저장 및 전송 최적화

**구성**:
- **S3/GCS**: 원본 이미지, 썸네일, 누끼 이미지
- **CloudFront/Cloud CDN**: 글로벌 CDN
- **이미지 변환**: 온디맨드 리사이징

### 6. External Services

**Firebase**:
- Dynamic Links (딥링크)
- Cloud Messaging (푸시 알림)

**Weather API**:
- OpenWeatherMap
- 실시간 날씨 데이터 제공

**Analytics**:
- Segment (이벤트 수집)
- Amplitude (행동 분석)
- GrowthBook (A/B 테스팅)

## 데이터 플로우

### 1. 아이템 추가 플로우 (이메일)

```
1. 사용자가 Gmail/네이버 이메일 동의
2. Mobile App → Backend API: 이메일 HTML 전송
3. Backend → Python Worker: 파싱 작업 큐잉
4. Python Worker: 영수증 파싱 → 아이템 정보 추출
5. Worker → Backend: 파싱 결과 전송
6. Backend: ClothingItem 생성 → DB 저장
7. Backend → Mobile: GraphQL 응답
8. Mobile: 아이템 리스트 갱신
```

### 2. 코디 생성 플로우

```
1. 사용자가 옷장에서 아이템 선택
2. Mobile: React Native Skia 캔버스에 아이템 배치
   - 드래그, 확대/축소, 회전
3. 사용자가 저장 버튼 클릭
4. Mobile → Backend: 코디 정보 전송 (아이템 ID, 위치, 레이어)
5. Backend: Outfit + OutfitItem 생성
6. Backend → Mobile: 생성된 코디 반환
7. Mobile: 코디 목록에 추가
```

### 3. 코디 추천 플로우

```
1. 사용자가 추천 탭 진입
2. Mobile → Weather API: 현재 위치 날씨 조회
3. Mobile → Backend: 추천 요청 (날짜, 날씨, 상황)
4. Backend: 
   - 사용자 옷장 아이템 조회
   - 날씨 적합성 필터링
   - 체형 정보 고려
   - 3가지 코디 조합 생성
5. Backend → Mobile: 추천 옵션 3개 반환
6. Mobile: 추천 카드 UI 표시
7. 사용자 선택/피드백 → Backend: 학습 데이터 저장
```

## 보안 & 개인정보 보호

### PII 데이터 관리
- 이메일 액세스 토큰 암호화 저장
- GDPR/CCPA 준수
- 사용자 동의 관리 (`email_consents` 테이블)
- 데이터 보관 기간 명시 (기본 365일)

### 인증 & 인가
- JWT 기반 인증
- 토큰 만료: 7일 (리프레시 가능)
- API Rate Limiting
- CORS 정책

## 확장성 고려사항

### 수평 확장
- NestJS API 서버: 로드밸런서 뒤 다중 인스턴스
- Python Workers: Celery 워커 노드 추가
- Redis: Redis Cluster 구성

### 캐싱 전략
- Redis 캐싱:
  - 사용자 프로필 (TTL: 1시간)
  - 옷장 아이템 리스트 (TTL: 10분)
  - 추천 결과 (TTL: 1시간)

### 데이터베이스 최적화
- 인덱싱: userId, category, isArchived
- 커넥션 풀링: Prisma 자동 관리
- 읽기 복제본: 향후 고려

## 모니터링 & 로깅

### 애플리케이션 로깅
- NestJS: Winston Logger
- Python: structlog
- 로그 레벨: ERROR, WARN, INFO, DEBUG

### 에러 트래킹
- Sentry (프론트엔드 + 백엔드)

### 성능 모니터링
- API 응답 시간 추적
- 데이터베이스 쿼리 성능
- 이미지 처리 시간

## 배포 전략

### 개발 환경
- Docker Compose (로컬)
- 핫 리로드 활성화

### 스테이징 환경
- Kubernetes (GKE/EKS)
- 프로덕션 미러링

### 프로덕션 환경
- Kubernetes 클러스터
- 자동 스케일링
- Blue-Green 배포
- 롤백 전략

## Phase 2 고도화 계획

### 인플루언서 Public Closet
- 인플루언서 전용 웹 콘솔
- 팔로워 시스템
- 인플루언서 옷장 복사 기능

### AI 개인화
- 체형 프리셋 시스템
- 협업 필터링 기반 재랭킹
- 컴퓨터 비전 기반 스타일 추천

### 커머스 연계
- 2차 거래 플랫폼 연동
- 어필리에이트 링크
- 쇼핑몰 제휴

---

**Last Updated**: 2024-01-15
