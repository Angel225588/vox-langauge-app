/**
 * Audio Card Component
 *
 * Premium listening comprehension card where users hear audio and select the correct answer.
 * Supports both single words and longer phrases with adaptive layouts.
 *
 * Features:
 * - Design-system aligned AudioButton components
 * - Hero audio button with large pulse animation
 * - Normal and slow speed playback options
 * - Real audio playback with expo-av (TTS fallback)
 * - Adaptive layout for short words vs long phrases
 * - Question with visual emphasis on key phrase
 * - 4 multiple choice options with staggered entrance
 * - Visual feedback (green for correct, red for incorrect)
 * - Haptic feedback throughout
 * - Auto-advances on correct answer
 *
 * Learning Objective: Train listening comprehension and auditory word recognition
 *
 * @example
 * <AudioCard
 *   word="Where is the nearest train station?"
 *   translation="¿Dónde está la estación de tren más cercana?"
 *   options={['train station', 'bus stop', 'airport', 'taxi stand']}
 *   correct_answer={0}
 *   onNext={(answer) => handleNext()}
 * />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// Design-system components
import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay, AudioButton, AudioButtonGroup } from '@/components/ui';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { useHaptics } from '@/hooks/useHaptics';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface AudioCardProps extends CardProps {
  /** The word or phrase to listen to */
  word?: string;
  /** Translation of the word/phrase */
  translation?: string;
  /** URL to audio file (optional - falls back to TTS) */
  audio_url?: string;
  /** Array of 4 answer options */
  options?: string[];
  /** Index of the correct answer (0-3) */
  correct_answer?: number;
  /** Explanation shown when user answers incorrectly */
  explanation?: string;
}

export function AudioCard({
  word,
  translation,
  audio_url,
  options,
  correct_answer,
  explanation,
  onNext,
}: AudioCardProps) {
  const haptics = useHaptics();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Animation for success celebration
  const containerScale = useSharedValue(1);

  // Determine if this is a long phrase (for adaptive layout)
  const isLongPhrase = (word?.length || 0) > 20;

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleSelect = useCallback((index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      haptics.success();
      // Success celebration animation
      containerScale.value = withSequence(
        withSpring(1.02, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
    } else {
      haptics.doubleError();
    }

    setSelectedIndex(index);
    setShowResult(true);

    if (isCorrect) {
      setTimeout(() => {
        onNext(index);
        setSelectedIndex(null);
        setShowResult(false);
      }, 1500);
    }
  }, [correct_answer, haptics, containerScale, onNext]);

  const handleContinue = useCallback(() => {
    onNext(selectedIndex);
    setSelectedIndex(null);
    setShowResult(false);
  }, [onNext, selectedIndex]);

  const playAudio = useCallback(async (rate: number = 1.0) => {
    const isSlow = rate < 1;

    // Stop if already playing
    if ((isSlow ? isPlayingSlow : isPlaying) && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setIsPlayingSlow(false);
      return;
    }

    // Set playing state
    if (isSlow) {
      setIsPlayingSlow(true);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setIsPlayingSlow(false);
    }

    if (audio_url) {
      try {
        setIsLoading(true);

        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audio_url },
          { shouldPlay: true, rate, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setIsPlayingSlow(false);
            }
          }
        );

        setSound(newSound);
        setIsLoading(false);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsLoading(false);
        setIsPlaying(false);
        setIsPlayingSlow(false);

        // Fallback to TTS
        if (word) {
          Speech.speak(word, {
            rate: isSlow ? 0.5 : 1.0,
            onDone: () => {
              setIsPlaying(false);
              setIsPlayingSlow(false);
            },
            onError: () => {
              setIsPlaying(false);
              setIsPlayingSlow(false);
            },
          });
        }
      }
    } else if (word) {
      // Use TTS when no audio URL
      Speech.speak(word, {
        rate: isSlow ? 0.5 : 1.0,
        onDone: () => {
          setIsPlaying(false);
          setIsPlayingSlow(false);
        },
        onError: () => {
          setIsPlaying(false);
          setIsPlayingSlow(false);
        },
      });
    } else {
      setIsPlaying(false);
      setIsPlayingSlow(false);
    }
  }, [audio_url, word, sound, isPlaying, isPlayingSlow]);

  const handlePlayNormal = useCallback(() => playAudio(1.0), [playAudio]);
  const handlePlaySlow = useCallback(() => playAudio(0.5), [playAudio]);

  const showWrongAnswer = showResult && selectedIndex !== correct_answer;
  const showCorrectAnswer = showResult && selectedIndex === correct_answer;

  const getOptionState = useCallback((index: number) => {
    if (!showResult) return 'default';
    if (correct_answer === index) return 'correct';
    if (selectedIndex === index) return 'wrong';
    return 'default';
  }, [showResult, correct_answer, selectedIndex]);

  // Animated style for success
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Type Badge - Top Right */}
      <TypeBadge variant="listening" />

      <View style={styles.content}>
        {/* Audio Controls Card - Compact layout */}
        <Animated.View
          entering={ZoomIn.duration(500).springify()}
          style={styles.audioCardWrapper}
        >
          <AudioButtonGroup size="compact">
            <AudioButton
              variant="play"
              isPlaying={isPlaying}
              isLoading={isLoading && !isPlayingSlow}
              onPress={handlePlayNormal}
              size="md"
            />
            <AudioButton
              variant="slow"
              isPlaying={isPlayingSlow}
              isLoading={isLoading && isPlayingSlow}
              onPress={handlePlaySlow}
              size="md"
            />
          </AudioButtonGroup>
        </Animated.View>

        {/* Tap to listen hint */}
        {!isPlaying && !isPlayingSlow && (
          <Animated.Text
            entering={FadeIn.duration(400).delay(300)}
            style={styles.tapHint}
          >
            Tap to listen
          </Animated.Text>
        )}

        {/* Question */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(350)}
          style={styles.questionContainer}
        >
          <Text style={styles.question}>What did you hear?</Text>
          {isLongPhrase && (
            <Text style={styles.questionHint}>Listen carefully to the full phrase</Text>
          )}
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options?.map((option, index) => (
            <AnswerOption
              key={`${option}-${index}`}
              text={option}
              onPress={() => handleSelect(index)}
              disabled={showResult}
              state={getOptionState(index)}
              entranceDelay={100 * (index + 1) + 400}
              hapticFeedback={false}
              testID={`audio-option-${index}`}
            />
          ))}
        </View>
      </View>

      <DarkOverlay visible={showWrongAnswer} />

      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Listening Tip"
        explanation={explanation}
        correctAnswer={options?.[correct_answer ?? 0]}
        onContinue={handleContinue}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  // Mode indicator chip at top
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modeEmoji: {
    fontSize: 16,
  },
  modeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  // Audio controls wrapper
  audioCardWrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tapHint: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  // Question section
  questionContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  questionHint: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Options
  optionsContainer: {
    width: '100%',
  },
});
