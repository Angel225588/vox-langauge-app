import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/onboarding/language-selection');
  };

  const handleSkip = () => {
    // TODO: Save progress to continue later
    router.replace('/(tabs)/home');
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-primary/10 to-white">
      <View className="flex-1 px-6 pt-20 pb-8 justify-between">
        {/* Top Section - Logo & Title */}
        <Animated.View entering={FadeIn.duration(800)} className="items-center">
          <Text className="text-6xl mb-4">🗣️</Text>
          <Text className="text-4xl font-bold text-gray-900 mb-3 text-center">
            Welcome to Vox!
          </Text>
          <Text className="text-lg text-gray-600 text-center px-4">
            Learn languages through practice, not perfection
          </Text>
        </Animated.View>

        {/* Middle Section - Value Props */}
        <View className="space-y-6">
          <Animated.View
            entering={FadeInDown.duration(600).delay(200).springify()}
            className="flex-row items-start"
          >
            <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mr-4">
              <Text className="text-2xl">🎯</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                Jump Right In
              </Text>
              <Text className="text-base text-gray-600">
                Start practicing immediately. No boring lessons—just real conversations.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(400).springify()}
            className="flex-row items-start"
          >
            <View className="bg-success/10 w-12 h-12 rounded-full items-center justify-center mr-4">
              <Text className="text-2xl">🔥</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                Practice Makes Progress
              </Text>
              <Text className="text-base text-gray-600">
                Earn points for every attempt. We reward effort, not perfection.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(600).springify()}
            className="flex-row items-start"
          >
            <View className="bg-warning/10 w-12 h-12 rounded-full items-center justify-center mr-4">
              <Text className="text-2xl">📱</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                Learn Anywhere
              </Text>
              <Text className="text-base text-gray-600">
                Works offline. Practice on the bus, subway, or anywhere.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(800).springify()}
            className="flex-row items-start"
          >
            <View className="bg-secondary/10 w-12 h-12 rounded-full items-center justify-center mr-4">
              <Text className="text-2xl">⚡</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                See Results Fast
              </Text>
              <Text className="text-base text-gray-600">
                Build confidence from day one with bite-sized, focused lessons.
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Section - CTA Buttons */}
        <View>
          <Animated.View entering={FadeInUp.duration(600).delay(1000).springify()}>
            <TouchableOpacity
              className="w-full py-5 rounded-2xl bg-primary items-center justify-center mb-4 shadow-lg"
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-bold">
                Let's Get Started! 🚀
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(600).delay(1100).springify()}
            className="flex-row justify-center"
          >
            <TouchableOpacity onPress={handleSkip} className="py-3">
              <Text className="text-gray-500 text-base">
                Skip for now
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(600).delay(1200).springify()}
            className="mt-4"
          >
            <Text className="text-center text-gray-400 text-xs">
              Takes only 5-10 minutes to personalize your experience
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
