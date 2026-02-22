/**
 * CondensedStairCard Component
 *
 * A compact stair card for the learning path with theatrical reveal.
 * Features:
 * - Line 1: Emoji (scales in) + "Order. Title" (types in) + Status icon
 * - Line 2: Description (fades in after title finishes)
 * - Line 3: Progress bar
 *
 * Visual hierarchy:
 * - CURRENT: Blue gradient background + glow + bright text
 * - LOCKED: Gray gradient background (clearly visible) + subdued text
 * - COMPLETED: Green-tinted background + bright text
 *
 * Reveal animation sequence:
 * 1. Card springs in (scale 0.95→1, opacity 0→1)
 * 2. Title types character by character (30ms per char)
 * 3. Description fades in after title completes (200ms)
 * 4. Icon scales in alongside the title
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StairIcon } from '@/lib/utils/stairIcon';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, animation } from '@/constants/designSystem';
import { StairForDisplay } from '@/hooks/useLearningPath';

const TYPING_SPEED_MS = 30; // ms per character
const DESCRIPTION_FADE_MS = 200;

// Card gradient backgrounds by status
const GRADIENT_CURRENT = ['#0029CC', '#0036FF', '#3D6BFF'] as const;
const GRADIENT_LOCKED = ['#2A2F45', '#343A52', '#3E4560'] as const;
const GRADIENT_COMPLETED = ['#05694A', '#0B8A63', '#10B981'] as const;

interface CondensedStairCardProps {
  stair: StairForDisplay;
  index: number;
  isRevealed?: boolean;
  onPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function CondensedStairCard({
  stair,
  index,
  isRevealed = true,
  onPress,
}: CondensedStairCardProps) {
  // Animation values
  const revealProgress = useSharedValue(isRevealed ? 1 : 0);
  const iconScale = useSharedValue(isRevealed ? 1 : 0);
  const descriptionOpacity = useSharedValue(isRevealed ? 1 : 0);

  // Glow pulse animation for current stair
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (stair.status === 'current') {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 })
        ),
        -1, // infinite repeat
        true // reverse
      );
    }
  }, [stair.status]);

  // Animated style for glow overlay
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Typing animation state (JS-driven for text slicing)
  const fullTitle = `${stair.order}. ${stair.title}`;
  const [displayedChars, setDisplayedChars] = useState(isRevealed ? fullTitle.length : 0);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const hasAnimated = useRef(isRevealed);

  // Cleanup typing timer
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, []);

  // Orchestrate reveal animation
  useEffect(() => {
    if (isRevealed && !hasAnimated.current) {
      hasAnimated.current = true;

      // 1. Card spring in
      revealProgress.value = withSpring(1, {
        damping: animation.spring.default.damping,
        stiffness: animation.spring.default.stiffness,
      });

      // 2. Icon scales in
      iconScale.value = withSpring(1, {
        damping: animation.spring.bouncy.damping,
        stiffness: animation.spring.bouncy.stiffness,
      });

      // 3. Title types in character by character
      let charIndex = 0;
      typingTimer.current = setInterval(() => {
        charIndex++;
        setDisplayedChars(charIndex);
        if (charIndex >= fullTitle.length) {
          if (typingTimer.current) clearInterval(typingTimer.current);
          // 4. Description fades in after title completes
          descriptionOpacity.value = withTiming(1, { duration: DESCRIPTION_FADE_MS });
        }
      }, TYPING_SPEED_MS);
    } else if (!isRevealed) {
      revealProgress.value = 0;
      iconScale.value = 0;
      descriptionOpacity.value = 0;
      setDisplayedChars(0);
      hasAnimated.current = false;
    }
  }, [isRevealed]);

  // Card scale + opacity animation
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(revealProgress.value, [0, 1], [0.95, 1]);
    const opacity = interpolate(revealProgress.value, [0, 0.5, 1], [0, 0.5, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Icon scale-in animation
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  // Description fade-in animation
  const descriptionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
  }));

  // Status helpers
  const isLocked = stair.status === 'locked';
  const isCurrent = stair.status === 'current';
  const isCompleted = stair.status === 'completed';

  // Card gradient per status
  const getGradientColors = (): readonly [string, string, string] => {
    if (isCurrent) return GRADIENT_CURRENT;
    if (isCompleted) return GRADIENT_COMPLETED;
    return GRADIENT_LOCKED;
  };

  // Border color per status
  const getBorderColor = () => {
    if (isCurrent) return colors.primary.DEFAULT;
    if (isCompleted) return colors.success.DEFAULT;
    return 'rgba(255, 255, 255, 0.15)';
  };

  // Get progress bar fill percentage
  const getProgressPercent = () => {
    if (isCompleted) return 100;
    if (isCurrent) return 35;
    return 0;
  };

  // Get progress bar gradient
  const getProgressGradient = (): readonly [string, string] => {
    if (isCompleted) return colors.gradients.success;
    if (isCurrent) return ['#FFFFFF', '#FFFFFF'] as const; // White bar on blue bg
    return ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'];
  };

  // Title color
  const getTitleColor = () => {
    if (isLocked) return 'rgba(255, 255, 255, 0.75)';
    return '#FFFFFF';
  };

  // Description color
  const getDescriptionColor = () => {
    if (isLocked) return 'rgba(255, 255, 255, 0.45)';
    return 'rgba(255, 255, 255, 0.7)';
  };

  // Get status icon name + color
  const getStatusIcon = (): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    if (isCompleted) return { name: 'checkmark', color: '#FFFFFF' };
    if (isCurrent) return { name: 'star', color: '#FFFFFF' };
    return { name: 'lock-closed', color: 'rgba(255, 255, 255, 0.5)' };
  };

  // Status icon background color
  const getStatusIconBg = () => {
    if (isCompleted) return 'rgba(255, 255, 255, 0.2)';
    if (isCurrent) return 'rgba(255, 255, 255, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  };

  // Displayed title text (sliced for typing effect)
  const displayedTitle = fullTitle.slice(0, displayedChars);

  return (
    <Animated.View style={[styles.container, cardAnimatedStyle]}>
      {/* Animated glow effect for current stair — rendered behind the card */}
      {isCurrent && (
        <Animated.View style={[styles.glowOverlay, glowAnimatedStyle]} pointerEvents="none" />
      )}
      <AnimatedTouchableOpacity
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.85}
        style={[
          styles.touchable,
          {
            borderColor: getBorderColor(),
            borderWidth: isCurrent ? 2 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardContent}
        >
          {/* Line 1: Emoji + Order.Title + Status Icon */}
          <View style={styles.topRow}>
            {/* Icon — scales in, white on gradient */}
            <Animated.View style={[iconAnimatedStyle, styles.iconWrapper]}>
              <StairIcon value={stair.emoji} size={22} fontSize={22} color="#FFFFFF" />
            </Animated.View>

            {/* Order + Title — types in character by character */}
            <Text
              style={[styles.title, { color: getTitleColor() }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {displayedTitle}
            </Text>

            {/* Status Icon */}
            <View style={[styles.statusIcon, { backgroundColor: getStatusIconBg() }]}>
              <Ionicons name={getStatusIcon().name} size={14} color={getStatusIcon().color} />
            </View>
          </View>

          {/* Line 2: Description — fades in after title completes */}
          {stair.description ? (
            <Animated.View style={[styles.descriptionContainer, descriptionAnimatedStyle]}>
              <Text
                style={[styles.description, { color: getDescriptionColor() }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {stair.description}
              </Text>
            </Animated.View>
          ) : null}

          {/* Line 3: Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={getProgressGradient()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercent()}%` },
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  touchable: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  glowOverlay: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: borderRadius.lg + 2,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 54, 255, 0.6)',
    shadowColor: '#0036FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },

  // Line 1
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: -0.3,
    lineHeight: typography.fontSize.base * 1.3,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  // Line 2 - Description
  descriptionContainer: {
    paddingLeft: 32 + spacing.sm, // Align with title (icon wrapper + gap)
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    letterSpacing: -0.1,
  },

  // Line 3 - Progress Bar
  progressContainer: {
    paddingLeft: 32 + spacing.sm,
    paddingRight: 28 + spacing.sm,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

export default CondensedStairCard;
