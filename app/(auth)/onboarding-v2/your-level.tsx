/**
 * Your Level Screen
 * Step 3 of 6: Assess proficiency level
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import {
  useOnboardingV2,
  PROFICIENCY_LEVELS,
  TARGET_LANGUAGES,
  flushOnboardingState,
  shouldShowProfession,
  getOnboardingDots,
  getScreenStep,
} from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

export default function YourLevelScreen() {
  const { data, updateData, nextStep } = useOnboardingV2();
  const { t } = useTranslation('onboarding');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(data.proficiency_level);
  const [previousAttempts, setPreviousAttempts] = useState<string>(data.previous_attempts || '');

  // Focus state for input
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Dynamic progress dots
  const showProfession = shouldShowProfession(data.motivations);
  const dots = getOnboardingDots(showProfession);
  const currentStep = getScreenStep('your-level', showProfession);

  const handleContinue = async () => {
    if (selectedLevel) {
      updateData({
        proficiency_level: selectedLevel,
        previous_attempts: previousAttempts.trim() || null,
      });
      nextStep();
      await flushOnboardingState();
      router.push('/(auth)/onboarding-v2/why-now');
    }
  };

  // Get the target language display name
  const targetLang = TARGET_LANGUAGES.find(l => l.code === data.target_language);
  const targetLanguage = targetLang?.label || 'this language';

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
            {/* Back Button */}
            <View style={styles.backButtonContainer}>
              <BackButton onPress={() => router.back()} />
            </View>

            {/* Question */}
            <View style={styles.questionContainer}>
              <Text style={styles.question}>
                {t('your_level.title')}{'\n'}
                <Text style={styles.languageHighlight}>{targetLanguage}</Text> {t('your_level.title_suffix')}
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
                {t('your_level.previous_attempts_label')} {t('your_why.optional')}
              </Text>
              <Text style={styles.optionalSubtext}>
                {t('your_level.previous_attempts_subtext')}
              </Text>
              <View style={[styles.inputContainer, isInputFocused && styles.inputContainerFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder={t('your_level.previous_attempts_placeholder')}
                  placeholderTextColor={colors.text.tertiary}
                  value={previousAttempts}
                  onChangeText={setPreviousAttempts}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.footer}>
            {/* Progress Indicator - Dots */}
            <View style={styles.progressContainer}>
              <View style={styles.dotsContainer}>
                {dots.map((step) => (
                  <View
                    key={step}
                    style={[
                      styles.dot,
                      step === currentStep && styles.dotActive,
                      step < currentStep && styles.dotCompleted,
                    ]}
                  />
                ))}
              </View>
            </View>
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
                  {t('your_level.continue')}
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
  backButtonContainer: {
    marginBottom: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.elevated,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.DEFAULT,
  },
  dotCompleted: {
    backgroundColor: colors.primary.light,
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
  inputContainerFocused: {
    borderColor: colors.primary.DEFAULT,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing['2xl'] : spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
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
