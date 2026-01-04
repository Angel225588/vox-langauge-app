/**
 * ScoreRing Component
 *
 * Animated circular progress ring showing overall score.
 * Used in all practice feedback screens.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing } from '@/constants/designSystem';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// =============================================================================
// Types
// =============================================================================

export interface ScoreRingProps {
  /** Score value 0-100 */
  score: number;
  /** Ring size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Optional label below score */
  label?: string;
}

// =============================================================================
// Score Color & Message Helpers
// =============================================================================

export const SCORE_COLORS = {
  excellent: '#10B981', // 90-100
  great: '#06D6A0',     // 75-89
  good: '#0036FF',      // 60-74
  needsWork: '#F59E0B', // 40-59
  practice: '#EF4444',  // 0-39
};

export function getScoreColor(score: number): string {
  if (score >= 90) return SCORE_COLORS.excellent;
  if (score >= 75) return SCORE_COLORS.great;
  if (score >= 60) return SCORE_COLORS.good;
  if (score >= 40) return SCORE_COLORS.needsWork;
  return SCORE_COLORS.practice;
}

export function getScoreMessage(score: number): string {
  if (score >= 90) return 'Excellent!';
  if (score >= 75) return 'Great Job!';
  if (score >= 60) return 'Good Work!';
  if (score >= 40) return 'Keep Going!';
  return 'Keep Practicing!';
}

// =============================================================================
// Component
// =============================================================================

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  delay = 500,
  label,
}) => {
  const progress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(score / 100, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [score, delay]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const scoreColor = getScoreColor(score);
  const message = getScoreMessage(score);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.background.elevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={[styles.centerContent, { width: size, height: size }]}>
        <Text style={[styles.score, { color: scoreColor }]}>{score}</Text>
        <Text style={styles.message}>{message}</Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  message: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default ScoreRing;
