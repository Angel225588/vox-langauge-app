/**
 * Onboarding - Scenarios Selection Screen
 *
 * Question 4: Which specific scenarios matter most? (Multi-select)
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useOnboarding } from '@/hooks/useOnboarding';
import { generatePersonalizedStaircase } from '@/lib/gemini/staircase-generator';

// Scenario options based on learning goal
const SCENARIO_MAP: Record<string, Array<{ id: string; emoji: string; title: string }>> = {
  job_interview: [
    { id: 'interview_introduction', emoji: '👋', title: 'Self Introduction' },
    { id: 'interview_experience', emoji: '💼', title: 'Discussing Experience' },
    { id: 'interview_strengths', emoji: '💪', title: 'Strengths & Weaknesses' },
    { id: 'interview_salary', emoji: '💰', title: 'Salary Negotiation' },
    { id: 'interview_questions', emoji: '❓', title: 'Asking Questions' },
  ],
  travel: [
    { id: 'travel_airport', emoji: '✈️', title: 'At the Airport' },
    { id: 'travel_hotel', emoji: '🏨', title: 'Hotel Check-in' },
    { id: 'travel_restaurant', emoji: '🍽️', title: 'Ordering Food' },
    { id: 'travel_directions', emoji: '🗺️', title: 'Asking Directions' },
    { id: 'travel_shopping', emoji: '🛍️', title: 'Shopping' },
    { id: 'travel_emergency', emoji: '🚨', title: 'Emergencies' },
  ],
  business: [
    { id: 'business_meetings', emoji: '👔', title: 'Meetings' },
    { id: 'business_presentations', emoji: '📊', title: 'Presentations' },
    { id: 'business_negotiations', emoji: '🤝', title: 'Negotiations' },
    { id: 'business_emails', emoji: '📧', title: 'Email Writing' },
    { id: 'business_calls', emoji: '📞', title: 'Phone Calls' },
  ],
  daily_conversation: [
    { id: 'daily_small_talk', emoji: '💬', title: 'Small Talk' },
    { id: 'daily_weather', emoji: '☀️', title: 'Weather' },
    { id: 'daily_hobbies', emoji: '🎨', title: 'Hobbies' },
    { id: 'daily_family', emoji: '👨‍👩‍👧', title: 'Family' },
    { id: 'daily_compliments', emoji: '👍', title: 'Compliments' },
  ],
  academic: [
    { id: 'academic_lectures', emoji: '📚', title: 'Understanding Lectures' },
    { id: 'academic_discussions', emoji: '💡', title: 'Class Discussions' },
    { id: 'academic_essays', emoji: '✍️', title: 'Essay Writing' },
    { id: 'academic_research', emoji: '🔬', title: 'Research Vocabulary' },
    { id: 'academic_presentations', emoji: '🎓', title: 'Academic Presentations' },
  ],
  making_friends: [
    { id: 'friends_introduction', emoji: '😊', title: 'Introductions' },
    { id: 'friends_invitations', emoji: '🎉', title: 'Making Invitations' },
    { id: 'friends_interests', emoji: '⚽', title: 'Shared Interests' },
    { id: 'friends_opinions', emoji: '💭', title: 'Sharing Opinions' },
    { id: 'friends_humor', emoji: '😂', title: 'Jokes & Humor' },
  ],
};

export default function ScenariosScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData, resetOnboardingData } = useOnboarding();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    onboardingData.scenarios || []
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const scenarios = SCENARIO_MAP[onboardingData.learning_goal || 'daily_conversation'] || [];

  const handleScenarioToggle = async (scenarioId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedScenarios((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const handleFinish = async () => {
    if (selectedScenarios.length === 0) return;

    setIsGenerating(true);
    updateOnboardingData({ scenarios: selectedScenarios });

    try {
      // Generate personalized staircase using Gemini
      const staircase = await generatePersonalizedStaircase({
        learning_goal: onboardingData.learning_goal!,
        proficiency_level: onboardingData.proficiency_level!,
        daily_time_minutes: onboardingData.daily_time_minutes!,
        scenarios: selectedScenarios,
      });

      console.log('✅ Staircase generated:', staircase);

      // TODO: Save staircase to database
      // For now, navigate to home screen
      resetOnboardingData();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('❌ Failed to generate staircase:', error);
      setIsGenerating(false);
      // Show error to user
      alert('Failed to generate your learning path. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing['2xl'],
          paddingBottom: spacing['4xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.gradients.primary[0],
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
            Step 4 of 4
          </Text>
        </Animated.View>

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
            Choose scenarios
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Select what you want to practice (pick at least 1)
          </Text>
        </Animated.View>

        {/* Scenario Options (Multi-select) */}
        <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
          {scenarios.map((scenario, index) => {
            const isSelected = selectedScenarios.includes(scenario.id);

            return (
              <Animated.View
                key={scenario.id}
                entering={FadeInDown.duration(600).delay(300 + index * 80).springify()}
              >
                <TouchableOpacity
                  onPress={() => handleScenarioToggle(scenario.id)}
                  activeOpacity={0.9}
                  style={{
                    borderRadius: borderRadius.lg,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? colors.gradients.primary[0]
                      : 'rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? colors.gradients.primary
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
                        width: 48,
                        height: 48,
                        borderRadius: borderRadius.md,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: spacing.md,
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{scenario.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                        }}
                      >
                        {scenario.title}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: borderRadius.full,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.text.primary : 'rgba(255, 255, 255, 0.3)',
                        backgroundColor: isSelected ? colors.text.primary : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && (
                        <Text style={{ color: colors.gradients.primary[0], fontSize: 14 }}>✓</Text>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Finish Button */}
        <Animated.View entering={FadeInDown.duration(600).delay(800).springify()}>
          <TouchableOpacity
            onPress={handleFinish}
            disabled={selectedScenarios.length === 0 || isGenerating}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                selectedScenarios.length > 0 && !isGenerating
                  ? colors.gradients.primary
                  : ['#4B5563', '#374151']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.xl,
                shadowColor:
                  selectedScenarios.length > 0 && !isGenerating
                    ? colors.glow.primary
                    : 'transparent',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: selectedScenarios.length > 0 && !isGenerating ? 8 : 0,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isGenerating && (
                <ActivityIndicator
                  size="small"
                  color={colors.text.primary}
                  style={{ marginRight: spacing.sm }}
                />
              )}
              <Text
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  textAlign: 'center',
                }}
              >
                {isGenerating ? 'Generating your path...' : 'Finish & Create My Path'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {!isGenerating && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md }}
              activeOpacity={0.6}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}
