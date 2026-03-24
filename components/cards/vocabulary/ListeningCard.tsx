/**
 * ListeningCard - Listen & Write Card
 *
 * "Listen and type what you hear" card for audio comprehension.
 * Clean structure: Badge → Title → Audio Buttons → Input → Check Button
 *
 * Features:
 * - Premium dark badge
 * - Large audio buttons (same size) at top
 * - Text input for typing
 * - Typo tolerance (Levenshtein distance)
 * - Fixed check button at bottom
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { DarkOverlay } from '@/components/ui';
import { useVocabCard } from './hooks/useVocabCard';
import { getTargetSpeechLang } from './speechLang';
import type { VocabCardProps } from '@/types/vocabulary';

// Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

interface ListeningCardProps extends VocabCardProps {
  mode?: 'type' | 'quiz';
}

export function ListeningCard({ item, onComplete, mode = 'type' }: ListeningCardProps) {
  const speechLang = getTargetSpeechLang();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { trackAudioPlay, trackHintUsed, complete } = useVocabCard({
    variant: 'listening',
    onComplete,
  });

  // Animation values
  const inputScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // Auto-play audio on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlayAudio(false);
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayAudio = useCallback(async (slow = false) => {
    haptics.light();
    trackAudioPlay();

    const newRate = slow ? 0.6 : 1.0;

    // If already playing same speed, stop it
    if (isPlaying && playbackRate === newRate) {
      Speech.stop();
      if (sound) await sound.stopAsync();
      setIsPlaying(false);
      return;
    }

    // If playing different speed, stop current first
    if (isPlaying) {
      Speech.stop();
      if (sound) await sound.stopAsync();
    }

    setPlaybackRate(newRate);
    setIsPlaying(true);

    // Use audioUrl for normal speed only, Speech for slow
    if (item.audioUrl && !slow) {
      try {
        if (sound) await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: item.audioUrl },
          { shouldPlay: true, rate: 1.0, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
          }
        );
        setSound(newSound);
      } catch {
        Speech.speak(item.word, { language: speechLang,
          rate: 0.85,
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      }
    } else {
      Speech.speak(item.word, { language: speechLang,
        rate: slow ? 0.5 : 0.85,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  }, [sound, isPlaying, playbackRate, item, haptics, trackAudioPlay]);

  const handleShowHint = useCallback(() => {
    haptics.light();
    trackHintUsed();
    setShowHint(true);
  }, [haptics, trackHintUsed]);

  const handleSubmitTyping = useCallback(() => {
    if (!input.trim()) return;

    const userAnswer = input.toLowerCase().trim();
    const correctAnswer = item.word.toLowerCase().trim();

    let correct = userAnswer === correctAnswer;
    if (!correct) {
      const distance = levenshteinDistance(userAnswer, correctAnswer);
      correct = distance <= 1;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      haptics.success();
      setTimeout(() => complete(true, input), 1500);
    } else {
      haptics.doubleError();
    }
  }, [input, item.word, haptics, complete]);

  const handleContinue = useCallback(() => {
    complete(false, input);
  }, [complete, input]);

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const showWrongAnswer = showResult && !isCorrect;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Top-right Badge */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.typeBadge, { top: insets.top + spacing.md }]}
      >
        <View style={styles.typeBadgeInner}>
          <Ionicons name="ear" size={14} color={colors.primary.light} />
          <Text style={styles.typeBadgeText}>LISTEN & WRITE</Text>
        </View>
      </Animated.View>

      {/* Top Content: Title + Audio Buttons */}
      <View style={[styles.topContent, { paddingTop: insets.top + spacing['3xl'] }]}>
        {/* Title */}
        <Animated.Text
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.title}
        >
          Type what you hear
        </Animated.Text>

        {/* Audio Buttons - Same size, centered */}
        <Animated.View
          entering={ZoomIn.duration(500).delay(200)}
          style={styles.audioSection}
        >
          <View style={styles.audioButtonsRow}>
            {/* Play button */}
            <TouchableOpacity
              onPress={() => handlePlayAudio(false)}
              activeOpacity={0.8}
              style={styles.audioButtonWrapper}
            >
              <LinearGradient
                colors={colors.gradients.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.audioButton}
              >
                <Ionicons
                  name={isPlaying && playbackRate >= 1.0 ? 'pause' : 'play'}
                  size={32}
                  color={colors.text.primary}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Slow button */}
            <TouchableOpacity
              onPress={() => handlePlayAudio(true)}
              activeOpacity={0.8}
              style={styles.audioButtonWrapper}
            >
              <LinearGradient
                colors={isPlaying && playbackRate < 1.0 ? colors.gradients.accent : colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.audioButton}
              >
                {isPlaying && playbackRate < 1.0 ? (
                  <Ionicons name="pause" size={32} color={colors.text.primary} />
                ) : (
                  <Text style={styles.turtleEmoji}>🐢</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.tapHint}>Tap to replay</Text>
        </Animated.View>
      </View>

      {/* Bottom Section: Input + Check Button (stays above keyboard) */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Input Section */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.inputSection}
        >
          {/* Hint button */}
          {!showHint && !showResult && (
            <TouchableOpacity
              onPress={handleShowHint}
              activeOpacity={0.7}
              style={styles.hintButton}
            >
              <Ionicons name="bulb-outline" size={18} color={colors.accent.orange} />
              <Text style={styles.hintButtonText}>Hint</Text>
            </TouchableOpacity>
          )}

          <Animated.View style={[inputAnimatedStyle, styles.inputWrapper]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                showHint
                  ? `Hint: ${item.word.substring(0, 2)}...`
                  : 'Type your answer...'
              }
              placeholderTextColor={showHint ? colors.accent.purple : colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  borderColor: !showResult
                    ? colors.border.light
                    : isCorrect
                    ? colors.success.DEFAULT
                    : colors.error.DEFAULT,
                },
              ]}
              editable={!showResult}
              onFocus={() => {
                inputScale.value = withSpring(1.02);
                haptics.light();
              }}
              onBlur={() => {
                inputScale.value = withSpring(1);
              }}
              onSubmitEditing={handleSubmitTyping}
            />
          </Animated.View>
        </Animated.View>

        {/* Check Button */}
        {!showWrongAnswer && (
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={handleSubmitTyping}
              disabled={!input.trim() || (showResult && isCorrect)}
              activeOpacity={0.8}
              onPressIn={() => {
                buttonScale.value = withSpring(0.95);
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1);
              }}
              style={[
                styles.checkButton,
                (!input.trim() || (showResult && isCorrect)) && styles.checkButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  !input.trim() || (showResult && isCorrect)
                    ? [colors.background.elevated, colors.background.card]
                    : colors.gradients.success
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkButtonGradient}
              >
                {showResult && isCorrect && (
                  <Ionicons name="checkmark" size={24} color={colors.text.primary} />
                )}
                <Text style={[
                  styles.checkButtonText,
                  (!input.trim() || (showResult && isCorrect)) && styles.checkButtonTextDisabled,
                ]}>
                  {showResult && isCorrect ? 'Correct!' : 'Check'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Overlays - positioned outside of keyboard avoiding to ensure visibility */}
      <DarkOverlay visible={showWrongAnswer} opacity={0.5} />
      {showWrongAnswer && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={[styles.feedbackOverlay, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Listening Tip</Text>
            <Text style={styles.feedbackExplanation}>
              The correct answer is "{item.word}"
            </Text>
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.8}
              style={styles.feedbackButton}
            >
              <Text style={styles.feedbackButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Top-right badge
  typeBadge: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 100,
  },
  typeBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 40, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.3)',
    ...shadows.sm,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  // Top content area (title + audio buttons)
  topContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  audioSection: {
    alignItems: 'center',
  },
  audioButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  audioButtonWrapper: {
    borderRadius: borderRadius.xl,
    ...shadows.glow.primary,
  },
  audioButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  turtleEmoji: {
    fontSize: 36,
  },
  tapHint: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  // Bottom section (input + check button) - stays above keyboard
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
  },
  inputSection: {
    marginBottom: spacing.md,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  hintButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.orange,
    fontWeight: typography.fontWeight.medium,
  },
  inputWrapper: {
    // Container for animated input
  },
  input: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    borderWidth: 2,
    textAlign: 'center',
  },
  checkButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  checkButtonDisabled: {
    opacity: 0.7,
  },
  checkButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  checkButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  checkButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  // Feedback overlay styles
  feedbackOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  feedbackCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: '#3D2528',
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.DEFAULT,
    padding: spacing.lg,
    ...shadows.lg,
  },
  feedbackTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.error.light,
    marginBottom: spacing.sm,
  },
  feedbackExplanation: {
    fontSize: typography.fontSize.lg,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  feedbackButton: {
    backgroundColor: colors.error.DEFAULT,
    borderWidth: 2,
    borderColor: colors.error.light,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.xl,
  },
  feedbackButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
