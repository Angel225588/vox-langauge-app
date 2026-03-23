/**
 * Vocabulary Practice Screen Route
 *
 * Provides full vocabulary practice flow for a single word.
 * Uses VocabularyPracticeScreen with SM-2 spaced repetition and points.
 *
 * Route: /vocab-practice/[id]
 * Query params:
 * - sequence: comma-separated card variants (optional)
 * - fullFlow: 'true' or 'false' (default true)
 */

import { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { VocabularyPracticeScreen } from '@/components/cards/vocabulary/VocabularyPracticeScreen';
import { colors, spacing, typography } from '@/constants/designSystem';
import { supabase } from '@/lib/db/supabase';
import { SAMPLE_VOCABULARY } from '@/lib/data/sampleVocabulary';
import { updateStreakData } from '@/lib/db/sqlite';
import type { VocabularyItem, VocabCardVariant } from '@/types/vocabulary';

export default function VocabPracticeRoute() {
  const router = useRouter();
  const { id, sequence, fullFlow } = useLocalSearchParams<{
    id: string;
    sequence?: string;
    fullFlow?: string;
  }>();

  const [vocabularyItem, setVocabularyItem] = useState<VocabularyItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || 'anonymous');
    };
    getUser();
  }, []);

  // Load vocabulary item
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First try to find in sample vocabulary
        const sampleItem = SAMPLE_VOCABULARY.find(v => v.id === id);
        if (sampleItem) {
          setVocabularyItem(sampleItem);
          setIsLoading(false);
          return;
        }

        // TODO: Fetch from database if not in samples
        // const { data, error: fetchError } = await supabase
        //   .from('vocabulary')
        //   .select('*')
        //   .eq('id', id)
        //   .single();

        setError(`Vocabulary item not found: ${id}`);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading vocabulary:', err);
        setError('Failed to load vocabulary');
        setIsLoading(false);
      }
    };

    if (id) {
      loadVocabulary();
    }
  }, [id]);

  // Handle practice completion
  const handleComplete = useCallback(() => {
    // Go back to previous screen
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/practice');
    }
  }, [router]);

  // Handle early exit
  const handleExit = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/practice');
    }
  }, [router]);

  // Handle points earned — persist to SQLite (single source of truth)
  const handlePointsEarned = useCallback((points: number) => {
    if (userId && userId !== 'anonymous' && points > 0) {
      updateStreakData(userId, points).catch(() => {});
    }
  }, [userId]);

  // Parse custom sequence if provided
  const customSequence = sequence
    ? (sequence.split(',') as VocabCardVariant[])
    : undefined;

  // Parse fullFlow boolean
  const isFullFlow = fullFlow !== 'false';

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'bottom']}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={styles.centerContainer}
        >
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading vocabulary...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !vocabularyItem) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'bottom']}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={styles.centerContainer}
        >
          <Text style={styles.errorEmoji}>📚</Text>
          <Text style={styles.errorTitle}>Vocabulary Not Found</Text>
          <Text style={styles.errorMessage}>{error || 'Could not load vocabulary item'}</Text>
          <Text
            style={styles.backLink}
            onPress={handleExit}
          >
            ← Go Back
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'bottom']}>
      <VocabularyPracticeScreen
        item={vocabularyItem}
        userId={userId || 'anonymous'}
        onComplete={handleComplete}
        onExit={handleExit}
        onPointsEarned={handlePointsEarned}
        sequence={customSequence}
        fullFlow={isFullFlow}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.semibold,
  },
});
