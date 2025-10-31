import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '옷장',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: '코디',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: '추천',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
