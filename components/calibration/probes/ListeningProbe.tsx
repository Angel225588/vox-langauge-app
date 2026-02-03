/**
 * ListeningProbe Component
 *
 * Audio comprehension probe where users listen to audio and select the correct meaning.
 * Part of the calibration system - points for completion, not accuracy.
 *
 * Features:
 * - Large play button with pulse animation while playing
 * - TTS (expo-speech) fallback if no pre-recorded audio
 * - Speed toggle (normal/slow at 0.7x)
 * - Tracks audio replay count
 * - 4 multiple choice options with animated selection
 * - Tracks time from first audio play to answer
 * - Haptic feedback on interactions
 * - Brief feedback after selection before completing
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

import { colors, borderRadius, spacing, typography, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type { CalibrationProbeProps, ListeningProbeItem } from '@/types/calibration';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PlaybackSpeed = 'normal' | 'slow';
type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused';

interface OptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function Option({ option, index, isSelected, showFeedback, isCorrect, disabled, onSelect }: OptionProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0);

  useEffect(() => {
    if (showFeedback && isSelected) {
      borderOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [showFeedback, isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => {
    let borderColor = colors.border.medium;
    let backgroundColor = colors.background.card;

    if (showFeedback && isSelected) {
      if (isCorrect) {
        borderColor = colors.success.DEFAULT;
        backgroundColor = 'rgba(16, 185, 129, 0.1)';
      } else {
        borderColor = colors.error.DEFAULT;
        backgroundColor = 'rgba(239, 68, 68, 0.1)';
      }
    } else if (isSelected) {
      borderColor = colors.primary.DEFAULT;
      backgroundColor = 'rgba(99, 102, 241, 0.1)';
    }

    return {
      borderColor,
      backgroundColor,
    };
  });

  const handlePress = () => {
    if (disabled) return;
    haptics.medium();
    onSelect();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          if (!disabled) {
            scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        disabled={disabled}
        style={[styles.optionCard, animatedStyle, borderStyle]}
      >
        {/* Option letter */}
        <View style={styles.optionLetter}>
          <Text style={styles.optionLetterText}>
            {String.fromCharCode(65 + index)}
          </Text>
        </View>

        {/* Option text */}
        <Text style={[styles.optionText, disabled && styles.optionTextDisabled]}>
          {option}
        </Text>

        {/* Feedback icon */}
        {showFeedback && isSelected && (
          <Animated.View entering={FadeInUp.duration(200)}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isCorrect ? colors.success.DEFAULT : colors.error.DEFAULT}
            />
          </Animated.View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export function ListeningProbe({
  item,
  onComplete,
  onSkip,
  showHints = false,
  nativeLanguage,
}: CalibrationProbeProps<ListeningProbeItem>) {
  const haptics = useHaptics();

  // Audio state
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>('normal');
  const [audioReplays, setAudioReplays] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSpeakingRef = useRef(false);

  // Response state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Animations
  const pulseScale = useSharedValue(1);
  const speedToggleScale = useSharedValue(1);

  // Start pulse animation when playing
  useEffect(() => {
    if (playbackState === 'playing') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [playbackState]);

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const speedToggleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speedToggleScale.value }],
  }));

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.error('Error unloading audio:', error);
      }
      soundRef.current = null;
    }
    if (isSpeakingRef.current) {
      try {
        await Speech.stop();
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
      isSpeakingRef.current = false;
    }
  };

  const playAudio = async () => {
    try {
      // Record start time on first play
      if (startTime === null) {
        setStartTime(Date.now());
      } else {
        // Increment replay count for subsequent plays
        setAudioReplays((prev) => prev + 1);
      }

      haptics.light();

      // Use pre-recorded audio if available
      if (item.audioUrl) {
        await playPreRecordedAudio();
      } else {
        // Fallback to TTS
        await playTTS();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlaybackState('idle');
    }
  };

  const playPreRecordedAudio = async () => {
    try {
      await cleanupAudio();

      setPlaybackState('loading');

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load and play audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.audioUrl! },
        {
          shouldPlay: true,
          rate: playbackSpeed === 'slow' ? 0.7 : 1.0,
          progressUpdateIntervalMillis: 100,
        }
      );

      soundRef.current = sound;
      setPlaybackState('playing');

      // Set up status update callback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setPlaybackState('idle');
          }
        }
      });
    } catch (error) {
      console.error('Error with pre-recorded audio:', error);
      // Fallback to TTS
      await playTTS();
    }
  };

  const playTTS = async () => {
    try {
      await cleanupAudio();

      setPlaybackState('playing');
      isSpeakingRef.current = true;

      const rate = playbackSpeed === 'slow' ? 0.7 : 1.0;

      await Speech.speak(item.audioText, {
        language: 'en-US', // Could be made dynamic based on target language
        pitch: 1.0,
        rate,
        onDone: () => {
          isSpeakingRef.current = false;
          setPlaybackState('idle');
        },
        onStopped: () => {
          isSpeakingRef.current = false;
          setPlaybackState('idle');
        },
        onError: (error) => {
          console.error('TTS error:', error);
          isSpeakingRef.current = false;
          setPlaybackState('idle');
        },
      });
    } catch (error) {
      console.error('Error with TTS:', error);
      isSpeakingRef.current = false;
      setPlaybackState('idle');
    }
  };

  const toggleSpeed = () => {
    haptics.light();
    speedToggleScale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    setPlaybackSpeed((prev) => (prev === 'normal' ? 'slow' : 'normal'));
  };

  const handleOptionSelect = (index: number) => {
    if (showFeedback || selectedOption !== null) return;

    setSelectedOption(index);
    setShowFeedback(true);

    const isCorrect = index === item.correctIndex;
    if (isCorrect) {
      haptics.success();
    } else {
      haptics.error();
    }

    // Show feedback briefly, then complete
    setTimeout(() => {
      const timeSpent = startTime ? Date.now() - startTime : 0;
      const hesitationTime = startTime ? Date.now() - startTime : undefined;

      onComplete({
        itemId: item.id,
        timeSpent,
        hesitationTime,
        audioReplays,
        selectedOption: item.options[index],
        difficulty: item.difficulty,
      });
    }, 1200);
  };

  const handleSkip = () => {
    if (onSkip) {
      haptics.light();
      onSkip();
    }
  };

  const isDisabled = showFeedback;
  const canPlay = playbackState === 'idle';

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
        <Text style={styles.title}>Listen and choose</Text>
        <Text style={styles.subtitle}>Select the correct meaning</Text>
        {item.context && (
          <View style={styles.contextBadge}>
            <Text style={styles.contextText}>{item.context}</Text>
          </View>
        )}
      </Animated.View>

      {/* Audio Player */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.audioSection}>
        {/* Play Button */}
        <AnimatedPressable
          onPress={playAudio}
          disabled={!canPlay || isDisabled}
          style={[styles.playButton, playButtonStyle]}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playButtonGradient}
          >
            {playbackState === 'loading' ? (
              <Ionicons name="hourglass" size={48} color="#FFFFFF" />
            ) : playbackState === 'playing' ? (
              <Ionicons name="volume-high" size={48} color="#FFFFFF" />
            ) : (
              <Ionicons name="play-circle" size={48} color="#FFFFFF" />
            )}
          </LinearGradient>
        </AnimatedPressable>

        {/* Speed Toggle */}
        <AnimatedPressable
          onPress={toggleSpeed}
          disabled={isDisabled}
          style={[styles.speedToggle, speedToggleStyle]}
        >
          <Ionicons
            name={playbackSpeed === 'slow' ? 'speedometer-outline' : 'speedometer'}
            size={20}
            color={playbackSpeed === 'slow' ? colors.secondary.DEFAULT : colors.text.secondary}
          />
          <Text
            style={[
              styles.speedText,
              playbackSpeed === 'slow' && styles.speedTextActive,
            ]}
          >
            {playbackSpeed === 'slow' ? 'Slow' : 'Normal'}
          </Text>
        </AnimatedPressable>

        {/* Replay count */}
        {audioReplays > 0 && (
          <Animated.View entering={FadeInUp.duration(200)} style={styles.replayBadge}>
            <Ionicons name="reload" size={12} color={colors.text.tertiary} />
            <Text style={styles.replayText}>{audioReplays} replays</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {item.options.map((option, index) => (
          <Option
            key={index}
            option={option}
            index={index}
            isSelected={selectedOption === index}
            showFeedback={showFeedback}
            isCorrect={index === item.correctIndex}
            disabled={isDisabled}
            onSelect={() => handleOptionSelect(index)}
          />
        ))}
      </View>

      {/* Skip Button */}
      {onSkip && !showFeedback && (
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Hint */}
      {showHints && !showFeedback && (
        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.hintContainer}>
          <Ionicons name="bulb-outline" size={16} color={colors.warning.light} />
          <Text style={styles.hintText}>
            Listen multiple times if needed - there's no rush!
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  contextBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  contextText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.medium,
  },
  audioSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  playButton: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.lg,
  },
  playButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  speedText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  speedTextActive: {
    color: colors.secondary.DEFAULT,
  },
  replayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  replayText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  optionsContainer: {
    flex: 1,
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.card,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionLetterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  optionTextDisabled: {
    color: colors.text.tertiary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  hintText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.warning.light,
  },
});
