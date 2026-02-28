/**
 * Vox Language App - Design System
 * Glassmorphic dark theme — frosted glass surfaces over deep space backgrounds
 * Colors: Electric Blue (#0036FF) primary, warm accents, depth-focused palette
 * Visual style: Semi-transparent layered glass with blur, luminous edges, soft depth
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

  // Overlay/opacity tokens (replaces scattered inline rgba values)
  overlay: {
    light5: 'rgba(255, 255, 255, 0.05)',   // Subtle surface highlight
    light8: 'rgba(255, 255, 255, 0.08)',   // Card hover, subtle borders
    light10: 'rgba(255, 255, 255, 0.1)',   // Visible borders
    light12: 'rgba(255, 255, 255, 0.12)',  // Prominent borders
    light20: 'rgba(255, 255, 255, 0.2)',   // Semi-visible
    dark30: 'rgba(0, 0, 0, 0.3)',          // Light overlay
    dark50: 'rgba(0, 0, 0, 0.5)',          // Medium overlay
    dark70: 'rgba(0, 0, 0, 0.7)',          // Dark overlay
    primary10: 'rgba(0, 54, 255, 0.1)',    // Primary subtle bg
    primary15: 'rgba(0, 54, 255, 0.15)',   // Primary border
    primary20: 'rgba(0, 54, 255, 0.2)',    // Primary highlight
    success10: 'rgba(16, 185, 129, 0.1)',  // Success subtle bg
    warning10: 'rgba(245, 158, 11, 0.1)',  // Warning subtle bg
    error10: 'rgba(239, 68, 68, 0.1)',     // Error subtle bg
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

  // Font weights (kept for backward compat — prefer fontFamily from fonts.ts)
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Font families — semantic roles mapped to loaded font names
  // Import { fonts } from '@/constants/fonts' for direct use in styles
  fontFamily: {
    // Display — DM Sans (headlines, brand, large text)
    display: {
      regular:   'DMSans_400Regular',
      medium:    'DMSans_500Medium',
      semibold:  'DMSans_600SemiBold',
      bold:      'DMSans_700Bold',
      extrabold: 'DMSans_800ExtraBold',
    },
    // Body — Source Sans 3 (UI text, descriptions, paragraphs)
    body: {
      regular:  'SourceSans3_400Regular',
      medium:   'SourceSans3_500Medium',
      semibold: 'SourceSans3_600SemiBold',
      bold:     'SourceSans3_700Bold',
    },
    // Mono — DM Mono (phonetics, code, technical)
    mono: {
      regular: 'DMMono_400Regular',
      medium:  'DMMono_500Medium',
    },
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

/**
 * Glassmorphism Design System
 * Frosted glass surfaces with blur, semi-transparent tints, and luminous borders.
 * Built for dark backgrounds — glass panels float over the deep space palette.
 *
 * Implementation notes:
 * - Use expo-blur (BlurView) with `intensity` for the frosted backdrop
 * - Layer a semi-transparent View on top for the tinted surface
 * - Add a 1px luminous border for the glass edge
 * - Apply soft shadows behind (never on top of) the glass
 *
 * Usage pattern:
 *   <BlurView intensity={glass.blur.medium} tint="dark">
 *     <View style={{
 *       backgroundColor: glass.surface.medium,
 *       borderColor: glass.border.light,
 *       borderWidth: glass.border.width.default,
 *       borderRadius: borderRadius.xl,
 *       ...glass.shadow.md,
 *     }}>
 *       {children}
 *     </View>
 *   </BlurView>
 */
