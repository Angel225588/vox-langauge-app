/**
 * Your Commitment Screen
 * Step 4 of 6: Set your learning timeline, practice time, and schedule
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import { useOnboardingV2, TIMELINES, PRACTICE_TIME_OPTIONS, DAYS_PER_WEEK_OPTIONS, flushOnboardingState } from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourCommitmentScreen() {
  const { data, updateData, nextStep } = useOnboardingV2();
  const { t } = useTranslation('onboarding');
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(data.timeline);
  const [selectedPracticeTime, setSelectedPracticeTime] = useState<{ min: number; max: number } | null>(
    data.min_practice_time && data.max_practice_time
      ? { min: data.min_practice_time, max: data.max_practice_time }
      : null
  );
  const [selectedDays, setSelectedDays] = useState<number | null>(data.days_per_week);
  const [whyNow, setWhyNow] = useState(data.why_now || '');
  const [isWhyNowFocused, setIsWhyNowFocused] = useState(false);

  const isValid = !!selectedTimeline;

  const handleTimelineSelect = (timelineId: string) => {
    setSelectedTimeline(timelineId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = async () => {
    if (isValid) {
      updateData({
        timeline: selectedTimeline,
        min_practice_time: selectedPracticeTime?.min ?? null,
        max_practice_time: selectedPracticeTime?.max ?? null,
        days_per_week: selectedDays,
        why_now: whyNow.trim() || null,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      nextStep();
      await flushOnboardingState();
      router.push('/(auth)/onboarding-v2/your-stakes');
    }
  };

  return (
    <CometBackground intensity="medium">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Back Button */}
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.backButtonContainer}
        >
          <BackButton onPress={() => router.back()} />
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.header}
        >
          <Text style={styles.title}>{t('your_commitment.goal_question')}</Text>
          <Text style={styles.subtitle}>
            {t('your_commitment.subtitle')}
          </Text>
        </Animated.View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollAreaContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Timeline Options */}
          <View style={styles.timelinesContainer}>
            {TIMELINES.map((timeline, index) => {
              const isSelected = selectedTimeline === timeline.id;

              return (
                <Animated.View
                  key={timeline.id}
                  entering={FadeInDown.duration(200).delay(100 + index * 50)}
                >
                  <TouchableOpacity
                    onPress={() => handleTimelineSelect(timeline.id)}
                    style={[
                      styles.timelineCard,
                      isSelected && styles.timelineCardSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={['rgba(0, 54, 255, 0.15)', 'rgba(0, 163, 255, 0.1)']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineEmoji}>{timeline.emoji}</Text>
                      <View style={styles.timelineTextContainer}>
                        <Text style={[
                          styles.timelineLabel,
                          isSelected && styles.timelineLabelSelected
                        ]}>
                          {timeline.label}
                        </Text>
                        <Text style={[
                          styles.timelineDescription,
                          isSelected && styles.timelineDescriptionSelected
                        ]}>
                          {timeline.description}
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

          {/* Practice Time */}
          <Animated.View entering={FadeInDown.duration(200).delay(350)}>
            <Text style={styles.sectionLabel}>{t('your_commitment.practice_time_label')}</Text>
            <View style={styles.practiceTimeGrid}>
              {PRACTICE_TIME_OPTIONS.map((option, index) => {
                const isSelected = selectedPracticeTime?.min === option.min && selectedPracticeTime?.max === option.max;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.practiceChip, isSelected && styles.practiceChipSelected]}
                    onPress={() => {
                      setSelectedPracticeTime(option);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          <Animated.View entering={FadeInDown.duration(200).delay(400)}>
            <Text style={styles.sectionLabel}>{t('your_commitment.days_label')}</Text>
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
                    <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Why Now (Optional) */}
          <Animated.View entering={FadeInDown.duration(200).delay(450)}>
            <Text style={styles.sectionLabel}>
              {t('your_commitment.why_now_label')} <Text style={styles.optionalText}>{t('your_commitment.optional')}</Text>
            </Text>
            <TextInput
              style={[styles.whyNowInput, isWhyNowFocused && styles.whyNowInputFocused]}
              placeholder={t('your_commitment.why_now_placeholder')}
              placeholderTextColor={colors.text.tertiary}
              value={whyNow}
              onChangeText={setWhyNow}
              onFocus={() => setIsWhyNowFocused(true)}
              onBlur={() => setIsWhyNowFocused(false)}
              maxLength={300}
            />
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.footer}>
          {/* Progress Indicator - Dots */}
          <Animated.View
            entering={FadeInUp.duration(300).delay(300)}
            style={styles.progressContainer}
          >
            <View style={styles.dotsContainer}>
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.dot,
                    step === 4 && styles.dotActive,
                    step < 4 && styles.dotCompleted,
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View
            entering={FadeInUp.duration(300).delay(350)}
          >
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!isValid}
              style={[
                styles.continueButton,
                !isValid && styles.continueButtonDisabled
              ]}
              activeOpacity={0.8}
            >
              {isValid ? (
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>
                    {t('your_commitment.continue')}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.buttonDisabled}>
                  <Text style={styles.continueButtonTextDisabled}>
                    {t('your_commitment.select_timeline')}
                  </Text>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
  },
  backButtonContainer: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
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
  scrollAreaContent: {
    paddingBottom: spacing.lg,
  },
  timelinesContainer: {
    gap: spacing.md,
  },
  timelineCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  timelineCardSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  timelineEmoji: {
    fontSize: 28,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timelineLabelSelected: {
    color: colors.primary.light,
  },
  timelineDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  timelineDescriptionSelected: {
    color: colors.text.secondary,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },

  // New sections
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  optionalText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.normal,
  },
  practiceTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  practiceChip: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: '47%' as any,
    alignItems: 'center',
  },
  practiceChipSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
  },
  practiceChipText: {
    fontSize: typography.fontSize.base,
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
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayChip: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dayChipSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
  },
  dayChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  dayChipTextSelected: {
    color: colors.primary.light,
  },
  whyNowInput: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    minHeight: 44,
  },
  whyNowInputFocused: {
    borderColor: colors.primary.DEFAULT,
  },

  // Footer
  footer: {
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
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  continueButtonDisabled: {
    opacity: 1,
  },
  continueButtonGradient: {
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
