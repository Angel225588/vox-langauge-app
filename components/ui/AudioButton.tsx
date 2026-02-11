/**
 * AudioButton - Premium Audio Control Component
 *
 * A polished, consistent audio button used across the app for audio playback.
 * Designed with premium feel: subtle glows, smooth animations, tactile feedback.
 *
 * Features:
 * - Two variants: 'play' (normal speed) and 'slow' (0.5x speed)
 * - States: idle, playing, loading
 * - Premium pulse ring animation when playing
 * - Subtle idle glow for depth
 * - Configurable sizing (sm: 44, md: 44, lg: 52)
 * - Haptic feedback on press
 * - Design system integrated animations
 *
 * Usage:
 * ```tsx
 * <AudioButton
 *   variant="play"
 *   isPlaying={isPlaying}
 *   onPress={handlePlay}
 *   size="md"
 * />
 *
 * <AudioButton
 *   variant="slow"
 *   isPlaying={isSlowPlaying}
 *   onPress={handleSlowPlay}
 *   size="md"
 * />
 * ```
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, ViewStyle, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, shadows, neomorphism, animation, spacing } from '@/constants/designSystem';

export interface AudioButtonProps {
  /** Button variant - 'play' for normal speed, 'slow' for 0.5x speed */
  variant: 'play' | 'slow';
  /** Whether audio is currently playing */
  isPlaying?: boolean;
  /** Whether audio is loading */
  isLoading?: boolean;
  /** Callback when button is pressed */
  onPress: () => void;
  /** Button size - sm: 44, md: 44, lg: 52 */
  size?: 'sm' | 'md' | 'lg';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional custom styles */
  style?: ViewStyle;
}

const SIZE_MAP = {
  sm: 44,
  md: 44,
  lg: 52,
};

const ICON_SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
};

// Animation constants using design system
const PULSE_DURATION = animation.duration.icon;
const PULSE_SCALE = 1.35;
const PRESS_SCALE = 0.92;

export function AudioButton({
  variant,
  isPlaying = false,
  isLoading = false,
  onPress,
  size = 'md',
  disabled = false,
  style,
}: AudioButtonProps) {
  // Animation values
  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const innerGlow = useSharedValue(0);

  const buttonSize = SIZE_MAP[size];
  const iconSize = ICON_SIZE_MAP[size];

  // Premium pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      // Smooth pulse ring animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(PULSE_SCALE, {
            duration: PULSE_DURATION,
            easing: Easing.out(Easing.ease)
          }),
          withTiming(1, {
            duration: PULSE_DURATION,
            easing: Easing.in(Easing.ease)
          })
        ),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: PULSE_DURATION, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: PULSE_DURATION, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      // Inner glow when playing
      innerGlow.value = withTiming(1, { duration: 200 });
    } else {
      // Smooth reset
      pulseScale.value = withSpring(1, animation.spring.default);
      pulseOpacity.value = withTiming(0, { duration: 150 });
      innerGlow.value = withTiming(0, { duration: 200 });
    }
  }, [isPlaying]);

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    buttonScale.value = withSpring(PRESS_SCALE, animation.spring.bouncy);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, animation.spring.bouncy);
  };

  const handlePress = () => {
    if (disabled || isLoading) return;
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Get icon name based on state
  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    return isPlaying ? 'pause' : 'play';
  };

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(innerGlow.value, [0, 1], [0, 0.15]),
  }));

  // Icon color based on state
  const iconColor = isPlaying
    ? colors.text.primary
    : disabled
    ? neomorphism.text.inactive
    : colors.primary.DEFAULT;

  // Variant-specific styling
  const isSlowVariant = variant === 'slow';

  return (
    <View style={[styles.container, style]}>
      {/* Pulse ring (visible when playing) */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: buttonSize * 1.5,
            height: buttonSize * 1.5,
            borderRadius: buttonSize * 0.75,
          },
          pulseAnimatedStyle,
        ]}
      />

      {/* Main button */}
      <Animated.View style={buttonAnimatedStyle}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isLoading}
          style={[
            styles.button,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
            isPlaying && styles.buttonActive,
            isSlowVariant && !isPlaying && styles.buttonSlow,
            disabled && styles.buttonDisabled,
          ]}
        >
          {/* Inner glow overlay */}
          <Animated.View
            style={[
              styles.innerGlow,
              { borderRadius: buttonSize / 2 },
              innerGlowStyle,
            ]}
          />

          {isLoading ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <View style={styles.iconContainer}>
              <Ionicons
                name={getIconName()}
                size={iconSize}
                color={iconColor}
                style={isSlowVariant && !isPlaying ? { marginLeft: 2 } : undefined}
              />

              {/* Slow variant indicator */}
              {isSlowVariant && !isPlaying && (
                <View style={[
                  styles.slowBadge,
                  size === 'sm' && styles.slowBadgeSm,
                  size === 'lg' && styles.slowBadgeLg,
                ]}>
                  <Text style={[
                    styles.slowBadgeText,
                    size === 'sm' && styles.slowBadgeTextSm,
                    size === 'lg' && styles.slowBadgeTextLg,
                  ]}>
                    ½×
                  </Text>
                </View>
              )}
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: colors.primary.DEFAULT,
  },
  button: {
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.medium,
    // Subtle idle shadow for depth
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.light,
    ...shadows.glow.primary,
  },
  buttonSlow: {
    // Slightly different styling for slow variant
    backgroundColor: colors.background.card,
    borderColor: colors.border.light,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.background.card,
    shadowOpacity: 0,
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary.light,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slowBadge: {
    position: 'absolute',
    bottom: -6,
    right: -8,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    minWidth: 24,
    alignItems: 'center',
  },
  slowBadgeSm: {
    bottom: -5,
    right: -6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 20,
  },
  slowBadgeLg: {
    bottom: -8,
    right: -10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    minWidth: 28,
  },
  slowBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: -0.5,
  },
  slowBadgeTextSm: {
    fontSize: 8,
  },
  slowBadgeTextLg: {
    fontSize: 12,
  },
});
