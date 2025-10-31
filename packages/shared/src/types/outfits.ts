/**
 * 코디 관련 타입 정의
 */

import { ItemSeason } from './items';

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  occasion?: string;
  season?: ItemSeason;
  imageUrl?: string;
  thumbnailUrl?: string;
  weather?: WeatherInfo;
  tags: string[];
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  items: OutfitItem[];
}

export interface OutfitItem {
  id: string;
  outfitId: string;
  itemId?: string;
  layer: number;
  position: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  isRecommended: boolean;
  recommendUrl?: string;
  createdAt: Date;
}

export interface WeatherInfo {
  temperature: number; // 섭씨
  condition: string; // SUNNY, CLOUDY, RAINY, SNOWY
  humidity?: number;
  windSpeed?: number;
}

export interface CreateOutfitInput {
  name: string;
  description?: string;
  occasion?: string;
  season?: ItemSeason;
  tags?: string[];
  isPublic?: boolean;
  items: CreateOutfitItemInput[];
}

export interface CreateOutfitItemInput {
  itemId?: string;
  layer: number;
  position: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  isRecommended?: boolean;
  recommendUrl?: string;
}

export interface UpdateOutfitInput {
  name?: string;
  description?: string;
  occasion?: string;
  season?: ItemSeason;
  tags?: string[];
  isPublic?: boolean;
}

export interface OutfitFilters {
  season?: ItemSeason;
  occasion?: string;
  isPublic?: boolean;
  tags?: string[];
  search?: string;
}
