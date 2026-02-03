/**
 * TeleprompterEditModal
 *
 * Full-screen modal for editing script text:
 * - Large text input area
 * - Word/character count
 * - Save/Cancel buttons
 * - Keyboard-aware layout
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

export interface EditModalProps {
  visible: boolean;
  text: string;
  onSave: (newText: string) => void;
  onCancel: () => void;
  title?: string;
}

export function TeleprompterEditModal({
  visible,
  text,
  onSave,
  onCancel,
  title = 'Edit Script',
}: EditModalProps) {
  const insets = useSafeAreaInsets();
  const [editedText, setEditedText] = useState(text);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Reset text when modal opens
  useEffect(() => {
    if (visible) {
      setEditedText(text);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [visible, text]);

  // Track keyboard visibility
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Keyboard.dismiss();
    onSave(editedText.trim());
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    onCancel();
  };

  // Word and character counts
  const wordCount = editedText.trim() ? editedText.trim().split(/\s+/).length : 0;
  const charCount = editedText.length;

  // Estimated reading time at 150 WPM
  const estimatedMinutes = Math.ceil(wordCount / 150);

  const hasChanges = editedText !== text;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            entering={SlideInUp.duration(300).springify()}
            exiting={SlideOutDown.duration(200)}
            style={[
              styles.container,
              {
                paddingTop: insets.top + spacing.md,
                paddingBottom: isKeyboardVisible ? spacing.md : insets.bottom + spacing.md,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <Text style={styles.title}>{title}</Text>

              <TouchableOpacity
                style={[styles.headerButton, styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!hasChanges}
              >
                <Text style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.stat}>
                <Ionicons name="document-text-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.statText}>{wordCount} words</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Ionicons name="text-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.statText}>{charCount} chars</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.statText}>~{estimatedMinutes} min read</Text>
              </View>
            </View>

            {/* Text Input */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={editedText}
                onChangeText={setEditedText}
                multiline
                textAlignVertical="top"
                placeholder="Enter your script here..."
                placeholderTextColor={colors.text.disabled}
                autoCorrect={false}
                autoCapitalize="sentences"
              />
            </ScrollView>

            {/* Tips (shown when not editing) */}
            {!isKeyboardVisible && (
              <View style={styles.tips}>
                <View style={styles.tip}>
                  <Ionicons name="bulb-outline" size={14} color={colors.primary.light} />
                  <Text style={styles.tipText}>
                    Use line breaks to create natural pauses
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    marginTop: 60,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 70,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  saveButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  saveText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  saveTextDisabled: {
    color: colors.text.disabled,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: spacing.md,
  },

  // Text Input
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.fontSize.lg * 1.6,
    color: colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 200,
  },

  // Tips
  tips: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});

export default TeleprompterEditModal;
