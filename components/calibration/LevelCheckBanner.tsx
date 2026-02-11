/**
 * LevelCheckBanner
 *
 * A premium banner prompting users to take the quick level calibration.
 * Appears on home screen after onboarding.
 * Two options: Start calibration or skip as beginner.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type { LevelCheckBannerProps } from '@/types/calibration';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LevelCheckBanner({
  onStartCalibration,
  onSkipAsBeginner,
  dismissed,
  onDismiss,
}: LevelCheckBannerProps) {
  const haptics = useHaptics();

  // Button animation states
  const startScale = useSharedValue(1);
  const skipScale = useSharedValue(1);

  const startButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: startScale.value }],
  }));

  const skipButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
  }));

  const handleStartPress = () => {
    haptics.light();
    onStartCalibration();
  };

  const handleSkipPress = () => {
    haptics.light();
    onSkipAsBeginner();
  };

  const handleDismiss = () => {
    haptics.light();
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify()}
      exiting={FadeOut.duration(300)}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(0, 54, 255, 0.15)', 'rgba(0, 163, 255, 0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Dismiss button */}
        {onDismiss && (
          <Pressable
            onPress={handleDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={colors.text.tertiary} />
          </Pressable>
        )}

        {/* Icon and Title */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="speedometer-outline" size={24} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Quick Level Check</Text>
            <Text style={styles.subtitle}>2-3 min to personalize your path</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Complete a quick calibration to help us understand your level and create
          the perfect learning experience for you.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          {/* Primary: Start Calibration */}
          <AnimatedPressable
            onPress={handleStartPress}
            onPressIn={() => {
              startScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              startScale.value = withSpring(1, { damping: 15, stiffness: 300 });
            }}
            style={[styles.primaryButton, startButtonStyle]}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Start Now</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </AnimatedPressable>

          {/* Secondary: Skip as Beginner */}
          <AnimatedPressable
            onPress={handleSkipPress}
            onPressIn={() => {
              skipScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              skipScale.value = withSpring(1, { damping: 15, stiffness: 300 });
            }}
            style={[styles.secondaryButton, skipButtonStyle]}
          >
            <Text style={styles.secondaryButtonText}>I'm a Beginner</Text>
            <Ionicons name="leaf-outline" size={16} color={colors.text.secondary} />
          </AnimatedPressable>
        </View>

        {/* Points incentive */}
        <View style={styles.pointsHint}>
          <Ionicons name="star" size={12} color={colors.warning.DEFAULT} />
          <Text style={styles.pointsText}>Earn up to 100 points</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  gradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.2)',
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0, 54, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  pointsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  pointsText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});
