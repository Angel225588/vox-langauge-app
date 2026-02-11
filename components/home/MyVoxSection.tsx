/**
 * MyVoxSection — Displays the user's saved Vox categories on the home screen.
 *
 * Shows compact chips for each category the user has added. Swipe-to-remove
 * support and an empty state prompting discovery.
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from '@/constants/designSystem';
import { Icon } from '@/components/ui/Icon';
import type { UserVoxCategory } from '@/types/voxLibrary';

interface MyVoxSectionProps {
  /** User's saved categories */
  categories: UserVoxCategory[];
  /** Whether data is still loading */
  isLoading: boolean;
  /** Called when user taps a category chip */
  onCategoryPress?: (category: UserVoxCategory) => void;
  /** Called when user removes a category */
  onRemove: (slug: string) => void;
  /** Called when user taps "Browse" to add more */
  onBrowse?: () => void;
}

const CHIP_COLORS: readonly string[] = [
  colors.primary.DEFAULT,
  colors.secondary.DEFAULT,
  colors.accent.purple,
  colors.accent.cyan,
  colors.accent.pink,
  colors.accent.orange,
];

export function MyVoxSection({
  categories,
  isLoading,
  onCategoryPress,
  onRemove,
  onBrowse,
}: MyVoxSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>My Vox</Text>
        </View>
        {/* Loading skeleton chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonChip} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>My Vox</Text>
        </View>
        <TouchableOpacity
          style={styles.emptyState}
          onPress={onBrowse}
          activeOpacity={0.85}
        >
          <View style={styles.emptyIconContainer}>
            <Icon name="add-circle-outline" size="xl" color="primary" />
          </View>
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>Add categories to personalize your learning</Text>
            <Text style={styles.emptySubtitle}>Browse the library to get started</Text>
          </View>
          <Icon name="chevron-forward" size="md" color="tertiary" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with browse button */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>My Vox</Text>
        {onBrowse && (
          <TouchableOpacity onPress={onBrowse} style={styles.browseButton}>
            <Text style={styles.browseText}>Browse</Text>
            <Icon name="chevron-forward" size="sm" color="primary" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat, index) => {
          const chipColor = CHIP_COLORS[index % CHIP_COLORS.length];

          return (
            <Animated.View
              key={cat.category_slug}
              entering={FadeInRight.delay(index * 60)}
              exiting={FadeOutLeft}
              layout={Layout.springify()}
            >
              <TouchableOpacity
                style={styles.chip}
                onPress={() => onCategoryPress?.(cat)}
                onLongPress={() => onRemove(cat.category_slug)}
                activeOpacity={0.85}
                accessibilityLabel={`${cat.category_label}. Long press to remove.`}
                accessibilityRole="button"
              >
                {/* Accent dot */}
                <View style={[styles.chipDot, { backgroundColor: chipColor }]} />

                <Text style={styles.chipLabel} numberOfLines={1}>
                  {cat.category_label}
                </Text>

                {/* Remove button */}
                <TouchableOpacity
                  onPress={() => onRemove(cat.category_slug)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.removeButton}
                >
                  <Icon name="close" size="sm" color="tertiary" />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Add more chip */}
        {onBrowse && (
          <TouchableOpacity
            style={styles.addChip}
            onPress={onBrowse}
            activeOpacity={0.85}
          >
            <Icon name="add" size="sm" color="primary" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  browseText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.light,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    gap: spacing.sm,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  chipLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    maxWidth: 120,
  },
  removeButton: {
    padding: 2,
  },
  addChip: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty state
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    gap: spacing.md,
  },
  emptyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.overlay.primary10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextContainer: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  // Loading skeleton
  skeletonChip: {
    width: 100,
    height: 36,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.elevated,
    marginRight: spacing.sm,
  },
});

export default MyVoxSection;
