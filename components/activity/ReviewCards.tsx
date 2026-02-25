/**
 * ReviewCards — Two side-by-side top cards: "To Review" + "Mastered".
 *
 * "To Review" = FSRS due count, tappable → vocabulary dashboard.
 * "Mastered"  = total vocab learned from useUserMetrics.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

interface Props {
  dueFlashcards: number;
  totalVocab: number;
}

export function ReviewCards({ dueFlashcards, totalVocab }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* To Review */}
      <TouchableOpacity
        style={[styles.card, styles.cardReview]}
        activeOpacity={0.7}
        onPress={() => router.push('/vocabulary-dashboard' as any)}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.overlay.warning10 }]}>
          <Ionicons name="refresh-outline" size={20} color={colors.warning.DEFAULT} />
        </View>
        <Text style={styles.cardValue}>{dueFlashcards}</Text>
        <Text style={styles.cardLabel}>To Review</Text>
      </TouchableOpacity>

      {/* Mastered */}
      <TouchableOpacity
        style={[styles.card, styles.cardMastered]}
        activeOpacity={0.7}
        onPress={() => router.push('/vocabulary-dashboard' as any)}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.overlay.success10 }]}>
          <Ionicons name="checkmark-done-outline" size={20} color={colors.success.DEFAULT} />
        </View>
        <Text style={styles.cardValue}>{totalVocab}</Text>
        <Text style={styles.cardLabel}>Mastered</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.overlay.light5,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    padding: spacing.md,
    gap: 6,
  },
  cardReview: {
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  cardMastered: {
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  cardLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
