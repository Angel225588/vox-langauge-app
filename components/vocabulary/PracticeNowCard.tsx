/**
 * PracticeNowCard - Hero CTA Component
 *
 * The primary action card showing words due for review.
 * Designed to be the first thing users see and interact with.
 *
 * Design: Revolut-inspired with subtle purple accent on dark background.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { Icon } from '@/components/ui/Icon';

interface PracticeNowCardProps {
  /** Number of words due for review */
  wordsDue: number;
  /** Callback when user taps to practice */
  onPress: () => void;
  /** Loading state */
  loading?: boolean;
}

export function PracticeNowCard({ wordsDue, onPress, loading = false }: PracticeNowCardProps) {
  const hasWordsDue = wordsDue > 0;

  // Subtle pulse animation for the icon when words are due
  const pulseStyle = useAnimatedStyle(() => {
    if (!hasWordsDue) return { transform: [{ scale: 1 }] };
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.05, { duration: 1000 }),
              withTiming(1, { duration: 1000 })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.loadingCard]}>
          <View style={styles.loadingPlaceholder} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        disabled={!hasWordsDue}
        style={styles.touchable}
        accessibilityLabel={hasWordsDue ? `${wordsDue} words need practice. Tap to start.` : 'All caught up! No words need review.'}
        accessibilityRole="button"
        accessibilityHint={hasWordsDue ? 'Opens practice session for due words' : undefined}
      >
        <View style={[styles.card, !hasWordsDue && styles.cardEmpty]}>
          {/* Left: Icon with subtle background */}
          <Animated.View style={[styles.iconContainer, pulseStyle]}>
            {hasWordsDue ? (
              <LinearGradient
                colors={['rgba(0, 54, 255, 0.2)', 'rgba(0, 54, 255, 0.1)']}
                style={styles.iconGradient}
              >
                <Icon name="flash" size="xl" color="primary" />
              </LinearGradient>
            ) : (
              <View style={styles.iconEmpty}>
                <Icon name="checkmark-circle" size="xl" color="success" />
              </View>
            )}
          </Animated.View>

          {/* Center: Text content */}
          <View style={styles.textContainer}>
            {hasWordsDue ? (
              <>
                <Text style={styles.title}>
                  <Text style={styles.countHighlight}>{wordsDue}</Text>
                  {' '}{wordsDue === 1 ? 'word needs' : 'words need'} practice
                </Text>
                <Text style={styles.subtitle}>
                  Review now to lock them in
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>You're all caught up!</Text>
                <Text style={styles.subtitle}>
                  No words due for review right now
                </Text>
              </>
            )}
          </View>

          {/* Right: Arrow indicator */}
          {hasWordsDue && (
            <View style={styles.arrowContainer}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.arrowGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="arrow-forward" size="md" color="white" />
              </LinearGradient>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  touchable: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.2)',
    ...shadows.md,
  },
  cardEmpty: {
    borderColor: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  loadingCard: {
    height: 88,
    justifyContent: 'center',
  },
  loadingPlaceholder: {
    width: '60%',
    height: 20,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmpty: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  countHighlight: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  arrowContainer: {
    marginLeft: spacing.sm,
  },
  arrowGradient: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PracticeNowCard;
