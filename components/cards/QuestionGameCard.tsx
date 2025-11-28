import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BaseCard } from './BaseCard';
import { colors, borderRadius, spacing, shadows, typography } from '@/constants/designSystem';
import LottieSuccess from '../animations/LottieSuccess';
import LottieError from '../animations/LottieError';

interface QuestionGameCardProps {
  secretWord: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxQuestions?: number;
  onComplete: (won: boolean, questionsUsed: number) => void;
  // Inherited from BaseCardProps
  [key: string]: any;
}

interface QARound {
  question: string;
  answer: 'Yes' | 'No' | 'Maybe' | 'N/A';
  type: 'question' | 'guess';
}

// Simple knowledge base for AI responses (could be expanded)
const AI_KNOWLEDGE_BASE: { [key: string]: { properties: string[], negativeProperties: string[] } } = {
  apple: { properties: ['red', 'fruit', 'round', 'sweet', 'tree'], negativeProperties: ['vegetable', 'meat', 'square'] },
  dog: { properties: ['animal', 'pet', 'fur', 'bark', 'four legs'], negativeProperties: ['fish', 'bird', 'plant'] },
  cat: { properties: ['animal', 'pet', 'fur', 'meow', 'four legs'], negativeProperties: ['fish', 'bird', 'plant'] },
  car: { properties: ['vehicle', 'drive', 'wheels', 'transport'], negativeProperties: ['animal', 'plant', 'food'] },
  house: { properties: ['building', 'live in', 'home', 'rooms'], negativeProperties: ['animal', 'vehicle', 'food'] },
  flower: { properties: ['plant', 'beautiful', 'grow', 'garden'], negativeProperties: ['animal', 'vehicle', 'building'] },
  coffee: { properties: ['drink', 'hot', 'caffeine', 'breakfast'], negativeProperties: ['animal', 'cold', 'food'] },
};

export const QuestionGameCard: React.FC<QuestionGameCardProps> = ({
  secretWord,
  category,
  difficulty,
  maxQuestions = 10,
  onComplete,
  ...baseCardProps
}) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<QARound[]>([]);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userGuess, setUserGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom on new QA entry
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [qaHistory]);

  const getAiAnswer = (question: string): 'Yes' | 'No' | 'Maybe' | 'N/A' => {
    const lowerQuestion = question.toLowerCase();
    const wordInfo = AI_KNOWLEDGE_BASE[secretWord.toLowerCase()];

    if (!wordInfo) return 'N/A'; // No specific info for this word

    // Category-based check
    if (lowerQuestion.includes(category.toLowerCase())) {
        return 'Yes';
    }

    // Property-based checks
    for (const prop of wordInfo.properties) {
      if (lowerQuestion.includes(prop)) {
        return 'Yes';
      }
    }
    for (const negProp of wordInfo.negativeProperties) {
      if (lowerQuestion.includes(negProp)) {
        return 'No';
      }
    }

    // Direct question about the word itself
    if (lowerQuestion.includes(secretWord.toLowerCase())) {
      return 'Yes';
    }

    // General questions often have "Yes" or "No" answers
    if (lowerQuestion.startsWith('is it') || lowerQuestion.startsWith('does it')) {
        // Fallback for unknown properties - simulate some intelligence
        const random = Math.random();
        if (random < 0.4) return 'Yes';
        if (random < 0.8) return 'No';
        return 'Maybe';
    }

    return 'N/A'; // AI isn't sure how to answer
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || questionsUsed >= maxQuestions || gameOver) return;

    setIsSubmitting(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const aiAnswer = getAiAnswer(currentQuestion);

    setQaHistory(prev => [...prev, { question: currentQuestion, answer: aiAnswer, type: 'question' }]);
    setQuestionsUsed(prev => prev + 1);
    setCurrentQuestion('');
    setIsSubmitting(false);

    if (questionsUsed + 1 >= maxQuestions) {
      setGameOver(true);
      // If questions run out without correct guess, it's a loss.
      // Final outcome will be determined by handleGuess or if game over.
    }
  };

  const handleGuess = async () => {
    if (!userGuess.trim() || gameOver) return;

    setIsSubmitting(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const correct = userGuess.toLowerCase() === secretWord.toLowerCase();
    setGameOver(true);

    const finalQuestionsUsed = questionsUsed + (userGuess.trim() ? 1 : 0); // Count the guess as a question

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
      setShowResultAnimation('success');
      onComplete(true, finalQuestionsUsed);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Error);
      setShowResultAnimation('error');
      onComplete(false, finalQuestionsUsed);
    }

    setIsSubmitting(false);
    setTimeout(() => {
      setShowResultAnimation(null);
    }, 1500);
  };

  useEffect(() => {
    if (gameOver && showResultAnimation === null && questionsUsed >= maxQuestions) {
        // If game ended due to max questions and no correct guess
        if (userGuess.toLowerCase() !== secretWord.toLowerCase()) {
             // onComplete was already called by handleGuess. If no guess was made, call here.
             if (qaHistory.filter(item => item.type === 'guess').length === 0) {
                 onComplete(false, questionsUsed);
             }
        }
    }
  }, [gameOver, showResultAnimation, questionsUsed, maxQuestions, secretWord, userGuess, qaHistory, onComplete]);


  return (
    <BaseCard {...baseCardProps} style={styles.cardContainer}>
      {showResultAnimation === 'success' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          <LottieSuccess />
        </Animated.View>
      )}
      {showResultAnimation === 'error' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          <LottieError />
        </Animated.View>
      )}

      <View style={styles.header}>
        <Text style={styles.difficultyText}>Difficulty: {difficulty}</Text>
        <Text style={styles.instructionText}>Guess the secret {category}!</Text>
        <Text style={styles.questionCounter}>Questions Left: {maxQuestions - questionsUsed}/{maxQuestions}</Text>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.qaHistoryContainer}>
        {qaHistory.map((round, index) => (
          <View key={index} style={styles.qaRound}>
            <Text style={styles.questionText}>Q: {round.question}</Text>
            <Text style={styles.answerText}>A: {round.answer}</Text>
          </View>
        ))}
        {gameOver && (
          <Text style={styles.gameOverText}>
            Game Over! The word was "{secretWord}".
          </Text>
        )}
      </ScrollView>

      {!gameOver && (questionsUsed < maxQuestions) && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask a Yes/No question..."
            placeholderTextColor={colors.text.tertiary}
            value={currentQuestion}
            onChangeText={setCurrentQuestion}
            editable={!isSubmitting && questionsUsed < maxQuestions}
            onSubmitEditing={handleAskQuestion}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.askButton}
            onPress={handleAskQuestion}
            disabled={!currentQuestion.trim() || isSubmitting || questionsUsed >= maxQuestions}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Ionicons name="send" size={typography.fontSize.xl} color={colors.text.primary} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {!gameOver && (
        <View style={styles.guessContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Guess the word..."
            placeholderTextColor={colors.text.tertiary}
            value={userGuess}
            onChangeText={setUserGuess}
            editable={!isSubmitting}
            onSubmitEditing={handleGuess}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.guessButton}
            onPress={handleGuess}
            disabled={!userGuess.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.guessButtonText}>Guess</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: spacing.lg,
    minHeight: 500,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.md,
  },
  difficultyText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  instructionText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  questionCounter: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  qaHistoryContainer: {
    flexGrow: 1,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  qaRound: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
  },
  questionText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xs,
  },
  answerText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  gameOverText: {
    color: colors.error.DEFAULT,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  askButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  guessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guessButton: {
    backgroundColor: colors.secondary.DEFAULT,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  guessButtonText: {
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
