import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface TextInputCardProps {
  question: string;
  prompt?: string;
  imageUrl?: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
  onAnswer?: (isCorrect: boolean, userAnswer: string) => void;
}

export function TextInputCard({
  question,
  prompt,
  imageUrl,
  correctAnswer,
  acceptedAnswers = [],
  caseSensitive = false,
  onAnswer,
}: TextInputCardProps) {
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const checkAnswer = (answer: string) => {
    const normalizedAnswer = caseSensitive
      ? answer.trim()
      : answer.trim().toLowerCase();

    const normalizedCorrect = caseSensitive
      ? correctAnswer.trim()
      : correctAnswer.trim().toLowerCase();

    const normalizedAccepted = acceptedAnswers.map((a) =>
      caseSensitive ? a.trim() : a.trim().toLowerCase()
    );

    return (
      normalizedAnswer === normalizedCorrect ||
      normalizedAccepted.includes(normalizedAnswer)
    );
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || isAnswered) return;

    Keyboard.dismiss();
    setIsAnswered(true);

    const correct = checkAnswer(userInput);
    setIsCorrect(correct);

    // Haptic feedback
    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Shake animation for wrong answer
      translateX.value = withSequence(
        withSpring(-10, { damping: 2, stiffness: 200 }),
        withSpring(10, { damping: 2, stiffness: 200 }),
        withSpring(-10, { damping: 2, stiffness: 200 }),
        withSpring(0, { damping: 2, stiffness: 200 })
      );
    }

    // Callback
    onAnswer?.(correct, userInput);
  };

  const handleTryAgain = () => {
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      {prompt && <Text style={styles.prompt}>{prompt}</Text>}

      {/* Image (optional) */}
      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Text Input */}
      <Animated.View style={[styles.inputContainer, animatedStyle]}>
        <LinearGradient
          colors={
            isAnswered
              ? isCorrect
                ? colors.gradients.success
                : colors.gradients.error
              : colors.gradients.dark
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inputGradient}
        >
          <TextInput
            value={userInput}
            onChangeText={setUserInput}
            onSubmitEditing={handleSubmit}
            placeholder="Type your answer..."
            placeholderTextColor={colors.text.tertiary}
            style={styles.input}
            editable={!isAnswered}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          {isAnswered && (
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={28}
              color={colors.text.primary}
            />
          )}
        </LinearGradient>
      </Animated.View>

      {/* Feedback */}
      {isAnswered && !isCorrect && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            Correct answer: <Text style={styles.correctAnswer}>{correctAnswer}</Text>
          </Text>
        </View>
      )}

      {/* Submit/Try Again Button */}
      <TouchableOpacity
        onPress={isAnswered ? handleTryAgain : handleSubmit}
        disabled={!userInput.trim()}
        activeOpacity={0.8}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={
            !userInput.trim()
              ? [colors.text.disabled, colors.text.disabled]
              : isAnswered
              ? colors.gradients.warning
              : colors.gradients.primary
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {isAnswered ? 'Try Again' : 'Check Answer'}
          </Text>
          <Ionicons
            name={isAnswered ? 'refresh' : 'checkmark'}
            size={24}
            color={colors.text.primary}
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.lg,
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  prompt: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    width: '100%',
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    padding: spacing.sm,
  },
  feedbackContainer: {
    padding: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning.DEFAULT,
  },
  feedbackText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  correctAnswer: {
    fontWeight: typography.fontWeight.bold,
    color: colors.success.DEFAULT,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
