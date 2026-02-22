/**
 * GlassProgressBar — Thin frosted progress indicator for onboarding.
 * Shows current step out of total steps with a primary gradient fill.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import {
  glass,
  colors,
  borderRadius,
  spacing,
} from '@/constants/designSystem';

interface GlassProgressBarProps {
  /** Current step (1-based) */
  step: number;
  /** Total number of steps */
  totalSteps: number;
  /** Container style */
  style?: ViewStyle;
}

export function GlassProgressBar({ step, totalSteps, style }: GlassProgressBarProps) {
  const progress = Math.min(step / totalSteps, 1);

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%` as any, { duration: 400 }),
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  track: {
    height: 3,
    backgroundColor: glass.surface.light,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
});
