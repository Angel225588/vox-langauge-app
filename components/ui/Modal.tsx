import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, spacing, animation } from '@/constants/designSystem';

export type ModalPlacement = 'center' | 'bottom';

export interface ModalProps {
  visible: boolean;
  onDismiss?: () => void;
  onShow?: () => void;
  placement?: ModalPlacement;
  dismissOnBackdropPress?: boolean;
  dismissOnHardwareBackPress?: boolean;
  children: React.ReactNode;
  overlayOpacity?: number;
  animationType?: 'slide' | 'fade';
  avoidKeyboard?: boolean;
  contentStyle?: any;
}

/**
 * Base Modal Component
 *
 * Features:
 * - Animated overlay with configurable opacity
 * - Content slides up from bottom or fades in at center
 * - Tap outside to dismiss (optional)
 * - Proper safe area handling
 * - Keyboard avoiding behavior
 * - Haptic feedback on open
 * - Spring animations using Reanimated
 *
 * @example
 * ```tsx
 * <Modal
 *   visible={isVisible}
 *   onDismiss={() => setVisible(false)}
 *   placement="bottom"
 * >
 *   <View>{/* Your content *\/}</View>
 * </Modal>
 * ```
 */
export function Modal({
  visible,
  onDismiss,
  onShow,
  placement = 'center',
  dismissOnBackdropPress = true,
  dismissOnHardwareBackPress = true,
  children,
  overlayOpacity = 0.7,
  animationType = placement === 'bottom' ? 'slide' : 'fade',
  avoidKeyboard = false,
  contentStyle,
}: ModalProps) {
  const insets = useSafeAreaInsets();

  // Animation values
  const overlayOpacityValue = useSharedValue(0);
  const contentTranslateY = useSharedValue(placement === 'bottom' ? 1000 : 0);
  const contentScale = useSharedValue(placement === 'center' ? 0.9 : 1);
  const contentOpacity = useSharedValue(0);

  // Trigger haptic feedback when modal opens
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      animateIn();
      onShow?.();
    } else {
      animateOut();
    }
  }, [visible]);

  const animateIn = () => {
    overlayOpacityValue.value = withTiming(overlayOpacity, {
      duration: animation.duration.normal,
      easing: Easing.out(Easing.ease),
    });

    if (animationType === 'slide') {
      contentTranslateY.value = withSpring(0, animation.spring.default);
      contentOpacity.value = withTiming(1, { duration: animation.duration.fast });
    } else {
      contentScale.value = withSpring(1, animation.spring.default);
      contentOpacity.value = withTiming(1, {
        duration: animation.duration.normal,
        easing: Easing.out(Easing.ease),
      });
    }
  };

  const animateOut = () => {
    overlayOpacityValue.value = withTiming(0, {
      duration: animation.duration.normal,
      easing: Easing.in(Easing.ease),
    });

    if (animationType === 'slide') {
      contentTranslateY.value = withSpring(1000, animation.spring.stiff);
      contentOpacity.value = withTiming(0, { duration: animation.duration.fast });
    } else {
      contentScale.value = withSpring(0.9, animation.spring.stiff);
      contentOpacity.value = withTiming(0, {
        duration: animation.duration.fast,
        easing: Easing.in(Easing.ease),
      });
    }
  };

  const handleBackdropPress = () => {
    if (dismissOnBackdropPress && onDismiss) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDismiss();
    }
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacityValue.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const baseStyle: any = {
      opacity: contentOpacity.value,
    };

    if (animationType === 'slide') {
      baseStyle.transform = [{ translateY: contentTranslateY.value }];
    } else {
      baseStyle.transform = [{ scale: contentScale.value }];
    }

    return baseStyle;
  });

  const getContentContainerStyle = () => {
    if (placement === 'bottom') {
      return [
        styles.contentContainerBottom,
        { paddingBottom: Math.max(insets.bottom, spacing.lg) },
      ];
    }
    return styles.contentContainerCenter;
  };

  return (
    <RNModal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={() => {
        if (dismissOnHardwareBackPress && onDismiss) {
          onDismiss();
        }
      }}
    >
      <View style={styles.modalContainer}>
        {/* Animated Overlay */}
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          />
        </Animated.View>

        {/* Content Container */}
        <View style={getContentContainerStyle()} pointerEvents="box-none">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled={avoidKeyboard}
            style={styles.keyboardAvoidingView}
          >
            <Animated.View
              style={[
                styles.content,
                placement === 'bottom' && styles.contentBottom,
                placement === 'center' && styles.contentCenter,
                contentAnimatedStyle,
                contentStyle,
              ]}
            >
              {children}
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  contentContainerCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  contentContainerBottom: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  content: {
    backgroundColor: colors.background.card,
    overflow: 'hidden',
  },
  contentCenter: {
    borderRadius: borderRadius.xl,
    maxWidth: 400,
    width: '100%',
    padding: spacing.lg,
  },
  contentBottom: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
  },
});
