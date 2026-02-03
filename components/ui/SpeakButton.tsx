/**
 * SpeakButton - Primary Recording Button
 *
 * Full-width gradient button for speech recording.
 * Changes appearance when recording (primary → error gradient).
 *
 * Usage:
 * ```tsx
 * <SpeakButton
 *   isRecording={isRecording}
 *   onPress={handleRecord}
 * />
 * ```
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';

export interface SpeakButtonProps {
  /** Whether currently recording */
  isRecording?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Custom label (default: "Speak" / "Stop Recording") */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

export function SpeakButton({
  isRecording = false,
  onPress,
  label,
  disabled = false,
  style,
}: SpeakButtonProps) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(
      isRecording
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
    onPress();
  };

  const displayLabel = label ?? (isRecording ? 'Stop Recording' : 'Speak');

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
      style={[styles.button, disabled && styles.buttonDisabled, style]}
    >
      <LinearGradient
        colors={isRecording ? colors.gradients.error : colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={24}
          color={colors.text.primary}
        />
        <Text style={styles.label}>{displayLabel}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});

export default SpeakButton;
