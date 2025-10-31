import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';

// 인입 소스 타입
export enum IngestSourceType {
  SHARE = 'SHARE',           // 공유하기
  EMAIL = 'EMAIL',           // 이메일 파싱
  SCREENSHOT = 'SCREENSHOT', // 스크린샷 OCR
  MANUAL = 'MANUAL',         // 수동 입력 (예외)
}

// 인박스 아이템 상태
export enum InboxStatus {
  PENDING = 'PENDING',       // 파싱 대기
  PARSED = 'PARSED',         // 파싱 완료, 사용자 확인 대기
  CONFIRMED = 'CONFIRMED',   // 사용자 확인 완료 → 옷장 이동
  REJECTED = 'REJECTED',     // 사용자 거부
  ERROR = 'ERROR',           // 파싱 실패
}

registerEnumType(IngestSourceType, { name: 'IngestSourceType' });
registerEnumType(InboxStatus, { name: 'InboxStatus' });

// ============================================
// Ingest Share URL Input
// ============================================

@InputType()
export class IngestShareInput {
  @Field()
  @IsUrl()
  url: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sharedFrom?: string; // 앱 이름 (예: 지그재그, 무신사)
}

// ============================================
// Inbox Item Type
// ============================================

@ObjectType()
export class InboxItemType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => IngestSourceType)
  sourceType: IngestSourceType;

  @Field(() => InboxStatus)
  status: InboxStatus;

  // 파싱된 메타데이터
  @Field({ nullable: true })
  productName?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  productUrl?: string;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  color?: string;

  // 원본 데이터 (JSON)
  rawData?: any;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ============================================
// Confirm Inbox Item Input
// ============================================

@InputType()
export class ConfirmInboxInput {
  @Field()
  @IsString()
  inboxItemId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string; // 사용자가 카테고리 수정

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string; // 상품명 수정

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;
}

// ============================================
// Ingest Response
// ============================================

@ObjectType()
export class IngestResponse {
  @Field()
  success: boolean;

  @Field()
  inboxItemId: string;

  @Field({ nullable: true })
  message?: string;
}
