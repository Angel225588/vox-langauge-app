import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';
import { VocabularyCategory } from '@/types/vocabulary';
import { VocabularyHaptics } from '@/lib/utils/haptics';

interface CategoryGridProps {
  categories: VocabularyCategory[];
  onCategoryPress: (categoryName: string) => void;
  loading?: boolean;
}

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  general: '📚',
  greetings: '👋',
  food: '🍽️',
  travel: '✈️',
  business: '💼',
  family: '👨‍👩‍👧',
  emotions: '😊',
  weather: '🌤️',
  colors: '🎨',
  numbers: '🔢',
  animals: '🐾',
  default: '📖',
};

const CATEGORY_GRADIENTS: Record<number, string[]> = {
  0: colors.gradients.primary,      // Indigo to purple
  1: colors.gradients.secondary,    // Teal to turquoise
  2: colors.gradients.accent,       // Pink
  3: colors.gradients.warning,      // Amber
  4: ['#8B5CF6', '#EC4899'],       // Purple to pink
  5: ['#06B6D4', '#3B82F6'],       // Cyan to blue
  6: ['#F59E0B', '#F97316'],       // Amber to orange
  7: ['#10B981', '#06D6A0'],       // Green to teal
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function CategoryGrid({ categories, onCategoryPress, loading = false }: CategoryGridProps) {
  // Handle category press with haptic feedback
  const handleCategoryPress = useCallback((categoryName: string) => {
    VocabularyHaptics.categoryPressed();
    onCategoryPress(categoryName);
  }, [onCategoryPress]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyTitle}>No categories yet</Text>
        <Text style={styles.emptySubtitle}>Add words to create your first category</Text>
      </View>
    );
  }

  const getCategoryEmoji = (categoryName: string, customEmoji?: string): string => {
    if (customEmoji) return customEmoji;
    const normalizedName = categoryName.toLowerCase();
    return CATEGORY_EMOJI_MAP[normalizedName] || CATEGORY_EMOJI_MAP.default;
  };

  const getCategoryGradient = (index: number): string[] => {
    return CATEGORY_GRADIENTS[index % Object.keys(CATEGORY_GRADIENTS).length] || colors.gradients.primary;
  };

  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 80) return colors.success.DEFAULT;
    if (mastery >= 60) return colors.warning.DEFAULT;
    if (mastery >= 40) return colors.accent.orange;
    return colors.error.DEFAULT;
  };

  return (
    <View style={styles.grid}>
      {categories.map((category, index) => {
        const gradient = getCategoryGradient(index);
        const emoji = getCategoryEmoji(category.name, category.emoji);
        const masteryColor = getMasteryColor(category.averageMastery);

        return (
          <AnimatedTouchableOpacity
            key={category.name}
            entering={FadeInUp.delay(index * 100).springify()}
            style={styles.cardContainer}
            onPress={() => handleCategoryPress(category.name)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[...gradient, `${gradient[1]}dd`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              {/* Glassmorphic overlay */}
              <View style={styles.glassOverlay}>
                {/* Category emoji and name */}
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryEmoji}>{emoji}</Text>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {category.name}
                  </Text>
                </View>

                {/* Word count */}
                <View style={styles.statsContainer}>
                  <Text style={styles.wordCount}>
                    {category.wordCount} {category.wordCount === 1 ? 'word' : 'words'}
                  </Text>
                </View>

                {/* Progress indicator */}
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(category.averageMastery, 100)}%`,
                          backgroundColor: masteryColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.masteryText}>{Math.round(category.averageMastery)}% mastery</Text>
                </View>
              </View>
            </LinearGradient>
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.md,
  },
  cardContainer: {
    width: '48%',  // Slightly less than 50% to account for gap
    aspectRatio: 1,
    ...shadows.md,
  },
  gradientCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  glassOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  categoryHeader: {
    gap: spacing.sm,
  },
  categoryEmoji: {
    fontSize: 40,
    lineHeight: 44,
  },
  categoryName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    marginTop: spacing.sm,
  },
  wordCount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressSection: {
    gap: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  masteryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
