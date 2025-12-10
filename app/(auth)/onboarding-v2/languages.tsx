/**
 * Language Selection Screen (Onboarding V2 - Step 1 of 5)
 *
 * Allows users to select their native language and target language
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CometBackground } from '@/components/ui/CometBackground';
import { useOnboardingV2, NATIVE_LANGUAGES, TARGET_LANGUAGES } from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function LanguagesScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingV2();

  // Use local state for immediate UI updates, then sync to store
  const [nativeLanguage, setNativeLanguage] = useState(data.native_language);
  const [targetLanguage, setTargetLanguage] = useState(data.target_language);
  const [showNativePicker, setShowNativePicker] = useState(false);

  const handleNativeLanguageSelect = (code: string) => {
    setNativeLanguage(code);
    setShowNativePicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTargetLanguageSelect = (code: string) => {
    setTargetLanguage(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = () => {
    if (nativeLanguage && targetLanguage) {
      updateData({
        native_language: nativeLanguage,
        target_language: targetLanguage,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      router.push('/(auth)/onboarding-v2/your-why');
    }
  };

  const canContinue = nativeLanguage && targetLanguage && nativeLanguage !== targetLanguage;

  const selectedNativeLanguage = NATIVE_LANGUAGES.find((lang) => lang.code === nativeLanguage);
  const selectedTargetLanguage = TARGET_LANGUAGES.find((lang) => lang.code === targetLanguage);

  return (
    <CometBackground intensity="medium">
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Choose Your Languages</Text>
            <Text style={styles.subtitle}>
              Let's personalize your learning journey
            </Text>
          </Animated.View>

          {/* Native Language Question */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100).springify()}
            style={styles.section}
          >
            <Text style={styles.questionLabel}>What's your native language?</Text>

            <Pressable
              style={[styles.dropdownButton, showNativePicker && styles.dropdownButtonActive]}
              onPress={() => {
                setShowNativePicker(!showNativePicker);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.dropdownContent}>
                {selectedNativeLanguage ? (
                  <>
                    <Text style={styles.flagEmoji}>{selectedNativeLanguage.flag}</Text>
                    <Text style={styles.dropdownText}>{selectedNativeLanguage.label}</Text>
                  </>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Select your native language</Text>
                )}
              </View>
              <Text style={styles.dropdownArrow}>{showNativePicker ? '▲' : '▼'}</Text>
            </Pressable>

            {/* Native Language Picker */}
            {showNativePicker && (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={styles.pickerContainer}
              >
                <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                  {NATIVE_LANGUAGES.map((lang, index) => (
                    <Animated.View
                      key={lang.code}
                      entering={FadeInDown.duration(200).delay(index * 30)}
                    >
                      <TouchableOpacity
                        style={[
                          styles.pickerItem,
                          nativeLanguage === lang.code && styles.pickerItemSelected,
                        ]}
                        onPress={() => handleNativeLanguageSelect(lang.code)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pickerItemFlag}>{lang.flag}</Text>
                        <Text
                          style={[
                            styles.pickerItemText,
                            nativeLanguage === lang.code && styles.pickerItemTextSelected,
                          ]}
                        >
                          {lang.label}
                        </Text>
                        {nativeLanguage === lang.code && (
                          <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </Animated.View>

          {/* Target Language Question */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={styles.section}
          >
            <Text style={styles.questionLabel}>Which language do you want to learn?</Text>

            <View style={styles.targetLanguagesGrid}>
              {TARGET_LANGUAGES.map((lang, index) => {
                const isSelected = targetLanguage === lang.code;
                const isDisabled = nativeLanguage === lang.code;

                return (
                  <Animated.View
                    key={lang.code}
                    entering={FadeInDown.duration(400).delay(300 + index * 100).springify()}
                    style={styles.targetCardWrapper}
                  >
                    <TouchableOpacity
                      style={[
                        styles.targetCard,
                        isSelected && styles.targetCardSelected,
                        isDisabled && styles.targetCardDisabled,
                      ]}
                      onPress={() => !isDisabled && handleTargetLanguageSelect(lang.code)}
                      disabled={isDisabled}
                      activeOpacity={0.8}
                    >
                      {/* Glow effect when selected */}
                      {isSelected && (
                        <LinearGradient
                          colors={[colors.glow.primary, 'transparent']}
                          style={styles.cardGlow}
                        />
                      )}

                      <View style={styles.targetCardContent}>
                        <Text style={styles.targetCardFlag}>{lang.flag}</Text>
                        <Text
                          style={[
                            styles.targetCardLabel,
                            isSelected && styles.targetCardLabelSelected,
                            isDisabled && styles.targetCardLabelDisabled,
                          ]}
                        >
                          {lang.label}
                        </Text>
                        <Text
                          style={[
                            styles.targetCardDescription,
                            isDisabled && styles.targetCardDescriptionDisabled,
                          ]}
                        >
                          {lang.description}
                        </Text>
                      </View>

                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <LinearGradient
                            colors={colors.gradients.primary}
                            style={styles.selectedBadgeGradient}
                          >
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </LinearGradient>
                        </View>
                      )}

                      {isDisabled && (
                        <View style={styles.disabledOverlay}>
                          <Text style={styles.disabledText}>Your native language</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* Warning if same language */}
          {nativeLanguage && targetLanguage && nativeLanguage === targetLanguage && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={styles.warningContainer}
            >
              <Text style={styles.warningText}>
                Please select different languages for native and target
              </Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Indicator */}
          <Animated.View entering={FadeInUp.duration(600).delay(400).springify()}>
            <Text style={styles.progressText}>Step 1 of 5</Text>
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
                  <Text style={styles.continueButtonText}>Continue</Text>
                </LinearGradient>
              ) : (
                <View style={styles.buttonDisabled}>
                  <Text style={styles.continueButtonTextDisabled}>Continue</Text>
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
  questionLabel: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  // Dropdown styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 64,
  },
  dropdownButtonActive: {
    borderColor: colors.primary.DEFAULT,
    ...shadows.glow.primary,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  dropdownText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  dropdownPlaceholder: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
  },
  dropdownArrow: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },

  // Picker styles
  pickerContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: 280,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 280,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  pickerItemSelected: {
    backgroundColor: colors.background.elevated,
  },
  pickerItemFlag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  pickerItemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  pickerItemTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },

  // Target language cards
  targetLanguagesGrid: {
    gap: spacing.md,
  },
  targetCardWrapper: {
    width: '100%',
  },
  targetCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.light,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 120,
  },
  targetCardSelected: {
    borderColor: colors.primary.DEFAULT,
    ...shadows.glow.primary,
  },
  targetCardDisabled: {
    opacity: 0.5,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    opacity: 0.1,
  },
  targetCardContent: {
    alignItems: 'center',
  },
  targetCardFlag: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  targetCardLabel: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  targetCardLabelSelected: {
    color: colors.primary.light,
  },
  targetCardLabelDisabled: {
    color: colors.text.disabled,
  },
  targetCardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  targetCardDescriptionDisabled: {
    color: colors.text.disabled,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  selectedBadgeGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
  },
  disabledText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Warning
  warningContainer: {
    backgroundColor: colors.background.elevated,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning.DEFAULT,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  warningText: {
    color: colors.warning.light,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Bottom section
  bottomSection: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  progressText: {
    textAlign: 'center',
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.medium,
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
