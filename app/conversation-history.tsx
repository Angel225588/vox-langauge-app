/**
 * Conversation History Screen
 *
 * Lists past voice conversation sessions with:
 * - Local transcripts from AsyncStorage (works without auth)
 * - Supabase sessions when authenticated (with feedback/scores)
 * - Tap to expand and view full transcript inline
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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import type { ElevenLabsMessage } from '@/lib/voice/elevenLabsTypes';

// Must match the key used in voice-conversation.tsx
const TRANSCRIPTS_STORAGE_KEY = 'vox_conversation_transcripts';

// Matches the shape saved by voice-conversation.tsx
interface SavedTranscript {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  characterName?: string;
  messages: ElevenLabsMessage[];
  duration: number;
  timestamp: number;
}

// Unified item for display — either a local transcript or a Supabase session
interface DisplayItem {
  id: string;
  source: 'local' | 'supabase';
  scenarioTitle: string;
  characterName?: string;
  timestamp: number;
  duration: number;
  messageCount: number;
  messages?: ElevenLabsMessage[];
  avgScore?: number | null;
  feedback?: StoredSession['feedback'];
  pointsEarned?: number;
  turnCount?: number;
}

// =============================================================================
// Relative Time Formatter
// =============================================================================

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

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
      <Text style={styles.statValue}>{avgScore > 0 ? avgScore : '\u2014'}</Text>
      <Text style={styles.statLabel}>Avg Score</Text>
    </View>
  </View>
);

// =============================================================================
// Transcript Message Bubble
// =============================================================================

interface MessageBubbleProps {
  message: ElevenLabsMessage;
  characterName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, characterName }) => {
  const isUser = message.role === 'user';
  const speakerLabel = isUser ? 'You' : (characterName || 'AI Tutor');

  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.speakerLabel, isUser ? styles.userSpeaker : styles.aiSpeaker]}>
        {speakerLabel}
      </Text>
      <Text style={styles.messageText}>{message.content}</Text>
    </View>
  );
};

// =============================================================================
// Session Card with Inline Expansion
// =============================================================================

interface SessionCardProps {
  item: DisplayItem;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ item, index, expanded, onToggle }) => {
  const scoreColor =
    item.avgScore == null
      ? colors.text.tertiary
      : item.avgScore >= 70
        ? colors.success.DEFAULT
        : item.avgScore >= 40
          ? colors.warning.DEFAULT
          : colors.error.DEFAULT;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 60, 600))}>
      <TouchableOpacity
        style={[styles.sessionCard, expanded && styles.sessionCardExpanded]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        {/* Header row */}
        <View style={styles.sessionHeader}>
          <View style={styles.sessionMeta}>
            <Text style={styles.scenarioText}>{item.scenarioTitle}</Text>
            <Text style={styles.dateText}>{getRelativeTime(item.timestamp)}</Text>
          </View>
          <View style={styles.headerRight}>
            {item.avgScore != null && (
              <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreText, { color: scoreColor }]}>{item.avgScore}</Text>
              </View>
            )}
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.text.tertiary}
              style={{ marginLeft: spacing.sm }}
            />
          </View>
        </View>

        {/* Details row */}
        <View style={styles.sessionDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.detailText}>{formatDuration(item.duration)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.detailText}>
              {item.messageCount} {item.messageCount === 1 ? 'message' : 'messages'}
            </Text>
          </View>
          {item.pointsEarned != null && item.pointsEarned > 0 && (
            <View style={styles.detailItem}>
              <Ionicons name="star" size={14} color={colors.warning.DEFAULT} />
              <Text style={styles.detailText}>{item.pointsEarned} pts</Text>
            </View>
          )}
          {item.source === 'local' && (
            <View style={styles.localBadge}>
              <Text style={styles.localBadgeText}>Local</Text>
            </View>
          )}
        </View>

        {/* Feedback summary (Supabase sessions) */}
        {!expanded && item.feedback?.summary && (
          <Text style={styles.summaryText} numberOfLines={2}>
            {item.feedback.summary}
          </Text>
        )}

        {/* Expanded: Full Transcript */}
        {expanded && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.transcriptContainer}>
            <View style={styles.transcriptDivider} />

            {/* Feedback summary at top of expansion */}
            {item.feedback?.summary && (
              <View style={styles.feedbackSummaryBox}>
                <Ionicons name="sparkles" size={14} color={colors.primary.DEFAULT} />
                <Text style={styles.feedbackSummaryText}>{item.feedback.summary}</Text>
              </View>
            )}

            {item.messages && item.messages.length > 0 ? (
              <>
                <Text style={styles.transcriptTitle}>Transcript</Text>
                {item.messages.map((msg, msgIdx) => (
                  <MessageBubble
                    key={msg.id || `msg-${msgIdx}`}
                    message={msg}
                    characterName={item.characterName}
                  />
                ))}
              </>
            ) : (
              <View style={styles.noTranscriptBox}>
                <Ionicons name="document-text-outline" size={20} color={colors.text.tertiary} />
                <Text style={styles.noTranscriptText}>
                  Transcript not available for this session
                </Text>
              </View>
            )}
          </Animated.View>
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
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsProps>({
    totalSessions: 0,
    totalMinutes: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const displayItems: DisplayItem[] = [];

      // 1. Always load local transcripts from AsyncStorage
      try {
        const localJson = await AsyncStorage.getItem(TRANSCRIPTS_STORAGE_KEY);
        if (localJson) {
          const localTranscripts: SavedTranscript[] = JSON.parse(localJson);
          for (const t of localTranscripts) {
            displayItems.push({
              id: `local_${t.id}`,
              source: 'local',
              scenarioTitle: t.scenarioTitle || t.scenarioId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              characterName: t.characterName,
              timestamp: t.timestamp,
              duration: t.duration,
              messageCount: t.messages?.length || 0,
              messages: t.messages,
            });
          }
        }
      } catch (localErr) {
        console.error('[ConversationHistory] Error loading local transcripts:', localErr);
      }

      // 2. Load Supabase sessions if authenticated
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [sessionsData, statsData] = await Promise.all([
            getRecentSessions(user.id, 50),
            getConversationStats(user.id),
          ]);

          for (const s of sessionsData) {
            const avgScore = s.feedback
              ? Math.round(
                  (s.feedback.articulation +
                    s.feedback.fluency +
                    s.feedback.communication +
                    s.feedback.scenario) / 4
                )
              : null;

            displayItems.push({
              id: `supabase_${s.id}`,
              source: 'supabase',
              scenarioTitle: s.scenario.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              timestamp: new Date(s.startedAt).getTime(),
              duration: s.durationSeconds,
              messageCount: s.turnCount,
              turnCount: s.turnCount,
              avgScore,
              feedback: s.feedback,
              pointsEarned: s.pointsEarned,
              // Messages are not stored in the session row; no inline transcript for Supabase-only
            });
          }

          if (statsData) {
            const avg =
              statsData.avgArticulation +
              statsData.avgFluency +
              statsData.avgCommunication +
              statsData.avgScenario;
            setStats({
              totalSessions: statsData.totalSessions,
              totalMinutes: statsData.totalMinutes,
              avgScore: avg > 0 ? Math.round(avg / 4) : 0,
            });
          }
        }
      } catch (supaErr) {
        // Not authenticated or Supabase error — local transcripts still work
        console.log('[ConversationHistory] Supabase not available, showing local only');
      }

      // 3. Deduplicate — if a local transcript and Supabase session share the same base ID,
      //    prefer the local one (has full messages) but merge score/feedback from Supabase
      const localById = new Map<string, DisplayItem>();
      const supabaseById = new Map<string, DisplayItem>();

      for (const item of displayItems) {
        const baseId = item.id.replace(/^(local_|supabase_)/, '');
        if (item.source === 'local') {
          localById.set(baseId, item);
        } else {
          supabaseById.set(baseId, item);
        }
      }

      const merged: DisplayItem[] = [];
      const seen = new Set<string>();

      for (const item of displayItems) {
        const baseId = item.id.replace(/^(local_|supabase_)/, '');
        if (seen.has(baseId)) continue;
        seen.add(baseId);

        const local = localById.get(baseId);
        const supa = supabaseById.get(baseId);

        if (local && supa) {
          // Merge: use local messages + supabase feedback/scores
          merged.push({
            ...local,
            avgScore: supa.avgScore,
            feedback: supa.feedback,
            pointsEarned: supa.pointsEarned,
          });
        } else {
          merged.push(item);
        }
      }

      // 4. Sort by timestamp descending
      merged.sort((a, b) => b.timestamp - a.timestamp);

      // 5. Compute local-only stats if we have no Supabase stats
      if (stats.totalSessions === 0 && merged.length > 0) {
        const totalDuration = merged.reduce((sum, i) => sum + i.duration, 0);
        setStats({
          totalSessions: merged.length,
          totalMinutes: Math.round(totalDuration / 60),
          avgScore: 0,
        });
      }

      setItems(merged);
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

  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SessionCard
              item={item}
              index={index}
              expanded={expandedId === item.id}
              onToggle={() => handleToggle(item.id)}
            />
          )}
          ListHeaderComponent={
            items.length > 0 ? <StatsHeader {...stats} /> : null
          }
          ListEmptyComponent={
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
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  sessionCardExpanded: {
    borderColor: 'rgba(0, 54, 255, 0.30)',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionMeta: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
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
  localBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  localBadgeText: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },

  // Transcript expansion
  transcriptContainer: {
    marginTop: spacing.sm,
  },
  transcriptDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.md,
  },
  transcriptTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackSummaryBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  feedbackSummaryText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary.DEFAULT + '20',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.elevated,
    borderBottomLeftRadius: 4,
  },
  speakerLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userSpeaker: {
    color: colors.primary.DEFAULT,
  },
  aiSpeaker: {
    color: colors.text.tertiary,
  },
  messageText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  noTranscriptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noTranscriptText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
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
