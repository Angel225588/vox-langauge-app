/**
 * Speaking Card Component
 *
 * Pronunciation practice card where users record themselves saying a word.
 *
 * Features:
 * - Displays word to pronounce (large text)
 * - Shows phonetic pronunciation guide
 * - Optional example sentence
 * - Real audio recording with expo-av
 * - Playback of user's recording
 * - Large record button (🎤) that toggles to stop (⏹️) while recording
 * - Animated pulsing rings during recording (2 layers)
 * - Button rotates 360° when starting recording
 * - Button scales up (1.1x) while recording
 * - Color changes: primary blue → red while recording
 * - Status text: "Tap to record" → "🔴 Recording... Tap to stop"
 * - Haptic feedback (medium on start, success on stop)
 * - Auto-advances after stopping (500ms delay)
 *
 * Learning Objective: Build speaking confidence through practice and self-review
 */

import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

interface CardProps {
  onNext?: (answer?: any) => void;
  onComplete?: (answer?: any) => void;
}

interface SpeakingCardProps extends CardProps {
  word?: string;
  translation?: string;
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
}

export function SpeakingCard({
  word,
  translation,
  phonetic,
  audio_url,
  example_sentence,
  onNext,
  onComplete,
}: SpeakingCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordButtonScale = useSharedValue(1);
  const recordButtonRotation = useSharedValue(0);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Microphone permission not granted');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    })();
  }, []);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {
          // Ignore errors if already unloaded
        });
      }
    };
  }, [recording]);

  const handleRecord = async () => {
    if (!isRecording) {
      // Start recording
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
    } else {
      // Stop recording
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsRecording(false);
        recordButtonRotation.value = withTiming(0, { duration: 300 });
        recordButtonScale.value = withSpring(1);

        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setRecordingUri(uri);
          setRecording(null);

          // Reset audio mode
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
          });
        }

        setTimeout(() => {
          // Support both onNext and onComplete for backward compatibility
          if (onComplete) {
            onComplete();
          } else if (onNext) {
            onNext();
          }
        }, 500);
      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
    }
  };

  const recordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: recordButtonScale.value },
        { rotate: `${recordButtonRotation.value}deg` },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    if (!isRecording) return { opacity: 0 };

    return {
      opacity: withTiming(0.3, { duration: 1000 }),
      transform: [
        { scale: withTiming(1.3, { duration: 1000 }) },
      ],
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.Text
        entering={FadeInDown.duration(400)}
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        Say this word
      </Animated.Text>

      <Animated.Text
        entering={ZoomIn.duration(500).delay(200)}
        style={{
          fontSize: 56,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: spacing.sm,
        }}
      >
        {word}
      </Animated.Text>

      {phonetic && (
        <Animated.Text
          entering={FadeIn.duration(400).delay(300)}
          style={{
            fontSize: typography.fontSize.lg,
            color: colors.accent.purple,
            marginBottom: spacing.xl,
          }}
        >
          {phonetic}
        </Animated.Text>
      )}

      {example_sentence && (
        <Animated.Text
          entering={FadeIn.duration(400).delay(400)}
          style={{
            fontSize: typography.fontSize.md,
            color: colors.text.tertiary,
            textAlign: 'center',
            fontStyle: 'italic',
            marginBottom: spacing['2xl'],
            paddingHorizontal: spacing.lg,
          }}
        >
          "{example_sentence}"
        </Animated.Text>
      )}

      <View style={{ position: 'relative', marginTop: spacing.xl }}>
        {isRecording && (
          <>
            <Animated.View
              style={[
                pulseStyle,
                {
                  position: 'absolute',
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: colors.accent.error,
                  top: -10,
                  left: -10,
                },
              ]}
            />
            <Animated.View
              style={[
                pulseStyle,
                {
                  position: 'absolute',
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: colors.accent.error,
                  top: -20,
                  left: -20,
                },
              ]}
            />
          </>
        )}

        <Animated.View
          entering={ZoomIn.duration(500).delay(500).springify()}
        >
          <Animated.View style={recordButtonStyle}>
            <TouchableOpacity
              onPress={handleRecord}
              activeOpacity={0.8}
              style={{
                width: 120,
                height: 120,
                borderRadius: borderRadius.full,
                backgroundColor: isRecording ? colors.accent.error : colors.accent.primary,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isRecording ? colors.accent.error : colors.accent.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 48 }}>{isRecording ? '⏹️' : '🎤'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.Text
        entering={FadeIn.duration(400).delay(600)}
        style={{
          fontSize: typography.fontSize.md,
          color: isRecording ? colors.accent.error : colors.text.secondary,
          marginTop: spacing.lg,
          fontWeight: isRecording ? typography.fontWeight.semibold : typography.fontWeight.normal,
        }}
      >
        {isRecording ? '🔴 Recording... Tap to stop' : 'Tap to record'}
      </Animated.Text>

      {/* "I Can Speak" skip option */}
      {!isRecording && (
        <Animated.View entering={FadeIn.duration(400).delay(700)}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onComplete) {
                onComplete(null);
              } else if (onNext) {
                onNext(null);
              }
            }}
            activeOpacity={0.7}
            style={{
              marginTop: spacing.xl,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
              borderRadius: borderRadius.xl,
              borderWidth: 2,
              borderColor: colors.text.tertiary,
              backgroundColor: 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                textAlign: 'center',
              }}
            >
              I can speak this ✓
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
