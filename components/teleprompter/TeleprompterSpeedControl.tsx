/**
 * TeleprompterSpeedControl
 *
 * Speed control panel with:
 * - Horizontal slider (walking to running icons)
 * - Three mode tabs: Auto, Fixed Speed, Timer
 * - WPM display
 * - Custom timer duration input
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - spacing.lg * 2 - 80; // Account for icons
const KNOB_SIZE = 24;

export type SpeedMode = 'auto' | 'fixed' | 'timer';

export interface SpeedControlProps {
  mode: SpeedMode;
  onModeChange: (mode: SpeedMode) => void;
  speed: number; // 0-1 normalized
  onSpeedChange: (speed: number) => void;
  wpm: number; // Calculated WPM for display
  totalWords?: number; // For timer mode calculation
  timerMinutes: number;
  timerSeconds: number;
  onTimerChange: (minutes: number, seconds: number) => void;
  disabled?: boolean;
}

// Speed range: 60 WPM (slow) to 300 WPM (fast)
const MIN_WPM = 60;
const MAX_WPM = 300;

export function TeleprompterSpeedControl({
  mode,
  onModeChange,
  speed,
  onSpeedChange,
  wpm,
  totalWords = 100,
  timerMinutes,
  timerSeconds,
  onTimerChange,
  disabled = false,
}: SpeedControlProps) {
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
    transform: [{ translateX: sliderPosition.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: sliderPosition.value + KNOB_SIZE / 2,
  }));

  // Walking icon opacity (more visible at slow speeds)
  const walkingOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      sliderPosition.value,
      [0, SLIDER_WIDTH],
      [1, 0.4],
      Extrapolation.CLAMP
    ),
  }));

  // Running icon opacity (more visible at fast speeds)
  const runningOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      sliderPosition.value,
      [0, SLIDER_WIDTH],
      [0.4, 1],
      Extrapolation.CLAMP
    ),
  }));

  const handleModeChange = (newMode: SpeedMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onModeChange(newMode);
  };

  const handleTimerMinutesChange = (text: string) => {
    const minutes = parseInt(text) || 0;
    onTimerChange(Math.min(60, Math.max(0, minutes)), timerSeconds);
  };

  const handleTimerSecondsChange = (text: string) => {
    const seconds = parseInt(text) || 0;
    onTimerChange(timerMinutes, Math.min(59, Math.max(0, seconds)));
  };

  // Calculate estimated time for current WPM
  const estimatedMinutes = Math.floor(totalWords / wpm);
  const estimatedSeconds = Math.round((totalWords / wpm - estimatedMinutes) * 60);

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {/* Speed Slider */}
      <View style={styles.sliderContainer}>
        <Animated.View style={[styles.walkingIcon, walkingOpacity]}>
          <Ionicons name="walk-outline" size={24} color={colors.text.secondary} />
        </Animated.View>

        <View style={styles.sliderTrack}>
          <Animated.View style={[styles.sliderProgress, progressStyle]} />
          <GestureDetector gesture={disabled || mode === 'timer' ? Gesture.Pan() : panGesture}>
            <Animated.View style={[styles.sliderKnob, knobStyle]}>
              <View style={styles.knobInner} />
            </Animated.View>
          </GestureDetector>
        </View>

        <Animated.View style={[styles.runningIcon, runningOpacity]}>
          <Ionicons name="walk" size={24} color={colors.text.secondary} />
        </Animated.View>
      </View>

      {/* WPM Display or Timer Input */}
      {mode === 'timer' ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Duration:</Text>
          <View style={styles.timerInputs}>
            <TextInput
              style={styles.timerInput}
              value={timerMinutes.toString()}
              onChangeText={handleTimerMinutesChange}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
            />
            <Text style={styles.timerSeparator}>:</Text>
            <TextInput
              style={styles.timerInput}
              value={timerSeconds.toString().padStart(2, '0')}
              onChangeText={handleTimerSecondsChange}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
            />
          </View>
          <Text style={styles.timerWpm}>
            ({Math.round((totalWords / (timerMinutes * 60 + timerSeconds)) * 60)} WPM)
          </Text>
        </View>
      ) : (
        <View style={styles.wpmDisplay}>
          <Text style={styles.wpmValue}>{wpm}</Text>
          <Text style={styles.wpmLabel}>WPM</Text>
          <Text style={styles.estimatedTime}>
            ~{estimatedMinutes}:{estimatedSeconds.toString().padStart(2, '0')}
          </Text>
        </View>
      )}

      {/* Mode Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'auto' && styles.modeTabActive]}
          onPress={() => handleModeChange('auto')}
          disabled={disabled}
        >
          <Text style={[styles.modeTabText, mode === 'auto' && styles.modeTabTextActive]}>
            Auto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'fixed' && styles.modeTabActive]}
          onPress={() => handleModeChange('fixed')}
          disabled={disabled}
        >
          <Text style={[styles.modeTabText, mode === 'fixed' && styles.modeTabTextActive]}>
            Fixed Speed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'timer' && styles.modeTabActive]}
          onPress={() => handleModeChange('timer')}
          disabled={disabled}
        >
          <Text style={[styles.modeTabText, mode === 'timer' && styles.modeTabTextActive]}>
            Timer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },

  // Slider
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  walkingIcon: {
    width: 32,
    alignItems: 'center',
  },
  runningIcon: {
    width: 32,
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    position: 'relative',
  },
  sliderProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 6,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 3,
  },
  sliderKnob: {
    position: 'absolute',
    top: -9,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  knobInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.primary,
  },

  // WPM Display
  wpmDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  wpmValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  wpmLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  estimatedTime: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
    fontVariant: ['tabular-nums'],
  },

  // Timer Input
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  timerLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  timerInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    width: 56,
    fontVariant: ['tabular-nums'],
  },
  timerSeparator: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginHorizontal: spacing.xs,
  },
  timerWpm: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontVariant: ['tabular-nums'],
  },

  // Mode Tabs
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  modeTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  modeTabTextActive: {
    color: colors.text.primary,
  },
});

export default TeleprompterSpeedControl;
