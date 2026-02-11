/**
 * Voice Call Screen Component - Apple-Inspired Premium Design
 *
 * Clean, minimalist voice conversation interface featuring:
 * - Animated particle sphere that responds to audio
 * - Apple Phone app-inspired control buttons (no glow, translucent backgrounds)
 * - Always-listening mode with silence detection
 * - Premium dark mode aesthetics
 *
 * @example
 * ```tsx
 * <VoiceCallScreen
 *   scenario={scenario}
 *   accent="es-latam"
 *   onComplete={(result) => console.log('Done!', result)}
 * />
 * ```
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  interpolate,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography } from '@/constants/designSystem';
import { LottieSuccess, LottieError } from '@/components/animations';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { useHaptics } from '@/hooks/useHaptics';
import useVoiceConversation, { ConversationState } from '@/hooks/useVoiceConversation';
import {
  getScenarioById,
  getCharacter,
  VoiceScenario,
  ConversationMessage,
  AccentType,
  GeminiVoiceName,
} from '@/lib/voice';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// Types
// =============================================================================

// P2 Fix: Enhanced completion result for proper error propagation
export interface VoiceCallCompletionResult {
  success: boolean;
  messages: ConversationMessage[];
  endReason: 'user_ended' | 'error' | 'timeout' | 'completed';
  error?: Error;
  duration: number;
}

export interface VoiceCallScreenProps {
  /** Scenario ID or custom scenario */
  scenarioId?: string;
  scenario?: VoiceScenario;
  /** Accent for the AI voice */
  accent?: AccentType;
  /** Voice preset */
  voice?: GeminiVoiceName;
  /** User's name */
  userName?: string;
  /** Callback when call ends - P2 Fix: now includes detailed result */
  onComplete: (result: VoiceCallCompletionResult) => void;
  /** Callback to go back */
  onBack?: () => void;
}

// =============================================================================
// Particle Sphere Component - Premium Animation
// =============================================================================

const PARTICLE_COUNT = 24;
const SPHERE_SIZE = 200;

interface ParticleSphereProps {
  state: ConversationState;
  audioLevel: number;
}

