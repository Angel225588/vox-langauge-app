import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { RecordingState, FontSize } from '@/components/cards/TeleprompterCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TeleprompterControlsProps {
  recordingState: RecordingState;
  isPaused: boolean;
  onRecord: () => void;
  onPausePlay: () => void;
  onStop: () => void;
  onHearWord: () => void;
  onFontSize: () => void;
  fontSize: FontSize;
}

export function TeleprompterControls({
  recordingState,
  isPaused,
  onRecord,
  onPausePlay,
  onStop,
  onHearWord,
  onFontSize,
  fontSize,
}: TeleprompterControlsProps) {
  const insets = useSafeAreaInsets();

  // Pulse animation for record button when recording
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (recordingState === 'recording' && !isPaused) {
      pulseScale.value = withRepeat(
        withTiming(1.4, { duration: 1000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1);
      pulseOpacity.value = withTiming(0);
    }
  }, [recordingState, isPaused]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Button press animation
  const buttonScale = useSharedValue(1);

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Get font size indicator
  const fontSizeLabel = fontSize === 'small' ? 'A' : fontSize === 'medium' ? 'A' : 'A';
  const fontSizeIndicator = fontSize === 'small' ? 'S' : fontSize === 'medium' ? 'M' : 'L';

  // Determine record button appearance
  const isRecording = recordingState === 'recording' && !isPaused;
  const recordGradient = isRecording
    ? colors.gradients.error
    : colors.gradients.success;

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(500)}
      style={[
        styles.container,
        { paddingBottom: insets.bottom + spacing.md },
      ]}
    >
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        <View style={styles.controlsRow}>
          {/* Hear Word Button */}
          <TouchableOpacity
            onPress={onHearWord}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <View style={styles.secondaryButtonInner}>
              <Text style={styles.buttonIcon}>🔊</Text>
            </View>
            <Text style={styles.buttonLabel}>Line</Text>
          </TouchableOpacity>

          {/* Font Size Button */}
          <TouchableOpacity
            onPress={onFontSize}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <View style={styles.secondaryButtonInner}>
              <Text style={styles.fontSizeText}>Aa</Text>
              <View style={styles.fontSizeIndicator}>
                <Text style={styles.fontSizeIndicatorText}>{fontSizeIndicator}</Text>
              </View>
            </View>
            <Text style={styles.buttonLabel}>Size</Text>
          </TouchableOpacity>

          {/* Record Button (Center, Large) */}
          <View style={styles.recordButtonContainer}>
            {/* Pulse rings */}
            {isRecording && (
              <>
                <Animated.View style={[styles.pulseRing, styles.pulseRing1, pulseStyle]} />
                <Animated.View style={[styles.pulseRing, styles.pulseRing2, pulseStyle]} />
              </>
            )}

            <TouchableOpacity
              onPress={onRecord}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.9}
            >
              <Animated.View style={buttonAnimatedStyle}>
                <LinearGradient
                  colors={recordGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordButtonRecording,
                  ]}
                >
                  <Text style={styles.recordButtonIcon}>
                    {recordingState === 'idle' ? '⏺️' : isRecording ? '⏸️' : '▶️'}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Pause/Play Button */}
          <TouchableOpacity
            onPress={onPausePlay}
            activeOpacity={0.8}
            style={styles.secondaryButton}
            disabled={recordingState === 'idle'}
          >
            <View style={[
              styles.secondaryButtonInner,
              recordingState === 'idle' && styles.buttonDisabled,
            ]}>
              <Text style={styles.buttonIcon}>{isPaused ? '▶️' : '⏸️'}</Text>
            </View>
            <Text style={styles.buttonLabel}>{isPaused ? 'Play' : 'Pause'}</Text>
          </TouchableOpacity>

          {/* Stop Button */}
          <TouchableOpacity
            onPress={onStop}
            activeOpacity={0.8}
            style={styles.secondaryButton}
            disabled={recordingState === 'idle'}
          >
            <View style={[
              styles.secondaryButtonInner,
              styles.stopButton,
              recordingState === 'idle' && styles.buttonDisabled,
            ]}>
              <Text style={styles.buttonIcon}>⏹️</Text>
            </View>
            <Text style={styles.buttonLabel}>Stop</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  blurContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(26, 31, 58, 0.85)',
  },
  secondaryButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  secondaryButtonInner: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  stopButton: {
    borderColor: colors.error.dark,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonLabel: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  fontSizeText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  fontSizeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 6,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeIndicatorText: {
    color: colors.text.primary,
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
  },
  recordButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: colors.error.DEFAULT,
  },
  pulseRing1: {
    width: 72,
    height: 72,
  },
  pulseRing2: {
    width: 90,
    height: 90,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  recordButtonRecording: {
    shadowColor: colors.glow.error,
  },
  recordButtonIcon: {
    fontSize: 28,
  },
});
