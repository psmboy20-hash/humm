import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// 임시 코디 데이터
const MOCK_OUTFITS = [
  {
    id: 'outfit_1',
    name: '캐주얼 데일리룩',
    imageUrl: 'https://via.placeholder.com/400x500/F5F5F5/999?text=Casual',
    items: ['화이트 셔츠', '블랙 진', '스니커즈'],
    createdAt: '2025-10-30',
    tags: ['캐주얼', '데일리'],
  },
  {
    id: 'outfit_2',
    name: '포멀 오피스룩',
    imageUrl: 'https://via.placeholder.com/400x500/E5E5E5/666?text=Formal',
    items: ['셔츠', '슬랙스', '구두', '재킷'],
    createdAt: '2025-10-28',
    tags: ['포멀', '오피스'],
  },
];

export default function OutfitsScreen() {
  const router = useRouter();
  const [outfits] = useState(MOCK_OUTFITS);

  const renderOutfit = ({ item }: { item: typeof MOCK_OUTFITS[0] }) => (
    <TouchableOpacity
      style={[styles.outfitCard, { width: CARD_WIDTH }]}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.outfitImage}
      />
      <View style={styles.outfitInfo}>
        <Text style={styles.outfitName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemCount}>
          {item.items.length}개 아이템
        </Text>
        <View style={styles.tagContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>내 코디</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="add-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* 코디 그리드 */}
      {outfits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="layers-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>코디가 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            옷장의 아이템들로 나만의 코디를 만들어보세요
          </Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>코디 만들기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={outfits}
          renderItem={renderOutfit}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 플로팅 추가 버튼 */}
      {outfits.length > 0 && (
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
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
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  gridContent: {
    padding: 16,
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  outfitImage: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    backgroundColor: '#F3F4F6',
  },
  outfitInfo: {
    padding: 12,
  },
  outfitName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#5C6BFF',
    fontWeight: '500',
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
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#5C6BFF',
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
});
