/**
 * Onboarding V2 - Login Screen
 * Beautiful login form with CometBackground
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CometBackground } from '@/components/ui/CometBackground';
import { BackButton } from '@/components/ui/BackButton';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useTranslation('onboarding');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Focus states for inputs
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Error', t('login.errors.enter_email'));
      return;
    }
    if (!password) {
      Alert.alert('Error', t('login.errors.enter_password'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(email.trim(), password);

      if (error) {
        console.error('Login error:', error);
        Alert.alert('Login Failed', error.message || t('login.errors.invalid_credentials'));
        setLoading(false);
        return;
      }

      console.log('Login successful:', data.user?.email);
      setLoading(false);
      router.replace('/');
    } catch (error) {
      setLoading(false);
      console.error('Login exception:', error);
      Alert.alert('Error', t('login.errors.unexpected_error'));
    }
  };

  return (
    <CometBackground intensity="low">
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <BackButton onPress={() => router.back()} />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{t('login.title')}</Text>
              <Text style={styles.subtitle}>
                {t('login.subtitle')}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('login.email_label')}</Text>
                <TextInput
                  style={[styles.input, isEmailFocused && styles.inputFocused]}
                  placeholder={t('login.email_placeholder')}
                  placeholderTextColor={colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('login.password_label')}</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, isPasswordFocused && styles.passwordInputFocused]}
                    placeholder={t('login.password_placeholder')}
                    placeholderTextColor={colors.text.tertiary}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.passwordToggleIcon}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>{t('login.forgot_password')}</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                style={{ marginTop: spacing.lg }}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.loginButton, shadows.glow.primary]}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? t('login.signing_in') : t('login.sign_in_button')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>{t('login.no_account')} </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/onboarding-v2/signup')}>
                <Text style={styles.signUpLink}>{t('login.sign_up')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CometBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  titleContainer: {
    marginBottom: spacing['2xl'],
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
    lineHeight: 26,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    height: 56,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  inputFocused: {
    borderColor: colors.primary.DEFAULT,
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 56,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingRight: 56, // Make room for the toggle button
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  passwordInputFocused: {
    borderColor: colors.primary.DEFAULT,
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    height: 56,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggleIcon: {
    fontSize: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },
  loginButton: {
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  signUpText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  signUpLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },
});
