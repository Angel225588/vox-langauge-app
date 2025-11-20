import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface StreakDisplayProps {
  streak: number;
  variant?: 'compact' | 'full';
}

export function StreakDisplay({ streak, variant = 'compact' }: StreakDisplayProps) {
  const isAtRisk = streak === 0;

  if (variant === 'compact') {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-row items-center bg-warning/10 px-3 py-2 rounded-full"
      >
        <Text className="text-2xl mr-1">🔥</Text>
        <Text className="text-base font-bold text-gray-900">
          {streak}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className={`flex-row items-center p-4 rounded-2xl ${
        isAtRisk ? 'bg-gray-100' : 'bg-warning/10'
      }`}
    >
      <Text className="text-4xl mr-3">🔥</Text>
      <View>
        <Text className="text-2xl font-bold text-gray-900">{streak}</Text>
        <Text className="text-sm text-gray-600">
          Day Streak
        </Text>
      </View>
    </Animated.View>
  );
}
