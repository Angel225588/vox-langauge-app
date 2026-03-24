/**
 * Screen 0: Welcome
 * Crystal logo + tagline + "Get Started"
 * Auto-detects phone language as native language.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActionSheetIOS, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { useTranslation } from 'react-i18next';
import { LANGUAGES_WITH_TRANSLATIONS, type SupportedLanguageCode, getLanguageInfo } from '@/i18n/types';
import { colors, spacing, typography } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

// ─── Crystal Logo ───────────────────────────────────

function CrystalLogo() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowRadius: interpolate(pulse.value, [0, 1], [12, 24]),
    shadowOpacity: interpolate(pulse.value, [0, 1], [0.4, 0.7]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.02]) }],
  }));

  // 8-pointed star built from 4 rotated diamonds
  return (
    <Animated.View style={[styles.logoOuter, glowStyle]}>
      <View style={styles.logoContainer}>
        {[0, 45, 90, 135].map((angle) => (
          <LinearGradient
            key={angle}
            colors={['#0036FF', '#3D6BFF', '#0050CC']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[
              styles.logoPetal,
              { transform: [{ rotate: `${angle}deg` }] },
            ]}
          />
        ))}
        {/* Center circle */}
        <View style={styles.logoCenter} />
      </View>
    </Animated.View>
  );
}

// ─── Language name helper ────────────────────────────

const LANG_NAMES: Record<string, string> = {
  english: 'English',
  spanish: 'Spanish',
  french: 'French',
  portuguese: 'Portuguese',
  german: 'German',
  italian: 'Italian',
  chinese: 'Chinese',
  japanese: 'Japanese',
  korean: 'Korean',
  arabic: 'Arabic',
  hindi: 'Hindi',
  russian: 'Russian',
  // i18n code → display name (for language picker)
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  pt: 'Portuguese',
  ar: 'Arabic',
  de: 'German',
};

// ─── Screen ─────────────────────────────────────────

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { native_language, setField } = useOnboardingV3();
  const { changeLanguage, currentLanguage } = useLanguage();
  const { t } = useTranslation('onboarding');

  const displayLang = LANG_NAMES[native_language] || native_language;

  const handleChangeLanguage = () => {
    const langOptions = LANGUAGES_WITH_TRANSLATIONS.map(code => {
      const info = getLanguageInfo(code);
      return info ? `${info.flag} ${info.nativeName}` : code;
    });

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...langOptions, 'Cancel'],
          cancelButtonIndex: langOptions.length,
          title: t('languages.title'),
        },
        (index) => {
          if (index < LANGUAGES_WITH_TRANSLATIONS.length) {
            const code = LANGUAGES_WITH_TRANSLATIONS[index];
            changeLanguage(code);
            // Also update native language in onboarding store
            const fullName = LANG_NAMES[code] || code;
            if (fullName) setField('native_language', fullName.toLowerCase());
          }
        },
      );
    } else {
      // Android fallback — simple Alert with buttons
      const buttons = LANGUAGES_WITH_TRANSLATIONS.slice(0, 3).map(code => {
        const info = getLanguageInfo(code);
        return {
          text: info ? `${info.flag} ${info.nativeName}` : code,
          onPress: () => {
            changeLanguage(code);
            const fullName = LANG_NAMES[code] || code;
            if (fullName) setField('native_language', fullName.toLowerCase());
          },
        };
      });
      Alert.alert(t('languages.title'), t('languages.subtitle'), [
        ...buttons,
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <GlassBackground intensity="medium">
      <View style={[styles.container, { paddingTop: insets.top + spacing['2xl'] }]}>
        {/* Logo */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100).springify()}
          style={styles.logoSection}
        >
          <CrystalLogo />
          <Text style={styles.brandName}>Vox</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(300)}
          style={styles.taglineSection}
        >
          <Text style={styles.tagline}>{t('welcome.slogan_line1')} {t('welcome.slogan_line2')}</Text>
        </Animated.View>

        {/* Personalization promise */}
        <Animated.View
          entering={FadeIn.duration(400).delay(500)}
          style={styles.promiseSection}
        >
          <Text style={styles.promiseText}>
            {t('welcome.subtitle')}
          </Text>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Language indicator */}
        <Animated.View
          entering={FadeIn.duration(300).delay(600)}
          style={styles.langIndicator}
        >
          <Text style={styles.langText}>{t('languages.your_native_language')}: {displayLang}</Text>
          <Pressable onPress={handleChangeLanguage}>
            <Text style={styles.langChange}>Change</Text>
          </Pressable>
        </Animated.View>

        {/* CTA */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(700)}
          style={styles.ctaSection}
        >
          <GlassButton
            variant="primary"
            size="lg"
            onPress={() => {
              setField('current_step', 1);
              router.push('/(auth)/onboarding-v3/name');
            }}
          >
            {t('welcome.get_started')}
          </GlassButton>
        </Animated.View>

        {/* Sign in link */}
        <Animated.View
          entering={FadeIn.duration(300).delay(800)}
          style={[styles.signInRow, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <Text style={styles.signInText}>{t('welcome.already_have_account')} </Text>
          <Pressable onPress={() => router.push('/(auth)/onboarding-v3/login')}>
            <Text style={styles.signInLink}>{t('welcome.sign_in')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </GlassBackground>
  );
}

// ─── Styles ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoOuter: {
    shadowColor: '#0036FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: spacing.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPetal: {
    position: 'absolute',
    width: 24,
    height: 80,
    borderRadius: 12,
  },
  logoCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4D94FF',
  },
  brandName: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: fonts.display.extrabold,
    color: colors.text.primary,
    letterSpacing: 4,
    textAlign: 'center',
  },

  // Tagline
  taglineSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  tagline: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * 1.5,
  },

  // Promise
  promiseSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  promiseText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.6,
  },

  spacer: {
    flex: 1,
  },

  // Language indicator
  langIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  langText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  langChange: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.display.semibold,
    color: colors.primary.light,
  },

  // CTA
  ctaSection: {
    marginBottom: spacing.lg,
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
