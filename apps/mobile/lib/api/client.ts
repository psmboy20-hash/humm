/**
 * GraphQL API Client
 * 
 * Virtual Closet API 연결 설정
 */

import { GraphQLClient } from 'graphql-request';

// API 엔드포인트 설정
// Sandbox 환경: 공개 URL 사용
// 프로덕션: 실제 서버 URL
const API_URL = __DEV__ 
  ? 'https://4000-ie9wpiu3cp58a236iuzwi-82b888ba.sandbox.novita.ai/graphql'
  : 'https://api.virtualcloset.app/graphql';

// GraphQL 클라이언트 인스턴스
export const graphqlClient = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
  // 요청 타임아웃 설정 (10초)
  timeout: 10000,
});

/**
 * API 요청 래퍼 함수
 * - 에러 핸들링
 * - 로깅 (개발 환경)
 */
export async function request<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    if (__DEV__) {
      console.log('🔵 GraphQL Request:', { query, variables });
    }

    const data = await graphqlClient.request<T>(query, variables);

    if (__DEV__) {
      console.log('🟢 GraphQL Response:', data);
    }

    return data;
  } catch (error) {
    if (__DEV__) {
      console.error('🔴 GraphQL Error:', error);
    }
    throw error;
  }
}

/**
 * 인증 토큰 설정
 * (향후 사용자 인증 구현 시 사용)
 */
export function setAuthToken(token: string | null) {
  if (token) {
    graphqlClient.setHeader('Authorization', `Bearer ${token}`);
  } else {
    graphqlClient.setHeader('Authorization', '');
  }
}
