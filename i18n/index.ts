/**
 * i18n Configuration
 * Main entry point for internationalization
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLanguagePreference, saveLanguagePreference } from '@/lib/storage/languageStorage';
import { getDeviceLanguage } from './utils/languageDetector';
import { allowRTL } from './utils/rtl';
import {
  SUPPORTED_LANGUAGES,
  TRANSLATION_NAMESPACES,
  type SupportedLanguageCode,
  type LanguageInfo,
} from './types';

// Import English translations (always bundled)
import commonEN from './locales/en/common.json';
import onboardingEN from './locales/en/onboarding.json';
import homeEN from './locales/en/home.json';
import practiceEN from './locales/en/practice.json';
import settingsEN from './locales/en/settings.json';
import errorsEN from './locales/en/errors.json';
import rewardsEN from './locales/en/rewards.json';

// Import Spanish translations
import commonES from './locales/es/common.json';
import onboardingES from './locales/es/onboarding.json';
import homeES from './locales/es/home.json';
import practiceES from './locales/es/practice.json';
import settingsES from './locales/es/settings.json';
import errorsES from './locales/es/errors.json';
import rewardsES from './locales/es/rewards.json';

// Import French translations
import commonFR from './locales/fr/common.json';
import onboardingFR from './locales/fr/onboarding.json';
import homeFR from './locales/fr/home.json';
import practiceFR from './locales/fr/practice.json';
import settingsFR from './locales/fr/settings.json';
import errorsFR from './locales/fr/errors.json';
import rewardsFR from './locales/fr/rewards.json';

// Import Portuguese translations
import commonPT from './locales/pt/common.json';
import onboardingPT from './locales/pt/onboarding.json';
import homePT from './locales/pt/home.json';
import practicePT from './locales/pt/practice.json';
import settingsPT from './locales/pt/settings.json';
import errorsPT from './locales/pt/errors.json';
import rewardsPT from './locales/pt/rewards.json';

// Import Arabic translations
import commonAR from './locales/ar/common.json';
import onboardingAR from './locales/ar/onboarding.json';
import homeAR from './locales/ar/home.json';
import practiceAR from './locales/ar/practice.json';
import settingsAR from './locales/ar/settings.json';
import errorsAR from './locales/ar/errors.json';
import rewardsAR from './locales/ar/rewards.json';

// Define resources with all bundled languages
const resources = {
  en: {
    common: commonEN,
    onboarding: onboardingEN,
    home: homeEN,
    practice: practiceEN,
    settings: settingsEN,
    errors: errorsEN,
    rewards: rewardsEN,
  },
  es: {
    common: commonES,
    onboarding: onboardingES,
    home: homeES,
    practice: practiceES,
    settings: settingsES,
    errors: errorsES,
    rewards: rewardsES,
  },
  fr: {
    common: commonFR,
    onboarding: onboardingFR,
    home: homeFR,
    practice: practiceFR,
    settings: settingsFR,
    errors: errorsFR,
    rewards: rewardsFR,
  },
  pt: {
    common: commonPT,
    onboarding: onboardingPT,
    home: homePT,
    practice: practicePT,
    settings: settingsPT,
    errors: errorsPT,
    rewards: rewardsPT,
  },
  ar: {
    common: commonAR,
    onboarding: onboardingAR,
    home: homeAR,
    practice: practiceAR,
    settings: settingsAR,
    errors: errorsAR,
    rewards: rewardsAR,
  },
};

// Track initialization state
let isInitialized = false;

/**
 * Initialize i18n system
 * Call this before rendering the app
 */
export async function initializeI18n(): Promise<void> {
  if (isInitialized) {
    console.log('[i18n] Already initialized');
    return;
  }

  // Allow RTL layouts
  allowRTL(true);

  // Get saved preference or use device language
  const savedLanguage = await getLanguagePreference();
  const deviceLanguage = getDeviceLanguage();
  const initialLanguage = savedLanguage || deviceLanguage;

  console.log(`[i18n] Initializing with language: ${initialLanguage}`);
  console.log(`[i18n] Device language: ${deviceLanguage}`);
  console.log(`[i18n] Saved preference: ${savedLanguage || 'none'}`);

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',

      // Namespace configuration
      defaultNS: 'common',
      ns: TRANSLATION_NAMESPACES,

      // Interpolation settings
      interpolation: {
        escapeValue: false, // React already escapes
        format: (value, format, lng) => {
          if (format === 'uppercase') return String(value).toUpperCase();
          if (format === 'lowercase') return String(value).toLowerCase();
          if (format === 'capitalize') {
            const str = String(value);
            return str.charAt(0).toUpperCase() + str.slice(1);
          }
          if (value instanceof Date) {
            return new Intl.DateTimeFormat(lng).format(value);
          }
          return String(value);
        },
      },

      // Pluralization
      pluralSeparator: '_',

      // React settings
      react: {
        useSuspense: false, // We handle loading state manually
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
      },

      // Debugging (disable in production)
      debug: __DEV__,

      // Return empty string for missing keys (shows key in dev)
      returnEmptyString: false,
      returnNull: false,
    });

  // Save the initial language if not already saved
  if (!savedLanguage) {
    await saveLanguagePreference(initialLanguage);
  }

  isInitialized = true;
  console.log('[i18n] Initialization complete');
}

/**
 * Check if translations for a language are available
 * Currently EN and ES are bundled, others will fall back to English
 */
export function isLanguageAvailable(languageCode: SupportedLanguageCode): boolean {
  return i18n.hasResourceBundle(languageCode, 'common');
}

/**
 * Load translations for a specific language
 * Note: Currently all translations are bundled statically
 * This function is kept for future lazy loading implementation
 */
export async function loadLanguageTranslations(
  languageCode: SupportedLanguageCode
): Promise<void> {
  // Check if already loaded (statically bundled)
  if (i18n.hasResourceBundle(languageCode, 'common')) {
    console.log(`[i18n] ${languageCode} translations available`);
    return;
  }

  // Language not available, will fall back to English
  console.log(`[i18n] ${languageCode} not available, using English fallback`);
}

/**
 * Change the current language
 * Handles loading translations and persisting preference
 */
export async function changeLanguage(
  languageCode: SupportedLanguageCode
): Promise<void> {
  // Load translations if needed
  await loadLanguageTranslations(languageCode);

  // Change language
  await i18n.changeLanguage(languageCode);

  // Persist preference
  await saveLanguagePreference(languageCode);

  console.log(`[i18n] Language changed to ${languageCode}`);
}

/**
 * Get the current language code
 */
export function getCurrentLanguage(): SupportedLanguageCode {
  return i18n.language as SupportedLanguageCode;
}

/**
 * Check if i18n is initialized
 */
export function isI18nInitialized(): boolean {
  return isInitialized;
}

// Re-export types and utilities for convenience
export {
  SUPPORTED_LANGUAGES,
  TRANSLATION_NAMESPACES,
  type SupportedLanguageCode,
  type LanguageInfo,
};

export { getLanguageInfo, isSupportedLanguage, isRTLLanguage } from './types';
export { useLanguage } from './hooks/useLanguage';
export { useRTL, useRTLValue } from './hooks/useRTL';
export * from './utils/formatters';
export * from './utils/rtl';

export default i18n;
