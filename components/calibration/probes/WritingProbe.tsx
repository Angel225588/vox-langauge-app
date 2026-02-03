/**
 * WritingProbe Component
 *
 * A writing sample probe for B1+ calibration where users write a short response to a prompt.
 * Used for AI analysis of grammar, vocabulary, and written expression.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type {
  WritingProbeItem,
  CalibrationProbeProps,
  ProbeResponse,
} from '@/types/calibration';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WritingProbeProps extends CalibrationProbeProps<WritingProbeItem> {}

export function WritingProbe({
  item,
  onComplete,
  onSkip,
  showHints = false,
  nativeLanguage = 'English',
}: WritingProbeProps) {
  const haptics = useHaptics();

  // State
  const [userInput, setUserInput] = useState(item.exampleStart || '');
  const [startTime] = useState(Date.now());
  const [firstInputTime, setFirstInputTime] = useState<number | null>(null);

  // Refs
  const inputRef = useRef<TextInput>(null);

  // Animations
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(0.5);

  // Calculate minimum length based on targetLength
  const minLength = item.targetLength === 'short' ? 20 : 50;
  const isValidLength = userInput.trim().length >= minLength;

  // Word count (approximate)
  const wordCount = userInput.trim().split(/\s+/).filter(Boolean).length;

  // Update button animation based on validity
  useEffect(() => {
    buttonOpacity.value = withTiming(isValidLength ? 1 : 0.5, { duration: 200 });
  }, [isValidLength]);

  // Track hesitation time (time until first input)
  const handleTextChange = (text: string) => {
    if (!firstInputTime && text.length > (item.exampleStart?.length || 0)) {
      setFirstInputTime(Date.now());
    }
    setUserInput(text);
  };

  // Handle submit
  const handleSubmit = () => {
    if (!isValidLength) return;

    Keyboard.dismiss();
    haptics.success();

    const timeSpent = Date.now() - startTime;
    const hesitationTime = firstInputTime ? firstInputTime - startTime : 0;

    const response: Omit<ProbeResponse, 'probeType' | 'timestamp'> = {
      itemId: item.id,
      timeSpent,
      hesitationTime,
      userInput: userInput.trim(),
      difficulty: item.difficulty,
    };

    onComplete(response);
  };

  // Animated button styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    if (isValidLength) {
      buttonScale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="create-outline" size={28} color={colors.text.primary} />
            </LinearGradient>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.label}>Writing Sample</Text>
            <Text style={styles.targetLength}>
              {item.targetLength === 'short' ? '1-2 sentences' : 'Short paragraph'}
            </Text>
          </View>
        </View>

        {/* Prompt */}
        <View style={styles.promptContainer}>
          <Text style={styles.prompt}>{item.prompt}</Text>
          {showHints && item.promptTranslation && (
            <Text style={styles.translation}>{item.promptTranslation}</Text>
          )}
        </View>

        {/* Context hint */}
        {showHints && item.context && (
          <View style={styles.contextHint}>
            <Ionicons name="bulb-outline" size={16} color={colors.accent.purple} />
            <Text style={styles.contextText}>Context: {item.context}</Text>
          </View>
        )}

        {/* Writing Area */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              item.targetLength === 'medium' && styles.inputLarge,
            ]}
            value={userInput}
            onChangeText={handleTextChange}
            placeholder={
              item.exampleStart
                ? 'Continue your response...'
                : 'Write your response here...'
            }
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
            autoFocus
            autoCapitalize="sentences"
            autoCorrect={false}
            spellCheck={false}
            keyboardAppearance="dark"
            returnKeyType="default"
            blurOnSubmit={false}
          />

          {/* Character/Word Count */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons
                name={isValidLength ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={isValidLength ? colors.success.DEFAULT : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.statText,
                  isValidLength && styles.statTextValid,
                ]}
              >
                {userInput.trim().length} / {minLength} characters
              </Text>
            </View>

            <Text style={styles.wordCount}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </Text>
          </View>
        </View>

        {/* Example starter hint */}
        {showHints && item.exampleStart && (
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accent.cyan} />
            <Text style={styles.hintText}>
              You can continue from the suggested start or write your own response
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <AnimatedPressable
          style={[styles.submitButton, animatedButtonStyle]}
          onPress={handleSubmit}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!isValidLength}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="send" size={20} color={colors.text.primary} />
            <Text style={styles.submitText}>Submit</Text>
          </LinearGradient>
        </AnimatedPressable>

        {onSkip && (
          <Pressable
            style={styles.skipButton}
            onPress={() => {
              Keyboard.dismiss();
              haptics.light();
              onSkip();
            }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  targetLength: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Prompt
  promptContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  prompt: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: typography.fontSize.xl * 1.5,
    marginBottom: spacing.sm,
  },
  translation: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.base * 1.5,
    fontStyle: 'italic',
  },

  // Context hint
  contextHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  contextText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },

  // Input
  inputContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.md,
  },
  input: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.6,
    minHeight: 120,
    maxHeight: 240,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 0,
  },
  inputLarge: {
    minHeight: 180,
    maxHeight: 320,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  statTextValid: {
    color: colors.success.DEFAULT,
  },
  wordCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Hint box
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: typography.fontSize.sm * 1.5,
  },

  // Footer
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  submitButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  submitText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
});
