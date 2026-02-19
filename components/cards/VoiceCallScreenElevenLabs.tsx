/**
 * Voice Call Screen - ElevenLabs Edition
 *
 * Premium voice conversation interface powered by ElevenLabs Conversational AI.
 * Features automatic voice activity detection (VAD) - no manual recording control needed.
 *
 * Key improvements over Gemini Live:
 * - Automatic turn detection (no need to press mute)
 * - Natural conversation flow
 * - Better voice quality
 * - Simpler state machine
 *
 * @example
 * ```tsx
 * <VoiceCallScreenElevenLabs
 *   scenario={scenario}
 *   voice={selectedVoice}
 *   onComplete={(result) => console.log('Done!', result)}
 * />
 * ```
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, spacing, typography } from '@/constants/designSystem';
import { LottieSuccess, LottieError } from '@/components/animations';
import { useHaptics } from '@/hooks/useHaptics';
import useElevenLabsConversation from '@/hooks/useElevenLabsConversation';
import type { ElevenLabsVoiceConfig, ProficiencyLevel, ElevenLabsMessage } from '@/lib/voice/elevenLabsTypes';
import type { VoiceScenario, CharacterVoice, ConversationMessage } from '@/lib/voice';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// Types
// =============================================================================

export interface VoiceCallCompletionResult {
  success: boolean;
  messages: ConversationMessage[];
  endReason: 'user_ended' | 'error' | 'timeout' | 'completed';
  error?: Error;
  duration: number;
  /** Full transcript for saving */
  transcript?: ElevenLabsMessage[];
}

export interface VoiceCallScreenElevenLabsProps {
  /** Scenario for the conversation */
  scenario: VoiceScenario;
  /** Character for the conversation (optional, for avatar) */
  character?: CharacterVoice;
  /** Voice configuration */
  voice?: ElevenLabsVoiceConfig;
  /** User's proficiency level */
  proficiency?: ProficiencyLevel;
  /** Target session duration in seconds (from onboarding practice time) */
  targetDuration?: number;
  /** Callback when call ends */
  onComplete: (result: VoiceCallCompletionResult) => void;
  /** Callback to go back */
  onBack?: () => void;
}

// =============================================================================
// Character Avatar Component
// =============================================================================

