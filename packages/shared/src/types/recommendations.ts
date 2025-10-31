/**
 * 코디 추천 관련 타입 정의
 */

import { WeatherInfo } from './outfits';

export interface Recommendation {
  id: string;
  userId: string;
  date: Date;
  occasion?: string;
  weather: WeatherInfo;
  options: RecommendationOption[];
  selectedIndex?: number;
  feedback?: RecommendationFeedback;
  createdAt: Date;
}

export interface RecommendationOption {
  outfitId?: string;
  items: RecommendedItem[];
  score: number;
  reason?: string;
}

export interface RecommendedItem {
  itemId?: string; // null이면 보유하지 않은 아이템
  category: string;
  name?: string;
  imageUrl?: string;
  recommendUrl?: string; // 구매 링크 (보유하지 않은 경우)
}

export enum RecommendationFeedback {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  SKIP = 'SKIP',
}

export interface GetRecommendationsInput {
  date: Date;
  occasion?: string;
  weather?: WeatherInfo;
  bodyType?: string;
}

export interface RecommendationContext {
  userId: string;
  date: Date;
  weather: WeatherInfo;
  occasion?: string;
  userProfile?: {
    bodyType?: string;
    height?: number;
    weight?: number;
    preferences?: Record<string, any>;
  };
  availableItems: string[]; // 사용 가능한 아이템 ID 목록
}
