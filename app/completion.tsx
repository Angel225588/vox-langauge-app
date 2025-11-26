/**
 * Completion Screen
 *
 * Duolingo-style completion screen showing XP, time, and accuracy
 * Displays after completing a mini-lesson
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

export default function CompletionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    miniLessonId: string;
    xp: string;
    time: string;
    accuracy: string;
    cardsCompleted: string;
    cardsTotal: string;
  }>();

  const xp = parseInt(params.xp || '0');
  const time = parseInt(params.time || '0');
  const accuracy = parseInt(params.accuracy || '0');
  const cardsCompleted = parseInt(params.cardsCompleted || '0');
  const cardsTotal = parseInt(params.cardsTotal || '0');

  // Format time as M:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine stars based on accuracy
  const getStars = () => {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  };

  const stars = getStars();
  const isPerfect = accuracy === 100;

  const handleContinue = () => {
    // Go back to mini-lesson list (2 screens back)
    router.back();
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
      >
        {/* Celebration Icon */}
        <Animated.View entering={ZoomIn.duration(600).delay(200).springify()}>
          <Text style={{ fontSize: 120, marginBottom: spacing.xl }}>
            {isPerfect ? '<�' : stars === 3 ? '<' : stars === 2 ? 'P' : '=M'}
          </Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.duration(500).delay(400)}
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing.md,
            textAlign: 'center',
          }}
        >
          {isPerfect ? 'Perfect!' : 'Great Job!'}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.duration(500).delay(500)}
          style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.secondary,
            marginBottom: spacing['2xl'],
            textAlign: 'center',
          }}
        >
          {isPerfect
            ? 'You got everything right!'
            : 'Keep up the great work!'}
        </Animated.Text>

        {/* Stats Cards */}
        <View style={{ width: '100%', marginBottom: spacing['2xl'] }}>
          {/* XP Card */}
          <Animated.View entering={FadeInDown.duration(500).delay(600)}>
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.lg,
                borderRadius: borderRadius.xl,
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginRight: spacing.md }}>P</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                  }}
                >
                  Total XP
                </Text>
              </View>
              <Text
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                }}
              >
                +{xp}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Time Card */}
          <Animated.View entering={FadeInDown.duration(500).delay(700)}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.lg,
                borderRadius: borderRadius.xl,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginRight: spacing.md }}>�</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                  }}
                >
                  Time
                </Text>
              </View>
              <Text
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                }}
              >
                {formatTime(time)}
              </Text>
            </View>
          </Animated.View>

          {/* Accuracy Card */}
          <Animated.View entering={FadeInDown.duration(500).delay(800)}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.lg,
                borderRadius: borderRadius.xl,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginRight: spacing.md }}>🎯</Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                  }}
                >
                  Accuracy
                </Text>
              </View>
              <Text
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                }}
              >
                {accuracy}%
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Stars Display */}
        <Animated.View
          entering={FadeIn.duration(600).delay(900)}
          style={{
            flexDirection: 'row',
            marginBottom: spacing['2xl'],
          }}
        >
          {[1, 2, 3].map((star) => (
            <Text key={star} style={{ fontSize: 48, marginHorizontal: spacing.sm }}>
              {star <= stars ? 'P' : ''}
            </Text>
          ))}
        </Animated.View>

        {/* Continue Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(1000)} style={{ width: '100%' }}>
          <TouchableOpacity
            onPress={handleContinue}
            style={{
              backgroundColor: colors.accent.success,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing['2xl'],
              borderRadius: borderRadius.xl,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}
