/**
 * Screen 4: Profession
 * "What's your world, [Name]?"
 * 2-column glass grid with colored icons, equal-sized cards.
 * Selected state = whole card fills with profession color.
 * "Something else?" is 10th grid card → opens iPhone-style bottom sheet.
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GlassBackground } from '@/components/ui/glass/GlassBackground';
import { GlassProgressBar } from '@/components/ui/glass/GlassProgressBar';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius, glass } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

const TOTAL_STEPS = 6;

// ─── Profession data ────────────────────────────────

interface ProfessionOption {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;           // Unselected icon circle bg
  selectedBg: string;     // Selected: whole card background
  iconColor: string;      // Icon color (active)
  iconColorMuted: string; // Icon color (unselected)
}

// Ordered by multilingual demand (2026 data: healthcare, tech, finance top 3)
const PROFESSIONS: ProfessionOption[] = [
  { id: 'healthcare', label: 'Healthcare', icon: 'medkit-outline', tint: 'rgba(248, 113, 113, 0.10)', selectedBg: 'rgba(248, 113, 113, 0.18)', iconColor: '#F87171', iconColorMuted: '#F8717180' },
  { id: 'tech_engineering', label: 'Tech &\nEngineering', icon: 'code-slash-outline', tint: 'rgba(6, 214, 160, 0.10)', selectedBg: 'rgba(6, 214, 160, 0.18)', iconColor: '#06D6A0', iconColorMuted: '#06D6A080' },
  { id: 'business_finance', label: 'Business &\nFinance', icon: 'briefcase-outline', tint: 'rgba(61, 107, 255, 0.10)', selectedBg: 'rgba(61, 107, 255, 0.18)', iconColor: '#3D6BFF', iconColorMuted: '#3D6BFF80' },
  { id: 'legal', label: 'Legal', icon: 'shield-checkmark-outline', tint: 'rgba(167, 139, 250, 0.10)', selectedBg: 'rgba(167, 139, 250, 0.18)', iconColor: '#A78BFA', iconColorMuted: '#A78BFA80' },
  { id: 'sales_retail', label: 'Sales &\nMarketing', icon: 'trending-up-outline', tint: 'rgba(56, 189, 248, 0.10)', selectedBg: 'rgba(56, 189, 248, 0.18)', iconColor: '#38BDF8', iconColorMuted: '#38BDF880' },
  { id: 'hospitality_tourism', label: 'Hospitality\n& Tourism', icon: 'bed-outline', tint: 'rgba(251, 146, 60, 0.10)', selectedBg: 'rgba(251, 146, 60, 0.18)', iconColor: '#FB923C', iconColorMuted: '#FB923C80' },
  { id: 'education', label: 'Education', icon: 'school-outline', tint: 'rgba(251, 191, 36, 0.10)', selectedBg: 'rgba(251, 191, 36, 0.18)', iconColor: '#FBBF24', iconColorMuted: '#FBBF2480' },
  { id: 'government_diplomacy', label: 'Government\n& Diplomacy', icon: 'flag-outline', tint: 'rgba(52, 211, 153, 0.10)', selectedBg: 'rgba(52, 211, 153, 0.18)', iconColor: '#34D399', iconColorMuted: '#34D39980' },
  { id: 'creative_media', label: 'Creative\n& Media', icon: 'color-palette-outline', tint: 'rgba(244, 114, 182, 0.10)', selectedBg: 'rgba(244, 114, 182, 0.18)', iconColor: '#F472B6', iconColorMuted: '#F472B680' },
];

// Suggestions for the bottom sheet search
const SEARCH_SUGGESTIONS = [
  'Accounting', 'Architecture', 'Aviation', 'Banking', 'Consulting',
  'Data Science', 'Design', 'Engineering', 'Entrepreneurship', 'Finance',
  'Freelance', 'HR & Recruiting', 'Insurance', 'Journalism',
  'Management', 'Marketing', 'Military', 'Music & Arts',
  'Non-Profit', 'Nursing', 'Pharmacy', 'Photography',
  'Public Relations', 'Real Estate', 'Research', 'Social Work',
  'Sports & Fitness', 'Startup', 'Supply Chain', 'Translation',
];

// ─── Profession Card ────────────────────────────────

function ProfessionCard({
  profession,
  selected,
  onPress,
  index,
}: {
  profession: ProfessionOption;
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(150 + index * 50)}
      style={styles.cardWrapper}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.profCard,
          selected && { backgroundColor: profession.selectedBg },
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}
      >
        {/* Watermark */}
        <View style={styles.iconWatermark}>
          <Ionicons
            name={profession.icon}
            size={48}
            color={selected ? `${profession.iconColor}30` : 'rgba(255, 255, 255, 0.03)'}
          />
        </View>

        {/* Icon circle */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: profession.tint },
            selected && { backgroundColor: `${profession.iconColor}30` },
          ]}
        >
          <Ionicons
            name={profession.icon}
            size={20}
            color={selected ? profession.iconColor : profession.iconColorMuted}
          />
        </View>

        {/* Label */}
        <Text
          style={[
            styles.profLabel,
            selected && styles.profLabelSelected,
          ]}
          numberOfLines={2}
        >
          {profession.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── "Something else?" Card ─────────────────────────

function OtherCard({
  onPress,
  index,
}: {
  onPress: () => void;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(150 + index * 50)}
      style={styles.cardWrapper}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.profCard,
          styles.otherCard,
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}
      >
        {/* Icon circle */}
        <View style={[styles.iconCircle, styles.otherIconCircle]}>
          <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
        </View>

        {/* Label */}
        <Text style={styles.otherLabel}>Something{'\n'}else?</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Bottom Sheet ───────────────────────────────────

function ProfessionSearchSheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (profession: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('onboarding');
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const filteredSuggestions = useMemo(() => {
    if (searchText.trim().length === 0) return SEARCH_SUGGESTIONS;
    const query = searchText.trim().toLowerCase();
    return SEARCH_SUGGESTIONS.filter(s => s.toLowerCase().includes(query));
  }, [searchText]);

  const showCustomOption =
    searchText.trim().length > 2 &&
    !filteredSuggestions.some(s => s.toLowerCase() === searchText.trim().toLowerCase());

  const handleSelect = (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(text);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.sheetContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheetContent, { paddingTop: spacing.md }]}>
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('profession.header')}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close-circle" size={28} color={colors.text.disabled} />
            </Pressable>
          </View>

          {/* Search input */}
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color={colors.text.disabled} style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t('profession.custom_placeholder')}
              placeholderTextColor={colors.text.disabled}
              style={styles.searchInput}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => {
                if (searchText.trim().length > 2) handleSelect(searchText.trim());
              }}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.text.disabled} />
              </Pressable>
            )}
          </View>

          {/* Custom option */}
          {showCustomOption && (
            <Pressable
              onPress={() => handleSelect(searchText.trim())}
              style={styles.customOptionRow}
            >
              <View style={styles.customOptionIcon}>
                <Ionicons name="add" size={18} color={colors.primary.light} />
              </View>
              <Text style={styles.customOptionText}>
                Add "<Text style={styles.customOptionBold}>{searchText.trim()}</Text>"
              </Text>
            </Pressable>
          )}

          {/* Suggestions */}
          <ScrollView
            style={styles.suggestionsScroll}
            contentContainerStyle={styles.suggestionsContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.suggestionsGrid}>
              {filteredSuggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => handleSelect(suggestion)}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ─────────────────────────────────────────

