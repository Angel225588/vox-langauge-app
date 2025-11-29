/**
 * Text Input Card Component
 *
 * Translation typing exercise where users type the English word for a given translation.
 *
 * Features:
 * - Shows translation in target language (e.g., Spanish)
 * - User types the English word
 * - Text input with focus/blur animations (scale 1.02 on focus)
 * - Visual feedback: green border for correct, red for incorrect
 * - Shows correct answer if user types incorrectly
 * - Haptic feedback (success/error, light on focus)
 * - Auto-advances after submission (1.5s delay)
 * - "Check" button with disabled state
 * - Dynamic button text: "Check" → "Correct!"/"Incorrect"
 *
 * Learning Objective: Reinforce spelling and active recall with supportive hints
 */

// Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput as RNTextInput, Image } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface TextInputCardProps extends CardProps {
  word?: string;
  translation?: string;
  correct_answer?: string;
  image_url?: string;
  explanation?: string; // Spelling tip shown when incorrect
}

export function TextInputCard({
  word,
  translation,
  correct_answer,
  image_url,
  explanation,
  onNext,
}: TextInputCardProps) {
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputScale = useSharedValue(1);

  const handleShowHint = () => {
    setShowHint(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = () => {
    const userAnswer = input.toLowerCase().trim();
    const correctAnswer = correct_answer?.toLowerCase().trim() || '';

    // Check exact match first
    let correct = userAnswer === correctAnswer;

    // If not exact match, check with typo tolerance (Levenshtein distance ≤ 1)
    if (!correct && correctAnswer) {
      const distance = levenshteinDistance(userAnswer, correctAnswer);
      correct = distance <= 1; // Accept 1 character difference
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auto-advance for correct
      setTimeout(() => {
        onNext(input);
        setInput('');
        setShowResult(false);
        setIsCorrect(false);
        setShowHint(false);
      }, 1500);
    } else {
      // Strong vibration for wrong answers (double vibration pattern)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 100);
      // Don't auto-advance for incorrect - user must press Continue
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext(input);
    setInput('');
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputScale.value }],
    };
  });

  const showWrongAnswer = showResult && !isCorrect;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Header with Hint button */}
      <View style={{ width: '100%', position: 'relative', marginBottom: spacing.lg }}>
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
          }}
        >
          Type the word in English
        </Animated.Text>

        {/* Hint Button - Top Right */}
        {!showHint && !showResult && (
          <Animated.View
            entering={FadeIn.duration(400).delay(200)}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
            }}
          >
            <TouchableOpacity
              onPress={handleShowHint}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                borderRadius: borderRadius.full,
                backgroundColor: colors.background.elevated,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={{ fontSize: 20 }}>💡</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Image */}
      {image_url && (
        <Animated.View
          entering={ZoomIn.duration(500).delay(200)}
          style={{
            borderRadius: borderRadius['2xl'],
            overflow: 'hidden',
            marginBottom: spacing.xl,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Image
            source={{ uri: image_url }}
            style={{
              width: 200,
              height: 200,
              borderRadius: borderRadius.xl,
            }}
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Translation */}
      {translation && (
        <Animated.Text
          entering={FadeIn.duration(400).delay(300)}
          style={{
            fontSize: typography.fontSize.xl,
            color: colors.accent.purple,
            textAlign: 'center',
            marginBottom: spacing.xl,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {translation}
        </Animated.Text>
      )}

      <Animated.View
        entering={FadeInDown.duration(400).delay(400)}
        style={[inputAnimatedStyle, { width: '100%' }]}
      >
        <RNTextInput
          value={input}
          onChangeText={setInput}
          placeholder={
            showHint && correct_answer
              ? `Hint: ${correct_answer.substring(0, 2)}...`
              : 'Type here...'
          }
          placeholderTextColor={showHint ? colors.accent.purple : colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: colors.background.card,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.xl,
            fontSize: typography.fontSize.lg,
            color: colors.text.primary,
            marginBottom: spacing.lg,
            borderWidth: 2,
            borderColor: showResult
              ? isCorrect
                ? colors.success.DEFAULT
                : colors.error.DEFAULT
              : colors.border.light,
            shadowColor: showResult
              ? isCorrect
                ? colors.success.DEFAULT
                : colors.error.DEFAULT
              : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: showResult ? 0.4 : 0.1,
            shadowRadius: 4,
            elevation: showResult ? 4 : 2,
            textAlign: 'center',
          }}
          editable={!showResult}
          onFocus={() => {
            inputScale.value = withSpring(1.02);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onBlur={() => {
            inputScale.value = withSpring(1);
          }}
        />
      </Animated.View>

      {/* Check button - only show when not wrong answer */}
      {!showWrongAnswer && (
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={{ width: '100%' }}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!input || (showResult && isCorrect)}
            activeOpacity={0.8}
            style={{
              backgroundColor: !input || (showResult && isCorrect)
                ? colors.background.elevated
                : colors.accent.primary,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing['2xl'],
              borderRadius: borderRadius.xl,
              shadowColor: !input || (showResult && isCorrect)
                ? '#000'
                : colors.accent.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: !input || (showResult && isCorrect) ? 0.1 : 0.4,
              shadowRadius: 8,
              elevation: !input || (showResult && isCorrect) ? 2 : 4,
              width: '100%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
              {showResult && isCorrect && (
                <Text style={{ fontSize: 20 }}>✓</Text>
              )}
              <Text
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  textAlign: 'center',
                }}
              >
                {showResult && isCorrect ? 'Correct!' : 'Check'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Blur overlay when wrong answer */}
      {showWrongAnswer && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        />
      )}

      {/* Unified red card at bottom for wrong answers */}
      {showWrongAnswer && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#2D1B1E',
            borderLeftWidth: 4,
            borderLeftColor: colors.error.DEFAULT,
            padding: spacing.xl,
            paddingBottom: spacing['2xl'],
          }}
        >
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.error.DEFAULT,
              marginBottom: spacing.md,
            }}
          >
            {explanation ? 'Spelling Tip' : 'Grammar Tip'}
          </Text>

          {explanation && (
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.text.primary,
                lineHeight: 26,
                marginBottom: spacing.md,
              }}
            >
              {explanation}
            </Text>
          )}

          <Text
            style={{
              fontSize: typography.fontSize.md,
              color: colors.text.secondary,
              marginBottom: spacing.lg,
            }}
          >
            Correct answer: {correct_answer}
          </Text>

          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.error.DEFAULT,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing['2xl'],
              borderRadius: borderRadius.xl,
              shadowColor: colors.error.DEFAULT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                textAlign: 'center',
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
