/**
 * Practice Tab - Independent Learning Tools & Games
 *
 * All practice activities tracked for weekly analytics
 * Users can practice without following the structured learning path
 */

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';

// Analytics tracking function (to be implemented with database)
const trackPracticeActivity = async (activityType: string, metadata?: object) => {
  console.log('[Analytics] Practice activity:', activityType, metadata);
  // TODO: Save to database for weekly analysis
  // await supabase.from('user_practice_sessions').insert({
  //   user_id: user.id,
  //   activity_type: activityType,
  //   metadata,
  //   timestamp: new Date().toISOString(),
  // });
};

export default function PracticeScreen() {
  const router = useRouter();
  const [todayStats, setTodayStats] = useState({
    flashcards: 15,
    games: 3,
    minutes: 25,
  });

  const handleCardType = (cardType: string) => {
    trackPracticeActivity('card_practice', { card_type: cardType });
    router.push(`/test-cards?type=${cardType}`);
  };

  const handleQuickPractice = (practiceType: string) => {
    trackPracticeActivity('quick_practice', { practice_type: practiceType });
    // TODO: Navigate to specific practice screen
    console.log('Quick practice:', practiceType);
  };

  const handleFlashcardSession = () => {
    trackPracticeActivity('flashcard_session');
    router.push('/flashcard/session');
  };

  const handlePracticeWithOthers = () => {
    trackPracticeActivity('practice_with_others');
    // TODO: Navigate to community practice
    console.log('Practice with others');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-6 pt-16 pb-6 border-b border-gray-100">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Practice
          </Text>
          <Text className="text-base text-gray-600">
            Independent tools and games for flexible learning
          </Text>

          {/* Today's Practice Stats */}
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              <Text className="text-2xl mb-1">📝</Text>
              <Text className="text-xl font-bold text-gray-900">{todayStats.flashcards}</Text>
              <Text className="text-xs text-gray-600">Flashcards</Text>
            </View>
            <View className="flex-1 bg-green-50 p-3 rounded-xl border border-green-100">
              <Text className="text-2xl mb-1">🎮</Text>
              <Text className="text-xl font-bold text-gray-900">{todayStats.games}</Text>
              <Text className="text-xs text-gray-600">Games</Text>
            </View>
            <View className="flex-1 bg-purple-50 p-3 rounded-xl border border-purple-100">
              <Text className="text-2xl mb-1">⏱️</Text>
              <Text className="text-xl font-bold text-gray-900">{todayStats.minutes}m</Text>
              <Text className="text-xs text-gray-600">Practice</Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* Quick Practice Section */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200).springify()}
            className="mb-8"
          >
            <Text className="text-xl font-bold text-gray-900 mb-4">
              🚀 Quick Practice
            </Text>
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => handleQuickPractice('match')}
                activeOpacity={0.7}
                className="bg-white p-5 rounded-2xl border border-gray-100 flex-row items-center"
              >
                <View className="w-14 h-14 bg-indigo-100 rounded-xl items-center justify-center mr-4">
                  <Text className="text-3xl">🎯</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">Match Game</Text>
                  <Text className="text-sm text-gray-600">Connect words with meanings</Text>
                </View>
                <Text className="text-gray-400 text-xl">→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleQuickPractice('reading')}
                activeOpacity={0.7}
                className="bg-white p-5 rounded-2xl border border-gray-100 flex-row items-center"
              >
                <View className="w-14 h-14 bg-green-100 rounded-xl items-center justify-center mr-4">
                  <Text className="text-3xl">📖</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">Reading Practice</Text>
                  <Text className="text-sm text-gray-600">Improve comprehension</Text>
                </View>
                <Text className="text-gray-400 text-xl">→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleQuickPractice('listening')}
                activeOpacity={0.7}
                className="bg-white p-5 rounded-2xl border border-gray-100 flex-row items-center"
              >
                <View className="w-14 h-14 bg-purple-100 rounded-xl items-center justify-center mr-4">
                  <Text className="text-3xl">🎧</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">Listening Practice</Text>
                  <Text className="text-sm text-gray-600">Train your ear</Text>
                </View>
                <Text className="text-gray-400 text-xl">→</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Flashcard Review */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            className="mb-8"
          >
            <TouchableOpacity
              onPress={handleFlashcardSession}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6 rounded-3xl"
                style={{
                  shadowColor: '#6366F1',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-white text-2xl font-bold mb-2">
                      📚 Flashcard Review
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Spaced repetition • Learning cycle
                    </Text>
                  </View>
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                    <Text className="text-white text-2xl">→</Text>
                  </View>
                </View>
                <Text className="text-white/70 text-xs">
                  Review with the 3-card cycle: Learning → Listening → Speaking
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Card Types Section */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(400).springify()}
            className="mb-8"
          >
            <Text className="text-xl font-bold text-gray-900 mb-4">
              🎨 Exercise Types
            </Text>
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => handleCardType('single-vocab')}
                className="bg-white p-4 rounded-2xl border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">📝</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">Single Vocab</Text>
                    <Text className="text-sm text-gray-600">Word + image + pronunciation</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCardType('comparison')}
                className="bg-white p-4 rounded-2xl border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">⚖️</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">Comparison</Text>
                    <Text className="text-sm text-gray-600">Compare similar words</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCardType('image-multiple-choice')}
                className="bg-white p-4 rounded-2xl border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">🖼️</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">Image Quiz</Text>
                    <Text className="text-sm text-gray-600">Choose the correct image</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCardType('audio-to-image')}
                className="bg-white p-4 rounded-2xl border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">🔊</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">Audio Match</Text>
                    <Text className="text-sm text-gray-600">Listen and select image</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCardType('text-input')}
                className="bg-white p-4 rounded-2xl border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">⌨️</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">Text Input</Text>
                    <Text className="text-sm text-gray-600">Type the answer</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCardType('speaking')}
                className="bg-white p-4 rounded-2xl border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">🎤</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">Speaking</Text>
                    <Text className="text-sm text-gray-600">Record pronunciation</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Practice with Others */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(500).springify()}
            className="mb-8"
          >
            <TouchableOpacity
              onPress={handlePracticeWithOthers}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#06D6A0', '#4ECDC4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6 rounded-3xl"
                style={{
                  shadowColor: '#06D6A0',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-2">
                      👥 Practice with Others
                    </Text>
                    <Text className="text-white/80 text-sm mb-3">
                      Join weekly conversations
                    </Text>
                    <View className="flex-row gap-3">
                      <View className="bg-white/20 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">Earn points</Text>
                      </View>
                      <View className="bg-white/20 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">Meet learners</Text>
                      </View>
                    </View>
                  </View>
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                    <Text className="text-white text-2xl">→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Analytics Note */}
          <View className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">📊</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 mb-1">
                  Your Practice is Tracked
                </Text>
                <Text className="text-xs text-gray-600">
                  All practice activities are saved for your weekly analysis.
                  We use this data to help you improve faster and suggest personalized content.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
