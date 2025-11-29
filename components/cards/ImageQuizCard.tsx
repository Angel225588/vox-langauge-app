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
 * - Image wrapped in Animated.View for proper remote URL rendering
 *
 * Learning Objective: Associate visual imagery with vocabulary for stronger memory retention
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface ImageQuizCardProps extends CardProps {
  word?: string;
  options?: string[];
  correct_answer?: number;
  image_url?: string;
  explanation?: string; // Vocabulary tip shown when incorrect
}

export function ImageQuizCard({
  word,
  options,
  correct_answer,
  image_url,
  explanation,
  onNext,
}: ImageQuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Strong vibration for wrong answer
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Additional heavy impact for emphasis
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);
    }

    setSelectedIndex(index);
    setShowResult(true);

    // Auto-advance for correct, manual Continue for incorrect
    if (isCorrect) {
      setTimeout(() => {
        onNext(index);
        setSelectedIndex(null);
        setShowResult(false);
      }, 1500);
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext(selectedIndex);
    setSelectedIndex(null);
    setShowResult(false);
  };

  const showWrongAnswer = showResult && selectedIndex !== correct_answer;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
      {image_url && (
        <Animated.View entering={ZoomIn.duration(500)}>
          <Image
            source={{ uri: image_url }}
            style={{
              width: '100%',
              height: 250,
              borderRadius: borderRadius.xl,
              marginBottom: spacing.xl,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          />
        </Animated.View>
      )}

      <Animated.Text
        entering={FadeIn.duration(400).delay(300)}
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        What is this?
      </Animated.Text>

      {options?.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <Animated.View
            key={index}
            entering={FadeInDown.duration(400).delay(100 * (index + 1) + 400).springify()}
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

      {/* Blur overlay when wrong answer is shown */}
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
          }}
          pointerEvents="none"
        />
      )}

      {/* Bottom section with Vocabulary Tip and Continue - Fixed at bottom */}
      {showWrongAnswer && (
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          {/* Unified card container */}
          <View
            style={{
              marginHorizontal: spacing.lg,
              backgroundColor: '#2D1B1E',
              borderRadius: borderRadius.xl,
              borderLeftWidth: 4,
              borderLeftColor: colors.error.DEFAULT,
              overflow: 'hidden',
            }}
          >
            {/* Vocabulary Tip */}
            {explanation && (
              <View
                style={{
                  padding: spacing.lg,
                  paddingBottom: spacing.md,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.fontSize.md,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.error.light,
                    marginBottom: spacing.sm,
                  }}
                >
                  Vocabulary Tip
                </Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    color: colors.text.primary,
                    lineHeight: 26,
                  }}
                >
                  {explanation}
                </Text>
              </View>
            )}

            {/* Continue Button */}
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingTop: explanation ? 0 : spacing.lg,
                paddingBottom: spacing.xl,
              }}
            >
              <TouchableOpacity
                onPress={handleContinue}
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.error.DEFAULT,
                  borderWidth: 2,
                  borderColor: colors.error.light,
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
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
