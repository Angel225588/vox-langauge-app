/**
 * WritingEditor - Full-Screen Notion-Style Editor
 *
 * Clean, distraction-free writing experience:
 * - Editable title field
 * - Large text area with real-time word count
 * - Minimal toolbar (font size, basic formatting)
 * - Auto-save draft capability
 * - Complete button when ready
 *
 * Design: Notion + Obsidian + Google Keep inspired
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import type { WritingTask, TaskCategory } from './types';

interface WritingEditorProps {
  task: WritingTask;
  initialTitle?: string;
  initialContent?: string;
  onComplete: (title: string, content: string) => void;
  onSaveDraft?: (title: string, content: string) => void;
  onBack?: () => void;
}

const FONT_SIZES = [
  { label: 'S', size: 16 },
  { label: 'M', size: 18 },
  { label: 'L', size: 20 },
];

export function WritingEditor({
  task,
  initialTitle = '',
  initialContent = '',
  onComplete,
  onSaveDraft,
  onBack,
}: WritingEditorProps) {
  const haptics = useHaptics();
  const contentInputRef = useRef<TextInput>(null);
  const [title, setTitle] = useState(initialTitle || task.title);
  const [content, setContent] = useState(initialContent);
  const [fontSize, setFontSize] = useState(1); // Index into FONT_SIZES
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [startTime] = useState(Date.now());

  const buttonScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const minWords = task.minWords || 0;
  const maxWords = task.maxWords || 500;
  const progress = Math.min(wordCount / Math.max(minWords, 1), 1);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Update progress animation
  useEffect(() => {
    progressWidth.value = withTiming(progress * 100, { duration: 300 });
  }, [progress]);

  const handleComplete = useCallback(() => {
    if (wordCount < minWords) {
      haptics.warning();
      return;
    }
    haptics.success();
    onComplete(title, content);
  }, [title, content, wordCount, minWords, haptics, onComplete]);

  const handleSaveDraft = useCallback(() => {
    haptics.light();
    onSaveDraft?.(title, content);
  }, [title, content, haptics, onSaveDraft]);

  const handleFontSizeChange = useCallback((index: number) => {
    haptics.light();
    setFontSize(index);
  }, [haptics]);

  const handleTitleSubmit = useCallback(() => {
    contentInputRef.current?.focus();
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const isComplete = wordCount >= minWords;
  const isOverLimit = maxWords && wordCount > maxWords;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {/* Font Size Toggle */}
          <View style={styles.fontSizeToggle}>
            {FONT_SIZES.map((fs, index) => (
              <TouchableOpacity
                key={fs.label}
                onPress={() => handleFontSizeChange(index)}
                style={[
                  styles.fontSizeButton,
                  fontSize === index && styles.fontSizeButtonActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.fontSizeLabel,
                    fontSize === index && styles.fontSizeLabelActive,
                  ]}
                >
                  {fs.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Draft */}
          {onSaveDraft && (
            <TouchableOpacity
              onPress={handleSaveDraft}
              style={styles.saveButton}
              activeOpacity={0.7}
            >
              <Ionicons name="save-outline" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Editor Content */}
      <ScrollView
        style={styles.editorScroll}
        contentContainerStyle={styles.editorContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={colors.text.disabled}
            returnKeyType="next"
            onSubmitEditing={handleTitleSubmit}
            blurOnSubmit={false}
            maxLength={100}
          />
        </Animated.View>

        {/* Task Reminder - Subtle */}
        <Animated.View
          entering={FadeIn.duration(300).delay(200)}
          style={styles.taskReminder}
        >
          <Ionicons name="information-circle-outline" size={14} color={colors.text.disabled} />
          <Text style={styles.taskReminderText} numberOfLines={2}>
            {task.scenario}
          </Text>
        </Animated.View>

        {/* Content Input */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.contentContainer}
        >
          <TextInput
            ref={contentInputRef}
            style={[styles.contentInput, { fontSize: FONT_SIZES[fontSize].size }]}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing..."
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar */}
      <Animated.View
        entering={FadeIn.duration(300).delay(400)}
        style={[styles.bottomBar, isKeyboardVisible && styles.bottomBarCompact]}
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.wordCountRow}>
            <Text style={[
              styles.wordCount,
              isComplete ? styles.wordCountComplete : undefined,
              isOverLimit ? styles.wordCountOver : undefined,
            ]}>
              {wordCount}
            </Text>
            <Text style={styles.wordTarget}>
              {minWords > 0 ? `/ ${minWords}` : ''} words
            </Text>
            {isComplete && !isOverLimit && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success.DEFAULT}
                style={styles.checkIcon}
              />
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                progressBarStyle,
                isComplete ? styles.progressBarComplete : undefined,
                isOverLimit ? styles.progressBarOver : undefined,
              ]}
            />
          </View>
        </View>

        {/* Complete Button */}
        <Animated.View style={[buttonStyle, styles.completeButtonWrapper]}>
          <TouchableOpacity
            onPress={handleComplete}
            activeOpacity={0.9}
            disabled={!isComplete}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
            }}
            style={[styles.completeButton, !isComplete && styles.completeButtonDisabled]}
          >
            <LinearGradient
              colors={isComplete ? colors.gradients.primary : [colors.background.elevated, colors.background.elevated]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeButtonGradient}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color={isComplete ? colors.text.primary : colors.text.disabled}
              />
              <Text style={[
                styles.completeButtonText,
                !isComplete && styles.completeButtonTextDisabled,
              ]}>
                Complete
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fontSizeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  fontSizeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  fontSizeButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  fontSizeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  fontSizeLabelActive: {
    color: colors.text.primary,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  editorScroll: {
    flex: 1,
  },
  editorContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  titleInput: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  taskReminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  taskReminderText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  contentContainer: {
    minHeight: 300,
  },
  contentInput: {
    color: colors.text.primary,
    lineHeight: 28,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
    gap: spacing.lg,
  },
  bottomBarCompact: {
    paddingVertical: spacing.md,
  },
  progressSection: {
    flex: 1,
  },
  wordCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  wordCount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  wordCountComplete: {
    color: colors.success.DEFAULT,
  },
  wordCountOver: {
    color: colors.error.DEFAULT,
  },
  wordTarget: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,
  },
  progressBarComplete: {
    backgroundColor: colors.success.DEFAULT,
  },
  progressBarOver: {
    backgroundColor: colors.error.DEFAULT,
  },
  completeButtonWrapper: {
    flexShrink: 0,
  },
  completeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  completeButtonDisabled: {
    ...shadows.sm,
    shadowColor: 'transparent',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  completeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  completeButtonTextDisabled: {
    color: colors.text.disabled,
  },
});
