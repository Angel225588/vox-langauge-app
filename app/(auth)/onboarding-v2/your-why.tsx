/**
 * Your Why Screen (Onboarding V2 - Step 2 of 5)
 *
 * Captures user motivation for learning the language
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import { useOnboardingV2, MOTIVATIONS, TARGET_LANGUAGES } from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourWhyScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingV2();
  const { t } = useTranslation('onboarding');

  // Use local state for immediate UI updates
  const [selectedMotivation, setSelectedMotivation] = useState(data.motivation);
  const [customMotivation, setCustomMotivation] = useState(data.motivation_custom || '');

  // Focus states for inputs
  const [isMainInputFocused, setIsMainInputFocused] = useState(false);

  const handleMotivationSelect = (motivationId: string) => {
    setSelectedMotivation(motivationId);
    if (motivationId !== 'other') {
      setCustomMotivation('');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = () => {
    // Save either the selected preset or custom text
    const motivation = selectedMotivation === 'custom' ? 'custom' : selectedMotivation;
    const motivationCustom = customMotivation.trim() || null;

    if (canContinue) {
      updateData({
        motivation,
        motivation_custom: motivationCustom,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      router.push('/(auth)/onboarding-v2/your-level');
    }
  };

  // Can continue if they've written something OR selected a preset
  const canContinue = customMotivation.trim().length > 0 || (selectedMotivation && selectedMotivation !== 'custom');

  // Get the selected target language for display
  const targetLanguage = TARGET_LANGUAGES.find((lang) => lang.code === data.target_language);
  const languageName = targetLanguage?.label || t('your_why.default_language');

  return (
    <CometBackground intensity="medium">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <BackButton onPress={() => router.back()} />
          </Animated.View>

          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>{t('your_why.title')}</Text>
            <Text style={styles.subtitle}>
              {t('your_why.subtitle', { language: languageName })}
            </Text>
          </Animated.View>

          {/* Main Text Input - Write Your Why */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100).springify()}
            style={styles.section}
          >
            <Text style={styles.sectionLabel}>{t('your_why.tell_us_label')}</Text>
            <Text style={styles.sectionSubtext}>
              {t('your_why.tell_us_subtext')}
            </Text>

            <View style={styles.mainInputContainer}>
              <TextInput
                style={[styles.mainInput, isMainInputFocused && styles.inputFocused]}
                placeholder={t('your_why.tell_us_placeholder')}
                placeholderTextColor={colors.text.tertiary}
                value={customMotivation}
                onChangeText={(text) => {
                  setCustomMotivation(text);
                  if (text.trim().length > 0) {
                    setSelectedMotivation('custom');
                  }
                }}
                onFocus={() => setIsMainInputFocused(true)}
                onBlur={() => setIsMainInputFocused(false)}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {customMotivation.length}/500
              </Text>
            </View>
          </Animated.View>

          {/* Quick Selection Options */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={styles.section}
          >
            <Text style={styles.sectionLabel}>{t('your_why.quick_option_label')}</Text>
            <Text style={styles.sectionSubtext}>
              {t('your_why.quick_option_subtext')}
            </Text>

            <View style={styles.motivationsGrid}>
              {MOTIVATIONS.map((motivation, index) => {
                const isSelected = selectedMotivation === motivation.id;

                return (
                  <Animated.View
                    key={motivation.id}
                    entering={FadeInDown.duration(400).delay(300 + index * 50).springify()}
                    style={styles.motivationCardWrapper}
                  >
                    <TouchableOpacity
                      style={[
                        styles.motivationCard,
                        isSelected && styles.motivationCardSelected,
                      ]}
                      onPress={() => {
                        handleMotivationSelect(motivation.id);
                        // Optionally populate the text input with the selection
                        if (customMotivation.trim().length === 0) {
                          setCustomMotivation(`${motivation.label}: ${motivation.description}`);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      {isSelected && (
                        <LinearGradient
                          colors={[colors.glow.primary, 'transparent']}
                          style={styles.cardGlow}
                        />
                      )}

                      <View style={styles.motivationCardContentRow}>
                        <Text style={styles.motivationEmoji}>{motivation.emoji}</Text>
                        <View style={styles.motivationTextContainer}>
                          <Text
                            style={[
                              styles.motivationLabel,
                              isSelected && styles.motivationLabelSelected,
                            ]}
                          >
                            {motivation.label}
                          </Text>
                          <Text style={styles.motivationDescription}>
                            {motivation.description}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Text style={styles.checkBadgeText}>✓</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Indicator - Dots */}
          <Animated.View entering={FadeInUp.duration(600).delay(400).springify()} style={styles.progressContainer}>
            <View style={styles.dotsContainer}>
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.dot,
                    step === 2 && styles.dotActive,
                    step < 2 && styles.dotCompleted,
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(500).springify()}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!canContinue}
              activeOpacity={0.8}
            >
              {canContinue ? (
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.continueButtonText}>{t('your_why.continue')}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.buttonDisabled}>
                  <Text style={styles.continueButtonTextDisabled}>{t('your_why.continue')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </CometBackground>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.lg * 1.5,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  optionalText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
  },
  sectionSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    lineHeight: typography.fontSize.sm * 1.5,
  },

  // Main input for writing
  mainInputContainer: {
    marginTop: spacing.sm,
  },
  mainInput: {
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },

  // Motivations grid - compact horizontal cards
  motivationsGrid: {
    gap: spacing.sm,
  },
  motivationCardWrapper: {
    width: '100%',
  },
  motivationCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    padding: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  motivationCardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    opacity: 0.1,
  },
  motivationCardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivationTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  motivationEmoji: {
    fontSize: 28,
  },
  motivationLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  motivationLabelSelected: {
    color: colors.primary.light,
  },
  motivationDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },

  inputFocused: {
    borderColor: colors.primary.DEFAULT,
  },

  // Bottom section
  bottomSection: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  progressContainer: {
    alignItems: 'center',
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
  buttonContainer: {
    width: '100%',
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  continueButtonDisabled: {
    opacity: 1,
  },
  buttonGradient: {
    paddingVertical: spacing.md + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.background.elevated,
    paddingVertical: spacing.md + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  continueButtonTextDisabled: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.disabled,
  },
});
