/**
 * Voice Role Play Card Component
 *
 * Voice conversation card supporting two modes:
 * 1. Hybrid Mode (default, cheap): Whisper + Gemini Text + TTS
 * 2. Gemini Live Mode (expensive): Real-time bidirectional audio streaming
 *
 * Features:
 * - Push-to-talk voice input
 * - AI responses with audio
 * - Audio level visualization
 * - Conversation transcript
 * - Character personalities from scenarios
 *
 * @example
 * ```tsx
 * <VoiceRolePlayCard
 *   scenarioId="cafe-order"
 *   mode="hybrid" // or "gemini-live"
 *   onComplete={(success, messages) => console.log('Done!', messages)}
 * />
 * ```
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography } from '@/constants/designSystem';
import { LottieSuccess, LottieError } from '@/components/animations';
import { useHaptics } from '@/hooks/useHaptics';
import useVoiceConversation, { ConversationState } from '@/hooks/useVoiceConversation';
import { useHybridConversation, type HybridConversationState } from '@/hooks/useHybridConversation';
import {
  getScenarioById,
  getCharacter,
  VoiceScenario,
  ConversationMessage,
} from '@/lib/voice';

// =============================================================================
// Types
// =============================================================================

/** Conversation mode - hybrid is cheaper, gemini-live is real-time but expensive */
export type VoiceConversationMode = 'hybrid' | 'gemini-live';

export interface VoiceRolePlayCardProps {
  /** Scenario ID from voice scenarios */
  scenarioId: string;
  /** Optional custom scenario */
  scenario?: VoiceScenario;
  /** User's name for personalization */
  userName?: string;
  /** Maximum conversation duration in seconds */
  maxDuration?: number;
  /** Conversation mode: 'hybrid' (cheap, default) or 'gemini-live' (expensive) */
  mode?: VoiceConversationMode;
  /** Callback when conversation completes */
  onComplete: (isSuccess: boolean, messages: ConversationMessage[]) => void;
  /** Callback to go back */
  onBack?: () => void;
}

// =============================================================================
// Audio Wave Visualization
// =============================================================================

interface AudioWaveProps {
  level: number;
  isActive: boolean;
}

const AudioWave: React.FC<AudioWaveProps> = ({ level, isActive }) => {
  const bars = 5;
  const animatedLevel = useSharedValue(0);

  useEffect(() => {
    animatedLevel.value = withSpring(level, { damping: 15, stiffness: 150 });
  }, [level]);

  return (
    <View style={waveStyles.container}>
      {Array.from({ length: bars }).map((_, i) => {
        const animatedStyle = useAnimatedStyle(() => {
          const barLevel = interpolate(
            animatedLevel.value,
            [0, 1],
            [0.3, 1],
            Extrapolation.CLAMP
          );
          const delay = i * 0.1;
          const height = barLevel * (20 + Math.sin((i + delay) * Math.PI) * 15);
          return {
            height: isActive ? Math.max(8, height) : 8,
            opacity: isActive ? 1 : 0.3,
          };
        });

        return (
          <Animated.View
            key={i}
            style={[waveStyles.bar, animatedStyle]}
          />
        );
      })}
    </View>
  );
};

const waveStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.primary.DEFAULT,
  },
});

// =============================================================================
// Main Component
// =============================================================================

