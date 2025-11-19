import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

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
        Phase 0: Setup Complete ✅
      </Text>
    </View>
  );
}
