/**
 * Icon Component - Centralized Icon System
 *
 * A wrapper component that provides consistent icon styling across the app.
 * Uses @expo/vector-icons with predefined sizes and colors that map to the design system.
 *
 * Features:
 * - Predefined size variants: sm (16), md (20), lg (24), xl (32)
 * - Color variants that map to design system colors
 * - Common icons predefined for easy access
 * - Support for all Ionicons through custom name prop
 *
 * @example
 * ```tsx
 * <Icon name="checkmark" size="md" color="success" />
 * <Icon name="close" size="lg" color="error" />
 * <Icon name="play" size="xl" color="primary" />
 * <Icon name="heart-outline" size="md" /> // Uses default text.primary color
 * ```
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/designSystem';

// Size variants
export type IconSize = 'sm' | 'md' | 'lg' | 'xl';
export const ICON_SIZES: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Color variants that map to design system
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'accent'
  | 'text-primary'
  | 'text-secondary'
  | 'text-tertiary'
  | 'text-disabled'
  | 'white'
  | string; // Allow custom colors

// Color mapping
export const ICON_COLORS: Record<string, string> = {
  primary: colors.primary.DEFAULT,
  'primary-light': colors.primary.light,
  'primary-dark': colors.primary.dark,
  secondary: colors.secondary.DEFAULT,
  'secondary-light': colors.secondary.light,
  'secondary-dark': colors.secondary.dark,
  success: colors.success.DEFAULT,
  'success-light': colors.success.light,
  'success-dark': colors.success.dark,
  error: colors.error.DEFAULT,
  'error-light': colors.error.light,
  'error-dark': colors.error.dark,
  warning: colors.warning.DEFAULT,
  'warning-light': colors.warning.light,
  'warning-dark': colors.warning.dark,
  accent: colors.accent.primary,
  'accent-purple': colors.accent.purple,
  'accent-pink': colors.accent.pink,
  'accent-orange': colors.accent.orange,
  'accent-cyan': colors.accent.cyan,
  'text-primary': colors.text.primary,
  'text-secondary': colors.text.secondary,
  'text-tertiary': colors.text.tertiary,
  'text-disabled': colors.text.disabled,
  white: '#FFFFFF',
};

// Common icon names mapped to Ionicons
export const COMMON_ICONS = {
  // Actions
  checkmark: 'checkmark' as const,
  'checkmark-circle': 'checkmark-circle' as const,
  'checkmark-done': 'checkmark-done' as const,
  close: 'close' as const,
  'close-circle': 'close-circle' as const,
  add: 'add' as const,
  'add-circle': 'add-circle' as const,
  remove: 'remove' as const,
  'remove-circle': 'remove-circle' as const,

  // Media controls
  play: 'play' as const,
  'play-circle': 'play-circle' as const,
  pause: 'pause' as const,
  'pause-circle': 'pause-circle' as const,
  stop: 'stop' as const,
  'stop-circle': 'stop-circle' as const,

  // Audio
  mic: 'mic' as const,
  'mic-outline': 'mic-outline' as const,
  'mic-off': 'mic-off' as const,
  volume: 'volume-high' as const,
  'volume-high': 'volume-high' as const,
  'volume-medium': 'volume-medium' as const,
  'volume-low': 'volume-low' as const,
  'volume-mute': 'volume-mute' as const,
  'volume-off': 'volume-off' as const,

  // Favorites
  heart: 'heart' as const,
  'heart-outline': 'heart-outline' as const,
  bookmark: 'bookmark' as const,
  'bookmark-outline': 'bookmark-outline' as const,
  star: 'star' as const,
  'star-outline': 'star-outline' as const,

  // Navigation
  'chevron-back': 'chevron-back' as const,
  'chevron-forward': 'chevron-forward' as const,
  'chevron-up': 'chevron-up' as const,
  'chevron-down': 'chevron-down' as const,
  'arrow-back': 'arrow-back' as const,
  'arrow-forward': 'arrow-forward' as const,
  'arrow-up': 'arrow-up' as const,
  'arrow-down': 'arrow-down' as const,

  // Settings and info
  settings: 'settings' as const,
  'settings-outline': 'settings-outline' as const,
  help: 'help-circle' as const,
  'help-outline': 'help-circle-outline' as const,
  info: 'information-circle' as const,
  'info-outline': 'information-circle-outline' as const,
  warning: 'warning' as const,
  'warning-outline': 'warning-outline' as const,
  alert: 'alert-circle' as const,
  'alert-outline': 'alert-circle-outline' as const,

  // App sections
  home: 'home' as const,
  'home-outline': 'home-outline' as const,
  search: 'search' as const,
  'search-outline': 'search-outline' as const,
  person: 'person' as const,
  'person-outline': 'person-outline' as const,
  menu: 'menu' as const,
  'menu-outline': 'menu-outline' as const,

  // Learning specific
  book: 'book' as const,
  'book-outline': 'book-outline' as const,
  library: 'library' as const,
  'library-outline': 'library-outline' as const,
  trophy: 'trophy' as const,
  'trophy-outline': 'trophy-outline' as const,
  flame: 'flame' as const,
  'flame-outline': 'flame-outline' as const,

  // Editing
  create: 'create' as const,
  'create-outline': 'create-outline' as const,
  trash: 'trash' as const,
  'trash-outline': 'trash-outline' as const,
  copy: 'copy' as const,
  'copy-outline': 'copy-outline' as const,

  // Other
  eye: 'eye' as const,
  'eye-outline': 'eye-outline' as const,
  'eye-off': 'eye-off' as const,
  'eye-off-outline': 'eye-off-outline' as const,
  time: 'time' as const,
  'time-outline': 'time-outline' as const,
  calendar: 'calendar' as const,
  'calendar-outline': 'calendar-outline' as const,
} as const;

export type CommonIconName = keyof typeof COMMON_ICONS;
export type IoniconsName = keyof typeof Ionicons.glyphMap;

export interface IconProps {
  /** Icon name from Ionicons or common icons map */
  name: CommonIconName | IoniconsName;
  /** Size variant or custom number */
  size?: IconSize | number;
  /** Color variant or custom hex/rgba color */
  color?: IconColor;
  /** Custom style */
  style?: any;
}

/**
 * Icon component with consistent styling
 */
export function Icon({
  name,
  size = 'md',
  color = 'text-primary',
  style,
}: IconProps) {
  // Get icon name (handle both common icons and direct Ionicons names)
  const iconName = (COMMON_ICONS[name as CommonIconName] || name) as IoniconsName;

  // Get size
  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];

  // Get color
  const iconColor = ICON_COLORS[color] || color;

  return (
    <Ionicons
      name={iconName}
      size={iconSize}
      color={iconColor}
      style={style}
    />
  );
}

export default Icon;
