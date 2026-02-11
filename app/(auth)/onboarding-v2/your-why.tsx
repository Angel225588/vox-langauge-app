/**
 * Your Why Screen (Onboarding V2 - Step 2 of 6)
 *
 * Captures user motivation for learning the language
 * and their profession for scenario personalization
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import { useOnboardingV2, MOTIVATIONS, TARGET_LANGUAGES, PROFESSIONS, flushOnboardingState } from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourWhyScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingV2();
  const { t } = useTranslation('onboarding');

  // Use local state for immediate UI updates
  const [selectedMotivation, setSelectedMotivation] = useState(data.motivation);
  const [customMotivation, setCustomMotivation] = useState(data.motivation_custom || '');
  const [selectedProfession, setSelectedProfession] = useState(data.profession);
  const [professionCustom, setProfessionCustom] = useState(data.profession_custom || '');

  // Focus states for inputs
  const [isMainInputFocused, setIsMainInputFocused] = useState(false);

  const handleMotivationSelect = (motivationId: string) => {
    setSelectedMotivation(motivationId);
    if (motivationId !== 'other') {
      setCustomMotivation('');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = async () => {
    // Save either the selected preset or custom text
    const motivation = selectedMotivation === 'custom' ? 'custom' : selectedMotivation;
    const motivationCustom = customMotivation.trim() || null;

    if (canContinue) {
      updateData({
        motivation,
        motivation_custom: motivationCustom,
        profession: selectedProfession,
        profession_custom: selectedProfession === 'other' ? professionCustom.trim() || null : null,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await flushOnboardingState();
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
        >
          {/* Back Button */}
          <Animated.View entering={FadeInDown.duration(200)}>
            <BackButton onPress={() => router.back()} />
          </Animated.View>

          {/* Single Clear Question */}
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.header}
          >
            <Text style={styles.title}>
              {t('your_why.subtitle', { language: languageName })}
            </Text>
          </Animated.View>

          {/* Text Input */}
          <Animated.View
            entering={FadeInDown.duration(300).delay(50)}
            style={styles.mainInputContainer}
          >
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
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />
          </Animated.View>

          {/* Quick Options - compact grid */}
          <Animated.View
            entering={FadeInDown.duration(300).delay(100)}
          >
            <View style={styles.motivationsGrid}>
              {MOTIVATIONS.map((motivation, index) => {
                const isSelected = selectedMotivation === motivation.id;

                return (
                  <TouchableOpacity
                    key={motivation.id}
                    style={[
                      styles.motivationCard,
                      isSelected && styles.motivationCardSelected,
                    ]}
                    onPress={() => {
                      handleMotivationSelect(motivation.id);
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
                      <Text
                        style={[
                          styles.motivationLabel,
                          isSelected && styles.motivationLabelSelected,
                        ]}
                      >
                        {motivation.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Text style={styles.checkBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Profession Section */}
          <Animated.View entering={FadeInDown.duration(300).delay(150)}>
            <Text style={styles.sectionLabel}>{t('your_why.profession_label')}</Text>
            <View style={styles.professionGrid}>
              {PROFESSIONS.map((profession) => {
                const isSelected = selectedProfession === profession.id;
                return (
                  <TouchableOpacity
                    key={profession.id}
                    style={[
                      styles.professionChip,
                      isSelected && styles.professionChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedProfession(profession.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.professionIcon}>{profession.icon}</Text>
                    <Text style={[
                      styles.professionLabel,
                      isSelected && styles.professionLabelSelected,
                    ]}>
                      {profession.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.miniCheckBadge}>
                        <Text style={styles.miniCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom profession text if "other" selected */}
            {selectedProfession === 'other' && (
              <TextInput
                style={[styles.mainInput, { minHeight: 44, marginTop: spacing.sm }]}
                placeholder={t('your_why.profession_other_placeholder')}
                placeholderTextColor={colors.text.tertiary}
                value={professionCustom}
                onChangeText={setProfessionCustom}
                maxLength={100}
              />
            )}
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Indicator - Dots */}
          <Animated.View entering={FadeInUp.duration(300).delay(200)} style={styles.progressContainer}>
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
            entering={FadeInUp.duration(300).delay(250)}
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: typography.fontSize['3xl'] * 1.3,
  },

  // Text input
  mainInputContainer: {
    marginBottom: spacing.lg,
  },
  mainInput: {
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: colors.primary.DEFAULT,
  },

  // Motivation option cards
  motivationsGrid: {
    gap: spacing.sm,
  },
  motivationCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  motivationCardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
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
  motivationEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  motivationLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  motivationLabelSelected: {
    color: colors.primary.light,
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

  // Profession section
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  professionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  professionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  professionChipSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
  },
  professionIcon: {
    fontSize: 16,
  },
  professionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  professionLabelSelected: {
    color: colors.primary.light,
  },
  miniCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCheckText: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },

  // Bottom section
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing['2xl'] : spacing.lg,
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
