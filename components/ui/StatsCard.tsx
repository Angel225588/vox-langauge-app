import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface StatsCardProps {
  icon: string;
  value: number | string;
  label: string;
  delay?: number;
}

export function StatsCard({ icon, value, label, delay = 0 }: StatsCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay).springify()}
      className="flex-row items-center bg-gray-50 p-4 rounded-2xl"
    >
      <View className="bg-white w-12 h-12 rounded-xl items-center justify-center mr-3">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-2xl font-bold text-gray-900">{value}</Text>
        <Text className="text-sm text-gray-600">{label}</Text>
      </View>
    </Animated.View>
  );
}
