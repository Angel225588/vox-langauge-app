/**
 * Fill In Blank Card Component
 *
 * Grammar-in-context exercise where users select the correct word to complete a sentence.
 *
 * Features:
 * - Displays sentence with [BLANK] placeholder
 * - Shows selected word inline in the sentence
 * - Multiple choice options
 * - Grammar explanation when incorrect
 * - Dual highlighting (correct in green, incorrect in red)
 * - Visual feedback and haptic responses
 * - Auto-advances after selection (1.5s delay)
 *
 * Learning Objective: Reinforce grammar in authentic sentence context
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface FillInBlankCardProps {
  sentence: string;        // Sentence with [BLANK] placeholder
  options: string[];       // Answer options
  correct_answer: number;  // Index of correct answer
  explanation?: string;    // Grammar explanation shown when incorrect
  onNext: (result?: any) => void;
}

export function FillInBlankCard({
  sentence,
  options,
  correct_answer,
  explanation,
  onNext,
}: FillInBlankCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Strong double vibration for wrong answers
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 100);
    }

    setSelectedIndex(index);
    setShowResult(true);

    // Auto-advance for correct, manual Continue for incorrect
    if (isCorrect) {
      setTimeout(() => {
        onNext({ correct: true, points: 15 });
        setSelectedIndex(null);
        setShowResult(false);
      }, 1500);
    }
    // If incorrect, show Continue button (no auto-advance)
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext({ correct: false, points: 5 });
    setSelectedIndex(null);
    setShowResult(false);
  };

  // Split sentence by [BLANK] placeholder
  const parts = sentence.split('[BLANK]');
  const selectedWord = selectedIndex !== null ? options[selectedIndex] : null;
  const showWrongAnswer = showResult && selectedIndex !== correct_answer;

  return (
    <View style={{ flex: 1 }}>
      {/* Blur overlay when wrong answer */}
      {showWrongAnswer && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1,
          }}
        />
      )}

      {/* Scrollable content area */}
      <View style={{ flex: 1, justifyContent: 'center', opacity: showWrongAnswer ? 0.5 : 1 }}>
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing.md,
          }}
        >
          Fill in the blank
        </Animated.Text>

      {/* Sentence with blank */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={{
          backgroundColor: colors.background.card,
          padding: spacing.xl,
          borderRadius: borderRadius.xl,
          marginBottom: spacing.xl + spacing.lg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.primary,
            textAlign: 'center',
            lineHeight: typography.fontSize.lg * 1.5,
          }}
        >
          {parts[0]}
          {selectedWord ? (
            <Text
              style={{
                fontWeight: typography.fontWeight.bold,
                color: showResult
                  ? correct_answer === selectedIndex
                    ? colors.success.DEFAULT
                    : colors.error.DEFAULT
                  : colors.accent.purple,
                textDecorationLine: 'underline',
              }}
            >
              {selectedWord}
            </Text>
          ) : (
            <Text
              style={{
                color: colors.text.tertiary,
                textDecorationLine: 'underline',
              }}
            >
              _______
            </Text>
          )}
          {parts[1]}
        </Text>
      </Animated.View>

      {/* Options */}
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <Animated.View
            key={index}
            entering={FadeInDown.duration(400).delay(100 * (index + 1) + 300).springify()}
          >
            <TouchableOpacity
              onPress={() => !showResult && handleSelect(index)}
              disabled={showResult}
              activeOpacity={0.8}
              style={{
                backgroundColor: showAsCorrect
                  ? colors.success.DEFAULT
                  : showAsWrong
                    ? colors.error.DEFAULT
                    : colors.background.card,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.xl,
                borderRadius: borderRadius.xl,
                marginBottom: spacing.md,
                borderWidth: 2,
                borderColor: showAsCorrect || showAsWrong
                  ? 'transparent'
                  : colors.border.light,
                shadowColor: showAsCorrect
                  ? colors.success.DEFAULT
                  : showAsWrong
                    ? colors.error.DEFAULT
                    : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: showAsCorrect || showAsWrong ? 0.4 : 0.1,
                shadowRadius: 4,
                elevation: showAsCorrect || showAsWrong ? 4 : 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
                {showAsCorrect && <Text style={{ fontSize: 20 }}>✓</Text>}
                {showAsWrong && <Text style={{ fontSize: 20 }}>✗</Text>}
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    textAlign: 'center',
                  }}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      </View>

      {/* Wrong Answer Feedback - Unified red card at bottom */}
      {showWrongAnswer && (
        <Animated.View
          entering={FadeIn.duration(400).delay(300)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#2D1B1E',
            borderTopLeftRadius: borderRadius['2xl'],
            borderTopRightRadius: borderRadius['2xl'],
            borderLeftWidth: 4,
            borderLeftColor: colors.error.DEFAULT,
            padding: spacing.xl,
            paddingBottom: spacing.xl + spacing.md,
            zIndex: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Grammar Tip Header */}
          {explanation && (
            <>
              <Text
                style={{
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.error.DEFAULT,
                  marginBottom: spacing.md,
                }}
              >
                Grammar Tip
              </Text>
              <Text
                style={{
                  fontSize: typography.fontSize.lg,
                  color: colors.text.primary,
                  lineHeight: typography.fontSize.lg * 1.4,
                  marginBottom: spacing.xl,
                }}
              >
                {explanation}
              </Text>
            </>
          )}

          {/* Continue Button */}
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
