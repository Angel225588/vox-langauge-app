import React, { useEffect } from 'react';
import LottieView from 'lottie-react-native';
import { YStack, Text } from '@/components/ui/tamagui';
import Animated, { useSharedValue, withTiming, withSequence, Easing, useAnimatedStyle } from 'react-native-reanimated';

interface LottieErrorProps {
  message?: string;
  size?: number;
  shake?: boolean;
}

export function LottieError({
  message = 'Something went wrong!',
  size = 200,
  shake = true,
}: LottieErrorProps) {
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    if (shake) {
      shakeAnimation.value = withSequence(
        withTiming(10, { duration: 50, easing: Easing.linear }),
        withTiming(-10, { duration: 50, easing: Easing.linear }),
        withTiming(10, { duration: 50, easing: Easing.linear }),
        withTiming(0, { duration: 50, easing: Easing.linear })
      );
    }
  }, [shake, shakeAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnimation.value }],
    };
  });

  return (
    <YStack alignItems="center" justifyContent="center" gap="$4">
      <Animated.View style={shake ? animatedStyle : {}}>
        <LottieView
          source={require('@/assets/animations/error.json')} // You'll need to add this
          autoPlay
          loop={false} // Error animations are usually one-time
          style={{ width: size, height: size }}
        />
      </Animated.View>
      {message && (
        <Text fontSize={16} color="$red10"> {/* Assuming $red10 for error theme */}
          {message}
        </Text>
      )}
    </YStack>
  );
}