interface CharacterAvatarProps {
  character?: CharacterVoice;
  voice?: ElevenLabsVoiceConfig;
  isSpeaking: boolean;
  isConnected: boolean;
  isConnecting: boolean;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  voice,
  isSpeaking,
  isConnected,
  isConnecting,
}) => {
  const pulseScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  // Animation based on state
  useEffect(() => {
    if (isSpeaking) {
      // AI speaking - animated ring
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      ringOpacity.value = withTiming(1, { duration: 300 });
    } else if (isConnected) {
      pulseScale.value = withSpring(1, { damping: 15 });
      ringOpacity.value = withTiming(0.5, { duration: 300 });
    } else if (isConnecting) {
      // Connecting - slow pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      ringOpacity.value = withTiming(0.3, { duration: 300 });
    } else {
      pulseScale.value = withSpring(1, { damping: 15 });
      ringOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isSpeaking, isConnected, isConnecting]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  // Get display info
  const name = character?.name || voice?.name || 'AI Tutor';
  const avatarEmoji = character?.avatarEmoji;
  const flag = voice?.flag || '🎙️';

  // Status info
  const statusText = isConnecting
    ? 'Connecting...'
    : isSpeaking
    ? 'Speaking...'
    : isConnected
    ? 'Listening...'
    : '';

  const statusColor = isConnecting
    ? colors.warning.DEFAULT
    : isSpeaking
    ? colors.primary.DEFAULT
    : colors.success.DEFAULT;

  return (
    <View style={avatarStyles.wrapper}>
      <Animated.View style={[avatarStyles.container, containerStyle]}>
        {/* Animated ring */}
        <Animated.View style={[avatarStyles.ring, ringStyle]} />

        {/* Avatar - show character emoji or voice flag */}
        <View style={avatarStyles.avatarContainer}>
          <View style={avatarStyles.placeholderAvatar}>
            <Text style={avatarStyles.flag}>{avatarEmoji || flag}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Name */}
      <Text style={avatarStyles.name}>{name}</Text>

      {/* Status */}
      {statusText && (
        <Animated.View entering={FadeIn} style={avatarStyles.statusContainer}>
          <View style={[avatarStyles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[avatarStyles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const AVATAR_SIZE = 160;

const avatarStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.md,
  },
  container: {
    width: AVATAR_SIZE + 20,
    height: AVATAR_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: AVATAR_SIZE + 20,
    height: AVATAR_SIZE + 20,
    borderRadius: (AVATAR_SIZE + 20) / 2,
    borderWidth: 3,
    borderColor: colors.primary.DEFAULT,
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: typography.fontSize['5xl'],
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

// =============================================================================
// Call Control Button - Apple-Inspired
// =============================================================================

interface CallButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  variant: 'primary' | 'secondary' | 'destructive';
  size?: 'medium' | 'large';
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  label?: string;
}

const CallButton: React.FC<CallButtonProps> = ({
  icon,
  variant,
  size = 'medium',
  onPress,
  disabled = false,
  active = false,
  label,
}) => {
  const scale = useSharedValue(1);

  const sizeConfig = {
    medium: { button: 56, icon: 24 },
    large: { button: 68, icon: 28 },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: active ? colors.primary.DEFAULT : 'rgba(255, 255, 255, 0.12)', // translucent white for glass effect
          iconColor: active ? colors.text.primary : colors.text.primary,
        };
      case 'secondary':
        return {
          background: active ? colors.warning.DEFAULT : 'rgba(255, 255, 255, 0.12)', // translucent white for glass effect
          iconColor: active ? colors.text.primary : colors.text.primary,
        };
      case 'destructive':
        return {
          background: colors.error.DEFAULT,
          iconColor: colors.text.primary,
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.12)', // translucent white for glass effect
          iconColor: colors.text.primary,
        };
    }
  };

  const config = sizeConfig[size];
  const variantStyles = getVariantStyles();

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <View style={callButtonStyles.wrapper}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ opacity: disabled ? 0.4 : 1 }}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        <Animated.View style={buttonStyle}>
          <View
            style={[
              callButtonStyles.button,
              {
                width: config.button,
                height: config.button,
                borderRadius: config.button / 2,
                backgroundColor: variantStyles.background,
              },
            ]}
          >
            <View style={callButtonStyles.innerHighlight} />
            <Ionicons
              name={icon}
              size={config.icon}
              color={variantStyles.iconColor}
            />
          </View>
        </Animated.View>
      </Pressable>

      {label && (
        <Text style={callButtonStyles.label}>{label}</Text>
      )}
    </View>
  );
};

const callButtonStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // subtle glass highlight
    borderTopLeftRadius: borderRadius.full,
    borderTopRightRadius: borderRadius.full,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

// =============================================================================
// Last Message Display
// =============================================================================

interface LastMessageDisplayProps {
  message?: ElevenLabsMessage | null;
}

const LastMessageDisplay: React.FC<LastMessageDisplayProps> = ({ message }) => {
  if (!message) {
    return (
      <View style={messageStyles.container}>
        <Text style={messageStyles.hint}>Say something to begin...</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn} style={messageStyles.container}>
      <Text style={messageStyles.label}>
        {message.role === 'user' ? 'You said' : 'AI said'}
      </Text>
      <Text style={messageStyles.text} numberOfLines={3}>
        {message.content}
      </Text>
    </Animated.View>
  );
};

const messageStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: spacing['2xl'] + spacing.xl, // ~80
  },
  hint: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  text: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.4,
  },
});

// =============================================================================
// Main Component
// =============================================================================

