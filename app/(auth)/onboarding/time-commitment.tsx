/**
 * Onboarding - Time Commitment Screen
 *
 * Question 3: How much time can you commit daily?
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useOnboarding } from '@/hooks/useOnboarding';

const TIME_OPTIONS = [
  {
    id: 10,
    emoji: '⚡',
    title: '10 minutes',
    description: 'Quick daily practice',
    gradient: colors.gradients.success,
  },
  {
    id: 20,
    emoji: '🎯',
    title: '20 minutes',
    description: 'Balanced learning (Recommended)',
    gradient: colors.gradients.primary,
    recommended: true,
  },
  {
    id: 30,
    emoji: '🚀',
    title: '30 minutes',
    description: 'Intensive learning',
    gradient: colors.gradients.secondary,
  },
  {
    id: 45,
    emoji: '🔥',
    title: '45+ minutes',
    description: 'Full immersion',
    gradient: ['#F59E0B', '#FBBF24'],
  },
];

export default function TimeCommitmentScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedTime, setSelectedTime] = useState<number | null>(
    onboardingData.daily_time_minutes || null
  );

  const handleTimeSelect = async (timeId: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTime(timeId);
  };

  const handleContinue = () => {
    if (!selectedTime) return;

    updateOnboardingData({ daily_time_minutes: selectedTime });
    router.push('/(auth)/onboarding/motivation');
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
            {[1, 2, 3, 4, 5].map((step) => (
              <View
                key={step}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: borderRadius.full,
                  backgroundColor:
                    step <= 3 ? colors.gradients.primary[0] : 'rgba(255, 255, 255, 0.2)',
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
            Step 3 of 5
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
            Daily commitment?
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Consistency is key. Choose what works for you.
          </Text>
        </Animated.View>

        {/* Time Options */}
        <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
          {TIME_OPTIONS.map((timeOption, index) => (
            <Animated.View
              key={timeOption.id}
              entering={FadeInDown.duration(600).delay(300 + index * 100).springify()}
            >
              <TouchableOpacity
                onPress={() => handleTimeSelect(timeOption.id)}
                activeOpacity={0.9}
                style={{
                  borderRadius: borderRadius.lg,
                  borderWidth: 2,
                  borderColor:
                    selectedTime === timeOption.id
                      ? timeOption.gradient[0]
                      : 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {timeOption.recommended && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 10,
                      backgroundColor: colors.gradients.primary[0],
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      borderRadius: borderRadius.full,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.primary,
                      }}
                    >
                      ⭐ Recommended
                    </Text>
                  </View>
                )}
                <LinearGradient
                  colors={
                    selectedTime === timeOption.id
                      ? timeOption.gradient
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
                    <Text style={{ fontSize: 32 }}>{timeOption.emoji}</Text>
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
                      {timeOption.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                      }}
                    >
                      {timeOption.description}
                    </Text>
                  </View>
                  {selectedTime === timeOption.id && (
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
                      <Text style={{ color: timeOption.gradient[0], fontSize: 18 }}>✓</Text>
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
        <Animated.View entering={FadeInDown.duration(600).delay(700).springify()}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedTime}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={selectedTime ? colors.gradients.primary : ['#4B5563', '#374151']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.xl,
                shadowColor: selectedTime ? colors.glow.primary : 'transparent',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: selectedTime ? 8 : 0,
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
