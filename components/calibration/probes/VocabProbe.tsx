/**
 * VocabProbe Component
 *
 * A vocabulary recognition probe for the calibration system.
 * Shows words and lets users indicate if they know them.
 * Points for completion, not accuracy. Tracks behavior for AI analysis.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';
import type { VocabProbeItem, CalibrationProbeProps } from '@/types/calibration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

type ConfidenceLevel = 'high' | 'medium' | 'low';

export const VocabProbe: React.FC<CalibrationProbeProps<VocabProbeItem>> = ({
  item,
  onComplete,
  onSkip,
  showHints = false,
  nativeLanguage,
}) => {
  const haptics = useHaptics();
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [startTime] = useState(Date.now());
  const firstInteractionTime = useRef<number | null>(null);

  // Animated values for card entrance
  const cardScale = useSharedValue(0.95);
  const wordOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate card entrance
    cardScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    wordOpacity.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
  }));

  const handleResponse = (confidence: ConfidenceLevel) => {
    // Track first interaction time (hesitation)
    if (firstInteractionTime.current === null) {
      firstInteractionTime.current = Date.now();
    }

    setSelectedConfidence(confidence);
    haptics.medium();

    // Show translation briefly before completing
    setShowTranslation(true);

    // Complete after showing translation
    setTimeout(() => {
      const timeSpent = Date.now() - startTime;
      const hesitationTime = firstInteractionTime.current
        ? firstInteractionTime.current - startTime
        : 0;

      onComplete({
        itemId: item.id,
        timeSpent,
        hesitationTime,
        confidence,
        difficulty: item.difficulty,
      });
    }, 1500);
  };

  const handleSkip = () => {
    if (onSkip) {
      haptics.light();
      onSkip();
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <Animated.View
        style={[styles.card, cardAnimatedStyle]}
        entering={FadeInDown.duration(400).springify()}
      >
        <LinearGradient
          colors={[colors.background.card, colors.background.secondary]}
          style={styles.cardGradient}
        >
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {item.category} · {item.partOfSpeech}
            </Text>
          </View>

          {/* Word Section */}
          <Animated.View style={[styles.wordSection, wordAnimatedStyle]}>
            <Text style={styles.word}>{item.word}</Text>
            {item.phonetic && (
              <Text style={styles.phonetic}>{item.phonetic}</Text>
            )}
          </Animated.View>

          {/* Translation (appears after selection) */}
          {showTranslation && (
            <Animated.View
              entering={FadeInDown.duration(300).springify()}
              style={styles.translationSection}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.success.DEFAULT}
              />
              <Text style={styles.translation}>{item.translation}</Text>
            </Animated.View>
          )}

          {/* Response Buttons */}
          {!showTranslation && (
            <View style={styles.buttonContainer}>
              <ResponseButton
                label="I know this"
                icon="checkmark-circle"
                confidence="high"
                gradient={colors.gradients.success}
                onPress={() => handleResponse('high')}
                selected={selectedConfidence === 'high'}
              />

              <ResponseButton
                label="Not sure"
                icon="help-circle"
                confidence="medium"
                gradient={colors.gradients.warning}
                onPress={() => handleResponse('medium')}
                selected={selectedConfidence === 'medium'}
              />

              <ResponseButton
                label="Don't know"
                icon="close-circle"
                confidence="low"
                gradient={colors.gradients.error}
                onPress={() => handleResponse('low')}
                selected={selectedConfidence === 'low'}
              />
            </View>
          )}

          {/* Hint Section (if enabled) */}
          {showHints && !showTranslation && (
            <View style={styles.hintSection}>
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.text.tertiary}
              />
              <Text style={styles.hintText}>
                Be honest - this helps us personalize your learning
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Skip Button */}
      {onSkip && !showTranslation && (
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.skipButtonPressed,
          ]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Progress Indicator */}
      <View style={styles.progressDots}>
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>
    </View>
  );
};

// Response Button Component
interface ResponseButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  confidence: ConfidenceLevel;
  gradient: readonly [string, string];
  onPress: () => void;
  selected: boolean;
}

const ResponseButton: React.FC<ResponseButtonProps> = ({
  label,
  icon,
  gradient,
  onPress,
  selected,
}) => {
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    haptics.medium();
    scale.value = withSpring(0.95, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    onPress();
  };

  return (
    <Animated.View style={[styles.responseButtonWrapper, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => haptics.light()}
        style={({ pressed }) => [
          styles.responseButton,
          pressed && styles.responseButtonPressed,
          selected && styles.responseButtonSelected,
        ]}
      >
        <LinearGradient
          colors={selected ? gradient as any : [colors.background.elevated, colors.background.card]}
          style={styles.responseButtonGradient}
        >
          <Ionicons
            name={icon}
            size={28}
            color={selected ? '#FFFFFF' : colors.text.secondary}
          />
          <Text
            style={[
              styles.responseButtonText,
              selected && styles.responseButtonTextSelected,
            ]}
          >
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  // Card Styles
  card: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  cardGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.2)',
  },

  // Category Badge
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 54, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.3)',
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Word Section
  wordSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  word: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },

  // Translation Section
  translationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  translation: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.success.light,
    marginLeft: spacing.sm,
  },

  // Button Container
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },

  // Response Button
  responseButtonWrapper: {
    width: '100%',
  },
  responseButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  responseButtonPressed: {
    opacity: 0.8,
  },
  responseButtonSelected: {
    ...shadows.glow.primary,
  },
  responseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  responseButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  responseButtonTextSelected: {
    color: '#FFFFFF',
  },

  // Hint Section
  hintSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },

  // Skip Button
  skipButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  skipText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },

  // Progress Dots
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.primary.DEFAULT,
    ...shadows.glow.primary,
  },
});
