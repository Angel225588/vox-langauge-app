import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface FillInBlankCardProps {
  sentence: string;        // Sentence with [BLANK] placeholder
  options: string[];       // Answer options
  correct_answer: number;  // Index of correct answer
  onNext: (result?: any) => void;
}

export function FillInBlankCard({
  sentence,
  options,
  correct_answer,
  onNext,
}: FillInBlankCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Error);
    }

    setSelectedIndex(index);
    setShowResult(true);

    setTimeout(() => {
      onNext({ correct: isCorrect, points: isCorrect ? 15 : 5 });
      setSelectedIndex(null);
      setShowResult(false);
    }, 1500);
  };

  // Split sentence by [BLANK] placeholder
  const parts = sentence.split('[BLANK]');
  const selectedWord = selectedIndex !== null ? options[selectedIndex] : null;

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
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
          marginBottom: spacing['2xl'],
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
                    ? colors.accent.success
                    : colors.accent.error
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
                  ? colors.accent.success
                  : showAsWrong
                    ? colors.accent.error
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
                  ? colors.accent.success
                  : showAsWrong
                    ? colors.accent.error
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
  );
}