export const VoiceRolePlayCard: React.FC<VoiceRolePlayCardProps> = ({
  scenarioId,
  scenario: customScenario,
  userName,
  maxDuration = 300, // 5 minutes default
  mode = 'hybrid', // Default to hybrid (cheaper)
  onComplete,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const scrollViewRef = useRef<ScrollView>(null);

  // Get scenario and character
  const scenario = customScenario || getScenarioById(scenarioId);
  const character = scenario?.characterId ? getCharacter(scenario.characterId) : undefined;

  // UI State
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================================
  // Hybrid Mode Hook (Whisper + Gemini Text + TTS - cheap)
  // ==========================================================================
  const hybridConversation = useHybridConversation({
    scenario: mode === 'hybrid' ? scenario : undefined,
    userName,
    autoInit: mode === 'hybrid',
    onUserTranscript: () => {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onAiResponse: () => {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: (err) => {
      console.error('[VoiceRolePlay/Hybrid] Error:', err);
      haptics.error();
    },
    onStateChange: (newState) => {
      if (newState === 'recording') haptics.light();
    },
  });

  // ==========================================================================
  // Gemini Live Mode Hook (Real-time bidirectional audio - expensive)
  // ==========================================================================
  const handleGeminiTranscript = useCallback(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleGeminiStateChange = useCallback((newState: ConversationState) => {
    if (newState === 'recording') haptics.light();
  }, [haptics]);

  const handleGeminiError = useCallback((err: Error) => {
    console.error('[VoiceRolePlay/Gemini] Error:', err);
    haptics.error();
  }, [haptics]);

  const geminiConversation = useVoiceConversation({
    scenario: mode === 'gemini-live' ? scenario : undefined,
    character: mode === 'gemini-live' ? character : undefined,
    userName,
    maxRecordingDuration: 30000,
    autoPlayResponses: true,
    onTranscript: handleGeminiTranscript,
    onStateChange: handleGeminiStateChange,
    onError: handleGeminiError,
  });

  // ==========================================================================
  // Unified Interface - Map both hooks to a common interface
  // ==========================================================================
  const isHybridMode = mode === 'hybrid';

  // Unified state values
  const state = isHybridMode
    ? mapHybridState(hybridConversation.state)
    : geminiConversation.state;

  const isConnected = isHybridMode
    ? hybridConversation.state === 'ready' || hybridConversation.state === 'recording' ||
      hybridConversation.state === 'transcribing' || hybridConversation.state === 'thinking' ||
      hybridConversation.state === 'speaking'
    : geminiConversation.isConnected;

  const isRecording = isHybridMode
    ? hybridConversation.isRecording
    : geminiConversation.isRecording;

  const isPlaying = isHybridMode
    ? hybridConversation.isSpeaking
    : geminiConversation.isPlaying;

  const messages = isHybridMode
    ? hybridConversation.messages
    : geminiConversation.messages;

  const audioLevel = isHybridMode
    ? hybridConversation.audioLevel
    : geminiConversation.audioLevel;

  const error = isHybridMode
    ? hybridConversation.error
    : geminiConversation.error;

  // Unified actions
  const connect = useCallback(async () => {
    if (isHybridMode) {
      return hybridConversation.initialize();
    }
    return geminiConversation.connect();
  }, [isHybridMode, hybridConversation, geminiConversation]);

  const disconnect = useCallback(() => {
    if (isHybridMode) {
      hybridConversation.cleanup();
    } else {
      geminiConversation.disconnect();
    }
  }, [isHybridMode, hybridConversation, geminiConversation]);

  const startRecording = useCallback(() => {
    if (isHybridMode) {
      hybridConversation.startRecording();
    } else {
      geminiConversation.startRecording();
    }
  }, [isHybridMode, hybridConversation, geminiConversation]);

  const stopRecording = useCallback(() => {
    if (isHybridMode) {
      hybridConversation.stopRecording();
    } else {
      geminiConversation.stopRecording();
    }
  }, [isHybridMode, hybridConversation, geminiConversation]);

  const stopPlayback = useCallback(() => {
    if (isHybridMode) {
      hybridConversation.stopSpeaking();
    } else {
      geminiConversation.stopPlayback();
    }
  }, [isHybridMode, hybridConversation, geminiConversation]);

  const sendText = useCallback((text: string) => {
    if (isHybridMode) {
      hybridConversation.sendText(text);
    } else {
      geminiConversation.sendText(text);
    }
  }, [isHybridMode, hybridConversation, geminiConversation]);

  const getSessionDuration = useCallback(() => {
    if (isHybridMode) {
      // For hybrid, calculate from first message timestamp
      if (messages.length > 0) {
        return Math.floor((Date.now() - messages[0].timestamp) / 1000);
      }
      return 0;
    }
    return geminiConversation.getSessionDuration();
  }, [isHybridMode, messages, geminiConversation]);

  // Session timer
  useEffect(() => {
    if (isConnected) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(getSessionDuration());
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isConnected, getSessionDuration]);

  // Auto-connect for Gemini Live mode (Hybrid auto-initializes via hook)
  const isMountedRef = useRef<boolean>(false);
  const connectAttemptedRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;
    console.log(`[VoiceRolePlay] Component mounted, mode: ${mode}`);

    // Only auto-connect for Gemini Live mode
    if (mode === 'gemini-live' && !connectAttemptedRef.current && scenario && !geminiConversation.isConnected) {
      connectAttemptedRef.current = true;
      console.log('[VoiceRolePlay] Starting Gemini Live connection...');

      geminiConversation.connect().then(() => {
        console.log('[VoiceRolePlay] Gemini Live connected successfully');
      }).catch((err) => {
        console.error('[VoiceRolePlay] Failed to connect:', err);
        connectAttemptedRef.current = false;
      });
    }

    return () => {
      console.log('[VoiceRolePlay] Cleanup called');
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, mode]);

  // Handle push-to-talk press
  const handlePushToTalkStart = useCallback(() => {
    console.log('[VoiceRolePlay] PTT Start pressed - isConnected:', isConnected, 'isPlaying:', isPlaying, 'state:', state);
    if (!isConnected || isPlaying) {
      console.log('[VoiceRolePlay] PTT Start blocked - not connected or playing');
      return;
    }
    haptics.light();
    startRecording();
  }, [isConnected, isPlaying, state, startRecording, haptics]);

  const handlePushToTalkEnd = useCallback(() => {
    console.log('[VoiceRolePlay] PTT End pressed - isRecording:', isRecording);
    if (!isRecording) {
      console.log('[VoiceRolePlay] PTT End blocked - not recording');
      return;
    }
    haptics.light();
    stopRecording();
  }, [isRecording, stopRecording, haptics]);

  // Handle end conversation
  const handleEndConversation = useCallback(() => {
    console.log('[VoiceRolePlay] handleEndConversation called, messages:', messages.length);
    const success = messages.length >= 4;
    haptics.medium();

    if (success) {
      setShowResultAnimation('success');
      haptics.success();
    } else {
      setShowResultAnimation('error');
    }

    setTimeout(() => {
      setShowResultAnimation(null);
      disconnect();
      console.log('[VoiceRolePlay] Calling onComplete:', { success, messageCount: messages.length });
      onComplete(success, messages);
    }, 2000);
  }, [messages, disconnect, onComplete, haptics]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status text
  const getStatusText = (): string => {
    switch (state) {
      case 'connecting':
      case 'initializing':
        return 'Connecting...';
      case 'recording':
        return 'Listening...';
      case 'processing':
      case 'transcribing':
      case 'thinking':
        return 'Thinking...';
      case 'playing':
      case 'speaking':
        return 'Speaking...';
      case 'error':
        return 'Connection error';
      case 'disconnected':
      case 'idle':
        return 'Disconnected';
      default:
        return 'Ready';
    }
  };

  // Get status color
  const getStatusColor = (): string => {
    switch (state) {
      case 'recording':
        return colors.error.DEFAULT;
      case 'playing':
      case 'speaking':
        return colors.primary.DEFAULT;
      case 'error':
        return colors.error.DEFAULT;
      default:
        return colors.text.tertiary;
    }
  };

  // Helper to map hybrid states to conversation states
  function mapHybridState(hybridState: HybridConversationState): ConversationState | HybridConversationState {
    switch (hybridState) {
      case 'initializing': return 'connecting';
      case 'ready': return 'idle';
      case 'speaking': return 'playing';
      default: return hybridState;
    }
  }

  if (!scenario) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Scenario not found: {scenarioId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}

        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>
              {character?.avatarEmoji || '🎭'}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.characterName}>
              {character?.name || scenario.aiRole || 'AI Tutor'}
            </Text>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          </View>
        </View>

        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.timerText}>{formatTime(sessionTime)}</Text>
        </View>
      </Animated.View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {/* Mode Badge */}
        <View style={[
          styles.modeBadge,
          isHybridMode ? styles.modeBadgeHybrid : styles.modeBadgeLive,
        ]}>
          <Text style={styles.modeBadgeText}>
            {isHybridMode ? 'ECO' : 'LIVE'}
          </Text>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scenario Context */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.contextCard}>
          <Text style={styles.contextTitle}>Scenario</Text>
          <Text style={styles.contextText}>{scenario.context}</Text>
          <View style={styles.contextDivider} />
          <Text style={styles.contextTitle}>Your Role</Text>
          <Text style={styles.contextText}>{scenario.userRole}</Text>
        </Animated.View>

        {/* Objectives */}
        {scenario.objectives && scenario.objectives.length > 0 && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.objectivesCard}>
            <Text style={styles.objectivesTitle}>Goals</Text>
            {scenario.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={colors.primary.DEFAULT}
                />
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <Animated.View
            key={message.id}
            entering={FadeInUp.duration(300)}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.messageRowUser : styles.messageRowAi,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          </Animated.View>
        ))}

        {/* Loading indicator */}
        {state === 'processing' && (
          <Animated.View
            entering={FadeIn}
            style={[styles.messageRow, styles.messageRowAi]}
          >
            <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Suggested Phrases */}
      {isConnected && !isRecording && !isPlaying && scenario.suggestedPhrases && (
        <Animated.View entering={FadeIn} style={styles.suggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {scenario.suggestedPhrases.slice(0, 4).map((phrase, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => sendText(phrase)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{phrase}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Bottom Controls */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Audio Visualization */}
        {(isRecording || isPlaying) && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.waveContainer}>
            <AudioWave level={audioLevel} isActive={isRecording || isPlaying} />
          </Animated.View>
        )}

        {/* Connection Error */}
        {state === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error?.message || 'Connection failed'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={connect}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Controls */}
        {state !== 'error' && (
          <View style={styles.controlsRow}>
            {/* End Button */}
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndConversation}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>

            {/* Push-to-Talk Button */}
            <Pressable
              style={[
                styles.pttButton,
                isRecording && styles.pttButtonActive,
                (!isConnected || state === 'connecting') && styles.pttButtonDisabled,
              ]}
              onPressIn={handlePushToTalkStart}
              onPressOut={handlePushToTalkEnd}
              disabled={!isConnected || state === 'connecting' || isPlaying}
            >
              <LinearGradient
                colors={
                  isRecording
                    ? [colors.error.DEFAULT, '#FF6B6B']
                    : colors.gradients.primary
                }
                style={styles.pttButtonGradient}
              >
                <Ionicons
                  name={isRecording ? 'mic' : isPlaying ? 'volume-high' : 'mic-outline'}
                  size={32}
                  color={colors.text.primary}
                />
              </LinearGradient>
            </Pressable>

            {/* Stop Playback Button */}
            {isPlaying ? (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopPlayback}
                activeOpacity={0.7}
              >
                <Ionicons name="stop" size={24} color={colors.text.tertiary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.stopButtonPlaceholder} />
            )}
          </View>
        )}

        {/* Instructions */}
        <Text style={styles.instructionText}>
          {state === 'connecting'
            ? 'Connecting to tutor...'
            : isRecording
            ? 'Release to send'
            : isPlaying
            ? 'Tap stop to interrupt'
            : 'Hold to speak'}
        </Text>
      </View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  headerText: {
    gap: 2,
  },
  characterName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.card,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
  },
  modeBadge: {
    position: 'absolute',
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  modeBadgeHybrid: {
    backgroundColor: '#10B981',
  },
  modeBadgeLive: {
    backgroundColor: '#F59E0B',
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  contextCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  contextTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  contextText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  contextDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  objectivesCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.DEFAULT,
  },
  objectivesTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  objectiveText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  messageRow: {
    marginTop: spacing.sm,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowAi: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary.DEFAULT,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  loadingBubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.4,
  },
  suggestionsContainer: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  waveContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.DEFAULT,
  },
  retryButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  retryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  endButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pttButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pttButtonActive: {
    transform: [{ scale: 1.1 }],
    shadowColor: colors.error.DEFAULT,
  },
  pttButtonDisabled: {
    opacity: 0.5,
  },
  pttButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonPlaceholder: {
    width: 48,
    height: 48,
  },
  instructionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default VoiceRolePlayCard;