const ParticleSphere: React.FC<ParticleSphereProps> = ({ state, audioLevel }) => {
  // Animation values - subtle and professional
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Generate particle positions in a sphere pattern
  const particles = React.useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);

      return {
        id: i,
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        size: 3 + Math.random() * 3,
      };
    });
  }, []);

  // Subtle animation based on state
  useEffect(() => {
    // Slow rotation - always active
    rotation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );

    if (state === 'playing') {
      // AI speaking - gentle pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else if (state === 'recording') {
      // User speaking - respond to audio level (subtle)
      pulseScale.value = withSpring(1 + audioLevel * 0.08, { damping: 15, stiffness: 200 });
    } else if (state === 'processing') {
      // Thinking - very subtle pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1, { damping: 15 });
    }
  }, [state, audioLevel]);

  // Animated container style
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  // Status text
  const statusColor =
    state === 'recording'
      ? colors.error.DEFAULT
      : state === 'playing'
      ? colors.primary.DEFAULT
      : state === 'processing'
      ? colors.warning.DEFAULT
      : colors.text.tertiary;

  const statusText =
    state === 'recording'
      ? 'Listening...'
      : state === 'playing'
      ? 'Speaking...'
      : state === 'processing'
      ? 'Thinking...'
      : state === 'connecting'
      ? 'Connecting...'
      : state === 'connected'
      ? 'Ready'
      : '';

  return (
    <View style={sphereStyles.wrapper}>
      {/* Sphere Container - no glow, just clean particles */}
      <Animated.View style={[sphereStyles.container, containerStyle]}>
        {/* Subtle core ring */}
        <View style={sphereStyles.coreRing} />

        {/* Particles */}
        {particles.map((particle) => {
          const scale = 0.6 + (particle.z + 1) / 3;
          const opacity = 0.4 + (particle.z + 1) / 2.5;
          const x = particle.x * SPHERE_SIZE * 0.42;
          const y = particle.y * SPHERE_SIZE * 0.42;

          return (
            <View
              key={particle.id}
              style={[
                sphereStyles.particle,
                {
                  width: particle.size * scale,
                  height: particle.size * scale,
                  borderRadius: (particle.size * scale) / 2,
                  opacity,
                  transform: [
                    { translateX: x },
                    { translateY: y },
                  ],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Status */}
      {statusText && (
        <Animated.View entering={FadeIn} style={sphereStyles.statusContainer}>
          <View style={[sphereStyles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[sphereStyles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const sphereStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: SPHERE_SIZE + 80,
  },
  container: {
    width: SPHERE_SIZE,
    height: SPHERE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreRing: {
    position: 'absolute',
    width: SPHERE_SIZE * 0.5,
    height: SPHERE_SIZE * 0.5,
    borderRadius: SPHERE_SIZE * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.2)',
    backgroundColor: 'rgba(0, 54, 255, 0.05)',
  },
  particle: {
    position: 'absolute',
    backgroundColor: colors.primary.DEFAULT,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
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
// Call Control Button - Apple-Inspired Premium Design
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

  // Size configurations - Apple uses 62px for main, 54px for secondary
  const sizeConfig = {
    medium: { button: 56, icon: 24 },
    large: { button: 68, icon: 28 },
  };

  // Variant configurations - Apple-style colors
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
            {/* Subtle inner highlight for depth - Apple style */}
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
    // No elevation, no shadows - clean flat design
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
// Minimalist Last Message Display
// =============================================================================

interface LastMessageDisplayProps {
  message?: ConversationMessage;
}

const LastMessageDisplay: React.FC<LastMessageDisplayProps> = ({ message }) => {
  if (!message) {
    return (
      <View style={messageStyles.container}>
        <Text style={messageStyles.hint}>Start speaking to begin...</Text>
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
// Main Component - Premium Redesign
// =============================================================================

export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({
  scenarioId,
  scenario: customScenario,
  accent,
  voice,
  userName,
  onComplete,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  // Get scenario and character
  const scenario = customScenario || (scenarioId ? getScenarioById(scenarioId) : undefined);
  const character = scenario?.characterId ? getCharacter(scenario.characterId) : undefined;

  // UI State
  const [showResultAnimation, setShowResultAnimation] = useState<'success' | 'error' | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectAttemptedRef = useRef(false);
  const autoRecordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Voice Conversation Hook
  const conversation = useVoiceConversation({
    scenario,
    character,
    accent,
    voice,
    userName,
    language: scenario?.language || 'es',
    maxRecordingDuration: 30000,
    autoPlayResponses: true,
    onTranscript: () => {
      haptics.light();
    },
    onStateChange: (newState) => {
      if (newState === 'recording') haptics.light();
    },
    onError: (err) => {
      console.error('[VoiceCall] Error:', err);
      haptics.error();
    },
  });

  const {
    state,
    isConnected,
    isRecording,
    isPlaying,
    messages,
    audioLevel,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    stopPlayback,
  } = conversation;

  // Session timer
  useEffect(() => {
    if (isConnected && !isPaused) {
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
  }, [isConnected, isPaused]);

  // Auto-connect on mount
  useEffect(() => {
    if (!connectAttemptedRef.current && scenario) {
      connectAttemptedRef.current = true;
      connect().catch((err) => {
        console.error('[VoiceCall] Connection failed:', err);
        connectAttemptedRef.current = false;
      });
    }

    return () => {
      disconnect();
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
      }
    };
  }, [scenario]);

  // Always-listening mode: Auto-start recording when AI stops speaking
  useEffect(() => {
    if (autoRecordTimeoutRef.current) {
      clearTimeout(autoRecordTimeoutRef.current);
      autoRecordTimeoutRef.current = null;
    }

    // Start recording automatically when:
    // - Connected and idle (not recording, not playing, not processing)
    // - Not muted or paused
    if (
      isConnected &&
      state === 'connected' &&
      !isRecording &&
      !isPlaying &&
      !isMuted &&
      !isPaused
    ) {
      autoRecordTimeoutRef.current = setTimeout(() => {
        startRecording();
      }, 500); // Small delay after AI finishes
    }

    return () => {
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
      }
    };
  }, [isConnected, state, isRecording, isPlaying, isMuted, isPaused, startRecording]);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    haptics.light();
    setIsMuted((prev) => {
      if (!prev && isRecording) {
        // Muting while recording - stop recording
        stopRecording();
      }
      return !prev;
    });
  }, [haptics, isRecording, stopRecording]);

  // Toggle pause
  const handleTogglePause = useCallback(() => {
    haptics.light();
    setIsPaused((prev) => {
      if (!prev) {
        // Pausing - stop any active recording/playback
        if (isRecording) stopRecording();
        if (isPlaying) stopPlayback();
      }
      return !prev;
    });
  }, [haptics, isRecording, isPlaying, stopRecording, stopPlayback]);

  // End call handler
  // P2 Fix: Enhanced handleEndCall with detailed completion result
  const handleEndCall = useCallback(() => {
    const endReason = state === 'error' ? 'error' : 'user_ended';
    // Consider both messages AND duration for success (same logic as parent)
    const hasEnoughContent = messages.length >= 2 || sessionTime >= 30;
    const success = hasEnoughContent && state !== 'error';

    console.log('[VoiceCallScreen] handleEndCall:', {
      messageCount: messages.length,
      sessionTime,
      state,
      hasEnoughContent,
      success,
    });

    haptics.medium();
    setShowResultAnimation(success ? 'success' : 'error');
    if (success) haptics.success();

    setTimeout(() => {
      setShowResultAnimation(null);
      disconnect();
      onComplete({
        success,
        messages,
        endReason,
        error: error || undefined,
        duration: sessionTime,
      });
    }, 2000);
  }, [messages, state, error, sessionTime, disconnect, onComplete, haptics]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get last message for display
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;

  if (!scenario) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Scenario not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Type Badge - Top Right */}
      <TypeBadge variant="custom" label="CONVERSATION" gradientColors={colors.gradients.primary} />

      {/* Result Animation Overlay */}
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      {/* Minimal Header - Timer only, no close button */}
      <Animated.View
        entering={FadeInDown}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.headerCenter}>
          <View style={styles.timerPill}>
            <View style={[
              styles.liveIndicator,
              { backgroundColor: isPaused ? colors.warning.DEFAULT : isRecording ? colors.error.DEFAULT : colors.success.DEFAULT }
            ]} />
            <Text style={styles.timerText}>{formatTime(sessionTime)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Main Content - Particle Sphere */}
      <View style={styles.content}>
        <ParticleSphere
          state={isPaused ? 'idle' : state}
          audioLevel={audioLevel}
        />

        {/* Last Message Display */}
        <LastMessageDisplay message={lastMessage} />
      </View>

      {/* Bottom Controls - Glow Buttons */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Error State */}
        {state === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error?.message || 'Connection failed'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={connect}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Controls - Apple-style clean buttons */}
        {state !== 'error' && (
          <View style={styles.controlsRow}>
            {/* Mute Button - Primary variant */}
            <CallButton
              icon={isMuted ? 'mic-off' : 'mic'}
              variant="primary"
              size="medium"
              onPress={handleToggleMute}
              active={isMuted}
              label={isMuted ? 'Unmute' : 'Mute'}
            />

            {/* End Call Button - Destructive/Hero */}
            <CallButton
              icon="call"
              variant="destructive"
              size="large"
              onPress={handleEndCall}
              label="End"
            />

            {/* Pause Button - Secondary variant */}
            <CallButton
              icon={isPaused ? 'play' : 'pause'}
              variant="secondary"
              size="medium"
              onPress={handleTogglePause}
              active={isPaused}
              label={isPaused ? 'Resume' : 'Pause'}
            />
          </View>
        )}

      </View>
    </View>
  );
};

// =============================================================================
// Styles - Premium Minimalist Design
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Header - Centered timer only
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

  // Content - Centered
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Overlay
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)', // dark overlay for modal backdrop
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default VoiceCallScreen;
