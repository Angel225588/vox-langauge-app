/**
 * CantSpeakButton - Secondary Skip Button
 *
 * Subtle text button for users who can't speak (public setting, etc.).
 * Appears as a secondary action below the main SpeakButton.
 *
 * Usage:
 * ```tsx
 * <CantSpeakButton onPress={handleCantSpeak} />
 * ```
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/constants/designSystem';

export interface CantSpeakButtonProps {
  /** Press handler */
  onPress: () => void;
  /** Custom label (default: "I can't speak right now") */
  label?: string;
  /** Custom style */
  style?: ViewStyle;
}

export function CantSpeakButton({
  onPress,
  label = "I can't speak right now",
  style,
}: CantSpeakButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.button, style]}
    >
      <Ionicons name="volume-mute" size={18} color={colors.text.tertiary} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
});

export default CantSpeakButton;
