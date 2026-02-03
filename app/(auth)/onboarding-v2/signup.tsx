/**
 * Onboarding V2 - Signup Screen
 * Beautiful signup form with CometBackground
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

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useTranslation('onboarding');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states for inputs
  const [isFullNameFocused, setIsFullNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert(t('common.error'), t('signup.errors.enter_name'));
      return;
    }
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('signup.errors.enter_email'));
      return;
    }
    if (!password) {
      Alert.alert(t('common.error'), t('signup.errors.enter_password'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('signup.errors.passwords_mismatch'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('signup.errors.password_too_short'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(email.trim(), password);

      if (error) {
        console.error('Signup error:', error);

        // Handle "User already registered" error with a friendly message
        if (error.message?.toLowerCase().includes('already registered')) {
          Alert.alert(
            t('signup.alerts.account_exists_title'),
            t('signup.alerts.account_exists_message'),
            [
              { text: t('signup.alerts.cancel'), style: 'cancel' },
              {
                text: t('signup.sign_in'),
                onPress: () => router.push('/(auth)/onboarding-v2/login'),
              },
            ]
          );
          setLoading(false);
          return;
        }

        Alert.alert(t('signup.alerts.signup_failed'), error.message || t('signup.alerts.signup_failed_message'));
        setLoading(false);
        return;
      }

      console.log('Signup successful:', data.user?.email);

      // Check if email confirmation is required
      if (data.user && !data.session) {
        Alert.alert(
          t('signup.alerts.check_email_title'),
          t('signup.alerts.check_email_message'),
          [
            {
              text: t('common.ok'),
              onPress: () => router.push('/(auth)/onboarding-v2/login'),
            },
          ]
        );
        setLoading(false);
        return;
      }

      // If auto-confirmed, continue to onboarding
      setLoading(false);
      router.push('/(auth)/onboarding-v2/languages');
    } catch (error) {
      setLoading(false);
      console.error('Signup exception:', error);
      Alert.alert(t('common.error'), t('signup.errors.unexpected_error'));
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
              <Text style={styles.title}>{t('signup.title')}</Text>
              <Text style={styles.subtitle}>
                {t('signup.subtitle')}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('signup.full_name_label')}</Text>
                <TextInput
                  style={[styles.input, isFullNameFocused && styles.inputFocused]}
                  placeholder={t('signup.full_name_placeholder')}
                  placeholderTextColor={colors.text.tertiary}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setIsFullNameFocused(true)}
                  onBlur={() => setIsFullNameFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('signup.email_label')}</Text>
                <TextInput
                  style={[styles.input, isEmailFocused && styles.inputFocused]}
                  placeholder={t('signup.email_placeholder')}
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
                <Text style={styles.label}>{t('signup.password_label')}</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, isPasswordFocused && styles.passwordInputFocused]}
                    placeholder={t('signup.password_placeholder')}
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('signup.confirm_password_label')}</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, isConfirmPasswordFocused && styles.passwordInputFocused]}
                    placeholder={t('signup.confirm_password_placeholder')}
                    placeholderTextColor={colors.text.tertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.passwordToggleIcon}>
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
                style={{ marginTop: spacing.lg }}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.signupButton, shadows.glow.primary]}
                >
                  <Text style={styles.signupButtonText}>
                    {loading ? t('signup.creating_account') : t('signup.continue')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Terms */}
              <Text style={styles.termsText}>
                {t('signup.terms_text')}{' '}
                <Text style={styles.termsLink}>{t('signup.terms_of_service')}</Text> {t('signup.and')}{' '}
                <Text style={styles.termsLink}>{t('signup.privacy_policy')}</Text>
              </Text>
            </View>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>{t('signup.have_account')} </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/onboarding-v2/login')}>
                <Text style={styles.signInLink}>{t('signup.sign_in')}</Text>
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
  signupButton: {
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  termsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  signInText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  signInLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },
});
