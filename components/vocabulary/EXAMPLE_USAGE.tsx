/**
 * EXAMPLE USAGE - AddWordModal Component
 *
 * This file demonstrates how to use the AddWordModal in your screens.
 * Copy and modify as needed for your specific use case.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AddWordModal } from './AddWordModal';
import { BankWord, useWordBank } from '@/lib/word-bank';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

/**
 * Example 1: Basic Usage in a Screen
 */
export function VocabularyScreenExample() {
  const [modalVisible, setModalVisible] = useState(false);
  const { words, refresh, loading } = useWordBank();

  const handleWordAdded = async (word: BankWord) => {
    console.log('New word added:', word);
    // Refresh the word list to show the new word
    await refresh();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Vocabulary</Text>

      {/* Add Word Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add New Word</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Word List */}
      <View style={styles.wordList}>
        {words.map((word) => (
          <View key={word.id} style={styles.wordItem}>
            <Text style={styles.wordText}>{word.word}</Text>
            <Text style={styles.translationText}>{word.translation}</Text>
          </View>
        ))}
      </View>

      {/* Add Word Modal */}
      <AddWordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onWordAdded={handleWordAdded}
      />
    </View>
  );
}

/**
 * Example 2: Using with FloatingActionButton
 */
export function VocabularyScreenWithFAB() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Your screen content */}
      <Text style={styles.title}>Vocabulary Bank</Text>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.fabGradient}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Word Modal */}
      <AddWordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onWordAdded={(word) => {
          console.log('Word added:', word);
        }}
      />
    </View>
  );
}

/**
 * Example 3: Using without the modal wrapper (standalone form)
 */
export function StandaloneFormExample() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (input: any) => {
    setLoading(true);
    try {
      const { addWord } = await import('@/lib/word-bank');
      const newWord = await addWord(input);
      console.log('Word added:', newWord);
      // Navigate away or show success message
    } catch (error) {
      console.error('Error adding word:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back or close form
    console.log('Form cancelled');
  };

  return (
    <View style={styles.container}>
      {/* Use AddWordForm directly without modal */}
      {/* Note: You'll need to import AddWordForm directly */}
      {/* <AddWordForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  addButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  addButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  wordList: {
    flex: 1,
    gap: spacing.md,
  },
  wordItem: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  wordText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  translationText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: -4, // Optical adjustment for centering
  },
});
