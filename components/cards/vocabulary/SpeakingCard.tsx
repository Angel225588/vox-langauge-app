/**
 * SpeakingCard - Listen & Speak Card
 *
 * "Listen, then speak" pattern for pronunciation practice.
 * User first listens to the correct pronunciation, then records themselves.
 *
 * Features:
 * - Audio playback section at top (hear the word)
 * - Large record button with pulse animation
 * - Recording indicator with waveform-style animation
 * - Playback of user's recording (optional)
 * - Two states: listening phase → speaking phase
 * - Premium design with Ionicons, gradients, haptics
 *
 * Design inspiration: Revolut depth, Claude elegance, Perplexity clarity
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { useVocabCard } from './hooks/useVocabCard';
import type { VocabCardProps } from '@/types/vocabulary';

type Phase = 'listen' | 'speak' | 'review';

export function SpeakingCard({ item, onComplete, onSkip }: VocabCardProps) {
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();

  // Phase state
  const [phase, setPhase] = useState<Phase>('listen');

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [listenCount, setListenCount] = useState(0);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingSound, setRecordingSound] = useState<Audio.Sound | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const { trackAudioPlay, complete } = useVocabCard({
    variant: 'speaking',
    onComplete,
  });

  // Animation values
  const playButtonScale = useSharedValue(1);
  const recordButtonScale = useSharedValue(1);
  const recordButtonRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const waveProgress = useSharedValue(0);

  // Request microphone permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Microphone permission not granted');
      }
    })();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
      if (recordingSound) recordingSound.unloadAsync();
    };
  }, [sound, recording, recordingSound]);

  // Pulse animation when playing or recording
  useEffect(() => {
    if (isPlaying || isRecording) {
      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      waveProgress.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      pulseScale.value = withSpring(1);
      waveProgress.value = 0;
    }
  }, [isPlaying, isRecording]);

  const handlePlayAudio = useCallback(async () => {
    haptics.light();
    trackAudioPlay();
    setListenCount(prev => prev + 1);

    playButtonScale.value = withSpring(0.9, {}, () => {
      playButtonScale.value = withSpring(1);
    });

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
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              // After first listen, enable speaking
              if (phase === 'listen') {
                setTimeout(() => setPhase('speak'), 300);
              }
            }
          }
        );
        setSound(newSound);
      } catch {
        Speech.speak(item.word, {
          rate: 0.8,
          onDone: () => {
            setIsPlaying(false);
            if (phase === 'listen') {
              setTimeout(() => setPhase('speak'), 300);
            }
          },
          onError: () => setIsPlaying(false),
        });
      }
    } else {
      Speech.speak(item.word, {
        rate: 0.8,
        onDone: () => {
          setIsPlaying(false);
          if (phase === 'listen') {
            setTimeout(() => setPhase('speak'), 300);
          }
        },
        onError: () => setIsPlaying(false),
      });
    }
  }, [sound, isPlaying, item, haptics, trackAudioPlay, phase]);

  const handleStartRecording = useCallback(async () => {
    try {
      haptics.medium();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      recordButtonRotation.value = withTiming(360, { duration: 500 });
      recordButtonScale.value = withSpring(1.1);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [haptics]);

  const handleStopRecording = useCallback(async () => {
    try {
      haptics.success();
      setIsRecording(false);
      recordButtonRotation.value = withTiming(0, { duration: 300 });
      recordButtonScale.value = withSpring(1);

      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordingUri(uri);
        setRecording(null);

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        setPhase('review');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [recording, haptics]);

  const handleRecordPress = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [isRecording, handleStartRecording, handleStopRecording]);

  const handlePlayRecording = useCallback(async () => {
    if (!recordingUri) return;

    haptics.light();

    if (isPlayingRecording && recordingSound) {
      await recordingSound.stopAsync();
      setIsPlayingRecording(false);
      return;
    }

    try {
      if (recordingSound) await recordingSound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingRecording(false);
          }
        }
      );
      setRecordingSound(newSound);
      setIsPlayingRecording(true);
    } catch (error) {
      console.error('Failed to play recording:', error);
    }
  }, [recordingUri, recordingSound, isPlayingRecording, haptics]);

  const handleContinue = useCallback(() => {
    haptics.medium();
    complete(true);
  }, [haptics, complete]);

  const handleSkip = useCallback(() => {
    haptics.light();
    complete(true);
    onSkip?.();
  }, [haptics, complete, onSkip]);

  // Animated styles
  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const recordButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: recordButtonScale.value },
      { rotate: `${recordButtonRotation.value}deg` },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.3], [0.6, 0], Extrapolate.CLAMP),
  }));

  // Wave animation for recording indicator
  const wave1Style = useAnimatedStyle(() => ({
    height: interpolate(
      waveProgress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [8, 24, 16, 32, 8]
    ),
  }));

  const wave2Style = useAnimatedStyle(() => ({
    height: interpolate(
      waveProgress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [16, 32, 8, 24, 16]
    ),
  }));

  const wave3Style = useAnimatedStyle(() => ({
    height: interpolate(
      waveProgress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [24, 8, 32, 16, 24]
    ),
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Badge */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.headerContainer}
      >
        <View style={styles.headerBadge}>
          <Ionicons name="ear" size={18} color={colors.primary.DEFAULT} />
          <Text style={styles.headerText}>Listen & Speak</Text>
          <Ionicons name="mic" size={18} color={colors.accent.purple} />
        </View>
      </Animated.View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {/* Word Display */}
        <Animated.View
          entering={ZoomIn.duration(500).delay(100)}
          style={styles.wordContainer}
        >
          <Text style={styles.word}>{item.word}</Text>
          {item.phonetic && (
            <Text style={styles.phonetic}>/{item.phonetic}/</Text>
          )}
        </Animated.View>

        {/* Listen Section */}
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
          style={styles.audioSection}
        >
          {/* Pulse background */}
          {isPlaying && <Animated.View style={[styles.pulseBg, pulseStyle]} />}

          <Animated.View style={playButtonStyle}>
            <TouchableOpacity
              onPress={handlePlayAudio}
              activeOpacity={0.8}
              style={[
                styles.audioButton,
                isPlaying && styles.audioButtonActive,
              ]}
            >
              <Ionicons
                name={isPlaying ? "pause" : "volume-high"}
                size={28}
                color={isPlaying ? colors.text.primary : colors.primary.DEFAULT}
              />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.listenLabel}>
            {listenCount === 0 ? 'Tap to hear' : `Heard ${listenCount}x`}
          </Text>
        </Animated.View>

        {/* Speak Section - Only show after listening */}
        {phase !== 'listen' && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.recordSection}
          >
            <Text style={styles.sectionTitle}>
              {phase === 'speak' ? 'Now say it' : 'Your recording'}
            </Text>

            {/* Recording waves visualization */}
            {isRecording && (
              <View style={styles.waveContainer}>
                <Animated.View style={[styles.wave, wave1Style]} />
                <Animated.View style={[styles.wave, wave2Style]} />
                <Animated.View style={[styles.wave, wave3Style]} />
                <Animated.View style={[styles.wave, wave2Style]} />
                <Animated.View style={[styles.wave, wave1Style]} />
              </View>
            )}

            {/* Record Button */}
            {phase === 'speak' && (
              <View style={styles.recordButtonContainer}>
                {isRecording && (
                  <Animated.View style={[styles.recordPulse, pulseStyle]} />
                )}

                <Animated.View style={recordButtonStyle}>
                  <TouchableOpacity
                    onPress={handleRecordPress}
                    activeOpacity={0.8}
                    style={[
                      styles.recordButton,
                      isRecording && styles.recordButtonActive,
                    ]}
                  >
                    <LinearGradient
                      colors={isRecording ? colors.gradients.error : colors.gradients.primary}
                      style={styles.recordButtonGradient}
                    >
                      <Ionicons
                        name={isRecording ? "stop" : "mic"}
                        size={36}
                        color={colors.text.primary}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                <Text style={styles.recordLabel}>
                  {isRecording ? 'Tap to stop' : 'Tap to record'}
                </Text>
              </View>
            )}

            {/* Review Section - Play back recording */}
            {phase === 'review' && recordingUri && (
              <View style={styles.reviewSection}>
                <TouchableOpacity
                  onPress={handlePlayRecording}
                  activeOpacity={0.8}
                  style={styles.playbackButton}
                >
                  <Ionicons
                    name={isPlayingRecording ? "pause" : "play"}
                    size={24}
                    color={colors.primary.DEFAULT}
                  />
                  <Text style={styles.playbackText}>
                    {isPlayingRecording ? 'Playing...' : 'Play your recording'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setPhase('speak');
                    setRecordingUri(null);
                  }}
                  activeOpacity={0.7}
                  style={styles.retryButton}
                >
                  <Ionicons name="refresh" size={18} color={colors.text.secondary} />
                  <Text style={styles.retryText}>Record again</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        {phase === 'review' ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => setPhase('speak')}
              activeOpacity={0.8}
              style={styles.secondaryButton}
            >
              <View style={styles.secondaryButtonInner}>
                <Ionicons name="refresh" size={20} color={colors.text.secondary} />
                <Text style={styles.secondaryButtonText}>Try again</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.8}
              style={styles.primaryButton}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color={colors.text.primary} />
                <Text style={styles.primaryButtonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>Skip this word</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerBadge: {
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
  contentArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  word: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  audioSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    position: 'relative',
  },
  pulseBg: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.DEFAULT,
  },
  audioButton: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    ...shadows.md,
  },
  audioButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.light,
  },
  listenLabel: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  recordSection: {
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 40,
    marginBottom: spacing.lg,
  },
  wave: {
    width: 4,
    backgroundColor: colors.error.DEFAULT,
    borderRadius: 2,
  },
  recordButtonContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  recordPulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error.DEFAULT,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  recordButtonActive: {
    ...shadows.glow.error,
  },
  recordButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordLabel: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  reviewSection: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  playbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  playbackText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  retryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  secondaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
});
