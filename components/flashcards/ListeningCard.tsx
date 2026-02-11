/**
 * ListeningCard — Audio dictation card
 *
 * Plays audio, user types what they hear.
 * Design system: dark neomorphic theme, TypeBadge
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from '@/constants/designSystem';
import { TypeBadge } from '@/components/ui/TypeBadge';

interface ListeningCardProps {
  word: string;
  audioUrl: string;
  onCorrect: () => void;
  onIncorrect: () => void;
  onSkip?: () => void;
}

const ListeningCard: React.FC<ListeningCardProps> = ({
  word,
  audioUrl,
  onCorrect,
  onIncorrect,
  onSkip,
}) => {
  const [userInput, setUserInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const player = useAudioPlayer(audioUrl);

  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.8);

  function playSound() {
    if (player) {
      player.play();
    }
  }

  useEffect(() => {
    playSound();
  }, []);

  const showFeedback = (correct: boolean, message: string) => {
    setIsCorrect(correct);
    setFeedbackMessage(message);
    feedbackOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(1000, withTiming(0, { duration: 300 }))
    );
    feedbackScale.value = withSequence(
      withSpring(1.2),
      withDelay(1000, withSpring(0.8))
    );
  };

  const handleCheck = () => {
    if (userInput.trim().toLowerCase() === word.toLowerCase()) {
      showFeedback(true, 'Correct!');
      setTimeout(onCorrect, 1600);
    } else {
      showFeedback(false, `Incorrect. The answer was "${word}".`);
      setTimeout(onIncorrect, 1600);
    }
  };

  const feedbackAnimatedStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TypeBadge variant="listening" />

        <Text style={styles.title}>Listen and type what you hear</Text>

        <TouchableOpacity style={styles.audioCircle} onPress={playSound} activeOpacity={0.7}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.audioCircleGradient}
          >
            <Ionicons name="volume-high" size={48} color={colors.text.primary} />
          </LinearGradient>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type here..."
          placeholderTextColor={colors.text.disabled}
          value={userInput}
          onChangeText={setUserInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Feedback overlay */}
        <Animated.View
          style={[
            styles.feedbackBadge,
            isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
            feedbackAnimatedStyle,
          ]}
        >
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </Animated.View>

        {/* Check button */}
        <TouchableOpacity
          onPress={handleCheck}
          disabled={!userInput}
          activeOpacity={0.8}
          style={styles.checkButtonWrapper}
        >
          <LinearGradient
            colors={userInput ? colors.gradients.success : colors.gradients.dark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.checkButton, !userInput && styles.checkButtonDisabled]}
          >
            <Text style={styles.checkButtonText}>Check</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity onPress={playSound} style={styles.secondaryButton}>
            <Ionicons name="refresh" size={18} color={colors.text.tertiary} />
            <Text style={styles.secondaryText}>Play again</Text>
          </TouchableOpacity>
          {onSkip && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity onPress={onSkip} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Skip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  audioCircle: {
    marginVertical: spacing.lg,
  },
  audioCircleGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  feedbackBadge: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  feedbackCorrect: {
    backgroundColor: colors.success.DEFAULT,
  },
  feedbackIncorrect: {
    backgroundColor: colors.error.DEFAULT,
  },
  feedbackText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
  checkButtonWrapper: {
    width: '100%',
    marginTop: spacing.md,
  },
  checkButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    opacity: 0.5,
  },
  checkButtonText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  secondaryText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
});

export default ListeningCard;
