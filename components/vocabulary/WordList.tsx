/**
 * WordList Component
 *
 * Scrollable list of vocabulary words with swipe-to-delete,
 * loading states, and empty state handling.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BankWord } from '@/lib/word-bank';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';

// ============================================================================
// Props Interface
// ============================================================================

export interface WordListProps {
  /** Array of words to display */
  words: BankWord[];
  /** Loading state */
  loading?: boolean;
  /** Called when a word is pressed */
  onWordPress: (word: BankWord) => void;
  /** Called when user pulls to refresh */
  onRefresh?: () => void;
  /** Refreshing state */
  refreshing?: boolean;
  /** Called when a word is deleted */
  onDelete?: (id: string) => Promise<boolean>;
}

// ============================================================================
// Main Component
// ============================================================================

export default function WordList({
  words,
  loading = false,
  onWordPress,
  onRefresh,
  refreshing = false,
  onDelete,
}: WordListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle delete with confirmation
  const handleDelete = (word: BankWord) => {
    Alert.alert(
      'Delete Word',
      `Are you sure you want to delete "${word.word}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!onDelete) return;
            try {
              setDeletingId(word.id);
              const success = await onDelete(word.id);
              if (!success) {
                Alert.alert('Error', 'Failed to delete word');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete word');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // Loading skeleton
  if (loading && words.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading vocabulary...</Text>
      </View>
    );
  }

  // Empty state
  if (!loading && words.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyTitle}>No words yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to add your first word
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={words}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.duration(300).delay(index * 30).springify()}>
          <WordItem
            word={item}
            onPress={() => onWordPress(item)}
            onDelete={() => handleDelete(item)}
            isDeleting={deletingId === item.id}
          />
        </Animated.View>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        ) : undefined
      }
    />
  );
}

// ============================================================================
// Word Item Component
// ============================================================================

interface WordItemProps {
  word: BankWord;
  onPress: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function WordItem({ word, onPress, onDelete, isDeleting }: WordItemProps) {
  const masteryPercentage = Math.round(word.masteryScore);
  const priorityLevel = getPriorityLevel(word.priority);

  return (
    <TouchableOpacity
      style={styles.wordItem}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.8}
      disabled={isDeleting}
    >
      <View style={styles.wordItemContent}>
        {/* Left Section - Word & Translation */}
        <View style={styles.wordTextSection}>
          <Text style={styles.wordText} numberOfLines={1}>
            {word.word}
          </Text>
          <Text style={styles.translationText} numberOfLines={1}>
            {word.translation}
          </Text>
          <Text style={styles.categoryText}>{word.category}</Text>
        </View>

        {/* Right Section - Priority & Mastery */}
        <View style={styles.wordMetaSection}>
          {/* Priority Badge */}
          <PriorityBadge level={priorityLevel} priority={word.priority} />

          {/* Mastery Indicator */}
          <MasteryIndicator percentage={masteryPercentage} />
        </View>
      </View>

      {/* Delete Overlay */}
      {isDeleting && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator color={colors.text.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Priority Badge Component
// ============================================================================

interface PriorityBadgeProps {
  level: 'high' | 'medium' | 'low';
  priority: number;
}

function PriorityBadge({ level, priority }: PriorityBadgeProps) {
  const config = {
    high: {
      colors: colors.gradients.error,
      label: 'High',
    },
    medium: {
      colors: colors.gradients.warning,
      label: 'Med',
    },
    low: {
      colors: colors.gradients.secondary,
      label: 'Low',
    },
  };

  const { colors: gradientColors, label } = config[level];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.priorityBadge}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={styles.priorityBadgeText}>{label}</Text>
    </LinearGradient>
  );
}

// ============================================================================
// Mastery Indicator Component
// ============================================================================

interface MasteryIndicatorProps {
  percentage: number;
}

function MasteryIndicator({ percentage }: MasteryIndicatorProps) {
  const getMasteryColor = (pct: number) => {
    if (pct >= 70) return colors.success.DEFAULT;
    if (pct >= 40) return colors.warning.DEFAULT;
    return colors.error.DEFAULT;
  };

  const masteryColor = getMasteryColor(percentage);

  return (
    <View style={styles.masteryContainer}>
      <View style={styles.masteryBarBackground}>
        <View
          style={[
            styles.masteryBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: masteryColor,
            },
          ]}
        />
      </View>
      <Text style={styles.masteryText}>{percentage}%</Text>
    </View>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPriorityLevel(priority: number): 'high' | 'medium' | 'low' {
  if (priority >= 7) return 'high';
  if (priority >= 4) return 'medium';
  return 'low';
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // List Container
  listContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for FAB
  },

  // Center Container (Loading & Empty States)
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  // Loading
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },

  // Empty State
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
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Word Item
  wordItem: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    ...shadows.sm,
  },
  wordItemContent: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  wordTextSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  wordText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  translationText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },

  // Meta Section (Right side)
  wordMetaSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 80,
  },

  // Priority Badge
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  priorityBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Mastery Indicator
  masteryContainer: {
    alignItems: 'flex-end',
  },
  masteryBarBackground: {
    width: 60,
    height: 6,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: 4,
  },
  masteryBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  masteryText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },

  // Deleting Overlay
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
