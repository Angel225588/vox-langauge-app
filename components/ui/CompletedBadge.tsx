/**
 * CompletedBadge - Premium completion indicator
 *
 * Shows a beautiful gold/silver shimmer effect on completed items.
 * Uses animated gradient to simulate light reflection on metal.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

interface CompletedBadgeProps {
  variant?: 'gold' | 'silver' | 'bronze';
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export function CompletedBadge({
  variant = 'gold',
  size = 'small',
  showLabel = true,
}: CompletedBadgeProps) {
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    // Start shimmer animation with a slight delay for visual interest
    shimmerPosition.value = withDelay(
      500,
      withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false
      )
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-50, 50]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const getColors = () => {
    switch (variant) {
      case 'gold':
        return {
          base: ['#B8860B', '#FFD700', '#DAA520'],
          shimmer: ['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent'],
          text: '#FFD700',
        };
      case 'silver':
        return {
          base: ['#71797E', '#C0C0C0', '#A9A9A9'],
          shimmer: ['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent'],
          text: '#C0C0C0',
        };
      case 'bronze':
        return {
          base: ['#8B4513', '#CD7F32', '#A0522D'],
          shimmer: ['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent'],
          text: '#CD7F32',
        };
    }
  };

  const colorScheme = getColors();
  const isSmall = size === 'small';

  return (
    <View style={[styles.container, isSmall ? styles.containerSmall : styles.containerMedium]}>
      {/* Base gradient */}
      <LinearGradient
        colors={colorScheme.base}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Shimmer overlay */}
        <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
          <LinearGradient
            colors={colorScheme.shimmer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.checkmark, isSmall && styles.checkmarkSmall]}>
            <View style={[styles.checkShort, isSmall && styles.checkShortSmall]} />
            <View style={[styles.checkLong, isSmall && styles.checkLongSmall]} />
          </View>
          {showLabel && (
            <Text style={[styles.label, isSmall && styles.labelSmall]}>
              Done
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

/**
 * CompletedOverlay - Full card shimmer overlay for completed cards
 *
 * Positioned absolutely over card corners to indicate completion
 */
export function CompletedOverlay() {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmerPosition.value,
      [0, 0.5, 1],
      [0.1, 0.3, 0.1]
    );

    return {
      opacity,
    };
  });

  return (
    <View style={styles.overlayContainer}>
      {/* Corner accent */}
      <LinearGradient
        colors={['rgba(255, 215, 0, 0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cornerGradient}
      />

      {/* Shimmer effect */}
      <Animated.View style={[styles.overlayShimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 215, 0, 0.2)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Badge */}
      <View style={styles.overlayBadge}>
        <CompletedBadge size="small" showLabel={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  containerSmall: {
    height: 24,
  },
  containerMedium: {
    height: 32,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    position: 'relative',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  shimmerGradient: {
    flex: 1,
    width: '200%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  checkmark: {
    width: 14,
    height: 10,
    position: 'relative',
  },
  checkmarkSmall: {
    width: 12,
    height: 8,
  },
  checkShort: {
    position: 'absolute',
    bottom: 1,
    left: 0,
    width: 6,
    height: 2,
    backgroundColor: '#FFF',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  checkShortSmall: {
    width: 5,
    height: 2,
  },
  checkLong: {
    position: 'absolute',
    bottom: 2,
    left: 3,
    width: 10,
    height: 2,
    backgroundColor: '#FFF',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  checkLongSmall: {
    width: 8,
    left: 2,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 10,
  },

  // Overlay styles
  overlayContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    overflow: 'hidden',
  },
  cornerGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
  },
  overlayShimmer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
  },
  overlayBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
});
