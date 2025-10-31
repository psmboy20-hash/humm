/**
 * 옷장 아이템 관련 타입 정의
 */

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

export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  category: ItemCategory;
  brand?: string;
  size?: string;
  color?: string;
  season?: ItemSeason;
  purchaseDate?: Date;
  price?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  silhouetteUrl?: string;
  productUrl?: string;
  tags: string[];
  notes?: string;
  metadata?: Record<string, any>;
  imageHash?: string;
  isArchived: boolean;
  wearCount: number;
  lastWornAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemSource {
  id: string;
  itemId: string;
  sourceType: SourceType;
  rawData?: Record<string, any>;
  confidence?: number;
  parsedAt: Date;
}

export interface CreateItemInput {
  name: string;
  category: ItemCategory;
  brand?: string;
  size?: string;
  color?: string;
  season?: ItemSeason;
  purchaseDate?: Date;
  price?: number;
  imageUrl?: string;
  productUrl?: string;
  tags?: string[];
  notes?: string;
  sourceType?: SourceType;
  sourceRawData?: Record<string, any>;
}

export interface UpdateItemInput {
  name?: string;
  category?: ItemCategory;
  brand?: string;
  size?: string;
  color?: string;
  season?: ItemSeason;
  purchaseDate?: Date;
  price?: number;
  imageUrl?: string;
  productUrl?: string;
  tags?: string[];
  notes?: string;
  isArchived?: boolean;
}

export interface ItemFilters {
  category?: ItemCategory;
  season?: ItemSeason;
  brand?: string;
  color?: string;
  isArchived?: boolean;
  tags?: string[];
  search?: string;
}

export interface ItemSortOptions {
  field: 'createdAt' | 'updatedAt' | 'name' | 'purchaseDate' | 'wearCount';
  order: 'asc' | 'desc';
}
