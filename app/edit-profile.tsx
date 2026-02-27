/**
 * Edit Profile Screen
 *
 * Single form to edit all profile fields — saves directly to V3 Zustand store.
 * Replaces routing to old V2 onboarding screens.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, glass } from '@/constants/designSystem';
import {
  useOnboardingV3,
  type TargetLanguage,
  type ProficiencyLevel,
} from '@/hooks/useOnboardingV3';

// ─── Option Data ─────────────────────────────────────

const LANGUAGES: { id: TargetLanguage; label: string; flag: string }[] = [
  { id: 'english', label: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
  { id: 'french', label: 'French', flag: '\u{1F1EB}\u{1F1F7}' },
  { id: 'spanish', label: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}' },
];

const LEVELS: { id: ProficiencyLevel; label: string; description: string }[] = [
  { id: 'starting_fresh', label: 'Fresh start', description: "Starting from zero" },
  { id: 'basics', label: 'Basics', description: 'Some words and phrases' },
  { id: 'conversational', label: 'Conversational', description: 'Can hold basic conversations' },
  { id: 'confident', label: 'Confident', description: 'Communicate well, want to refine' },
  { id: 'near_fluent', label: 'Near fluent', description: 'Advanced, need professional polish' },
];

const GOALS: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'lead_present', label: 'Lead meetings & present', icon: 'mic-outline' },
  { id: 'conversations', label: 'Professional conversations', icon: 'chatbubbles-outline' },
  { id: 'write_communicate', label: 'Write & communicate clearly', icon: 'document-text-outline' },
  { id: 'live_abroad', label: 'Live in a new country', icon: 'globe-outline' },
  { id: 'connect_people', label: 'Connect with people', icon: 'people-outline' },
];

const PROFESSIONS: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'healthcare', label: 'Healthcare', icon: 'medkit-outline' },
  { id: 'tech_engineering', label: 'Tech & Engineering', icon: 'code-slash-outline' },
  { id: 'business_finance', label: 'Business & Finance', icon: 'briefcase-outline' },
  { id: 'legal', label: 'Legal', icon: 'shield-checkmark-outline' },
  { id: 'sales_retail', label: 'Sales & Marketing', icon: 'trending-up-outline' },
  { id: 'hospitality_tourism', label: 'Hospitality & Tourism', icon: 'bed-outline' },
  { id: 'education', label: 'Education', icon: 'school-outline' },
  { id: 'government_diplomacy', label: 'Government & Diplomacy', icon: 'flag-outline' },
  { id: 'creative_media', label: 'Creative & Media', icon: 'color-palette-outline' },
];

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

const SCHEDULE_TIME_OPTIONS = [15, 30, 45, 60];
const SCHEDULE_DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const MAX_SCENARIOS = 5;

// ─── Component ───────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();
  const store = useOnboardingV3();
  const v3 = store.getOnboardingData();

  // Local editing state — initialized from store
  const [firstName, setFirstName] = useState(v3.first_name);
  const [targetLang, setTargetLang] = useState<TargetLanguage | null>(v3.target_language);
  const [level, setLevel] = useState<ProficiencyLevel | null>(v3.proficiency_level);
  const [goal, setGoal] = useState(v3.goal);
  const [goalCustom, setGoalCustom] = useState(v3.goal_custom);
  const [profession, setProfession] = useState(v3.profession);
  const [professionCustom, setProfessionCustom] = useState(v3.profession_custom);
  const [scenarios, setScenarios] = useState<string[]>([...v3.scenarios]);
  const [customScenarios, setCustomScenarios] = useState<string[]>([...v3.custom_scenarios]);
  const [newScenario, setNewScenario] = useState('');
  const [scheduleTime, setScheduleTime] = useState<number | null>(v3.schedule_time);
  const [scheduleDays, setScheduleDays] = useState<number | null>(v3.schedule_days);

  const toggleScenario = (s: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (scenarios.includes(s)) {
      setScenarios(scenarios.filter(x => x !== s));
    } else if (scenarios.length < MAX_SCENARIOS) {
      setScenarios([...scenarios, s]);
    }
  };

  const addCustomScenario = () => {
    const trimmed = newScenario.trim();
    if (!trimmed) return;
    if (scenarios.length >= MAX_SCENARIOS) return;
    if (!scenarios.includes(trimmed)) {
      setScenarios([...scenarios, trimmed]);
      setCustomScenarios([...customScenarios, trimmed]);
    }
    setNewScenario('');
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    store.setField('first_name', firstName.trim());
    store.setField('target_language', targetLang);
    store.setField('proficiency_level', level);
    store.setField('goal', goal);
    store.setField('goal_custom', goalCustom.trim());
    store.setField('profession', profession);
    store.setField('profession_custom', professionCustom.trim());
    store.setField('scenarios', scenarios);
    store.setField('custom_scenarios', customScenarios);
    store.setField('schedule_time', scheduleTime);
    store.setField('schedule_days', scheduleDays);

    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 36 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Name ── */}
            <Animated.View entering={FadeInDown.duration(300)} style={styles.section}>
              <Text style={styles.sectionTitle}>Name</Text>
              <View style={styles.card}>
                <TextInput
                  style={styles.textInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Your first name"
                  placeholderTextColor={colors.text.disabled}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>
            </Animated.View>

            {/* ── Target Language ── */}
            <Animated.View entering={FadeInDown.duration(300).delay(50)} style={styles.section}>
              <Text style={styles.sectionTitle}>Target Language</Text>
              <View style={styles.chipRow}>
                {LANGUAGES.map(lang => {
                  const selected = targetLang === lang.id;
                  return (
                    <TouchableOpacity
                      key={lang.id}
                      style={[styles.langCard, selected && styles.langCardSelected]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTargetLang(lang.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.langFlag}>{lang.flag}</Text>
                      <Text style={[styles.langLabel, selected && styles.langLabelSelected]}>
                        {lang.label}
                      </Text>
                      {selected && (
                        <View style={styles.checkCircle}>
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* ── Level ── */}
            <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.section}>
              <Text style={styles.sectionTitle}>Level</Text>
              <View style={styles.card}>
                {LEVELS.map(lv => {
                  const selected = level === lv.id;
                  return (
                    <TouchableOpacity
                      key={lv.id}
                      style={[styles.levelRow, selected && styles.levelRowSelected]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setLevel(lv.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                        {selected && <View style={styles.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.levelLabel, selected && styles.levelLabelSelected]}>
                          {lv.label}
                        </Text>
                        <Text style={styles.levelDesc}>{lv.description}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* ── Goal ── */}
            <Animated.View entering={FadeInDown.duration(300).delay(150)} style={styles.section}>
              <Text style={styles.sectionTitle}>Goal</Text>
              <View style={styles.chipRow}>
                {GOALS.map(g => {
                  const selected = goal === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setGoal(g.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={g.icon}
                        size={16}
                        color={selected ? colors.primary.light : colors.text.tertiary}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={[styles.card, { marginTop: spacing.sm }]}>
                <TextInput
                  style={styles.textInput}
                  value={goalCustom}
                  onChangeText={setGoalCustom}
                  placeholder="Or describe your own goal..."
                  placeholderTextColor={colors.text.disabled}
                  returnKeyType="done"
                />
              </View>
            </Animated.View>

            {/* ── Profession ── */}
            <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.section}>
              <Text style={styles.sectionTitle}>Profession</Text>
              <View style={styles.chipRow}>
                {PROFESSIONS.map(p => {
                  const selected = profession === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setProfession(p.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={p.icon}
                        size={16}
                        color={selected ? colors.primary.light : colors.text.tertiary}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={[styles.card, { marginTop: spacing.sm }]}>
                <TextInput
                  style={styles.textInput}
                  value={professionCustom}
                  onChangeText={setProfessionCustom}
                  placeholder="Or type your profession..."
                  placeholderTextColor={colors.text.disabled}
                  returnKeyType="done"
                />
              </View>
            </Animated.View>

            {/* ── Scenarios ── */}
            <Animated.View entering={FadeInDown.duration(300).delay(250)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Scenarios</Text>
                <Text style={styles.counterBadge}>
                  {scenarios.length}/{MAX_SCENARIOS}
                </Text>
              </View>
              <View style={styles.chipRow}>
                {DEFAULT_SCENARIOS.map(s => {
                  const selected = scenarios.includes(s);
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleScenario(s)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {selected ? '\u2713 ' : ''}{s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {/* Show custom scenarios that aren't in defaults */}
                {customScenarios
                  .filter(s => !DEFAULT_SCENARIOS.includes(s))
                  .map(s => {
                    const selected = scenarios.includes(s);
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[styles.chip, selected && styles.chipSelected]}
                        onPress={() => toggleScenario(s)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                          {selected ? '\u2713 ' : ''}{s}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
              {/* Add custom scenario */}
              <View style={[styles.card, { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center' }]}>
                <TextInput
                  style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                  value={newScenario}
                  onChangeText={setNewScenario}
                  placeholder="Add custom scenario..."
                  placeholderTextColor={colors.text.disabled}
                  returnKeyType="done"
                  onSubmitEditing={addCustomScenario}
                />
                <TouchableOpacity
                  onPress={addCustomScenario}
                  style={styles.addButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color={colors.primary.light} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ── Schedule ── */}
            <Animated.View entering={FadeInDown.duration(300).delay(300)} style={styles.section}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <View style={styles.card}>
                <Text style={styles.scheduleLabel}>Minutes per session</Text>
                <View style={styles.pillRow}>
                  {SCHEDULE_TIME_OPTIONS.map(t => {
                    const selected = scheduleTime === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.pill, selected && styles.pillSelected]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setScheduleTime(t);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.scheduleLabel, { marginTop: spacing.lg }]}>Days per week</Text>
                <View style={styles.pillRow}>
                  {SCHEDULE_DAYS_OPTIONS.map(d => {
                    const selected = scheduleDays === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        style={[styles.pill, selected && styles.pillSelected]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setScheduleDays(d);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Animated.View>

            {/* ── Save Button ── */}
            <Animated.View entering={FadeInDown.duration(300).delay(350)} style={{ marginBottom: spacing['3xl'] }}>
              <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay.light8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  counterBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.light,
    backgroundColor: colors.overlay.primary10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },

  // Card
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
  },

  // Text input
  textInput: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },

  // Language cards
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  langCard: {
    flex: 1,
    minWidth: 95,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  langCardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.overlay.primary10,
  },
  langFlag: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  langLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  langLabelSelected: {
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },
  checkCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Level rows
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  levelRowSelected: {
    backgroundColor: colors.overlay.primary10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.DEFAULT,
  },
  levelLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  levelLabelSelected: {
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },
  levelDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 1,
  },

  // Chips (goals, professions, scenarios)
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
  },
  chipSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.overlay.primary10,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  chipTextSelected: {
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },

  // Add scenario button
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay.primary10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  // Schedule
  scheduleLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.overlay.primary10,
  },
  pillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  pillTextSelected: {
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },

  // Save button
  saveButton: {
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
