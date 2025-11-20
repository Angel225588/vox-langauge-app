import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ProgressCardProps {
  title: string;
  emoji: string;
  progress: number; // 0-100
  newWords: number;
  games: number;
  onPress: () => void;
}

export function ProgressCard({
  title,
  emoji,
  progress,
  newWords,
  games,
  onPress,
}: ProgressCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(600).springify()}
      className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Text className="text-4xl mr-3">{emoji}</Text>
        <View className="flex-1">
          <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
            Your Next Lesson
          </Text>
          <Text className="text-2xl font-bold text-gray-900">{title}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-semibold text-gray-600">Progress</Text>
          <Text className="text-sm font-bold text-primary">{progress}%</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row items-center mb-5">
        <View className="flex-row items-center mr-4">
          <Text className="text-xl mr-1">📝</Text>
          <Text className="text-sm font-semibold text-gray-700">
            {newWords} new words
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-xl mr-1">🎮</Text>
          <Text className="text-sm font-semibold text-gray-700">
            {games} games
          </Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        className="bg-primary py-4 rounded-2xl items-center"
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text className="text-white text-base font-bold">
          Continue Lesson →
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
