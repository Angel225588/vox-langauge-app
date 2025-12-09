/**
 * AudioQuizCard - Listen & Select Card
 *
 * "What did you hear?" pattern for audio comprehension.
 * User listens to pronunciation, then selects from multiple choice options.
 *
 * Features:
 * - Large audio play button with pulse animation
 * - Speed toggle (normal/slow)
 * - 4 multiple choice options
 * - Visual feedback (green correct, red incorrect)
 * - Auto-advance on correct answer
 * - Fixed bottom section with replay option
 *
 * Design inspiration: Listen card.png reference, premium apps
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay } from '@/components/ui';
import { useVocabCard } from './hooks/useVocabCard';
import type { VocabCardProps, VocabularyItem } from '@/types/vocabulary';

interface AudioQuizCardProps extends VocabCardProps {
  /** Options to display - defaults to generating from item */
  options?: string[];
  /** Index of correct answer (0-3) - defaults to 0 */
  correctIndex?: number;
  /** Quiz mode: 'word' asks for the word, 'translation' asks for translation */
  quizMode?: 'word' | 'translation';
}

// Generate distractor options (in a real app, these would come from similar words)
function generateOptions(item: VocabularyItem, quizMode: 'word' | 'translation'): string[] {
  const correct = quizMode === 'word' ? item.word : item.translation;

  // Sample distractors - in production, use similar words from vocabulary bank
  const distractors = quizMode === 'word'
    ? ['apple', 'garden', 'window', 'picture', 'morning', 'evening']
    : ['manzana', 'jardín', 'ventana', 'imagen', 'mañana', 'tarde'];

  // Shuffle and pick 3 distractors that aren't the correct answer
  const shuffled = distractors
    .filter(d => d.toLowerCase() !== correct.toLowerCase())
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Insert correct answer at random position
  const options = [...shuffled];
  const correctPosition = Math.floor(Math.random() * 4);
  options.splice(correctPosition, 0, correct);

  return options;
}

export function AudioQuizCard({
  item,
  onComplete,
  options: providedOptions,
  correctIndex: providedCorrectIndex,
  quizMode = 'word',
}: AudioQuizCardProps) {
  const haptics = useHaptics();

  // Generate options if not provided
  const [options] = useState(() =>
    providedOptions || generateOptions(item, quizMode)
  );

  const correctAnswer = quizMode === 'word' ? item.word : item.translation;
  const correctIndex = providedCorrectIndex ?? options.findIndex(
    o => o.toLowerCase() === correctAnswer.toLowerCase()
  );

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Quiz state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { trackAudioPlay, complete } = useVocabCard({
    variant: 'audioQuiz',
    onComplete,
  });

  // Animation values
  const audioButtonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // Pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isPlaying]);

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasPlayed) {
        handlePlayAudio(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayAudio = useCallback(async (slow = false) => {
    haptics.light();
    trackAudioPlay();
    setHasPlayed(true);

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

  const handleSelect = useCallback((index: number) => {
    const isCorrect = index === correctIndex;

    if (isCorrect) {
      haptics.success();
    } else {
      haptics.doubleError();
    }

    setSelectedIndex(index);
    setShowResult(true);

    if (isCorrect) {
      setTimeout(() => complete(true, options[index]), 1500);
    }
  }, [correctIndex, options, haptics, complete]);

  const handleContinue = useCallback(() => {
    complete(false, selectedIndex !== null ? options[selectedIndex] : undefined);
  }, [complete, selectedIndex, options]);

  // Animated styles
  const audioButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: audioButtonScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isPlaying ? 0.4 : 0,
  }));

  const showWrongAnswer = showResult && selectedIndex !== correctIndex;

  const getOptionState = (index: number) => {
    if (!showResult) return 'default';
    if (index === correctIndex) return 'correct';
    if (index === selectedIndex) return 'wrong';
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
          <Ionicons name="headset" size={20} color={colors.primary.DEFAULT} />
          <Text style={styles.headerText}>What did you hear?</Text>
        </View>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
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
                  styles.audioButtonMain,
                  isPlaying && playbackRate === 1.0 && styles.audioButtonActive,
                ]}
              >
                <Ionicons
                  name={isPlaying && playbackRate === 1.0 ? "pause" : "play"}
                  size={32}
                  color={isPlaying && playbackRate === 1.0 ? colors.text.primary : colors.primary.DEFAULT}
                />
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
              <Ionicons
                name={isPlaying && playbackRate < 1.0 ? "pause" : "play"}
                size={24}
                color={isPlaying && playbackRate < 1.0 ? colors.text.primary : colors.primary.DEFAULT}
              />
              <View style={styles.slowBadge}>
                <Text style={styles.slowBadgeText}>0.5x</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.tapHint}>
            {hasPlayed ? 'Tap to replay' : 'Tap to play'}
          </Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <AnswerOption
              key={index}
              text={option}
              onPress={() => handleSelect(index)}
              disabled={showResult}
              state={getOptionState(index)}
              entranceDelay={100 * (index + 1) + 400}
              hapticFeedback={false}
            />
          ))}
        </View>
      </View>

      {/* Overlays */}
      <DarkOverlay visible={showWrongAnswer} />
      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Listening Tip"
        explanation={`The correct answer is "${correctAnswer}"`}
        correctAnswer={correctAnswer}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  audioSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  pulseBg: {
    position: 'absolute',
    width: 160,
    height: 80,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primary.DEFAULT,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing.md,
    gap: spacing.lg,
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
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  audioButtonMain: {
    width: 72,
    height: 72,
  },
  audioButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.light,
  },
  slowBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  slowBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
  },
  tapHint: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
});
