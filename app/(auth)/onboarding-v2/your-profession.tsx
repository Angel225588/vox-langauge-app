/**
 * Your Profession Screen (Onboarding V2 - Conditional Step 3)
 *
 * Only shown when motivation includes career, relocation, or education.
 * Profession chips grid + custom "Other" input.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import {
  useOnboardingV2,
  PROFESSIONS,
  flushOnboardingState,
  shouldShowProfession,
  getOnboardingDots,
  getScreenStep,
} from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourProfessionScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingV2();
  const { t } = useTranslation('onboarding');

  const [selectedProfession, setSelectedProfession] = useState(data.profession);
  const [professionCustom, setProfessionCustom] = useState(data.profession_custom || '');

  const showProfession = shouldShowProfession(data.motivations);
  const dots = getOnboardingDots(showProfession);
  const currentStep = getScreenStep('your-profession', showProfession);

  const canContinue = !!selectedProfession && (selectedProfession !== 'other' || professionCustom.trim().length > 0);

  const handleContinue = async () => {
    if (!canContinue) return;

    updateData({
      profession: selectedProfession,
      profession_custom: selectedProfession === 'other' ? professionCustom.trim() || null : null,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await flushOnboardingState();
    router.push('/(auth)/onboarding-v2/your-level');
  };

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

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
            <Text style={styles.title}>{t('your_profession.title')}</Text>
            <Text style={styles.subtitle}>{t('your_profession.subtitle')}</Text>
          </Animated.View>

          {/* Profession Chips Grid */}
          <Animated.View entering={FadeInDown.duration(300).delay(100)}>
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
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom profession input for "Other" */}
            {selectedProfession === 'other' && (
              <Animated.View entering={FadeInDown.duration(200)} style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder={t('your_profession.other_placeholder')}
                  placeholderTextColor={colors.text.tertiary}
                  value={professionCustom}
                  onChangeText={setProfessionCustom}
                  maxLength={100}
                  autoFocus
                />
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Dots */}
          <Animated.View entering={FadeInUp.duration(300).delay(200)} style={styles.progressContainer}>
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
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInUp.duration(300).delay(250)} style={styles.buttonContainer}>
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
                  <Text style={styles.continueButtonText}>{t('your_profession.continue')}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.buttonDisabled}>
                  <Text style={styles.continueButtonTextDisabled}>{t('your_profession.continue')}</Text>
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
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },

  // Profession chips
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  professionChipSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
  },
  professionIcon: {
    fontSize: 20,
  },
  professionLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  professionLabelSelected: {
    color: colors.primary.light,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },

  // Custom input
  customInputContainer: {
    marginTop: spacing.md,
  },
  customInput: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 48,
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
