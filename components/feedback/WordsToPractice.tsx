/**
 * WordsToPractice Component
 *
 * Displays words that need practice with severity indicators
 * and option to add them to word bank.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// =============================================================================
// Types
// =============================================================================

export type WordSeverity = 'minor' | 'moderate' | 'major';

export interface WordToPractice {
  /** The word that needs practice */
  word: string;
  /** Description of the issue */
  issue: string;
  /** How severe the pronunciation issue was */
  severity: WordSeverity;
  /** Optional phonetic representation */
  phonetic?: string;
}

export interface WordsToPracticeProps {
  /** Array of words to practice */
  words: WordToPractice[];
  /** Callback when user wants to add words to word bank */
  onAddToWordBank?: (words: WordToPractice[]) => void;
  /** Whether add button is loading */
  loading?: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

export function getSeverityColor(severity: WordSeverity): string {
  switch (severity) {
    case 'minor':
      return colors.warning.DEFAULT; // Amber
    case 'moderate':
      return '#F97316'; // Orange
    case 'major':
      return colors.error.DEFAULT; // Red
  }
}

export function getSeverityLabel(severity: WordSeverity): string {
  switch (severity) {
    case 'minor':
      return 'Minor';
    case 'moderate':
      return 'Moderate';
    case 'major':
      return 'Needs Work';
  }
}

// =============================================================================
// Component
// =============================================================================

export const WordsToPractice: React.FC<WordsToPracticeProps> = ({
  words,
  onAddToWordBank,
  loading = false,
}) => {
  if (words.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎉</Text>
        <Text style={styles.emptyText}>Great pronunciation!</Text>
        <Text style={styles.emptySubtext}>No words flagged for practice</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {words.map((item, index) => (
        <View
          key={`${item.word}-${index}`}
          style={[
            styles.wordRow,
            index < words.length - 1 && styles.wordRowBorder,
          ]}
        >
          <View style={styles.wordInfo}>
            <View style={styles.wordHeader}>
              <Text style={styles.word}>{item.word}</Text>
              {item.phonetic && (
                <Text style={styles.phonetic}>/{item.phonetic}/</Text>
              )}
            </View>
            <Text style={styles.issue}>{item.issue}</Text>
          </View>
          <View style={styles.severityContainer}>
            <View
              style={[
                styles.severityDot,
                { backgroundColor: getSeverityColor(item.severity) },
              ]}
            />
            <Text
              style={[
                styles.severityLabel,
                { color: getSeverityColor(item.severity) },
              ]}
            >
              {getSeverityLabel(item.severity)}
            </Text>
          </View>
        </View>
      ))}

      {onAddToWordBank && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddToWordBank(words)}
          disabled={loading}
          activeOpacity={0.7}
          accessibilityLabel={`Add ${words.length} words to your practice word bank`}
          accessibilityHint="These words will appear in your vocabulary practice sessions"
        >
          <Ionicons
            name={loading ? 'hourglass' : 'add-circle'}
            size={20}
            color={colors.secondary.DEFAULT}
          />
          <Text style={styles.addButtonText}>
            {loading ? 'Adding...' : `Add ${words.length > 1 ? 'All ' : ''}to Word Bank`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  wordRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background.elevated,
  },
  wordInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  word: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  phonetic: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  issue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  severityContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  severityLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(6, 214, 160, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 214, 160, 0.3)',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.secondary.DEFAULT,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});

export default WordsToPractice;
