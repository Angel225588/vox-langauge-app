import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

interface Interest {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

const INTERESTS: Interest[] = [
  {
    id: 'travel',
    title: 'Travel',
    emoji: '✈️',
    description: 'Airports, hotels, directions',
  },
  {
    id: 'food',
    title: 'Food & Dining',
    emoji: '🍽️',
    description: 'Restaurants, recipes, cooking',
  },
  {
    id: 'business',
    title: 'Business',
    emoji: '💼',
    description: 'Meetings, emails, presentations',
  },
  {
    id: 'casual',
    title: 'Casual Chat',
    emoji: '💬',
    description: 'Everyday conversations, friends',
  },
  {
    id: 'sports',
    title: 'Sports & Fitness',
    emoji: '⚽',
    description: 'Games, exercise, activities',
  },
  {
    id: 'entertainment',
    title: 'Movies & Music',
    emoji: '🎬',
    description: 'Films, songs, pop culture',
  },
  {
    id: 'shopping',
    title: 'Shopping',
    emoji: '🛍️',
    description: 'Stores, prices, bargaining',
  },
  {
    id: 'technology',
    title: 'Technology',
    emoji: '💻',
    description: 'Gadgets, software, internet',
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    emoji: '🏥',
    description: 'Doctor visits, medications',
  },
  {
    id: 'education',
    title: 'Education',
    emoji: '📚',
    description: 'School, learning, studying',
  },
];

export default function InterestsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (selectedInterests.length === 0) return;

    setIsLoading(true);
    // TODO: Save interests to profile
    // TODO: Generate first personalized lesson
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      // Jump straight into first lesson (Option A strategy)
      router.replace('/(tabs)/home');
    }, 2000);
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
              What Interests You?
            </Text>
            <Text className="text-lg text-gray-600">
              Select topics you want to learn about. We'll personalize your lessons!
            </Text>
            <View className="bg-primary/10 p-3 rounded-xl mt-4">
              <Text className="text-sm text-primary font-semibold">
                💡 Pick at least 3 topics to get started
              </Text>
            </View>
          </Animated.View>

          {/* Interest Grid */}
          <View className="gap-3 mb-8">
            {INTERESTS.map((interest, index) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <Animated.View
                  key={interest.id}
                  entering={FadeInDown.duration(400)
                    .delay(100 + index * 50)
                    .springify()}
                >
                  <TouchableOpacity
                    className={`flex-row items-center p-4 rounded-2xl border-2 ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => toggleInterest(interest.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${
                        isSelected ? 'bg-primary/10' : 'bg-gray-100'
                      }`}
                    >
                      <Text className="text-3xl">{interest.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900">
                        {interest.title}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {interest.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="bg-primary w-7 h-7 rounded-full items-center justify-center">
                        <Text className="text-white text-sm font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Selected Count */}
          {selectedInterests.length > 0 && (
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              className="bg-success/10 p-4 rounded-xl"
            >
              <Text className="text-sm text-success font-semibold text-center">
                ✨ {selectedInterests.length} topic{selectedInterests.length > 1 ? 's' : ''} selected
              </Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-200">
        <Animated.View entering={FadeInUp.duration(600).delay(600).springify()}>
          <TouchableOpacity
            className={`w-full py-5 rounded-2xl items-center justify-center ${
              selectedInterests.length >= 3 ? 'bg-primary' : 'bg-gray-300'
            }`}
            onPress={handleFinish}
            disabled={selectedInterests.length < 3 || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <Text className="text-white text-lg font-bold">
                Preparing your first lesson... 🎯
              </Text>
            ) : (
              <Text
                className={`text-lg font-bold ${
                  selectedInterests.length >= 3 ? 'text-white' : 'text-gray-500'
                }`}
              >
                Start Learning! 🚀
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text className="text-center text-gray-400 text-xs mt-3">
          Step 3 of 3 • Almost there!
        </Text>
      </View>
    </View>
  );
}
