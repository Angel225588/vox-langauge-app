/**
 * SpeakingProbe Component
 *
 * A speaking sample probe where users record themselves responding to a prompt.
 * Used for AI analysis of fluency and pronunciation during calibration.
 *
 * Features:
 * - Shows prompt with translation
 * - Optional hints section (tap to reveal)
 * - Large record button with animated waveform
 * - Recording duration timer
 * - Auto-stop after target duration + 10 seconds
 * - Playback option after recording
 * - "Done" or "Try Again" buttons
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type { SpeakingProbeItem, CalibrationProbeProps } from '@/types/calibration';

type SpeakingProbeProps = CalibrationProbeProps<SpeakingProbeItem>;

type RecordingState = 'idle' | 'recording' | 'recorded';

export function SpeakingProbe({
  item,
  onComplete,
  onSkip,
  showHints = true,
  nativeLanguage = 'English',
}: SpeakingProbeProps) {
  const haptics = useHaptics();

  // State
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showHintsSection, setShowHintsSection] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Timing
  const startTime = useRef<number>(Date.now());
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const pulseScale = useSharedValue(1);
  const waveScale1 = useSharedValue(1);
  const waveScale2 = useSharedValue(1);
  const waveScale3 = useSharedValue(1);

  // Request permissions on mount
  useEffect(() => {
    startTime.current = Date.now();

    (async () => {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);
      if (granted) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    })();

    return () => {
      // Cleanup
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Cleanup sound when unmounting or recording state changes
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  // Auto-stop recording after target duration + 10 seconds
  useEffect(() => {
    if (recordingState === 'recording' && duration >= item.targetDuration + 10) {
      stopRecording();
    }
  }, [duration, recordingState, item.targetDuration]);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: waveScale1.value }],
    opacity: 1 - (waveScale1.value - 1) * 0.5,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: waveScale2.value }],
    opacity: 1 - (waveScale2.value - 1) * 0.5,
  }));

  const wave3Style = useAnimatedStyle(() => ({
    transform: [{ scale: waveScale3.value }],
    opacity: 1 - (waveScale3.value - 1) * 0.5,
  }));

  // Start recording
  const startRecording = async () => {
    if (!permissionGranted) {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        return;
      }
      setPermissionGranted(true);
    }

    try {
      haptics.medium();

      // Reset previous recording if any
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setRecordingState('recording');
      setDuration(0);

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start animations
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      waveScale1.value = withRepeat(
        withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );

      waveScale2.value = withRepeat(
        withTiming(1.7, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );

      waveScale3.value = withRepeat(
        withTiming(1.9, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } catch (error) {
      console.error('Failed to start recording:', error);
      haptics.error();
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;

    try {
      haptics.medium();

      // Stop animations
      cancelAnimation(pulseScale);
      cancelAnimation(waveScale1);
      cancelAnimation(waveScale2);
      cancelAnimation(waveScale3);
      pulseScale.value = withTiming(1, { duration: 200 });
      waveScale1.value = 1;
      waveScale2.value = 1;
      waveScale3.value = 1;

      // Stop duration timer
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      setRecordingState('recorded');

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      haptics.error();
    }
  };

  // Play recording
  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      if (isPlaying && sound) {
        // Stop playback
        await sound.stopAsync();
        setIsPlaying(false);
        haptics.light();
        return;
      }

      haptics.light();

      // Unload previous sound if any
      if (sound) {
        await sound.unloadAsync();
      }

      // Load and play
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Handle playback finish
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          haptics.light();
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
      setIsPlaying(false);
      haptics.error();
    }
  };

  // Try again (delete current recording)
  const tryAgain = () => {
    haptics.medium();
    setRecordingState('idle');
    setRecordingUri(null);
    setDuration(0);
    if (sound) {
      sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    setIsPlaying(false);
  };

  // Submit recording
  const handleComplete = () => {
    if (!recordingUri) return;

    haptics.success();

    const timeSpent = Date.now() - startTime.current;

    onComplete({
      itemId: item.id,
      timeSpent,
      recordingUri,
      difficulty: item.difficulty,
    });
  };

  // Handle skip
  const handleSkip = () => {
    if (onSkip) {
      haptics.light();
      onSkip();
    }
  };

  // Toggle hints
  const toggleHints = () => {
    haptics.light();
    setShowHintsSection((prev) => !prev);
  };

  // Format time (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
        <Text style={styles.contextText}>{item.context}</Text>
      </View>

      {/* Prompt */}
      <View style={styles.promptSection}>
        <Text style={styles.promptLabel}>Say this in English:</Text>
        <Text style={styles.prompt}>{item.prompt}</Text>
        <Text style={styles.translation}>{item.promptTranslation}</Text>
        <View style={styles.targetDuration}>
          <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.targetDurationText}>
            Target: ~{item.targetDuration}s
          </Text>
        </View>
      </View>

      {/* Hints (optional) */}
      {showHints && item.hints && item.hints.length > 0 && (
        <View style={styles.hintsContainer}>
          <TouchableOpacity
            onPress={toggleHints}
            style={styles.hintsHeader}
            activeOpacity={0.7}
          >
            <Ionicons
              name="bulb-outline"
              size={18}
              color={colors.accent.purple}
            />
            <Text style={styles.hintsHeaderText}>Helpful words</Text>
            <Ionicons
              name={showHintsSection ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>

          {showHintsSection && (
            <View style={styles.hintsContent}>
              {item.hints.map((hint, index) => (
                <View key={index} style={styles.hintChip}>
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Record Button Area */}
      <View style={styles.recordSection}>
        {recordingState === 'recording' && (
          <Text style={styles.recordingLabel}>Recording...</Text>
        )}

        {/* Duration Timer */}
        <Text style={styles.durationText}>{formatTime(duration)}</Text>

        {/* Record Button */}
        <View style={styles.recordButtonContainer}>
          {/* Waveform rings (only when recording) */}
          {recordingState === 'recording' && (
            <>
              <Animated.View style={[styles.waveRing, styles.wave1, wave1Style]} />
              <Animated.View style={[styles.waveRing, styles.wave2, wave2Style]} />
              <Animated.View style={[styles.waveRing, styles.wave3, wave3Style]} />
            </>
          )}

          {/* Main record button */}
          <Animated.View style={pulseStyle}>
            <TouchableOpacity
              onPress={recordingState === 'recording' ? stopRecording : startRecording}
              disabled={recordingState === 'recorded'}
              activeOpacity={0.8}
              style={styles.recordButtonTouchable}
            >
              <LinearGradient
                colors={
                  recordingState === 'recording'
                    ? colors.gradients.error
                    : colors.gradients.primary
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.recordButton,
                  recordingState === 'recorded' && styles.recordButtonDisabled,
                ]}
              >
                <Ionicons
                  name={recordingState === 'recording' ? 'stop' : 'mic'}
                  size={48}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {recordingState === 'idle' && (
          <Text style={styles.instructionText}>Tap to start recording</Text>
        )}
        {recordingState === 'recording' && (
          <Text style={styles.instructionText}>Tap to stop</Text>
        )}
      </View>

      {/* Playback Controls (after recording) */}
      {recordingState === 'recorded' && (
        <View style={styles.playbackSection}>
          <TouchableOpacity
            onPress={playRecording}
            style={styles.playButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.primary.DEFAULT}
            />
            <Text style={styles.playButtonText}>
              {isPlaying ? 'Pause' : 'Listen'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {recordingState === 'recorded' ? (
          <>
            <TouchableOpacity
              onPress={tryAgain}
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color={colors.text.primary} />
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleComplete}
              activeOpacity={0.8}
              style={styles.primaryButtonTouchable}
            >
              <LinearGradient
                colors={colors.gradients.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Done</Text>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          onSkip && (
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  difficultyBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
  },
  difficultyText: {
    color: colors.primary.light,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  contextText: {
    flex: 1,
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Prompt Section
  promptSection: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  promptLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prompt: {
    color: colors.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['2xl'] * 1.3,
  },
  translation: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
    lineHeight: typography.fontSize.base * 1.5,
  },
  targetDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  targetDurationText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },

  // Hints Section
  hintsContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent.purple + '30',
  },
  hintsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hintsHeaderText: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  hintsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  hintChip: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent.purple + '50',
  },
  hintText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Record Section
  recordSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  recordingLabel: {
    color: colors.error.light,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  durationText: {
    color: colors.text.primary,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  recordButtonContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  waveRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
  },
  wave1: {
    borderColor: colors.primary.DEFAULT + '60',
  },
  wave2: {
    borderColor: colors.primary.DEFAULT + '40',
  },
  wave3: {
    borderColor: colors.primary.DEFAULT + '20',
  },
  recordButtonTouchable: {
    borderRadius: borderRadius.full,
  },
  recordButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.glow.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  instructionText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },

  // Playback Section
  playbackSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
  },
  playButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  primaryButtonTouchable: {
    flex: 1,
    borderRadius: borderRadius.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  skipButtonText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
});
