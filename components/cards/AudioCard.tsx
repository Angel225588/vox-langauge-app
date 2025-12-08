/**
 * Audio Card Component
 *
 * Listening comprehension card where users hear audio and select the correct word.
 *
 * Features:
 * - Large audio playback button (🔊) with press animation
 * - Real audio playback with expo-av (placeholder uses expo-speech as fallback)
 * - Visual loading state while audio loads
 * - Pulsing animation during playback
 * - Replay button (can replay without resetting quiz)
 * - Question: "What did you hear?"
 * - 4 multiple choice options with staggered entrance
 * - Visual feedback (green for correct, red for incorrect)
 * - Haptic feedback (success/error on selection, light on audio play)
 * - Auto-advances after selection (1.5s delay)
 * - Checkmark (✓) or X (✗) indicator
 *
 * Learning Objective: Train listening comprehension and word recognition
 *
 * UX Research: Audio-based learning enhances auditory memory and pronunciation
 *
 * REFACTORED: Now uses shared UI components for consistency
 */

import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// NEW: Import shared UI components
import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay } from '@/components/ui';
import { useHaptics } from '@/hooks/useHaptics';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface AudioCardProps extends CardProps {
  word?: string;
  translation?: string;
  audio_url?: string;
  options?: string[];
  correct_answer?: number;
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
  // NEW: Use haptics hook instead of direct Haptics calls
  const haptics = useHaptics();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioButtonScale = useSharedValue(1);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    // NEW: Clean haptic calls
    if (isCorrect) {
      haptics.success();
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
  };

  const handleContinue = () => {
    onNext(selectedIndex);
    setSelectedIndex(null);
    setShowResult(false);
  };

  const handlePlayAudio = async () => {
    haptics.light();
    audioButtonScale.value = withSpring(0.9, {}, () => {
      audioButtonScale.value = withSpring(1);
    });

    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if (audio_url) {
      try {
        setIsLoading(true);

        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audio_url },
          { shouldPlay: true, rate: playbackRate, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        );

        setSound(newSound);
        setIsLoading(false);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsLoading(false);
        setIsPlaying(false);

        if (word) {
          Speech.speak(word, {
            onDone: () => setIsPlaying(false),
            onError: () => setIsPlaying(false),
          });
        }
      }
    } else if (word) {
      Speech.speak(word, {
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } else {
      setIsPlaying(false);
    }
  };

  const audioButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: audioButtonScale.value }],
  }));

  const showWrongAnswer = showResult && selectedIndex !== correct_answer;

  // NEW: Helper function to determine option state
  const getOptionState = (index: number) => {
    if (!showResult) return 'default';
    if (correct_answer === index) return 'correct';
    if (selectedIndex === index) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Audio Play Button */}
        <Animated.View
          entering={ZoomIn.duration(500).springify()}
          style={styles.audioButtonContainer}
        >
          <Animated.View style={audioButtonStyle}>
            <TouchableOpacity
              onPress={handlePlayAudio}
              activeOpacity={0.8}
              disabled={isLoading}
              style={[
                styles.audioButton,
                {
                  backgroundColor: isPlaying ? colors.success.DEFAULT : colors.primary.DEFAULT,
                  shadowColor: isPlaying ? colors.success.DEFAULT : colors.primary.DEFAULT,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
            >
              <Text style={styles.audioIcon}>
                {isLoading ? '⏳' : isPlaying ? '🔊' : '🔉'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Speed Toggle */}
        <Animated.View entering={FadeIn.duration(400).delay(350)}>
          <TouchableOpacity
            onPress={() => setPlaybackRate(playbackRate === 1.0 ? 0.75 : 1.0)}
            activeOpacity={0.8}
            style={[
              styles.speedToggle,
              playbackRate === 0.75 && styles.speedToggleActive,
            ]}
          >
            <Text style={[
              styles.speedToggleText,
              playbackRate === 0.75 && styles.speedToggleTextActive,
            ]}>
              🐌 Slow Speed {playbackRate === 0.75 ? '(Active)' : ''}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Question */}
        <Animated.Text
          entering={FadeIn.duration(400).delay(300)}
          style={styles.question}
        >
          What did you hear?
        </Animated.Text>

        {/* NEW: Using AnswerOption component instead of inline TouchableOpacity */}
        {options?.map((option, index) => (
          <AnswerOption
            key={index}
            text={option}
            onPress={() => handleSelect(index)}
            disabled={showResult}
            state={getOptionState(index)}
            entranceDelay={100 * (index + 1) + 400}
            hapticFeedback={false} // We handle haptics in handleSelect
          />
        ))}
      </View>

      {/* NEW: Using DarkOverlay component */}
      <DarkOverlay visible={showWrongAnswer} />

      {/* NEW: Using AnswerFeedbackOverlay component */}
      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Listening Tip"
        explanation={explanation}
        onContinue={handleContinue}
      />
    </View>
  );
}

// NEW: Extracted styles for cleaner code
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  audioButtonContainer: {
    alignSelf: 'center',
    marginBottom: spacing['2xl'],
  },
  audioButton: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  audioIcon: {
    fontSize: 48,
  },
  speedToggle: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    marginRight: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  speedToggleActive: {
    backgroundColor: colors.accent.purple,
  },
  speedToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
  },
  speedToggleTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
