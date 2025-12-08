import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { neomorphism, borderRadius, spacing, typography } from '@/constants/designSystem';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type NeoButtonVariant = 'primary' | 'secondary' | 'pressed';
export type NeoButtonSize = 'sm' | 'md' | 'lg';

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  variant?: NeoButtonVariant;
  size?: NeoButtonSize;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function NeoButton({
  title,
  onPress,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: NeoButtonProps) {
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    isPressed.value = true;
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    isPressed.value = false;
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    lg: { paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xl },
  };

  const textSizes = {
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.lg,
  };

  const getVariantStyles = () => {
    if (disabled) {
      return {
        button: styles.pressedButton,
        text: styles.pressedText,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          button: styles.primaryButton,
          text: styles.primaryText,
        };
      case 'pressed':
        return {
          button: styles.pressedButton,
          text: styles.pressedText,
        };
      default:
        return {
          button: styles.secondaryButton,
          text: styles.secondaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      style={[
        styles.button,
        variantStyles.button,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        <Text
          style={[
            styles.text,
            variantStyles.text,
            { fontSize: textSizes[size] },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },

  // Primary variant (teal raised button)
  primaryButton: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    // Simulated neomorphic shadow
    shadowColor: neomorphism.button.primary.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryText: {
    color: neomorphism.button.primary.textColor,
  },

  // Secondary variant (dark raised button)
  secondaryButton: {
    backgroundColor: neomorphism.button.secondary.backgroundColor,
    // Neomorphic dual shadow effect
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
    // Add subtle border for depth
    borderWidth: 1,
    borderColor: 'rgba(61, 69, 89, 0.3)',
  },
  secondaryText: {
    color: neomorphism.button.secondary.textColor,
  },

  // Pressed/inset variant
  pressedButton: {
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    borderWidth: 2,
    borderColor: neomorphism.button.pressed.borderColor,
    // Inset shadow effect
    shadowColor: 'transparent',
    elevation: 0,
  },
  pressedText: {
    color: neomorphism.button.pressed.textColor,
  },
});
