/**
 * Home Screen - Duolingo-Style Learning Path
 *
 * Vertical scrolling staircase showing user's personalized learning path
 * This is the main homepage featuring the beautiful staircase design
 */

import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useState, useEffect } from 'react';
import { VoxIcon } from '@/components/ui/rewards';
import { Icon } from '@/components/ui/Icon';
import { CalibratorBanner } from '@/components/learning/CalibratorBanner';
import { useLearningPath, StairForDisplay } from '@/hooks/useLearningPath';
import { CondensedStairCard } from '@/components/staircase';
import { supabase } from '@/lib/db/supabase';
import { getStoredLevel, getFeatureAccess, getVoiceUnlockMessage } from '@/lib/utils/levelGating';
import { LinearGradient } from 'expo-linear-gradient';

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
  const { t } = useTranslation('home');
  // Default to 0 - will be populated from user data when available
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<string | null>(null);

  // Get user's proficiency level for feature gating
  useEffect(() => {
    const loadUserLevel = async () => {
      const level = await getStoredLevel();
      setUserLevel(level);
    };
    loadUserLevel();
  }, []);

  const featureAccess = getFeatureAccess(userLevel);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Use the learning path hook - falls back to mock data if no path exists
  const { stairs: realStairs, isLoading, hasPath, completeStair } = useLearningPath(userId);

  // Use real stairs if available, otherwise use mock data
  const stairs = hasPath && realStairs.length > 0 ? realStairs : MOCK_STAIRS;

  const handleStairPress = (stairId: string, status: string) => {
    if (status === 'locked') {
      // Show locked message
      return;
    }

    // Navigate to lesson flow for this stair
    console.log('Starting stair:', stairId);
    router.push(`/lesson/${stairId}`);
  };

  // Determine calibrator status based on stairs completion
  const completedStairs = stairs.filter(s => s.status === 'completed').length;
  const totalStairs = stairs.length;
  const calibratorStatus = completedStairs >= totalStairs
    ? 'ready'
    : completedStairs > 0
      ? 'locked'
      : 'locked';

  const handleCalibratorStart = () => {
    console.log('Starting calibrator assessment');
    // TODO: Navigate to calibrator flow
    // router.push('/calibrator/1');
  };

  const handleSkillPress = (skill: 'speaking' | 'listening' | 'writing') => {
    console.log('Starting skill calibration:', skill);
    // TODO: Navigate to specific skill calibration
    // router.push(`/calibrator/${skill}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
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

            {/* Points and Streak (right side) - Clean, with proper icons */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              {/* Vox Points - Using VoxIcon */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <VoxIcon size="sm" />
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    marginLeft: spacing.xs,
                  }}
                >
                  {weeklyPoints}
                </Text>
              </TouchableOpacity>

              {/* Streak - Using Icon component */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <Icon name="flame" size="lg" color="warning" />
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    marginLeft: spacing.xs,
                  }}
                >
                  {streak}
                </Text>
              </TouchableOpacity>
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
            {t('title')}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

          {/* Level-Gated Voice CTA */}
          {featureAccess.showVoiceCTA && (
            <Animated.View
              entering={FadeInDown.duration(600).delay(100)}
              style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}
            >
              <TouchableOpacity
                onPress={() => router.push('/voice-conversation')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: borderRadius.xl,
                    padding: spacing.lg,
                    ...shadows.glow.primary,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: borderRadius.full,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.md,
                    }}>
                      <Text style={{ fontSize: 28 }}>🎙️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.primary,
                        marginBottom: spacing.xs,
                      }}>
                        Practice Speaking
                      </Text>
                      <Text style={{
                        fontSize: typography.fontSize.sm,
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}>
                        Have a real conversation with AI • {featureAccess.cefr} Level
                      </Text>
                    </View>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.full,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 20 }}>→</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Voice Unlock Teaser for Beginners */}
          {featureAccess.showVoiceTeaser && (
            <Animated.View
              entering={FadeInDown.duration(600).delay(100)}
              style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}
            >
              <View
                style={{
                  borderRadius: borderRadius.xl,
                  padding: spacing.lg,
                  backgroundColor: colors.background.card,
                  borderWidth: 1,
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  borderStyle: 'dashed',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: borderRadius.full,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.md,
                  }}>
                    <Text style={{ fontSize: 28 }}>🔒</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                    }}>
                      Voice Conversations
                    </Text>
                    <Text style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}>
                      {getVoiceUnlockMessage(userLevel)}
                    </Text>
                  </View>
                </View>
                {/* Progress indicator */}
                <View style={{ marginTop: spacing.md }}>
                  <View style={{
                    height: 4,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderRadius: borderRadius.full,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      width: userLevel === 'elementary' ? '60%' : '30%',
                      height: '100%',
                      backgroundColor: colors.primary.DEFAULT,
                      borderRadius: borderRadius.full,
                    }} />
                  </View>
                  <Text style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    marginTop: spacing.xs,
                    textAlign: 'right',
                  }}>
                    {userLevel === 'elementary' ? 'Almost there!' : 'Keep learning!'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={{ color: colors.text.secondary, marginTop: spacing.md }}>
                {t('loading')}
              </Text>
            </View>
          )}

          {/* Staircase (Vertical) */}
          {!isLoading && (
            <View
              style={{
                paddingHorizontal: spacing.xl,
                paddingBottom: spacing.lg,
              }}
            >
              {stairs.map((stair, index) => (
                <CondensedStairCard
                  key={stair.id}
                  stair={stair}
                  index={index}
                  onPress={() => handleStairPress(stair.id, stair.status)}
                />
              ))}
            </View>
          )}

          {/* Calibrator Banner - After each section */}
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}>
            <CalibratorBanner
              sectionNumber={1}
              status={calibratorStatus}
              onStart={handleCalibratorStart}
              onSkillPress={handleSkillPress}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

