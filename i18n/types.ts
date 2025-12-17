/**
 * i18n Type Definitions
 * TypeScript types for translation system
 */

// Supported language codes
export const SUPPORTED_LANGUAGE_CODES = [
  'en', 'es', 'fr', 'de', 'ar', 'he', 'zh', 'ja', 'ko', 'pt'
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGE_CODES[number];

// Language metadata
export interface LanguageInfo {
  code: SupportedLanguageCode;
  name: string;        // English name
  nativeName: string;  // Name in native language
  flag: string;        // Emoji flag
  rtl?: boolean;       // Right-to-left language
}

// All supported languages with metadata
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

// Translation namespaces
export const TRANSLATION_NAMESPACES = [
  'common',
  'onboarding',
  'home',
  'practice',
  'settings',
  'errors',
  'rewards',
] as const;

export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[number];

// Helper to get language info by code
export function getLanguageInfo(code: SupportedLanguageCode): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

// Helper to check if a language code is supported
export function isSupportedLanguage(code: string): code is SupportedLanguageCode {
  return SUPPORTED_LANGUAGE_CODES.includes(code as SupportedLanguageCode);
}

// Helper to check if a language is RTL
export function isRTLLanguage(code: SupportedLanguageCode): boolean {
  const lang = getLanguageInfo(code);
  return lang?.rtl === true;
}

// Languages with complete translations (can be used as app UI language)
// Update this list as new translations are added
export const LANGUAGES_WITH_TRANSLATIONS: SupportedLanguageCode[] = ['en', 'es', 'fr', 'pt', 'ar'];

// Helper to check if a language has translations available
export function hasTranslations(code: string): boolean {
  return LANGUAGES_WITH_TRANSLATIONS.includes(code as SupportedLanguageCode);
}

// Helper to get the best available language for UI
// Returns the requested language if available, otherwise 'en'
export function getBestAvailableLanguage(code: string): SupportedLanguageCode {
  if (hasTranslations(code)) {
    return code as SupportedLanguageCode;
  }
  return 'en'; // Default fallback
}