export const VoiceCallScreenElevenLabs: React.FC<VoiceCallScreenElevenLabsProps> = ({
  scenario,
  character,
  voice,
  proficiency = 'intermediate',
  targetDuration,
  onComplete,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  // UI State
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectAttemptedRef = useRef(false);

  // Build rich scenario description for AI prompt
  const richScenarioDescription = [
    scenario.description,
    scenario.context && `Setting: ${scenario.context}`,
    scenario.aiRole && `Your role: ${scenario.aiRole}`,
    scenario.objectives?.length > 0 && `Help the user: ${scenario.objectives.join(', ')}`,
  ].filter(Boolean).join('\n');

  // ElevenLabs Conversation Hook
  const {
    status,
    isConnected,
    isConnecting,
    isSpeaking,
    messages,
    lastMessage,
    sessionDuration,
    turnCount,
    error,
    startSession,
    endSession,
    resetError,
  } = useElevenLabsConversation({
    voice,
    scenario: scenario.id,
    scenarioDescription: richScenarioDescription,
    userProficiency: proficiency,
    targetDuration,
    // All overrides enabled now that voice IDs are configured correctly
    // NOTE: Requires TTS Voice Override enabled in ElevenLabs agent Security tab
    disableOverrides: false,
    overrideOptions: {
      enablePrompt: true, // Use custom scenario-based prompt with pronunciation correction
      enableFirstMessage: true, // Use custom greeting in target language
      enableLanguage: true, // Set agent language for STT
      enableVoice: true, // Use custom voice from user's Voice Library
    },
    onError: (err) => {
      console.error('[VoiceCall] Error:', err);
      haptics.error();
    },
  });

  // Session timer (backup - ElevenLabs also tracks this)
  useEffect(() => {
    if (isConnected) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1);
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
  }, [isConnected]);

  // Auto-connect on mount
  useEffect(() => {
    if (!connectAttemptedRef.current && scenario) {
      connectAttemptedRef.current = true;
      startSession().catch((err) => {
        console.error('[VoiceCall] Connection failed:', err);
        connectAttemptedRef.current = false;
      });
    }

    return () => {
      endSession();
    };
  }, [scenario]);

  // Haptic feedback for state changes
  useEffect(() => {
    if (isConnected) {
      haptics.success();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isSpeaking) {
      haptics.light();
    }
  }, [isSpeaking]);

  // End call handler
  const handleEndCall = useCallback(() => {
    // Convert ElevenLabs messages to ConversationMessage format
    const conversationMessages: ConversationMessage[] = messages.map((m, index) => ({
      id: m.id || `msg_${index}`,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    }));

    const hasEnoughContent = messages.length >= 2 || sessionTime >= 30;
    const success = hasEnoughContent && status !== 'disconnected';
    const endReason = error ? 'error' : 'user_ended';

    console.log('[VoiceCallScreen] handleEndCall:', {
      messageCount: messages.length,
      sessionTime,
      status,
      hasEnoughContent,
      success,
    });

    haptics.medium();
    setShowResultAnimation(success ? 'success' : 'error');
    if (success) haptics.success();

    setTimeout(() => {
      setShowResultAnimation(null);
      endSession();
      onComplete({
        success,
        messages: conversationMessages,
        endReason,
        error: error || undefined,
        duration: sessionTime,
        transcript: messages, // Full transcript for saving
      });
    }, 2000);
  }, [messages, status, error, sessionTime, endSession, onComplete, haptics]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer color based on progress toward target
  const getTimerColor = (): string => {
    if (!targetDuration || targetDuration <= 0) return colors.text.primary;
    const ratio = sessionTime / targetDuration;
    if (ratio >= 1.0) return colors.warning.DEFAULT; // Over target — subtle pulse
    if (ratio >= 0.8) return colors.warning.DEFAULT;  // Approaching target
    return colors.success.DEFAULT;                     // Under target
  };

  // Timer display text: show "elapsed / target" when target exists
  const timerDisplay = targetDuration
    ? `${formatTime(sessionTime)} / ${formatTime(targetDuration)}`
    : formatTime(sessionTime);

  return (
    <View style={styles.container}>
      {/* Result Animation Overlay */}
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      {/* Header - Timer */}
      <Animated.View
        entering={FadeInDown}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.headerCenter}>
          <View style={[
            styles.timerPill,
            (targetDuration && sessionTime >= targetDuration) ? styles.timerPillOvertime : undefined,
          ]}>
            <View
              style={[
                styles.liveIndicator,
                {
                  backgroundColor: isConnecting
                    ? colors.warning.DEFAULT
                    : isSpeaking
                    ? colors.primary.DEFAULT
                    : isConnected
                    ? colors.success.DEFAULT
                    : colors.text.tertiary,
                },
              ]}
            />
            <Text style={[styles.timerText, { color: getTimerColor() }]}>{timerDisplay}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Main Content - Character Avatar */}
      <View style={styles.content}>
        <CharacterAvatar
          character={character}
          voice={voice}
          isSpeaking={isSpeaking}
          isConnected={isConnected}
          isConnecting={isConnecting}
        />

        {/* Last Message Display */}
        <View style={styles.messageContainer}>
          <LastMessageDisplay message={lastMessage} />
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error.message || 'Connection failed'}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                resetError();
                startSession();
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Controls - Simplified for ElevenLabs (no mute needed) */}
        {!error && (
          <View style={styles.controlsRow}>
            {/* Speaker Button (toggle speaker/earpiece - optional) */}
            <CallButton
              icon="volume-high"
              variant="primary"
              size="medium"
              onPress={() => haptics.light()}
              label="Speaker"
            />

            {/* End Call Button */}
            <CallButton
              icon="call"
              variant="destructive"
              size="large"
              onPress={handleEndCall}
              label="End"
            />

            {/* Transcript Button (shows conversation is being recorded) */}
            <CallButton
              icon="chatbubble-ellipses"
              variant="secondary"
              size="medium"
              onPress={() => haptics.light()}
              active={messages.length > 0}
              label={`${turnCount} turns`}
            />
          </View>
        )}

        {/* Hint text */}
        {isConnected && !error && messages.length === 0 && (
          <Animated.View entering={FadeIn.delay(2000)} style={styles.hintContainer}>
            <Text style={styles.hintText}>
              Just start speaking naturally - the AI will respond automatically
            </Text>
          </Animated.View>
        )}
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

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerCenter: {
    alignItems: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  timerPillOvertime: {
    borderWidth: 1,
    borderColor: colors.warning.DEFAULT + '40',
  },
  liveIndicator: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  messageContainer: {
    marginTop: spacing.xl,
    width: '100%',
  },

  // Bottom Controls
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.DEFAULT,
    textAlign: 'center',
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  hintContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Overlay
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)', // dark overlay for modal backdrop
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default VoiceCallScreenElevenLabs;
