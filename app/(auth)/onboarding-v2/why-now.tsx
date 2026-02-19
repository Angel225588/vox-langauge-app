/**
 * Why Now Screen (Onboarding V2 - Step 5)
 *
 * Optional screen capturing what triggered the decision to learn now.
 * Large text input + preset chips for common triggers.
 * Can be skipped.
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
import {
  useOnboardingV2,
  WHY_NOW_PRESETS,
  flushOnboardingState,
  shouldShowProfession,
  getOnboardingDots,
  getScreenStep,
} from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function WhyNowScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingV2();
  const { t } = useTranslation('onboarding');

  const [whyNow, setWhyNow] = useState(data.why_now || '');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const showProfession = shouldShowProfession(data.motivations);
  const dots = getOnboardingDots(showProfession);
  const currentStep = getScreenStep('why-now', showProfession);

  const handlePresetTap = (preset: typeof WHY_NOW_PRESETS[0]) => {
    // Tapping a preset sets the text to its label
    setWhyNow(preset.label);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = async () => {
    updateData({ why_now: whyNow.trim() || null });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await flushOnboardingState();
    router.push('/(auth)/onboarding-v2/your-commitment');
  };

  const handleSkip = async () => {
    updateData({ why_now: null });
    await flushOnboardingState();
    router.push('/(auth)/onboarding-v2/your-commitment');
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
          {/* Back Button + Skip */}
          <Animated.View entering={FadeInDown.duration(200)} style={styles.topRow}>
            <BackButton onPress={() => router.back()} />
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>{t('why_now.skip')}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
            <Text style={styles.title}>{t('why_now.title')}</Text>
            <Text style={styles.subtitle}>{t('why_now.subtitle')}</Text>
          </Animated.View>

          {/* Text Input */}
          <Animated.View entering={FadeInDown.duration(300).delay(50)} style={styles.inputContainer}>
            <TextInput
              style={[styles.mainInput, isInputFocused && styles.inputFocused]}
              placeholder={t('why_now.placeholder')}
              placeholderTextColor={colors.text.tertiary}
              value={whyNow}
              onChangeText={setWhyNow}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              multiline
              numberOfLines={4}
              maxLength={300}
              textAlignVertical="top"
            />
          </Animated.View>

          {/* Preset Chips */}
          <Animated.View entering={FadeInDown.duration(300).delay(100)}>
            <Text style={styles.presetsLabel}>{t('why_now.presets_label')}</Text>
            <View style={styles.presetsGrid}>
              {WHY_NOW_PRESETS.map((preset) => {
                const isActive = whyNow === preset.label;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[styles.presetChip, isActive && styles.presetChipActive]}
                    onPress={() => handlePresetTap(preset)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.presetIcon}>{preset.icon}</Text>
                    <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>
                      {preset.label}
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
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={whyNow.trim() ? colors.gradients.primary : [colors.background.elevated, colors.background.elevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={[styles.continueButtonText, !whyNow.trim() && styles.continueButtonTextMuted]}>
                  {whyNow.trim() ? t('why_now.continue') : t('why_now.skip')}
                </Text>
              </LinearGradient>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
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

  // Text input
  inputContainer: {
    marginBottom: spacing.xl,
  },
  mainInput: {
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: typography.fontSize.lg * 1.5,
  },
  inputFocused: {
    borderColor: colors.primary.DEFAULT,
  },

  // Presets
  presetsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  presetsGrid: {
    gap: spacing.sm,
  },
  presetChip: {
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
  presetChipActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
  },
  presetIcon: {
    fontSize: 20,
  },
  presetLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  presetLabelActive: {
    color: colors.primary.light,
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
  buttonGradient: {
    paddingVertical: spacing.md + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  continueButtonTextMuted: {
    color: colors.text.secondary,
  },
});
