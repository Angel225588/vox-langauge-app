/**
 * Practice Tab — Practice Zone
 *
 * Precision instrument layout: Articulation hero + daily gauge,
 * quick action pills, voice CTA, glass practice rows.
 * Matches the prototype's data-driven, professional aesthetic.
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { VoxIcon } from '@/components/ui/rewards';
import { Icon } from '@/components/ui/Icon';
import { CompetencyGauge } from '@/components/profile/CompetencyGauge';

// ─── MOCK DATA ───
const MOCK = {
  totalPoints: 1250,
  streak: 5,
  articulation: 74,
  articulationChange: '+5',
  dailyPercent: 45,
  fluency: 72,
  wordsLearned: 342,
};

// ─── PRACTICE ACTIVITIES ───
const PRACTICE_ITEMS = [
  {
    icon: 'layers-outline' as const,
    title: 'Vocabulary',
    subtitle: '5-card flow',
    color: colors.success.DEFAULT,
    route: '/vocab-practice/vocab-1',
  },
  {
    icon: 'book-outline' as const,
    title: 'Reading',
    subtitle: 'Teleprompter & pronunciation',
    color: colors.accent.purple,
    route: '/library',
  },
  {
    icon: 'create-outline' as const,
    title: 'Writing',
    subtitle: 'Personal Script Builder',
    color: colors.warning.DEFAULT,
    route: '/test-writing-task',
  },
];

export default function PracticeScreen() {
  const router = useRouter();
  const [showDevTools, setShowDevTools] = useState(false);

  // Animated progress bar for articulation
  const articulationWidth = useSharedValue(0);

  useEffect(() => {
    articulationWidth.value = withDelay(
      600,
      withTiming(MOCK.articulation, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const articulationBarStyle = useAnimatedStyle(() => ({
    width: `${articulationWidth.value}%`,
  }));

  // Navigation handlers
  const handleVoiceConversation = () => router.push('/voice-conversation');
  const handleQuickAction = (id: string) => {
    router.push('/vocab-practice/vocab-1');
  };

  // Dev tool handlers
  const handleVoiceSystemTest = () => router.push('/test-voice-system');
  const handleElevenLabsTest = () => router.push('/test-elevenlabs');
  const handleGeminiTest = () => router.push('/test-gemini-live');
  const handleTestCards = () => router.push('/test-cards');
  const handleInteractiveScenario = () => router.push('/test-interactive-scenario');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
      {/* Header: Points + Streak (right aligned) */}
      <View style={s.header}>
        <View />
        <View style={s.headerStats}>
          <TouchableOpacity style={s.statPill} activeOpacity={0.7}>
            <VoxIcon size="sm" />
            <Text style={s.statText}>{MOCK.totalPoints.toLocaleString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.statPill} activeOpacity={0.7}>
            <Icon name="flame" size={18} color="warning" />
            <Text style={s.statText}>{MOCK.streak}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ═══ KPI ROW: Articulation Hero + Daily Gauge + Mini KPIs ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={s.kpiRow}>
          {/* Articulation Hero (left) */}
          <View style={s.articulationCard}>
            <Text style={s.kpiLabel}>ARTICULATION</Text>
            <View style={s.articulationValueRow}>
              <Text style={s.articulationValue}>{MOCK.articulation}</Text>
              <Text style={s.articulationMax}> / 100</Text>
            </View>
            {/* Progress bar */}
            <View style={s.articulationBarTrack}>
              <Animated.View style={[s.articulationBarFill, articulationBarStyle]}>
                <LinearGradient
                  colors={[colors.primary.DEFAULT, colors.accent.cyan]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 4 }}
                />
              </Animated.View>
            </View>
            {/* Trend */}
            <View style={s.trendRow}>
              <Ionicons name="arrow-up" size={10} color={colors.success.DEFAULT} />
              <Text style={s.trendText}>{MOCK.articulationChange} this week</Text>
            </View>
          </View>

          {/* Right column: Daily Gauge + Mini KPIs */}
          <View style={s.rightColumn}>
            {/* Daily gauge */}
            <View style={s.dailyGaugeCard}>
              <CompetencyGauge
                value={MOCK.dailyPercent}
                maxValue={100}
                color={colors.primary.DEFAULT}
                size={64}
                label="Daily"
                suffix="%"
              />
            </View>
            {/* Mini KPIs */}
            <View style={s.miniKpiRow}>
              <View style={s.miniKpiCard}>
                <Text style={s.miniKpiLabel}>FLUENCY</Text>
                <Text style={[s.miniKpiValue, { color: colors.primary.light }]}>
                  {MOCK.fluency}%
                </Text>
              </View>
              <View style={s.miniKpiCard}>
                <Text style={s.miniKpiLabel}>WORDS</Text>
                <Text style={[s.miniKpiValue, { color: colors.success.DEFAULT }]}>
                  {MOCK.wordsLearned}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ═══ QUICK ACTIONS ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)} style={s.quickActionsRow}>
          {[
            { icon: 'flash' as const, label: 'Sprint' },
            { icon: 'dice-outline' as const, label: 'Random' },
            { icon: 'fitness-outline' as const, label: 'Weak Words' },
          ].map((action, i) => (
            <TouchableOpacity
              key={action.label}
              style={s.quickActionPill}
              activeOpacity={0.7}
              onPress={() => handleQuickAction(action.label)}
            >
              <Ionicons name={action.icon} size={14} color={colors.primary.light} />
              <Text style={s.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ═══ VOICE CONVERSATION HERO ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
          <TouchableOpacity
            onPress={handleVoiceConversation}
            activeOpacity={0.9}
            style={{ marginBottom: spacing.md }}
          >
            <LinearGradient
              colors={['#0066FF', '#004ACC', '#003399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.voiceHero}
            >
              <View style={s.voiceHeroInner}>
                <View style={s.voiceIconBox}>
                  <Ionicons name="mic" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.voiceTitleRow}>
                    <Text style={s.voiceTitle}>Voice Conversation</Text>
                    <View style={s.aiBadge}>
                      <Text style={s.aiBadgeText}>AI</Text>
                    </View>
                  </View>
                  <Text style={s.voiceSubtitle}>Fluency & articulation practice</Text>
                </View>
                <View style={s.voicePlayBtn}>
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ═══ PRACTICE ACTIVITIES (Glass Rows) ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          {PRACTICE_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.title}
              style={s.practiceRow}
              activeOpacity={0.7}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[s.practiceIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.practiceTitle}>{item.title}</Text>
                <Text style={s.practiceSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={s.practiceArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ═══ DEV TOOLS (Collapsed) ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={{ marginTop: spacing.xl }}>
          <TouchableOpacity
            onPress={() => setShowDevTools(!showDevTools)}
            activeOpacity={0.7}
            style={s.devToolsHeader}
          >
            <Text style={s.devToolsLabel}>Developer Tools</Text>
            <Ionicons
              name={showDevTools ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>

          {showDevTools && (
            <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
              {[
                { label: 'Test All Cards', icon: 'grid' as const, onPress: handleTestCards, tag: 'DEV', tagColor: colors.text.tertiary },
                { label: 'Voice System Test', icon: 'mic-outline' as const, onPress: handleVoiceSystemTest, tag: 'REC', tagColor: colors.success.DEFAULT },
                { label: 'ElevenLabs Voice Test', icon: 'chatbubble-outline' as const, onPress: handleElevenLabsTest, tag: 'NEW', tagColor: colors.primary.light },
                { label: 'Gemini Live API Test', icon: 'flash-outline' as const, onPress: handleGeminiTest, tag: 'DEV', tagColor: colors.text.tertiary },
                { label: 'Interactive Scenarios', icon: 'chatbubbles-outline' as const, onPress: handleInteractiveScenario, tag: 'NEW', tagColor: colors.secondary.DEFAULT },
              ].map((tool) => (
                <TouchableOpacity
                  key={tool.label}
                  onPress={tool.onPress}
                  style={s.devToolRow}
                >
                  <Ionicons name={tool.icon} size={18} color={colors.text.tertiary} style={{ marginRight: spacing.sm }} />
                  <Text style={{ flex: 1, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                    {tool.label}
                  </Text>
                  <View style={[s.devTag, { backgroundColor: tool.tagColor + '30' }]}>
                    <Text style={[s.devTagText, { color: tool.tagColor }]}>{tool.tag}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const s = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Scroll
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
  },

  // ─── KPI ROW ───
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },

  // Articulation hero card
  articulationCard: {
    flex: 1,
    backgroundColor: colors.overlay.light5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    padding: 14,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  articulationValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  articulationValue: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary.light,
    letterSpacing: -1,
  },
  articulationMax: {
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
  },
  articulationBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.overlay.light8,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  articulationBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: spacing.xs,
  },
  trendText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.DEFAULT,
  },

  // Right column
  rightColumn: {
    width: 108,
    gap: spacing.sm,
  },
  dailyGaugeCard: {
    backgroundColor: colors.overlay.light5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    padding: 10,
    alignItems: 'center',
  },
  miniKpiRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniKpiCard: {
    flex: 1,
    backgroundColor: colors.overlay.light5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    padding: 7,
    alignItems: 'center',
  },
  miniKpiLabel: {
    fontSize: 7,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  miniKpiValue: {
    fontSize: 13,
    fontWeight: '800',
  },

  // ─── QUICK ACTIONS ───
  quickActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  quickActionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.overlay.light5,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // ─── VOICE HERO ───
  voiceHero: {
    borderRadius: 16,
    shadowColor: '#0047CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  voiceHeroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  voiceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  voiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  voiceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiBadge: {
    backgroundColor: 'rgba(0,210,255,0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  aiBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accent.cyan,
    letterSpacing: 0.8,
  },
  voiceSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.6)',
  },
  voicePlayBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── PRACTICE ROWS ───
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.overlay.light5,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  practiceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.1,
  },
  practiceSubtitle: {
    fontSize: 10.5,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  practiceArrow: {
    fontSize: 10,
    color: colors.text.disabled,
  },

  // ─── DEV TOOLS ───
  devToolsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  devToolsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  devToolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  devTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  devTagText: {
    fontSize: typography.fontSize.xs,
  },
});
