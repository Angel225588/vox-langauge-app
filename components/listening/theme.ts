/**
 * Listening Feature Theme Constants
 *
 * Shared color tokens for all listening components.
 * Teal is the listening color throughout the app.
 */

export const LISTENING = {
  // Teal — listening theme accent
  teal: '#06D6A0',
  tealLight: '#4ECDC4',
  tealGradient: ['#06D6A0', '#4ECDC4'] as const,
  tealGlow: 'rgba(6, 214, 160, 0.5)',
  tealSubtle: 'rgba(6, 214, 160, 0.10)',
  tealBorder: 'rgba(6, 214, 160, 0.18)',

  // Glass surfaces
  glassBg: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassElevated: 'rgba(255, 255, 255, 0.10)',
  glassBorderBright: 'rgba(255, 255, 255, 0.16)',

  // Backgrounds
  bg: '#0A0E1A',
  bgSecondary: '#0F1729',
  card: '#1A1F3A',

  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textDisabled: '#6B7280',

  // Feedback
  green: '#10B981',
  greenLight: '#34D399',
  greenSubtle: 'rgba(16, 185, 129, 0.15)',
  greenBorder: 'rgba(16, 185, 129, 0.30)',

  red: '#EF4444',
  redLight: '#F87171',
  redSubtle: 'rgba(239, 68, 68, 0.15)',
  redBorder: 'rgba(239, 68, 68, 0.30)',

  // Muted (for "before" score)
  gray: 'rgba(255, 255, 255, 0.10)',
  grayBorder: 'rgba(255, 255, 255, 0.20)',
} as const;

/** Stage labels for the 3 listening stages */
export const STAGE_LABELS = ['Listen', 'Read Along', 'Prove It'] as const;

/** Hidden-mode prompts for subtitle display */
export const HIDDEN_PROMPTS = [
  'Focus on the sounds...',
  'What can you understand?',
  'Listen for familiar words...',
  'Let the rhythm guide you...',
] as const;
