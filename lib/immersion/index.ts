/**
 * Progressive Immersion System
 *
 * A system that gradually transitions the app's UI from the user's native
 * language to their target language as they advance through CEFR levels.
 *
 * @see docs/features/PROGRESSIVE_IMMERSION_SYSTEM.md for full documentation
 *
 * @example
 * import { useImmersion, ImmersiveText } from '@/lib/immersion';
 *
 * function MyComponent() {
 *   const { immersionPercentage, currentLevel } = useImmersion();
 *
 *   return (
 *     <View>
 *       <Text>Immersion: {immersionPercentage}%</Text>
 *       <ImmersiveText
 *         native="Continue"
 *         target="Continuar"
 *         tier="tier1"
 *       />
 *     </View>
 *   );
 * }
 */

// Types
export {
  CEFRLevel,
  ImmersionTier,
  ImmersionConfig,
  ImmersionSettings,
  UserImmersionState,
  LEVEL_DESCRIPTIONS,
  IMMERSION_MAP,
  DEFAULT_IMMERSION_SETTINGS,
  CEFR_LEVELS_ORDERED,
  getEffectiveLevel,
} from './types';

// Hook
export { useImmersion, default as useImmersionHook } from './useImmersion';

// Components
export {
  ImmersiveText,
  ImmersiveButtonLabel,
  ImmersiveFeedback,
  ImmersiveExplanation,
  default as ImmersiveTextComponent,
} from './ImmersiveText';
