/**
 * PreSessionScreen Demo
 *
 * Interactive demo for testing and showcasing the PreSessionScreen component.
 * Use this file to quickly test the component in development.
 *
 * To use:
 * 1. Import this component in your app
 * 2. Render it in a screen
 * 3. Interact with buttons to see different scenarios
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { PreSessionScreen } from './PreSessionScreen';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export function PreSessionScreenDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [sessionNumber, setSessionNumber] = useState<number | undefined>(1);

  // Sample passages for each difficulty
  const passages = {
    beginner: {
      title: 'Greetings and Basic Phrases',
      difficulty: 'beginner' as const,
      wordCount: 80,
      estimatedDuration: 60,
    },
    intermediate: {
      title: 'Planning Your Dream Vacation',
      difficulty: 'intermediate' as const,
      wordCount: 250,
      estimatedDuration: 180,
    },
    advanced: {
      title: 'Understanding Global Economic Trends',
      difficulty: 'advanced' as const,
      wordCount: 450,
      estimatedDuration: 320,
    },
  };

  const handleStart = () => {
    console.log('🎉 Start button pressed!');
    console.log('Passage:', passages[difficulty]);
    console.log('Session:', sessionNumber);
    alert(`Starting ${difficulty} passage with ${passages[difficulty].wordCount} words!`);
  };

  const handleBack = () => {
    console.log('⬅️ Back button pressed!');
    setShowDemo(false);
  };

  if (showDemo) {
    return (
      <PreSessionScreen
        passage={passages[difficulty]}
        sessionNumber={sessionNumber}
        onStart={handleStart}
        onBack={handleBack}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PreSessionScreen Demo</Text>
        <Text style={styles.subtitle}>Test different configurations</Text>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Difficulty:</Text>
          <View style={styles.buttonGroup}>
            {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  difficulty === level && styles.optionButtonActive,
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.optionText,
                    difficulty === level && styles.optionTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Number Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Number:</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.optionButton, sessionNumber === undefined && styles.optionButtonActive]}
              onPress={() => setSessionNumber(undefined)}
            >
              <Text
                style={[
                  styles.optionText,
                  sessionNumber === undefined && styles.optionTextActive,
                ]}
              >
                None
              </Text>
            </TouchableOpacity>
            {[1, 2, 3, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.optionButton,
                  sessionNumber === num && styles.optionButtonActive,
                ]}
                onPress={() => setSessionNumber(num)}
              >
                <Text
                  style={[
                    styles.optionText,
                    sessionNumber === num && styles.optionTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Passage Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Passage:</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{passages[difficulty].title}</Text>
            <Text style={styles.previewMeta}>
              {passages[difficulty].wordCount} words · {passages[difficulty].estimatedDuration}s
            </Text>
            <Text style={styles.previewDifficulty}>
              Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </View>
        </View>

        {/* Launch Button */}
        <TouchableOpacity style={styles.launchButton} onPress={() => setShowDemo(true)}>
          <Text style={styles.launchButtonText}>Launch PreSession Screen</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Demo Features</Text>
          <Text style={styles.infoText}>
            • 7 random motivational quotes{'\n'}
            • Glassmorphic design with gradients{'\n'}
            • Staggered fade-in animations{'\n'}
            • Pulse animation on start button{'\n'}
            • Haptic feedback on interactions{'\n'}
            • Difficulty color coding{'\n'}
            • Session tracking display
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  optionTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  previewCard: {
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  previewTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  previewMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  previewDifficulty: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  launchButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  launchButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  infoCard: {
    backgroundColor: colors.background.elevated,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.6,
  },
});
