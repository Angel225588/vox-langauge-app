/**
 * Vox Brand Assets
 *
 * Central configuration for all brand assets including logos, colors, and typography.
 * These assets are used throughout the app for consistent branding.
 */

// ============================================================================
// LOGO ASSETS
// ============================================================================

/**
 * Logo file paths reference.
 *
 * NOTE: The actual images need to be added to assets/branding/ folder.
 * Once added, you can use require() to load them:
 *
 * @example
 *   // After adding images to assets/branding/
 *   const crystalLogo = require('@/assets/branding/vox-logo-crystal-dark.png');
 *
 * Expected files:
 *   - vox-logo-crystal-dark.png
 *   - vox-logo-crystal-transparent.png
 *   - vox-wordmark-dark.png
 */
export const logoFiles = {
  crystal: {
    dark: 'vox-logo-crystal-dark.png',
    transparent: 'vox-logo-crystal-transparent.png',
  },
  wordmark: {
    dark: 'vox-wordmark-dark.png',
  },
} as const;

// ============================================================================
// BRAND COLORS
// ============================================================================

/**
 * Official Vox brand colors.
 * These extend the design system colors with brand-specific naming.
 */
export const brandColors = {
  // Primary brand colors
  primary: {
    blue: '#0036FF',
    lightBlue: '#00A3FF',
    gradient: ['#0036FF', '#00A3FF'] as const,
  },

  // Background colors
  background: {
    space: '#0A0E1A',      // Deep space - main background
    navy: '#0F1729',       // Dark navy - secondary
    card: '#1A1F3A',       // Card backgrounds
    elevated: '#222845',   // Elevated elements
  },

  // Accent colors for skills
  skills: {
    fluency: {
      primary: '#FF6B6B',   // Coral
      secondary: '#FFA07A', // Salmon
    },
    comprehension: {
      primary: '#06D6A0',   // Teal
      secondary: '#4ECDC4', // Turquoise
    },
    expression: {
      primary: '#8B5CF6',   // Violet
      secondary: '#A78BFA', // Light violet
    },
  },

  // Text colors
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
    disabled: '#6B7280',
  },

  // Glow effects (for shadows and highlights)
  glow: {
    primary: 'rgba(0, 54, 255, 0.5)',
    purple: 'rgba(139, 92, 246, 0.5)',
    teal: 'rgba(6, 214, 160, 0.5)',
    coral: 'rgba(255, 107, 107, 0.5)',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Brand typography configuration.
 *
 * Primary: Inter - for body text and UI
 * Display: Poppins - for headlines and brand name
 */
export const brandTypography = {
  // Font families
  fonts: {
    display: 'Poppins',      // Headlines, brand name
    body: 'Inter',           // Body text, UI elements
    mono: 'JetBrains Mono',  // Code, technical content
  },

  // Logo-specific typography
  logo: {
    fontFamily: 'Poppins',
    fontWeight: '700' as const, // Bold
    letterSpacing: 2,           // Slightly expanded
  },

  // Headline styles
  headlines: {
    h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.3 },
    h3: { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0 },
    h4: { fontSize: 18, fontWeight: '500' as const, letterSpacing: 0 },
  },
} as const;

// ============================================================================
// BRAND GRADIENTS
// ============================================================================

/**
 * Gradient configurations for LinearGradient components.
 *
 * Usage:
 *   import { brandGradients } from '@/constants/branding';
 *   <LinearGradient colors={brandGradients.primary.colors} />
 */
export const brandGradients = {
  // Main brand gradient (indigo to purple)
  primary: {
    colors: ['#0036FF', '#00A3FF'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Horizontal gradient (for text, wordmarks)
  horizontal: {
    colors: ['#0036FF', '#00A3FF'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },

  // Dark card gradient
  card: {
    colors: ['#1A1F3A', '#0F1729'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  // Skill-specific gradients
  fluency: {
    colors: ['#FF6B6B', '#FFA07A'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  comprehension: {
    colors: ['#06D6A0', '#4ECDC4'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  expression: {
    colors: ['#8B5CF6', '#A78BFA'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

// ============================================================================
// LOGO DIMENSIONS
// ============================================================================

/**
 * Standard logo sizes for different contexts.
 */
export const logoDimensions = {
  // App icon sizes
  appIcon: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },

  // Logo in headers/nav
  header: {
    icon: 32,
    wordmark: { width: 80, height: 24 },
  },

  // Splash/welcome screens
  splash: {
    icon: 120,
    wordmark: { width: 160, height: 48 },
  },

  // Login/auth screens
  auth: {
    icon: 80,
    wordmark: { width: 120, height: 36 },
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  logoFiles,
  brandColors,
  brandTypography,
  brandGradients,
  logoDimensions,
};
