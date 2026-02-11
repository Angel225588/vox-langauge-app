/**
 * ProgressIndicator - Step progress for onboarding flow
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  showLabel?: boolean;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  showLabel = true,
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress}%`, {
      damping: 20,
      stiffness: 90,
    }),
  }));

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>
          Step {currentStep} of {totalSteps}
        </Text>
      )}
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, animatedBarStyle]} />
        </View>
      </View>
    </View>
  );
}

interface StepDotsProps {
  currentStep: number;
  totalSteps: number;
}

export function StepDots({ currentStep, totalSteps }: StepDotsProps) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <View
            key={i}
            style={[
              styles.dot,
              isCompleted && styles.dotCompleted,
              isCurrent && styles.dotCurrent,
            ]}
          >
            {isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  trackContainer: {
    paddingHorizontal: spacing.md,
  },
  track: {
    height: 4,
    backgroundColor: colors.overlay.primary20,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.overlay.primary20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: colors.success.DEFAULT,
  },
  dotCurrent: {
    backgroundColor: colors.primary.DEFAULT,
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmark: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProgressIndicator;
