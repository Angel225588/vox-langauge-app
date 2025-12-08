/**
 * Multiple Choice Card Component
 *
 * Quiz card that asks users to select the correct translation from a list of options.
 *
 * Features:
 * - Shows question with translation
 * - Displays 4 options with staggered animations
 * - Dual highlighting: green for correct answer, red for incorrect selection
 * - Explanation text when user selects wrong answer
 * - Haptic feedback (success/error)
 * - Auto-advances after selection (2.5s delay to read explanation)
 * - Checkmark (✓) or X (✗) indicator
 *
 * Learning Objective: Test comprehension with explanatory feedback to reinforce learning
 *
 * REFACTORED: Now uses shared UI components for consistency
 */

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// Shared UI components
import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay } from '@/components/ui';
import { useHaptics } from '@/hooks/useHaptics';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface MultipleChoiceCardProps extends CardProps {
  word?: string;
  translation?: string;
  image_url?: string;
  options?: string[];
  correct_answer?: number;
  explanation?: string;
}

export function MultipleChoiceCard({
  word,
  translation,
  image_url,
  options,
  correct_answer,
  explanation,
  onNext,
}: MultipleChoiceCardProps) {
  const haptics = useHaptics();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      haptics.success();
    } else {
      haptics.doubleError();
    }

    setSelectedIndex(index);
    setShowResult(true);

    if (isCorrect) {
      setTimeout(() => {
        onNext(index);
        setSelectedIndex(null);
        setShowResult(false);
      }, 2000);
    }
  };

  const handleContinue = () => {
    onNext(selectedIndex);
    setSelectedIndex(null);
    setShowResult(false);
  };

  const showWrongAnswer = showResult && selectedIndex !== correct_answer;

  const getOptionState = (index: number) => {
    if (!showResult) return 'default';
    if (correct_answer === index) return 'correct';
    if (selectedIndex === index) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Optional Image */}
        {image_url && (
          <Animated.View
            entering={ZoomIn.duration(500).delay(100)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
        )}

        {/* Question */}
        <Animated.Text
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.question}
        >
          Which word means "{translation}"?
        </Animated.Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options?.map((option, index) => (
            <AnswerOption
              key={index}
              text={option}
              onPress={() => handleSelect(index)}
              disabled={showResult}
              state={getOptionState(index)}
              entranceDelay={100 * (index + 1)}
              hapticFeedback={false}
            />
          ))}
        </View>
      </View>

      <DarkOverlay visible={showWrongAnswer} />

      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Translation Tip"
        explanation={explanation}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  imageContainer: {
    alignSelf: 'center',
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
  question: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing['2xl'] + spacing.lg,
  },
  optionsContainer: {
    width: '100%',
  },
});
