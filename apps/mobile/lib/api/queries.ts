/**
 * GraphQL Queries & Mutations
 * 
 * Virtual Closet API 쿼리 정의
 */

import { gql } from 'graphql-request';

// ============================================
// Inbox Queries & Mutations
// ============================================

/**
 * URL 공유로 상품 정보 수집
 * (Share 버튼 플로우)
 */
export const INGEST_SHARE = gql`
  mutation IngestShare($input: IngestShareInput!) {
    ingestShare(input: $input) {
      success
      message
      inboxItemId
      error
    }
  }
`;

/**
 * 인박스 아이템 목록 조회
 */
export const GET_INBOX_ITEMS = gql`
  query GetInboxItems {
    inboxItems {
      id
      sourceType
      status
      productName
      brand
      imageUrl
      price
      category
      sharedFrom
      createdAt
    }
  }
`;

/**
 * 인박스 아이템 확인 (카테고리 선택)
 * - 옷장으로 자동 이동
 */
export const CONFIRM_INBOX_ITEM = gql`
  mutation ConfirmInboxItem($input: ConfirmInboxInput!) {
    confirmInboxItem(input: $input) {
      id
      name
      category
      brand
      price
      imageUrl
      silhouetteUrl
      size
      color
      season
      purchaseDate
      purchasePrice
      wearCount
      tags
      createdAt
    }
  }
`;

/**
 * 인박스 아이템 거절
 */
export const REJECT_INBOX_ITEM = gql`
  mutation RejectInboxItem($inboxItemId: String!) {
    rejectInboxItem(inboxItemId: $inboxItemId) {
      success
      message
    }
  }
`;

// ============================================
// Closet Queries & Mutations
// ============================================

/**
 * 옷장 아이템 목록 조회
 */
export const GET_CLOTHING_ITEMS = gql`
  query GetClothingItems($category: String) {
    items(category: $category) {
      items {
        id
        name
        category
        brand
        price
        imageUrl
        size
        color
        season
        wearCount
        tags
        createdAt
      }
      total
    }
  }
`;

/**
 * 단일 아이템 상세 조회
 */
export const GET_CLOTHING_ITEM = gql`
  query GetClothingItem($id: String!) {
    item(id: $id) {
      id
      name
      category
      brand
      price
      imageUrl
      silhouetteUrl
      size
      color
      season
      purchaseDate
      purchasePrice
      wearCount
      tags
      createdAt
      notes
    }
  }
`;

/**
 * 아이템 수정
 */
export const UPDATE_CLOTHING_ITEM = gql`
  mutation UpdateClothingItem($id: String!, $input: UpdateItemInput!) {
    updateItem(id: $id, input: $input) {
      id
      name
      category
      brand
      size
      color
      season
      tags
      notes
    }
  }
`;

/**
 * 아이템 삭제
 */
export const DELETE_CLOTHING_ITEM = gql`
  mutation DeleteClothingItem($id: String!) {
    deleteItem(id: $id) {
      success
      message
    }
  }
`;

// ============================================
// Outfit Queries & Mutations
// ============================================

/**
 * 코디 목록 조회
 */
export const GET_OUTFITS = gql`
  query GetOutfits {
    outfits {
      id
      name
      imageUrl
      items {
        id
        name
        category
        imageUrl
      }
      tags
      createdAt
      wearCount
    }
  }
`;

/**
 * 코디 생성
 */
export const CREATE_OUTFIT = gql`
  mutation CreateOutfit($input: CreateOutfitInput!) {
    createOutfit(input: $input) {
      id
      name
      imageUrl
      items {
        id
        name
        category
      }
      tags
      createdAt
    }
  }
`;

/**
 * 코디 삭제
 */
export const DELETE_OUTFIT = gql`
  mutation DeleteOutfit($id: String!) {
    deleteOutfit(id: $id) {
      success
      message
    }
  }
`;

// ============================================
// Statistics Queries
// ============================================

/**
 * 옷장 통계 조회
 */
export const GET_CLOSET_STATS = gql`
  query GetClosetStats {
    closetStats {
      totalItems
      categoryBreakdown {
        category
        count
      }
      totalValue
      mostWornItem {
        id
        name
        wearCount
      }
      recentlyAdded {
        id
        name
        createdAt
      }
    }
  }
`;
