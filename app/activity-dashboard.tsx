/**
 * Activity Dashboard — Revolut-Inspired Study Heatmap & Charts.
 *
 * Layout (top to bottom):
 * 1. Header (back button + "Activity" title)
 * 2. ReviewCards (To Review + Mastered)
 * 3. RetentionChart (score trend)
 * 4. ActivityHeatmap (90-day grid)
 * 5. StatStrip (Total Days / Total Time / Best Streak)
 *
 * No guilt, no streaks emphasis — honest, informative, professional.
 */

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { useActivityData } from '@/hooks/useActivityData';
import { useUserMetrics } from '@/hooks/useUserMetrics';
import { ActivityHeatmap } from '@/components/activity/ActivityHeatmap';
import { RetentionChart } from '@/components/activity/RetentionChart';
import { StatStrip } from '@/components/activity/StatStrip';
import { ReviewCards } from '@/components/activity/ReviewCards';

export default function ActivityDashboardScreen() {
  const router = useRouter();
  const { data, loading } = useActivityData();
  const { metrics } = useUserMetrics();

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Review Cards */}
            <Animated.View entering={FadeInDown.duration(350).delay(50)}>
              <ReviewCards
                dueFlashcards={data.dueFlashcards}
                totalVocab={metrics.totalVocab}
              />
            </Animated.View>

            {/* Retention Chart */}
            <Animated.View entering={FadeInDown.duration(350).delay(100)} style={styles.section}>
              <View style={styles.card}>
                <RetentionChart weeklyScores={data.summary.weeklyScores} />
              </View>
            </Animated.View>

            {/* Heatmap */}
            <Animated.View entering={FadeInDown.duration(350).delay(150)} style={styles.section}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>90-Day Activity</Text>
                <ActivityHeatmap days={data.summary.days} />
              </View>
            </Animated.View>

            {/* Stat Strip */}
            <Animated.View entering={FadeInDown.duration(350).delay(200)} style={styles.section}>
              <StatStrip
                totalDays={data.summary.totalDays}
                totalTimeSeconds={data.summary.totalTimeSeconds}
                bestStreak={data.summary.bestStreak}
              />
            </Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.overlay.light5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
});
