import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">
        Profile
      </Text>
      <Text className="text-gray-600 mt-4">
        User settings & progress
      </Text>
    </View>
  );
}
