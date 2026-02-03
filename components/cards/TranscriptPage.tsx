/**
 * TranscriptPage - Full-Screen Transcript Viewer
 *
 * Premium scrollable page showing the complete conversation transcript.
 * Features:
 * - Full-screen modal with smooth animations
 * - Message bubbles with proper styling
 * - Timestamp display for each message
 * - Character avatar header
 * - Close button with swipe-to-dismiss
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing, typography } from '@/constants/designSystem';
import { ConversationMessage } from '@/lib/voice';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// Types
// =============================================================================

export interface TranscriptPageProps {
  /** Whether the page is visible */
  visible: boolean;
  /** All conversation messages */
  messages: ConversationMessage[];
  /** Scenario title for display */
  scenarioTitle: string;
  /** Character name (optional) */
  characterName?: string;
  /** Character emoji (optional) */
  characterEmoji?: string;
  /** Conversation duration in seconds */
  duration: number;
  /** Callback to close the page */
  onClose: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatTime(timestamp: number, startTime: number): string {
  const elapsed = Math.floor((timestamp - startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// Message Bubble Component
// =============================================================================

interface MessageBubbleProps {
  message: ConversationMessage;
  index: number;
  startTime: number;
  characterName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  startTime,
  characterName,
}) => {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp || startTime + index * 5000;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      style={[
        styles.messageBubble,
        isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {/* Role & Timestamp */}
      <View style={styles.messageHeader}>
        <Text style={[styles.messageRole, isUser ? styles.userRole : styles.aiRole]}>
          {isUser ? 'You' : characterName || 'AI Tutor'}
        </Text>
        <Text style={styles.messageTime}>
          {formatTime(timestamp, startTime)}
        </Text>
      </View>

      {/* Content */}
      <Text style={styles.messageContent}>{message.content}</Text>
    </Animated.View>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const TranscriptPage: React.FC<TranscriptPageProps> = ({
  visible,
  messages,
  scenarioTitle,
  characterName,
  characterEmoji,
  duration,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  // Calculate start time from first message or use current time
  const startTime = messages.length > 0
    ? messages[0].timestamp || Date.now() - duration * 1000
    : Date.now() - duration * 1000;

  // Count user vs AI messages
  const userMessages = messages.filter(m => m.role === 'user').length;
  const aiMessages = messages.filter(m => m.role === 'assistant').length;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(90)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.container, { paddingTop: insets.top }]}
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
              accessibilityLabel="Close transcript"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Conversation Transcript</Text>
              <Text style={styles.headerSubtitle}>
                {scenarioTitle} {characterName ? `with ${characterName}` : ''}
              </Text>
            </View>

            {/* Placeholder for alignment */}
            <View style={styles.headerRight} />
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>{formatDuration(duration)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="chatbubbles-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>{messages.length} messages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="swap-horizontal-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>{Math.min(userMessages, aiMessages)} turns</Text>
            </View>
          </View>

          {/* Messages List */}
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: insets.bottom + spacing.xl },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>No messages in this conversation</Text>
              </View>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={message.id || `msg-${index}`}
                  message={message}
                  index={index}
                  startTime={startTime}
                  characterName={characterName}
                />
              ))
            )}

            {/* End of Conversation Marker */}
            {messages.length > 0 && (
              <View style={styles.endMarker}>
                <View style={styles.endMarkerLine} />
                <Text style={styles.endMarkerText}>End of Conversation</Text>
                <View style={styles.endMarkerLine} />
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    marginTop: 40,
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.text.tertiary + '40',
  },

  // Messages Container
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  // Message Bubble
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: '85%',
    marginBottom: spacing.xs,
  },
  userMessage: {
    backgroundColor: colors.primary.DEFAULT + '20',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT + '30',
  },
  aiMessage: {
    backgroundColor: colors.background.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border?.light || 'rgba(255,255,255,0.1)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  messageRole: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userRole: {
    color: colors.primary.DEFAULT,
  },
  aiRole: {
    color: colors.text.tertiary,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  messageContent: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },

  // End Marker
  endMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  endMarkerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.text.tertiary + '30',
  },
  endMarkerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default TranscriptPage;
