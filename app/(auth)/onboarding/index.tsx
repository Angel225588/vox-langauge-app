// @ts-nocheck - Temporary: LinearGradient and spacing type issues
/**
 * Onboarding Welcome Screen
 *
 * First screen of the onboarding flow - immersive intro
 */

import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

const { height } = Dimensions.get('window');

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary, '#1A1F3A']}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing['2xl'] }}>
        {/* Logo/Title */}
        <Animated.View
          entering={FadeIn.duration(800).delay(200)}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 72, marginBottom: spacing.lg }}>🗣️</Text>
          <Text
            style={{
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: spacing.md,
            }}
          >
            Vox Language
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            Your personalized journey to fluency starts here
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400).springify()}
          style={{ marginBottom: spacing['2xl'] }}
        >
          <View style={{ gap: spacing.lg }}>
            <FeatureItem
              icon="🎯"
              title="Personalized Learning"
              description="Tailored to your goals and scenarios"
              delay={500}
            />
            <FeatureItem
              icon="🎮"
              title="Immersive Practice"
              description="Interactive cards and games"
              delay={600}
            />
            <FeatureItem
              icon="🤖"
              title="AI-Powered Feedback"
              description="Smart recommendations from Gemini"
              delay={700}
            />
            <FeatureItem
              icon="👥"
              title="Practice with Others"
              description="Weekly conversations with learners"
              delay={800}
            />
          </View>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View entering={FadeInDown.duration(600).delay(900).springify()}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/onboarding/goal-selection')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.xl,
                shadowColor: colors.glow.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: 8,
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
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/home')}
            style={{ paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md }}
            activeOpacity={0.6}
          >
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              Skip for now
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay).springify()}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: borderRadius.md,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.md,
        }}
      >
        <Text style={{ fontSize: 28 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
          }}
        >
          {description}
        </Text>
      </View>
    </Animated.View>
  );
}
