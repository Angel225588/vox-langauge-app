/**
 * Screen 6: Level
 * "How much [language] do you know?"
 * 5 level cards with blue gradient progression.
 * Fresh start = light blue, Near fluent = deep Electric Blue.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassProgressBar } from '@/components/ui/glass/GlassProgressBar';
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { useOnboardingV3, type ProficiencyLevel } from '@/hooks/useOnboardingV3';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

const TOTAL_STEPS = 6;

const LANG_DISPLAY: Record<string, string> = {
  english: 'English',
  french: 'French',
  spanish: 'Spanish',
};

interface LevelOption {
  id: ProficiencyLevel;
  label: string;
  description: string;
  gradient: readonly [string, string]; // Blue progression
}

const LEVELS: LevelOption[] = [
  {
    id: 'starting_fresh',
    label: 'Fresh start',
    description: "I'm starting from zero",
    gradient: ['rgba(56, 189, 248, 0.12)', 'rgba(56, 189, 248, 0.06)'] as const, // Light sky blue
  },
  {
    id: 'basics',
    label: 'Basics',
    description: 'I know some words and simple phrases',
    gradient: ['rgba(59, 130, 246, 0.14)', 'rgba(59, 130, 246, 0.07)'] as const, // Medium blue
  },
  {
    id: 'conversational',
    label: 'Conversational',
    description: 'I can hold basic conversations',
    gradient: ['rgba(37, 99, 235, 0.16)', 'rgba(37, 99, 235, 0.08)'] as const, // Deeper blue
  },
  {
    id: 'confident',
    label: 'Confident',
    description: 'I communicate well but want to refine',
    gradient: ['rgba(29, 78, 216, 0.18)', 'rgba(29, 78, 216, 0.09)'] as const, // Strong blue
  },
  {
    id: 'near_fluent',
    label: 'Near fluent',
    description: "I'm advanced but need professional polish",
    gradient: ['rgba(0, 54, 255, 0.22)', 'rgba(0, 54, 255, 0.10)'] as const, // Electric Blue
  },
];

// Solid colors for the left accent bar
const LEVEL_BAR_COLORS = [
  '#38BDF8', // Sky blue
  '#3B82F6', // Blue
  '#2563EB', // Deeper blue
  '#1D4ED8', // Strong blue
  '#0036FF', // Electric Blue
];

// ─── Level Card ─────────────────────────────────────

function LevelCard({
  level,
  selected,
  onPress,
  index,
}: {
  level: LevelOption;
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  const barColor = LEVEL_BAR_COLORS[index];

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(200 + index * 70)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && { opacity: 0.85 },
        ]}
      >
        <View style={[styles.levelCard, selected && styles.levelCardSelected]}>
          {/* Gradient fill */}
          <LinearGradient
            colors={selected ? [level.gradient[0].replace(/[\d.]+\)$/, '0.25)'), level.gradient[1].replace(/[\d.]+\)$/, '0.12)')] : level.gradient as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Left accent bar */}
          <View style={[styles.levelBar, { backgroundColor: barColor }, selected && { opacity: 1 }, !selected && { opacity: 0.3 }]} />

          {/* Content */}
          <View style={styles.levelContent}>
            <Text style={[styles.levelLabel, selected && styles.levelLabelSelected]}>
              {level.label}
            </Text>
            <Text style={[styles.levelDesc, selected && styles.levelDescSelected]}>
              {level.description}
            </Text>
          </View>

          {/* Check */}
          {selected && (
            <View style={[styles.checkDot, { backgroundColor: barColor }]}>
              <Animated.View entering={FadeInUp.duration(200)}>
                <Text style={styles.checkIcon}>✓</Text>
              </Animated.View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ─────────────────────────────────────────

export default function LevelScreen() {
  const insets = useSafeAreaInsets();
  const { target_language, proficiency_level, setField } = useOnboardingV3();
  const [selected, setSelected] = useState<ProficiencyLevel | null>(proficiency_level);

  const langDisplay = LANG_DISPLAY[target_language || 'english'] || 'this language';

  const handleSelect = (id: ProficiencyLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    setField('proficiency_level', selected);
    setField('current_step', 7);
    router.push('/(auth)/onboarding-v3/first-lesson');
  };

  return (
    <GlassBackground intensity="subtle">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlassProgressBar step={6} totalSteps={TOTAL_STEPS} />

        {/* Header */}
        <View style={styles.headerSection}>
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.header}>How much {langDisplay}{'\n'}do you know?</Text>
          </Animated.View>
        </View>

        {/* Level cards */}
        <View style={styles.cardsSection}>
          {LEVELS.map((level, i) => (
            <LevelCard
              key={level.id}
              level={level}
              selected={selected === level.id}
              onPress={() => handleSelect(level.id)}
              index={i}
            />
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTA — special "See my first lesson" */}
        <Animated.View
          entering={FadeInUp.duration(300).delay(600)}
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <GlassButton
            variant="primary"
            disabled={!selected}
            onPress={handleContinue}
          >
            See my first lesson
          </GlassButton>
        </Animated.View>
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  header: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    lineHeight: typography.fontSize['3xl'] * 1.2,
  },

  cardsSection: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },

  // Level card
  levelCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.lg + 6,
  },
  levelCardSelected: {
    // Glow handled by gradient intensification
  },

  // Left accent bar
  levelBar: {
    position: 'absolute',
    left: 0,
    top: spacing.sm,
    bottom: spacing.sm,
    width: 3,
    borderRadius: 2,
  },

  // Content
  levelContent: {
    flex: 1,
    gap: 3,
  },
  levelLabel: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.display.semibold,
    color: colors.text.secondary,
  },
  levelLabelSelected: {
    color: colors.text.primary,
  },
  levelDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.disabled,
  },
  levelDescSelected: {
    color: colors.text.tertiary,
  },

  // Check dot
  checkDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkIcon: {
    fontSize: 14,
    fontFamily: fonts.display.bold,
    color: '#FFFFFF',
  },

  spacer: { flex: 1 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
