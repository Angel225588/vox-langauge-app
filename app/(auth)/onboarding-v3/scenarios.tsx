/**
 * Screen 5: Scenarios
 * "What situations matter most?"
 * Rectangle box cards, multi-select, search/add button top-right.
 * Scenario banks refined from 2026 multilingual workforce research.
 */

import React, { useState, useMemo, useRef } from 'react';
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
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { colors, spacing, typography, borderRadius, glass } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

const TOTAL_STEPS = 6;
const MAX_SCENARIOS = 5;

// ─── Scenario banks per profession (research-backed) ─

const SCENARIO_BANKS: Record<string, string[]> = {
  // Healthcare — #1 demand for multilingual skills
  'Healthcare': [
    'Patient consultations',
    'Explaining procedures & diagnosis',
    'Emergency communication',
    'Medical history intake',
    'Family conversations',
    'Colleague handoffs & rounds',
    'Pharmacy interactions',
    'Mental health discussions',
    'Insurance & billing',
  ],
  // Tech — #2 demand, remote/global teams
  'Tech & Engineering': [
    'Stand-ups & sprint planning',
    'Code reviews & pair programming',
    'Demo presentations',
    'Cross-team coordination',
    'Technical documentation',
    'Client calls & requirements',
    'Onboarding new teammates',
    'Conference talks',
    'Job interviews & panels',
  ],
  'Tech &\nEngineering': [
    'Stand-ups & sprint planning',
    'Code reviews & pair programming',
    'Demo presentations',
    'Cross-team coordination',
    'Technical documentation',
    'Client calls & requirements',
    'Onboarding new teammates',
    'Conference talks',
    'Job interviews & panels',
  ],
  // Business & Finance — #3 demand
  'Business & Finance': [
    'Client meetings & pitches',
    'Negotiating deals & contracts',
    'Board & stakeholder presentations',
    'Networking events',
    'Email & report writing',
    'Phone & video calls',
    'Team leadership & 1-on-1s',
    'Job interviews',
    'Conferences & summits',
  ],
  'Business &\nFinance': [
    'Client meetings & pitches',
    'Negotiating deals & contracts',
    'Board & stakeholder presentations',
    'Networking events',
    'Email & report writing',
    'Phone & video calls',
    'Team leadership & 1-on-1s',
    'Job interviews',
    'Conferences & summits',
  ],
  // Legal
  'Legal': [
    'Client consultations',
    'Court proceedings & hearings',
    'Contract negotiations',
    'Depositions & witness prep',
    'Legal writing & briefs',
    'Immigration cases',
    'Mediation & arbitration',
    'Cross-border cases',
    'Regulatory discussions',
  ],
  // Sales & Marketing
  'Sales & Marketing': [
    'Product demos & pitches',
    'Cold outreach & follow-ups',
    'Price & contract negotiations',
    'Trade shows & events',
    'Customer consultations',
    'Campaign presentations',
    'Partner meetings',
    'Complaint resolution',
    'Market research interviews',
  ],
  'Sales &\nMarketing': [
    'Product demos & pitches',
    'Cold outreach & follow-ups',
    'Price & contract negotiations',
    'Trade shows & events',
    'Customer consultations',
    'Campaign presentations',
    'Partner meetings',
    'Complaint resolution',
    'Market research interviews',
  ],
  // Hospitality & Tourism
  'Hospitality & Tourism': [
    'Guest check-in & concierge',
    'Complaint resolution',
    'Tour guiding',
    'Menu & cuisine explanations',
    'Event coordination',
    'VIP & special requests',
    'Staff coordination',
    'Emergency situations',
    'Local recommendations',
  ],
  'Hospitality\n& Tourism': [
    'Guest check-in & concierge',
    'Complaint resolution',
    'Tour guiding',
    'Menu & cuisine explanations',
    'Event coordination',
    'VIP & special requests',
    'Staff coordination',
    'Emergency situations',
    'Local recommendations',
  ],
  // Education
  'Education': [
    'Classroom instruction',
    'Parent-teacher meetings',
    'Student counseling',
    'Staff meetings',
    'Research collaboration',
    'Grant writing',
    'Conference presentations',
    'Curriculum discussions',
    'Administrative processes',
  ],
  // Government & Diplomacy
  'Government & Diplomacy': [
    'Diplomatic negotiations',
    'Press briefings & media',
    'Policy discussions',
    'Constituent meetings',
    'Cross-agency coordination',
    'Protocol & formal events',
    'Report & speech writing',
    'International summits',
    'Public speaking',
  ],
  'Government\n& Diplomacy': [
    'Diplomatic negotiations',
    'Press briefings & media',
    'Policy discussions',
    'Constituent meetings',
    'Cross-agency coordination',
    'Protocol & formal events',
    'Report & speech writing',
    'International summits',
    'Public speaking',
  ],
  // Creative & Media
  'Creative & Media': [
    'Client pitches & briefs',
    'Creative direction meetings',
    'Content planning & strategy',
    'Interviewing & podcasting',
    'Script & copywriting',
    'Brand presentations',
    'Production coordination',
    'Partnership negotiations',
    'Critique & review sessions',
  ],
  'Creative\n& Media': [
    'Client pitches & briefs',
    'Creative direction meetings',
    'Content planning & strategy',
    'Interviewing & podcasting',
    'Script & copywriting',
    'Brand presentations',
    'Production coordination',
    'Partnership negotiations',
    'Critique & review sessions',
  ],
};

const DEFAULT_SCENARIOS = [
  'Meetings & calls',
  'Presentations',
  'Email & writing',
  'Networking events',
  'Job interviews',
  'Client interactions',
  'Team collaboration',
  'Phone conversations',
  'Daily life & errands',
];

// ─── Scenario Card ──────────────────────────────────

