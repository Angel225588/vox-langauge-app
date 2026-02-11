/**
 * CometBackground - Lightweight dark space background
 * Static gradient with a few subtle twinkling stars (no comets for performance)
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StarProps {
  x: number;
  y: number;
  size: number;
  delay: number;
}

const Star = React.memo(function Star({ x, y, size, delay }: StarProps) {
  const opacity = useSharedValue(0.2);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 3000 }),
          withTiming(0.2, { duration: 3000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        animatedStyle,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
});

interface CometBackgroundProps {
  children?: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}

export function CometBackground({ children, intensity = 'medium' }: CometBackgroundProps) {
  // Minimal star count for subtle effect
  const starCount = intensity === 'low' ? 8 : intensity === 'medium' ? 12 : 18;

  const stars = React.useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 4000,
    }));
  }, [starCount]);

  return (
    <View style={styles.container}>
      {/* Static deep space gradient */}
      <LinearGradient
        colors={['#0A0E1A', '#0D1224', '#0F1729', '#0A0E1A']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle nebula accent */}
      <View style={styles.nebulaContainer}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0, 54, 255, 0.03)',
            'rgba(0, 163, 255, 0.05)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nebula}
        />
      </View>

      {/* Minimal twinkling stars */}
      <View style={styles.starsContainer}>
        {stars.map((star, i) => (
          <Star key={i} {...star} />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  nebulaContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  nebula: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    top: -SCREEN_HEIGHT * 0.5,
    left: -SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});

export default CometBackground;
