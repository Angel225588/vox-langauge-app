/**
 * SpeakingCard — Voice recording card for pronunciation practice
 *
 * Shows word + phonetic, user records pronunciation.
 * Design system: dark neomorphic theme, TypeBadge
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from '@/constants/designSystem';
import { TypeBadge } from '@/components/ui/TypeBadge';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface SpeakingCardProps {
  word: string;
  phonetic?: string;
  exampleAudioUrl?: string;
  onComplete: (audioUri: string) => void;
  onSkip?: () => void;
}

const SpeakingCard: React.FC<SpeakingCardProps> = ({
  word,
  phonetic,
  exampleAudioUrl,
  onComplete,
  onSkip,
}) => {
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const examplePlayer = useAudioPlayer(exampleAudioUrl || '');
  const recordedPlayer = useAudioPlayer(recordedUri ?? '');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pulse = useSharedValue(1);
  const isRecording = audioRecorder.isRecording;

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      pulse.value = withRepeat(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordingDuration(0);
      pulse.value = 1;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const animatedRecordStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  async function startRecording() {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission required', 'Please grant microphone access to record audio.');
        return;
      }
      await audioRecorder.record();
      setRecordedUri(null);
    } catch {
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  }

  async function stopRecording() {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        setRecordedUri(uri);
        recordedPlayer.replace(uri);
      }
    } catch {
      // Ignore stop errors
    }
  }

  function playRecorded() {
    if (recordedUri && recordedPlayer) recordedPlayer.play();
  }

  function playExample() {
    if (exampleAudioUrl && examplePlayer) examplePlayer.play();
  }

  const handleRecordPress = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleDone = () => {
    if (recordedUri) onComplete(recordedUri);
    else Alert.alert('No Recording', 'Please record your pronunciation first.');
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TypeBadge variant="speaking" />

        <Text style={styles.word}>{word}</Text>
        {phonetic && <Text style={styles.phonetic}>{phonetic}</Text>}

        {exampleAudioUrl && (
          <TouchableOpacity onPress={playExample} style={styles.exampleButton} activeOpacity={0.7}>
            <Ionicons name="headset" size={22} color={colors.primary.DEFAULT} />
            <Text style={styles.exampleText}>Play Example</Text>
          </TouchableOpacity>
        )}

        {!recordedUri ? (
          <View style={styles.recordSection}>
            <AnimatedTouchableOpacity
              onPress={handleRecordPress}
              activeOpacity={0.8}
              style={animatedRecordStyle}
            >
              <LinearGradient
                colors={isRecording ? colors.gradients.error : colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.recordButton}
              >
                <Ionicons name="mic" size={44} color={colors.text.primary} />
              </LinearGradient>
            </AnimatedTouchableOpacity>
            {isRecording && (
              <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
            )}
            <Text style={styles.recordHint}>
              {isRecording ? 'Tap to stop' : 'Tap to record'}
            </Text>
          </View>
        ) : (
          <View style={styles.playbackSection}>
            <TouchableOpacity onPress={playRecorded} activeOpacity={0.7}>
              <LinearGradient
                colors={colors.gradients.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playButton}
              >
                <Ionicons name="play" size={32} color={colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.playbackLabel}>Your recording</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {recordedUri ? (
            <>
              <TouchableOpacity
                onPress={() => setRecordedUri(null)}
                style={styles.actionButtonWrapper}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradients.error}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButton}
                >
                  <Ionicons name="refresh" size={20} color={colors.text.primary} />
                  <Text style={styles.actionText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDone}
                style={styles.actionButtonWrapper}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradients.success}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButton}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.text.primary} />
                  <Text style={styles.actionText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            onSkip && (
              <TouchableOpacity
                onPress={onSkip}
                style={styles.skipButtonWrapper}
                activeOpacity={0.8}
              >
                <View style={styles.skipButton}>
                  <Text style={styles.skipText}>Skip</Text>
                </View>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  word: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.overlay.primary10,
    borderRadius: borderRadius.full,
  },
  exampleText: {
    color: colors.primary.light,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  recordSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordHint: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  durationText: {
    color: colors.error.light,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
    marginTop: spacing.sm,
  },
  playbackSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackLabel: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  actionText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
  skipButtonWrapper: {
    flex: 1,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  skipText: {
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
});

export default SpeakingCard;
