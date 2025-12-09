/**
 * CorrectionCard - Individual Grammar/Style Correction
 *
 * Displays a single correction with:
 * - Error type badge (grammar, spelling, vocabulary, style)
 * - Original text vs corrected text
 * - Clear explanation
 * - Accept button (animated)
 *
 * Design: Clean, educational, non-judgmental
 */

import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type { GrammarCorrection, CorrectionType } from './types';

interface CorrectionCardProps {
  correction: GrammarCorrection;
  index: number;
  onAccept?: (correction: GrammarCorrection) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const CORRECTION_COLORS: Record<CorrectionType, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  grammar: {
    bg: `${colors.error.DEFAULT}15`,
    text: colors.error.DEFAULT,
    icon: 'school-outline',
  },
  spelling: {
    bg: `${colors.warning.DEFAULT}15`,
    text: colors.warning.DEFAULT,
    icon: 'text-outline',
  },
  vocabulary: {
    bg: `${colors.primary.DEFAULT}15`,
    text: colors.primary.DEFAULT,
    icon: 'book-outline',
  },
  style: {
    bg: `${colors.accent.purple}15`,
    text: colors.accent.purple,
    icon: 'brush-outline',
  },
  punctuation: {
    bg: `${colors.secondary.DEFAULT}15`,
    text: colors.secondary.DEFAULT,
    icon: 'ellipsis-horizontal-outline',
  },
};

const CORRECTION_LABELS: Record<CorrectionType, string> = {
  grammar: 'Grammar',
  spelling: 'Spelling',
  vocabulary: 'Vocabulary',
  style: 'Style',
  punctuation: 'Punctuation',
};

export function CorrectionCard({
  correction,
  index,
  onAccept,
  isExpanded = true,
  onToggleExpand,
}: CorrectionCardProps) {
  const haptics = useHaptics();
  const [isAccepted, setIsAccepted] = useState(false);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const typeConfig = CORRECTION_COLORS[correction.type];

  const handleAccept = useCallback(() => {
    haptics.success();
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    setIsAccepted(true);
    onAccept?.(correction);
  }, [haptics, correction, onAccept]);

  const handleToggle = useCallback(() => {
    haptics.light();
    onToggleExpand?.();
  }, [haptics, onToggleExpand]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(index * 150)}
      style={[styles.container, cardStyle]}
    >
      {/* Header - Always visible */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleToggle}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          {/* Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg }]}>
            <Ionicons name={typeConfig.icon} size={14} color={typeConfig.text} />
            <Text style={[styles.typeText, { color: typeConfig.text }]}>
              {CORRECTION_LABELS[correction.type]}
            </Text>
          </View>

          {/* Correction Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.originalPreview} numberOfLines={1}>
              {correction.original}
            </Text>
            <Ionicons name="arrow-forward" size={12} color={colors.text.disabled} />
            <Text style={styles.correctedPreview} numberOfLines={1}>
              {correction.corrected}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isAccepted && (
            <View style={styles.acceptedBadge}>
              <Ionicons name="checkmark" size={14} color={colors.success.DEFAULT} />
            </View>
          )}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text.tertiary}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.content}
        >
          {/* Before / After */}
          <View style={styles.comparisonSection}>
            <View style={styles.comparisonItem}>
              <View style={styles.comparisonLabel}>
                <View style={[styles.labelDot, { backgroundColor: colors.error.DEFAULT }]} />
                <Text style={styles.labelText}>Original</Text>
              </View>
              <View style={styles.comparisonBox}>
                <Text style={styles.originalText}>{correction.original}</Text>
              </View>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-down" size={16} color={colors.text.disabled} />
            </View>

            <View style={styles.comparisonItem}>
              <View style={styles.comparisonLabel}>
                <View style={[styles.labelDot, { backgroundColor: colors.success.DEFAULT }]} />
                <Text style={styles.labelText}>Corrected</Text>
              </View>
              <View style={[styles.comparisonBox, styles.correctedBox]}>
                <Text style={styles.correctedText}>{correction.corrected}</Text>
              </View>
            </View>
          </View>

          {/* Explanation */}
          <View style={styles.explanationSection}>
            <Ionicons name="bulb-outline" size={16} color={colors.warning.DEFAULT} />
            <Text style={styles.explanationText}>{correction.explanation}</Text>
          </View>

          {/* Grammar Rule (if available) */}
          {correction.rule && (
            <View style={styles.ruleSection}>
              <Ionicons name="school-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.ruleText}>{correction.rule}</Text>
            </View>
          )}

          {/* Accept Button */}
          {!isAccepted && onAccept && (
            <TouchableOpacity
              onPress={handleAccept}
              style={styles.acceptButton}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.success.DEFAULT} />
              <Text style={styles.acceptButtonText}>Got it</Text>
            </TouchableOpacity>
          )}

          {isAccepted && (
            <View style={styles.acceptedMessage}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success.DEFAULT} />
              <Text style={styles.acceptedText}>Noted for your learning</Text>
            </View>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  originalPreview: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
    maxWidth: 100,
  },
  correctedPreview: {
    fontSize: typography.fontSize.sm,
    color: colors.success.DEFAULT,
    fontWeight: typography.fontWeight.medium,
    maxWidth: 100,
  },
  acceptedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.success.DEFAULT}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
  },
  comparisonSection: {
    gap: spacing.sm,
  },
  comparisonItem: {
    gap: spacing.xs,
  },
  comparisonLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonBox: {
    backgroundColor: colors.background.elevated,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  correctedBox: {
    borderColor: `${colors.success.DEFAULT}30`,
    backgroundColor: `${colors.success.DEFAULT}08`,
  },
  originalText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  correctedText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  explanationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.warning.DEFAULT}08`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  explanationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  ruleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  ruleText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.success.DEFAULT}15`,
    borderWidth: 1,
    borderColor: `${colors.success.DEFAULT}30`,
  },
  acceptButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.DEFAULT,
  },
  acceptedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  acceptedText: {
    fontSize: typography.fontSize.sm,
    color: colors.success.DEFAULT,
    fontStyle: 'italic',
  },
});
