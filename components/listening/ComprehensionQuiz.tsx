/**
 * ComprehensionQuiz — MCQ quiz for listening comprehension
 *
 * Used after Stage 1 (isRevealMode=false) and Stage 4 (isRevealMode=true).
 * Stage 1: no correct answer reveal on wrong choice — just brief red flash.
 * Stage 4: full reveal with checkmark/cross icons.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LISTENING } from './theme';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface ComprehensionQuizProps {
  /** Quiz questions */
  questions: Question[];
  /** Stage 4 = true: show correct/wrong indicators. Stage 1 = false: minimal feedback */
  isRevealMode: boolean;
  /** Called when all questions answered with count of correct answers */
  onComplete: (score: number) => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];
const AUTO_ADVANCE_MS = 600;

export default function ComprehensionQuiz({
  questions,
  isRevealMode,
  onComplete,
}: ComprehensionQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answerRecord, setAnswerRecord] = useState<(boolean | null)[]>(
    () => new Array(questions.length).fill(null),
  );

  const question = questions[currentIndex];
  const isAnswered = selectedOption !== null;

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (isAnswered) return;

      const isCorrect = optionIndex === question.correctIndex;
      setSelectedOption(optionIndex);

      // Update record
      const newRecord = [...answerRecord];
      newRecord[currentIndex] = isCorrect;
      setAnswerRecord(newRecord);

      const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
      if (isCorrect) setCorrectCount(newCorrectCount);

      // Haptic feedback
      Haptics.notificationAsync(
        isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error,
      ).catch(() => {});

      // Auto-advance after delay
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setSelectedOption(null);
        } else {
          onComplete(newCorrectCount);
        }
      }, AUTO_ADVANCE_MS);
    },
    [isAnswered, question, currentIndex, questions.length, correctCount, answerRecord, onComplete],
  );

  const getOptionStyle = (optionIndex: number) => {
    if (!isAnswered) return styles.option;

    const isSelected = optionIndex === selectedOption;
    const isCorrect = optionIndex === question.correctIndex;

    if (isRevealMode) {
      // Stage 4: full reveal
      if (isCorrect) return [styles.option, styles.optionCorrect];
      if (isSelected && !isCorrect) return [styles.option, styles.optionWrong];
    } else {
      // Stage 1: minimal — only highlight the selected option
      if (isSelected && isCorrect) return [styles.option, styles.optionCorrect];
      if (isSelected && !isCorrect) return [styles.option, styles.optionWrong];
    }

    return styles.option;
  };

  const getLetterStyle = (optionIndex: number) => {
    if (!isAnswered) return [styles.optionLetter];

    const isSelected = optionIndex === selectedOption;
    const isCorrect = optionIndex === question.correctIndex;

    if (isRevealMode) {
      if (isCorrect) return [styles.optionLetter, styles.optionLetterCorrect];
      if (isSelected && !isCorrect) return [styles.optionLetter, styles.optionLetterWrong];
    } else {
      if (isSelected && isCorrect) return [styles.optionLetter, styles.optionLetterCorrect];
      if (isSelected && !isCorrect) return [styles.optionLetter, styles.optionLetterWrong];
    }

    return [styles.optionLetter];
  };

  const getLetterTextStyle = (optionIndex: number) => {
    if (!isAnswered) return styles.optionLetterText;

    const isSelected = optionIndex === selectedOption;
    const isCorrect = optionIndex === question.correctIndex;

    if (isRevealMode) {
      if (isCorrect) return [styles.optionLetterText, styles.optionLetterTextCorrect];
      if (isSelected && !isCorrect) return [styles.optionLetterText, styles.optionLetterTextWrong];
    } else {
      if (isSelected && isCorrect) return [styles.optionLetterText, styles.optionLetterTextCorrect];
      if (isSelected && !isCorrect) return [styles.optionLetterText, styles.optionLetterTextWrong];
    }

    return styles.optionLetterText;
  };

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i === currentIndex && styles.progressDotActive,
              answerRecord[i] === true && styles.progressDotCompleted,
              answerRecord[i] === false && styles.progressDotWrong,
            ]}
          />
        ))}
      </View>

      {/* Counter */}
      <Text style={styles.counter}>
        Question{' '}
        <Text style={styles.counterHighlight}>{currentIndex + 1}</Text>
        {' '}of {questions.length}
      </Text>

      {/* Question */}
      <Animated.View entering={FadeIn.duration(300)} key={currentIndex}>
        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.optionsContainer}>
          {question.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={getOptionStyle(i)}
              onPress={() => handleSelect(i)}
              activeOpacity={isAnswered ? 1 : 0.7}
              disabled={isAnswered}
              accessibilityLabel={`Option ${LETTERS[i]}: ${opt}`}
            >
              <View style={getLetterStyle(i)}>
                <Text style={getLetterTextStyle(i)}>{LETTERS[i]}</Text>
              </View>
              <Text style={styles.optionText}>{opt}</Text>

              {/* Icons — Stage 4 only */}
              {isRevealMode && isAnswered && i === question.correctIndex && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color={LISTENING.greenLight} />
                </View>
              )}
              {isRevealMode && isAnswered && i === selectedOption && i !== question.correctIndex && (
                <View style={styles.crossIcon}>
                  <Ionicons name="close" size={16} color={LISTENING.redLight} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LISTENING.bg,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LISTENING.gray,
  },
  progressDotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: LISTENING.teal,
  },
  progressDotCompleted: {
    backgroundColor: LISTENING.green,
  },
  progressDotWrong: {
    backgroundColor: LISTENING.red,
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
    color: LISTENING.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  counterHighlight: {
    color: LISTENING.teal,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: LISTENING.textPrimary,
    lineHeight: 28,
    textAlign: 'left',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: LISTENING.glassBg,
    borderColor: LISTENING.glassBorder,
  },
  optionCorrect: {
    backgroundColor: LISTENING.greenSubtle,
    borderColor: LISTENING.greenBorder,
  },
  optionWrong: {
    backgroundColor: LISTENING.redSubtle,
    borderColor: LISTENING.redBorder,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700',
    color: LISTENING.textTertiary,
  },
  optionLetterCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
  },
  optionLetterTextCorrect: {
    color: LISTENING.greenLight,
  },
  optionLetterWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.20)',
  },
  optionLetterTextWrong: {
    color: LISTENING.redLight,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: LISTENING.textPrimary,
    lineHeight: 22,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
