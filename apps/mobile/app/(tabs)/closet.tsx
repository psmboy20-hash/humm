import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Dimensions,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { request } from '../../lib/api/client';
import { GET_CLOTHING_ITEMS } from '../../lib/api/queries';
import type { ClothingItem, GetClothingItemsResponse } from '../../lib/api/types';

const { width } = Dimensions.get('window');

// 그리드 열 계산 (디자인 가이드 기준)
const getColumnCount = () => {
  if (width <= 360) return 2;
  if (width <= 430) return 3;
  return 4;
};

const COLUMNS = getColumnCount();
const SPACING = 8;
const TILE_SIZE = (width - (SPACING * (COLUMNS + 1))) / COLUMNS;

// 카테고리 필터
const CATEGORIES = [
  { id: 'ALL', label: '전체', icon: 'apps-outline' },
  { id: 'TOP', label: '상의', icon: 'shirt-outline' },
  { id: 'BOTTOM', label: '하의', icon: 'fitness-outline' },
  { id: 'OUTER', label: '아우터', icon: 'layers-outline' },
  { id: 'SHOES', label: '신발', icon: 'footsteps-outline' },
];

export default function ClosetScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 옷장 아이템 불러오기
  const fetchClothingItems = async (category?: string) => {
    try {
      const data = await request<GetClothingItemsResponse>(GET_CLOTHING_ITEMS, {
        category: category && category !== 'ALL' ? category : undefined,
      });
      setItems(data.items.items);
    } catch (error) {
      console.error('Failed to fetch clothing items:', error);
      Alert.alert('오류', '옷장 아이템을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchClothingItems();
  }, []);

  // 카테고리 변경 시 데이터 다시 로드
  useEffect(() => {
    if (!loading) {
      fetchClothingItems(selectedCategory);
    }
  }, [selectedCategory]);

  // 새로고침
  const handleRefresh = () => {
    setRefreshing(true);
    fetchClothingItems(selectedCategory);
  };

  // 아이템 카드 렌더링
  const renderItem = ({ item }: { item: ClothingItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, { width: TILE_SIZE, height: TILE_SIZE }]}
      onPress={() => router.push(`/items/${item.id}`)}
      activeOpacity={0.8}
    >
      {/* 누끼 이미지 (실제로는 silhouetteUrl 사용) */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.itemImage}
          resizeMode="contain"
        />
      </View>
      
      {/* 메타 정보 */}
      <View style={styles.itemMeta}>
        <Text style={styles.brandText} numberOfLines={1}>
          {item.brand}
        </Text>
        <Text style={styles.sizeText}>
          {item.size} · {item.color}
        </Text>
      </View>

      {/* 착용 횟수 배지 (많이 입은 옷) */}
      {item.wearCount >= 5 && (
        <View style={styles.popularBadge}>
          <Ionicons name="flame" size={12} color="#FF6B6B" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>내 옷장</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 카테고리 필터 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.filterChip,
              selectedCategory === cat.id && styles.filterChipActive
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons 
              name={cat.icon as any} 
              size={16} 
              color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[
              styles.filterText,
              selectedCategory === cat.id && styles.filterTextActive
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 통계 카드 */}
      {!loading && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{items.length}</Text>
            <Text style={styles.statLabel}>아이템</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Set(items.map(i => i.category)).size}
            </Text>
            <Text style={styles.statLabel}>카테고리</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {items.reduce((sum, i) => sum + i.wearCount, 0)}
            </Text>
            <Text style={styles.statLabel}>총 착용</Text>
          </View>
        </View>
      )}

      {/* 옷장 그리드 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5C6BFF" />
          <Text style={styles.loadingText}>옷장 불러오는 중...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="shirt-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>옷장이 비어있습니다</Text>
          <Text style={styles.emptySubtitle}>
            쇼핑몰에서 상품을 공유하여 자동으로 추가하세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={COLUMNS}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* 플로팅 추가 버튼 */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/inbox')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#5C6BFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C6BFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
  },
  gridContent: {
    padding: SPACING,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: SPACING / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#F6F7F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemMeta: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  sizeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5C6BFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5C6BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
});
