import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, typography } from '@/constants/designSystem';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreCardProps {
  label: string;
  score: number;
  icon: string;
  gradientColors: string[];
  delay?: number;
}

const CIRCLE_SIZE = 100;
const CIRCLE_RADIUS = 40;
const CIRCLE_STROKE_WIDTH = 8;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function ScoreCard({ label, score, icon, gradientColors, delay = 0 }: ScoreCardProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [score, delay]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress.value);
    return { strokeDashoffset };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.5, 1], [0, 1, 1]),
      transform: [{scale: interpolate(progress.value, [0, 0.5, 1], [0.5, 1.1, 1])}],
    };
  });

  const getScoreColor = (value: number): string => {
    if (value >= 85) return colors.success.DEFAULT;
    if (value >= 70) return colors.warning.DEFAULT;
    return colors.error.DEFAULT;
  };

  const scoreColor = getScoreColor(score);

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          <Circle cx={50} cy={50} r={CIRCLE_RADIUS} stroke={colors.background.card} strokeWidth={CIRCLE_STROKE_WIDTH} fill="none" />
          <AnimatedCircle cx={50} cy={50} r={CIRCLE_RADIUS} stroke={scoreColor} strokeWidth={CIRCLE_STROKE_WIDTH} fill="none" strokeDasharray={CIRCLE_CIRCUMFERENCE} strokeLinecap="round" animatedProps={animatedCircleProps} transform="rotate(-90 50 50)" />
        </Svg>
        <Animated.View style={[styles.centerContent, animatedTextStyle]}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{Math.round(score)}</Text>
        </Animated.View>
        <View style={[styles.glow, { shadowColor: scoreColor, shadowOpacity: 0.4 }]} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.md },
  circleContainer: { position: 'relative', width: 100, height: 100, marginBottom: spacing.sm },
  centerContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 20, marginBottom: 2 },
  scoreText: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
  label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, textAlign: 'center' },
  glow: { position: 'absolute', top: '50%', left: '50%', width: 100, height: 100, marginLeft: -50, marginTop: -50, borderRadius: 50, shadowOffset: { width: 0, height: 0 }, shadowRadius: 20, elevation: 10 },
});
