import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/designSystem';
import { BankWord } from '../../types/vocabulary';
import { PriorityBadge } from './PriorityBadge';

interface WordDetailPopupProps {
  word: BankWord | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (word: BankWord) => void;
}

export function WordDetailPopup({
  word,
  visible,
  onClose,
  onDelete,
  onEdit,
}: WordDetailPopupProps) {
  if (!word) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const getMasteryBarColor = (score: number) => {
    if (score >= 75) return colors.success.DEFAULT;
    if (score >= 50) return colors.warning.DEFAULT;
    return colors.error.DEFAULT;
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Word Header */}
            <View style={styles.header}>
              <Text style={styles.word}>{word.word}</Text>
              {word.phonetic && (
                <View style={styles.phoneticContainer}>
                  <Text style={styles.phonetic}>{word.phonetic}</Text>
                  <Text style={styles.speaker}>🔊</Text>
                </View>
              )}
              <Text style={styles.translation}>"{word.translation}"</Text>
            </View>

            {/* Priority Badge */}
            <View style={styles.priorityContainer}>
              <PriorityBadge priority={word.priority} size="lg" />
            </View>

            {/* Info Section */}
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Level</Text>
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
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Category</Text>
                  <Text style={styles.infoValue}>{word.category}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItemFull}>
                  <Text style={styles.infoLabel}>Part of Speech</Text>
                  <Text style={styles.infoValue}>{word.partOfSpeech}</Text>
                </View>
              </View>
            </View>

            {/* Stats Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📊</Text>
                <Text style={styles.sectionTitle}>Learning Stats</Text>
              </View>

              <View style={styles.statsCard}>
                {/* Mastery Progress Bar */}
                <View style={styles.masteryContainer}>
                  <View style={styles.masteryHeader}>
                    <Text style={styles.masteryLabel}>Mastery</Text>
                    <Text style={styles.masteryPercentage}>{word.masteryScore}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${word.masteryScore}%`,
                          backgroundColor: getMasteryBarColor(word.masteryScore),
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{word.timesCorrect}</Text>
                    <Text style={styles.statLabel}>Correct</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{word.timesIncorrect}</Text>
                    <Text style={styles.statLabel}>Incorrect</Text>
                  </View>
                </View>

                <View style={styles.reviewDate}>
                  <Text style={styles.reviewLabel}>Next Review</Text>
                  <Text style={styles.reviewValue}>{formatDate(word.nextReviewDate)}</Text>
                </View>
              </View>
            </View>

            {/* Example Sentences */}
            {word.exampleSentences.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>📝</Text>
                  <Text style={styles.sectionTitle}>
                    {word.exampleSentences.length === 1 ? 'Example' : 'Examples'}
                  </Text>
                </View>
                {word.exampleSentences.map((sentence, index) => (
                  <View key={index} style={styles.exampleCard}>
                    <Text style={styles.exampleText}>"{sentence}"</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Source */}
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceLabel}>Source:</Text>
              <Text style={styles.sourceValue}>{word.source}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {onEdit && (
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => onEdit(word)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => onDelete(word.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  word: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  phoneticContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  speaker: {
    fontSize: 18,
  },
  translation: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  priorityContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoItem: {
    flex: 1,
  },
  infoItemFull: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: '600',
  },
  cefrBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cefrText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  masteryContainer: {
    marginBottom: spacing.lg,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  masteryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  masteryPercentage: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.background.elevated,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  reviewDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  reviewLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  reviewValue: {
    fontSize: typography.fontSize.base,
    color: colors.primary.light,
    fontWeight: '700',
  },
  exampleCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.DEFAULT,
  },
  exampleText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  sourceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  sourceValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  editButton: {
    backgroundColor: colors.primary.DEFAULT,
  },
  editButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.text.primary,
  },
  deleteButton: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.error.DEFAULT,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.error.DEFAULT,
  },
});
