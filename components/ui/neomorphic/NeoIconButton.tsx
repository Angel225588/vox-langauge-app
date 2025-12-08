import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { neomorphism, borderRadius, spacing } from '@/constants/designSystem';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type NeoIconButtonVariant = 'raised' | 'pressed' | 'flat';
export type NeoIconButtonSize = 'sm' | 'md' | 'lg';

interface NeoIconButtonProps {
  icon: string | React.ReactNode;
  onPress: () => void;
  variant?: NeoIconButtonVariant;
  size?: NeoIconButtonSize;
  active?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function NeoIconButton({
  icon,
  onPress,
  variant = 'raised',
  size = 'md',
  active = false,
  disabled = false,
  style,
  accessibilityLabel,
}: NeoIconButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeConfig = {
    sm: { size: neomorphism.iconButton.size.sm, iconSize: 16 },
    md: { size: neomorphism.iconButton.size.md, iconSize: 20 },
    lg: { size: neomorphism.iconButton.size.lg, iconSize: 24 },
  };

  const { size: buttonSize, iconSize } = sizeConfig[size];

  const getVariantStyles = () => {
    if (disabled) {
      return styles.pressedButton;
    }

    switch (variant) {
      case 'pressed':
        return styles.pressedButton;
      case 'flat':
        return styles.flatButton;
      default:
        return styles.raisedButton;
    }
  };

  const getIconColor = () => {
    if (disabled) return neomorphism.iconButton.iconColorInactive;
    if (active) return neomorphism.iconButton.iconColor;
    return variant === 'pressed'
      ? neomorphism.iconButton.iconColorInactive
      : neomorphism.iconButton.iconColor;
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.button,
        getVariantStyles(),
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        },
        animatedStyle,
        style,
      ]}
    >
      {typeof icon === 'string' ? (
        <Text style={[styles.icon, { fontSize: iconSize, color: getIconColor() }]}>
          {icon}
        </Text>
      ) : (
        <View style={{ opacity: disabled ? 0.5 : 1 }}>{icon}</View>
      )}
    </AnimatedTouchable>
  );
}

// Navigation/arrow buttons
interface NeoNavButtonProps {
  direction: 'left' | 'right' | 'up' | 'down';
  onPress: () => void;
  disabled?: boolean;
  size?: NeoIconButtonSize;
  style?: ViewStyle;
}

export function NeoNavButton({
  direction,
  onPress,
  disabled = false,
  size = 'md',
  style,
}: NeoNavButtonProps) {
  const arrows = {
    left: '‹',
    right: '›',
    up: '‹',
    down: '›',
  };

  const rotations = {
    left: '0deg',
    right: '0deg',
    up: '90deg',
    down: '-90deg',
  };

  return (
    <NeoIconButton
      icon={
        <Text
          style={[
            styles.navArrow,
            { transform: [{ rotate: rotations[direction] }] },
          ]}
        >
          {arrows[direction]}
        </Text>
      }
      onPress={onPress}
      variant="pressed"
      size={size}
      disabled={disabled}
      style={style}
    />
  );
}

// Media control buttons (play, pause, stop, etc.)
interface NeoMediaButtonProps {
  type: 'play' | 'pause' | 'stop' | 'prev' | 'next' | 'speaker' | 'mute';
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: NeoIconButtonSize;
  style?: ViewStyle;
}

export function NeoMediaButton({
  type,
  onPress,
  active = false,
  disabled = false,
  size = 'md',
  style,
}: NeoMediaButtonProps) {
  const icons = {
    play: '▶',
    pause: '⏸',
    stop: '⏹',
    prev: '⏮',
    next: '⏭',
    speaker: '🔊',
    mute: '🔇',
  };

  return (
    <NeoIconButton
      icon={icons[type]}
      onPress={onPress}
      variant={active ? 'raised' : 'pressed'}
      size={size}
      active={active}
      disabled={disabled}
      accessibilityLabel={type}
      style={style}
    />
  );
}

// Tab bar icon button
interface NeoTabButtonProps {
  icon: string;
  label?: string;
  active?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function NeoTabButton({
  icon,
  label,
  active = false,
  onPress,
  style,
}: NeoTabButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.tabButton, active && styles.tabButtonActive, style]}
    >
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
      {label && (
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Raised variant (default neomorphic)
  raisedButton: {
    backgroundColor: neomorphism.iconButton.background,
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(61, 69, 89, 0.3)',
  },

  // Pressed/inset variant
  pressedButton: {
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    borderWidth: 2,
    borderColor: neomorphism.button.pressed.borderColor,
    shadowColor: 'transparent',
    elevation: 0,
  },

  // Flat variant (minimal)
  flatButton: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },

  icon: {
    textAlign: 'center',
  },

  // Nav arrow styles
  navArrow: {
    color: neomorphism.iconButton.iconColorInactive,
    fontSize: 24,
    fontWeight: '300',
  },

  // Tab button styles
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: neomorphism.button.pressed.backgroundColor,
  },
  tabIcon: {
    fontSize: 20,
    color: neomorphism.iconButton.iconColorInactive,
    marginBottom: spacing.xs,
  },
  tabIconActive: {
    color: neomorphism.iconButton.iconColor,
  },
  tabLabel: {
    fontSize: 12,
    color: neomorphism.text.inactive,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: neomorphism.text.primary,
  },
});
