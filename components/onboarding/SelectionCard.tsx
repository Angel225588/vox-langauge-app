/**
 * SelectionCard - Reusable card component for onboarding selections
 */

import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SelectionCardProps {
  emoji: string;
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  showGlow?: boolean;
}

export function SelectionCard({
  emoji,
  label,
  description,
  selected = false,
  onPress,
  size = 'medium',
  showGlow = true,
}: SelectionCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = {
    small: { padding: spacing.md, minHeight: 60 },
    medium: { padding: spacing.lg, minHeight: 80 },
    large: { padding: spacing.xl, minHeight: 100 },
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        sizeStyles[size],
        selected && styles.cardSelected,
        selected && showGlow && styles.cardGlow,
        animatedStyle,
      ]}
    >
      <Text style={[styles.emoji, size === 'large' && styles.emojiLarge]}>
        {emoji}
      </Text>
      <View style={styles.textContainer}>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.description, selected && styles.descriptionSelected]}>
            {description}
          </Text>
        )}
      </View>
      {selected && (
        <View style={styles.checkContainer}>
          <Text style={styles.check}>✓</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

interface LanguageCardProps {
  flag: string;
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
}

export function LanguageCard({
  flag,
  label,
  description,
  selected = false,
  onPress,
}: LanguageCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.languageCard,
        selected && styles.languageCardSelected,
        animatedStyle,
      ]}
    >
      <Text style={styles.flag}>{flag}</Text>
      <Text style={[styles.languageLabel, selected && styles.languageLabelSelected]}>
        {label}
      </Text>
      {description && (
        <Text style={[styles.languageDescription, selected && styles.descriptionSelected]}>
          {description}
        </Text>
      )}
      {selected && (
        <View style={styles.languageCheck}>
          <Text style={styles.check}>✓</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.dark,
    gap: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.overlay.primary10,
  },
  cardGlow: {
    ...shadows.glow.primary,
  },
  emoji: {
    fontSize: 28,
  },
  emojiLarge: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  labelSelected: {
    color: colors.primary.light,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  descriptionSelected: {
    color: colors.text.secondary,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Language card specific styles
  languageCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.dark,
    padding: spacing.lg,
    minHeight: 140,
    position: 'relative',
  },
  languageCardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.overlay.primary15,
    ...shadows.glow.primary,
  },
  flag: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  languageLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  languageLabelSelected: {
    color: colors.primary.light,
  },
  languageDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  languageCheck: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SelectionCard;
