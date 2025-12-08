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
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { neomorphism, borderRadius, spacing, typography } from '@/constants/designSystem';

// Toggle/Switch component
interface NeoToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function NeoToggle({
  value,
  onChange,
  label,
  disabled = false,
  size = 'md',
  style,
}: NeoToggleProps) {
  const sizes = {
    sm: { trackWidth: 40, trackHeight: 22, thumbSize: 18 },
    md: { trackWidth: 50, trackHeight: 28, thumbSize: 22 },
    lg: { trackWidth: 60, trackHeight: 34, thumbSize: 28 },
  };

  const { trackWidth, trackHeight, thumbSize } = sizes[size];
  const thumbOffset = (trackHeight - thumbSize) / 2;
  const thumbTravel = trackWidth - thumbSize - thumbOffset * 2;

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onChange(!value);
    }
  };

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(value ? thumbTravel : 0, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(
      value ? neomorphism.toggle.track.on : neomorphism.toggle.track.off
    ),
  }));

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.track,
            {
              width: trackWidth,
              height: trackHeight,
              borderRadius: trackHeight / 2,
            },
            animatedTrackStyle,
            disabled && styles.trackDisabled,
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                top: thumbOffset,
                left: thumbOffset,
              },
              animatedThumbStyle,
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

// Radio button component
interface NeoRadioProps {
  selected: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function NeoRadio({
  selected,
  onPress,
  label,
  disabled = false,
  size = 'md',
  style,
}: NeoRadioProps) {
  const sizes = {
    sm: { outer: 20, inner: 10 },
    md: { outer: 24, inner: 12 },
    lg: { outer: 28, inner: 14 },
  };

  const { outer, inner } = sizes[size];

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const animatedInnerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(selected ? 1 : 0, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
    opacity: withSpring(selected ? 1 : 0),
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.radioContainer, style]}
    >
      <View
        style={[
          styles.radioOuter,
          {
            width: outer,
            height: outer,
            borderRadius: outer / 2,
          },
          selected && styles.radioOuterSelected,
          disabled && styles.radioDisabled,
        ]}
      >
        <Animated.View
          style={[
            styles.radioInner,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2,
            },
            animatedInnerStyle,
          ]}
        />
      </View>

      {label && (
        <Text
          style={[
            styles.radioLabel,
            selected && styles.radioLabelSelected,
            disabled && styles.radioLabelDisabled,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Checkbox component
interface NeoCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function NeoCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  style,
}: NeoCheckboxProps) {
  const sizes = {
    sm: { box: 20, check: 12 },
    md: { box: 24, check: 14 },
    lg: { box: 28, check: 16 },
  };

  const { box, check } = sizes[size];

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(!checked);
    }
  };

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(checked ? 1 : 0, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
    opacity: withSpring(checked ? 1 : 0),
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.checkboxContainer, style]}
    >
      <View
        style={[
          styles.checkboxOuter,
          {
            width: box,
            height: box,
            borderRadius: borderRadius.sm,
          },
          checked && styles.checkboxOuterChecked,
          disabled && styles.checkboxDisabled,
        ]}
      >
        <Animated.Text
          style={[
            styles.checkmark,
            { fontSize: check },
            animatedCheckStyle,
          ]}
        >
          ✓
        </Animated.Text>
      </View>

      {label && (
        <Text
          style={[
            styles.checkboxLabel,
            checked && styles.checkboxLabelChecked,
            disabled && styles.checkboxLabelDisabled,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Radio Group
interface RadioOption {
  value: string;
  label: string;
}

interface NeoRadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  horizontal?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function NeoRadioGroup({
  options,
  value,
  onChange,
  label,
  horizontal = false,
  disabled = false,
  style,
}: NeoRadioGroupProps) {
  return (
    <View style={[styles.groupContainer, style]}>
      {label && <Text style={styles.groupLabel}>{label}</Text>}

      <View style={[styles.radioGroup, horizontal && styles.radioGroupHorizontal]}>
        {options.map((option) => (
          <NeoRadio
            key={option.value}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
            label={option.label}
            disabled={disabled}
            style={horizontal ? styles.radioItemHorizontal : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Toggle
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: neomorphism.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.md,
  },
  track: {
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: neomorphism.input.border,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: neomorphism.toggle.thumb,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  // Radio
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  radioOuter: {
    backgroundColor: neomorphism.radio.background,
    borderWidth: 2,
    borderColor: neomorphism.radio.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  radioOuterSelected: {
    borderColor: neomorphism.radio.active,
  },
  radioDisabled: {
    opacity: 0.5,
  },
  radioInner: {
    backgroundColor: neomorphism.radio.active,
  },
  radioLabel: {
    color: neomorphism.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
  radioLabelSelected: {
    color: neomorphism.text.primary,
  },
  radioLabelDisabled: {
    color: neomorphism.text.inactive,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  checkboxOuter: {
    backgroundColor: neomorphism.radio.background,
    borderWidth: 2,
    borderColor: neomorphism.radio.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  checkboxOuterChecked: {
    backgroundColor: neomorphism.accent,
    borderColor: neomorphism.accent,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: neomorphism.button.primary.textColor,
    fontWeight: typography.fontWeight.bold,
  },
  checkboxLabel: {
    color: neomorphism.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
  checkboxLabelChecked: {
    color: neomorphism.text.primary,
  },
  checkboxLabelDisabled: {
    color: neomorphism.text.inactive,
  },

  // Radio Group
  groupContainer: {
    width: '100%',
  },
  groupLabel: {
    color: neomorphism.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  radioGroup: {
    gap: spacing.sm,
  },
  radioGroupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioItemHorizontal: {
    marginRight: spacing.lg,
  },
});
