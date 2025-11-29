import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  borderRadius,
  spacing,
  shadows,
  typography,
  animation,
} from '@/constants/designSystem';
import { LottieSuccess } from '../animations/LottieSuccess';
import { LottieError } from '../animations/LottieError';

// --- CONSTANTS ---
const WORD_HEIGHT = 50;

// --- TYPES ---
interface SentenceScrambleCardProps {
  words: string[];
  correctOrder: string[];
  targetSentence: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (isCorrect: boolean) => void;
  [key: string]: any;
}

// --- MAIN CARD COMPONENT ---
export const SentenceScrambleCard: React.FC<SentenceScrambleCardProps> = ({
  words: initialWords,
  correctOrder,
  targetSentence,
  hint,
  difficulty,
  onComplete,
  ...baseCardProps
}) => {
  // State for word bank (available words)
  const [wordBank, setWordBank] = useState<string[]>([]);
  // State for answer area (selected words)
  const [answerWords, setAnswerWords] = useState<string[]>([]);

  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);

  // Initialize by shuffling words
  useEffect(() => {
    const shuffled = [...initialWords].sort(() => Math.random() - 0.5);
    setWordBank(shuffled);
    setAnswerWords([]);
  }, [initialWords]);

  // Move word from bank to answer area
  const handleWordFromBank = (word: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newBank = [...wordBank];
    newBank.splice(index, 1);
    setWordBank(newBank);
    setAnswerWords([...answerWords, word]);
    setIsChecked(false); // Reset check status when user makes changes
  };

  // Move word from answer back to bank
  const handleWordFromAnswer = (word: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswer = [...answerWords];
    newAnswer.splice(index, 1);
    setAnswerWords(newAnswer);
    setWordBank([...wordBank, word]);
    setIsChecked(false);
  };

  // Clear all words back to bank
  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWordBank([...wordBank, ...answerWords]);
    setAnswerWords([]);
    setIsChecked(false);
    setIsCorrect(null);
  };

  // Check answer
  const handleSubmit = async () => {
    if (answerWords.length === 0) return;

    setIsChecked(true);
    const userAnswer = answerWords.join(' ');
    const correct = userAnswer === targetSentence;
    setIsCorrect(correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowResultAnimation('success');
      Speech.speak(targetSentence, { language: 'en-US' });
      setTimeout(() => {
        setShowResultAnimation(null);
        onComplete(true);
      }, 2500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowResultAnimation('error');
      setTimeout(() => {
        setShowResultAnimation(null);
      }, 1500);
    }
  };

  return (
    <View style={[styles.cardContainer, baseCardProps.style]}>
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tap the words in the correct order</Text>
        <Text style={styles.difficultyText}>Difficulty: {difficulty}</Text>
        {hint && (
          <View style={styles.hintContainer}>
            <Ionicons name="bulb-outline" size={16} color={colors.accent.purple} />
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        )}
      </View>

      {/* Answer Area (where user builds the sentence) */}
      <View style={[
        styles.answerZone,
        isChecked && isCorrect === true && styles.answerZoneCorrect,
        isChecked && isCorrect === false && styles.answerZoneIncorrect,
      ]}>
        <Text style={styles.zoneLabel}>Your Answer:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.answerContent}>
          {answerWords.length === 0 ? (
            <Text style={styles.placeholderText}>Tap words below to build your sentence...</Text>
          ) : (
            answerWords.map((word, index) => (
              <Animated.View key={`answer-${index}`} entering={SlideInDown}>
                <TouchableOpacity
                  style={[
                    styles.answerWordTile,
                    isChecked && isCorrect === true && styles.wordTileCorrect,
                    isChecked && isCorrect === false && styles.wordTileIncorrect,
                  ]}
                  onPress={() => handleWordFromAnswer(word, index)}
                  disabled={isChecked && isCorrect === true}
                >
                  <Text style={styles.answerWordText}>{word}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Word Bank (available words) */}
      <View style={styles.wordBankZone}>
        <View style={styles.bankHeader}>
          <Text style={styles.zoneLabel}>Word Bank:</Text>
          {answerWords.length > 0 && !isChecked && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="refresh-outline" size={18} color={colors.primary.DEFAULT} />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.wordBankContent}>
          {wordBank.map((word, index) => (
            <Animated.View key={`bank-${index}`} entering={SlideInUp}>
              <TouchableOpacity
                style={styles.bankWordTile}
                onPress={() => handleWordFromBank(word, index)}
              >
                <Text style={styles.bankWordText}>{word}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Feedback & Controls */}
      {isChecked && isCorrect === false && (
        <Animated.View entering={FadeIn} style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>Not quite right. Try again!</Text>
          <Text style={styles.correctSentenceText}>Correct: "{targetSentence}"</Text>
        </Animated.View>
      )}

      {isChecked && isCorrect === true && (
        <Animated.View entering={FadeIn} style={styles.successBox}>
          <Text style={styles.successText}>Perfect! Well done!</Text>
        </Animated.View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            (answerWords.length === 0 || isCorrect === true) && styles.submitButtonDisabled,
            isCorrect === true && styles.submitButtonCorrect,
          ]}
          disabled={answerWords.length === 0 || isCorrect === true}
        >
          <Text style={styles.submitButtonText}>
            {isCorrect === true ? 'Completed ✓' : 'Check Answer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 500,
    justifyContent: 'flex-start',
    ...shadows.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  difficultyText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.elevated,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  hintText: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },

  // Answer Zone
  answerZone: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 100,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
    ...shadows.sm,
  },
  answerZoneCorrect: {
    borderColor: colors.success.DEFAULT,
    backgroundColor: colors.success.dark,
    borderStyle: 'solid',
  },
  answerZoneIncorrect: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: colors.error.dark,
    borderStyle: 'solid',
  },
  zoneLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  answerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
  },
  answerWordTile: {
    height: WORD_HEIGHT,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    ...shadows.md,
  },
  wordTileCorrect: {
    backgroundColor: colors.success.DEFAULT,
  },
  wordTileIncorrect: {
    backgroundColor: colors.error.DEFAULT,
  },
  answerWordText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  // Word Bank Zone
  wordBankZone: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
  },
  clearText: {
    color: colors.primary.DEFAULT,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  wordBankContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bankWordTile: {
    height: WORD_HEIGHT,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  bankWordText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },

  // Feedback
  feedbackBox: {
    backgroundColor: colors.error.dark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.DEFAULT,
  },
  feedbackText: {
    color: colors.error.light,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  correctSentenceText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
  successBox: {
    backgroundColor: colors.success.dark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success.DEFAULT,
  },
  successText: {
    color: colors.success.light,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },

  // Controls
  controls: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.background.elevated,
    opacity: 0.6,
  },
  submitButtonCorrect: {
    backgroundColor: colors.success.DEFAULT,
    ...shadows.glow.success,
  },
  submitButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: borderRadius.xl,
  },
});
