import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/designSystem';
import { BankWord } from '../../types/vocabulary';
import { PriorityBadge } from './PriorityBadge';

interface WordCardProps {
  word: BankWord;
  onPress: () => void;
}

export function WordCard({ word, onPress }: WordCardProps) {
  const getMasteryEmoji = (score: number) => {
    if (score >= 90) return '🏆';
    if (score >= 75) return '💪';
    if (score >= 50) return '👍';
    if (score >= 25) return '📚';
    return '🌱';
  };

  const getCefrColor = (level: string) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return colors.success.DEFAULT;
      case 'B1':
      case 'B2':
        return colors.warning.DEFAULT;
      case 'C1':
      case 'C2':
        return colors.error.DEFAULT;
      default:
        return colors.text.tertiary;
    }
  };

  const shouldGlow = word.priority >= 8;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        shouldGlow && {
          ...shadows.glow.error,
          borderColor: colors.error.DEFAULT,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <PriorityBadge priority={word.priority} size="sm" />
          <View style={styles.wordSection}>
            <Text style={styles.word}>{word.word}</Text>
            <Text style={styles.translation}>{word.translation}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View
            style={[
              styles.cefrBadge,
              { backgroundColor: `${getCefrColor(word.cefrLevel)}20` },
            ]}
          >
            <Text style={[styles.cefrText, { color: getCefrColor(word.cefrLevel) }]}>
              {word.cefrLevel}
            </Text>
          </View>
          <Text style={styles.masteryEmoji}>{getMasteryEmoji(word.masteryScore)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {word.category} · {word.masteryScore}% mastery
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  wordSection: {
    flex: 1,
  },
  word: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  translation: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cefrBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cefrText: {
    fontSize: 12,
    fontWeight: '700',
  },
  masteryEmoji: {
    fontSize: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
});
