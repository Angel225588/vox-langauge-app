import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PracticeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-4xl mb-4">📚</Text>
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        Practice
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        Review flashcards with spaced repetition
      </Text>

      {/* Start Flashcard Session Button */}
      <TouchableOpacity
        className="bg-primary px-8 py-4 rounded-xl shadow-lg active:bg-blue-600 mb-4"
        onPress={() => router.push('/flashcard/session')}
      >
        <Text className="text-white text-lg font-bold">
          Start Review Session
        </Text>
      </TouchableOpacity>

      <Text className="text-sm text-gray-500 text-center">
        Review flashcards using the 3-card cycle:{'\n'}
        Learning → Listening → Speaking
      </Text>
    </View>
  );
}
