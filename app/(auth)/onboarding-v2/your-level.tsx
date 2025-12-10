/**
 * Your Level Screen
 * Step 3 of 5: Assess proficiency level
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CometBackground } from '@/components/ui/CometBackground';
import { useOnboardingV2, PROFICIENCY_LEVELS } from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

export default function YourLevelScreen() {
  const { data, updateData, nextStep } = useOnboardingV2();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(data.proficiency_level);
  const [previousAttempts, setPreviousAttempts] = useState<string>(data.previous_attempts || '');

  const handleContinue = () => {
    if (selectedLevel) {
      updateData({
        proficiency_level: selectedLevel,
        previous_attempts: previousAttempts.trim() || null,
      });
      nextStep();
      router.push('/(auth)/onboarding-v2/your-commitment');
    }
  };

  const targetLanguage = data.target_language || 'this language';

  return (
    <CometBackground intensity="medium">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.stepIndicator}>Step 3 of 5</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
            </View>

            {/* Question */}
            <View style={styles.questionContainer}>
              <Text style={styles.question}>
                Where are you in your{'\n'}
                <Text style={styles.languageHighlight}>{targetLanguage}</Text> journey?
              </Text>
            </View>

            {/* Level Cards */}
            <View style={styles.levelsContainer}>
              {PROFICIENCY_LEVELS.map((level) => (
                <Pressable
                  key={level.id}
                  onPress={() => setSelectedLevel(level.id)}
                  style={[
                    styles.levelCard,
                    selectedLevel === level.id && styles.levelCardSelected,
                  ]}
                >
                  {selectedLevel === level.id && (
                    <LinearGradient
                      colors={colors.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <View style={styles.levelContent}>
                    <Text style={styles.levelEmoji}>{level.emoji}</Text>
                    <View style={styles.levelTextContainer}>
                      <Text style={[
                        styles.levelLabel,
                        selectedLevel === level.id && styles.levelLabelSelected
                      ]}>
                        {level.label}
                      </Text>
                      <Text style={[
                        styles.levelDescription,
                        selectedLevel === level.id && styles.levelDescriptionSelected
                      ]}>
                        {level.description}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Optional: Previous Attempts */}
            <View style={styles.optionalSection}>
              <Text style={styles.optionalLabel}>
                What have you tried before? (Optional)
              </Text>
              <Text style={styles.optionalSubtext}>
                We understand learning is hard. We're here to help make it stick this time.
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="E.g., Duolingo, classes in school, watching movies..."
                  placeholderTextColor={colors.text.tertiary}
                  value={previousAttempts}
                  onChangeText={setPreviousAttempts}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!selectedLevel}
              style={[
                styles.continueButton,
                !selectedLevel && styles.continueButtonDisabled
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedLevel ? colors.gradients.primary : ['#374151', '#374151']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButtonGradient}
              >
                <Text style={[
                  styles.continueButtonText,
                  !selectedLevel && styles.continueButtonTextDisabled
                ]}>
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CometBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  stepIndicator: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  questionContainer: {
    marginBottom: spacing.xl,
  },
  question: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 38,
  },
  languageHighlight: {
    color: colors.primary.light,
  },
  levelsContainer: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  levelCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelCardSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  levelEmoji: {
    fontSize: 32,
  },
  levelTextContainer: {
    flex: 1,
  },
  levelLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  levelLabelSelected: {
    color: colors.text.primary,
  },
  levelDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  levelDescriptionSelected: {
    color: colors.text.secondary,
  },
  optionalSection: {
    marginBottom: spacing.xl,
  },
  optionalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  optionalSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  input: {
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 90,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.lg,
    backgroundColor: colors.background.primary,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  continueButtonTextDisabled: {
    color: colors.text.disabled,
  },
});
