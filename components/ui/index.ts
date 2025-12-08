/**
 * Vox Language App - UI Components
 *
 * Reusable UI components for consistent design across the app.
 *
 * Usage:
 * import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay, ResultAnimation } from '@/components/ui';
 *
 * Components:
 * - DarkOverlay: Semi-transparent background overlay
 * - AnswerOption: Quiz answer button with correct/wrong states
 * - AnswerFeedbackOverlay: Bottom sheet with explanation and continue button
 * - ResultAnimation: Fullscreen success/error Lottie animation
 * - GlassCard: Frosted glass effect card
 * - PremiumButton: Gradient button with glow effect
 * - ThemedText: Consistent text styling
 * - ProgressCard: Progress indicator card
 * - StatsCard: Statistics display card
 */

// New reusable components (Phase 1)
export { DarkOverlay } from './DarkOverlay';
export type { DarkOverlayProps } from './DarkOverlay';

export { AnswerOption } from './AnswerOption';
export type { AnswerOptionProps, AnswerOptionState } from './AnswerOption';

export { AnswerFeedbackOverlay } from './AnswerFeedbackOverlay';
export type { AnswerFeedbackOverlayProps } from './AnswerFeedbackOverlay';

export { ResultAnimation } from './ResultAnimation';
export type { ResultAnimationProps } from './ResultAnimation';

// Existing components
export { GlassCard } from './GlassCard';
export { PremiumButton } from './PremiumButton';
export { ThemedText } from './ThemedText';
export { ProgressCard } from './ProgressCard';
export { StatsCard } from './StatsCard';

// Depth/Neomorphic components
export { DepthBackButton } from './DepthBackButton';
export type { DepthBackButtonProps, DepthBackButtonSize } from './DepthBackButton';

// Teleprompter components
export { WordPopover } from './WordPopover';
export { TeleprompterControls } from './TeleprompterControls';
export { TeleprompterSettings } from './TeleprompterSettings';

// Re-export Tamagui components for convenience
export * from './tamagui';
