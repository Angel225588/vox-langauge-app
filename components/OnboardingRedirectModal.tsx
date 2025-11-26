/**
 * Onboarding Redirect Modal
 *
 * Modern, fancy card prompting users to complete onboarding
 * for a personalized experience.
 */

import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

const { width } = Dimensions.get('window');

interface OnboardingRedirectModalProps {
  visible: boolean;
  onReady: () => void;
}

export function OnboardingRedirectModal({ visible, onReady }: OnboardingRedirectModalProps) {
  const handleReady = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReady();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.xl,
        }}
      >
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={{
            width: '100%',
            maxWidth: 400,
          }}
        >
          {/* Card */}
          <View
            style={{
              borderRadius: borderRadius.xl,
              padding: spacing.xxl,
              borderWidth: 1,
              borderColor: 'rgba(99, 102, 241, 0.3)',
              shadowColor: colors.glow.primary,
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.4,
              shadowRadius: 30,
              elevation: 20,
              backgroundColor: colors.background.secondary
            }}
          >
            {/* Decorative Icon */}
            <Animated.View
              entering={FadeIn.duration(800).delay(300)}
              style={{
                alignItems: 'center',
                marginBottom: spacing.xl,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: borderRadius.full,
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                }}
              >
                <Text style={{ fontSize: 48 }}>✨</Text>
              </View>
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeIn.duration(600).delay(400)}
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                textAlign: 'center',
                marginBottom: spacing.md,
              }}
            >
              Let's Discover What You Like
            </Animated.Text>

            {/* Description */}
            <Animated.Text
              entering={FadeIn.duration(600).delay(500)}
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: spacing.xxl,
              }}
            >
              Create a personalized learning experience tailored to your goals, interests, and
              schedule. It only takes a minute!
            </Animated.Text>

            {/* Features */}
            <Animated.View
              entering={FadeIn.duration(600).delay(600)}
              style={{
                marginBottom: spacing.xxl,
                gap: spacing.md,
              }}
            >
              {[
                { icon: '🎯', text: 'AI-generated learning path' },
                { icon: '⚡', text: 'Personalized to your level' },
                { icon: '🚀', text: 'Track your progress' },
              ].map((feature, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: borderRadius.full,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{feature.icon}</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.secondary,
                      flex: 1,
                    }}
                  >
                    {feature.text}
                  </Text>
                </View>
              ))}
            </Animated.View>

            {/* Ready Button */}
            <Animated.View entering={FadeInDown.duration(600).delay(700).springify()}>
              <TouchableOpacity onPress={handleReady} activeOpacity={0.8}>
                <View
                  style={{
                    paddingVertical: spacing.lg,
                    borderRadius: borderRadius.xl,
                    alignItems: 'center',
                    shadowColor: colors.glow.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.5,
                    shadowRadius: 16,
                    elevation: 8,
                    backgroundColor: colors.primary.DEFAULT
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                    }}
                  >
                    I'm Ready! 🚀
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Skip text */}
            <Animated.View
              entering={FadeIn.duration(600).delay(800)}
              style={{
                marginTop: spacing.lg,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.tertiary,
                }}
              >
                Takes less than 1 minute
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
