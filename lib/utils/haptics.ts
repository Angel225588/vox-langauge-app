/**
 * Haptics Utility
 *
 * Provides a unified haptic feedback API for the Vox app.
 * Uses expo-haptics with graceful fallbacks.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback types for different interactions
 */
export const HapticFeedback = {
  /**
   * Light tap - for subtle UI feedback
   * Use for: toggles, small buttons, list item selection
   */
  light: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium tap - for standard interactions
   * Use for: primary buttons, card presses, navigation
   */
  medium: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy tap - for significant actions
   * Use for: delete confirmation, major state changes
   */
  heavy: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Success notification
   * Use for: completed actions, achievements, correct answers
   */
  success: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning notification
   * Use for: alerts, important notices
   */
  warning: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error notification
   * Use for: errors, incorrect answers, failed actions
   */
  error: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Selection changed
   * Use for: picker changes, segmented control, view toggle
   */
  selection: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
  },

  /**
   * Soft rigid impact
   * Use for: card flips, swipe gestures
   */
  rigid: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }
  },

  /**
   * Soft impact
   * Use for: pull-to-refresh trigger, soft bounces
   */
  soft: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
  },
};

/**
 * Semantic haptic feedback for vocabulary interactions
 */
export const VocabularyHaptics = {
  /** When adding a new word */
  wordAdded: HapticFeedback.success,

  /** When deleting a word */
  wordDeleted: HapticFeedback.medium,

  /** When pressing a word card */
  cardPressed: HapticFeedback.light,

  /** When pressing a category */
  categoryPressed: HapticFeedback.medium,

  /** When toggling view mode */
  viewModeChanged: HapticFeedback.selection,

  /** When opening FAB */
  fabPressed: HapticFeedback.medium,

  /** When answer is correct */
  correctAnswer: HapticFeedback.success,

  /** When answer is incorrect */
  incorrectAnswer: HapticFeedback.error,

  /** When pull-to-refresh triggers */
  refreshTriggered: HapticFeedback.soft,

  /** When long-pressing for context menu */
  longPress: HapticFeedback.heavy,

  /** When clearing a filter */
  filterCleared: HapticFeedback.light,
};

export default HapticFeedback;
