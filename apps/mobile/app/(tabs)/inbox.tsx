import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { request } from '../../lib/api/client';
import { GET_INBOX_ITEMS, CONFIRM_INBOX_ITEM, REJECT_INBOX_ITEM } from '../../lib/api/queries';
import type { InboxItem, GetInboxItemsResponse, ConfirmInboxInput } from '../../lib/api/types';

// 카테고리 선택 옵션
const CATEGORIES = [
  { id: 'TOP', label: '상의', icon: 'shirt-outline' },
  { id: 'BOTTOM', label: '하의', icon: 'fitness-outline' },
  { id: 'OUTER', label: '아우터', icon: 'layers-outline' },
  { id: 'SHOES', label: '신발', icon: 'footsteps-outline' },
  { id: 'BAG', label: '가방', icon: 'bag-outline' },
];

export default function InboxScreen() {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 인박스 아이템 불러오기
  const fetchInboxItems = async () => {
    try {
      const data = await request<GetInboxItemsResponse>(GET_INBOX_ITEMS);
      // PARSED 상태만 필터링 (클라이언트 사이드)
      const parsedItems = data.inboxItems.filter(item => item.status === 'PARSED');
      setInboxItems(parsedItems);
    } catch (error) {
      console.error('Failed to fetch inbox items:', error);
      Alert.alert('오류', '인박스 아이템을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchInboxItems();
  }, []);

  // 새로고침
  const handleRefresh = () => {
    setRefreshing(true);
    fetchInboxItems();
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  // 소스 타입 아이콘
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'SHARE': return 'share-social-outline';
      case 'EMAIL': return 'mail-outline';
      case 'SCREENSHOT': return 'camera-outline';
      default: return 'add-circle-outline';
    }
  };

  // 아이템 확인 (옷장으로 이동)
  const confirmItem = async (itemId: string, categoryId: string, categoryLabel: string) => {
    try {
      const input: ConfirmInboxInput = {
        inboxItemId: itemId,
        category: categoryId,
      };

      await request(CONFIRM_INBOX_ITEM, { input });

      // 성공 시 로컬 상태 업데이트
      setInboxItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItem(null);
      setSelectedCategory(null);

      Alert.alert(
        '✅ 옷장에 추가',
        `${categoryLabel} 카테고리로 추가되었습니다!`
      );
    } catch (error) {
      console.error('Failed to confirm item:', error);
      Alert.alert('오류', '아이템을 추가하는데 실패했습니다.');
    }
  };

  // 아이템 거부
  const rejectItem = async (itemId: string) => {
    Alert.alert(
      '아이템 삭제',
      '이 아이템을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await request(REJECT_INBOX_ITEM, { inboxItemId: itemId });
              setInboxItems(prev => prev.filter(item => item.id !== itemId));
            } catch (error) {
              console.error('Failed to reject item:', error);
              Alert.alert('오류', '아이템을 삭제하는데 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 카테고리 선택 모달
  const showCategorySelector = (itemId: string) => {
    setSelectedItem(itemId);
  };

  // 인박스 아이템 렌더링
  const renderItem = ({ item }: { item: InboxItem }) => (
    <View style={styles.inboxItem}>
      {/* 썸네일 & 소스 배지 */}
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.thumbnail}
        />
        <View style={styles.sourceBadge}>
          <Ionicons 
            name={getSourceIcon(item.sourceType) as any} 
            size={12} 
            color="#FFFFFF" 
          />
        </View>
      </View>

      {/* 정보 */}
      <View style={styles.itemInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.brandText}>
          {item.brand || '브랜드 미상'} · {item.price ? `${item.price.toLocaleString()}원` : '가격 미상'}
        </Text>
        <Text style={styles.sourceText}>
          {item.sharedFrom ? `${item.sharedFrom}에서 공유됨` : '자동 수집됨'} · {formatTime(item.createdAt)}
        </Text>
      </View>

      {/* 액션 버튼 */}
      {selectedItem === item.id ? (
        <View style={styles.categorySelector}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryButton}
              onPress={() => {
                setSelectedCategory(cat.id);
                confirmItem(item.id, cat.id, cat.label);
              }}
            >
              <Ionicons name={cat.icon as any} size={20} color="#5C6BFF" />
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => rejectItem(item.id)}
          >
            <Ionicons name="close-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => showCategorySelector(item.id)}
          >
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>인박스</Text>
          <Text style={styles.subtitle}>
            {inboxItems.length}개 대기 중
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* 안내 카드 */}
      {inboxItems.length > 0 && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#5C6BFF" />
          <Text style={styles.infoText}>
            카테고리를 선택하면 자동으로 옷장에 추가됩니다
          </Text>
        </View>
      )}

      {/* 인박스 리스트 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5C6BFF" />
          <Text style={styles.loadingText}>인박스 불러오는 중...</Text>
        </View>
      ) : inboxItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>모두 확인했습니다!</Text>
          <Text style={styles.emptySubtitle}>
            쇼핑몰에서 상품을 공유하면 여기에 표시됩니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={inboxItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#5C6BFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  inboxItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  sourceBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5C6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#5C6BFF',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    minWidth: 50,
  },
  categoryLabel: {
    fontSize: 10,
    color: '#5C6BFF',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});
