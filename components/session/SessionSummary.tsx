/**
 * Session Summary Component
 *
 * Displays summary statistics after a flashcard review session.
 * Shows cards reviewed, points earned, accuracy, and encouragement.
 */

import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SessionSummary as SessionSummaryType } from '@/types/flashcard';

interface SessionSummaryProps {
  summary: SessionSummaryType;
  onContinue: () => void;
}

export default function SessionSummary({ summary, onContinue }: SessionSummaryProps) {
  const {
    flashcards_reviewed,
    points_earned,
    time_spent_seconds,
    accuracy,
    cards_by_quality,
  } = summary;

  // Format time
  const minutes = Math.floor(time_spent_seconds / 60);
  const seconds = time_spent_seconds % 60;
  const timeString =
    minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Get encouragement message based on accuracy
  const getEncouragementMessage = (acc: number): string => {
    if (acc >= 90) return "Outstanding! 🌟 You're crushing it!";
    if (acc >= 75) return "Great work! 🎉 Keep it up!";
    if (acc >= 60) return "Good job! 💪 You're improving!";
    if (acc >= 40) return "Nice effort! 📚 Practice makes perfect!";
    return "Keep going! 🚀 Every attempt counts!";
  };

  // Get quality color
  const getQualityColor = (
    quality: 'forgot' | 'hard' | 'good' | 'easy' | 'perfect'
  ): string => {
    switch (quality) {
      case 'forgot':
        return 'bg-red-100 text-red-700';
      case 'hard':
        return 'bg-orange-100 text-orange-700';
      case 'good':
        return 'bg-yellow-100 text-yellow-700';
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'perfect':
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <View className="flex-1 bg-gray-50 px-6 py-8">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        className="items-center mb-8"
      >
        <Text className="text-6xl mb-4">🎉</Text>
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Session Complete!
        </Text>
        <Text className="text-lg text-gray-600 text-center">
          {getEncouragementMessage(accuracy)}
        </Text>
      </Animated.View>

      {/* Main Stats Cards */}
      <View className="gap-4 mb-6">
        {/* Cards Reviewed */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100).springify()}
          className="bg-white p-6 rounded-2xl shadow-sm"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-600 mb-1">
                Flashcards Reviewed
              </Text>
              <Text className="text-4xl font-bold text-gray-900">
                {flashcards_reviewed}
              </Text>
            </View>
            <Text className="text-5xl">📚</Text>
          </View>
        </Animated.View>

        {/* Points Earned */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200).springify()}
          className="bg-white p-6 rounded-2xl shadow-sm"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-600 mb-1">Points Earned</Text>
              <Text className="text-4xl font-bold text-primary">
                +{points_earned}
              </Text>
            </View>
            <Text className="text-5xl">⭐</Text>
          </View>
        </Animated.View>

        {/* Accuracy & Time */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300).springify()}
          className="bg-white p-6 rounded-2xl shadow-sm"
        >
          <View className="flex-row justify-between">
            {/* Accuracy */}
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-1">Accuracy</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {accuracy}%
              </Text>
            </View>

            {/* Divider */}
            <View className="w-px bg-gray-200 mx-4" />

            {/* Time */}
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-1">Time</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {timeString}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Quality Breakdown */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(400).springify()}
        className="bg-white p-6 rounded-2xl shadow-sm mb-8"
      >
        <Text className="text-base font-semibold text-gray-900 mb-4">
          Review Breakdown
        </Text>

        <View className="gap-3">
          {/* Only show qualities that have counts > 0 */}
          {cards_by_quality.forgot > 0 && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className={`px-3 py-1 rounded-full ${getQualityColor('forgot')}`}
                >
                  <Text className="text-sm font-medium">Forgot</Text>
                </View>
              </View>
              <Text className="text-lg font-semibold text-gray-700">
                {cards_by_quality.forgot}
              </Text>
            </View>
          )}

          {cards_by_quality.hard > 0 && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className={`px-3 py-1 rounded-full ${getQualityColor('hard')}`}
                >
                  <Text className="text-sm font-medium">Hard</Text>
                </View>
              </View>
              <Text className="text-lg font-semibold text-gray-700">
                {cards_by_quality.hard}
              </Text>
            </View>
          )}

          {cards_by_quality.good > 0 && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className={`px-3 py-1 rounded-full ${getQualityColor('good')}`}
                >
                  <Text className="text-sm font-medium">Good</Text>
                </View>
              </View>
              <Text className="text-lg font-semibold text-gray-700">
                {cards_by_quality.good}
              </Text>
            </View>
          )}

          {cards_by_quality.easy > 0 && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className={`px-3 py-1 rounded-full ${getQualityColor('easy')}`}
                >
                  <Text className="text-sm font-medium">Easy</Text>
                </View>
              </View>
              <Text className="text-lg font-semibold text-gray-700">
                {cards_by_quality.easy}
              </Text>
            </View>
          )}

          {cards_by_quality.perfect > 0 && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className={`px-3 py-1 rounded-full ${getQualityColor('perfect')}`}
                >
                  <Text className="text-sm font-medium">Perfect</Text>
                </View>
              </View>
              <Text className="text-lg font-semibold text-gray-700">
                {cards_by_quality.perfect}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Continue Button */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(500).springify()}
        className="mt-auto"
      >
        <TouchableOpacity
          className="bg-primary py-4 rounded-xl items-center shadow-lg active:bg-blue-600"
          onPress={onContinue}
        >
          <Text className="text-white text-lg font-bold">Continue</Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-gray-500 mt-4">
          Keep up the great work! 💪
        </Text>
      </Animated.View>
    </View>
  );
}
