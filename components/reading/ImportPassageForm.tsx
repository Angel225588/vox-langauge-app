/**
 * Import Passage Form Component
 *
 * Form for users to import their own text for reading practice.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Passage } from '@/lib/reading/types';
import { validatePassage } from '@/lib/reading/passageStorage';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface ImportPassageFormProps {
  onImport: (passage: Passage) => void;
  onCancel: () => void;
  initialValues?: Partial<Passage>;
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ImportPassageForm: React.FC<ImportPassageFormProps> = ({
  onImport,
  onCancel,
  initialValues,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [text, setText] = useState(initialValues?.text || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialValues?.difficulty || 'beginner'
  );
  const [category, setCategory] = useState(initialValues?.category || '');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate text stats
  const stats = useMemo(() => {
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;
    const estimatedMinutes = Math.ceil(wordCount / 180); // ~180 words per minute reading

    return {
      wordCount,
      charCount,
      estimatedMinutes,
    };
  }, [text]);

  // Validate form
  const validate = useCallback(() => {
    const passage = {
      title: title.trim(),
      text: text.trim(),
      difficulty,
      category: category.trim() || 'custom',
    };

    const validation = validatePassage(passage);
    setErrors(validation.errors);

    return validation.valid;
  }, [title, text, difficulty, category]);

  // Handle import
  const handleImport = useCallback(() => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const passage: Passage = {
      id: `user_passage_${Date.now()}`,
      title: title.trim(),
      text: text.trim(),
      difficulty,
      category: category.trim() || 'custom',
      wordCount: stats.wordCount,
      estimatedDuration: stats.estimatedMinutes * 60,
      sourceType: 'user_imported',
      createdAt: new Date().toISOString(),
    };

    onImport(passage);
  }, [title, text, difficulty, category, stats, validate, onImport]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  }, [onCancel]);

  // Toggle preview
  const togglePreview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPreview(!showPreview);
  }, [showPreview]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a title for your passage"
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Text Content Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Text Content <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Paste or type your reading passage here..."
            placeholderTextColor={colors.text.tertiary}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />

          {/* Text Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.wordCount}</Text>
              <Text style={styles.statLabel}>words</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.charCount}</Text>
              <Text style={styles.statLabel}>characters</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.estimatedMinutes}</Text>
              <Text style={styles.statLabel}>min read</Text>
            </View>
          </View>
        </View>

        {/* Difficulty Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Difficulty <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.difficultyRow}>
            <DifficultyButton
              label="Beginner"
              active={difficulty === 'beginner'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDifficulty('beginner');
              }}
            />
            <DifficultyButton
              label="Intermediate"
              active={difficulty === 'intermediate'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDifficulty('intermediate');
              }}
            />
            <DifficultyButton
              label="Advanced"
              active={difficulty === 'advanced'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDifficulty('advanced');
              }}
            />
          </View>
        </View>

        {/* Category Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., work, travel, hobbies..."
            placeholderTextColor={colors.text.tertiary}
            value={category}
            onChangeText={setCategory}
            maxLength={50}
          />
          <Text style={styles.hint}>Help organize your custom passages</Text>
        </View>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <View key={index} style={styles.errorRow}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Preview Toggle */}
        {text.trim().length > 0 && (
          <TouchableOpacity
            onPress={togglePreview}
            style={styles.previewToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.previewToggleText}>
              {showPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Preview */}
        {showPreview && text.trim().length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>{title || 'Untitled'}</Text>
            <Text style={styles.previewText}>{text}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.cancelButton}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImport}
            activeOpacity={0.8}
            disabled={stats.wordCount < 20}
            style={styles.importButtonWrapper}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.importButton,
                stats.wordCount < 20 && styles.importButtonDisabled,
              ]}
            >
              <Text style={styles.importButtonText}>Import Passage</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

interface DifficultyButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const DifficultyButton: React.FC<DifficultyButtonProps> = ({ label, active, onPress }) => {
  const getDifficultyColor = () => {
    switch (label.toLowerCase()) {
      case 'beginner': return colors.success.DEFAULT;
      case 'intermediate': return colors.warning.DEFAULT;
      case 'advanced': return colors.error.DEFAULT;
      default: return colors.primary.DEFAULT;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.difficultyButton,
        active && { borderColor: getDifficultyColor(), backgroundColor: getDifficultyColor() + '20' },
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.difficultyButtonText,
          active && { color: getDifficultyColor() },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error.DEFAULT,
  },
  input: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textArea: {
    minHeight: 200,
    maxHeight: 300,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.light,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: colors.error.DEFAULT + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.DEFAULT,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  errorIcon: {
    fontSize: typography.fontSize.base,
    marginRight: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.light,
    flex: 1,
  },
  previewToggle: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  previewToggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  previewContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT + '30',
  },
  previewTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  previewText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  importButtonWrapper: {
    flex: 1,
  },
  importButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  importButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});

export default ImportPassageForm;
