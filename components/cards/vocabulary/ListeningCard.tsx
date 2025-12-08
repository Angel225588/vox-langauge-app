/**
 * ListeningCard - Audio Recognition Card
 *
 * "Listen & Write" or "Listen & Select" card for audio comprehension.
 * Based on Listen card.png reference.
 *
 * Modes:
 * - Quiz mode: Multiple choice options
 * - Type mode: Text input (like existing TextInputCard)
 * - Passive mode: Just reveal the answer
 *
 * Features:
 * - Large audio play button with pulse animation
 * - Speed toggle (normal/slow)
 * - Multiple choice OR text input
 * - Immediate feedback with haptics
 * - Typo tolerance for typing mode
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { DarkOverlay, AnswerFeedbackOverlay, AnswerOption } from '@/components/ui';
import { useVocabCard } from './hooks/useVocabCard';
import type { VocabCardProps } from '@/types/vocabulary';

// Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

type ListeningMode = 'quiz' | 'type';

interface ListeningCardProps extends VocabCardProps {
  mode?: ListeningMode;
  options?: string[]; // For quiz mode
  correctAnswerIndex?: number; // For quiz mode
}

export function ListeningCard({
  item,
  onComplete,
  onSkip,
  mode = 'type',
  options,
  correctAnswerIndex = 0,
}: ListeningCardProps) {
  const haptics = useHaptics();
  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { trackAudioPlay, trackHintUsed, complete } = useVocabCard({
    variant: 'listening',
    onComplete,
  });

  // Animation values
  const audioButtonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const inputScale = useSharedValue(1);

  // Pulse animation when playing
  React.useEffect(() => {
    if (isPlaying) {
      pulseScale.value = withRepeat(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isPlaying]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const handlePlayAudio = useCallback(async (slow = false) => {
    haptics.light();
    trackAudioPlay();
    audioButtonScale.value = withSpring(0.9, {}, () => {
      audioButtonScale.value = withSpring(1);
    });

    const rate = slow ? 0.6 : 1.0;
    setPlaybackRate(rate);

    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if (item.audioUrl) {
      try {
        if (sound) await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: item.audioUrl },
          { shouldPlay: true, rate, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
          }
        );
        setSound(newSound);
      } catch {
        Speech.speak(item.word, {
          rate: slow ? 0.5 : 0.8,
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      }
    } else {
      Speech.speak(item.word, {
        rate: slow ? 0.5 : 0.8,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  }, [sound, isPlaying, item, haptics, trackAudioPlay]);

  const handleShowHint = useCallback(() => {
    haptics.light();
    trackHintUsed();
    setShowHint(true);
  }, [haptics, trackHintUsed]);

  const handleSelectOption = useCallback((index: number) => {
    const correct = index === correctAnswerIndex;

    if (correct) {
      haptics.success();
    } else {
      haptics.doubleError();
    }

    setSelectedIndex(index);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setTimeout(() => {
        complete(true);
      }, 1500);
    }
  }, [correctAnswerIndex, haptics, complete]);

  const handleSubmitTyping = useCallback(() => {
    const userAnswer = input.toLowerCase().trim();
    const correctAnswer = item.word.toLowerCase().trim();

    let correct = userAnswer === correctAnswer;
    if (!correct) {
      const distance = levenshteinDistance(userAnswer, correctAnswer);
      correct = distance <= 1;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      haptics.success();
      setTimeout(() => complete(true, input), 1500);
    } else {
      haptics.doubleError();
    }
  }, [input, item.word, haptics, complete]);

  const handleContinue = useCallback(() => {
    complete(false, mode === 'type' ? input : undefined);
  }, [complete, mode, input]);

  const audioButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: audioButtonScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isPlaying ? 0.4 : 0,
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const showWrongAnswer = showResult && !isCorrect;

  const getOptionState = (index: number) => {
    if (!showResult) return 'default';
    if (correctAnswerIndex === index) return 'correct';
    if (selectedIndex === index) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.header}
      >
        <View style={styles.headerPill}>
          <Text style={styles.headerIcon}>🎧</Text>
          <Text style={styles.headerText}>Listen & Write</Text>
          <Text style={styles.headerIcon}>✍️</Text>
        </View>
      </Animated.View>

      {/* Audio Controls */}
      <Animated.View
        entering={ZoomIn.duration(500).delay(200)}
        style={styles.audioSection}
      >
        {/* Pulse background */}
        <Animated.View style={[styles.pulseBg, pulseStyle]} />

        <View style={styles.audioControls}>
          {/* Normal speed */}
          <Animated.View style={audioButtonStyle}>
            <TouchableOpacity
              onPress={() => handlePlayAudio(false)}
              activeOpacity={0.8}
              style={[
                styles.audioButton,
                isPlaying && playbackRate === 1.0 && styles.audioButtonActive,
              ]}
            >
              <Text style={styles.audioButtonIcon}>▶️</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Slow speed */}
          <TouchableOpacity
            onPress={() => handlePlayAudio(true)}
            activeOpacity={0.8}
            style={[
              styles.audioButton,
              isPlaying && playbackRate < 1.0 && styles.audioButtonActive,
            ]}
          >
            <Text style={styles.audioButtonIcon}>▶️</Text>
            <View style={styles.slowBadge}>
              <Text style={styles.slowBadgeText}>🐌</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Quiz Mode: Multiple Choice */}
      {mode === 'quiz' && options && (
        <Animated.View
          entering={FadeIn.duration(400).delay(400)}
          style={styles.optionsContainer}
        >
          {options.map((option, index) => (
            <AnswerOption
              key={index}
              text={option}
              onPress={() => handleSelectOption(index)}
              disabled={showResult}
              state={getOptionState(index)}
              entranceDelay={100 * index + 400}
              hapticFeedback={false}
            />
          ))}
        </Animated.View>
      )}

      {/* Type Mode: Text Input */}
      {mode === 'type' && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.inputSection}
        >
          {/* Hint button */}
          {!showHint && !showResult && (
            <TouchableOpacity
              onPress={handleShowHint}
              activeOpacity={0.7}
              style={styles.hintButton}
            >
              <Text style={styles.hintButtonText}>💡</Text>
            </TouchableOpacity>
          )}

          <Animated.View style={[inputAnimatedStyle, styles.inputWrapper]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                showHint
                  ? `Hint: ${item.word.substring(0, 2)}...`
                  : 'Type what you hear...'
              }
              placeholderTextColor={showHint ? colors.accent.purple : colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  borderColor: !showResult
                    ? colors.border.light
                    : isCorrect
                    ? colors.success.DEFAULT
                    : colors.error.DEFAULT,
                  shadowColor: showResult
                    ? isCorrect
                      ? colors.success.DEFAULT
                      : colors.error.DEFAULT
                    : '#000',
                  shadowOpacity: showResult ? 0.4 : 0.1,
                },
              ]}
              editable={!showResult}
              onFocus={() => {
                inputScale.value = withSpring(1.02);
                haptics.light();
              }}
              onBlur={() => {
                inputScale.value = withSpring(1);
              }}
              onSubmitEditing={handleSubmitTyping}
            />
          </Animated.View>

          {/* Check button */}
          {!showWrongAnswer && (
            <TouchableOpacity
              onPress={handleSubmitTyping}
              disabled={!input || (showResult && isCorrect)}
              activeOpacity={0.8}
              style={[
                styles.checkButton,
                {
                  backgroundColor:
                    !input || (showResult && isCorrect)
                      ? colors.background.elevated
                      : colors.primary.DEFAULT,
                },
              ]}
            >
              <Text style={styles.checkButtonText}>
                {showResult && isCorrect ? '✓ Correct!' : 'Check'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Overlays */}
      <DarkOverlay visible={showWrongAnswer} opacity={0.3} />
      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Listening Tip"
        explanation={`The correct answer is "${item.word}"`}
        correctAnswer={item.word}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  audioSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  pulseBg: {
    position: 'absolute',
    width: 140,
    height: 70,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primary.DEFAULT,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.md,
  },
  audioButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  audioButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.light,
  },
  audioButtonIcon: {
    fontSize: 24,
  },
  slowBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    padding: 2,
  },
  slowBadgeText: {
    fontSize: 12,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  inputSection: {
    position: 'relative',
  },
  hintButton: {
    position: 'absolute',
    right: 0,
    top: -48,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    zIndex: 10,
  },
  hintButtonText: {
    fontSize: 20,
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    borderWidth: 2,
    textAlign: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  checkButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  checkButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
