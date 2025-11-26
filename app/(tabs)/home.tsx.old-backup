import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { StreakDisplay } from '@/components/shared/StreakDisplay';
import { ProgressCard } from '@/components/ui/ProgressCard';
import { StatsCard } from '@/components/ui/StatsCard';
import { OnboardingRedirectModal } from '@/components/OnboardingRedirectModal';
import { supabase } from '@/lib/db/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: progressData, loading } = useProgress(user?.id);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check if user has completed onboarding
  useEffect(() => {
    async function checkOnboarding() {
      if (!user?.id) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_onboarding_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          // User hasn't completed onboarding, show modal
          setShowOnboardingModal(true);
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    }

    checkOnboarding();
  }, [user?.id]);

  const handleStartOnboarding = () => {
    setShowOnboardingModal(false);
    router.push('/(auth)/onboarding');
  };

  if (loading || !progressData || checkingOnboarding) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  const handleContinueLesson = () => {
    // TODO: Navigate to lesson flow
    console.log('Continue lesson:', progressData.nextLesson.id);
  };

  const handleQuickPractice = (type: string) => {
    // TODO: Navigate to practice type
    console.log('Quick practice:', type);
  };

  const handleStoryPress = (storyId: string) => {
    // TODO: Navigate to story reading
    console.log('Open story:', storyId);
  };

  const handlePracticeWithOthers = () => {
    // TODO: Navigate to practice matching screen
    router.push('/practice-with-others');
  };

  const handleTestCards = () => {
    router.push('/test-cards');
  };

  const handleTestOnboarding = () => {
    router.push('/(auth)/onboarding/goal-selection');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <OnboardingRedirectModal
        visible={showOnboardingModal}
        onReady={handleStartOnboarding}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View className="bg-white px-6 pt-16 pb-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-gray-600 mb-1">Welcome back!</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {user?.email?.split('@')[0] || 'Learner'}
            </Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
            <Text className="text-2xl">👤</Text>
          </TouchableOpacity>
        </View>

        {/* Streak and Points */}
        <View className="flex-row items-center justify-between">
          <StreakDisplay streak={progressData.streak} />
          <View className="bg-primary/10 px-4 py-2 rounded-full flex-row items-center">
            <Text className="text-2xl mr-2">⭐</Text>
            <Text className="text-base font-bold text-gray-900">
              {progressData.totalPoints}
            </Text>
            <Text className="text-sm text-gray-600 ml-1">pts</Text>
          </View>
        </View>
      </View>

      <View className="px-6 py-6">
        {/* Next Lesson Card */}
        <View className="mb-8">
          <ProgressCard
            title={progressData.nextLesson.title}
            emoji={progressData.nextLesson.emoji}
            progress={progressData.nextLesson.progress}
            newWords={progressData.nextLesson.newWords}
            games={progressData.nextLesson.games}
            onPress={handleContinueLesson}
          />
        </View>

        {/* Today's Progress */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200).springify()}
          className="mb-8"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4">
            📊 Today's Progress
          </Text>
          <View className="gap-3">
            <StatsCard
              icon="📝"
              value={progressData.todayStats.flashcardsReviewed}
              label="Flashcards reviewed"
              delay={300}
            />
            <StatsCard
              icon="🎮"
              value={progressData.todayStats.gamesCompleted}
              label="Games completed"
              delay={400}
            />
            <StatsCard
              icon="⏱️"
              value={`${progressData.todayStats.practiceMinutes} min`}
              label="Practice time"
              delay={500}
            />
          </View>
        </Animated.View>

        {/* Practice with Others - Featured Button */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(500).springify()}
          className="mb-8"
        >
          <TouchableOpacity
            onPress={handlePracticeWithOthers}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6 rounded-3xl"
              style={{
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                borderRadius: 24,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-3xl">👥</Text>
                  </View>
                  <View>
                    <Text className="text-white text-lg font-bold mb-1">
                      Practice with Others
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Join weekly conversations
                    </Text>
                  </View>
                </View>
                <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                  <Text className="text-white text-lg">→</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-4 pt-3 border-t border-white/20">
                <View className="flex-row items-center">
                  <Text className="text-white/80 text-xs mr-1">🎯</Text>
                  <Text className="text-white text-xs font-medium">Earn points</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-white/80 text-xs mr-1">🌍</Text>
                  <Text className="text-white text-xs font-medium">Meet learners</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-white/80 text-xs mr-1">⭐</Text>
                  <Text className="text-white text-xs font-medium">Support role</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Test Onboarding Button - Temporary for Development */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(500).springify()}
          className="mb-4"
        >
          <TouchableOpacity
            onPress={handleTestOnboarding}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 rounded-2xl"
              style={{
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                borderRadius: 16,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-2xl">✨</Text>
                  </View>
                  <View>
                    <Text className="text-white text-base font-bold">
                      Test Onboarding Flow
                    </Text>
                    <Text className="text-white/80 text-xs">
                      Preview new motivation screen (Step 4 of 5)
                    </Text>
                  </View>
                </View>
                <Text className="text-white text-lg">→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Test Cards Button - Temporary for Development */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(550).springify()}
          className="mb-8"
        >
          <TouchableOpacity
            onPress={handleTestCards}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#06D6A0', '#4ECDC4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 rounded-2xl"
              style={{
                shadowColor: '#06D6A0',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                borderRadius: 16,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-2xl">🎨</Text>
                  </View>
                  <View>
                    <Text className="text-white text-base font-bold">
                      Test New Card Components
                    </Text>
                    <Text className="text-white/80 text-xs">
                      Preview all 8 card types
                    </Text>
                  </View>
                </View>
                <Text className="text-white text-lg">→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Practice */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(600).springify()}
          className="mb-8"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4">
            🎯 Quick Practice
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center"
              onPress={() => handleQuickPractice('match')}
              activeOpacity={0.7}
            >
              <Text className="text-3xl mb-2">🎯</Text>
              <Text className="text-sm font-semibold text-gray-900">Match</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center"
              onPress={() => handleQuickPractice('reading')}
              activeOpacity={0.7}
            >
              <Text className="text-3xl mb-2">📖</Text>
              <Text className="text-sm font-semibold text-gray-900">Reading</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center"
              onPress={() => handleQuickPractice('listening')}
              activeOpacity={0.7}
            >
              <Text className="text-3xl mb-2">🎧</Text>
              <Text className="text-sm font-semibold text-gray-900">Listening</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Stories */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(700).springify()}
          className="mb-8"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4">
            📚 Recent Stories
          </Text>
          <View className="gap-3">
            {progressData.recentStories.map((story, index) => (
              <TouchableOpacity
                key={story.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center"
                onPress={() => handleStoryPress(story.id)}
                activeOpacity={0.7}
              >
                <View className="bg-primary/10 w-14 h-14 rounded-xl items-center justify-center mr-4">
                  <Text className="text-3xl">{story.thumbnail}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 mb-1">
                    {story.title}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {story.readingTime} min read
                  </Text>
                </View>
                <Text className="text-gray-400">→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Motivational Footer */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(800).springify()}
          className="bg-primary/5 p-6 rounded-3xl border border-primary/20"
        >
          <Text className="text-center text-base text-gray-700">
            💪 <Text className="font-bold">Keep it up!</Text>
            {
              '\n' /* Explicitly escape newline for clarity if needed, though usually not required in JS strings */
            }
            You're building a great learning habit.
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
