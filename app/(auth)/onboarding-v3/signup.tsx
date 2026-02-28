/**
 * Screen 8: Signup
 * "Save your progress" — glassmorphism signup with value reminders.
 * Uses GlassBackground, GlassInput, GlassButton for visual consistency.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassInput } from '@/components/ui/glass/GlassInput';
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography, glass } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

// ─── Value Reminders ────────────────────────────────

const VALUE_POINTS: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }[] = [
  { icon: 'shield-checkmark-outline', text: 'Your data stays private — always' },
  { icon: 'locate-outline', text: 'Built around your real scenarios' },
  { icon: 'bar-chart-outline', text: 'Tracks your actual communication ability' },
];

// ─── Screen ─────────────────────────────────────────

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { first_name } = useOnboardingV3();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState(first_name || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid =
    fullName.trim().length > 0 &&
    email.trim().length > 3 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSignup = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(email.trim(), password);

      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          Alert.alert(
            'Account exists',
            'An account with this email already exists. Would you like to sign in?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign in', onPress: () => router.push('/(auth)/onboarding-v3/login') },
            ],
          );
        } else {
          Alert.alert('Signup failed', error.message || 'Something went wrong. Please try again.');
        }
        setLoading(false);
        return;
      }

      // Email confirmation required
      if (data.user && !data.session) {
        Alert.alert(
          'Check your email',
          'We sent a confirmation link to your email. Please verify to continue.',
          [{ text: 'OK', onPress: () => router.push('/(auth)/onboarding-v3/login') }],
        );
        setLoading(false);
        return;
      }

      // Auto-confirmed — proceed to path generation
      setLoading(false);
      router.push('/(auth)/onboarding-v3/creating-path');
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <GlassBackground intensity="subtle">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.header}>Save your progress</Text>
            <Text style={styles.subtitle}>
              Create an account to unlock your personalized path
            </Text>
          </Animated.View>

          {/* Value reminders */}
          <Animated.View entering={FadeInDown.duration(350).delay(200)} style={styles.valueSection}>
            {VALUE_POINTS.map((point, i) => (
              <View key={i} style={styles.valueRow}>
                <Ionicons name={point.icon} size={18} color={colors.primary.light} />
                <Text style={styles.valueText}>{point.text}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.formSection}>
            <GlassInput
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              autoCapitalize="words"
              autoCorrect={false}
            />

            <GlassInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <GlassInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />

            <GlassInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInUp.duration(300).delay(500)} style={styles.ctaSection}>
            <GlassButton
              variant="primary"
              onPress={handleSignup}
              disabled={!isValid}
              loading={loading}
            >
              Create account
            </GlassButton>

            <Text style={styles.privacyNote}>
              We never sell your data or show ads.
            </Text>
          </Animated.View>

          {/* Sign in link */}
          <Animated.View entering={FadeInUp.duration(300).delay(600)} style={styles.signInRow}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/onboarding-v3/login')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },

  header: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },

  // Value reminders
  valueSection: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: glass.surface.thin,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: glass.border.light,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  valueText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.medium,
    color: colors.text.secondary,
  },

  // Form
  formSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  // CTA
  ctaSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  privacyNote: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.regular,
    color: colors.text.disabled,
    textAlign: 'center',
  },

  // Sign in
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  signInLink: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.display.semibold,
    color: colors.primary.light,
  },
});
