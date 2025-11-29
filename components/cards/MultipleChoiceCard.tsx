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
 * UX Research: Immediate feedback with explanation strengthens memory correction
 * Source: https://medium.com/design-bootcamp/ux-research-duolingo-app-case-study-54230f0aa4f7
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface MultipleChoiceCardProps extends CardProps {
  word?: string;
  translation?: string;
  image_url?: string; // Optional image for visual context
  options?: string[];
  correct_answer?: number;
  explanation?: string; // Explanation shown when user answers incorrectly
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

    // Smart timing: auto-advance for correct, manual Continue for incorrect
    if (isCorrect) {
      setTimeout(() => {
        onNext(index);
        setSelectedIndex(null);
        setShowResult(false);
      }, 2000); // 2s to see green feedback
    }
    // If incorrect, user must tap Continue button (no auto-advance)
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
      {/* Scrollable content area */}
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg }}>
        {/* Optional Image for Visual Context */}
        {image_url && (
          <Animated.View
            entering={ZoomIn.duration(500).delay(100)}
            style={{
              alignSelf: 'center',
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

        <Animated.Text
          entering={FadeInDown.duration(400).delay(200)}
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing['2xl'] + spacing.lg,
          }}
        >
          Which word means "{translation}"?
        </Animated.Text>

        {/* Full width options */}
        <View style={{ width: '100%' }}>
          {options?.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = correct_answer === index;
            const showAsCorrect = showResult && isCorrect;
            const showAsWrong = showResult && isSelected && !isCorrect;

            return (
              <Animated.View
                key={index}
                entering={FadeInDown.duration(400).delay(100 * (index + 1)).springify()}
                style={{
                  width: '100%',
                  marginBottom: spacing.md,
                }}
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
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.xl,
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
                    minHeight: 60,
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
                        flexShrink: 1,
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

      {/* Bottom section with Translation Tip and Continue - Fixed at bottom */}
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
            {/* Translation Tip */}
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
                  Translation Tip
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
