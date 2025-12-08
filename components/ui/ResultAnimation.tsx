/**
 * ResultAnimation Component
 *
 * A fullscreen overlay that shows success or error Lottie animations.
 * Used to provide immediate visual feedback after user actions.
 *
 * Features:
 * - Fullscreen overlay with fade animation
 * - Integrates existing LottieSuccess and LottieError components
 * - Auto-dismiss support with callback
 * - Optional custom messages
 *
 * @example
 * ```tsx
 * // Basic usage
 * const [result, setResult] = useState<'success' | 'error' | null>(null);
 *
 * <ResultAnimation
 *   result={result}
 *   onComplete={() => setResult(null)}
 * />
 *
 * // With custom messages
 * <ResultAnimation
 *   result={result}
 *   successMessage="Great job!"
 *   errorMessage="Try again"
 *   onComplete={handleAnimationComplete}
 * />
 *
 * // Without auto-dismiss
 * <ResultAnimation
 *   result={result}
 *   autoDismiss={false}
 * />
 * ```
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LottieSuccess } from '../animations/LottieSuccess';
import { LottieError } from '../animations/LottieError';

export interface ResultAnimationProps {
  /** The result to display: 'success', 'error', or null (hidden) */
  result: 'success' | 'error' | null;
  /** Message to show on success. Default: "Success!" */
  successMessage?: string;
  /** Message to show on error. Default: "Something went wrong!" */
  errorMessage?: string;
  /** Size of the Lottie animation. Default: 200 */
  size?: number;
  /** Whether to auto-dismiss after animation. Default: true */
  autoDismiss?: boolean;
  /** Duration before auto-dismiss in ms. Default: 2000 */
  dismissDuration?: number;
  /** Called when animation completes (or after dismissDuration if autoDismiss) */
  onComplete?: () => void;
  /** Fade in duration in ms. Default: 300 */
  fadeInDuration?: number;
  /** Fade out duration in ms. Default: 300 */
  fadeOutDuration?: number;
  /** Whether to show the shake animation on error. Default: true */
  shakeOnError?: boolean;
}

export function ResultAnimation({
  result,
  successMessage,
  errorMessage,
  size = 200,
  autoDismiss = true,
  dismissDuration = 2000,
  onComplete,
  fadeInDuration = 300,
  fadeOutDuration = 300,
  shakeOnError = true,
}: ResultAnimationProps) {
  if (!result) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(fadeInDuration)}
      exiting={FadeOut.duration(fadeOutDuration)}
      style={styles.overlay}
    >
      {result === 'success' ? (
        <LottieSuccess
          message={successMessage}
          size={size}
          autoDismiss={autoDismiss}
          dismissDuration={dismissDuration}
          onComplete={onComplete}
        />
      ) : (
        <LottieError
          message={errorMessage}
          size={size}
          shake={shakeOnError}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
  },
});
