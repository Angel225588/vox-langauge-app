/**
 * useRTL Hook
 * Provides RTL state and utilities for components
 */

import { useMemo } from 'react';
import { I18nManager, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { isRTLLanguage } from '../types';
import type { SupportedLanguageCode } from '../types';

interface RTLState {
  /** Whether current layout is RTL */
  isRTL: boolean;
  /** Whether current language is an RTL language */
  isRTLLanguage: boolean;
  /** Get RTL-aware flex direction */
  flexDirection: 'row' | 'row-reverse';
  /** Get RTL-aware text alignment */
  textAlign: 'left' | 'right';
  /** Transform for flipping directional icons */
  iconTransform: { transform: { scaleX: number }[] } | undefined;
}

interface RTLStyles {
  /** Styles that should flip in RTL */
  row: ViewStyle;
  rowReverse: ViewStyle;
  textStart: TextStyle;
  textEnd: TextStyle;
  flipIcon: ViewStyle;
}

/**
 * Hook for RTL-aware styling and layout
 *
 * @example
 * function MyComponent() {
 *   const { isRTL, flexDirection, styles } = useRTL();
 *
 *   return (
 *     <View style={[{ flexDirection }, styles.row]}>
 *       <Icon style={styles.flipIcon} name="chevron-left" />
 *       <Text style={styles.textStart}>Hello</Text>
 *     </View>
 *   );
 * }
 */
export function useRTL(): RTLState & { styles: RTLStyles } {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguageCode;

  const state = useMemo<RTLState>(() => {
    const isRTL = I18nManager.isRTL;
    const isRTLLang = isRTLLanguage(currentLanguage);

    return {
      isRTL,
      isRTLLanguage: isRTLLang,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      textAlign: isRTL ? 'right' : 'left',
      iconTransform: isRTL ? { transform: [{ scaleX: -1 }] } : undefined,
    };
  }, [currentLanguage]);

  const styles = useMemo<RTLStyles>(() => {
    const isRTL = I18nManager.isRTL;

    return StyleSheet.create({
      row: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
      },
      rowReverse: {
        flexDirection: isRTL ? 'row' : 'row-reverse',
      },
      textStart: {
        textAlign: isRTL ? 'right' : 'left',
      },
      textEnd: {
        textAlign: isRTL ? 'left' : 'right',
      },
      flipIcon: isRTL ? { transform: [{ scaleX: -1 }] } : {},
    });
  }, []);

  return {
    ...state,
    styles,
  };
}

/**
 * Get RTL-aware value
 * Returns different values based on current RTL state
 *
 * @example
 * const padding = useRTLValue(16, 24); // 16 in LTR, 24 in RTL
 */
export function useRTLValue<T>(ltrValue: T, rtlValue: T): T {
  return I18nManager.isRTL ? rtlValue : ltrValue;
}

export default useRTL;
