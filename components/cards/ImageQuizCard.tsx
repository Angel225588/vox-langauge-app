/**
 * Image Quiz Card Component
 *
 * Displays an image and asks the user to identify what it is by selecting from multiple options.
 *
 * Features:
 * - Shows image with zoom-in animation
 * - Question: "What is this?"
 * - 4 multiple choice options with staggered entrance
 * - Visual feedback (green for correct, red for incorrect)
 * - Haptic feedback (success/error)
 * - Auto-advances after selection (1.5s delay)
 * - Checkmark (✓) or X (✗) indicator
 *
 * Learning Objective: Associate visual imagery with vocabulary for stronger memory retention
 *
 * REFACTORED: Now uses shared UI components for consistency
 */

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// Shared UI components
import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay } from '@/components/ui';
import { useHaptics } from '@/hooks/useHaptics';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface ImageQuizCardProps extends CardProps {
  word?: string;
  options?: string[];
  correct_answer?: number;
  image_url?: string;
  explanation?: string;
}

export function ImageQuizCard({
  word,
  options,
  correct_answer,
  image_url,
  explanation,
  onNext,
}: ImageQuizCardProps) {
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
      }, 1500);
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
        {/* Image */}
        {image_url && (
          <Animated.View entering={ZoomIn.duration(500)}>
            <Image
              source={{ uri: image_url }}
              style={styles.image}
            />
          </Animated.View>
        )}

        {/* Question */}
        <Animated.Text
          entering={FadeIn.duration(400).delay(300)}
          style={styles.question}
        >
          What is this?
        </Animated.Text>

        {/* Options */}
        {options?.map((option, index) => (
          <AnswerOption
            key={index}
            text={option}
            onPress={() => handleSelect(index)}
            disabled={showResult}
            state={getOptionState(index)}
            entranceDelay={100 * (index + 1) + 400}
            hapticFeedback={false}
          />
        ))}
      </View>

      <DarkOverlay visible={showWrongAnswer} />

      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Vocabulary Tip"
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
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
