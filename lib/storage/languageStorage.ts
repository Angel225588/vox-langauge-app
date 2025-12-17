/**
 * Language Storage
 * Persist user's language preference using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedLanguageCode } from '@/i18n/types';

const LANGUAGE_STORAGE_KEY = '@vox_language_preference';

/**
 * Save user's language preference
 */
export async function saveLanguagePreference(language: SupportedLanguageCode): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

/**
 * Get user's saved language preference
 */
export async function getLanguagePreference(): Promise<SupportedLanguageCode | null> {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return language as SupportedLanguageCode | null;
  } catch (error) {
    console.error('Error getting language preference:', error);
    return null;
  }
}

/**
 * Clear language preference (reset to device default)
 */
export async function clearLanguagePreference(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing language preference:', error);
  }
}

/**
 * Check if user has a saved language preference
 */
export async function hasLanguagePreference(): Promise<boolean> {
  const preference = await getLanguagePreference();
  return preference !== null;
}
