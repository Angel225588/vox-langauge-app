/**
 * Vox Language App - Design System
 * Immersive, depth-focused color palette with gradients and glow effects
 */

export const colors = {
  // Dark backgrounds with depth
  background: {
    primary: '#0A0E1A',      // Deep space blue-black
    secondary: '#0F1729',    // Dark navy
    card: '#1A1F3A',         // Card background
    elevated: '#222845',     // Elevated elements
  },

  // Gradient definitions (as const for LinearGradient compatibility)
  gradients: {
    primary: ['#0036FF', '#00A3FF'] as const,      // Deep blue to bright blue
    secondary: ['#06D6A0', '#4ECDC4'] as const,    // Teal to turquoise
    success: ['#10B981', '#34D399'] as const,      // Green
    warning: ['#F59E0B', '#FBBF24'] as const,      // Amber
    error: ['#EF4444', '#F87171'] as const,        // Red
    accent: ['#EC4899', '#F472B6'] as const,       // Pink
    dark: ['#1A1F3A', '#0F1729'] as const,         // Dark card gradient
  },

  // Solid colors - Primary: Electric Blue (voice/communication focused)
  primary: {
    DEFAULT: '#0036FF',      // Deep electric blue
    light: '#3D6BFF',        // Hover/active states
    dark: '#0029CC',         // Pressed states
  },

  secondary: {
    DEFAULT: '#06D6A0',      // Teal
    light: '#4ECDC4',
    dark: '#04B384',
  },

  success: {
    DEFAULT: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },

  error: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },

  warning: {
    DEFAULT: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },

  accent: {
    primary: '#0036FF',      // Match primary blue
    blue: '#00A3FF',         // Bright blue accent
    purple: '#8B5CF6',       // Keep purple as accent option
    pink: '#EC4899',
    orange: '#F97316',
    cyan: '#06B6D4',
  },

  // Text colors
  text: {
    primary: '#F9FAFB',      // Almost white
    secondary: '#D1D5DB',    // Light gray
    tertiary: '#9CA3AF',     // Medium gray
    disabled: '#6B7280',     // Dark gray
  },

  // UI elements
  border: {
    light: '#374151',
    medium: '#4B5563',
    dark: '#1F2937',
  },

  // Glow effects (for box shadows)
  glow: {
    primary: 'rgba(0, 54, 255, 0.5)',       // Blue glow
    secondary: 'rgba(6, 214, 160, 0.5)',    // Teal glow
    success: 'rgba(16, 185, 129, 0.5)',     // Green glow
    error: 'rgba(239, 68, 68, 0.5)',        // Red glow
    blue: 'rgba(0, 163, 255, 0.5)',         // Bright blue glow
    purple: 'rgba(139, 92, 246, 0.5)',      // Purple glow (accent)
  },
};

/**
 * Reward Currency Colors
 * Colors for the Vox gamification system
 * "The only failure is not trying" - Every attempt earns Vox
 */
