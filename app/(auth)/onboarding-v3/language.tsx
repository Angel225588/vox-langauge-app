/**
 * Screen 2: Target Language
 * "[Name], what language do you need?"
 * 3 vertical glass cards with cultural imagery overlays.
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassProgressBar } from '@/components/ui/glass/GlassProgressBar';
import { useOnboardingV3, type TargetLanguage } from '@/hooks/useOnboardingV3';
import { colors, spacing, typography, borderRadius, glass } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

const TOTAL_STEPS = 6;

// ─── Language data ───────────────────────────────────

interface LanguageOption {
  id: TargetLanguage;
  name: string;
  nativeName: string;
  flag: string;
  gradient: readonly [string, string];
}

const LANGUAGES: LanguageOption[] = [
  {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    gradient: ['#1A3A5C', '#0D2137'] as const,
  },
  {
    id: 'french',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    gradient: ['#2D1B4E', '#1A0F2E'] as const,
  },
  {
    id: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    gradient: ['#3D1F0D', '#261408'] as const,
  },
];

// ─── Language Card ───────────────────────────────────

function LanguageCard({
  language,
  selected,
  onSelect,
  index,
}: {
  language: LanguageOption;
  selected: boolean;
  onSelect: () => void;
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
    onSelect();
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200 + index * 100).springify()}
      style={animStyle}
    >
      <Pressable onPress={handlePress} style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
        <View
          style={[
            styles.card,
            selected && styles.cardSelected,
          ]}
        >
          {/* Cultural gradient background */}
          <LinearGradient
            colors={language.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Glass overlay */}
          <View style={[StyleSheet.absoluteFill, styles.glassOverlay]} />

          {/* Selected glow border */}
          {selected && (
            <View style={[StyleSheet.absoluteFill, styles.selectedBorder]} />
          )}

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.cardTextColumn}>
              <Text style={styles.cardName}>{language.name}</Text>
              <Text style={styles.cardNative}>{language.nativeName}</Text>
            </View>
            <Text style={styles.cardFlag}>{language.flag}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ─────────────────────────────────────────

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const { first_name, target_language, setField } = useOnboardingV3();
  const [selected, setSelected] = useState<TargetLanguage | null>(target_language);
  const navigating = useRef(false);

  const handleSelect = (id: TargetLanguage) => {
    if (navigating.current) return;
    setSelected(id);

    // Auto-advance after brief pause
    navigating.current = true;
    setField('target_language', id);
    setField('current_step', 3);
    setTimeout(() => {
      router.push('/(auth)/onboarding-v3/goal');
      navigating.current = false;
    }, 150);
  };

  return (
    <GlassBackground intensity="subtle">
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Progress */}
        <GlassProgressBar step={2} totalSteps={TOTAL_STEPS} />

        {/* Header */}
        <View style={styles.headerSection}>
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.header}>
              {first_name ? `${first_name}, what` : 'What'} language do you need?
            </Text>
          </Animated.View>
        </View>

        {/* Language cards */}
        <View style={styles.cardsSection}>
          {LANGUAGES.map((lang, i) => (
            <LanguageCard
              key={lang.id}
              language={lang}
              selected={selected === lang.id}
              onSelect={() => handleSelect(lang.id)}
              index={i}
            />
          ))}
        </View>
      </View>
    </GlassBackground>
  );
}

// ─── Styles ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  header: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
  },

  cardsSection: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    height: 110,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glass.border.light,
  },
  cardSelected: {
    borderColor: colors.primary.DEFAULT,
    borderWidth: 2,
    shadowColor: '#0036FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  selectedBorder: {
    borderRadius: borderRadius.xl,
    borderWidth: 0,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  cardTextColumn: {
    gap: spacing.xs,
  },
  cardName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
  },
  cardNative: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
  },
  cardFlag: {
    fontSize: 40,
  },

});
