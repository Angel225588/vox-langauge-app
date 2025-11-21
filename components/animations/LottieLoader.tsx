import React from 'react';
import LottieView from 'lottie-react-native';
import { YStack, Text } from '@/components/ui/tamagui';

interface LottieLoaderProps {
  message?: string;
  size?: number;
}

export function LottieLoader({ message = 'Loading...', size = 200 }: LottieLoaderProps) {
  return (
    <YStack alignItems="center" justifyContent="center" gap="$4">
      <LottieView
        source={require('@/assets/animations/loading.json')} // You'll need to add this
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
      {message && (
        <Text fontSize={16} color="$textSecondary">
          {message}
        </Text>
      )}
    </YStack>
  );
}
