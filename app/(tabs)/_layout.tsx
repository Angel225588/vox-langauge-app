/**
 * Tab Layout - 5-Tab Structure
 *
 * Tab 1: Home - Duolingo-style learning path with staircase
 * Tab 2: Vocabulary - Word Bank with all learned words
 * Tab 3: Practice - Independent tools, games, and exercises
 * Tab 4: Community - Social features and practice with others
 * Tab 5: Profile - User settings, stats, and achievements
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0036FF', // Electric blue to match dark mode theme
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
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: 'Words',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, size }) => <Ionicons name="fitness-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

      {/* Hidden screens - Keep these for backwards compatibility but don't show in tab bar */}
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
      <Tabs.Screen
        name="icon-demo"
        options={{
          href: null, // Hide from tab bar - development only
        }}
      />
    </Tabs>
  );
}
