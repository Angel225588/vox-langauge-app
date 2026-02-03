/**
 * CometBackground - Premium animated background with comet/shooting star effects
 * Inspired by Perplexity's deep space aesthetic
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CometProps {
  delay: number;
  startX: number;
  startY: number;
  duration: number;
  size: 'small' | 'medium' | 'large';
}

function Comet({ delay, startX, startY, duration, size }: CometProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  const sizeConfig = {
    small: { width: 60, height: 1.5, glow: 4 },
    medium: { width: 100, height: 2, glow: 6 },
    large: { width: 150, height: 2.5, glow: 8 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    // Animate the comet across the screen
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }) // Reset instantly
        ),
        -1, // Infinite repeat
        false
      )
    );

    // Fade in and out
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration * 0.1 }),
          withTiming(1, { duration: duration * 0.6 }),
          withTiming(0, { duration: duration * 0.3 }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [startX, startX + SCREEN_WIDTH * 1.5]
    );
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [startY, startY + SCREEN_HEIGHT * 0.4]
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: '35deg' },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.comet, animatedStyle]}>
      <LinearGradient
        colors={['transparent', 'rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.8)', '#fff']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          styles.cometTrail,
          {
            width: config.width,
            height: config.height,
            shadowRadius: config.glow,
          },
        ]}
      />
      {/* Comet head glow */}
      <View
        style={[
          styles.cometHead,
          {
            width: config.height * 3,
            height: config.height * 3,
            right: -config.height,
            shadowRadius: config.glow * 2,
          },
        ]}
      />
    </Animated.View>
  );
}

interface StarProps {
  x: number;
  y: number;
  size: number;
  delay: number;
}

function Star({ x, y, size, delay }: StarProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 + Math.random() * 2000 }),
          withTiming(0.3, { duration: 2000 + Math.random() * 2000 })
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
}

interface CometBackgroundProps {
  children?: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}

export function CometBackground({ children, intensity = 'medium' }: CometBackgroundProps) {
  // Generate stars
  const starCount = intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 60;
  const stars = React.useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3000,
    }));
  }, [starCount]);

  // Comet configurations
  const comets = React.useMemo(() => {
    const cometCount = intensity === 'low' ? 2 : intensity === 'medium' ? 3 : 5;
    return Array.from({ length: cometCount }, (_, i) => ({
      delay: i * 4000 + Math.random() * 2000,
      startX: -200 - Math.random() * 100,
      startY: Math.random() * SCREEN_HEIGHT * 0.5,
      duration: 3000 + Math.random() * 2000,
      size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large',
    }));
  }, [intensity]);

  return (
    <View style={styles.container}>
      {/* Deep space gradient background */}
      <LinearGradient
        colors={[
          '#0A0E1A',      // Deep space blue-black
          '#0D1224',      // Slightly lighter
          '#0F1729',      // Dark navy hint
          '#0A0E1A',      // Back to deep
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle nebula glow */}
      <View style={styles.nebulaContainer}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(99, 102, 241, 0.03)',
            'rgba(139, 92, 246, 0.05)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nebula}
        />
      </View>

      {/* Stars layer */}
      <View style={styles.starsContainer}>
        {stars.map((star, i) => (
          <Star key={i} {...star} />
        ))}
      </View>

      {/* Comets layer */}
      <View style={styles.cometsContainer}>
        {comets.map((comet, i) => (
          <Comet key={i} {...comet} />
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
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  cometsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  comet: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cometTrail: {
    borderRadius: 1,
  },
  cometHead: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
  },
  content: {
    flex: 1,
  },
});

export default CometBackground;