export const glass = {
  // ─── Surface tints ───────────────────────────────────────────────
  // Semi-transparent fills layered over BlurView backdrops.
  // Lighter values = more "see-through glass"; heavier = more frosted.
  surface: {
    thin: 'rgba(255, 255, 255, 0.03)',       // Background panels, full-screen overlays
    light: 'rgba(255, 255, 255, 0.06)',       // Secondary cards, list items
    medium: 'rgba(255, 255, 255, 0.10)',      // Primary cards, modals, sheets
    heavy: 'rgba(255, 255, 255, 0.15)',       // Floating elements, popovers, tooltips
    accent: 'rgba(0, 54, 255, 0.08)',         // Primary-tinted glass (feature cards)
    accentMedium: 'rgba(0, 54, 255, 0.14)',   // Stronger primary tint (active states)
    success: 'rgba(16, 185, 129, 0.08)',      // Success-tinted glass
    error: 'rgba(239, 68, 68, 0.08)',         // Error-tinted glass
    warning: 'rgba(245, 158, 11, 0.08)',      // Warning-tinted glass
  },

  // ─── Borders ─────────────────────────────────────────────────────
  // Luminous edges that simulate light catching the glass rim.
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',      // Barely visible — nested glass
    light: 'rgba(255, 255, 255, 0.10)',       // Default glass edge
    medium: 'rgba(255, 255, 255, 0.16)',      // Prominent — elevated glass
    bright: 'rgba(255, 255, 255, 0.22)',      // Strong — focus states, active panels
    accent: 'rgba(0, 54, 255, 0.30)',         // Primary-colored edge
    accentSubtle: 'rgba(0, 54, 255, 0.15)',   // Soft primary edge
    width: {
      thin: 0.5,
      default: 1,
      thick: 1.5,
    },
  },

  // ─── Blur intensities ────────────────────────────────────────────
  // Values for expo-blur BlurView `intensity` prop (0-100).
  blur: {
    subtle: 15,    // Hint of frost — background panels
    light: 25,     // Light frosting — secondary elements
    medium: 40,    // Standard glass — cards, sheets
    heavy: 60,     // Dense frost — modals, overlays
    extreme: 80,   // Maximum frost — full-screen overlays, onboarding
  },

  // ─── Preset card compositions ────────────────────────────────────
  // Ready-to-spread style objects for common glass surfaces.
  card: {
    // Standard glass card — most common usage
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.10)',
      borderWidth: 1,
      blur: 40,
    },
    // Elevated glass — modals, bottom sheets, popovers
    elevated: {
      backgroundColor: 'rgba(255, 255, 255, 0.10)',
      borderColor: 'rgba(255, 255, 255, 0.16)',
      borderWidth: 1,
      blur: 60,
    },
    // Subtle glass — background panels, grouped sections
    subtle: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 255, 255, 0.06)',
      borderWidth: 0.5,
      blur: 25,
    },
    // Primary-tinted glass — feature cards, active selections
    accent: {
      backgroundColor: 'rgba(0, 54, 255, 0.08)',
      borderColor: 'rgba(0, 54, 255, 0.30)',
      borderWidth: 1,
      blur: 40,
    },
    // Onboarding — extra prominent glass for first-time UX
    onboarding: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.14)',
      borderWidth: 1,
      blur: 50,
    },
  },

  // ─── Shadows ─────────────────────────────────────────────────────
  // Softer than solid neomorphic shadows — glass floats, doesn't stamp.
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 8,
    },
    // Primary glow behind glass — for accent/feature elements
    glow: {
      shadowColor: 'rgba(0, 54, 255, 0.35)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 6,
    },
    // Success glow variant
    glowSuccess: {
      shadowColor: 'rgba(16, 185, 129, 0.35)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 6,
    },
  },

  // ─── Inner highlight ─────────────────────────────────────────────
  // Simulates light refraction on the top edge of a glass panel.
  innerHighlight: {
    top: {
      borderTopColor: 'rgba(255, 255, 255, 0.12)',
      borderTopWidth: 1,
    },
    left: {
      borderLeftColor: 'rgba(255, 255, 255, 0.08)',
      borderLeftWidth: 1,
    },
  },

  // ─── Navigation glass ────────────────────────────────────────────
  // Tab bars, headers, and nav surfaces.
  navigation: {
    backgroundColor: 'rgba(10, 14, 26, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    blur: 60,
  },

  // ─── Input glass ─────────────────────────────────────────────────
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    focusBorderColor: 'rgba(0, 54, 255, 0.35)',
    placeholderColor: 'rgba(255, 255, 255, 0.35)',
    blur: 20,
  },

  // ─── Button glass variants ───────────────────────────────────────
  button: {
    // Primary action — blue-tinted glass
    primary: {
      backgroundColor: 'rgba(0, 54, 255, 0.20)',
      borderColor: 'rgba(0, 54, 255, 0.40)',
      pressedBackground: 'rgba(0, 54, 255, 0.30)',
      blur: 30,
    },
    // Secondary action — neutral glass
    secondary: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      pressedBackground: 'rgba(255, 255, 255, 0.14)',
      blur: 30,
    },
    // Ghost — minimal glass, for tertiary actions
    ghost: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      pressedBackground: 'rgba(255, 255, 255, 0.10)',
      blur: 20,
    },
    // Danger action — red-tinted glass
    danger: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.30)',
      pressedBackground: 'rgba(239, 68, 68, 0.25)',
      blur: 30,
    },
    // Success action — green-tinted glass
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.30)',
      pressedBackground: 'rgba(16, 185, 129, 0.25)',
      blur: 30,
    },
  },

  // ─── Badge / chip glass ──────────────────────────────────────────
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    accentBackground: 'rgba(0, 54, 255, 0.12)',
    accentBorder: 'rgba(0, 54, 255, 0.25)',
  },

  // ─── Overlay / scrim ─────────────────────────────────────────────
  // Full-screen backdrops behind modals and sheets.
  overlay: {
    light: 'rgba(10, 14, 26, 0.50)',
    medium: 'rgba(10, 14, 26, 0.70)',
    heavy: 'rgba(10, 14, 26, 0.85)',
  },

  // ─── Colored Glass Containers ──────────────────────────────────
  // Frosted glass parent cards with color-coded gradients.
  // Each "world" has a container (big box) and chip (inner items).
  // Solves the Revolut problem: dark-on-dark cards that blend into bg.
  //
  // Usage with LinearGradient:
  //   <LinearGradient
  //     colors={glass.container.green.gradient}
  //     start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
  //     style={{ borderRadius: 20, borderWidth: 1,
  //              borderColor: glass.container.green.border, padding: 16 }}
  //   >
  //     <View style={{ backgroundColor: glass.container.green.chipBg,
  //                     borderColor: glass.container.green.chipBorder,
  //                     borderWidth: 1, borderRadius: 12, padding: 10 }}>
  //       {/* chip content */}
  //     </View>
  //   </LinearGradient>
  container: {
    // Green world — positive feedback, strengths, success states
    green: {
      gradient: ['rgba(16, 185, 129, 0.10)', 'rgba(16, 185, 129, 0.03)'] as const,
      border: 'rgba(16, 185, 129, 0.18)',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      chipBg: 'rgba(16, 185, 129, 0.06)',
      chipBorder: 'rgba(16, 185, 129, 0.10)',
      accent: '#10B981',
      accentLight: '#34D399',
      countBg: 'rgba(16, 185, 129, 0.18)',
      countColor: '#34D399',
      glow: 'rgba(16, 185, 129, 0.06)',
    },
    // Amber world — attention needed, improvements, warnings
    amber: {
      gradient: ['rgba(245, 158, 11, 0.10)', 'rgba(245, 158, 11, 0.03)'] as const,
      border: 'rgba(245, 158, 11, 0.18)',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      chipBg: 'rgba(245, 158, 11, 0.05)',
      chipBorder: 'rgba(245, 158, 11, 0.10)',
      accent: '#F59E0B',
      accentLight: '#FBBF24',
      countBg: 'rgba(245, 158, 11, 0.18)',
      countColor: '#FBBF24',
      glow: 'rgba(245, 158, 11, 0.06)',
    },
    // Purple world — data, progress, metrics, analytics
    purple: {
      gradient: ['rgba(139, 92, 246, 0.10)', 'rgba(139, 92, 246, 0.03)'] as const,
      border: 'rgba(139, 92, 246, 0.18)',
      iconBg: 'rgba(139, 92, 246, 0.15)',
      chipBg: 'rgba(139, 92, 246, 0.05)',
      chipBorder: 'rgba(139, 92, 246, 0.10)',
      accent: '#8B5CF6',
      accentLight: '#A78BFA',
      countBg: 'rgba(139, 92, 246, 0.18)',
      countColor: '#A78BFA',
      glow: 'rgba(139, 92, 246, 0.06)',
    },
    // Blue world — primary brand, features, navigation, info
    blue: {
      gradient: ['rgba(0, 54, 255, 0.10)', 'rgba(0, 54, 255, 0.03)'] as const,
      border: 'rgba(0, 54, 255, 0.18)',
      iconBg: 'rgba(0, 54, 255, 0.15)',
      chipBg: 'rgba(0, 54, 255, 0.05)',
      chipBorder: 'rgba(0, 54, 255, 0.10)',
      accent: '#0036FF',
      accentLight: '#3D6BFF',
      countBg: 'rgba(0, 54, 255, 0.18)',
      countColor: '#3D6BFF',
      glow: 'rgba(0, 54, 255, 0.06)',
    },
    // Cyan world — voice, communication, speaking features
    cyan: {
      gradient: ['rgba(0, 210, 255, 0.10)', 'rgba(0, 210, 255, 0.03)'] as const,
      border: 'rgba(0, 210, 255, 0.18)',
      iconBg: 'rgba(0, 210, 255, 0.15)',
      chipBg: 'rgba(0, 210, 255, 0.05)',
      chipBorder: 'rgba(0, 210, 255, 0.10)',
      accent: '#00D2FF',
      accentLight: '#4DE1FF',
      countBg: 'rgba(0, 210, 255, 0.18)',
      countColor: '#4DE1FF',
      glow: 'rgba(0, 210, 255, 0.06)',
    },
    // Rose world — weak areas, challenges, intensity
    rose: {
      gradient: ['rgba(244, 114, 182, 0.10)', 'rgba(244, 114, 182, 0.03)'] as const,
      border: 'rgba(244, 114, 182, 0.18)',
      iconBg: 'rgba(244, 114, 182, 0.15)',
      chipBg: 'rgba(244, 114, 182, 0.05)',
      chipBorder: 'rgba(244, 114, 182, 0.10)',
      accent: '#F472B6',
      accentLight: '#F9A8D4',
      countBg: 'rgba(244, 114, 182, 0.18)',
      countColor: '#F9A8D4',
      glow: 'rgba(244, 114, 182, 0.06)',
    },
  },
};