export default function ProfessionScreen() {
  const insets = useSafeAreaInsets();
  const { first_name, profession, setField } = useOnboardingV3();
  const { t } = useTranslation('onboarding');
  const [selected, setSelected] = useState(profession);
  const [showSheet, setShowSheet] = useState(false);
  const navigating = useRef(false);

  const handleSelect = (id: string) => {
    if (navigating.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelected(id);

    // Auto-advance after brief pause
    navigating.current = true;
    const prof = PROFESSIONS.find(p => p.id === id);
    setField('profession', prof ? prof.label.replace('\n', ' ') : id);
    setField('profession_custom', '');
    setField('current_step', 5);
    setTimeout(() => {
      router.push('/(auth)/onboarding-v3/scenarios');
      navigating.current = false;
    }, 150);
  };

  const handleSheetSelect = (professionText: string) => {
    if (navigating.current) return;
    navigating.current = true;
    setShowSheet(false);
    setSelected('custom');
    setField('profession', professionText);
    setField('profession_custom', professionText);
    setField('current_step', 5);
    setTimeout(() => {
      router.push('/(auth)/onboarding-v3/scenarios');
      navigating.current = false;
    }, 150);
  };

  return (
    <GlassBackground intensity="subtle">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlassProgressBar step={4} totalSteps={TOTAL_STEPS} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.header}>
              {t('profession.header')}{first_name ? `, ${first_name}` : ''}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={styles.subtitle}>
              {t('profession.subtitle')}
            </Text>
          </Animated.View>

          {/* Grid — 9 professions + "Something else?" */}
          <View style={styles.grid}>
            {PROFESSIONS.map((prof, i) => (
              <ProfessionCard
                key={prof.id}
                profession={prof}
                selected={selected === prof.id}
                onPress={() => handleSelect(prof.id)}
                index={i}
              />
            ))}

            {/* 10th card — "Something else?" */}
            <OtherCard
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowSheet(true);
              }}
              index={PROFESSIONS.length}
            />
          </View>
        </ScrollView>

        {/* Bottom sheet */}
        <ProfessionSearchSheet
          visible={showSheet}
          onClose={() => setShowSheet(false)}
          onSelect={handleSheetSelect}
        />
      </View>
    </GlassBackground>
  );
}

// ─── Styles ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
  },

  // ─── Grid ─────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  cardWrapper: {
    width: '48.5%' as any,
  },
  profCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    height: 110,
    justifyContent: 'flex-end',
  },

  // Watermark
  iconWatermark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },

  // Icon circle
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  // Label
  profLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.display.semibold,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  profLabelSelected: {
    color: colors.text.primary,
  },

  // ─── "Something else?" card ───────────────────────
  otherCard: {
    borderWidth: 1,
    borderStyle: 'dashed' as any,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  otherIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  otherLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.medium,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.sm * 1.4,
  },

  // ─── Bottom Sheet ─────────────────────────────────
  sheetContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
  },

  // Search input
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.primary,
    height: '100%',
  },

  // Custom option row
  customOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: glass.border.subtle,
    marginBottom: spacing.sm,
  },
  customOptionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 54, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customOptionText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.secondary,
  },
  customOptionBold: {
    fontFamily: fonts.display.semibold,
    color: colors.primary.light,
  },

  // Suggestions
  suggestionsScroll: {
    flex: 1,
  },
  suggestionsContent: {
    paddingBottom: spacing.xl,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.medium,
    color: colors.text.secondary,
  },
});
