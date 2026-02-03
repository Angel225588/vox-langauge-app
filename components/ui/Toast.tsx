/**
 * Toast Component
 *
 * Animated toast notification component with slide-in/out animations.
 * Features:
 * - Support for variants: success, error, warning, info
 * - Auto-dismiss with configurable duration
 * - Optional action button
 * - Uses design system tokens
 * - Safe area handling
 * - Haptic feedback
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing, typography, shadows, animation } from '@/constants/designSystem';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  variant: ToastVariant;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const ICON_MAP: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

const VARIANT_STYLES = {
  success: {
    backgroundColor: colors.success.DEFAULT,
    shadowColor: colors.glow.success,
    icon: colors.success.light,
  },
  error: {
    backgroundColor: colors.error.DEFAULT,
    shadowColor: colors.glow.error,
    icon: colors.error.light,
  },
  warning: {
    backgroundColor: colors.warning.DEFAULT,
    shadowColor: 'rgba(245, 158, 11, 0.5)',
    icon: colors.warning.light,
  },
  info: {
    backgroundColor: colors.primary.DEFAULT,
    shadowColor: colors.glow.primary,
    icon: colors.primary.light,
  },
};

const HAPTIC_MAP: Record<ToastVariant, Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
  info: Haptics.ImpactFeedbackStyle.Light,
};

export function Toast({ message, variant, duration = 3000, onDismiss, action }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Trigger haptic feedback
    const hapticType = HAPTIC_MAP[variant];
    if (hapticType === Haptics.ImpactFeedbackStyle.Light) {
      Haptics.impactAsync(hapticType);
    } else {
      Haptics.notificationAsync(hapticType as Haptics.NotificationFeedbackType);
    }

    // Slide in animation
    translateY.value = withSpring(0, animation.spring.default);
    opacity.value = withTiming(1, { duration: animation.duration.normal });

    // Auto-dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    translateY.value = withSpring(-200, animation.spring.stiff);
    opacity.value = withTiming(0, { duration: animation.duration.fast }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const variantStyle = VARIANT_STYLES[variant];
  const iconName = ICON_MAP[variant];

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { top: insets.top + spacing.md }
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: variantStyle.backgroundColor,
            shadowColor: variantStyle.shadowColor,
          }
        ]}
      >
        <View style={styles.content}>
          <Ionicons
            name={iconName}
            size={24}
            color={colors.text.primary}
            style={styles.icon}
          />
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>

        <View style={styles.actions}>
          {action && (
            <TouchableOpacity
              onPress={() => {
                action.onPress();
                handleDismiss();
              }}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  dismissButton: {
    padding: spacing.xs,
  },
});
