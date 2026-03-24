/**
 * AudioQuizCard - Listen & Select Card
 *
 * "What did you hear?" pattern for audio comprehension.
 * User listens to pronunciation, then selects from multiple choice options.
 *
 * Features:
 * - Large audio play buttons (like ComparisonCard)
 * - Speed toggle (normal/slow)
 * - 4 multiple choice options
 * - Visual feedback (green correct, red incorrect)
 * - Auto-advance on correct answer
 * - Premium dark badge styling
 *
 * Design inspiration: ComparisonCard audio buttons, premium apps
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { DarkOverlay, AnswerOption } from '@/components/ui';
import { useVocabCard } from './hooks/useVocabCard';
import { getTargetSpeechLang } from './speechLang';
import type { VocabCardProps, VocabularyItem } from '@/types/vocabulary';

interface AudioQuizCardProps extends VocabCardProps {
  /** Options to display - defaults to generating from item */
  options?: string[];
  /** Index of correct answer (0-3) - defaults to 0 */
  correctIndex?: number;
  /** Quiz mode: 'word' asks for the word, 'translation' asks for translation */
  quizMode?: 'word' | 'translation';
}

// Generate distractor options (in a real app, these would come from similar words)
function generateOptions(item: VocabularyItem, quizMode: 'word' | 'translation'): string[] {
  const correct = quizMode === 'word' ? item.word : item.translation;

  // Sample distractors - in production, use similar words from vocabulary bank
  const distractors = quizMode === 'word'
    ? ['apple', 'garden', 'window', 'picture', 'morning', 'evening']
    : ['manzana', 'jardín', 'ventana', 'imagen', 'mañana', 'tarde'];

  // Shuffle and pick 3 distractors that aren't the correct answer
  const shuffled = distractors
    .filter(d => d.toLowerCase() !== correct.toLowerCase())
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Insert correct answer at random position
  const options = [...shuffled];
  const correctPosition = Math.floor(Math.random() * 4);
  options.splice(correctPosition, 0, correct);

  return options;
}

export function AudioQuizCard({
  item,
  onComplete,
  options: providedOptions,
  correctIndex: providedCorrectIndex,
  quizMode = 'word',
}: AudioQuizCardProps) {
  const speechLang = getTargetSpeechLang();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  // Generate options if not provided
  const [options] = useState(() =>
    providedOptions || generateOptions(item, quizMode)
  );

  const correctAnswer = quizMode === 'word' ? item.word : item.translation;
  const correctIndex = providedCorrectIndex ?? options.findIndex(
    o => o.toLowerCase() === correctAnswer.toLowerCase()
  );

  // Quiz state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { trackAudioPlay, complete } = useVocabCard({
    variant: 'audioQuiz',
    onComplete,
  });

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // Auto-play on mount
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
        // Fallback to Speech
        Speech.speak(item.word, { language: speechLang,
          rate: 0.85,
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      }
    } else {
      // Slow mode always uses Speech for better control
      Speech.speak(item.word, { language: speechLang,
        rate: slow ? 0.5 : 0.85,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  }, [sound, isPlaying, playbackRate, item, haptics, trackAudioPlay]);

  const handleSelect = useCallback((index: number) => {
    const isCorrect = index === correctIndex;

    if (isCorrect) {
      haptics.success();
    } else {
      haptics.doubleError();
    }

    setSelectedIndex(index);
    setShowResult(true);

    if (isCorrect) {
      setTimeout(() => complete(true, options[index]), 1500);
    }
  }, [correctIndex, options, haptics, complete]);

  const handleContinue = useCallback(() => {
    complete(false, selectedIndex !== null ? options[selectedIndex] : undefined);
  }, [complete, selectedIndex, options]);

  const showWrongAnswer = showResult && selectedIndex !== correctIndex;

  const getOptionState = (index: number) => {
    if (!showResult) return 'default';
    if (index === correctIndex) return 'correct';
    if (index === selectedIndex) return 'wrong';
    return 'default';
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.md }]}>
      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
        {/* Badge inline with question */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.headerRow}
        >
          <View style={styles.typeBadgeInner}>
            <Ionicons name="headset" size={14} color={colors.primary.light} />
            <Text style={styles.typeBadgeText}>AUDIO QUIZ</Text>
          </View>
        </Animated.View>

        {/* Question */}
        <Animated.Text
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.questionText}
        >
          What did you hear?
        </Animated.Text>

        {/* Audio Controls - Big buttons like ComparisonCard */}
        <Animated.View
          entering={ZoomIn.duration(500).delay(200)}
          style={styles.audioSection}
        >
          <View style={styles.audioButtonsRow}>
            {/* Play button - Big */}
            <TouchableOpacity
              onPress={() => handlePlayAudio(false)}
              activeOpacity={0.8}
              style={styles.audioButtonWrapper}
            >
              <LinearGradient
                colors={colors.gradients.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.audioButtonLarge}
              >
                <Ionicons
                  name={isPlaying && playbackRate >= 1.0 ? 'pause' : 'play'}
                  size={32}
                  color={colors.text.primary}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Slow button - Same size as play */}
            <TouchableOpacity
              onPress={() => handlePlayAudio(true)}
              activeOpacity={0.8}
              style={styles.audioButtonWrapper}
            >
              <LinearGradient
                colors={isPlaying && playbackRate < 1.0 ? colors.gradients.accent : colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.audioButtonLarge}
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

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <AnswerOption
              key={index}
              text={option}
              onPress={() => handleSelect(index)}
              disabled={showResult}
              state={getOptionState(index)}
              entranceDelay={100 * (index + 1) + 400}
              hapticFeedback={false}
            />
          ))}
        </View>
      </View>

      {/* Overlays */}
      <DarkOverlay visible={showWrongAnswer} opacity={0.5} />
      {showWrongAnswer && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={[styles.feedbackOverlay, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Listening Tip</Text>
            <Text style={styles.feedbackExplanation}>
              The correct answer is "{correctAnswer}"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  // Header row with badge
  headerRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  // Premium dark badge
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
  questionText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  audioSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
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
  audioButtonLarge: {
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
  optionsContainer: {
    gap: spacing.sm,
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
