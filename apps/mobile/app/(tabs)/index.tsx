import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 임시 데이터
const MOCK_ITEMS = [
  { id: '1', name: '화이트 셔츠', category: 'TOP', brand: 'Uniqlo', imageUrl: null },
  { id: '2', name: '블랙 진', category: 'BOTTOM', brand: 'Levi\'s', imageUrl: null },
  { id: '3', name: '가죽 자켓', category: 'OUTER', brand: 'Zara', imageUrl: null },
];

export default function ClosetScreen() {
  const router = useRouter();
  const [items] = useState(MOCK_ITEMS);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 옷장</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/items/add')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>상의</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>하의</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>아우터</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.itemCard}
            onPress={() => router.push(`/items/${item.id}`)}
          >
            <View style={styles.itemImage}>
              <Ionicons name="shirt-outline" size={64} color="#9ca3af" />
            </View>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemBrand} numberOfLines={1}>
              {item.brand}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: 'white',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  itemCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    maxWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 12,
    color: '#6b7280',
  },
});
