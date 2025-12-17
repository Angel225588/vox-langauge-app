/**
 * Language Detector
 * Detects device language and maps to supported languages
 */

import * as Localization from 'expo-localization';
import {
  SUPPORTED_LANGUAGE_CODES,
  type SupportedLanguageCode,
  isSupportedLanguage
} from '../types';

/**
 * Get the device's primary language code
 */
export function getDeviceLocale(): string {
  const locales = Localization.getLocales();
  if (locales.length > 0) {
    return locales[0].languageCode ?? 'en';
  }
  return 'en';
}

/**
 * Get the device's full locale tag (e.g., 'en-US', 'es-MX')
 */
export function getDeviceLocaleTag(): string {
  const locales = Localization.getLocales();
  if (locales.length > 0) {
    return locales[0].languageTag ?? 'en-US';
  }
  return 'en-US';
}

/**
 * Get the best matching supported language for the device
 * Falls back to English if device language is not supported
 */
export function getDeviceLanguage(): SupportedLanguageCode {
  const deviceLocale = getDeviceLocale();

  // Check if device language is directly supported
  if (isSupportedLanguage(deviceLocale)) {
    return deviceLocale;
  }

  // Try to find a language that starts with the same code
  // e.g., 'zh-Hans' -> 'zh', 'pt-BR' -> 'pt'
  const baseCode = deviceLocale.split('-')[0];
  if (isSupportedLanguage(baseCode)) {
    return baseCode;
  }

  // Fall back to English
  return 'en';
}

/**
 * Get all device locales in order of preference
 */
export function getAllDeviceLocales(): string[] {
  const locales = Localization.getLocales();
  return locales.map(locale => locale.languageCode ?? 'en');
}

/**
 * Check if the device is using a RTL locale
 */
export function isDeviceRTL(): boolean {
  const locales = Localization.getLocales();
  if (locales.length > 0) {
    return locales[0].textDirection === 'rtl';
  }
  return false;
}

/**
 * Get the device's timezone
 */
export function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Get the device's preferred calendar system
 */
export function getDeviceCalendar(): string {
  try {
    const calendar = Intl.DateTimeFormat().resolvedOptions().calendar;
    return calendar ?? 'gregorian';
  } catch {
    return 'gregorian';
  }
}
