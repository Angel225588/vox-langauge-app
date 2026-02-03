/**
 * InlineSpeedSlider
 *
 * Compact speed slider for use during teleprompter playback.
 * Shows: walking icon - tick marks slider - running icon
 */

import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 180; // Space for icons and buttons
const KNOB_WIDTH = 4;
const TICK_COUNT = 20;

interface InlineSpeedSliderProps {
  speed: number; // 0-1 normalized
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export function InlineSpeedSlider({
  speed,
  onSpeedChange,
  disabled = false,
}: InlineSpeedSliderProps) {
  const sliderPosition = useSharedValue(speed * SLIDER_WIDTH);
  const startPosition = useSharedValue(0);

  // Sync external speed changes
  useEffect(() => {
    sliderPosition.value = speed * SLIDER_WIDTH;
  }, [speed]);

  const updateSpeed = useCallback((newSpeed: number) => {
    const clampedSpeed = Math.max(0, Math.min(1, newSpeed));
    onSpeedChange(clampedSpeed);
  }, [onSpeedChange]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startPosition.value = sliderPosition.value;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((event) => {
      'worklet';
      const newPosition = Math.max(0, Math.min(SLIDER_WIDTH, startPosition.value + event.translationX));
      sliderPosition.value = newPosition;
      const normalizedSpeed = newPosition / SLIDER_WIDTH;
      runOnJS(updateSpeed)(normalizedSpeed);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderPosition.value - KNOB_WIDTH / 2 }],
  }));

  // Generate tick marks
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const isCenter = i === Math.floor(TICK_COUNT / 2);
    const isQuarter = i === Math.floor(TICK_COUNT / 4) || i === Math.floor(TICK_COUNT * 3 / 4);
    return (
      <View
        key={i}
        style={[
          styles.tick,
          isCenter && styles.tickCenter,
          isQuarter && styles.tickQuarter,
        ]}
      />
    );
  });

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {/* Walking icon (slow) */}
      <Ionicons name="walk-outline" size={20} color={colors.text.secondary} />

      {/* Slider track with ticks */}
      <View style={styles.sliderContainer}>
        <View style={styles.ticksContainer}>
          {ticks}
        </View>

        {/* Draggable knob */}
        <GestureDetector gesture={disabled ? Gesture.Pan() : panGesture}>
          <Animated.View style={[styles.knob, knobStyle]} />
        </GestureDetector>
      </View>

      {/* Running icon (fast) */}
      <Ionicons name="walk" size={20} color={colors.text.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  ticksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    paddingHorizontal: 2,
  },
  tick: {
    width: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 0.5,
  },
  tickCenter: {
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  tickQuarter: {
    height: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  knob: {
    position: 'absolute',
    width: KNOB_WIDTH,
    height: 20,
    backgroundColor: '#FF9500', // Orange like the reference
    borderRadius: 2,
    top: 2,
  },
});

export default InlineSpeedSlider;
