import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

type Level = 'beginner' | 'intermediate' | 'advanced';

export default function LevelAssessmentScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const levels = [
    {
      id: 'beginner' as Level,
      title: 'Beginner',
      emoji: '🌱',
      description: "I'm just starting out or know very little",
      examples: 'Hello, thank you, numbers, basic phrases',
    },
    {
      id: 'intermediate' as Level,
      title: 'Intermediate',
      emoji: '🚀',
      description: 'I can have basic conversations',
      examples: 'Ordering food, asking directions, simple conversations',
    },
    {
      id: 'advanced' as Level,
      title: 'Advanced',
      emoji: '⭐',
      description: 'I can express complex ideas',
      examples: 'Business discussions, debates, nuanced conversations',
    },
  ];

  const handleContinue = () => {
    if (selectedLevel) {
      // TODO: Save level preference
      router.push('/(auth)/onboarding/interests');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-8">
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            className="mb-8"
          >
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              What's Your Level?
            </Text>
            <Text className="text-lg text-gray-600">
              Don't worry, this is just a starting point. We'll adapt as you learn.
            </Text>
          </Animated.View>

          {/* Level Options */}
          <View className="gap-4 mb-8">
            {levels.map((level, index) => (
              <Animated.View
                key={level.id}
                entering={FadeInDown.duration(600)
                  .delay(200 + index * 100)
                  .springify()}
              >
                <TouchableOpacity
                  className={`p-6 rounded-3xl border-2 ${
                    selectedLevel === level.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setSelectedLevel(level.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center mb-3">
                    <Text className="text-5xl mr-4">{level.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-gray-900">
                        {level.title}
                      </Text>
                    </View>
                    {selectedLevel === level.id && (
                      <View className="bg-primary w-8 h-8 rounded-full items-center justify-center">
                        <Text className="text-white text-sm font-bold">✓</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-base text-gray-700 font-semibold mb-2">
                    {level.description}
                  </Text>
                  <Text className="text-sm text-gray-500 italic">
                    Example: {level.examples}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Note */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(600).springify()}
            className="bg-blue-50 p-4 rounded-xl"
          >
            <Text className="text-sm text-blue-900">
              💡 <Text className="font-bold">Quick tip:</Text> We'll fine-tune your level as you practice. Choose what feels right now!
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-200">
        <Animated.View entering={FadeInUp.duration(600).delay(800).springify()}>
          <TouchableOpacity
            className={`w-full py-5 rounded-2xl items-center justify-center ${
              selectedLevel ? 'bg-primary' : 'bg-gray-300'
            }`}
            onPress={handleContinue}
            disabled={!selectedLevel}
            activeOpacity={0.8}
          >
            <Text
              className={`text-lg font-bold ${
                selectedLevel ? 'text-white' : 'text-gray-500'
              }`}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text className="text-center text-gray-400 text-xs mt-3">
          Step 2 of 3
        </Text>
      </View>
    </View>
  );
}
