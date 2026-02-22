/**
 * Screen 1: Name
 * "First, what should we call you?"
 * Single glass input, auto-focused, first name only.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassProgressBar } from '@/components/ui/glass/GlassProgressBar';
import { GlassInput } from '@/components/ui/glass/GlassInput';
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { colors, spacing, typography } from '@/constants/designSystem';

const TOTAL_STEPS = 6;

export default function NameScreen() {
  const insets = useSafeAreaInsets();
  const { first_name, setField } = useOnboardingV3();
  const [name, setName] = useState(first_name);

  const isValid = name.trim().length >= 2;

  const handleContinue = () => {
    setField('first_name', name.trim());
    setField('current_step', 2);
    router.push('/(auth)/onboarding-v3/language');
  };

  return (
    <GlassBackground intensity="subtle">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Progress */}
          <GlassProgressBar step={1} totalSteps={TOTAL_STEPS} />

          {/* Content */}
          <View style={styles.content}>
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <Text style={styles.header}>First, what should we call you?</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <Text style={styles.subtitle}>
                We'll use this to personalize your experience
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(400).delay(350)} style={styles.inputWrapper}>
              <GlassInput
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                autoFocusOnMount
                large
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => isValid && handleContinue()}
              />
            </Animated.View>
          </View>

          {/* CTA */}
          <Animated.View
            entering={FadeInUp.duration(300).delay(500)}
            style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
          >
            <GlassButton
              variant="primary"
              disabled={!isValid}
              onPress={handleContinue}
            >
              Continue
            </GlassButton>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  header: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
    marginBottom: spacing['2xl'],
  },
  inputWrapper: {
    marginTop: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
