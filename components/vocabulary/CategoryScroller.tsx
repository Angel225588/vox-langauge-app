/**
 * CategoryScroller - Horizontal Category Navigation
 *
 * Displays word categories in a horizontal scrollable list.
 * Tap to filter vocabulary by category.
 *
 * Design: Compact chips/pills that scroll horizontally.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { BankWord } from '@/lib/word-bank';

interface CategoryScrollerProps {
  /** All words from the word bank */
  words: BankWord[];
  /** Callback when a category is pressed */
  onCategoryPress?: (category: string) => void;
  /** Currently selected category */
  selectedCategory?: string | null;
  /** Loading state */
  loading?: boolean;
}

interface CategoryItem {
  name: string;
  emoji: string;
  count: number;
  avgMastery: number;
}

/**
 * Get emoji for category name
 */
function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    // Common categories
    food: '🍽️',
    travel: '✈️',
    work: '🏢',
    business: '💼',
    family: '👨‍👩‍👧‍👦',
    home: '🏠',
    health: '🏥',
    sports: '⚽',
    music: '🎵',
    technology: '💻',
    nature: '🌿',
    animals: '🐾',
    weather: '🌤️',
    clothing: '👔',
    shopping: '🛒',
    education: '🎓',
    emotions: '😊',
    colors: '🎨',
    numbers: '🔢',
    time: '⏰',
    greetings: '👋',
    verbs: '🏃',
    adjectives: '✨',
    general: '📝',
  };

  const lowerCategory = category.toLowerCase();
  return emojiMap[lowerCategory] || '📁';
}

export function CategoryScroller({
  words,
  onCategoryPress,
  selectedCategory,
  loading = false,
}: CategoryScrollerProps) {
  // Aggregate words into categories
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { count: number; totalMastery: number }>();

    words.forEach(word => {
      const cat = word.category || 'general';
      const existing = categoryMap.get(cat) || { count: 0, totalMastery: 0 };
      categoryMap.set(cat, {
        count: existing.count + 1,
        totalMastery: existing.totalMastery + word.masteryScore,
      });
    });

    const result: CategoryItem[] = [];
    categoryMap.forEach((data, name) => {
      result.push({
        name,
        emoji: getCategoryEmoji(name),
        count: data.count,
        avgMastery: data.count > 0 ? Math.round(data.totalMastery / data.count) : 0,
      });
    });

    // Sort by count descending
    return result.sort((a, b) => b.count - a.count);
  }, [words]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.loadingTitle} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.loadingChip} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // Don't show if no categories
  if (categories.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(400).springify()} style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>📁 By Category</Text>
        {selectedCategory && (
          <TouchableOpacity onPress={() => onCategoryPress?.(null as any)} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <TouchableOpacity
              key={category.name}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onCategoryPress?.(category.name)}
              activeOpacity={0.7}
              accessibilityLabel={`${category.name} category, ${category.count} words`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={`Average mastery: ${category.avgMastery}%`}
            >
              <Text style={styles.chipEmoji}>{category.emoji}</Text>
              <View style={styles.chipTextContainer}>
                <Text style={[styles.chipName, isSelected && styles.chipNameSelected]}>
                  {category.name}
                </Text>
                <Text style={[styles.chipCount, isSelected && styles.chipCountSelected]}>
                  {category.count} words
                </Text>
              </View>
              {/* Mastery indicator dot */}
              <View
                style={[
                  styles.masteryDot,
                  {
                    backgroundColor:
                      category.avgMastery > 70
                        ? colors.success.DEFAULT
                        : category.avgMastery > 40
                        ? colors.warning.DEFAULT
                        : colors.error.light,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.medium,
  },
  loadingTitle: {
    width: 100,
    height: 20,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing.sm,
    minHeight: 44,
  },
  chipSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: colors.primary.DEFAULT,
  },
  loadingChip: {
    width: 120,
    height: 56,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
  },
  chipEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  chipTextContainer: {
    marginRight: spacing.sm,
  },
  chipName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textTransform: 'capitalize',
    marginBottom: 1,
  },
  chipNameSelected: {
    color: colors.primary.light,
  },
  chipCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  chipCountSelected: {
    color: colors.primary.light,
    opacity: 0.8,
  },
  masteryDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
});

export default CategoryScroller;
