import { config } from '@tamagui/config/v4'
import { createTamagui } from '@tamagui/core'

// Define custom color tokens for Vox Language App
const customColors = {
  // Light mode colors
  primary: '#6366F1', // Indigo - main brand color
  primaryHover: '#4F46E5',
  primaryActive: '#4338CA',

  secondary: '#EC4899', // Pink - accent color
  secondaryHover: '#DB2777',
  secondaryActive: '#BE185D',

  success: '#10B981', // Green - correct answers
  successHover: '#059669',
  successActive: '#047857',

  error: '#EF4444', // Red - incorrect answers
  errorHover: '#DC2626',
  errorActive: '#B91C1C',

  warning: '#F59E0B', // Amber - warnings
  info: '#3B82F6', // Blue - info messages

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',

  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderHover: '#D1D5DB',
  borderFocus: '#6366F1',

  // Dark mode colors
  primaryDark: '#818CF8',
  primaryDarkHover: '#6366F1',
  primaryDarkActive: '#4F46E5',

  secondaryDark: '#F472B6',
  secondaryDarkHover: '#EC4899',
  secondaryDarkActive: '#DB2777',

  successDark: '#34D399',
  errorDark: '#F87171',
  warningDark: '#FBBF24',
  infoDark: '#60A5FA',

  backgroundDark: '#111827',
  backgroundSecondaryDark: '#1F2937',
  backgroundTertiaryDark: '#374151',

  textPrimaryDark: '#F9FAFB',
  textSecondaryDark: '#D1D5DB',
  textTertiaryDark: '#9CA3AF',

  borderDark: '#374151',
  borderDarkHover: '#4B5563',
  borderDarkFocus: '#818CF8',
}

// Custom theme configuration
const customConfig = {
  ...config,

  // Override tokens
  tokens: {
    ...config.tokens,
    color: {
      ...config.tokens.color,
      ...customColors,
    },
    space: {
      ...config.tokens.space,
      // Custom spacing values (in pixels)
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
      12: 48,
      16: 64,
      20: 80,
      24: 96,
    },
    size: {
      ...config.tokens.size,
      // Custom size values for consistent component sizing
      xs: 32,
      sm: 40,
      md: 48,
      lg: 56,
      xl: 64,
      xxl: 72,
    },
    radius: {
      ...config.tokens.radius,
      // Border radius values
      none: 0,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      full: 999,
    },
  },

  // Define themes
  themes: {
    light: {
      background: customColors.background,
      backgroundHover: customColors.backgroundSecondary,
      backgroundPress: customColors.backgroundTertiary,
      backgroundFocus: customColors.backgroundSecondary,

      color: customColors.textPrimary,
      colorHover: customColors.textPrimary,
      colorPress: customColors.textSecondary,
      colorFocus: customColors.textPrimary,

      borderColor: customColors.border,
      borderColorHover: customColors.borderHover,
      borderColorPress: customColors.borderHover,
      borderColorFocus: customColors.borderFocus,

      primary: customColors.primary,
      primaryHover: customColors.primaryHover,
      primaryPress: customColors.primaryActive,

      secondary: customColors.secondary,
      secondaryHover: customColors.secondaryHover,
      secondaryPress: customColors.secondaryActive,

      success: customColors.success,
      successHover: customColors.successHover,
      successPress: customColors.successActive,

      error: customColors.error,
      errorHover: customColors.errorHover,
      errorPress: customColors.errorActive,

      warning: customColors.warning,
      info: customColors.info,

      placeholderColor: customColors.textTertiary,
      shadowColor: '#00000015',
    },

    dark: {
      background: customColors.backgroundDark,
      backgroundHover: customColors.backgroundSecondaryDark,
      backgroundPress: customColors.backgroundTertiaryDark,
      backgroundFocus: customColors.backgroundSecondaryDark,

      color: customColors.textPrimaryDark,
      colorHover: customColors.textPrimaryDark,
      colorPress: customColors.textSecondaryDark,
      colorFocus: customColors.textPrimaryDark,

      borderColor: customColors.borderDark,
      borderColorHover: customColors.borderDarkHover,
      borderColorPress: customColors.borderDarkHover,
      borderColorFocus: customColors.borderDarkFocus,

      primary: customColors.primaryDark,
      primaryHover: customColors.primaryDarkHover,
      primaryPress: customColors.primaryDarkActive,

      secondary: customColors.secondaryDark,
      secondaryHover: customColors.secondaryDarkHover,
      secondaryPress: customColors.secondaryDarkActive,

      success: customColors.successDark,
      error: customColors.errorDark,
      warning: customColors.warningDark,
      info: customColors.infoDark,

      placeholderColor: customColors.textTertiaryDark,
      shadowColor: '#00000040',
    },
  },

  // Media queries for responsive design
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },

  // Animation configurations
  animations: {
    ...config.animations,
    // Quick animations for interactions
    quick: {
      type: 'spring',
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    // Bouncy animations for fun feedback
    bouncy: {
      type: 'spring',
      damping: 9,
      mass: 0.9,
      stiffness: 150,
    },
    // Lazy animations for smooth transitions
    lazy: {
      type: 'spring',
      damping: 18,
      stiffness: 50,
    },
    // Fast for immediate feedback
    fast: {
      type: 'spring',
      damping: 20,
      mass: 1,
      stiffness: 300,
    },
  },
}

// Create and export Tamagui configuration
export const tamaguiConfig = createTamagui(customConfig)

// Make TypeScript aware of the config
export type TamaguiConfig = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}

export default tamaguiConfig
