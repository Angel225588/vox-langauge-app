/**
 * Voice Call Screen Component - Premium Redesign
 *
 * Minimalist, modern voice conversation interface featuring:
 * - Animated particle sphere that responds to audio
 * - Glow buttons with visual hierarchy
 * - Always-listening mode (no push-to-talk)
 * - Clean, focused design
 *
 * @example
 * ```tsx
 * <VoiceCallScreen
 *   scenario={scenario}
 *   accent="es-latam"
 *   onComplete={(success, messages) => console.log('Done!')}
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
  /** Callback when call ends */
  onComplete: (isSuccess: boolean, messages: ConversationMessage[]) => void;
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

// =============================================================================
// Glow Button Component - Premium Control Buttons
// =============================================================================

interface GlowButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  color: string;
  glowColor: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  label?: string;
}

const GlowButton: React.FC<GlowButtonProps> = ({
  icon,
  size = 'medium',
  color,
  glowColor,
  onPress,
  disabled = false,
  active = false,
  label,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(active ? 0.5 : 0.2);

  useEffect(() => {
    if (active) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0.2);
    }
  }, [active]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const sizeConfig = {
    small: { button: 48, icon: 20, glow: 64 },
    medium: { button: 56, icon: 24, glow: 72 },
    large: { button: 72, icon: 32, glow: 96 },
  };

  const config = sizeConfig[size];

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <View style={glowButtonStyles.wrapper}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          { opacity: disabled ? 0.4 : pressed ? 0.9 : 1 },
        ]}
      >
        <Animated.View style={buttonStyle}>
          {/* Glow */}
          <Animated.View
            style={[
              glowButtonStyles.glow,
              glowStyle,
              {
                width: config.glow,
                height: config.glow,
                borderRadius: config.glow / 2,
                backgroundColor: glowColor,
              },
            ]}
          />
          {/* Button */}
          <View
            style={[
              glowButtonStyles.button,
              {
                width: config.button,
                height: config.button,
                borderRadius: config.button / 2,
                backgroundColor: color,
              },
            ]}
          >
            <Ionicons name={icon} size={config.icon} color="#FFFFFF" />
          </View>
        </Animated.View>
      </Pressable>
      {label && <Text style={glowButtonStyles.label}>{label}</Text>}
    </View>
  );
};

const glowButtonStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
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
    minHeight: 80,
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
  const handleEndCall = useCallback(() => {
    const success = messages.length >= 2; // 2+ messages = at least 1 exchange
    haptics.medium();

    setShowResultAnimation(success ? 'success' : 'error');
    if (success) haptics.success();

    setTimeout(() => {
      setShowResultAnimation(null);
      disconnect();
      onComplete(success, messages);
    }, 2000);
  }, [messages, disconnect, onComplete, haptics]);

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
      {/* Result Animation Overlay */}
      {showResultAnimation && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lottieOverlay}>
          {showResultAnimation === 'success' ? <LottieSuccess /> : <LottieError />}
        </Animated.View>
      )}

      {/* Minimal Header */}
      <Animated.View
        entering={FadeInDown}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}

        <View style={styles.headerCenter}>
          <View style={styles.timerPill}>
            <View style={[
              styles.liveIndicator,
              { backgroundColor: isPaused ? colors.warning.DEFAULT : isRecording ? colors.error.DEFAULT : colors.success.DEFAULT }
            ]} />
            <Text style={styles.timerText}>{formatTime(sessionTime)}</Text>
          </View>
        </View>

        <View style={styles.headerRight} />
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

        {/* Controls */}
        {state !== 'error' && (
          <View style={styles.controlsRow}>
            {/* Mute Button */}
            <GlowButton
              icon={isMuted ? 'mic-off' : 'mic'}
              size="medium"
              color={isMuted ? colors.text.tertiary : colors.background.elevated}
              glowColor={isMuted ? colors.text.tertiary : colors.primary.DEFAULT}
              onPress={handleToggleMute}
              active={!isMuted && isRecording}
              label={isMuted ? 'Unmute' : 'Mute'}
            />

            {/* End Call Button - Primary/Largest */}
            <GlowButton
              icon="call"
              size="large"
              color="#EF4444"
              glowColor="#EF4444"
              onPress={handleEndCall}
              label="End"
            />

            {/* Pause Button */}
            <GlowButton
              icon={isPaused ? 'play' : 'pause'}
              size="medium"
              color={isPaused ? colors.warning.DEFAULT : colors.background.elevated}
              glowColor={isPaused ? colors.warning.DEFAULT : colors.primary.DEFAULT}
              onPress={handleTogglePause}
              active={isPaused}
              label={isPaused ? 'Resume' : 'Pause'}
            />
          </View>
        )}

        {/* Status Text */}
        <Text style={styles.statusText}>
          {state === 'connecting'
            ? 'Connecting...'
            : isPaused
            ? 'Conversation paused'
            : isMuted
            ? 'Microphone muted'
            : isRecording
            ? 'Listening...'
            : isPlaying
            ? 'Speaking...'
            : state === 'processing'
            ? 'Thinking...'
            : 'Ready to listen'}
        </Text>
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

  // Header - Minimal
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
    color: '#FFFFFF',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  // Overlay
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default VoiceCallScreen;
