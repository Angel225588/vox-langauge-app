/**
 * AudioPlayer Component
 *
 * Reusable audio playback component with fast/slow speed controls.
 * Used consistently across vocabulary, speaking, and listening cards.
 *
 * Features:
 * - Normal speed play button (1x)
 * - Slow speed play button (0.5x/0.6x)
 * - Pulse animation when playing
 * - Supports audio URL or text-to-speech fallback
 * - Haptic feedback on interactions
 * - Auto-play option for quiz cards
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
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

export interface AudioPlayerProps {
  /** Text to speak (used for TTS fallback) */
  text: string;
  /** Audio URL (if available) */
  audioUrl?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Callback when audio starts playing */
  onPlayStart?: () => void;
  /** Callback when audio finishes playing */
  onPlayEnd?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Show slow speed button */
  showSlowButton?: boolean;
  /** Language for TTS */
  language?: string;
}

const SIZE_CONFIG = {
  small: {
    mainButton: 40,
    slowButton: 36,
    iconSize: 18,
    slowIconSize: 16,
    padding: spacing.xs,
    gap: spacing.sm,
  },
  medium: {
    mainButton: 48,
    slowButton: 44,
    iconSize: 22,
    slowIconSize: 18,
    padding: spacing.sm,
    gap: spacing.md,
  },
  large: {
    mainButton: 72,
    slowButton: 56,
    iconSize: 32,
    slowIconSize: 24,
    padding: spacing.md,
    gap: spacing.lg,
  },
};

export function AudioPlayer({
  text,
  audioUrl,
  size = 'medium',
  autoPlay = false,
  onPlayStart,
  onPlayEnd,
  style,
  showSlowButton = true,
  language,
}: AudioPlayerProps) {
  const haptics = useHaptics();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  const config = SIZE_CONFIG[size];

  // Animation values
  const audioButtonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      pulseScale.value = withRepeat(
        withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isPlaying]);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed) {
      const timer = setTimeout(() => {
        handlePlayAudio(false);
        setHasAutoPlayed(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, hasAutoPlayed]);

  const handlePlayAudio = useCallback(async (slow = false) => {
    haptics.light();

    audioButtonScale.value = withSpring(0.9, {}, () => {
      audioButtonScale.value = withSpring(1);
    });

    const rate = slow ? 0.6 : 1.0;
    setPlaybackRate(rate);

    // If already playing, stop
    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      onPlayEnd?.();
      return;
    }

    // If TTS is playing, stop it
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      onPlayEnd?.();
      return;
    }

    setIsPlaying(true);
    onPlayStart?.();

    if (audioUrl) {
      try {
        if (sound) await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true, rate, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              onPlayEnd?.();
            }
          }
        );
        setSound(newSound);
      } catch {
        // Fallback to TTS
        Speech.speak(text, {
          language,
          rate: slow ? 0.5 : 0.8,
          onDone: () => {
            setIsPlaying(false);
            onPlayEnd?.();
          },
          onError: () => {
            setIsPlaying(false);
            onPlayEnd?.();
          },
        });
      }
    } else {
      // Use TTS
      Speech.speak(text, {
        language,
        rate: slow ? 0.5 : 0.8,
        onDone: () => {
          setIsPlaying(false);
          onPlayEnd?.();
        },
        onError: () => {
          setIsPlaying(false);
          onPlayEnd?.();
        },
      });
    }
  }, [sound, isPlaying, audioUrl, text, language, haptics, onPlayStart, onPlayEnd]);

  // Animated styles
  const audioButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: audioButtonScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isPlaying ? 0.5 : 0,
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.audioControls, { padding: config.padding, gap: config.gap }]}>
        {/* Pulse background */}
        <Animated.View style={[styles.pulseBg, pulseStyle]} />

        {/* Normal speed button */}
        <Animated.View style={audioButtonStyle}>
          <TouchableOpacity
            onPress={() => handlePlayAudio(false)}
            activeOpacity={0.8}
            style={[
              styles.audioButton,
              {
                width: config.mainButton,
                height: config.mainButton,
              },
              isPlaying && playbackRate === 1.0 && styles.audioButtonActive,
            ]}
          >
            <Ionicons
              name={isPlaying && playbackRate === 1.0 ? 'pause' : 'play'}
              size={config.iconSize}
              color={isPlaying && playbackRate === 1.0 ? colors.text.primary : colors.primary.DEFAULT}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Slow speed button */}
        {showSlowButton && (
          <TouchableOpacity
            onPress={() => handlePlayAudio(true)}
            activeOpacity={0.8}
            style={[
              styles.audioButton,
              {
                width: config.slowButton,
                height: config.slowButton,
              },
              isPlaying && playbackRate < 1.0 && styles.audioButtonActive,
            ]}
          >
            <Ionicons
              name={isPlaying && playbackRate < 1.0 ? 'pause' : 'play'}
              size={config.slowIconSize}
              color={isPlaying && playbackRate < 1.0 ? colors.text.primary : colors.primary.DEFAULT}
            />
            <View style={styles.slowBadge}>
              <Ionicons name="speedometer-outline" size={10} color={colors.text.tertiary} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
    position: 'relative',
  },
  pulseBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primary.DEFAULT,
  },
  audioButton: {
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
  slowBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});

export default AudioPlayer;
