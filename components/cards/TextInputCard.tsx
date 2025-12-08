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
 *
 * Learning Objective: Reinforce spelling and active recall with supportive hints
 *
 * REFACTORED: Now uses shared UI components for consistency
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
import { View, Text, TouchableOpacity, TextInput as RNTextInput, Image, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// Shared UI components
import { DarkOverlay, AnswerFeedbackOverlay } from '@/components/ui';
import { useHaptics } from '@/hooks/useHaptics';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface TextInputCardProps extends CardProps {
  word?: string;
  translation?: string;
  correct_answer?: string;
  image_url?: string;
  explanation?: string;
}

export function TextInputCard({
  word,
  translation,
  correct_answer,
  image_url,
  explanation,
  onNext,
}: TextInputCardProps) {
  const haptics = useHaptics();
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputScale = useSharedValue(1);

  const handleShowHint = () => {
    setShowHint(true);
    haptics.light();
  };

  const handleSubmit = () => {
    const userAnswer = input.toLowerCase().trim();
    const correctAnswer = correct_answer?.toLowerCase().trim() || '';

    let correct = userAnswer === correctAnswer;

    if (!correct && correctAnswer) {
      const distance = levenshteinDistance(userAnswer, correctAnswer);
      correct = distance <= 1;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      haptics.success();
      setTimeout(() => {
        onNext(input);
        resetState();
      }, 1500);
    } else {
      haptics.doubleError();
    }
  };

  const handleContinue = () => {
    onNext(input);
    resetState();
  };

  const resetState = () => {
    setInput('');
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const showWrongAnswer = showResult && !isCorrect;

  // Input border color based on state
  const getInputBorderColor = () => {
    if (!showResult) return colors.border.light;
    return isCorrect ? colors.success.DEFAULT : colors.error.DEFAULT;
  };

  return (
    <View style={styles.container}>
      {/* Header with Hint button */}
      <View style={styles.headerContainer}>
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          Type the word in English
        </Animated.Text>

        {/* Hint Button */}
        {!showHint && !showResult && (
          <Animated.View
            entering={FadeIn.duration(400).delay(200)}
            style={styles.hintButtonContainer}
          >
            <TouchableOpacity
              onPress={handleShowHint}
              activeOpacity={0.7}
              style={styles.hintButton}
            >
              <Text style={styles.hintButtonText}>💡</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Image */}
      {image_url && (
        <Animated.View
          entering={ZoomIn.duration(500).delay(200)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Translation */}
      {translation && (
        <Animated.Text
          entering={FadeIn.duration(400).delay(300)}
          style={styles.translation}
        >
          {translation}
        </Animated.Text>
      )}

      {/* Input Field */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(400)}
        style={[inputAnimatedStyle, styles.inputWrapper]}
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
          style={[
            styles.input,
            {
              borderColor: getInputBorderColor(),
              shadowColor: showResult
                ? isCorrect ? colors.success.DEFAULT : colors.error.DEFAULT
                : '#000',
              shadowOpacity: showResult ? 0.4 : 0.1,
              elevation: showResult ? 4 : 2,
            },
          ]}
          editable={!showResult}
          onFocus={() => {
            inputScale.value = withSpring(1.02);
            haptics.light();
          }}
          onBlur={() => {
            inputScale.value = withSpring(1);
          }}
        />
      </Animated.View>

      {/* Check button - only show when not wrong answer */}
      {!showWrongAnswer && (
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!input || (showResult && isCorrect)}
            activeOpacity={0.8}
            style={[
              styles.checkButton,
              {
                backgroundColor: !input || (showResult && isCorrect)
                  ? colors.background.elevated
                  : colors.accent.primary,
                shadowOpacity: !input || (showResult && isCorrect) ? 0.1 : 0.4,
                elevation: !input || (showResult && isCorrect) ? 2 : 4,
              },
            ]}
          >
            <View style={styles.checkButtonContent}>
              {showResult && isCorrect && <Text style={styles.checkIcon}>✓</Text>}
              <Text style={styles.checkButtonText}>
                {showResult && isCorrect ? 'Correct!' : 'Check'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Overlay and feedback */}
      <DarkOverlay visible={showWrongAnswer} opacity={0.3} />

      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title={explanation ? 'Spelling Tip' : 'Grammar Tip'}
        explanation={explanation}
        correctAnswer={correct_answer}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: spacing.lg,
  },
  header: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  hintButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  hintButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  hintButtonText: {
    fontSize: 20,
  },
  imageContainer: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.xl,
  },
  translation: {
    fontSize: typography.fontSize.xl,
    color: colors.accent.purple,
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontWeight: typography.fontWeight.semibold,
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
  },
  checkButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.xl,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    width: '100%',
  },
  checkButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  checkIcon: {
    fontSize: 20,
    color: colors.text.primary,
  },
  checkButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
