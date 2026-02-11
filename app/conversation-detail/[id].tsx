/**
 * Conversation Detail Screen
 *
 * Shows full transcript + feedback for a past conversation session.
 * Accessed from conversation-history.tsx.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from '@/constants/designSystem';
import {
  getSession,
  getSessionMessages,
} from '@/lib/db/conversations';
import type { StoredSession, StoredMessage, ConversationFeedback } from '@/lib/db/conversations';

// =============================================================================
// Score Ring
// =============================================================================

interface ScoreItemProps {
  label: string;
  score: number;
  color: string;
}

const ScoreItem: React.FC<ScoreItemProps> = ({ label, score, color }) => (
  <View style={styles.scoreItem}>
    <View style={[styles.scoreCircle, { borderColor: color }]}>
      <Text style={[styles.scoreValue, { color }]}>{score}</Text>
    </View>
    <Text style={styles.scoreLabel}>{label}</Text>
  </View>
);

// =============================================================================
// Feedback Card
// =============================================================================

interface FeedbackCardProps {
  feedback: ConversationFeedback;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback }) => {
  const getColor = (score: number) =>
    score >= 70
      ? colors.success.DEFAULT
      : score >= 40
        ? colors.warning.DEFAULT
        : colors.error.DEFAULT;

  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.sectionTitle}>Performance</Text>

      {/* 4 KPI Scores */}
      <View style={styles.scoresRow}>
        <ScoreItem label="Articulation" score={feedback.articulation} color={getColor(feedback.articulation)} />
        <ScoreItem label="Fluency" score={feedback.fluency} color={getColor(feedback.fluency)} />
        <ScoreItem label="Communication" score={feedback.communication} color={getColor(feedback.communication)} />
        <ScoreItem label="Scenario" score={feedback.scenario} color={getColor(feedback.scenario)} />
      </View>

      {/* Summary */}
      <Text style={styles.summaryText}>{feedback.summary}</Text>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <View style={styles.feedbackSection}>
          <View style={styles.feedbackHeader}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success.DEFAULT} />
            <Text style={styles.feedbackHeaderText}>Strengths</Text>
          </View>
          {feedback.strengths.map((s, i) => (
            <Text key={i} style={styles.feedbackBullet}>
              {s}
            </Text>
          ))}
        </View>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <View style={styles.feedbackSection}>
          <View style={styles.feedbackHeader}>
            <Ionicons name="trending-up" size={18} color={colors.primary.DEFAULT} />
            <Text style={styles.feedbackHeaderText}>To Improve</Text>
          </View>
          {feedback.improvements.map((s, i) => (
            <Text key={i} style={styles.feedbackBullet}>
              {s}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

// =============================================================================
// Message Bubble
// =============================================================================

interface MessageBubbleProps {
  message: StoredMessage;
  index: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const isUser = message.role === 'user';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 30)}
      style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAI,
        ]}
      >
        <Text style={styles.bubbleText}>{message.content}</Text>
      </View>
    </Animated.View>
  );
};

// =============================================================================
// Main Screen
// =============================================================================

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  async function loadData(sessionId: string) {
    try {
      const [s, m] = await Promise.all([
        getSession(sessionId),
        getSessionMessages(sessionId),
      ]);
      setSession(s);
      setMessages(m);
    } catch (error) {
      console.error('[ConversationDetail] Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !session) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const date = new Date(session.startedAt);
  const scenarioLabel = session.scenario
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{scenarioLabel}</Text>
          <Text style={styles.headerSubtitle}>
            {date.toLocaleDateString()} · {formatDuration(session.durationSeconds)}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Feedback */}
        {session.feedback && <FeedbackCard feedback={session.feedback} />}

        {/* Transcript */}
        <Text style={styles.sectionTitle}>Transcript</Text>
        <View style={styles.transcriptContainer}>
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} index={i} />
            ))
          ) : (
            <Text style={styles.noTranscript}>No transcript available</Text>
          )}
        </View>
      </ScrollView>
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
  loadingText: {
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },

  // Feedback
  feedbackCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  scoreItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.elevated,
  },
  scoreValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  summaryText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.md,
  },
  feedbackSection: {
    marginTop: spacing.sm,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  feedbackHeaderText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  feedbackBullet: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    paddingLeft: spacing.lg,
    marginBottom: 4,
    lineHeight: typography.fontSize.sm * 1.4,
  },

  // Transcript
  transcriptContainer: {
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.primary.DEFAULT,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.4,
  },
  noTranscript: {
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
