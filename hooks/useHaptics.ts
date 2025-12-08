/**
 * useHaptics Hook
 *
 * A reusable hook that provides consistent haptic feedback across the app.
 * Instead of importing expo-haptics and calling different methods everywhere,
 * use this hook for clean, semantic haptic calls.
 *
 * @example
 * ```tsx
 * import { useHaptics } from '@/hooks/useHaptics';
 *
 * function MyComponent() {
 *   const haptics = useHaptics();
 *
 *   const handleCorrectAnswer = () => {
 *     haptics.success();
 *   };
 *
 *   const handleWrongAnswer = () => {
 *     haptics.error();      // Single error vibration
 *     // OR
 *     haptics.doubleError(); // Strong double vibration for emphasis
 *   };
 *
 *   const handleButtonPress = () => {
 *     haptics.light();
 *   };
 * }
 * ```
 */

import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export interface HapticsAPI {
  /** Light tap - use for selections, toggles, minor interactions */
  light: () => void;
  /** Medium tap - use for button presses, confirmations */
  medium: () => void;
  /** Heavy tap - use for important actions, warnings */
  heavy: () => void;
  /** Success vibration - use when user gets something right */
  success: () => void;
  /** Warning vibration - use for alerts, caution states */
  warning: () => void;
  /** Error vibration - single error feedback */
  error: () => void;
  /** Double error vibration - strong emphasis for wrong answers */
  doubleError: () => void;
  /** Selection changed - subtle feedback for picker/selection changes */
  selection: () => void;
}

export function useHaptics(): HapticsAPI {
  // Light impact - selections, toggles
  const light = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Medium impact - button presses
  const medium = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Heavy impact - important actions
  const heavy = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  // Success notification
  const success = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Warning notification
  const warning = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  // Error notification (single)
  const error = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  // Double error - strong emphasis (used in wrong answer feedback)
  // Pattern: Error notification followed by heavy impact after 100ms
  const doubleError = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 100);
  }, []);

  // Selection changed - for pickers, etc.
  const selection = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    doubleError,
    selection,
  };
}

/**
 * Non-hook version for use outside of React components
 * (e.g., in utility functions, callbacks that aren't in component scope)
 *
 * @example
 * ```tsx
 * import { hapticFeedback } from '@/hooks/useHaptics';
 *
 * // In some utility function
 * hapticFeedback.success();
 * ```
 */
export const hapticFeedback: HapticsAPI = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  doubleError: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 100);
  },
  selection: () => Haptics.selectionAsync(),
};
