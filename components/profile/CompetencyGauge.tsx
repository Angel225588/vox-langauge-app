/**
 * CompetencyGauge - Small animated SVG ring for competency metrics.
 * Reuses the ScoreRing pattern from components/feedback/ScoreRing.tsx.
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

export interface CompetencyGaugeProps {
  value: number;
  maxValue: number;
  color: string;
  size?: number;
  label: string;
  suffix?: string;
}

export function CompetencyGauge({
  value,
  maxValue,
  color,
  size = 56,
  label,
  suffix = '',
}: CompetencyGaugeProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(Math.min(value / maxValue, 1), {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [value, maxValue]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.background.elevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.centerContent, { width: size, height: size }]}>
        <Text style={[styles.valueText, { color }]}>
          {value}{suffix}
        </Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 8,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
});

export default CompetencyGauge;