export const rewardCurrencies = {
  // Main Vox currency (hexagonal crystal with sound waves)
  vox: {
    primary: '#0036FF',        // Blue - matches brand
    secondary: '#00A3FF',      // Bright blue accent
    glow: 'rgba(0, 54, 255, 0.4)',
    gradient: ['#0036FF', '#00A3FF'] as const,
    // Tier colors for achievement levels
    tiers: {
      bronze: {
        primary: '#D97706',
        secondary: '#F59E0B',
        glow: 'rgba(217, 119, 6, 0.4)',
      },
      silver: {
        primary: '#9CA3AF',
        secondary: '#D1D5DB',
        glow: 'rgba(156, 163, 175, 0.4)',
      },
      gold: {
        primary: '#F59E0B',
        secondary: '#FBBF24',
        glow: 'rgba(245, 158, 11, 0.4)',
      },
    },
  },
  // Fluency Flames - Speaking & Pronunciation (coral/orange)
  fluency: {
    primary: '#FF6B6B',        // Coral red
    secondary: '#FFA07A',      // Light salmon
    glow: 'rgba(255, 107, 107, 0.4)',
    gradient: ['#FF6B6B', '#FFA07A'] as const,
    accent: '#FFE4E1',         // Misty rose (inner glow)
  },
  // Comprehension Crystals - Listening & Reading (teal/cyan)
  comprehension: {
    primary: '#06D6A0',        // Teal
    secondary: '#4ECDC4',      // Turquoise
    glow: 'rgba(6, 214, 160, 0.4)',
    gradient: ['#06D6A0', '#4ECDC4'] as const,
    accent: '#E0FFF4',         // Mint cream (inner glow)
  },
  // Expression Embers - Writing & Production (violet/purple)
  expression: {
    primary: '#8B5CF6',        // Violet
    secondary: '#A78BFA',      // Light violet
    glow: 'rgba(139, 92, 246, 0.4)',
    gradient: ['#8B5CF6', '#A78BFA'] as const,
    accent: '#EDE9FE',         // Lavender (inner glow)
  },
  // Glow effect sizing
  glowSize: {
    multiplier: 1.5,           // Icon glow is 1.5x icon size
    blurMultiplier: 1.2,       // Blur radius multiplier
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  full: 9999,
};

export const shadows = {
  // Subtle depth
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Medium depth with glow
  md: {
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Strong depth with glow
  lg: {
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  // Glow effects for different states
  glow: {
    primary: {
      shadowColor: colors.glow.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 6,
    },
    success: {
      shadowColor: colors.glow.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 6,
    },
    error: {
      shadowColor: colors.glow.error,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const animation = {
  // Durations in ms
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    // Icon-specific durations
    icon: 600,              // Icon scale/pulse animations
    iconFlicker: 250,       // Flame flicker step duration
    iconShimmer: 800,       // Crystal shimmer cycle
    rewardPopup: 2500,      // Auto-dismiss duration for reward popups
    counterStep: 30,        // Counter animation step interval
  },

  // Spring configs for reanimated
  spring: {
    default: {
      damping: 15,
      stiffness: 150,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
    },
    stiff: {
      damping: 20,
      stiffness: 200,
    },
    // Reward-specific springs
    reward: {
      damping: 12,
      stiffness: 150,
    },
    iconPulse: {
      damping: 8,
      stiffness: 100,
    },
  },
};

export const haptics = {
  // Light tap for selections
  light: 'light',
  // Medium for actions
  medium: 'medium',
  // Heavy for important actions
  heavy: 'heavy',
  // Success vibration
  success: 'success',
  // Warning vibration
  warning: 'warning',
  // Error vibration
  error: 'error',
} as const;

/**
 * Neomorphism Design System
 * Electric Blue accent to match the app's primary color scheme (voice/communication focused)
 */
export const neomorphism = {
  // Base background - matches app's deep space blue-black
  background: '#0A0E1A',

  // Accent color - Electric Blue (matching primary)
  accent: '#0036FF',
  accentLight: '#3D6BFF',
  accentGlow: 'rgba(0, 54, 255, 0.5)',

  // Text colors for neomorphic context
  text: {
    primary: '#F9FAFB',      // Almost white for primary text
    secondary: '#9CA3AF',    // Medium gray for secondary text
    inactive: '#6B7280',     // Darker for disabled/inactive states
    accent: '#3D6BFF',       // Light blue for accent text
  },

  // Shadow configurations for raised (convex) elements
  raised: {
    light: {
      shadowColor: '#1A1F3A',
      shadowOffset: { width: -4, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    dark: {
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
  },

  // Shadow configurations for pressed (concave/inset) elements
  pressed: {
    backgroundColor: '#0F1729',
    borderColor: '#1A1F3A',
    innerGlow: 'rgba(0, 54, 255, 0.1)',
  },

  // Button variants
  button: {
    // Primary raised button (electric blue)
    primary: {
      backgroundColor: '#0036FF',
      textColor: '#FFFFFF',
      shadowLight: '#3D6BFF',
      shadowDark: '#0029CC',
    },
    // Secondary raised button (dark card)
    secondary: {
      backgroundColor: '#1A1F3A',
      textColor: '#3D6BFF',
      shadowLight: '#222845',
      shadowDark: '#0A0E1A',
    },
    // Pressed/inset button
    pressed: {
      backgroundColor: '#0F1729',
      textColor: '#6B7280',
      borderColor: '#1A1F3A',
    },
  },

  // Toggle/Switch
  toggle: {
    track: {
      off: '#1A1F3A',
      on: '#0036FF',
    },
    thumb: '#F9FAFB',
  },

  // Slider
  slider: {
    track: '#1A1F3A',
    fill: '#0036FF',
    thumb: '#F9FAFB',
    thumbBorder: '#0036FF',
  },

  // Input fields
  input: {
    background: '#0F1729',
    border: '#1A1F3A',
    placeholder: '#6B7280',
    text: '#F9FAFB',
  },

  // Icon buttons (circular)
  iconButton: {
    background: '#1A1F3A',
    iconColor: '#3D6BFF',
    iconColorInactive: '#6B7280',
    size: {
      sm: 40,
      md: 48,
      lg: 56,
    },
  },

  // Radio/Checkbox
  radio: {
    background: '#1A1F3A',
    border: '#222845',
    active: '#0036FF',
    inactive: '#6B7280',
  },

  // Card
  card: {
    background: '#1A1F3A',
    border: 'rgba(0, 54, 255, 0.15)',
  },

  // Gradients
  gradients: {
    primary: ['#0036FF', '#00A3FF'] as const,
    card: ['#1A1F3A', '#0F1729'] as const,
    fadeBottom: ['transparent', '#0A0E1A'] as const,
  },
};
