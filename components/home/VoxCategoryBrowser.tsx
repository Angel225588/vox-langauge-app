/**
 * VoxCategoryBrowser — Browse and add Vox Library categories.
 *
 * Displays available vocabulary categories in a scrollable grid.
 * Each card shows category info with an "Add to my Vox" toggle.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  neomorphism,
} from '@/constants/designSystem';
import { Icon } from '@/components/ui/Icon';
import type { CategoryInfo } from '@/types/voxLibrary';

interface VoxCategoryBrowserProps {
  /** Available categories from the Vox Library */
  availableCategories: CategoryInfo[];
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Check if a category is already in the user's Vox */
  isInVox: (slug: string) => boolean;
  /** Add a category to user's Vox */
  onAdd: (slug: string, label: string) => void;
  /** Remove a category from user's Vox */
  onRemove: (slug: string) => void;
}

const CONTEXT_LABELS: Record<string, { label: string; icon: string }> = {
  business: { label: 'Business', icon: 'briefcase-outline' },
  social: { label: 'Social', icon: 'people-outline' },
  daily_life: { label: 'Daily Life', icon: 'home-outline' },
  travel: { label: 'Travel', icon: 'airplane-outline' },
  professional: { label: 'Professional', icon: 'build-outline' },
  emergency: { label: 'Emergency', icon: 'alert-circle-outline' },
  universal: { label: 'Universal', icon: 'globe-outline' },
  'field-specific': { label: 'Specialized', icon: 'school-outline' },
  survival: { label: 'Survival', icon: 'shield-checkmark-outline' },
};

const CATEGORY_GRADIENTS: readonly (readonly [string, string])[] = [
  colors.gradients.primary,
  colors.gradients.secondary,
  colors.gradients.accent,
  colors.gradients.warning,
  ['#00A3FF', '#EC4899'] as const,
  ['#06B6D4', '#3B82F6'] as const,
] as const;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function getCategoryMeta(category: string) {
  return CONTEXT_LABELS[category] ?? { label: category.replace(/_/g, ' '), icon: 'grid-outline' };
}

export function VoxCategoryBrowser({
  availableCategories,
  isLoading,
  isInVox,
  onAdd,
  onRemove,
}: VoxCategoryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return availableCategories;
    const q = searchQuery.toLowerCase();
    return availableCategories.filter((c) => {
      const meta = getCategoryMeta(c.category);
      return (
        c.category.toLowerCase().includes(q) ||
        meta.label.toLowerCase().includes(q)
      );
    });
  }, [availableCategories, searchQuery]);

  const handleToggle = useCallback(
    (category: string) => {
      const meta = getCategoryMeta(category);
      if (isInVox(category)) {
        onRemove(category);
      } else {
        onAdd(category, meta.label);
      }
    },
    [isInVox, onAdd, onRemove]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.sectionTitle}>Browse Library</Text>
      <Text style={styles.sectionSubtitle}>
        Add categories to personalize your learning path
      </Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size="md" color="tertiary" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor={colors.text.disabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size="md" color="tertiary" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Grid */}
      {filteredCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories found</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredCategories.map((cat, index) => {
            const meta = getCategoryMeta(cat.category);
            const inVox = isInVox(cat.category);
            const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];

            return (
              <AnimatedTouchableOpacity
                key={cat.category}
                entering={FadeInUp.delay(index * 80).springify()}
                style={styles.cardWrapper}
                onPress={() => handleToggle(cat.category)}
                activeOpacity={0.85}
              >
                <View style={[styles.card, inVox && styles.cardActive]}>
                  {/* Category icon with gradient accent */}
                  <LinearGradient
                    colors={[...(gradient as unknown as [string, string])]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconBadge}
                  >
                    <Icon name={meta.icon as any} size="lg" color="white" />
                  </LinearGradient>

                  {/* Category info */}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {meta.label}
                    </Text>
                    <View style={styles.statsRow}>
                      {cat.scenario_count > 0 && (
                        <Text style={styles.statText}>
                          {cat.scenario_count} {cat.scenario_count === 1 ? 'scenario' : 'scenarios'}
                        </Text>
                      )}
                      {cat.scenario_count > 0 && cat.vocab_count > 0 && (
                        <Text style={styles.statDot}> -- </Text>
                      )}
                      {cat.vocab_count > 0 && (
                        <Text style={styles.statText}>
                          {cat.vocab_count} words
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Add/Added toggle */}
                  <View style={[styles.toggleButton, inVox && styles.toggleButtonActive]}>
                    {inVox ? (
                      <Icon name="checkmark" size="sm" color="white" />
                    ) : (
                      <Icon name="add" size="sm" color="primary" />
                    )}
                  </View>
                </View>
              </AnimatedTouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: neomorphism.input.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: neomorphism.input.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: neomorphism.input.text,
    padding: 0,
  },
  grid: {
    gap: spacing.sm,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    gap: spacing.md,
  },
  cardActive: {
    borderColor: colors.overlay.primary15,
    backgroundColor: 'rgba(0, 54, 255, 0.05)',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  statDot: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
});

export default VoxCategoryBrowser;
