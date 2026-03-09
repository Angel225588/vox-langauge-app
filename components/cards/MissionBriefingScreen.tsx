/**
 * Mission Briefing Screen — Premium Pre-Call Experience
 *
 * Revolut-inspired clean design with glassmorphic surfaces.
 * Layout:
 *   1. Floating back + meta badges (top)
 *   2. Hero: gradient avatar ring + name + role
 *   3. Scenario card: title + goal + collapsible objectives
 *   4. Reassurance pill
 *   5. Fixed footer: vocab preview + start call CTA
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
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  yourRole: string;
  theirRole: string;
  characterEmoji?: string;
  characterName?: string;
  objectives: string[];
  onStartCall: () => void;
  onPreviewVocabulary?: () => void;
  onBack: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: colors.success.DEFAULT, icon: 'leaf-outline' as const },
  intermediate: { label: 'Intermediate', color: colors.warning.DEFAULT, icon: 'flame-outline' as const },
  advanced: { label: 'Advanced', color: colors.error.DEFAULT, icon: 'diamond-outline' as const },
};

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
  const [showObjectives, setShowObjectives] = useState(false);

  // Animations
  const ringRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const avatarScale = useSharedValue(0.6);

  useEffect(() => {
    // Avatar spring in
    avatarScale.value = withSpring(1, { damping: 14, stiffness: 90 });

    // Subtle ring rotation
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );

    // CTA pulse
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const avatarAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const ringAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  const ctaAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleStartCall = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStartCall();
  };

  const handlePreviewVocabulary = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPreviewVocabulary?.();
  };

  const toggleObjectives = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowObjectives(!showObjectives);
  };

  const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.beginner;
  const primaryGoal = objectives[0] || title;
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <BackButton onPress={onBack} variant="default" />
        <View style={styles.headerBadges}>
          <View style={[styles.badge, { backgroundColor: diffConfig.color + '18' }]}>
            <Ionicons name={diffConfig.icon} size={12} color={diffConfig.color} />
            <Text style={[styles.badgeText, { color: diffConfig.color }]}>
              {diffConfig.label}
            </Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
            <Text style={styles.badgeText}>{duration}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* ── Scrollable Content ──────────────────────────────────── */}
      <View style={styles.content}>

        {/* Hero: Avatar + Identity */}
        <Animated.View style={[styles.heroSection, avatarAnimStyle]}>
          {/* Gradient Ring */}
          <View style={styles.avatarWrapper}>
            <Animated.View style={[styles.gradientRing, ringAnimStyle]}>
              <LinearGradient
                colors={[colors.primary.DEFAULT, colors.accent.blue, colors.primary.light]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientRingInner}
              />
            </Animated.View>
            <View style={styles.avatarCircle}>
              <Ionicons name={characterEmoji as any} size={36} color={colors.text.primary} />
            </View>
          </View>

          {/* Identity */}
          <View style={styles.identityBlock}>
            {characterName && (
              <Text style={styles.characterName}>{characterName}</Text>
            )}
            <Text style={styles.roleLabel}>{theirRole}</Text>
          </View>

          {/* Role Tags */}
          <View style={styles.roleTags}>
            <View style={styles.roleTag}>
              <View style={[styles.roleIndicator, { backgroundColor: colors.primary.DEFAULT }]} />
              <Text style={styles.roleTagText}>You — {yourRole}</Text>
            </View>
            <View style={styles.roleTag}>
              <View style={[styles.roleIndicator, { backgroundColor: colors.secondary.DEFAULT }]} />
              <Text style={styles.roleTagText}>Them — {theirRole}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Scenario Card */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <View style={styles.scenarioCard}>
            {/* Scenario Title */}
            <Text style={styles.scenarioTitle}>{title}</Text>
            {description && (
              <Text style={styles.scenarioDescription}>{description}</Text>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Primary Goal */}
            <View style={styles.goalRow}>
              <View style={styles.goalIconCircle}>
                <Ionicons name="flag" size={14} color={colors.primary.DEFAULT} />
              </View>
              <View style={styles.goalContent}>
                <Text style={styles.goalLabel}>YOUR GOAL</Text>
                <Text style={styles.goalText}>{primaryGoal}</Text>
              </View>
            </View>

            {/* Collapsible Objectives */}
            {objectives.length > 1 && (
              <>
                <TouchableOpacity
                  onPress={toggleObjectives}
                  activeOpacity={0.7}
                  style={styles.objectivesToggle}
                >
                  <Text style={styles.objectivesToggleText}>
                    {showObjectives ? 'Hide objectives' : `+ ${objectives.length - 1} more objective${objectives.length > 2 ? 's' : ''}`}
                  </Text>
                  <Ionicons
                    name={showObjectives ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>

                {showObjectives && (
                  <Animated.View
                    entering={FadeInDown.duration(250)}
                    style={styles.objectivesList}
                  >
                    {objectives.slice(1).map((obj, i) => (
                      <View key={i} style={styles.objectiveItem}>
                        <View style={styles.objectiveDot} />
                        <Text style={styles.objectiveText}>{obj}</Text>
                      </View>
                    ))}
                  </Animated.View>
                )}
              </>
            )}
          </View>
        </Animated.View>

        {/* Reassurance Pill */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.reassurancePill}
        >
          <Ionicons name="sparkles" size={14} color={colors.primary.light} />
          <Text style={styles.reassuranceText}>
            The AI will guide you — just speak naturally
          </Text>
        </Animated.View>
      </View>

      {/* ── Fixed Footer ───────────────────────────────────────── */}
      <Animated.View
        entering={FadeIn.delay(500).duration(400)}
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <LinearGradient
          colors={['transparent', colors.background.primary]}
          style={styles.footerFade}
          pointerEvents="none"
        />

        {onPreviewVocabulary && (
          <TouchableOpacity
            onPress={handlePreviewVocabulary}
            activeOpacity={0.8}
            style={styles.vocabButton}
          >
            <Ionicons name="book-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.vocabButtonText}>Preview Vocabulary</Text>
          </TouchableOpacity>
        )}

        <AnimatedTouchable
          onPress={handleStartCall}
          activeOpacity={0.9}
          style={[styles.ctaButton, ctaAnimStyle]}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <Text style={styles.ctaText}>Start Conversation</Text>
          </LinearGradient>
        </AnimatedTouchable>
      </Animated.View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const AVATAR_SIZE = 100;
const RING_SIZE = AVATAR_SIZE + 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // ── Header ──────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerBadges: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },

  // ── Content ─────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    paddingBottom: 170,
  },

  // ── Hero ────────────────────────────────
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl + spacing.sm,
  },
  avatarWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  gradientRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    padding: 2,
  },
  gradientRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: RING_SIZE / 2,
    opacity: 0.6,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },

  // ── Identity ────────────────────────────
  identityBlock: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  characterName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  roleLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.text.secondary,
  },

  // ── Role Tags ───────────────────────────
  roleTags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  roleIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
  },

  // ── Scenario Card ───────────────────────
  scenarioCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: spacing.md,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.2,
    marginBottom: spacing.xs,
  },
  scenarioDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: spacing.md,
  },

  // ── Goal ────────────────────────────────
  goalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  goalIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.DEFAULT + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary.light,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  goalText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.45,
  },

  // ── Objectives ──────────────────────────
  objectivesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  objectivesToggleText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  objectivesList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  objectiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary.DEFAULT + '80',
    marginTop: 7,
  },
  objectiveText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.45,
  },

  // ── Reassurance ─────────────────────────
  reassurancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  reassuranceText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },

  // ── Footer ──────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  footerFade: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 80,
  },
  vocabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  vocabButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  ctaButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: spacing.sm,
  },
  ctaText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default MissionBriefingScreen;
