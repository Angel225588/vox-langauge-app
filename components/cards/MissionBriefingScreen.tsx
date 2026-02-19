/**
 * Pre-Session Screen (Mission Briefing)
 *
 * Redesigned for clarity and memorability.
 * Key design principles:
 * 1. Hero section: Large character + who you're talking to
 * 2. Single clear goal: What you need to accomplish
 * 3. Quick tips: What to expect (collapsed by default)
 * 4. Big action: Start the call
 *
 * The user should be able to glance at this and immediately know:
 * - WHO they're talking to
 * - WHAT they need to do
 * - That the AI will guide them
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';

// =============================================================================
// Types
// =============================================================================

export interface MissionBriefingScreenProps {
  // Scenario
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;

  // Roles
  yourRole: string;
  theirRole: string;
  characterEmoji?: string;
  characterName?: string;

  // Mission objectives (shown in collapsible section)
  objectives: string[];

  // Actions
  onStartCall: () => void;
  onPreviewVocabulary?: () => void;
  onBack: () => void;
}

// =============================================================================
// Component
// =============================================================================

export const MissionBriefingScreen: React.FC<MissionBriefingScreenProps> = ({
  title,
  description,
  difficulty = 'beginner',
  duration = '~5 min',
  yourRole,
  theirRole,
  characterEmoji = 'person-outline',
  characterName,
  objectives,
  onStartCall,
  onPreviewVocabulary,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [showGoals, setShowGoals] = useState(false);

  // Pulse animation for start button
  const buttonScale = useSharedValue(1);
  const avatarScale = useSharedValue(0.8);
  const avatarOpacity = useSharedValue(0);

  useEffect(() => {
    // Avatar entrance animation
    avatarScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    avatarOpacity.value = withTiming(1, { duration: 400 });

    // Button pulse animation
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
    opacity: avatarOpacity.value,
  }));

  const handleStartCall = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStartCall();
  };

  const handlePreviewVocabulary = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPreviewVocabulary?.();
  };

  const toggleGoals = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowGoals(!showGoals);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return colors.success.DEFAULT;
      case 'intermediate':
        return colors.warning.DEFAULT;
      case 'advanced':
        return colors.error.DEFAULT;
      default:
        return colors.text.tertiary;
    }
  };

  const difficultyColor = getDifficultyColor();
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  // Get the primary goal (first objective or title)
  const primaryGoal = objectives[0] || title;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header - Minimal */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <BackButton onPress={onBack} variant="default" />
        <View style={styles.headerCenter}>
          <View style={styles.metaBadges}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '25' }]}>
              <Text style={[styles.badgeText, { color: difficultyColor }]}>
                {difficulty}
              </Text>
            </View>
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
              <Text style={styles.badgeText}>{duration}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight} />
      </Animated.View>

      {/* Main Content - Vertically Centered */}
      <View style={styles.mainContent}>
        {/* Hero Character Section */}
        <Animated.View style={[styles.heroSection, avatarStyle]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Ionicons name={characterEmoji as any} size={40} color={colors.text.primary} />
              </View>
            </View>
          </View>

          {/* Character Info */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.characterInfo}
          >
            <Text style={styles.talkingToLabel}>You're talking to</Text>
            <Text style={styles.characterRole}>{theirRole}</Text>
            {characterName && (
              <Text style={styles.characterName}>{characterName}</Text>
            )}
          </Animated.View>
        </Animated.View>

        {/* Single Clear Goal */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={styles.goalSection}
        >
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Ionicons name="flag" size={18} color={colors.primary.DEFAULT} />
              <Text style={styles.goalLabel}>Your Goal</Text>
            </View>
            <Text style={styles.goalText}>{primaryGoal}</Text>
          </View>
        </Animated.View>

        {/* Collapsible Goals Section */}
        {objectives.length > 1 && (
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            style={styles.goalsToggleSection}
          >
            <TouchableOpacity
              onPress={toggleGoals}
              activeOpacity={0.7}
              style={styles.goalsToggle}
            >
              <Text style={styles.goalsToggleText}>
                {showGoals ? 'Hide details' : 'See all goals'}
              </Text>
              <Ionicons
                name={showGoals ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>

            {showGoals && (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={styles.goalsList}
              >
                {objectives.slice(1).map((objective, index) => (
                  <View key={index} style={styles.goalItem}>
                    <View style={styles.goalBullet} />
                    <Text style={styles.goalItemText}>{objective}</Text>
                  </View>
                ))}
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* Reassurance Message */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={styles.reassuranceSection}
        >
          <Ionicons name="sparkles" size={16} color={colors.primary.light} />
          <Text style={styles.reassuranceText}>
            Don't worry — the AI will guide you through the conversation
          </Text>
        </Animated.View>
      </View>

      {/* Fixed Bottom Buttons */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(400)}
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <LinearGradient
          colors={['transparent', colors.background.primary]}
          style={styles.footerGradient}
          pointerEvents="none"
        />

        {/* Preview Vocabulary Button */}
        {onPreviewVocabulary && (
          <TouchableOpacity
            onPress={handlePreviewVocabulary}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <Ionicons name="book-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.secondaryButtonText}>Preview Vocabulary</Text>
          </TouchableOpacity>
        )}

        {/* Start Call Button */}
        <AnimatedTouchable
          onPress={handleStartCall}
          activeOpacity={0.9}
          style={[styles.startButton, pulseStyle]}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Ionicons name="call" size={22} color={colors.text.primary} />
            <Text style={styles.startButtonText}>Start Call</Text>
          </LinearGradient>
        </AnimatedTouchable>
      </Animated.View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Header - Minimal
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  metaBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    paddingBottom: 160, // Space for footer
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.DEFAULT + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT + '40',
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  avatarEmoji: {
    fontSize: 48,
  },

  // Character Info
  characterInfo: {
    alignItems: 'center',
  },
  talkingToLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  characterRole: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  characterName: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },

  // Goal Section
  goalSection: {
    marginBottom: spacing.lg,
  },
  goalCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT + '30',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  goalLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.primary.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    lineHeight: typography.fontSize.lg * 1.4,
  },

  // Collapsible Goals
  goalsToggleSection: {
    marginBottom: spacing.lg,
  },
  goalsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  goalsToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  goalsList: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  goalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.DEFAULT,
    marginTop: 7,
  },
  goalItemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.4,
  },

  // Reassurance
  reassuranceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  reassuranceText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  footerGradient: {
    position: 'absolute',
    top: -80,
    left: 0,
    right: 0,
    height: 100,
  },

  // Secondary Button
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'transparent',
    paddingVertical: spacing.lg,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.secondary,
  },

  // Start Button
  startButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
});

export default MissionBriefingScreen;
