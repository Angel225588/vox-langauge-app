/**
 * DarkOverlay Component
 *
 * A reusable semi-transparent overlay that dims the background content.
 * Used to focus attention on modals, popups, or feedback panels.
 *
 * Features:
 * - Smooth fade-in animation
 * - Configurable opacity
 * - Non-blocking by default (pointerEvents="none")
 * - Can be made interactive with onPress
 *
 * @example
 * ```tsx
 * // Basic usage - dims background when showing feedback
 * <DarkOverlay visible={showWrongAnswer} />
 *
 * // Custom opacity
 * <DarkOverlay visible={showModal} opacity={0.6} />
 *
 * // Interactive - dismiss on tap
 * <DarkOverlay
 *   visible={showModal}
 *   onPress={() => setShowModal(false)}
 * />
 * ```
 */

import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface DarkOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Opacity of the overlay (0-1). Default: 0.4 */
  opacity?: number;
  /** Fade in duration in ms. Default: 300 */
  fadeInDuration?: number;
  /** Fade out duration in ms. Default: 200 */
  fadeOutDuration?: number;
  /** Called when overlay is pressed. If provided, overlay becomes interactive */
  onPress?: () => void;
  /** Custom z-index for stacking. Default: 1 */
  zIndex?: number;
}

export function DarkOverlay({
  visible,
  opacity = 0.4,
  fadeInDuration = 300,
  fadeOutDuration = 200,
  onPress,
  zIndex = 1,
}: DarkOverlayProps) {
  if (!visible) return null;

  const overlay = (
    <Animated.View
      entering={FadeIn.duration(fadeInDuration)}
      exiting={FadeOut.duration(fadeOutDuration)}
      style={[
        styles.overlay,
        {
          backgroundColor: `rgba(0, 0, 0, ${opacity})`,
          zIndex,
        },
      ]}
      pointerEvents={onPress ? 'auto' : 'none'}
    />
  );

  // If onPress is provided, wrap in TouchableWithoutFeedback
  if (onPress) {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        {overlay}
      </TouchableWithoutFeedback>
    );
  }

  return overlay;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
