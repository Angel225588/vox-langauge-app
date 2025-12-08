/**
 * VocabCardBase - Shared Base Component
 *
 * Provides the common layout, styling, and functionality for all vocabulary cards.
 * Features:
 * - Category badge header
 * - Audio controls (play normal, play slow)
 * - Bookmark/save action
 * - Consistent spacing and animations
 * - Haptic feedback integration
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, neomorphism } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type { VocabularyItem } from '@/types/vocabulary';

export interface VocabCardBaseProps {
  item: VocabularyItem;
  variant: 'introduction' | 'listening' | 'typing';
  showCategory?: boolean;
  showAudioControls?: boolean;
  onAudioPlay?: () => void;
  onBookmark?: () => void;
  children: React.ReactNode;
}

export function VocabCardBase({
  item,
  variant,
  showCategory = true,
  showAudioControls = true,
  onAudioPlay,
  onBookmark,
  children,
}: VocabCardBaseProps) {
  const haptics = useHaptics();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Animation values
  const playButtonScale = useSharedValue(1);
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
        withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isPlaying]);

  const handlePlayAudio = useCallback(async (slow = false) => {
    haptics.light();
    playButtonScale.value = withSpring(0.9, {}, () => {
      playButtonScale.value = withSpring(1);
    });

    const rate = slow ? 0.6 : 1.0;
    setPlaybackRate(rate);
    onAudioPlay?.();

    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    const audioUrl = slow ? item.audioSlowUrl : item.audioUrl;

    if (audioUrl) {
      try {
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true, rate, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        );

        setSound(newSound);
      } catch (error) {
        console.error('Error playing audio:', error);
        // Fallback to speech synthesis
        Speech.speak(item.word, {
          rate: slow ? 0.5 : 0.8,
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      }
    } else {
      // Use speech synthesis as fallback
      Speech.speak(item.word, {
        rate: slow ? 0.5 : 0.8,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  }, [sound, isPlaying, item, haptics, onAudioPlay]);

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isPlaying ? 0.6 : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Header with category and bookmark */}
      {showCategory && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          {onBookmark && (
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                onBookmark();
              }}
              activeOpacity={0.7}
              style={styles.bookmarkButton}
            >
              <Text style={styles.bookmarkIcon}>🔖</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Main content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Audio controls */}
      {showAudioControls && (
        <Animated.View
          entering={FadeIn.duration(400).delay(300)}
          style={styles.audioControlsContainer}
        >
          <View style={styles.audioControls}>
            {/* Pulse background */}
            <Animated.View style={[styles.pulseBg, pulseStyle]} />

            {/* Normal speed button */}
            <Animated.View style={playButtonStyle}>
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

            {/* Slow speed button */}
            <TouchableOpacity
              onPress={() => handlePlayAudio(true)}
              activeOpacity={0.8}
              style={[
                styles.audioButton,
                isPlaying && playbackRate < 1.0 && styles.audioButtonActive,
              ]}
            >
              <Text style={styles.audioButtonIcon}>▶️</Text>
              <Text style={styles.slowLabel}>🐌</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  audioControlsContainer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.md,
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
    width: 48,
    height: 48,
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
    fontSize: 20,
  },
  slowLabel: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    fontSize: 12,
  },
});
