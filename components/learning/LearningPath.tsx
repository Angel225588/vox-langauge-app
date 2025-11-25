import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MOCK_LEARNING_PLAN } from '@/lib/db/mock-data';
import { useRouter } from 'expo-router';

export function LearningPath() {
  const router = useRouter();
  const { lessons } = MOCK_LEARNING_PLAN;

  const handlePressLesson = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`);
  };

  return (
    <View>
      {lessons.map((lesson, index) => (
        <TouchableOpacity
          key={lesson.id}
          onPress={() => handlePressLesson(lesson.id)}
          className={`p-6 rounded-2xl mb-4 ${
            index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'
          }`}
        >
          <Text className="text-lg font-bold">
            {lesson.order}. {lesson.title}
          </Text>
          <Text className="text-gray-600">{lesson.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
