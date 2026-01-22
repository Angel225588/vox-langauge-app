/**
 * RecentlyAddedList - Recently Added Words
 *
 * Shows the most recently added words with relative timestamps.
 * Provides motivation by showing learning activity.
 *
 * Design: Simple list with timestamps, subtle and informative.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { BankWord } from '@/lib/word-bank';
import { Icon } from '@/components/ui/Icon';

interface RecentlyAddedListProps {
  /** All words from the word bank */
  words: BankWord[];
  /** Maximum number of words to show */
  limit?: number;
  /** Callback when a word is pressed */
  onWordPress?: (word: BankWord) => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * Format a relative time string (e.g., "2 hours ago", "yesterday")
 */
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Get source icon and label
 */
function getSourceInfo(source: string): { icon: string; label: string } {
  switch (source) {
    case 'lesson':
      return { icon: '📖', label: 'from lesson' };
    case 'reading':
      return { icon: '📚', label: 'from reading' };
    case 'manual':
      return { icon: '✍️', label: 'added manually' };
    case 'error':
      return { icon: '⚠️', label: 'from mistake' };
    case 'ai_conversation':
      return { icon: '🎙️', label: 'from conversation' };
    default:
      return { icon: '➕', label: 'added' };
  }
}

export function RecentlyAddedList({
  words,
  limit = 5,
  onWordPress,
  loading = false,
}: RecentlyAddedListProps) {
  // Sort by addedAt descending and take limit
  const recentWords = useMemo(() => {
    return [...words]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, limit);
  }, [words, limit]);

  // Calculate stats for header
  const wordsThisWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return words.filter(w => new Date(w.addedAt) >= oneWeekAgo).length;
  }, [words]);

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

  // Don't show if no words
  if (recentWords.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(300).springify()} style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>📅 Recently Added</Text>
        {wordsThisWeek > 0 && (
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>+{wordsThisWeek} this week</Text>
          </View>
        )}
      </View>

      {/* Words List */}
      <View style={styles.card}>
        {recentWords.map((word, index) => {
          const sourceInfo = getSourceInfo(word.source);
          return (
            <TouchableOpacity
              key={word.id}
              style={[styles.wordRow, index === recentWords.length - 1 && styles.lastRow]}
              onPress={() => onWordPress?.(word)}
              activeOpacity={0.7}
              accessibilityLabel={`${word.word} - added ${getRelativeTime(word.addedAt)}`}
              accessibilityRole="button"
              accessibilityHint={`Added ${sourceInfo.label}. Tap for details.`}
            >
              {/* Source Icon */}
              <View style={styles.sourceIcon}>
                <Text style={styles.sourceEmoji}>{sourceInfo.icon}</Text>
              </View>

              {/* Word Info */}
              <View style={styles.wordInfo}>
                <Text style={styles.word}>{word.word}</Text>
                <Text style={styles.meta}>
                  {getRelativeTime(word.addedAt)} · {sourceInfo.label}
                </Text>
              </View>

              {/* Arrow */}
              <Icon name="chevron-forward" size="sm" color="tertiary" />
            </TouchableOpacity>
          );
        })}
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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  weekBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  weekBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.DEFAULT,
  },
  loadingTitle: {
    width: 140,
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
    height: 60,
    backgroundColor: colors.background.elevated,
    marginBottom: 1,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  sourceIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sourceEmoji: {
    fontSize: 18,
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
  meta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

export default RecentlyAddedList;
