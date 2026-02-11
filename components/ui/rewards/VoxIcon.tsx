/**
 * VoxIcon - The primary currency icon
 *
 * A hexagonal crystal with sound waves inside, representing
 * the voice and effort of language learning.
 *
 * Design: Hexagonal gem with 3 curved sound wave lines
 * Colors: Electric Blue gradient (#0036FF to #00A3FF)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, G } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { rewardCurrencies, animation } from '@/constants/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);

export type VoxIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface VoxIconProps {
  size?: VoxIconSize | number;
  animated?: boolean;
  glowing?: boolean;
  color?: 'primary' | 'gold' | 'silver' | 'bronze';
}

const SIZE_MAP: Record<VoxIconSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

// Colors sourced from design system for consistency
const COLOR_MAP = {
  primary: {
    start: rewardCurrencies.vox.primary,
    end: rewardCurrencies.vox.secondary,
    glow: rewardCurrencies.vox.glow,
  },
  gold: {
    start: rewardCurrencies.vox.tiers.gold.primary,
    end: rewardCurrencies.vox.tiers.gold.secondary,
    glow: rewardCurrencies.vox.tiers.gold.glow,
  },
  silver: {
    start: rewardCurrencies.vox.tiers.silver.primary,
    end: rewardCurrencies.vox.tiers.silver.secondary,
    glow: rewardCurrencies.vox.tiers.silver.glow,
  },
  bronze: {
    start: rewardCurrencies.vox.tiers.bronze.primary,
    end: rewardCurrencies.vox.tiers.bronze.secondary,
    glow: rewardCurrencies.vox.tiers.bronze.glow,
  },
};

export function VoxIcon({
  size = 'md',
  animated = false,
  glowing = false,
  color = 'primary',
}: VoxIconProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size];
  const colorScheme = COLOR_MAP[color];

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (animated) {
      const iconDuration = animation.duration.icon;
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: iconDuration, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: iconDuration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: iconDuration }),
          withTiming(1, { duration: iconDuration })
        ),
        -1,
        false
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedView style={[styles.container, animatedStyle, { width: pixelSize, height: pixelSize }]}>
      {/* Glow effect */}
      {glowing && (
        <AnimatedView
          style={[
            styles.glow,
            glowStyle,
            {
              width: pixelSize * rewardCurrencies.glowSize.multiplier,
              height: pixelSize * rewardCurrencies.glowSize.multiplier,
              borderRadius: pixelSize * rewardCurrencies.glowSize.multiplier * 0.5,
              backgroundColor: colorScheme.glow,
            },
          ]}
        />
      )}

      {/* Main Icon - accessibilityLabel provides screen reader support */}
      <Svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 64 64"
        accessibilityLabel="Vox Currency - Hexagonal crystal with sound waves"
      >
        <Defs>
          <LinearGradient id="voxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colorScheme.start} />
            <Stop offset="100%" stopColor={colorScheme.end} />
          </LinearGradient>
          <LinearGradient id="voxShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="white" stopOpacity="0" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Hexagon shape */}
        <Path
          d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z"
          fill="url(#voxGradient)"
          stroke={colorScheme.start}
          strokeWidth="1"
        />

        {/* Inner hexagon (depth effect) */}
        <Path
          d="M32 10 L50 21 L50 43 L32 54 L14 43 L14 21 Z"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {/* Sound wave lines */}
        <G stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" fill="none">
          {/* Center dot */}
          <Path d="M32 32 L32 32" strokeWidth="4" />
          {/* Inner wave */}
          <Path d="M26 28 Q32 24 38 28 Q32 32 26 28" />
          <Path d="M26 36 Q32 40 38 36 Q32 32 26 36" />
          {/* Outer wave */}
          <Path d="M22 24 Q32 18 42 24" />
          <Path d="M22 40 Q32 46 42 40" />
        </G>

        {/* Shine overlay */}
        <Path
          d="M32 4 L56 18 L56 32 L32 32 L8 32 L8 18 Z"
          fill="url(#voxShine)"
        />
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
  },
});

export default VoxIcon;
