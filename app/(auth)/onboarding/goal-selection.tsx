/**
 * Onboarding - Goal Selection Screen
 *
 * Question 1: What's your learning goal?
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useOnboarding } from '@/hooks/useOnboarding';

const LEARNING_GOALS = [
  {
    id: 'job_interview',
    emoji: '💼',
    title: 'Job Interviews',
    description: 'Professional English for interviews and workplace',
    gradient: colors.gradients.primary,
  },
  {
    id: 'travel',
    emoji: '✈️',
    title: 'Travel',
    description: 'Essential phrases for tourism and adventure',
    gradient: colors.gradients.secondary,
  },
  {
    id: 'business',
    emoji: '📊',
    title: 'Business',
    description: 'Meetings, presentations, and negotiations',
    gradient: ['#F59E0B', '#FBBF24'],
  },
  {
    id: 'daily_conversation',
    emoji: '💬',
    title: 'Daily Conversation',
    description: 'Everyday situations and casual chat',
    gradient: ['#10B981', '#34D399'],
  },
  {
    id: 'academic',
    emoji: '📚',
    title: 'Academic',
    description: 'University, research, and formal writing',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    id: 'making_friends',
    emoji: '👋',
    title: 'Making Friends',
    description: 'Social interactions and building connections',
    gradient: ['#EC4899', '#F472B6'],
  },
];

export default function GoalSelectionScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(
    onboardingData.learning_goal || null
  );

  const handleGoalSelect = async (goalId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoal(goalId);
  };

  const handleContinue = () => {
    if (!selectedGoal) return;

    updateOnboardingData({ learning_goal: selectedGoal });
    router.push('/(auth)/onboarding/level-assessment');
  };

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={{ flex: 1 }}
    >
      {/* Fixed Header: Back button + Progress */}
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing['2xl'],
          paddingBottom: spacing.lg,
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: spacing['2xl'],
            left: spacing.xl,
            width: 40,
            height: 40,
            borderRadius: borderRadius.full,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20, color: colors.text.primary }}>←</Text>
        </TouchableOpacity>

        {/* Progress Indicator */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: borderRadius.full,
                  backgroundColor: step === 1 ? colors.gradients.primary[0] : 'rgba(255, 255, 255, 0.2)',
                }}
              />
            ))}
          </View>
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Step 1 of 4
          </Text>
        </Animated.View>
      </View>

      {/* Scrollable Content - 70% of screen */}
      <ScrollView
        style={{ flex: 0.7 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200).springify()}
          style={{ marginBottom: spacing['2xl'] }}
        >
          <Text
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: spacing.md,
            }}
          >
            What's your goal?
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Choose the scenario that matters most to you
          </Text>
        </Animated.View>

        {/* Goal Options */}
        <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
          {LEARNING_GOALS.map((goal, index) => (
            <Animated.View
              key={goal.id}
              entering={FadeInDown.duration(600).delay(300 + index * 100).springify()}
            >
              <TouchableOpacity
                onPress={() => handleGoalSelect(goal.id)}
                activeOpacity={0.9}
                style={{
                  borderRadius: borderRadius.lg,
                  borderWidth: 2,
                  borderColor:
                    selectedGoal === goal.id
                      ? goal.gradient[0]
                      : 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={
                    selectedGoal === goal.id
                      ? goal.gradient
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.lg,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: borderRadius.md,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.md,
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>{goal.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        marginBottom: 4,
                      }}
                    >
                      {goal.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                      }}
                    >
                      {goal.description}
                    </Text>
                  </View>
                  {selectedGoal === goal.id && (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.text.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: goal.gradient[0], fontSize: 18 }}>✓</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

      </ScrollView>

      {/* Fixed Bottom Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing['2xl'],
          paddingTop: spacing.lg,
          backgroundColor: colors.background.primary,
        }}
      >
        <Animated.View entering={FadeInDown.duration(600).delay(900).springify()}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedGoal}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={selectedGoal ? colors.gradients.primary : ['#4B5563', '#374151']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.xl,
                shadowColor: selectedGoal ? colors.glow.primary : 'transparent',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: selectedGoal ? 8 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  textAlign: 'center',
                }}
              >
                Continue
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
