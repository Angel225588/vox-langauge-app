/**
 * Staircase Home Screen
 *
 * Vertical scrolling staircase showing user's personalized learning path
 * Based on the homepage-stairs.jpg reference image
 *
 * Features animated reveal on first visit after onboarding:
 * - Skeleton cards with shimmer animation during loading
 * - 50% threshold trigger to start reveal before all stairs are ready
 * - Sequential card reveal with spring animation (200ms stagger)
 * - Celebration animation on completion (confetti + haptics)
 *
 * Uses real AI-generated data from useLearningPath hook
 */

import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useState, useRef, useCallback } from 'react';
import { StairForDisplay } from '@/hooks/useLearningPath';
import { useAnimatedStaircaseReveal, checkHasSeenStaircaseReveal, clearStaircaseRevealFlag } from '@/hooks/useAnimatedStaircaseReveal';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonStairCard, CondensedStairCard } from '@/components/staircase';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Mock medals data (achievements) - TODO: Replace with real achievements system
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

// Number of skeleton cards to show during loading
const SKELETON_COUNT = 6;

export default function StaircaseScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Confetti animation ref
  const confettiRef = useRef<LottieView>(null);

  // Track if this is first visit (for animated reveal)
  const [isFirstVisit] = useState(() => !checkHasSeenStaircaseReveal(user?.id ?? null));

  // Celebration handler
  const handleCelebrate = useCallback(() => {
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Play confetti animation
    confettiRef.current?.play();
  }, []);

  // Completion handler
  const handleRevealComplete = useCallback(() => {
    console.log('Staircase reveal animation complete!');
  }, []);

  // Use the animated staircase reveal hook
  const {
    phase,
    stairs,
    isCardRevealed,
    shouldShowSkeleton,
    error,
    resetReveal,
    hasSeenReveal,
  } = useAnimatedStaircaseReveal({
    userId: user?.id ?? null,
    isFirstVisit,
    onCelebrate: handleCelebrate,
    onComplete: handleRevealComplete,
  });

  // DEV: Handler to reset the animation for testing
  const handleDevResetAnimation = useCallback(() => {
    if (!__DEV__) return;

    clearStaircaseRevealFlag(user?.id ?? null);
    resetReveal();

    Alert.alert(
      'Animation Reset',
      'The staircase reveal animation has been reset. Pull down to refresh or re-navigate to this screen to see it again.',
      [{ text: 'OK' }]
    );

    console.log('[DEV] Staircase reveal animation reset for user:', user?.id);
  }, [user?.id, resetReveal]);

  const [weeklyPoints, setWeeklyPoints] = useState(1000);
  const [streak, setStreak] = useState(8);

  // Determine if we have a path (stairs exist or are being revealed)
  const hasPath = stairs.length > 0 || phase === 'generating' || phase === 'revealing';
  const isLoading = phase === 'idle' || phase === 'generating';

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
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary, '#1A1F3A']}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Weekly Points and Streaks */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing['2xl'],
            paddingBottom: spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            {/* Language Selector (left) */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.full,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 20, marginRight: spacing.xs }}>🇬🇧</Text>
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}
              >
                English
              </Text>
            </TouchableOpacity>

            {/* Weekly Points (right) */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.full,
                borderWidth: 1,
                borderColor: colors.gradients.primary[0],
              }}
            >
              <Text style={{ fontSize: 20, marginRight: spacing.xs }}>⚡</Text>
              <Text
                style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                }}
              >
                {weeklyPoints}
              </Text>
            </View>
          </View>

          {/* Streaks */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 24, marginRight: spacing.sm }}>🔥</Text>
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              {streak} Day Streak
            </Text>

            {/* DEV: Reset Animation Button */}
            {__DEV__ && (
              <TouchableOpacity
                onPress={handleDevResetAnimation}
                activeOpacity={0.7}
                style={{
                  marginLeft: spacing.md,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                  backgroundColor: 'rgba(255, 100, 100, 0.2)',
                  borderRadius: borderRadius.sm,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 100, 100, 0.4)',
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: '#FF6464',
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  DEV: Reset
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              textAlign: 'center',
              marginTop: spacing.lg,
            }}
          >
            Your Learning Path
          </Text>
        </Animated.View>

        {/* Medals Section (Latest Achievement) */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400).springify()}
          style={{
            paddingHorizontal: spacing.xl,
            marginBottom: spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              🏅 Latest Achievement
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Latest Medal (3D-style) */}
          {MOCK_MEDALS.filter((m) => m.unlockedAt).map((medal, index) => {
            if (index > 0) return null; // Show only latest medal

            return (
              <TouchableOpacity
                key={medal.id}
                activeOpacity={0.9}
                style={{
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']} // Gold gradient for medal
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    shadowColor: '#FFD700',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  {/* 3D Medal Icon */}
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: borderRadius.full,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.md,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  >
                    <Text style={{ fontSize: 40 }}>{medal.emoji}</Text>
                  </View>

                  {/* Medal Info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.bold,
                        color: '#000',
                        marginBottom: 2,
                      }}
                    >
                      {medal.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: '#333',
                      }}
                    >
                      {medal.description}
                    </Text>
                  </View>

                  {/* Unlocked Badge */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      borderRadius: borderRadius.full,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        color: '#FF6B00',
                      }}
                    >
                      NEW!
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Staircase (Vertical) */}
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing['3xl'] + spacing.lg,
          }}
        >
          {/* Skeleton Loading State - Show shimmer cards during generation */}
          {shouldShowSkeleton && (
            <Animated.View entering={FadeIn.duration(300)}>
              {/* Status message */}
              <View
                style={{
                  alignItems: 'center',
                  marginBottom: spacing.lg,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  {phase === 'generating'
                    ? 'Creating your personalized learning path...'
                    : 'Loading your learning path...'}
                </Text>
              </View>

              {/* Skeleton cards */}
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <SkeletonStairCard
                  key={`skeleton-${index}`}
                  index={index}
                  isRevealing={phase === 'revealing'}
                />
              ))}
            </Animated.View>
          )}

          {/* No Path State - User needs to complete onboarding */}
          {!shouldShowSkeleton && !hasPath && phase === 'complete' && stairs.length === 0 && (
            <Animated.View
              entering={FadeInDown.duration(600).springify()}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing['2xl'],
                paddingHorizontal: spacing.lg,
              }}
            >
              <Text style={{ fontSize: 64, marginBottom: spacing.lg }}>🚀</Text>
              <Text
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  textAlign: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                Start Your Journey
              </Text>
              <Text
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  textAlign: 'center',
                  marginBottom: spacing.xl,
                }}
              >
                Complete the onboarding to get your personalized AI-generated learning path.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/onboarding-v2')}
                activeOpacity={0.8}
                style={{
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                    }}
                  >
                    Get Started
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Error State */}
          {!shouldShowSkeleton && error && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={{
                alignItems: 'center',
                paddingVertical: spacing.xl,
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: spacing.md }}>⚠️</Text>
              <Text
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.error.DEFAULT,
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            </Animated.View>
          )}

          {/* Stairs List - Condensed cards (80px) with progress bars */}
          {!shouldShowSkeleton && hasPath && stairs.map((stair, index) => (
            <CondensedStairCard
              key={stair.id}
              stair={stair}
              index={index}
              isRevealed={isCardRevealed(index)}
              onPress={() => handleStairPress(stair.id, stair.status)}
            />
          ))}
        </View>

        {/* Confetti Celebration Overlay */}
        <LottieView
          ref={confettiRef}
          source={require('@/assets/animations/confetti.json')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          loop={false}
          autoPlay={false}
        />
      </ScrollView>
    </LinearGradient>
  );
}

