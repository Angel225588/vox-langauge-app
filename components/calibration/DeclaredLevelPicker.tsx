/**
 * DeclaredLevelPicker
 *
 * Allows users to self-declare their approximate level.
 * This determines which calibration probes they'll see.
 * Premium design with animated selection.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { DECLARED_LEVEL_OPTIONS } from '@/types/calibration';
import type { DeclaredLevelPickerProps, DeclaredLevel } from '@/types/calibration';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LevelOptionProps {
  option: (typeof DECLARED_LEVEL_OPTIONS)[number];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function LevelOption({ option, isSelected, onSelect, index }: LevelOptionProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    borderOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(0, 54, 255, ${borderOpacity.value})`,
    backgroundColor: isSelected
      ? 'rgba(0, 54, 255, 0.1)'
      : colors.background.card,
  }));

  const handlePress = () => {
    haptics.medium();
    onSelect();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        style={[styles.optionCard, animatedStyle, borderStyle]}
      >
        {/* Emoji */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{option.emoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
            {option.title}
          </Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
        </View>

        {/* Selection indicator */}
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && (
            <Animated.View
              entering={FadeInUp.duration(200)}
              style={styles.radioInner}
            />
          )}
        </View>

        {/* Skip badge for beginners */}
        {option.skipCalibration && (
          <View style={styles.skipBadge}>
            <Text style={styles.skipBadgeText}>Skip test</Text>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export function DeclaredLevelPicker({ onSelect, onBack }: DeclaredLevelPickerProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [selectedLevel, setSelectedLevel] = useState<DeclaredLevel | null>(null);

  // Continue button animation
  const continueScale = useSharedValue(1);
  const continueButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueScale.value }],
  }));

  const handleSelect = (level: DeclaredLevel) => {
    setSelectedLevel(level);
  };

  const handleContinue = () => {
    if (selectedLevel) {
      haptics.success();
      onSelect(selectedLevel);
    }
  };

  const handleBack = () => {
    haptics.light();
    onBack?.();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
        )}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Text style={styles.title}>How would you describe{'\n'}your level?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your calibration
          </Text>
        </Animated.View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {DECLARED_LEVEL_OPTIONS.map((option, index) => (
          <LevelOption
            key={option.id}
            option={option}
            isSelected={selectedLevel === option.id}
            onSelect={() => handleSelect(option.id)}
            index={index}
          />
        ))}
      </View>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={() => {
            continueScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            continueScale.value = withSpring(1, { damping: 15, stiffness: 300 });
          }}
          disabled={!selectedLevel}
          style={[
            styles.continueButton,
            continueButtonStyle,
            !selectedLevel && styles.continueButtonDisabled,
          ]}
        >
          <LinearGradient
            colors={
              selectedLevel
                ? colors.gradients.primary
                : [colors.background.elevated, colors.background.elevated]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text
              style={[
                styles.continueText,
                !selectedLevel && styles.continueTextDisabled,
              ]}
            >
              {selectedLevel === 'beginner' ? 'Start Learning' : 'Continue'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={selectedLevel ? '#FFFFFF' : colors.text.disabled}
            />
          </LinearGradient>
        </AnimatedPressable>

        {/* Hint */}
        <Text style={styles.hint}>
          Don't worry - your learning path adapts as you progress
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.dark,
    position: 'relative',
    overflow: 'hidden',
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: colors.primary.light,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioOuterSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.DEFAULT,
  },
  skipBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  skipBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.success.light,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  continueButtonDisabled: {
    ...shadows.sm,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  continueText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  continueTextDisabled: {
    color: colors.text.disabled,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
