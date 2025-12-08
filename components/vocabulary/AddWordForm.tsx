/**
 * AddWordForm Component
 *
 * Form for adding new words to the vocabulary bank.
 * Includes validation and all necessary input fields.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '@/constants/designSystem';
import {
  AddWordInput,
  CEFRLevel,
  PartOfSpeech,
  WordSource,
} from '@/lib/word-bank';

interface AddWordFormProps {
  onSubmit: (input: AddWordInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const PARTS_OF_SPEECH: { value: PartOfSpeech; label: string }[] = [
  { value: 'noun', label: 'Noun' },
  { value: 'verb', label: 'Verb' },
  { value: 'adjective', label: 'Adjective' },
  { value: 'adverb', label: 'Adverb' },
  { value: 'phrase', label: 'Phrase' },
  { value: 'other', label: 'Other' },
];

export function AddWordForm({ onSubmit, onCancel, loading = false }: AddWordFormProps) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState('');
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel | undefined>(undefined);
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('other');
  const [exampleSentence, setExampleSentence] = useState('');
  const [error, setError] = useState('');

  const handleCefrLevelPress = async (level: CEFRLevel) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCefrLevel(level);
  };

  const handlePartOfSpeechPress = async (pos: PartOfSpeech) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPartOfSpeech(pos);
  };

  const handleSubmit = async () => {
    // Validation
    if (!word.trim()) {
      setError('Word is required');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!translation.trim()) {
      setError('Translation is required');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError('');

    const input: AddWordInput = {
      word: word.trim(),
      translation: translation.trim(),
      source: 'manual' as WordSource,
      ...(category.trim() && { category: category.trim() }),
      ...(cefrLevel && { cefrLevel }),
      partOfSpeech,
      ...(exampleSentence.trim() && {
        exampleSentences: [exampleSentence.trim()],
      }),
    };

    await onSubmit(input);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Word Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Word <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={word}
            onChangeText={(text) => {
              setWord(text);
              setError('');
            }}
            placeholder="Enter word"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {/* Translation Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Translation <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={translation}
            onChangeText={(text) => {
              setTranslation(text);
              setError('');
            }}
            placeholder="Enter translation"
            placeholderTextColor={colors.text.tertiary}
            editable={!loading}
          />
        </View>

        {/* Category Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., food, travel, verbs"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* CEFR Level Selector */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>CEFR Level</Text>
          <View style={styles.cefrContainer}>
            {CEFR_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => handleCefrLevelPress(level)}
                activeOpacity={0.7}
                disabled={loading}
                style={[
                  styles.cefrButton,
                  cefrLevel === level && styles.cefrButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.cefrButtonText,
                    cefrLevel === level && styles.cefrButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Part of Speech Selector */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Part of Speech</Text>
          <View style={styles.partOfSpeechContainer}>
            {PARTS_OF_SPEECH.map((pos) => (
              <TouchableOpacity
                key={pos.value}
                onPress={() => handlePartOfSpeechPress(pos.value)}
                activeOpacity={0.7}
                disabled={loading}
                style={[
                  styles.partOfSpeechButton,
                  partOfSpeech === pos.value && styles.partOfSpeechButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.partOfSpeechButtonText,
                    partOfSpeech === pos.value && styles.partOfSpeechButtonTextActive,
                  ]}
                >
                  {pos.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Example Sentence Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Example Sentence</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={exampleSentence}
            onChangeText={setExampleSentence}
            placeholder="Enter an example sentence"
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Cancel Button */}
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.7}
          disabled={loading}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={loading}
          style={styles.submitButtonWrapper}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.submitButtonText}>Add Word</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error.DEFAULT,
  },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.error.DEFAULT,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.DEFAULT,
    textAlign: 'center',
  },
  cefrContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cefrButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 50,
    alignItems: 'center',
  },
  cefrButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  cefrButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  cefrButtonTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  partOfSpeechContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  partOfSpeechButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  partOfSpeechButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  partOfSpeechButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  partOfSpeechButtonTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  submitButtonWrapper: {
    flex: 2,
  },
  submitButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
