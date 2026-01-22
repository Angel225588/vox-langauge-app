/**
 * ProgressBreakdown - Word Progress Categories
 *
 * Shows vocabulary breakdown in human-friendly categories:
 * - Strong (mastery > 70%): Words user knows well
 * - Learning (30-70%): Words in progress
 * - New (< 30%): Words just added or struggling with
 *
 * Design: Three subtle cards with colored accents, no loud gradients.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { BankWord } from '@/lib/word-bank';

interface ProgressBreakdownProps {
  /** All words from the word bank */
  words: BankWord[];
  /** Callback when a category is pressed */
  onCategoryPress?: (category: 'strong' | 'learning' | 'new') => void;
  /** Loading state */
  loading?: boolean;
}

interface CategoryData {
  key: 'strong' | 'learning' | 'new';
  label: string;
  emoji: string;
  count: number;
  color: string;
  bgColor: string;
}

export function ProgressBreakdown({ words, onCategoryPress, loading = false }: ProgressBreakdownProps) {
  // Calculate counts based on mastery score
  const strongCount = words.filter(w => w.masteryScore > 70).length;
  const learningCount = words.filter(w => w.masteryScore >= 30 && w.masteryScore <= 70).length;
  const newCount = words.filter(w => w.masteryScore < 30).length;

  const categories: CategoryData[] = [
    {
      key: 'strong',
      label: 'Strong',
      emoji: '💪',
      count: strongCount,
      color: colors.success.DEFAULT,
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      key: 'learning',
      label: 'Learning',
      emoji: '📚',
      count: learningCount,
      color: colors.warning.DEFAULT,
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      key: 'new',
      label: 'New',
      emoji: '🌱',
      count: newCount,
      color: colors.primary.light,
      bgColor: 'rgba(99, 102, 241, 0.1)',
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.loadingTitle} />
        </View>
        <View style={styles.cardsContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.card, styles.loadingCard]} />
          ))}
        </View>
      </View>
    );
  }

  const totalWords = words.length;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100).springify()} style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>📈 Your Progress</Text>
        <Text style={styles.totalCount}>{totalWords} total</Text>
      </View>

      {/* Three Category Cards */}
      <View style={styles.cardsContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.key}
            style={[styles.card, { backgroundColor: category.bgColor }]}
            onPress={() => onCategoryPress?.(category.key)}
            activeOpacity={0.7}
            accessibilityLabel={`${category.label}: ${category.count} words`}
            accessibilityRole="button"
            accessibilityHint={`Filter to show ${category.label.toLowerCase()} words`}
          >
            <Text style={styles.emoji}>{category.emoji}</Text>
            <Text style={[styles.count, { color: category.color }]}>
              {category.count}
            </Text>
            <Text style={styles.label}>{category.label}</Text>

            {/* Progress bar showing percentage of total */}
            {totalWords > 0 && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: category.color,
                      width: `${Math.round((category.count / totalWords) * 100)}%`,
                    },
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
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
  totalCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  loadingTitle: {
    width: 120,
    height: 20,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  loadingCard: {
    height: 120,
    backgroundColor: colors.background.card,
  },
  emoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  count: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

export default ProgressBreakdown;
