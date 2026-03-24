/**
 * V3 Login Screen
 * Glassmorphism login form — "Welcome back"
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
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassInput } from '@/components/ui/glass/GlassInput';
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { t } = useTranslation('onboarding');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = email.trim().length > 3 && password.length >= 6;

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('login.errors.enter_email'));
      return;
    }
    if (!password) {
      Alert.alert(t('common.error'), t('login.errors.enter_password'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        Alert.alert(t('common.error'), error.message || t('login.errors.invalid_credentials'));
        setLoading(false);
        return;
      }

      // Success — route to root, which handles staircase check
      setLoading(false);
      router.replace('/');
    } catch (err) {
      setLoading(false);
      Alert.alert(t('common.error'), t('login.errors.unexpected_error'));
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
            { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.header}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.formSection}>
            <GlassInput
              label={t('login.email_label')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('login.email_placeholder')}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoFocusOnMount
            />

            <GlassInput
              label={t('login.password_label')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('login.password_placeholder')}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInUp.duration(300).delay(400)} style={styles.ctaSection}>
            <GlassButton
              variant="primary"
              onPress={handleLogin}
              disabled={!isValid}
              loading={loading}
            >
              {t('login.sign_in_button')}
            </GlassButton>
          </Animated.View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Signup link */}
          <Animated.View entering={FadeInUp.duration(300).delay(500)} style={styles.signUpRow}>
            <Text style={styles.signUpText}>{t('login.no_account')} </Text>
            <Pressable onPress={() => router.push('/(auth)/onboarding-v3/signup')}>
              <Text style={styles.signUpLink}>{t('login.sign_up')}</Text>
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
    marginBottom: spacing['2xl'],
  },

  formSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  ctaSection: {
    marginBottom: spacing.lg,
  },

  spacer: { flex: 1 },

  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  signUpLink: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.display.semibold,
    color: colors.primary.light,
  },
});
