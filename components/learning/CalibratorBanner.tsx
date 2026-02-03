/**
 * Calibrator Banner Component - Premium Horizontal Design
 *
 * A sleek horizontal banner that appears after every 5-7 stairs.
 * Features a premium shine/light reflection animation for a polished look.
 *
 * Features:
 * - Full-width horizontal design
 * - Premium shine animation (light sweep effect)
 * - Three skill buttons: Speaking, Listening, Writing
 * - Three states: locked, ready, completed
 * - Haptic feedback on interaction
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CalibratorBannerProps {
  sectionNumber: number;
  status: 'locked' | 'ready' | 'completed';
  onStart: () => void;
  onSkillPress?: (skill: 'speaking' | 'listening' | 'writing') => void;
  completedAt?: string;
  score?: number;
}

const SKILLS = [
  { id: 'speaking' as const, icon: '🗣️', name: 'Speaking' },
  { id: 'listening' as const, icon: '👂', name: 'Listening' },
  { id: 'writing' as const, icon: '✍️', name: 'Writing' },
];

export function CalibratorBanner({
  sectionNumber,
  status,
  onStart,
  onSkillPress,
  completedAt,
  score,
}: CalibratorBannerProps) {
  // Shine animation value
  const shinePosition = useSharedValue(-1);

  // Start shine animation when ready
  useEffect(() => {
    if (status === 'ready') {
      shinePosition.value = withRepeat(
        withTiming(2, {
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1, // Infinite
        false
      );
    } else {
      shinePosition.value = -1;
    }
  }, [status]);

  // Animated shine style
  const shineStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shinePosition.value,
      [-1, 2],
      [-SCREEN_WIDTH, SCREEN_WIDTH * 2]
    );
    return {
      transform: [{ translateX }],
    };
  });

  const handlePress = () => {
    if (status === 'locked') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  const handleSkillPress = (skill: 'speaking' | 'listening' | 'writing') => {
    if (status === 'locked') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkillPress?.(skill);
  };

  const getStatusText = () => {
    switch (status) {
      case 'locked':
        return 'Complete all lessons to unlock';
      case 'ready':
        return 'Ready to calibrate';
      case 'completed':
        return score ? `Score: ${score}%` : 'Completed';
    }
  };

  const isInteractive = status !== 'locked';

  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(300)}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={isInteractive ? 0.9 : 1}
        style={styles.touchable}
      >
        {/* Background gradient based on status */}
        <LinearGradient
          colors={
            status === 'ready'
              ? ['#4F46E5', '#7C3AED', '#8B5CF6']
              : status === 'completed'
                ? ['#059669', '#10B981', '#34D399']
                : ['#374151', '#4B5563', '#6B7280']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          {/* Shine overlay - only when ready */}
          {status === 'ready' && (
            <Animated.View style={[styles.shineContainer, shineStyle]}>
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(255, 255, 255, 0.15)',
                  'rgba(255, 255, 255, 0.3)',
                  'rgba(255, 255, 255, 0.15)',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shine}
              />
            </Animated.View>
          )}

          {/* Content Row */}
          <View style={styles.contentRow}>
            {/* Left: Icon and Text */}
            <View style={styles.leftContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {status === 'locked' ? '🔒' : status === 'completed' ? '✅' : '🎯'}
                </Text>
              </View>
              <View style={styles.textContent}>
                <Text style={styles.title}>Calibration Test</Text>
                <Text style={[
                  styles.subtitle,
                  status === 'locked' && styles.subtitleMuted
                ]}>
                  {getStatusText()}
                </Text>
              </View>
            </View>

            {/* Right: Skill Buttons */}
            <View style={styles.skillButtons}>
              {SKILLS.map((skill) => (
                <TouchableOpacity
                  key={skill.id}
                  onPress={() => handleSkillPress(skill.id)}
                  disabled={!isInteractive}
                  activeOpacity={0.7}
                  style={[
                    styles.skillButton,
                    status === 'locked' && styles.skillButtonLocked,
                  ]}
                >
                  <Text style={[
                    styles.skillIcon,
                    status === 'locked' && styles.skillIconMuted
                  ]}>
                    {skill.icon}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Arrow indicator when ready */}
          {status === 'ready' && (
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  touchable: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  banner: {
    height: 80,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  shineContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 1,
  },
  shine: {
    flex: 1,
    width: 100,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  subtitleMuted: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  skillButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  skillButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillButtonLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  skillIcon: {
    fontSize: 18,
  },
  skillIconMuted: {
    opacity: 0.4,
  },
  arrowContainer: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    marginTop: -12,
    zIndex: 3,
  },
  arrow: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
});

// Named export
export { CalibratorBanner as default };
