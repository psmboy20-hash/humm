import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsNumber, 
  IsDate, 
  IsArray, 
  IsBoolean,
  Min,
  IsUrl 
} from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

// Enums
export enum ItemCategory {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  OUTER = 'OUTER',
  DRESS = 'DRESS',
  SHOES = 'SHOES',
  BAG = 'BAG',
  ACCESSORY = 'ACCESSORY',
}

export enum ItemSeason {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  FALL = 'FALL',
  WINTER = 'WINTER',
  ALL_SEASON = 'ALL_SEASON',
}

export enum SourceType {
  MANUAL = 'MANUAL',
  EMAIL = 'EMAIL',
  SHARED_URL = 'SHARED_URL',
  SCREENSHOT = 'SCREENSHOT',
}

// GraphQL Enum 등록
registerEnumType(ItemCategory, { name: 'ItemCategory' });
registerEnumType(ItemSeason, { name: 'ItemSeason' });
registerEnumType(SourceType, { name: 'SourceType' });

// ============================================
// Create Item Input
// ============================================

@InputType()
export class CreateItemInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ItemCategory)
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  size?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => ItemSeason, { nullable: true })
  @IsOptional()
  @IsEnum(ItemSeason)
  season?: ItemSeason;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  purchaseDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  productUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => SourceType, { nullable: true })
  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;

  @Field({ nullable: true })
  @IsOptional()
  sourceRawData?: Record<string, any>;
}

// ============================================
// Update Item Input
// ============================================

@InputType()
export class UpdateItemInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => ItemCategory, { nullable: true })
  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  size?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => ItemSeason, { nullable: true })
  @IsOptional()
  @IsEnum(ItemSeason)
  season?: ItemSeason;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  purchaseDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  productUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

// ============================================
// Filter & Sort
// ============================================

@InputType()
export class ItemFilters {
  @Field(() => ItemCategory, { nullable: true })
  @IsOptional()
  category?: ItemCategory;

  @Field(() => ItemSeason, { nullable: true })
  @IsOptional()
  season?: ItemSeason;

  @Field({ nullable: true })
  @IsOptional()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  isArchived?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  search?: string;
}

export class ItemSortOptions {
  field: 'createdAt' | 'updatedAt' | 'name' | 'purchaseDate' | 'wearCount';
  order: 'asc' | 'desc';
}

// ============================================
// Response Types
// ============================================

@ObjectType()
export class ItemsResponse {
  @Field(() => [ItemType])
  items: ItemType[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class ItemType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  name: string;

  @Field(() => ItemCategory)
  category: ItemCategory;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => ItemSeason, { nullable: true })
  season?: ItemSeason;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  silhouetteUrl?: string;

  @Field({ nullable: true })
  productUrl?: string;

  @Field(() => [String])
  tags: string[];

  @Field({ nullable: true })
  notes?: string;

  @Field()
  isArchived: boolean;

  @Field()
  wearCount: number;

  @Field({ nullable: true })
  lastWornAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
