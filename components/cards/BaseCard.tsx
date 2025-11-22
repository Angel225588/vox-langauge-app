import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, shadows, animation } from '@/constants/designSystem';

interface BaseCardProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'dark';
  size?: 'small' | 'medium' | 'large';
  withGradient?: boolean;
  withGlow?: boolean;
  style?: ViewStyle;
  tag?: string;
  tagColor?: string[];
}

export function BaseCard({
  children,
  variant = 'default',
  size = 'medium',
  withGradient = true,
  withGlow = false,
  style,
  tag,
  tagColor,
}: BaseCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return colors.gradients.primary;
      case 'secondary':
        return colors.gradients.secondary;
      case 'dark':
        return colors.gradients.dark;
      default:
        return [colors.background.card, colors.background.elevated];
    }
  };

  // Get shadow style based on glow
  const getShadowStyle = () => {
    if (withGlow) {
      return variant === 'primary'
        ? shadows.glow.primary
        : variant === 'secondary'
        ? shadows.glow.primary
        : shadows.md;
    }
    return shadows.md;
  };

  const cardPadding = {
    small: spacing.md,
    medium: spacing.lg,
    large: spacing.xl,
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, getShadowStyle(), style]}>
      {withGradient ? (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            {
              padding: cardPadding[size],
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          {tag && (
            <View style={styles.tagContainer}>
              <LinearGradient
                colors={tagColor || colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tag}
              >
                <Animated.Text style={styles.tagText}>{tag}</Animated.Text>
              </LinearGradient>
            </View>
          )}
          {children}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.card,
            styles.solidCard,
            {
              padding: cardPadding[size],
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          {tag && (
            <View style={styles.tagContainer}>
              <LinearGradient
                colors={tagColor || colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tag}
              >
                <Animated.Text style={styles.tagText}>{tag}</Animated.Text>
              </LinearGradient>
            </View>
          )}
          {children}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
  solidCard: {
    backgroundColor: colors.background.card,
  },
  tagContainer: {
    position: 'absolute',
    top: -12,
    left: spacing.lg,
    zIndex: 10,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  tagText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
