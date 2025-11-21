import React, { useEffect } from 'react';
import LottieView from 'lottie-react-native';
import { YStack, Text } from '@/components/ui/tamagui';

interface LottieSuccessProps {
  message?: string;
  size?: number;
  onComplete?: () => void;
  autoDismiss?: boolean;
  dismissDuration?: number; // in milliseconds
}

export function LottieSuccess({
  message = 'Success!',
  size = 200,
  onComplete,
  autoDismiss = true,
  dismissDuration = 2000,
}: LottieSuccessProps) {
  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, dismissDuration);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDuration, onComplete]);

  return (
    <YStack alignItems="center" justifyContent="center" gap="$4">
      <LottieView
        source={require('@/assets/animations/success.json')} // You'll need to add this
        autoPlay
        loop={false}
        style={{ width: size, height: size }}
      />
      {message && (
        <Text fontSize={16} color="$green10"> {/* Assuming $green10 for success theme */}
          {message}
        </Text>
      )}
    </YStack>
  );
}
