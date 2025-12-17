/**
 * RTL (Right-to-Left) Utilities
 * Handle RTL language support for Arabic and Hebrew
 */

import { I18nManager, Platform } from 'react-native';
import { isRTLLanguage as checkRTLLanguage, type SupportedLanguageCode } from '../types';

/**
 * Check if a language code is an RTL language
 */
export function isRTLLanguage(languageCode: SupportedLanguageCode): boolean {
  return checkRTLLanguage(languageCode);
}

/**
 * Get current RTL status from I18nManager
 */
export function isRTL(): boolean {
  return I18nManager.isRTL;
}

/**
 * Enable or disable RTL mode
 * WARNING: This requires an app restart to take effect on native platforms
 *
 * @param enabled - Whether RTL should be enabled
 * @returns true if a restart is required
 */
export function setRTL(enabled: boolean): boolean {
  const currentRTL = I18nManager.isRTL;

  if (currentRTL !== enabled) {
    I18nManager.forceRTL(enabled);
    I18nManager.allowRTL(enabled);

    // Native platforms require restart
    if (Platform.OS !== 'web') {
      return true; // Restart required
    }
  }

  return false; // No restart needed
}

/**
 * Allow RTL layout direction
 * Call this early in app initialization
 */
export function allowRTL(allowed: boolean = true): void {
  I18nManager.allowRTL(allowed);
}

/**
 * Check if we need to switch RTL mode when changing languages
 *
 * @param currentLanguage - Current language code
 * @param newLanguage - New language code to switch to
 * @returns true if RTL mode needs to change
 */
export function needsRTLSwitch(
  currentLanguage: SupportedLanguageCode,
  newLanguage: SupportedLanguageCode
): boolean {
  const currentIsRTL = isRTLLanguage(currentLanguage);
  const newIsRTL = isRTLLanguage(newLanguage);
  return currentIsRTL !== newIsRTL;
}

/**
 * Get RTL-aware style value
 * Useful for manual style adjustments
 *
 * @example
 * const paddingStart = getRTLValue(16, 0);  // 16 in LTR, 0 in RTL
 */
export function getRTLValue<T>(ltrValue: T, rtlValue: T): T {
  return I18nManager.isRTL ? rtlValue : ltrValue;
}

/**
 * Get RTL-aware flex direction
 */
export function getFlexDirection(reverse: boolean = false): 'row' | 'row-reverse' {
  const isReversed = I18nManager.isRTL !== reverse;
  return isReversed ? 'row-reverse' : 'row';
}

/**
 * Get RTL-aware text alignment
 */
export function getTextAlign(align: 'start' | 'end' | 'center' = 'start'): 'left' | 'right' | 'center' {
  if (align === 'center') return 'center';

  if (I18nManager.isRTL) {
    return align === 'start' ? 'right' : 'left';
  }
  return align === 'start' ? 'left' : 'right';
}

/**
 * Transform value for RTL icon flipping
 * Use with directional icons like arrows and chevrons
 */
export function getIconTransform(): { transform: { scaleX: number }[] } | undefined {
  if (I18nManager.isRTL) {
    return { transform: [{ scaleX: -1 }] };
  }
  return undefined;
}
