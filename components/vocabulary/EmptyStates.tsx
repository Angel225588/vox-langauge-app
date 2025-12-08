/**
 * Vox Language App - Empty State Components
 * Premium empty state components for vocabulary system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

interface EmptyStateProps {
  onAction?: () => void;
  actionLabel?: string;
}

/**
 * Empty state for when no words have been added to the word bank
 */
export function EmptyWordBank({ onAction, actionLabel = 'Add Your First Word' }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInUp.springify()}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Emoji illustration */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>📚</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Start Your Journey</Text>

        {/* Description */}
        <Text style={styles.description}>
          Add your first word to begin building your vocabulary and mastering the language
        </Text>

        {/* Action button */}
        {onAction && (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.8}
            style={styles.buttonContainer}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>{actionLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Empty state for when search returns no results
 */
export function EmptySearchResults({ onAction, actionLabel = 'Clear Search' }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInUp.springify()}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Emoji illustration */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🔍</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>No Results Found</Text>

        {/* Description */}
        <Text style={styles.description}>
          Try a different search term or check your spelling
        </Text>

        {/* Action button */}
        {onAction && (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.8}
            style={styles.buttonContainer}
          >
            <View style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>{actionLabel}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Empty state for when a category has no words
 */
export function EmptyCategoryWords({ onAction, actionLabel = 'Add Words' }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInUp.springify()}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Emoji illustration */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>📂</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Category Empty</Text>

        {/* Description */}
        <Text style={styles.description}>
          Add words to this category to see them here and start learning
        </Text>

        {/* Action button */}
        {onAction && (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.8}
            style={styles.buttonContainer}
          >
            <LinearGradient
              colors={colors.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>{actionLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Empty state for when no words are due for review
 */
export function EmptyDueForReview({ onAction, actionLabel = 'Browse Vocabulary' }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInUp.springify()}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Emoji illustration with celebration effect */}
        <View style={[styles.emojiContainer, styles.celebrationContainer]}>
          <Text style={styles.emoji}>🎉</Text>
        </View>

        {/* Title with gradient text effect */}
        <LinearGradient
          colors={colors.gradients.success}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientTextContainer}
        >
          <Text style={styles.titleGradient}>All Caught Up!</Text>
        </LinearGradient>

        {/* Description */}
        <Text style={styles.description}>
          No words need review right now. Great job on staying consistent!
        </Text>

        {/* Success indicator */}
        <View style={styles.successIndicator}>
          <View style={styles.successDot} />
          <Text style={styles.successText}>You're on track</Text>
        </View>

        {/* Action button */}
        {onAction && (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.8}
            style={styles.buttonContainer}
          >
            <View style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>{actionLabel}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Generic empty state component for custom scenarios
 */
interface GenericEmptyStateProps extends EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
}

export function EmptyState({
  emoji,
  title,
  description,
  onAction,
  actionLabel = 'Take Action',
  variant = 'primary',
}: GenericEmptyStateProps) {
  const getGradient = () => {
    switch (variant) {
      case 'secondary':
        return colors.gradients.secondary;
      case 'success':
        return colors.gradients.success;
      default:
        return colors.gradients.primary;
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Emoji illustration */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Description */}
        <Text style={styles.description}>{description}</Text>

        {/* Action button */}
        {onAction && (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.8}
            style={styles.buttonContainer}
          >
            {variant === 'outline' ? (
              <View style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>{actionLabel}</Text>
              </View>
            ) : (
              <LinearGradient
                colors={getGradient()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>{actionLabel}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    minHeight: 400,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  emojiContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 72,
    lineHeight: 80,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: spacing.md,
  },
  gradientButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  outlineButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.medium,
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  celebrationContainer: {
    position: 'relative',
  },
  gradientTextContainer: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    marginBottom: spacing.md,
  },
  titleGradient: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  successIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.success.DEFAULT}20`,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.success.DEFAULT}40`,
  },
  successDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success.DEFAULT,
  },
  successText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success.light,
  },
});
