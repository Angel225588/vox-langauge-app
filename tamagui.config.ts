import { createTamagui, createTokens } from '@tamagui/core'
import { createAnimations } from '@tamagui/animations-react-native'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'

// Define custom color tokens for Vox Language App
const customColors = {
  // Light mode colors
  primary: '#0036FF', // Electric Blue - main brand color
  primaryHover: '#3D6BFF',
  primaryActive: '#0029CC',

  secondary: '#06D6A0', // Teal - accent color
  secondaryHover: '#4ECDC4',
  secondaryActive: '#04B384',

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

  // Glass tokens (Light)
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassShadow: 'rgba(0, 0, 0, 0.05)',

  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderHover: '#D1D5DB',
  borderFocus: '#0036FF',

  // Dark mode colors
  primaryDark: '#3D6BFF',
  primaryDarkHover: '#0036FF',
  primaryDarkActive: '#0029CC',

  secondaryDark: '#4ECDC4',
  secondaryDarkHover: '#06D6A0',
  secondaryDarkActive: '#04B384',

  successDark: '#34D399',
  errorDark: '#F87171',
  warningDark: '#FBBF24',
  infoDark: '#60A5FA',

  backgroundDark: '#111827',
  backgroundSecondaryDark: '#1F2937',
  backgroundTertiaryDark: '#374151',

  // Glass tokens (Dark)
  glassBackgroundDark: 'rgba(31, 41, 55, 0.7)',
  glassBorderDark: 'rgba(255, 255, 255, 0.1)',
  glassShadowDark: 'rgba(0, 0, 0, 0.3)',

  textPrimaryDark: '#F9FAFB',
  textSecondaryDark: '#D1D5DB',
  textTertiaryDark: '#9CA3AF',

  borderDark: '#374151',
  borderDarkHover: '#4B5563',
  borderDarkFocus: '#3D6BFF',
}

// Create custom tokens
const customTokens = createTokens({
  color: {
    ...tokens.color,
    ...customColors,
  },
  space: {
    ...tokens.space,
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
    ...tokens.size,
    // Custom size values for consistent component sizing
    xs: 32,
    sm: 40,
    md: 48,
    lg: 56,
    xl: 64,
    xxl: 72,
  },
  radius: {
    ...tokens.radius,
    // Border radius values
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  zIndex: {
    ...tokens.zIndex,
  },
})

// Create fonts — DM Sans for headings, Source Sans 3 for body
const headingFont = {
  family: 'DMSans_400Regular',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 30,
    10: 42,
    11: 52,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 124,
    // Aliases
    xs: 11,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 30,
    xxl: 42,
    true: 16,
  },
  lineHeight: {
    1: 17,
    2: 22,
    3: 25,
    4: 30,
    5: 31,
    6: 35,
    7: 39,
    8: 43,
    9: 60,
    10: 78,
    11: 82,
    12: 92,
    13: 102,
    14: 127,
    15: 154,
    16: 174,
  },
  weight: {
    1: '400',
    3: '600',
    4: '700',
  },
  letterSpacing: {
    1: 0,
    2: -1,
  },
  face: {
    400: { normal: 'DMSans_400Regular' },
    500: { normal: 'DMSans_500Medium' },
    600: { normal: 'DMSans_600SemiBold' },
    700: { normal: 'DMSans_700Bold' },
    800: { normal: 'DMSans_800ExtraBold' },
  },
}

const bodyFont = {
  family: 'SourceSans3_400Regular',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 30,
    10: 42,
    11: 52,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 124,
    // Aliases
    xs: 11,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 30,
    xxl: 42,
    true: 16,
  },
  lineHeight: {
    1: 17,
    2: 22,
    3: 25,
    4: 30,
    5: 31,
    6: 35,
    7: 39,
    8: 43,
    9: 60,
    10: 78,
    11: 82,
    12: 92,
    13: 102,
    14: 127,
    15: 154,
    16: 174,
  },
  weight: {
    1: '400',
    3: '600',
    4: '700',
  },
  letterSpacing: {
    1: 0,
    2: -1,
  },
  face: {
    400: { normal: 'SourceSans3_400Regular' },
    500: { normal: 'SourceSans3_500Medium' },
    600: { normal: 'SourceSans3_600SemiBold' },
    700: { normal: 'SourceSans3_700Bold' },
  },
}

// Custom theme configuration
const customConfig = {
  tokens: customTokens,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  shorthands,

  themes: {
    ...themes,
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

  animations: createAnimations({
    quick: {
      type: 'spring',
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    bouncy: {
      type: 'spring',
      damping: 9,
      mass: 0.9,
      stiffness: 150,
    },
    lazy: {
      type: 'spring',
      damping: 18,
      stiffness: 50,
    },
    fast: {
      type: 'spring',
      damping: 20,
      mass: 1,
      stiffness: 300,
    },
  }),
}

// Create and export Tamagui configuration
export const tamaguiConfig = createTamagui(customConfig)

// Make TypeScript aware of the config
export type TamaguiConfig = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConfig { }
}

export default tamaguiConfig
