import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface SpeakingCardProps {
  question: string;
  targetWord: string;
  phonetic?: string;
  imageUrl?: string;
  language?: string;
  onRecordingComplete?: (audioUri: string) => void;
}

export function SpeakingCard({
  question,
  targetWord,
  phonetic,
  imageUrl,
  language = 'en-US',
  onRecordingComplete,
}: SpeakingCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Animated values for recording indicator
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);

      // Start pulse animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (!recordingRef.current) return;

      setIsRecording(false);

      // Stop animations
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1);
      opacity.value = withTiming(1);

      // Stop and get URI
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      recordingRef.current = null;
      setRecordedUri(uri);

      if (uri) {
        onRecordingComplete?.(uri);
      }

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const playRecording = async () => {
    if (!recordedUri) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
      setIsPlaying(false);
    }
  };

  const playTargetAudio = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // TODO: Replace with Google TTS
      await Speech.speak(targetWord, {
        language,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      {/* Target Word */}
      <View style={styles.targetContainer}>
        <Text style={styles.targetWord}>{targetWord}</Text>
        {phonetic && <Text style={styles.phonetic}>{phonetic}</Text>}

        <TouchableOpacity onPress={playTargetAudio} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradients.secondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.listenButton}
          >
            <Ionicons name="volume-high" size={24} color={colors.text.primary} />
            <Text style={styles.listenButtonText}>Listen</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Image (optional) */}
      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Record Button */}
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        activeOpacity={0.8}
        style={styles.recordButtonContainer}
      >
        <Animated.View style={[animatedStyle]}>
          <LinearGradient
            colors={isRecording ? colors.gradients.error : colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.recordButton}
          >
            <Ionicons
              name={isRecording ? 'stop-circle' : 'mic'}
              size={64}
              color={colors.text.primary}
            />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.recordButtonText}>
          {isRecording ? 'Tap to stop' : 'Tap to record'}
        </Text>
      </TouchableOpacity>

      {/* Skip Recording Button - "I can't speak now" */}
      {!recordedUri && !isRecording && (
        <TouchableOpacity
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRecordingComplete?.(null as any);
          }}
          activeOpacity={0.8}
          style={styles.skipButtonContainer}
        >
          <View style={styles.skipButton}>
            <Ionicons name="volume-mute-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.skipButtonText}>I can't speak now ⏭️</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Playback Button */}
      {recordedUri && (
        <TouchableOpacity
          onPress={playRecording}
          disabled={isPlaying}
          activeOpacity={0.8}
          style={styles.playbackButtonContainer}
        >
          <LinearGradient
            colors={colors.gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playbackButton}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.text.primary}
            />
            <Text style={styles.playbackButtonText}>
              {isPlaying ? 'Playing your recording...' : 'Listen to your recording'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  targetContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetWord: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  listenButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  recordButtonContainer: {
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  recordButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  recordButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  playbackButtonContainer: {
    width: '100%',
  },
  playbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    shadowColor: colors.glow.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playbackButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  skipButtonContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skipButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
});
