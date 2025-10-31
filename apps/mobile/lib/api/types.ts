/**
 * API Type Definitions
 * 
 * GraphQL API 응답 타입 정의
 */

// ============================================
// Enums
// ============================================

export enum IngestSourceType {
  SHARE = 'SHARE',
  EMAIL = 'EMAIL',
  SCREENSHOT = 'SCREENSHOT',
  MANUAL = 'MANUAL',
}

export enum InboxStatus {
  PENDING = 'PENDING',
  PARSED = 'PARSED',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  ERROR = 'ERROR',
}

export enum ClothingCategory {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  OUTER = 'OUTER',
  DRESS = 'DRESS',
  SHOES = 'SHOES',
  BAG = 'BAG',
  ACCESSORY = 'ACCESSORY',
}

// ============================================
// Inbox Types
// ============================================

export interface InboxItem {
  id: string;
  sourceType: IngestSourceType;
  status: InboxStatus;
  productName: string;
  brand?: string;
  imageUrl?: string;
  price?: number;
  category?: string;
  sharedFrom?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface IngestShareInput {
  url: string;
  sharedFrom?: string;
}

export interface IngestResponse {
  success: boolean;
  message?: string;
  inboxItemId?: string;
  error?: string;
}

export interface ConfirmInboxInput {
  inboxItemId: string;
  category: string;
  customName?: string;
  size?: string;
  color?: string;
}

// ============================================
// Clothing Item Types
// ============================================

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  brand?: string;
  price?: number;
  imageUrl: string;
  silhouetteUrl?: string; // 배경 제거된 투명 PNG
  size?: string;
  color?: string;
  season?: string[];
  purchaseDate?: string;
  purchasePrice?: number;
  wearCount: number;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export interface UpdateItemInput {
  name?: string;
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  season?: string[];
  tags?: string[];
  notes?: string;
}

// ============================================
// Outfit Types
// ============================================

export interface Outfit {
  id: string;
  name: string;
  imageUrl?: string;
  items: ClothingItem[];
  tags: string[];
  createdAt: string;
  wearCount: number;
}

export interface CreateOutfitInput {
  name: string;
  itemIds: string[];
  tags?: string[];
  imageUrl?: string;
}

// ============================================
// Statistics Types
// ============================================

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface ClosetStats {
  totalItems: number;
  categoryBreakdown: CategoryBreakdown[];
  totalValue: number;
  mostWornItem?: {
    id: string;
    name: string;
    wearCount: number;
  };
  recentlyAdded: {
    id: string;
    name: string;
    createdAt: string;
  }[];
}

// ============================================
// Response Types
// ============================================

export interface GetInboxItemsResponse {
  inboxItems: InboxItem[];
}

export interface GetClothingItemsResponse {
  items: {
    items: ClothingItem[];
    total: number;
  };
}

export interface GetOutfitsResponse {
  outfits: Outfit[];
}

export interface GetClosetStatsResponse {
  closetStats: ClosetStats;
}
