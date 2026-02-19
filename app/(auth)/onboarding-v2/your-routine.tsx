/**
 * Your Routine Screen (Onboarding V2 - Step 7)
 *
 * Captures practice time per session and days per week.
 * Extracted from the old commitment screen.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import {
  useOnboardingV2,
  PRACTICE_TIME_OPTIONS,
  DAYS_PER_WEEK_OPTIONS,
  flushOnboardingState,
  shouldShowProfession,
  getOnboardingDots,
  getScreenStep,
} from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourRoutineScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingV2();
  const { t } = useTranslation('onboarding');

  const [selectedPracticeTime, setSelectedPracticeTime] = useState<{ min: number; max: number } | null>(
    data.min_practice_time && data.max_practice_time
      ? { min: data.min_practice_time, max: data.max_practice_time }
      : null
  );
  const [selectedDays, setSelectedDays] = useState<number | null>(data.days_per_week);

  const showProfession = shouldShowProfession(data.motivations);
  const dots = getOnboardingDots(showProfession);
  const currentStep = getScreenStep('your-routine', showProfession);

  const handleContinue = async () => {
    updateData({
      min_practice_time: selectedPracticeTime?.min ?? null,
      max_practice_time: selectedPracticeTime?.max ?? null,
      days_per_week: selectedDays,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await flushOnboardingState();
    router.push('/(auth)/onboarding-v2/your-stakes');
  };

  // At least practice time should be selected to continue (days optional)
  const canContinue = !!selectedPracticeTime;

  return (
    <CometBackground intensity="medium">
      <View style={styles.container}>
        {/* Back Button */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.backButtonContainer}>
          <BackButton onPress={() => router.back()} />
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <Text style={styles.title}>{t('your_routine.title')}</Text>
          <Text style={styles.subtitle}>{t('your_routine.subtitle')}</Text>
        </Animated.View>

        {/* Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Practice Time Per Session */}
          <Animated.View entering={FadeInDown.duration(300).delay(100)}>
            <Text style={styles.sectionLabel}>{t('your_routine.time_label')}</Text>
            <View style={styles.practiceTimeGrid}>
              {PRACTICE_TIME_OPTIONS.map((option, index) => {
                const isSelected = selectedPracticeTime?.min === option.min && selectedPracticeTime?.max === option.max;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.practiceChip, isSelected && styles.practiceChipSelected]}
                    onPress={() => {
                      setSelectedPracticeTime(option);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.practiceChipText, isSelected && styles.practiceChipTextSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.practiceChipDesc, isSelected && styles.practiceChipDescSelected]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Days Per Week */}
          <Animated.View entering={FadeInDown.duration(300).delay(200)}>
            <Text style={styles.sectionLabel}>{t('your_routine.days_label')}</Text>
            <View style={styles.daysRow}>
              {DAYS_PER_WEEK_OPTIONS.map((option, index) => {
                const isSelected = selectedDays === option.days;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                    onPress={() => {
                      setSelectedDays(option.days);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Dots */}
          <Animated.View entering={FadeInUp.duration(300).delay(300)} style={styles.progressContainer}>
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
          <Animated.View entering={FadeInUp.duration(300).delay(350)} style={styles.buttonContainer}>
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
                  <Text style={styles.continueButtonText}>{t('your_routine.continue')}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.buttonDisabled}>
                  <Text style={styles.continueButtonTextDisabled}>{t('your_routine.select_time')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </CometBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
  },
  backButtonContainer: {
    marginBottom: spacing.md,
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },

  // Section labels
  sectionLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },

  // Practice time chips
  practiceTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  practiceChip: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: '47%' as any,
    alignItems: 'center',
  },
  practiceChipSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
  },
  practiceChipText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  practiceChipTextSelected: {
    color: colors.primary.light,
  },
  practiceChipDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  practiceChipDescSelected: {
    color: colors.text.secondary,
  },

  // Days per week
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayChip: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dayChipSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
  },
  dayNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  dayNumberSelected: {
    color: colors.primary.light,
  },
  dayLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  dayLabelSelected: {
    color: colors.text.secondary,
  },

  // Bottom section
  bottomSection: {
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
