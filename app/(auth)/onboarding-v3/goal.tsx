/**
 * Screen 3: Goal
 * "What do you need [language] for?"
 * Icon-led glass goal cards + custom option.
 * Dual font styling in header to encourage personalization.
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassProgressBar } from '@/components/ui/glass/GlassProgressBar';
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { GlassInput } from '@/components/ui/glass/GlassInput';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { colors, spacing, typography, borderRadius, glass } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

const TOTAL_STEPS = 6;

const LANG_DISPLAY: Record<string, string> = {
  english: 'English',
  french: 'French',
  spanish: 'Spanish',
};

// ─── Goal data ──────────────────────────────────────

interface GoalOption {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
}

const GOALS: GoalOption[] = [
  { id: 'lead_present', label: 'Lead meetings and present with confidence', icon: 'mic-outline', tint: 'rgba(0, 54, 255, 0.12)' },
  { id: 'conversations', label: 'Hold professional conversations fluently', icon: 'chatbubbles-outline', tint: 'rgba(6, 214, 160, 0.12)' },
  { id: 'write_communicate', label: 'Write and communicate clearly at work', icon: 'document-text-outline', tint: 'rgba(0, 163, 255, 0.12)' },
  { id: 'live_abroad', label: 'Live and function in a new country', icon: 'globe-outline', tint: 'rgba(245, 158, 11, 0.12)' },
  { id: 'connect_people', label: 'Connect with people in their language', icon: 'people-outline', tint: 'rgba(236, 72, 153, 0.12)' },
];

const GOAL_TINT_SELECTED: Record<string, string> = {
  lead_present: 'rgba(0, 54, 255, 0.22)',
  conversations: 'rgba(6, 214, 160, 0.22)',
  write_communicate: 'rgba(0, 163, 255, 0.22)',
  live_abroad: 'rgba(245, 158, 11, 0.22)',
  connect_people: 'rgba(236, 72, 153, 0.22)',
};

const GOAL_ICON_COLORS: Record<string, string> = {
  lead_present: '#3D6BFF',
  conversations: '#06D6A0',
  write_communicate: '#00A3FF',
  live_abroad: '#F59E0B',
  connect_people: '#EC4899',
};

// ─── Goal Card ──────────────────────────────────────

function GoalCard({
  goal,
  selected,
  onPress,
  index,
}: {
  goal: GoalOption;
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(1.03, { damping: 20, stiffness: 300 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }, 100);
    onPress();
  };

  const iconColor = selected
    ? GOAL_ICON_COLORS[goal.id] || colors.primary.light
    : colors.text.tertiary;

  return (
    <Animated.View
      entering={FadeInUp.duration(350).delay(200 + index * 70)}
      style={animStyle}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [pressed && { opacity: 0.95 }]}
      >
        <View
          style={[
            styles.goalCard,
            selected && styles.goalCardSelected,
            selected && { backgroundColor: GOAL_TINT_SELECTED[goal.id] || glass.surface.accentMedium },
          ]}
        >
          {/* Icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: goal.tint }]}>
            <Ionicons name={goal.icon} size={22} color={iconColor} />
          </View>

          {/* Label */}
          <Text
            style={[
              styles.goalLabel,
              selected && styles.goalLabelSelected,
            ]}
            numberOfLines={2}
          >
            {goal.label}
          </Text>

          {/* Check indicator */}
          {selected && (
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={GOAL_ICON_COLORS[goal.id] || colors.primary.light}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ─────────────────────────────────────────

export default function GoalScreen() {
  const insets = useSafeAreaInsets();
  const { target_language, goal, goal_custom, setField } = useOnboardingV3();
  const [selected, setSelected] = useState(goal);
  const [showCustom, setShowCustom] = useState(!!goal_custom);
  const [customText, setCustomText] = useState(goal_custom);
  const navigating = useRef(false);

  const langDisplay = LANG_DISPLAY[target_language || 'english'] || 'this language';
  const isCustomValid = showCustom && customText.trim().length > 5;

  const handleSelect = (id: string) => {
    if (navigating.current) return;
    const g = GOALS.find(g => g.id === id);
    if (!g) return;
    setSelected(g.label);
    setShowCustom(false);
    setCustomText('');

    // Auto-advance after brief pause
    navigating.current = true;
    setField('goal', g.label);
    setField('goal_custom', '');
    setField('current_step', 4);
    setTimeout(() => {
      router.push('/(auth)/onboarding-v3/profession');
      navigating.current = false;
    }, 150);
  };

  const handleCustomContinue = () => {
    if (!isCustomValid) return;
    setField('goal', customText.trim());
    setField('goal_custom', customText.trim());
    setField('current_step', 4);
    router.push('/(auth)/onboarding-v3/profession');
  };

  return (
    <GlassBackground intensity="subtle">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlassProgressBar step={3} totalSteps={TOTAL_STEPS} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header — dual font styling */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.header}>
              What do you need{'\n'}{langDisplay} for?
            </Text>
            <Text style={styles.headerHint}>
              or tell us in your own words
            </Text>
          </Animated.View>

          {/* Goal cards */}
          <View style={styles.cardsSection}>
            {GOALS.map((g, i) => (
              <GoalCard
                key={g.id}
                goal={g}
                selected={selected === g.label && !showCustom}
                onPress={() => handleSelect(g.id)}
                index={i}
              />
            ))}

            {/* Something else? — 6th card */}
            <Animated.View entering={FadeInUp.duration(350).delay(200 + GOALS.length * 70)}>
              {!showCustom ? (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCustom(true);
                    setSelected('');
                  }}
                >
                  <View style={styles.customCard}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}>
                      <Ionicons name="add" size={22} color={colors.text.tertiary} />
                    </View>
                    <Text style={styles.customCardLabel}>Something else?</Text>
                  </View>
                </Pressable>
              ) : (
                <View style={styles.customInputSection}>
                  <GlassInput
                    value={customText}
                    onChangeText={setCustomText}
                    placeholder="Describe your goal..."
                    autoFocusOnMount
                    multiline
                    hint="e.g., Present quarterly results to French-speaking stakeholders"
                  />
                  <Pressable
                    onPress={() => {
                      setShowCustom(false);
                      setCustomText('');
                    }}
                  >
                    <Text style={styles.backToOptions}>Back to options</Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>

        {/* CTA — only shown for custom input */}
        {showCustom && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <GlassButton
              variant="primary"
              disabled={!isCustomValid}
              onPress={handleCustomContinue}
            >
              Continue
            </GlassButton>
          </View>
        )}
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },

  // Header — dual font styling
  header: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    lineHeight: typography.fontSize['3xl'] * 1.2,
  },
  headerHint: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    fontStyle: 'italic',
    color: colors.text.disabled,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },

  // Cards
  cardsSection: {
    gap: spacing.sm + 2,
  },
  goalCard: {
    backgroundColor: glass.card.default.backgroundColor,
    borderColor: glass.card.default.borderColor,
    borderWidth: glass.card.default.borderWidth,
    borderRadius: borderRadius.lg,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  goalCardSelected: {
    borderColor: glass.border.accent,
    borderWidth: 1.5,
  },

  // Icon circle
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Labels
  goalLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.medium,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.35,
  },
  goalLabelSelected: {
    color: colors.text.primary,
    fontFamily: fonts.display.semibold,
  },

  // Custom "Something else?" card
  customCard: {
    backgroundColor: glass.card.default.backgroundColor,
    borderColor: glass.border.light,
    borderWidth: 1,
    borderStyle: 'dashed' as any,
    borderRadius: borderRadius.lg,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  customCardLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.medium,
    color: colors.text.tertiary,
  },

  // Custom input
  customInputSection: {
    gap: spacing.md,
    alignItems: 'center',
  },
  backToOptions: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.display.semibold,
    color: colors.primary.light,
    paddingVertical: spacing.sm,
  },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
