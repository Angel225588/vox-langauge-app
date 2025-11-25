/**
 * Tab Layout - Clean 4-Tab Structure
 *
 * Tab 1: Home - Duolingo-style learning path with staircase
 * Tab 2: Practice - Independent tools, games, and exercises
 * Tab 3: Community - Social features and practice with others
 * Tab 4: Profile - User settings, stats, and achievements
 */

import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1', // Indigo to match dark mode theme
        tabBarInactiveTintColor: '#9CA3AF', // Gray
        tabBarStyle: {
          backgroundColor: '#1F2937', // Dark background
          borderTopColor: '#374151',
          borderTopWidth: 1,
        },
        headerShown: false, // Hide headers for cleaner UI
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🎯</Text>,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>,
        }}
      />

      {/* Hidden screens - Keep staircase for backwards compatibility but don't show in tab bar */}
      <Tabs.Screen
        name="staircase"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
