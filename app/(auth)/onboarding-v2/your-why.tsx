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
import { CometBackground } from '@/components/ui/CometBackground';
import { useOnboardingV2, MOTIVATIONS, TARGET_LANGUAGES } from '@/hooks/useOnboardingV2';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/designSystem';

export default function YourWhyScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingV2();

  // Use local state for immediate UI updates
  const [selectedMotivation, setSelectedMotivation] = useState(data.motivation);
  const [customMotivation, setCustomMotivation] = useState(data.motivation_custom || '');
  const [whyNow, setWhyNow] = useState(data.why_now || '');

  const handleMotivationSelect = (motivationId: string) => {
    setSelectedMotivation(motivationId);
    if (motivationId !== 'other') {
      setCustomMotivation('');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = () => {
    const motivation = selectedMotivation === 'other' ? 'other' : selectedMotivation;
    const motivationCustom = selectedMotivation === 'other' ? customMotivation : null;

    if (motivation) {
      updateData({
        motivation,
        motivation_custom: motivationCustom,
        why_now: whyNow || null,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // TODO: Navigate to next screen (level assessment)
      router.push('/(auth)/onboarding-v2/index'); // Placeholder - update when next screen is ready
    }
  };

  const canContinue =
    selectedMotivation &&
    (selectedMotivation !== 'other' || (customMotivation.trim().length > 0));

  // Get the selected target language for display
  const targetLanguage = TARGET_LANGUAGES.find((lang) => lang.code === data.target_language);
  const languageName = targetLanguage?.label || 'this language';

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
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>What's Your Why?</Text>
            <Text style={styles.subtitle}>
              Why do you want to learn {languageName}?
            </Text>
          </Animated.View>

          {/* Motivation Options */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100).springify()}
            style={styles.section}
          >
            <Text style={styles.sectionLabel}>Choose your main reason</Text>

            <View style={styles.motivationsGrid}>
              {MOTIVATIONS.map((motivation, index) => {
                const isSelected = selectedMotivation === motivation.id;

                return (
                  <Animated.View
                    key={motivation.id}
                    entering={FadeInDown.duration(400).delay(200 + index * 80).springify()}
                    style={styles.motivationCardWrapper}
                  >
                    <TouchableOpacity
                      style={[
                        styles.motivationCard,
                        isSelected && styles.motivationCardSelected,
                      ]}
                      onPress={() => handleMotivationSelect(motivation.id)}
                      activeOpacity={0.8}
                    >
                      {/* Glow effect when selected */}
                      {isSelected && (
                        <LinearGradient
                          colors={[colors.glow.primary, 'transparent']}
                          style={styles.cardGlow}
                        />
                      )}

                      <View style={styles.motivationCardContent}>
                        <Text style={styles.motivationEmoji}>{motivation.emoji}</Text>
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
                        <View style={styles.selectedBadge}>
                          <LinearGradient
                            colors={colors.gradients.primary}
                            style={styles.selectedBadgeGradient}
                          >
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </LinearGradient>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}

              {/* Other Option with Text Input */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(200 + MOTIVATIONS.length * 80).springify()}
                style={styles.motivationCardWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.motivationCard,
                    selectedMotivation === 'other' && styles.motivationCardSelected,
                  ]}
                  onPress={() => handleMotivationSelect('other')}
                  activeOpacity={0.8}
                >
                  {selectedMotivation === 'other' && (
                    <LinearGradient
                      colors={[colors.glow.primary, 'transparent']}
                      style={styles.cardGlow}
                    />
                  )}

                  <View style={styles.motivationCardContent}>
                    <Text style={styles.motivationEmoji}>💭</Text>
                    <Text
                      style={[
                        styles.motivationLabel,
                        selectedMotivation === 'other' && styles.motivationLabelSelected,
                      ]}
                    >
                      Other
                    </Text>
                    <Text style={styles.motivationDescription}>
                      Tell us your unique reason
                    </Text>
                  </View>

                  {selectedMotivation === 'other' && (
                    <View style={styles.selectedBadge}>
                      <LinearGradient
                        colors={colors.gradients.primary}
                        style={styles.selectedBadgeGradient}
                      >
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </LinearGradient>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Custom Motivation Input */}
            {selectedMotivation === 'other' && (
              <Animated.View
                entering={FadeInDown.duration(400)}
                style={styles.customInputContainer}
              >
                <TextInput
                  style={styles.customInput}
                  placeholder="Tell us why you want to learn..."
                  placeholderTextColor={colors.text.tertiary}
                  value={customMotivation}
                  onChangeText={setCustomMotivation}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  autoFocus
                />
                <Text style={styles.characterCount}>
                  {customMotivation.length}/200
                </Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* Optional: Why Now Question */}
          {canContinue && (
            <Animated.View
              entering={FadeInDown.duration(600).delay(200).springify()}
              style={styles.section}
            >
              <Text style={styles.sectionLabel}>
                What made you decide NOW? <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <Text style={styles.sectionSubtext}>
                Understanding your timing helps us personalize your learning path
              </Text>

              <View style={styles.whyNowInputContainer}>
                <TextInput
                  style={styles.whyNowInput}
                  placeholder="e.g., I'm traveling to Spain next month, starting a new job, met someone special..."
                  placeholderTextColor={colors.text.tertiary}
                  value={whyNow}
                  onChangeText={setWhyNow}
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                />
                <Text style={styles.characterCount}>
                  {whyNow.length}/300
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Indicator */}
          <Animated.View entering={FadeInUp.duration(600).delay(400).springify()}>
            <Text style={styles.progressText}>Step 2 of 5</Text>
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

  // Motivations grid
  motivationsGrid: {
    gap: spacing.md,
  },
  motivationCardWrapper: {
    width: '100%',
  },
  motivationCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.light,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 100,
  },
  motivationCardSelected: {
    borderColor: colors.primary.DEFAULT,
    ...shadows.glow.primary,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    opacity: 0.1,
  },
  motivationCardContent: {
    alignItems: 'center',
  },
  motivationEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  motivationLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  motivationLabelSelected: {
    color: colors.primary.light,
  },
  motivationDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
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

  // Custom motivation input
  customInputContainer: {
    marginTop: spacing.md,
  },
  customInput: {
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    ...shadows.glow.primary,
  },
  characterCount: {
    textAlign: 'right',
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },

  // Why now input
  whyNowInputContainer: {
    marginTop: spacing.sm,
  },
  whyNowInput: {
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
