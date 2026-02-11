/**
 * Conversation History Screen
 *
 * Lists past voice conversation sessions with:
 * - Date, scenario, duration, score
 * - Tap to see full transcript + feedback
 * - Aggregate stats at top
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from '@/constants/designSystem';
import {
  getRecentSessions,
  getConversationStats,
} from '@/lib/db/conversations';
import type { StoredSession } from '@/lib/db/conversations';
import { supabase } from '@/lib/db/supabase';

// =============================================================================
// Stats Header
// =============================================================================

interface StatsProps {
  totalSessions: number;
  totalMinutes: number;
  avgScore: number;
}

const StatsHeader: React.FC<StatsProps> = ({ totalSessions, totalMinutes, avgScore }) => (
  <View style={styles.statsRow}>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{totalSessions}</Text>
      <Text style={styles.statLabel}>Sessions</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{totalMinutes}m</Text>
      <Text style={styles.statLabel}>Total Time</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{avgScore > 0 ? avgScore : '—'}</Text>
      <Text style={styles.statLabel}>Avg Score</Text>
    </View>
  </View>
);

// =============================================================================
// Session Card
// =============================================================================

interface SessionCardProps {
  session: StoredSession;
  index: number;
  onPress: (id: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, index, onPress }) => {
  const date = new Date(session.startedAt);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const avgScore = session.feedback
    ? Math.round(
        (session.feedback.articulation +
          session.feedback.fluency +
          session.feedback.communication +
          session.feedback.scenario) /
          4
      )
    : null;

  const scoreColor =
    avgScore === null
      ? colors.text.tertiary
      : avgScore >= 70
        ? colors.success.DEFAULT
        : avgScore >= 40
          ? colors.warning.DEFAULT
          : colors.error.DEFAULT;

  const formatDuration = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const scenarioLabel = session.scenario
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Animated.View entering={FadeInDown.delay(index * 60)}>
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => onPress(session.id)}
        activeOpacity={0.7}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionMeta}>
            <Text style={styles.scenarioText}>{scenarioLabel}</Text>
            <Text style={styles.dateText}>
              {dateStr} at {timeStr}
            </Text>
          </View>
          {avgScore !== null && (
            <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreText, { color: scoreColor }]}>{avgScore}</Text>
            </View>
          )}
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.detailText}>
              {formatDuration(session.durationSeconds)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.detailText}>{session.turnCount} turns</Text>
          </View>
          {session.pointsEarned > 0 && (
            <View style={styles.detailItem}>
              <Ionicons name="star" size={14} color={colors.warning.DEFAULT} />
              <Text style={styles.detailText}>{session.pointsEarned} pts</Text>
            </View>
          )}
        </View>

        {session.feedback?.summary && (
          <Text style={styles.summaryText} numberOfLines={2}>
            {session.feedback.summary}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// =============================================================================
// Main Screen
// =============================================================================

export default function ConversationHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [stats, setStats] = useState<StatsProps>({
    totalSessions: 0,
    totalMinutes: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [sessionsData, statsData] = await Promise.all([
        getRecentSessions(user.id, 50),
        getConversationStats(user.id),
      ]);

      setSessions(sessionsData);

      if (statsData) {
        const avgScore =
          statsData.avgArticulation +
          statsData.avgFluency +
          statsData.avgCommunication +
          statsData.avgScenario;
        setStats({
          totalSessions: statsData.totalSessions,
          totalMinutes: statsData.totalMinutes,
          avgScore: avgScore > 0 ? Math.round(avgScore / 4) : 0,
        });
      }
    } catch (error) {
      console.error('[ConversationHistory] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  function handleSessionPress(sessionId: string) {
    router.push(`/conversation-detail/${sessionId}`);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversations</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SessionCard session={item} index={index} onPress={handleSessionPress} />
        )}
        ListHeaderComponent={
          sessions.length > 0 ? <StatsHeader {...stats} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>
                Start a voice conversation to see your history here
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      />
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },

  // Session card
  sessionCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionMeta: {
    flex: 1,
  },
  scenarioText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.elevated,
  },
  scoreText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  sessionDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
