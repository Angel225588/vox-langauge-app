/**
 * Welcome/Auth Screen - Premium Entry Point
 * Beautiful animated welcome screen with comet background
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CometBackground } from '@/components/ui/CometBackground';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <CometBackground intensity="high">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          {/* Logo and Branding */}
          <Animated.View
            entering={FadeInDown.duration(800).delay(200)}
            style={styles.logoContainer}
          >
            <View style={styles.logoWrapper}>
              <Text style={styles.logoEmoji}>🗣️</Text>
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.logoText}>VOX</Text>
          </Animated.View>

          {/* Slogan */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(400)}
            style={styles.sloganContainer}
          >
            <Text style={styles.slogan}>Keep learning</Text>
            <Text style={styles.slogan}>and keep going</Text>
          </Animated.View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Auth Buttons */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(600)}
            style={styles.buttonsContainer}
          >
            {/* Primary Button - Continue with Email */}
            <AnimatedPressable
              onPress={() => router.push('/(auth)/onboarding-v2/signup')}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Continue with Email</Text>
              </LinearGradient>
            </AnimatedPressable>

            {/* Secondary Button - Magic Link */}
            <AnimatedPressable
              onPress={() => router.push('/(auth)/onboarding-v2/magic-link')}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <View style={styles.secondaryButtonContent}>
                <Text style={styles.secondaryButtonText}>Sign in with Magic Link</Text>
              </View>
            </AnimatedPressable>
          </Animated.View>

          {/* Sign In Link */}
          <Animated.View
            entering={FadeIn.duration(600).delay(800)}
            style={[styles.signInContainer, { paddingBottom: insets.bottom + spacing.lg }]}
          >
            <Text style={styles.signInText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/onboarding-v2/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </CometBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'flex-start',
    paddingTop: spacing['3xl'],
  },

  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    marginLeft: -60,
    marginTop: -60,
    borderRadius: 60,
    backgroundColor: colors.glow.primary,
    opacity: 0.3,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  logoText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    letterSpacing: 4,
    textAlign: 'center',
  },

  // Slogan Section
  sloganContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  slogan: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * 1.5,
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Buttons Section
  buttonsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  // Primary Button (Gradient)
  primaryButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // Secondary Button (Outlined)
  secondaryButton: {
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: colors.primary.light,
  },
  secondaryButtonContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.DEFAULT,
  },

  // Sign In Section
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.normal,
  },
  signInLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },
});
