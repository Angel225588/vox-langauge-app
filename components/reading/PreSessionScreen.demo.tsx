/**
 * PreSessionScreen Demo
 *
 * Interactive demo for testing and showcasing the PreSessionScreen component.
 * Use this file to quickly test the component in development.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { PreSessionScreen } from './PreSessionScreen';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';

type DemoMode = 'reading' | 'voice' | 'minimal';

const DEMO_CONFIGS = {
  reading: {
    title: 'My Trip to Barcelona',
    subtitle: 'A story about discovering Spanish culture',
    category: 'Travel',
    difficulty: 'intermediate' as const,
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    metaValue1: '3 min',
    metaLabel1: 'duration',
    metaValue2: '250',
    metaLabel2: 'words',
    primaryButtonText: 'Start Reading',
    secondaryButtonText: 'Preview Vocabulary',
    expectations: [
      { icon: '🎯', text: 'Read at your own pace with auto-scrolling' },
      { icon: '🎤', text: 'Record your voice for pronunciation feedback' },
      { icon: '⭐', text: 'Track your progress and earn points' },
    ],
  },
  voice: {
    title: 'Ordering at a Restaurant',
    subtitle: 'Practice ordering food and drinks in Spanish',
    category: 'Food',
    difficulty: 'beginner' as const,
    icon: 'call-outline' as const,
    metaValue1: '~5 min',
    metaLabel1: 'duration',
    primaryButtonText: 'Start Call',
    expectations: [
      { icon: '🎯', text: 'Practice beginner level conversation' },
      { icon: '🗣️', text: 'Speak naturally with an AI tutor' },
      { icon: '✨', text: 'Get real-time feedback on your responses' },
    ],
  },
  minimal: {
    title: 'Quick Practice Session',
    primaryButtonText: 'Start',
    expectations: [
      { icon: '🎯', text: 'Practice at your own pace' },
      { icon: '🎤', text: 'Get feedback on your performance' },
      { icon: '⭐', text: 'Track your progress and earn points' },
    ],
  },
};

export function PreSessionScreenDemo() {
  const [mode, setMode] = useState<DemoMode>('reading');
  const [showDemo, setShowDemo] = useState(false);

  const config = DEMO_CONFIGS[mode];

  if (showDemo) {
    return (
      <PreSessionScreen
        {...config}
        onPrimaryPress={() => {
          Alert.alert('Primary Action', `Starting ${mode} session...`);
          setShowDemo(false);
        }}
        onSecondaryPress={
          'secondaryButtonText' in config
            ? () => Alert.alert('Secondary Action', 'Showing vocabulary...')
            : undefined
        }
        onBack={() => setShowDemo(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PreSessionScreen Demo</Text>
        <Text style={styles.subtitle}>Test different configurations</Text>

        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Mode:</Text>
          <View style={styles.buttonGroup}>
            {(['reading', 'voice', 'minimal'] as DemoMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.optionButton, mode === m && styles.optionButtonActive]}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.optionText, mode === m && styles.optionTextActive]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Mode: {mode}</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{config.title}</Text>
            {'subtitle' in config && (
              <Text style={styles.previewMeta}>{config.subtitle}</Text>
            )}
            {'category' in config && (
              <Text style={styles.previewDifficulty}>
                Category: {config.category} | Difficulty: {config.difficulty}
              </Text>
            )}
          </View>
        </View>

        {/* Launch Button */}
        <TouchableOpacity style={styles.launchButton} onPress={() => setShowDemo(true)}>
          <Text style={styles.launchButtonText}>Launch PreSession Screen</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Features</Text>
          <Text style={styles.infoText}>
            • Hero banner with optional image{'\n'}
            • Icon-based header when no image{'\n'}
            • Motivational quotes{'\n'}
            • What to Expect section{'\n'}
            • Primary & secondary CTAs{'\n'}
            • Pulse animation on start button{'\n'}
            • Haptic feedback
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

export default PreSessionScreenDemo;
