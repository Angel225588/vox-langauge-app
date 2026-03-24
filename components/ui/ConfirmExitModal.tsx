/**
 * ConfirmExitModal — Premium exit confirmation for all session screens.
 *
 * Shows a professional confirmation dialog when a user tries to leave
 * a lesson, flashcard session, or stair session mid-progress.
 *
 * Design: Glass modal with two clear options — "Keep Learning" (primary)
 * and "End Session" (subtle). No guilt-tripping, no gamification pressure.
 * Just a respectful confirmation.
 *
 * Usage:
 *   <ConfirmExitModal
 *     visible={showConfirm}
 *     onContinue={() => setShowConfirm(false)}
 *     onExit={handleRealExit}
 *     progress="3 of 5 activities completed"
 *   />
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

interface ConfirmExitModalProps {
  visible: boolean;
  onContinue: () => void;
  onExit: () => void;
  progress?: string;
}

export function ConfirmExitModal({
  visible,
  onContinue,
  onExit,
  progress,
}: ConfirmExitModalProps) {
  const handleExit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onExit();
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinue();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}
    >
      <Pressable style={styles.overlay} onPress={onContinue}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="pause-circle-outline" size={36} color={colors.text.secondary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>End this session?</Text>

          {/* Progress context */}
          {progress ? (
            <Text style={styles.progress}>{progress}</Text>
          ) : (
            <Text style={styles.progress}>Your progress so far will be saved.</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueText}>Keep Learning</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExit}
              activeOpacity={0.8}
            >
              <Text style={styles.exitText}>End Session</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progress: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttons: {
    width: '100%',
    gap: spacing.sm,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
  },
  continueText: {
    fontSize: typography.fontSize.md,
    fontFamily: fonts.display.semiBold,
    color: '#FFFFFF',
  },
  exitButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  exitText: {
    fontSize: typography.fontSize.md,
    fontFamily: fonts.body.medium,
    color: colors.text.tertiary,
  },
});
