import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_LEARNING_PLAN } from '@/lib/db/mock-data';
import {
  SingleVocabCard,
  ComparisonCard,
  ImageMultipleChoiceCard,
  AudioToImageCard,
  TextInputCard,
  SpeakingCard,
} from '@/components/cards';

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const lesson = MOCK_LEARNING_PLAN.lessons.find((l) => l.id === id);

  if (!lesson) {
    return (
      <SafeAreaView>
        <Text>Lesson not found!</Text>
      </SafeAreaView>
    );
  }

  const renderActivity = (activity: any) => {
    switch (activity.type) {
      case 'SingleVocabCard':
        return <SingleVocabCard {...activity.data} />;
      case 'ComparisonCard':
        return <ComparisonCard {...activity.data} />;
      case 'ImageMultipleChoiceCard':
        return <ImageMultipleChoiceCard {...activity.data} />;
      case 'AudioToImageCard':
        return <AudioToImageCard {...activity.data} />;
      case 'TextInputCard':
        return <TextInputCard {...activity.data} />;
      case 'SpeakingCard':
        return <SpeakingCard {...activity.data} />;
      default:
        return <Text>Unknown activity type: {activity.type}</Text>;
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="p-6">
          <Text className="text-2xl font-bold mb-2">{lesson.title}</Text>
          <Text className="text-gray-600 mb-8">{lesson.description}</Text>
          {lesson.activities.map((activity) => (
            <View key={activity.id} className="mb-4">
              {renderActivity(activity)}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
