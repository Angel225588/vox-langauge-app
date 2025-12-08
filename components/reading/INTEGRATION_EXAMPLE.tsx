/**
 * Complete Integration Example
 *
 * This file demonstrates how to integrate the entire content management system
 * into a reading practice flow.
 *
 * DO NOT USE IN PRODUCTION - This is for reference only
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Import all passage management components and hooks
import {
  PassageSelector,
  ImportPassageForm,
  usePassages,
} from '@/components/reading';

// Import reading session management
import {
  Passage,
  createSession,
  ReadingSession,
} from '@/lib/reading';

// Import design system
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';

// ============================================================================
// TYPES
// ============================================================================

type FlowStep = 'home' | 'selectPassage' | 'importPassage' | 'practice' | 'review';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReadingPracticeIntegrationExample() {
  // Step management
  const [step, setStep] = useState<FlowStep>('home');
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);

  // Passage management hook
  const {
    curatedPassages,
    userPassages,
    savePassage,
    generateAIPassage,
    isGenerating,
    loading,
    error,
  } = usePassages();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle passage selection from PassageSelector
   */
  const handlePassageSelect = async (passage: Passage) => {
    console.log('Passage selected:', passage.title);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setSelectedPassage(passage);

    // Create a reading session
    try {
      const session = await createSession({
        userId: 'user_123', // Replace with actual user ID
        sourceType: passage.sourceType,
        text: passage.text,
        title: passage.title,
        difficulty: passage.difficulty,
        sourceId: passage.id,
      });

      setCurrentSession(session);
      setStep('practice');

      console.log('Session created:', session.id);
    } catch (error) {
      console.error('Failed to create session:', error);
      Alert.alert('Error', 'Failed to start reading session');
    }
  };

  /**
   * Handle custom passage import
   */
  const handlePassageImport = async (passage: Passage) => {
    console.log('Importing passage:', passage.title);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Save to user passages
      await savePassage({
        title: passage.title,
        text: passage.text,
        difficulty: passage.difficulty,
        category: passage.category,
        wordCount: passage.wordCount,
        estimatedDuration: passage.estimatedDuration,
      });

      // Start session with imported passage
      await handlePassageSelect(passage);

      Alert.alert('Success', 'Passage imported successfully!');
    } catch (error) {
      console.error('Failed to import passage:', error);
      Alert.alert('Error', 'Failed to import passage');
    }
  };

  /**
   * Quick start with random curated passage
   */
  const handleQuickStart = () => {
    const { getRandomCuratedPassage } = require('@/lib/reading/curatedPassages');
    const randomPassage = getRandomCuratedPassage();

    if (randomPassage) {
      handlePassageSelect(randomPassage);
    }
  };

  /**
   * Generate AI passage and start immediately
   */
  const handleGenerateAndStart = async () => {
    try {
      const passage = await generateAIPassage({
        difficulty: 'intermediate',
        topic: 'daily conversation',
        style: 'dialogue',
        wordCount: 150,
      });

      Alert.alert(
        'Passage Generated',
        `"${passage.title}" is ready. Start reading?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start', onPress: () => handlePassageSelect(passage) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate passage');
    }
  };

  /**
   * Complete reading session
   */
  const handleCompleteSession = () => {
    setStep('review');
    // Navigate to results/feedback screen
  };

  /**
   * Return to home
   */
  const handleBackToHome = () => {
    setStep('home');
    setSelectedPassage(null);
    setCurrentSession(null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* HOME SCREEN */}
      {step === 'home' && (
        <View style={styles.homeScreen}>
          <Text style={styles.title}>Reading Practice</Text>
          <Text style={styles.subtitle}>
            {curatedPassages.length} curated passages • {userPassages.length} custom passages
          </Text>

          {/* Quick Start Button */}
          <TouchableOpacity onPress={handleQuickStart} activeOpacity={0.8}>
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>🎯 Quick Start</Text>
              <Text style={styles.buttonSubtext}>Random curated passage</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Browse Passages Button */}
          <TouchableOpacity
            onPress={() => setStep('selectPassage')}
            style={styles.secondaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>📚 Browse Passages</Text>
            <Text style={styles.buttonSubtext}>Curated, AI, or custom</Text>
          </TouchableOpacity>

          {/* Generate AI Passage */}
          <TouchableOpacity
            onPress={handleGenerateAndStart}
            style={styles.secondaryButton}
            activeOpacity={0.8}
            disabled={isGenerating}
          >
            <Text style={styles.secondaryButtonText}>
              {isGenerating ? '⏳ Generating...' : '✨ Generate AI Passage'}
            </Text>
            <Text style={styles.buttonSubtext}>Custom topic with AI</Text>
          </TouchableOpacity>

          {/* Import Custom Text */}
          <TouchableOpacity
            onPress={() => setStep('importPassage')}
            style={styles.secondaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>📝 Import Custom Text</Text>
            <Text style={styles.buttonSubtext}>Paste your own content</Text>
          </TouchableOpacity>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{curatedPassages.length}</Text>
              <Text style={styles.statLabel}>Curated</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{userPassages.length}</Text>
              <Text style={styles.statLabel}>Custom</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      )}

      {/* PASSAGE SELECTOR */}
      {step === 'selectPassage' && (
        <PassageSelector
          onSelect={handlePassageSelect}
          onClose={handleBackToHome}
          initialTab="curated"
          initialDifficulty="beginner"
        />
      )}

      {/* IMPORT FORM */}
      {step === 'importPassage' && (
        <ImportPassageForm
          onImport={handlePassageImport}
          onCancel={handleBackToHome}
        />
      )}

      {/* PRACTICE SCREEN (Placeholder) */}
      {step === 'practice' && selectedPassage && (
        <View style={styles.practiceScreen}>
          <Text style={styles.title}>{selectedPassage.title}</Text>
          <Text style={styles.subtitle}>
            {selectedPassage.wordCount} words • {selectedPassage.difficulty}
          </Text>

          <View style={styles.passageContainer}>
            <Text style={styles.passageText}>{selectedPassage.text}</Text>
          </View>

          {/* Teleprompter controls would go here */}
          <TouchableOpacity
            onPress={handleCompleteSession}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Complete Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBackToHome}
            style={styles.tertiaryButton}
          >
            <Text style={styles.tertiaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REVIEW SCREEN (Placeholder) */}
      {step === 'review' && (
        <View style={styles.reviewScreen}>
          <Text style={styles.title}>Session Complete!</Text>
          <Text style={styles.subtitle}>Great job practicing</Text>

          {/* Feedback and scores would go here */}

          <TouchableOpacity
            onPress={handleBackToHome}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  homeScreen: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  practiceScreen: {
    flex: 1,
    padding: spacing.lg,
  },
  reviewScreen: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  primaryButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  tertiaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  tertiaryButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  buttonSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  errorBox: {
    backgroundColor: colors.error.DEFAULT + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  errorText: {
    color: colors.error.light,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  passageContainer: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  passageText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    lineHeight: 28,
  },
});

/**
 * USAGE IN APP
 *
 * 1. Import this component:
 *    import ReadingPracticeFlow from '@/components/reading/INTEGRATION_EXAMPLE';
 *
 * 2. Use in your navigation:
 *    <ReadingPracticeFlow />
 *
 * 3. Or integrate pieces into existing screens:
 *    - Use PassageSelector for content selection
 *    - Use ImportPassageForm for custom imports
 *    - Use usePassages hook for data management
 *
 * 4. Customize to your needs:
 *    - Add authentication
 *    - Integrate with your navigation system
 *    - Add analytics tracking
 *    - Customize styling
 */
