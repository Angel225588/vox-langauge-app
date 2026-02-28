/**
 * ImmersiveText Component
 *
 * A text component that automatically displays content in the user's
 * native or target language based on their immersion level and the
 * difficulty tier of the content.
 *
 * @example
 * // Simple usage with both texts provided
 * <ImmersiveText
 *   native="Continue"
 *   target="Continuar"
 *   tier="tier1"
 * />
 *
 * @example
 * // Using translation keys
 * <ImmersiveText
 *   tKey="buttons.continue"
 *   tier="tier1"
 * />
 */

import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { useImmersion } from './useImmersion';
import type { ImmersionTier } from './types';

interface ImmersiveTextBaseProps extends Omit<TextProps, 'children'> {
  /** Difficulty tier - determines when to switch to target language */
  tier?: ImmersionTier;
  /** Text styles */
  style?: TextStyle;
  /** Number of lines before truncating */
  numberOfLines?: number;
}

interface ImmersiveTextWithStrings extends ImmersiveTextBaseProps {
  /** Text in native language */
  native: string;
  /** Text in target language */
  target: string;
  /** Translation key (not used when native/target provided) */
  tKey?: never;
  /** Namespace (not used when native/target provided) */
  namespace?: never;
}

interface ImmersiveTextWithKey extends ImmersiveTextBaseProps {
  /** Translation key to resolve */
  tKey: string;
  /** i18n namespace */
  namespace?: string;
  /** Native text (not used when tKey provided) */
  native?: never;
  /** Target text (not used when tKey provided) */
  target?: never;
}

type ImmersiveTextProps = ImmersiveTextWithStrings | ImmersiveTextWithKey;

export function ImmersiveText(props: ImmersiveTextProps) {
  const { tier = 'tier1', style, numberOfLines, ...textProps } = props;
  const { getImmersiveText, getImmersiveTranslation } = useImmersion();

  let displayText: string;

  if ('tKey' in props && props.tKey) {
    // Using translation key
    displayText = getImmersiveTranslation(props.tKey, tier, props.namespace);
  } else if ('native' in props && 'target' in props && props.native && props.target) {
    // Using provided strings
    displayText = getImmersiveText(props.native, props.target, tier);
  } else {
    displayText = '';
  }

  return (
    <Text style={style} numberOfLines={numberOfLines} {...textProps}>
      {displayText}
    </Text>
  );
}

/**
 * ImmersiveButton Label Component
 *
 * Convenience wrapper for button labels (tier1 by default)
 */
interface ImmersiveButtonLabelProps extends Omit<ImmersiveTextBaseProps, 'tier'> {
  native: string;
  target: string;
}

export function ImmersiveButtonLabel({
  native,
  target,
  ...props
}: ImmersiveButtonLabelProps) {
  return (
    <ImmersiveText native={native} target={target} tier="tier1" {...props} />
  );
}

/**
 * ImmersiveFeedback Component
 *
 * For feedback messages like "Correct!", "Try again" (tier2)
 */
interface ImmersiveFeedbackProps extends Omit<ImmersiveTextBaseProps, 'tier'> {
  native: string;
  target: string;
}

export function ImmersiveFeedback({
  native,
  target,
  ...props
}: ImmersiveFeedbackProps) {
  return (
    <ImmersiveText native={native} target={target} tier="tier2" {...props} />
  );
}

/**
 * ImmersiveExplanation Component
 *
 * For complex explanations and grammar tips (tier3)
 */
interface ImmersiveExplanationProps extends Omit<ImmersiveTextBaseProps, 'tier'> {
  native: string;
  target: string;
}

export function ImmersiveExplanation({
  native,
  target,
  ...props
}: ImmersiveExplanationProps) {
  return (
    <ImmersiveText native={native} target={target} tier="tier3" {...props} />
  );
}

export default ImmersiveText;
