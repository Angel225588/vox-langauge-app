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
 */

import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface CardProps {
  onNext: (answer?: any) => void;
}

interface AudioCardProps extends CardProps {
  word?: string;
  translation?: string;
  audio_url?: string;
  options?: string[];
  correct_answer?: number;
  explanation?: string; // Listening tip shown when incorrect
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0); // 1.0 = normal, 0.75 = slow
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

    // Auto-advance for correct, manual Continue for incorrect
    if (isCorrect) {
      setTimeout(() => {
        onNext(index);
        setSelectedIndex(null);
        setShowResult(false);
      }, 1500);
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext(selectedIndex);
    setSelectedIndex(null);
    setShowResult(false);
  };

  const handlePlayAudio = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    audioButtonScale.value = withSpring(0.9, {}, () => {
      audioButtonScale.value = withSpring(1);
    });

    // If already playing, stop it
    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // If audio_url is provided, use expo-av
    if (audio_url) {
      try {
        setIsLoading(true);

        // Unload previous sound if exists
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

        // Fallback to TTS if audio fails
        if (word) {
          Speech.speak(word, {
            onDone: () => setIsPlaying(false),
            onError: () => setIsPlaying(false),
          });
        }
      }
    } else if (word) {
      // Fallback to expo-speech if no audio_url
      Speech.speak(word, {
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } else {
      setIsPlaying(false);
    }
  };

  const audioButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: audioButtonScale.value }],
    };
  });

  const showWrongAnswer = showResult && selectedIndex !== correct_answer;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg }}>
      <Animated.View
        entering={ZoomIn.duration(500).springify()}
        style={{
          alignSelf: 'center',
          marginBottom: spacing['2xl'],
        }}
      >
        <Animated.View style={audioButtonStyle}>
          <TouchableOpacity
          onPress={handlePlayAudio}
          activeOpacity={0.8}
          disabled={isLoading}
          style={{
            width: 120,
            height: 120,
            borderRadius: borderRadius.full,
            backgroundColor: isPlaying ? colors.success.DEFAULT : colors.primary.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: isPlaying ? colors.success.DEFAULT : colors.primary.DEFAULT,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <Text style={{ fontSize: 48 }}>
            {isLoading ? '⏳' : isPlaying ? '🔊' : '🔉'}
          </Text>
        </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Speed Toggle Button - Aligned to right */}
      <Animated.View entering={FadeIn.duration(400).delay(350)}>
        <TouchableOpacity
          onPress={() => setPlaybackRate(playbackRate === 1.0 ? 0.75 : 1.0)}
          activeOpacity={0.8}
          style={{
            alignSelf: 'flex-end',
            marginTop: spacing.md,
            marginBottom: spacing.lg,
            marginRight: spacing.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.full,
            backgroundColor: playbackRate === 0.75 ? colors.accent.purple : colors.background.elevated,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Text style={{
            fontSize: typography.fontSize.sm,
            color: playbackRate === 0.75 ? colors.text.primary : colors.text.secondary,
            fontWeight: playbackRate === 0.75 ? typography.fontWeight.semibold : typography.fontWeight.normal,
          }}>
            🐌 Slow Speed {playbackRate === 0.75 ? '(Active)' : ''}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.Text
        entering={FadeIn.duration(400).delay(300)}
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        What did you hear?
      </Animated.Text>

      {options?.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correct_answer === index;
        const showAsCorrect = showResult && isCorrect;
        const showAsWrong = showResult && isSelected && !isCorrect;

        return (
          <Animated.View
            key={index}
            entering={FadeInDown.duration(400).delay(100 * (index + 1) + 400).springify()}
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
                paddingHorizontal: spacing.xl,
                borderRadius: borderRadius.xl,
                marginBottom: spacing.md,
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

      {/* Bottom section with Listening Tip and Continue - Fixed at bottom */}
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
            {/* Listening Tip */}
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
                  Listening Tip
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
