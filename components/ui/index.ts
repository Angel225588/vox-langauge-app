/**
 * Vox Language App - UI Components
 *
 * Reusable UI components for consistent design across the app.
 *
 * Usage:
 * import { DarkOverlay, AnswerOption, Icon, VoxIcon, VoxCounter } from '@/components/ui';
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
 * - Icon: Centralized icon component with design system integration
 * - IconButton: Touchable icon with haptic feedback and animations
 * - AudioPlayer: Reusable audio player with fast/slow speed controls
 * - Toast: Animated toast notification component
 * - ToastProvider: Context provider for toast notifications
 * - useToast: Hook for showing toast notifications
 * - Modal: Base modal component with animations
 * - AlertDialog: Simple alert dialog
 * - ConfirmDialog: Confirmation dialog with two actions
 * - InputDialog: Dialog with text input field
 * - ActionSheet: Bottom sheet with action options
 *
 * Rewards System:
 * - VoxIcon: Main currency icon (hexagonal crystal with sound waves)
 * - VoxCounter: Animated point counter display
 * - RewardEarned: Popup for showing earned rewards
 * - SkillCurrencyIcon: Generic skill currency icon
 * - FluencyFlame: Speaking/pronunciation currency (coral)
 * - ComprehensionCrystal: Listening/reading currency (teal)
 * - ExpressionEmber: Writing/production currency (violet)
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

// Navigation components
export { BackButton } from './BackButton';
export type { BackButtonProps, BackButtonVariant } from './BackButton';

// Teleprompter components
export { WordPopover } from './WordPopover';
export { TeleprompterControls } from './TeleprompterControls';
export { TeleprompterSettings } from './TeleprompterSettings';

// Icon system
export { Icon } from './Icon';
export type { IconProps, IconSize, IconColor, CommonIconName } from './Icon';
export { ICON_SIZES, ICON_COLORS, COMMON_ICONS } from './Icon';

export { IconButton } from './IconButton';
export type { IconButtonProps, IconButtonVariant, IconButtonShape } from './IconButton';

// Audio controls
export { AudioButton } from './AudioButton';
export type { AudioButtonProps } from './AudioButton';

export { AudioButtonGroup } from './AudioButtonGroup';
export type { AudioButtonGroupProps } from './AudioButtonGroup';

export { AudioPlayer } from './AudioPlayer';
export type { AudioPlayerProps } from './AudioPlayer';

// Speaking controls
export { SpeakButton } from './SpeakButton';
export type { SpeakButtonProps } from './SpeakButton';

export { CantSpeakButton } from './CantSpeakButton';
export type { CantSpeakButtonProps } from './CantSpeakButton';

// Toast notification system
export { Toast } from './Toast';
export type { ToastProps, ToastVariant } from './Toast';

export { ToastProvider, useToast } from './ToastProvider';

// Modal & Dialog Components
export { Modal } from './Modal';
export type { ModalProps, ModalPlacement } from './Modal';

export {
  AlertDialog,
  ConfirmDialog,
  InputDialog,
  ActionSheet,
} from './Dialog';

export type {
  AlertDialogProps,
  ConfirmDialogProps,
  InputDialogProps,
  ActionSheetProps,
  ActionSheetOption,
} from './Dialog';

// Examples (for development/testing)
export { DialogExamples } from './DialogExamples';

// Form Components & Validation
export {
  // Components
  Form,
  FormGroup,
  FormField,
  FormRow,
  FormDivider,
  FormActions,
  EmailField,
  PasswordField,
  PhoneField,
  SearchField,
  // Validation hook
  useFormValidation,
  validators,
  // Individual validators
  required,
  email,
  minLength,
  maxLength,
  pattern,
  numeric,
  alphabetic,
  alphanumeric,
  matches,
  phone,
  url,
  strongPassword,
  custom,
} from './form';

export type {
  FormFieldProps,
  FormGroupProps,
  FormRowProps,
  FormDividerProps,
  FormActionsProps,
  FormProps,
  ValidationRule,
  FieldConfig,
  FieldState,
  FormFields,
  FormValidationResult,
} from './form';

// Rewards System Components
export {
  VoxIcon,
  VoxCounter,
  RewardEarned,
  SkillCurrencyIcon,
  FluencyFlame,
  ComprehensionCrystal,
  ExpressionEmber,
} from './rewards';

export type {
  VoxIconProps,
  VoxIconSize,
  VoxCounterProps,
  VoxCounterVariant,
  RewardEarnedProps,
  SkillCurrencyIconProps,
  SkillIconSize,
  SkillType,
} from './rewards';

// Brand Logo Components
export { VoxLogo, VoxSplashLogo, VoxAuthLogo, VoxHeaderLogo } from './VoxLogo';
export type { LogoVariant, LogoSize, LogoBackground } from './VoxLogo';

// Re-export Tamagui components for convenience
export * from './tamagui';
