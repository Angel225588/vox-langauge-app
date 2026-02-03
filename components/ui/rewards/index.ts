/**
 * Vox Rewards System Components
 *
 * Currency icons and display components for the gamification system.
 *
 * @example
 * ```tsx
 * import {
 *   VoxIcon,
 *   VoxCounter,
 *   SkillCurrencyIcon,
 *   FluencyFlame,
 *   ComprehensionCrystal,
 *   ExpressionEmber,
 *   RewardEarned,
 * } from '@/components/ui/rewards';
 *
 * // Display main currency
 * <VoxIcon size="lg" animated glowing />
 * <VoxCounter value={1250} variant="large" />
 *
 * // Display skill currencies
 * <FluencyFlame size="md" animated />
 * <ComprehensionCrystal size="md" glowing />
 * <ExpressionEmber size="md" />
 *
 * // Show reward popup
 * <RewardEarned
 *   voxEarned={50}
 *   skillCurrency={{ type: 'fluency', amount: 10 }}
 *   multipliers={['First Try +50%', 'Streak x3']}
 *   visible={showReward}
 *   onDismiss={() => setShowReward(false)}
 * />
 * ```
 */

// Main Vox currency icon
export { VoxIcon } from './VoxIcon';
export type { VoxIconProps, VoxIconSize } from './VoxIcon';

// Skill currency icons
export {
  SkillCurrencyIcon,
  FluencyFlame,
  ComprehensionCrystal,
  ExpressionEmber,
} from './SkillCurrencyIcon';
export type { SkillCurrencyIconProps, SkillIconSize, SkillType } from './SkillCurrencyIcon';

// Counter and display components
export { VoxCounter, RewardEarned } from './VoxCounter';
export type { VoxCounterProps, VoxCounterVariant, RewardEarnedProps } from './VoxCounter';
