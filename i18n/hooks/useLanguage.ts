/**
 * useLanguage Hook
 * Manages language switching and persistence
 */

import { useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';
import {
  saveLanguagePreference,
  getLanguagePreference,
} from '@/lib/storage/languageStorage';
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguageCode,
  type LanguageInfo,
  getLanguageInfo,
  isRTLLanguage,
} from '../types';
import { isRTL, setRTL, needsRTLSwitch } from '../utils/rtl';

interface UseLanguageReturn {
  /** Current language code */
  currentLanguage: SupportedLanguageCode;
  /** Current language info (name, flag, etc.) */
  currentLanguageInfo: LanguageInfo | undefined;
  /** All supported languages */
  supportedLanguages: readonly LanguageInfo[];
  /** Whether current language is RTL */
  isRTL: boolean;
  /** Change to a new language */
  changeLanguage: (language: SupportedLanguageCode) => Promise<void>;
  /** Check if a language is the current one */
  isCurrentLanguage: (language: SupportedLanguageCode) => boolean;
}

/**
 * Hook for managing app language
 *
 * @example
 * function LanguageSettings() {
 *   const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();
 *
 *   return (
 *     <View>
 *       {supportedLanguages.map(lang => (
 *         <Button
 *           key={lang.code}
 *           title={lang.nativeName}
 *           onPress={() => changeLanguage(lang.code)}
 *         />
 *       ))}
 *     </View>
 *   );
 * }
 */
export function useLanguage(): UseLanguageReturn {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguageCode;
  const currentLanguageInfo = useMemo(
    () => getLanguageInfo(currentLanguage),
    [currentLanguage]
  );

  const changeLanguage = useCallback(
    async (newLanguage: SupportedLanguageCode) => {
      // Don't do anything if it's the same language
      if (newLanguage === currentLanguage) {
        return;
      }

      // Check if RTL mode needs to change
      const rtlSwitchNeeded = needsRTLSwitch(currentLanguage, newLanguage);

      // Change language in i18next
      await i18n.changeLanguage(newLanguage);

      // Save preference
      await saveLanguagePreference(newLanguage);

      // Handle RTL change if needed
      if (rtlSwitchNeeded) {
        const newIsRTL = isRTLLanguage(newLanguage);
        const restartNeeded = setRTL(newIsRTL);

        if (restartNeeded && Platform.OS !== 'web') {
          // Show restart prompt
          Alert.alert(
            t('settings:restart_required', 'Restart Required'),
            t(
              'settings:restart_message',
              'The app needs to restart to apply the new language direction.'
            ),
            [
              {
                text: t('common:buttons.cancel', 'Cancel'),
                style: 'cancel',
              },
              {
                text: t('settings:restart_now', 'Restart Now'),
                onPress: async () => {
                  try {
                    await Updates.reloadAsync();
                  } catch (error) {
                    console.error('Failed to reload app:', error);
                    Alert.alert(
                      t('errors:restart_failed', 'Restart Failed'),
                      t(
                        'errors:restart_failed_message',
                        'Please close and reopen the app manually.'
                      )
                    );
                  }
                },
              },
            ]
          );
        }
      }
    },
    [currentLanguage, i18n, t]
  );

  const isCurrentLanguage = useCallback(
    (language: SupportedLanguageCode) => language === currentLanguage,
    [currentLanguage]
  );

  return {
    currentLanguage,
    currentLanguageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRTL: isRTL(),
    changeLanguage,
    isCurrentLanguage,
  };
}

export default useLanguage;
