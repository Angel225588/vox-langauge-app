/**
 * Onboarding - Motivation & Deep Why Screen
 *
 * Question 5: Time to be honest - understanding user's deep motivations
 * This helps Gemini create a truly personalized learning path
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useOnboarding } from '@/hooks/useOnboarding';

interface MotivationAnswers {
  why: string;
  fear: string;
  stakes: string;
  timeline: string;
}

export default function MotivationScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const [answers, setAnswers] = useState<MotivationAnswers>({
    why: onboardingData.motivation_data?.why || '',
    fear: onboardingData.motivation_data?.fear || '',
    stakes: onboardingData.motivation_data?.stakes || '',
    timeline: onboardingData.motivation_data?.timeline || '',
  });

  const handleAnswerChange = (field: keyof MotivationAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const isValid = () => {
    // At least 10 characters for each of the 3 required questions
    return (
      answers.why.trim().length >= 10 &&
      answers.fear.trim().length >= 10 &&
      answers.stakes.trim().length >= 10
    );
  };

  const handleContinue = () => {
    if (!isValid()) return;

    updateOnboardingData({
      motivation_data: {
        why: answers.why.trim(),
        fear: answers.fear.trim(),
        stakes: answers.stakes.trim(),
        timeline: answers.timeline.trim() || 'No specific timeline',
      }
    });
    router.push('/(auth)/onboarding/scenarios');
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Set generic answers so Gemini has something to work with
    updateOnboardingData({
      motivation_data: {
        why: 'General interest in improving my English',
        fear: 'No specific fears',
        stakes: 'Personal development',
        timeline: 'No specific timeline',
      }
    });
    router.push('/(auth)/onboarding/scenarios');
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
                  backgroundColor: step <= 4 ? colors.gradients.primary[0] : 'rgba(255, 255, 255, 0.2)',
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
            Step 4 of 5
          </Text>
        </Animated.View>
      </View>

      {/* Scrollable Content - 70% of screen */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 0.7 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200).springify()}
            style={{ marginBottom: spacing.xl, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>✨</Text>
            <Text
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                textAlign: 'center',
                marginBottom: spacing.sm,
              }}
            >
              Your Why Matters
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              Your answers help us create a personalized roadmap designed specifically for YOU
            </Text>
          </Animated.View>

          {/* Privacy Note */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: spacing.md,
              borderRadius: borderRadius.md,
              marginBottom: spacing.xl,
              borderLeftWidth: 3,
              borderLeftColor: colors.gradients.secondary[0],
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                lineHeight: 20,
              }}
            >
              🔒 <Text style={{ fontWeight: typography.fontWeight.semibold }}>Private & secure:</Text> Your answers are only used to personalize your learning experience. You can edit them anytime in your profile.
            </Text>
          </Animated.View>

          {/* Question 1: Why */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(400).springify()}
            style={{ marginBottom: spacing.xl }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}
            >
              Why do you really want to learn English? *
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing.md,
              }}
            >
              Be honest - this helps us understand what drives you
            </Text>
            <TextInput
              value={answers.why}
              onChangeText={(text) => handleAnswerChange('why', text)}
              placeholder="e.g., I want to confidently interview for jobs abroad and connect with international colleagues..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              multiline
              numberOfLines={4}
              maxLength={500}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 2,
                borderColor: answers.why.length >= 10 ? colors.gradients.success[0] : 'rgba(255, 255, 255, 0.1)',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.fontSize.base,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: answers.why.length >= 10 ? colors.gradients.success[0] : colors.text.secondary,
                marginTop: spacing.xs,
                textAlign: 'right',
              }}
            >
              {answers.why.length}/500 {answers.why.length >= 10 ? '✓' : '(min 10 chars)'}
            </Text>
          </Animated.View>

          {/* Question 2: Fear */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(500).springify()}
            style={{ marginBottom: spacing.xl }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}
            >
              What's your biggest fear or frustration? *
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing.md,
              }}
            >
              What holds you back or worries you most?
            </Text>
            <TextInput
              value={answers.fear}
              onChangeText={(text) => handleAnswerChange('fear', text)}
              placeholder="e.g., I'm afraid I'll freeze up when speaking and sound stupid in front of others..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              multiline
              numberOfLines={4}
              maxLength={500}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 2,
                borderColor: answers.fear.length >= 10 ? colors.gradients.success[0] : 'rgba(255, 255, 255, 0.1)',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.fontSize.base,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: answers.fear.length >= 10 ? colors.gradients.success[0] : colors.text.secondary,
                marginTop: spacing.xs,
                textAlign: 'right',
              }}
            >
              {answers.fear.length}/500 {answers.fear.length >= 10 ? '✓' : '(min 10 chars)'}
            </Text>
          </Animated.View>

          {/* Question 3: Stakes */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(600).springify()}
            style={{ marginBottom: spacing.xl }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}
            >
              What happens if you don't reach your goal? *
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing.md,
              }}
            >
              What's at stake for you?
            </Text>
            <TextInput
              value={answers.stakes}
              onChangeText={(text) => handleAnswerChange('stakes', text)}
              placeholder="e.g., I'll miss out on better job opportunities and stay stuck in my current position..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              multiline
              numberOfLines={4}
              maxLength={500}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 2,
                borderColor: answers.stakes.length >= 10 ? colors.gradients.success[0] : 'rgba(255, 255, 255, 0.1)',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.fontSize.base,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: answers.stakes.length >= 10 ? colors.gradients.success[0] : colors.text.secondary,
                marginTop: spacing.xs,
                textAlign: 'right',
              }}
            >
              {answers.stakes.length}/500 {answers.stakes.length >= 10 ? '✓' : '(min 10 chars)'}
            </Text>
          </Animated.View>

          {/* Question 4: Timeline (Optional) */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(700).springify()}
            style={{ marginBottom: spacing['2xl'] }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}
            >
              When do you need this by? (Optional)
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing.md,
              }}
            >
              Any deadline or timeline you're working towards?
            </Text>
            <TextInput
              value={answers.timeline}
              onChangeText={(text) => handleAnswerChange('timeline', text)}
              placeholder="e.g., 3 months, by June, no rush..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              maxLength={100}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                color: colors.text.primary,
                fontSize: typography.fontSize.base,
                minHeight: 50,
              }}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Buttons */}
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
        <Animated.View entering={FadeInDown.duration(600).delay(800).springify()}>
          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isValid()}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isValid() ? colors.gradients.primary : ['#4B5563', '#374151']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.xl,
                shadowColor: isValid() ? colors.glow.primary : 'transparent',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: isValid() ? 8 : 0,
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

          {/* Skip Button */}
          <TouchableOpacity
            onPress={handleSkip}
            style={{
              paddingVertical: spacing.md,
              alignItems: 'center',
              marginTop: spacing.md,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: borderRadius.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              Skip for now (generic path)
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
