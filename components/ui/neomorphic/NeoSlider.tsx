import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { neomorphism, borderRadius, spacing, typography } from '@/constants/designSystem';

interface NeoSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  style?: ViewStyle;
}

export function NeoSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  showValue = true,
  formatValue,
  style,
}: NeoSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleTap = (tapX: number, trackWidth: number) => {
    const newPercentage = Math.max(0, Math.min(100, (tapX / trackWidth) * 100));
    const rawValue = min + (newPercentage / 100) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    if (clampedValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(clampedValue);
    }
  };

  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <View style={[styles.container, style]}>
      {(label || showValue) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showValue && <Text style={styles.value}>{displayValue}</Text>}
        </View>
      )}

      <View
        style={styles.trackContainer}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const trackWidth = 200; // Default estimate
          handleTap(e.nativeEvent.locationX, trackWidth);
        }}
        onResponderMove={(e) => {
          const trackWidth = 200;
          handleTap(e.nativeEvent.locationX, trackWidth);
        }}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentage}%` }]} />
        </View>

        <View style={[styles.thumb, { left: `${percentage}%` }]} />
      </View>
    </View>
  );
}

// Vertical slider (like volume control)
interface NeoVerticalSliderProps {
  value: number;
  levels: { label: string; value: number; name?: string }[];
  onChange: (index: number) => void;
  height?: number;
  topIcon?: string;
  bottomIcon?: string;
  style?: ViewStyle;
}

export function NeoVerticalSlider({
  value,
  levels,
  onChange,
  height = 160,
  topIcon = '🐰',
  bottomIcon = '🐢',
  style,
}: NeoVerticalSliderProps) {
  const percentage = (value / (levels.length - 1)) * 100;

  const handleLevelPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(index);
  };

  return (
    <View style={[styles.verticalContainer, style]}>
      {/* Top icon (fast) */}
      <Text style={styles.verticalIcon}>{topIcon}</Text>

      {/* Track */}
      <View style={[styles.verticalTrack, { height }]}>
        {/* Fill from bottom */}
        <View
          style={[
            styles.verticalFill,
            { height: `${percentage}%` },
          ]}
        />

        {/* Thumb */}
        <View
          style={[
            styles.verticalThumb,
            { bottom: `${percentage}%` },
          ]}
        />

        {/* Tap zones */}
        <View style={styles.verticalTapZones}>
          {levels.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={styles.verticalTapZone}
              onPress={() => handleLevelPress(levels.length - 1 - index)}
            />
          ))}
        </View>
      </View>

      {/* Bottom icon (slow) */}
      <Text style={styles.verticalIcon}>{bottomIcon}</Text>
    </View>
  );
}

// Increment/Decrement control (+/- buttons)
interface NeoStepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  style?: ViewStyle;
}

export function NeoStepper({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  showValue = true,
  style,
}: NeoStepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const handleDecrement = () => {
    if (canDecrement) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(Math.min(max, value + step));
    }
  };

  return (
    <View style={[styles.stepperContainer, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.stepperControls}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={!canDecrement}
          style={[
            styles.stepperButton,
            !canDecrement && styles.stepperButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.stepperButtonText,
              !canDecrement && styles.stepperButtonTextDisabled,
            ]}
          >
            −
          </Text>
        </TouchableOpacity>

        {showValue && <Text style={styles.stepperValue}>{value}</Text>}

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={!canIncrement}
          style={[
            styles.stepperButton,
            !canIncrement && styles.stepperButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.stepperButtonText,
              !canIncrement && styles.stepperButtonTextDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Horizontal slider
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: neomorphism.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  value: {
    color: neomorphism.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  trackContainer: {
    height: 32,
    justifyContent: 'center',
  },
  track: {
    height: 8,
    backgroundColor: neomorphism.slider.track,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: neomorphism.slider.fill,
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: neomorphism.slider.thumb,
    borderWidth: 3,
    borderColor: neomorphism.slider.thumbBorder,
    marginLeft: -12,
    shadowColor: neomorphism.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },

  // Vertical slider
  verticalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(45, 53, 72, 0.85)',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  verticalIcon: {
    fontSize: 20,
    marginVertical: spacing.xs,
  },
  verticalTrack: {
    width: 8,
    backgroundColor: neomorphism.slider.track,
    borderRadius: 4,
    marginVertical: spacing.sm,
    position: 'relative',
    overflow: 'visible',
  },
  verticalFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: neomorphism.slider.fill,
    borderRadius: 4,
  },
  verticalThumb: {
    position: 'absolute',
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: neomorphism.slider.thumb,
    borderWidth: 3,
    borderColor: neomorphism.slider.thumbBorder,
    marginBottom: -12,
    shadowColor: neomorphism.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  verticalTapZones: {
    position: 'absolute',
    top: -spacing.md,
    bottom: -spacing.md,
    left: -spacing.md,
    right: -spacing.md,
    flexDirection: 'column',
  },
  verticalTapZone: {
    flex: 1,
  },

  // Stepper (+/- buttons)
  stepperContainer: {
    alignItems: 'center',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: neomorphism.button.secondary.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  stepperButtonDisabled: {
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    shadowColor: 'transparent',
    elevation: 0,
  },
  stepperButtonText: {
    color: neomorphism.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
  },
  stepperButtonTextDisabled: {
    color: neomorphism.text.inactive,
  },
  stepperValue: {
    color: neomorphism.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    minWidth: 40,
    textAlign: 'center',
  },
});
