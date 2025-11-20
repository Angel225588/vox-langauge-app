import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const router = useRouter();
  const { user, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;

    // If user is authenticated, go to home
    if (user) {
      router.replace('/(tabs)/home');
    }
  }, [user, initialized]);

  if (!initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Only show welcome screen if not authenticated
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-4xl font-bold text-primary mb-4">
          Vox Language
        </Text>

        <Text className="text-xl text-gray-600 text-center mb-8">
          Learn through practice, not perfection
        </Text>

        <TouchableOpacity
          className="bg-primary px-8 py-4 rounded-lg"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white text-lg font-semibold">
            Get Started
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-500 mt-6 text-center text-sm">
          Phase 1: Authentication In Progress 🚀
        </Text>
      </View>
    );
  }

  return null;
}