function ScenarioCard({
  label,
  selected,
  disabled,
  onPress,
  index,
  isCustom,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
  index: number;
  isCustom?: boolean;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(250).delay(200 + index * 40)}>
      <Pressable
        onPress={onPress}
        disabled={disabled && !selected}
        style={({ pressed }) => [
          styles.scenarioCard,
          selected && styles.scenarioCardSelected,
          disabled && !selected && styles.scenarioCardDisabled,
          pressed && { opacity: 0.85 },
        ]}
      >
        {/* Check circle */}
        <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
          {selected && (
            <Ionicons name="checkmark" size={14} color={colors.text.primary} />
          )}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.scenarioLabel,
            selected && styles.scenarioLabelSelected,
            disabled && !selected && styles.scenarioLabelDisabled,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Custom star */}
        {isCustom && (
          <Ionicons name="star" size={14} color={colors.primary.light} style={{ marginLeft: 'auto' }} />
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Add Scenario Sheet ─────────────────────────────

function AddScenarioSheet({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (scenario: string) => void;
}) {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (text.trim().length > 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAdd(text.trim());
      setText('');
    }
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
            <Text style={styles.sheetTitle}>Add a scenario</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close-circle" size={28} color={colors.text.disabled} />
            </Pressable>
          </View>

          {/* Input */}
          <View style={styles.sheetInputContainer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="e.g., Medical rounds with senior staff"
              placeholderTextColor={colors.text.disabled}
              style={styles.sheetInput}
              autoFocus
              autoCapitalize="sentences"
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
          </View>

          <Text style={styles.sheetHint}>
            Describe a real situation where you need the language. We'll build practice around it.
          </Text>

          {/* Add button */}
          <GlassButton
            variant="primary"
            disabled={text.trim().length < 3}
            onPress={handleAdd}
          >
            Add scenario
          </GlassButton>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ─────────────────────────────────────────

export default function ScenariosScreen() {
  const insets = useSafeAreaInsets();
  const { profession, scenarios: savedScenarios, setField } = useOnboardingV3();

  const [selected, setSelected] = useState<string[]>(savedScenarios);
  const [showSheet, setShowSheet] = useState(false);

  const availableScenarios = useMemo(() => {
    return SCENARIO_BANKS[profession] || DEFAULT_SCENARIOS;
  }, [profession]);

  const isValid = selected.length >= 1;
  const atMax = selected.length >= MAX_SCENARIOS;

  const toggleScenario = (scenario: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.includes(scenario)) {
      setSelected(selected.filter(s => s !== scenario));
    } else if (!atMax) {
      setSelected([...selected, scenario]);
    }
  };

  const handleAddCustom = (scenario: string) => {
    if (!atMax && !selected.includes(scenario)) {
      setSelected([...selected, scenario]);
    }
    setShowSheet(false);
  };

  const handleContinue = () => {
    setField('scenarios', selected);
    setField('current_step', 6);
    router.push('/(auth)/onboarding-v3/level');
  };

  return (
    <GlassBackground intensity="subtle">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlassProgressBar step={5} totalSteps={TOTAL_STEPS} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header row with counter + add button */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <View style={styles.headerRow}>
              <Text style={styles.header}>What situations{'\n'}matter most?</Text>
              <View style={styles.headerActions}>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterText}>{selected.length}/{MAX_SCENARIOS}</Text>
                </View>
                <Pressable
                  onPress={() => !atMax && setShowSheet(true)}
                  style={[styles.addButton, atMax && { opacity: 0.35 }]}
                  hitSlop={8}
                >
                  <Ionicons name="add" size={20} color={colors.primary.light} />
                </Pressable>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={styles.subtitle}>
              Pick up to {MAX_SCENARIOS}. We'll build your lessons around these.
            </Text>
          </Animated.View>

          {/* Scenario cards */}
          <View style={styles.cardsSection}>
            {availableScenarios.map((scenario, i) => (
              <ScenarioCard
                key={scenario}
                label={scenario}
                selected={selected.includes(scenario)}
                disabled={atMax}
                onPress={() => toggleScenario(scenario)}
                index={i}
              />
            ))}

            {/* Custom scenarios */}
            {selected
              .filter(s => !availableScenarios.includes(s))
              .map((custom, i) => (
                <ScenarioCard
                  key={custom}
                  label={custom}
                  selected
                  disabled={false}
                  onPress={() => toggleScenario(custom)}
                  index={availableScenarios.length + i}
                  isCustom
                />
              ))}
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <GlassButton
            variant="primary"
            disabled={!isValid}
            onPress={handleContinue}
          >
            Continue
          </GlassButton>
        </View>

        {/* Add scenario sheet */}
        <AddScenarioSheet
          visible={showSheet}
          onClose={() => setShowSheet(false)}
          onAdd={handleAddCustom}
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
    paddingBottom: spacing.md,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  header: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    flex: 1,
    lineHeight: typography.fontSize['3xl'] * 1.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 54, 255, 0.12)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  counterText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.display.semibold,
    color: colors.primary.light,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 54, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },

  // ─── Scenario cards ───────────────────────────────
  cardsSection: {
    gap: spacing.sm,
  },
  scenarioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scenarioCardSelected: {
    backgroundColor: 'rgba(0, 54, 255, 0.14)',
  },
  scenarioCardDisabled: {
    opacity: 0.35,
  },

  // Check circle
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkCircleSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },

  // Label
  scenarioLabel: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.body.medium,
    color: colors.text.secondary,
  },
  scenarioLabelSelected: {
    color: colors.text.primary,
    fontFamily: fonts.display.semibold,
  },
  scenarioLabelDisabled: {
    color: colors.text.disabled,
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
  sheetInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  sheetInput: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.primary,
  },
  sheetHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.disabled,
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.xl,
  },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
