/**
 * Home Screen - Duolingo-Style Learning Path
 *
 * Vertical scrolling staircase showing user's personalized learning path
 * This is the main homepage featuring the beautiful staircase design
 */

import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useState, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

// Mock medals data (achievements)
const MOCK_MEDALS = [
  {
    id: 'medal_1',
    emoji: '🥇',
    title: 'First Stair Completed',
    description: 'Completed your first learning stair',
    tier: 'gold',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'medal_2',
    emoji: '🔥',
    title: '7 Day Streak',
    description: 'Maintained a 7-day learning streak',
    tier: 'gold',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'medal_3',
    emoji: '📚',
    title: 'Vocabulary Master',
    description: 'Learned 100 new words',
    tier: 'silver',
    unlockedAt: null, // Locked
  },
];

// Mock staircase data (will be replaced with real data from database)
const MOCK_STAIRS = [
  {
    id: '1',
    order: 1,
    title: 'Professional Greetings',
    emoji: '👋',
    description: 'Master formal introductions for job interviews',
    status: 'completed' as const,
    vocabulary_count: 25,
    estimated_days: 2,
  },
  {
    id: '2',
    order: 2,
    title: 'Self Introduction',
    emoji: '💼',
    description: 'Present your background and experience confidently',
    status: 'current' as const,
    vocabulary_count: 35,
    estimated_days: 3,
  },
  {
    id: '3',
    order: 3,
    title: 'Discussing Experience',
    emoji: '📊',
    description: 'Talk about your work history and achievements',
    status: 'locked' as const,
    vocabulary_count: 45,
    estimated_days: 4,
  },
  {
    id: '4',
    order: 4,
    title: 'Strengths & Weaknesses',
    emoji: '💪',
    description: 'Answer common interview questions professionally',
    status: 'locked' as const,
    vocabulary_count: 40,
    estimated_days: 3,
  },
  {
    id: '5',
    order: 5,
    title: 'Salary Negotiation',
    emoji: '💰',
    description: 'Discuss compensation with confidence',
    status: 'locked' as const,
    vocabulary_count: 50,
    estimated_days: 5,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [weeklyPoints, setWeeklyPoints] = useState(1000);
  const [streak, setStreak] = useState(8);

  const handleStairPress = (stairId: string, status: string) => {
    if (status === 'locked') {
      // Show locked message
      return;
    }

    // Navigate to lesson flow for this stair
    console.log('Starting stair:', stairId);
    router.push(`/lesson/${stairId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1F3A' }} edges={['top']}>
      <View
        style={{ flex: 1 }}
      >
        {/* Sticky Header - Always Visible */}
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            backgroundColor: 'transparent',
          }}
        >
          {/* Top Row: Flag, Points, Streak - No Bubbles */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            {/* Language Flag (left) - Clean, no bubble */}
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ fontSize: 32 }}>🇬🇧</Text>
            </TouchableOpacity>

            {/* Points and Streak (right side) - Clean, no bubbles */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              {/* Points - Simple */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 4 }}>⚡</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                  }}
                >
                  {weeklyPoints}
                </Text>
              </View>

              {/* Streak - Simple */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 4 }}>🔥</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                  }}
                >
                  {streak}
                </Text>
              </View>
            </View>
          </View>

          {/* Title - My Roadmap */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              textAlign: 'center',
              letterSpacing: -0.5,
            }}
          >
            My Roadmap
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

          {/* Staircase (Vertical) */}
          <View
            style={{
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing['4xl'],
            }}
          >
            {MOCK_STAIRS.map((stair, index) => (
              <StairCard
                key={stair.id}
                stair={stair}
                index={index}
                onPress={() => handleStairPress(stair.id, stair.status)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function StairCard({
  stair,
  index,
  onPress,
}: {
  stair: typeof MOCK_STAIRS[0];
  index: number;
  onPress: () => void;
}) {
  const getGradientColors = () => {
    if (stair.status === 'completed') {
      return colors.gradients.success;
    }
    if (stair.status === 'current') {
      return colors.gradients.primary;
    }
    return ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'];
  };

  const isLocked = stair.status === 'locked';
  const isCurrent = stair.status === 'current';

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(200 + index * 150).springify()}
      style={{
        marginBottom: spacing.lg,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.9}
        style={{
          borderRadius: borderRadius.xl,
          borderWidth: isCurrent ? 3 : 1,
          borderColor: isCurrent
            ? colors.gradients.primary[0]
            : isLocked
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          opacity: isLocked ? 0.5 : 1,
        }}
      >
        <View
          style={{
            backgroundColor: isCurrent ? colors.gradients.primary[0] : 'rgba(255, 255, 255, 0.05)',
            padding: spacing.lg,
            shadowColor: isCurrent ? colors.glow.primary : 'transparent',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isCurrent ? 0.6 : 0,
            shadowRadius: isCurrent ? 20 : 0,
            elevation: isCurrent ? 12 : 0,
          }}
        >
          {/* Stair Number Badge */}
          <View
            style={{
              position: 'absolute',
              top: spacing.md,
              right: spacing.md,
              width: 32,
              height: 32,
              borderRadius: borderRadius.full,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              {stair.order}
            </Text>
          </View>

          {/* User Crown (for current stair) */}
          {isCurrent && (
            <View
              style={{
                position: 'absolute',
                top: spacing.md,
                left: spacing.md,
                width: 40,
                height: 40,
                borderRadius: borderRadius.full,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>👑</Text>
            </View>
          )}

          {/* Lock Icon (for locked stairs) */}
          {isLocked && (
            <View
              style={{
                position: 'absolute',
                top: spacing.md,
                left: spacing.md,
                width: 40,
                height: 40,
                borderRadius: borderRadius.full,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>🔒</Text>
            </View>
          )}

          {/* Content */}
          <View style={{ marginTop: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={{ fontSize: 48, marginRight: spacing.md }}>{stair.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    marginBottom: 4,
                  }}
                >
                  {stair.title}
                </Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                  }}
                >
                  {stair.description}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.lg,
                marginTop: spacing.md,
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, marginRight: spacing.xs }}>📝</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                  }}
                >
                  {stair.vocabulary_count} words
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, marginRight: spacing.xs }}>⏱️</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                  }}
                >
                  {stair.estimated_days} days
                </Text>
              </View>
              {stair.status === 'current' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20 }}>🎯</Text>
                </View>
              )}
              {stair.status === 'completed' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20 }}>✅</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
