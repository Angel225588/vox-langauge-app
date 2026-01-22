/**
 * FocusWordsList - Words That Need Attention
 *
 * Shows the top weak/struggling words based on:
 * - Low mastery score (< 50%)
 * - High priority (needs review)
 * - Recent errors
 *
 * Design: Compact list with warning indicators and quick-practice option.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { BankWord } from '@/lib/word-bank';
import { Icon } from '@/components/ui/Icon';

interface FocusWordsListProps {
  /** All words from the word bank */
  words: BankWord[];
  /** Maximum number of words to show */
  limit?: number;
  /** Callback when a word is pressed */
  onWordPress?: (word: BankWord) => void;
  /** Callback to see all weak words */
  onSeeAll?: () => void;
  /** Callback to practice focus words */
  onPractice?: () => void;
  /** Loading state */
  loading?: boolean;
}

export function FocusWordsList({
  words,
  limit = 5,
  onWordPress,
  onSeeAll,
  onPractice,
  loading = false,
}: FocusWordsListProps) {
  // Filter and sort weak words (mastery < 50%, sorted by priority desc)
  const focusWords = words
    .filter(w => w.masteryScore < 50)
    .sort((a, b) => {
      // Sort by priority first (higher = more urgent)
      if (b.priority !== a.priority) return b.priority - a.priority;
      // Then by mastery (lower = needs more work)
      return a.masteryScore - b.masteryScore;
    })
    .slice(0, limit);

  const totalWeakWords = words.filter(w => w.masteryScore < 50).length;
  const hasMore = totalWeakWords > limit;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.loadingTitle} />
        </View>
        <View style={styles.card}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.loadingRow} />
          ))}
        </View>
      </View>
    );
  }

  // Don't show section if no weak words
  if (focusWords.length === 0) {
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(200).springify()} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>🎯 Words to Focus On</Text>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyTitle}>Great job!</Text>
          <Text style={styles.emptySubtitle}>No words need extra attention right now</Text>
        </View>
      </Animated.View>
    );
  }

  const getMasteryColor = (score: number) => {
    if (score < 20) return colors.error.DEFAULT;
    if (score < 35) return colors.warning.DEFAULT;
    return colors.warning.light;
  };

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()} style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>🔥 Words to Focus On</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{totalWeakWords}</Text>
          </View>
        </View>
        {onPractice && focusWords.length > 0 && (
          <TouchableOpacity
            onPress={onPractice}
            style={styles.practiceButton}
            accessibilityLabel="Practice focus words"
            accessibilityRole="button"
          >
            <Text style={styles.practiceButtonText}>Practice</Text>
            <Icon name="arrow-forward" size="sm" color="primary" />
          </TouchableOpacity>
        )}
      </View>

      {/* Words Card */}
      <View style={styles.card}>
        {focusWords.map((word, index) => (
          <TouchableOpacity
            key={word.id}
            style={[styles.wordRow, index === focusWords.length - 1 && styles.lastRow]}
            onPress={() => onWordPress?.(word)}
            activeOpacity={0.7}
            accessibilityLabel={`${word.word} - ${word.translation}`}
            accessibilityRole="button"
            accessibilityHint={`Mastery: ${Math.round(word.masteryScore)}%. Tap for details.`}
          >
            {/* Word & Translation */}
            <View style={styles.wordInfo}>
              <Text style={styles.word}>{word.word}</Text>
              <Text style={styles.translation}>{word.translation}</Text>
            </View>

            {/* Mastery Badge */}
            <View style={[styles.masteryBadge, { backgroundColor: `${getMasteryColor(word.masteryScore)}15` }]}>
              <Icon name="alert-circle" size="sm" color={getMasteryColor(word.masteryScore) as any} />
              <Text style={[styles.masteryText, { color: getMasteryColor(word.masteryScore) }]}>
                {Math.round(word.masteryScore)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* See All Link */}
        {hasMore && onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            style={styles.seeAllButton}
            accessibilityLabel={`See all ${totalWeakWords} focus words`}
            accessibilityRole="button"
          >
            <Text style={styles.seeAllText}>See all {totalWeakWords} words</Text>
            <Icon name="chevron-forward" size="sm" color="tertiary" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.error.DEFAULT,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  practiceButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.light,
  },
  loadingTitle: {
    width: 160,
    height: 20,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  loadingRow: {
    height: 56,
    backgroundColor: colors.background.elevated,
    marginBottom: 1,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  wordInfo: {
    flex: 1,
  },
  word: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  translation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  masteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  masteryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  emptyCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default FocusWordsList;
