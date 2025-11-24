/**
 * Onboarding - Level Assessment Screen
 *
 * Question 2: What's your English level?
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useOnboarding } from '@/hooks/useOnboarding';

type Level = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';

const PROFICIENCY_LEVELS = [
  {
    id: 'beginner' as Level,
    emoji: '🌱',
    title: 'Beginner',
    description: "I'm just starting",
    gradient: ['#10B981', '#34D399'],
  },
  {
    id: 'elementary' as Level,
    emoji: '🌿',
    title: 'Elementary',
    description: 'I know basics',
    gradient: ['#06D6A0', '#4ECDC4'],
  },
  {
    id: 'intermediate' as Level,
    emoji: '🌳',
    title: 'Intermediate',
    description: 'I can hold conversations',
    gradient: colors.gradients.primary,
  },
  {
    id: 'upper_intermediate' as Level,
    emoji: '🌲',
    title: 'Upper Intermediate',
    description: "I'm fluent but want to improve",
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    id: 'advanced' as Level,
    emoji: '🏔️',
    title: 'Advanced',
    description: "I'm nearly native",
    gradient: ['#F59E0B', '#FBBF24'],
  },
];

export default function LevelAssessmentScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(
    onboardingData.proficiency_level as Level || null
  );

  const handleLevelSelect = async (levelId: Level) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLevel(levelId);
  };

  const handleContinue = () => {
    if (!selectedLevel) return;

    updateOnboardingData({ proficiency_level: selectedLevel });
    router.push('/(auth)/onboarding/time-commitment');
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
                  backgroundColor: step <= 2 ? colors.gradients.primary[0] : 'rgba(255, 255, 255, 0.2)',
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
            Step 2 of 4
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
            What's your level?
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Choose your current English proficiency
          </Text>
        </Animated.View>

        {/* Level Options */}
        <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
          {PROFICIENCY_LEVELS.map((level, index) => (
            <Animated.View
              key={level.id}
              entering={FadeInDown.duration(600).delay(300 + index * 100).springify()}
            >
              <TouchableOpacity
                onPress={() => handleLevelSelect(level.id)}
                activeOpacity={0.9}
                style={{
                  borderRadius: borderRadius.lg,
                  borderWidth: 2,
                  borderColor:
                    selectedLevel === level.id
                      ? level.gradient[0]
                      : 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={
                    selectedLevel === level.id
                      ? level.gradient
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
                    <Text style={{ fontSize: 32 }}>{level.emoji}</Text>
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
                      {level.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                      }}
                    >
                      {level.description}
                    </Text>
                  </View>
                  {selectedLevel === level.id && (
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
                      <Text style={{ color: level.gradient[0], fontSize: 18 }}>✓</Text>
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
            disabled={!selectedLevel}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={selectedLevel ? colors.gradients.primary : ['#4B5563', '#374151']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.xl,
                shadowColor: selectedLevel ? colors.glow.primary : 'transparent',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: selectedLevel ? 8 : 0,
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
