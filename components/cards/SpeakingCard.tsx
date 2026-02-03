/**
 * Speaking Card Component
 *
 * Pronunciation practice card where users record themselves saying a word.
 *
 * Features:
 * - Displays word to pronounce (large text)
 * - Shows phonetic pronunciation guide
 * - TTS audio playback (normal & slow speed) using expo-speech
 * - Both Listen and Slow buttons visible simultaneously
 * - Optional example sentence
 * - Real audio recording with expo-av
 * - Pill-shaped speak button at bottom (flex: 2)
 * - Voice level visualization during recording
 * - Haptic feedback (medium on start, success on stop)
 * - "I can't speak" button for public situations (flex: 1)
 * - Auto-advances after stopping (500ms delay)
 * - Gradient background changes: primary → error while recording
 *
 * Layout:
 * - Audio controls at top (Listen + Slow side by side)
 * - Word and phonetic centered
 * - Voice level bar when recording
 * - Pill buttons fixed at bottom
 *
 * Learning Objective: Build speaking confidence through practice and self-review
 */

import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { AudioButton, AudioButtonGroup, SpeakButton, CantSpeakButton } from '@/components/ui';

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
  /** Expression type: verb, noun, phrase, expression, slang, etc. */
  expressionType?: string;
  /** Callback when user can't speak (public situation) */
  onCantSpeak?: () => void;
  /** Language for TTS (e.g., 'en-US', 'es-ES', 'fr-FR') */
  language?: string;
}

export function SpeakingCard({
  word,
  translation,
  phonetic,
  audio_url,
  example_sentence,
  expressionType,
  onNext,
  onComplete,
  onCantSpeak,
  language = 'en-US',
}: SpeakingCardProps) {
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlayingNormal, setIsPlayingNormal] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const recordButtonScale = useSharedValue(1);
  const recordButtonRotation = useSharedValue(0);
  const voiceLevelWidth = useSharedValue(0);

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

  // Cleanup recording and speech on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {
          // Ignore errors if already unloaded
        });
      }
      Speech.stop();
    };
  }, [recording]);

  // Voice level animation when recording
  useEffect(() => {
    if (isRecording) {
      voiceLevelWidth.value = withRepeat(
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      voiceLevelWidth.value = withTiming(0, { duration: 200 });
    }
  }, [isRecording]);

  const handlePlayAudio = async (slow: boolean = false) => {
    try {
      // Stop any currently playing speech
      await Speech.stop();

      if (slow && isPlayingSlow) {
        setIsPlayingSlow(false);
        return;
      }
      if (!slow && isPlayingNormal) {
        setIsPlayingNormal(false);
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (slow) {
        setIsPlayingSlow(true);
      } else {
        setIsPlayingNormal(true);
      }

      Speech.speak(word || '', {
        language: language,
        rate: slow ? 0.5 : 1.0,
        onDone: () => {
          if (slow) {
            setIsPlayingSlow(false);
          } else {
            setIsPlayingNormal(false);
          }
        },
        onStopped: () => {
          if (slow) {
            setIsPlayingSlow(false);
          } else {
            setIsPlayingNormal(false);
          }
        },
        onError: () => {
          if (slow) {
            setIsPlayingSlow(false);
          } else {
            setIsPlayingNormal(false);
          }
        },
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingNormal(false);
      setIsPlayingSlow(false);
    }
  };

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

  const voiceLevelStyle = useAnimatedStyle(() => {
    return {
      width: `${voiceLevelWidth.value * 100}%`,
    };
  });

  const handleCantSpeak = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onCantSpeak) {
      onCantSpeak();
    } else if (onComplete) {
      onComplete({ cantSpeak: true });
    } else if (onNext) {
      onNext({ cantSpeak: true });
    }
  };

  const handleToggleTranslation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTranslation(!showTranslation);
  };

  return (
    <View style={styles.container}>
      {/* Expression Type Badge - Top Right */}
      {expressionType && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.expressionBadge, { top: insets.top + spacing.md }]}
        >
          <Text style={styles.expressionBadgeText}>
            {expressionType.toUpperCase()}
          </Text>
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
        {/* Header */}
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          Listen & Speak
        </Animated.Text>

        {/* Word */}
        <Animated.Text
          entering={ZoomIn.duration(500).delay(100)}
          style={styles.word}
        >
          {word}
        </Animated.Text>

        {/* Phonetic */}
        {phonetic && (
          <Animated.Text
            entering={FadeIn.duration(400).delay(200)}
            style={styles.phonetic}
          >
            /{phonetic}/
          </Animated.Text>
        )}

        {/* Translation - Inline Toggle */}
        {translation && (
          <Animated.View entering={FadeIn.duration(400).delay(300)}>
            <TouchableOpacity
              onPress={handleToggleTranslation}
              activeOpacity={0.7}
              style={styles.translationToggle}
            >
              {showTranslation ? (
                <Text style={styles.translationText}>{translation}</Text>
              ) : (
                <View style={styles.translationHidden}>
                  <Ionicons name="eye-outline" size={16} color={colors.text.tertiary} />
                  <Text style={styles.translationHiddenText}>Tap to see translation</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Audio Controls */}
        <Animated.View
          entering={FadeIn.duration(400).delay(400)}
          style={styles.audioControlsWrapper}
        >
          <AudioButtonGroup size="compact" showContainer={false}>
            <AudioButton
              variant="play"
              isPlaying={isPlayingNormal}
              onPress={() => handlePlayAudio(false)}
              size="md"
            />
            <AudioButton
              variant="slow"
              isPlaying={isPlayingSlow}
              onPress={() => handlePlayAudio(true)}
              size="md"
            />
          </AudioButtonGroup>
        </Animated.View>

        {/* Voice Level Visualization (when recording) */}
        {isRecording && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.voiceLevelContainer}
          >
            <Animated.View style={[styles.voiceLevelBar, voiceLevelStyle]} />
          </Animated.View>
        )}

        {/* Spacer to push buttons to bottom */}
        <View style={{ flex: 1 }} />
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.md }]}>
        <Animated.View
          entering={FadeIn.duration(400).delay(500)}
          style={styles.bottomButtonsColumn}
        >
          <SpeakButton
            isRecording={isRecording}
            onPress={handleRecord}
          />
          <CantSpeakButton onPress={handleCantSpeak} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  expressionBadge: {
    position: 'absolute',
    right: spacing.lg,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    zIndex: 10,
  },
  expressionBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.purple,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  word: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  translationToggle: {
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  translationText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.purple,
    textAlign: 'center',
  },
  translationHidden: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  translationHiddenText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  audioControlsWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  voiceLevelContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  voiceLevelBar: {
    height: '100%',
    backgroundColor: colors.error.DEFAULT,
    borderRadius: borderRadius.sm,
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  bottomButtonsColumn: {
    gap: spacing.sm,
  },
});
