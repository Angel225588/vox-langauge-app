/**
 * Flashcard Session Screen — Batch Vocabulary Practice
 *
 * Uses VocabularyBatchFlow for the full 5-phase cycle:
 * Introduce → Select → Listen → Speak → Write → Results
 *
 * Loads words from the word bank (due for review or new words).
 * After completion, updates FSRS scores and returns to previous screen.
 *
 * Route: /flashcard/session
 * Entry: Practice Tab → Vocabulary Sprint
 */

import { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ConfirmExitModal } from '@/components/ui/ConfirmExitModal';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { useAuth } from '@/hooks/useAuth';
import { VocabularyBatchFlow } from '@/components/cards/vocabulary/VocabularyBatchFlow';
import type { BatchFlowResult } from '@/components/cards/vocabulary/VocabularyBatchFlow';
import { getWords, recordReview } from '@/lib/word-bank/storage';
import { bankWordToVocabularyItem } from '@/lib/word-bank/adapter';
import { updateStreakData } from '@/lib/db/sqlite';
import type { VocabularyItem } from '@/types/vocabulary';

const BATCH_SIZE = 5;

export default function FlashcardSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';

  const [items, setItems] = useState<VocabularyItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vocabulary items from word bank
  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get words due for review first, then fill with new words
      const dueWords = await getWords({
        needsReview: true,
        limit: BATCH_SIZE,
      });

      let bankWords = dueWords;

      // If not enough due words, add recent ones
      if (bankWords.length < BATCH_SIZE) {
        const recentWords = await getWords({
          limit: BATCH_SIZE - bankWords.length,
        });
        // Avoid duplicates
        const existingIds = new Set(bankWords.map(w => w.id));
        for (const w of recentWords) {
          if (!existingIds.has(w.id)) {
            bankWords.push(w);
            if (bankWords.length >= BATCH_SIZE) break;
          }
        }
      }

      if (bankWords.length === 0) {
        setError('No vocabulary words available. Complete onboarding to generate your word bank.');
        setIsLoading(false);
        return;
      }

      // Convert BankWord → VocabularyItem for card components
      const vocabItems = bankWords.map(bw => bankWordToVocabularyItem(bw));
      setItems(vocabItems);
      setIsLoading(false);
    } catch (err) {
      console.error('[FlashcardSession] Error loading vocabulary:', err);
      setError('Could not load vocabulary. Please try again.');
      setIsLoading(false);
    }
  }, []);

  // Handle batch flow completion — save points, FSRS, metrics
  const handleComplete = useCallback(async (result: BatchFlowResult) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const accuracy = result.totalAttempts > 0
      ? Math.round((result.totalCorrect / result.totalAttempts) * 100)
      : 0;
    const points = result.totalCorrect * 10;

    try {
      // 1. Update FSRS — words to review get "again", rest get "good"
      const reviewWords = new Set(result.wordsToReview);
      if (items) {
        for (const item of items) {
          const quality = reviewWords.has(item.word) ? 1 : 3;
          await recordReview(item.id, quality, 'flashcard_session');
        }
      }

      // 2. Save points to streak data (practice tab KPIs)
      if (points > 0) {
        await updateStreakData(userId, points);
      }

      // 3. Save to competency metrics (for the Update Content analysis)
      try {
        const { savePracticeScore } = require('@/lib/db/competencyMetrics');
        // Save as multiple practice types since vocab covers listening + writing
        await savePracticeScore(userId, 'listening', {
          articulation: accuracy,
          fluency: Math.round(accuracy * 0.85),
          communication: accuracy,
          scenario: accuracy,
        }, { source: 'vocabulary_sprint', wordsReviewed: result.totalWords });

        if (result.correctByPhase?.write) {
          await savePracticeScore(userId, 'writing', {
            articulation: Math.round((result.correctByPhase.write / result.totalWords) * 100),
            communication: accuracy,
          }, { source: 'vocabulary_sprint' });
        }
      } catch (metricsErr) {
        console.warn('[FlashcardSession] Metrics save failed:', metricsErr);
      }

      console.log('[FlashcardSession] Complete:', {
        accuracy,
        points,
        wordsToReview: result.wordsToReview.length,
        totalWords: result.totalWords,
      });
    } catch (err) {
      console.warn('[FlashcardSession] Error saving results:', err);
    }

    router.back();
  }, [items, userId, router]);

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitRequest = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowExitConfirm(true);
  }, []);

  // Handle detailed feedback navigation
  const handleFeedback = useCallback((result: BatchFlowResult) => {
    const accuracy = result.totalAttempts > 0
      ? Math.round((result.totalCorrect / result.totalAttempts) * 100)
      : 0;
    const points = result.totalCorrect * 10;

    router.push({
      pathname: '/feedback-detail',
      params: {
        scores: JSON.stringify({
          articulation: accuracy,
          fluency: Math.round(accuracy * 0.9),
          communication: accuracy,
          scenario: accuracy,
          wordsLearned: result.totalWords,
          pointsEarned: points,
          timeSpent: result.timeSeconds,
          cefrLevel: 'B1',
        }),
        stairTitle: 'Vocabulary Sprint',
        stairId: 'vocab-sprint',
        isDiscovery: 'false',
        scenario: 'Vocabulary Practice',
      },
    });
  }, [router]);

  const handleExit = useCallback(() => {
    setShowExitConfirm(false);
    router.back();
  }, [router]);

  // Android back button
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowExitConfirm(true);
      return true;
    });
    return () => handler.remove();
  }, []);

  // Loading
  if (isLoading) {
    return (
      <SafeAreaView style={S.center} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={S.loadingText}>Loading vocabulary...</Text>
      </SafeAreaView>
    );
  }

  // Error
  if (error || !items) {
    return (
      <SafeAreaView style={S.center} edges={['top', 'bottom']}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.text.secondary} />
        <Text style={S.errorTitle}>No Words Available</Text>
        <Text style={S.errorMsg}>{error || 'No vocabulary loaded.'}</Text>
        <TouchableOpacity onPress={handleExit} style={S.backBtn}>
          <Text style={S.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <VocabularyBatchFlow
        items={items}
        onComplete={handleComplete}
        onExit={handleExitRequest}
        onFeedback={handleFeedback}
      />
      <ConfirmExitModal
        visible={showExitConfirm}
        onContinue={() => setShowExitConfirm(false)}
        onExit={handleExit}
        progress={`${items.length} words in this session`}
      />
    </GestureHandlerRootView>
  );
}

const S = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    marginTop: spacing.md,
  },
  errorTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  errorMsg: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  backBtn: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.fontSize.base,
  },
});
