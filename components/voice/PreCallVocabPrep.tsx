/**
 * PreCallVocabPrep — Vocabulary review before a voice conversation
 *
 * Shows 3-5 scenario-relevant words from the FSRS word bank.
 * "You might need these words" → user reviews → then starts the call.
 *
 * Part of the Vocab↔Conversation loop (core differentiator).
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from '@/constants/designSystem';
import { getPreCallVocab } from '@/lib/voice/vocabLoop';
import type { BankWord } from '@/lib/word-bank/types';

// =============================================================================
// Types
// =============================================================================

interface PreCallVocabPrepProps {
  /** Scenario ID for matching vocab */
  scenario: string;
  /** Target language code */
  targetLanguage: string;
  /** Called when user is ready to start the call */
  onReady: (prepWords: string[]) => void;
  /** Called when user skips vocab prep */
  onSkip: () => void;
}

// =============================================================================
// Component
// =============================================================================

export const PreCallVocabPrep: React.FC<PreCallVocabPrepProps> = ({
  scenario,
  targetLanguage,
  onReady,
  onSkip,
}) => {
  const [words, setWords] = useState<BankWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadVocab();
  }, [scenario, targetLanguage]);

  async function loadVocab() {
    setLoading(true);
    try {
      const vocab = await getPreCallVocab(scenario, targetLanguage, 5);
      setWords(vocab);
    } catch (error) {
      console.error('[PreCallVocab] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleReady() {
    onReady(words.map((w) => w.word));
  }

  // No vocab available — go straight to call
  if (!loading && words.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="chatbubbles" size={48} color={colors.primary.DEFAULT} />
          <Text style={styles.title}>Ready to practice?</Text>
          <Text style={styles.subtitle}>Jump right into the conversation.</Text>
          <TouchableOpacity onPress={() => onReady([])} activeOpacity={0.8}>
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButton}
            >
              <Ionicons name="call" size={20} color={colors.text.primary} />
              <Text style={styles.startButtonText}>Start Call</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="bulb" size={24} color={colors.warning.DEFAULT} />
          <Text style={styles.title}>Words you might need</Text>
        </View>
        <Text style={styles.subtitle}>
          Review these before your conversation
        </Text>

        {/* Word list */}
        <View style={styles.wordList}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={styles.wordCardSkeleton} />
              ))
            : words.map((word, index) => {
                const revealed = revealedIds.has(word.id);
                return (
                  <Animated.View
                    key={word.id}
                    entering={FadeInDown.delay(index * 80)}
                  >
                    <TouchableOpacity
                      style={styles.wordCard}
                      onPress={() => toggleReveal(word.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.wordRow}>
                        <Text style={styles.wordText}>{word.word}</Text>
                        {word.phonetic && (
                          <Text style={styles.phoneticText}>{word.phonetic}</Text>
                        )}
                      </View>
                      {revealed ? (
                        <Text style={styles.translationText}>
                          {word.translation}
                        </Text>
                      ) : (
                        <Text style={styles.tapHint}>Tap to reveal</Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onSkip}
            style={styles.skipButton}
            activeOpacity={0.8}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleReady} activeOpacity={0.8} style={styles.readyButtonWrapper}>
            <LinearGradient
              colors={colors.gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.readyButton}
            >
              <Ionicons name="call" size={18} color={colors.text.primary} />
              <Text style={styles.readyText}>I'm Ready</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  wordList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  wordCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
  },
  wordCardSkeleton: {
    height: 56,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    opacity: 0.5,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  wordText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  phoneticText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  translationText: {
    fontSize: typography.fontSize.base,
    color: colors.primary.light,
    marginTop: spacing.xs,
  },
  tapHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  skipButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  readyButtonWrapper: {
    flex: 2,
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  readyText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  startButtonText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
  },
});

export default PreCallVocabPrep;
