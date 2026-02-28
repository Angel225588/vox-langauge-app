/**
 * Feedback History Screen
 *
 * Shows all session feedback in a scrollable list, grouped by date.
 * Each card shows: type icon, scenario title, time, score ring, and AI insight.
 * Tapping a card navigates to the existing feedback-detail screen.
 *
 * Data source: Supabase conversation_sessions (with feedback).
 * For dev/demo: uses MOCK_SESSIONS until real data is wired.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, glass } from '@/constants/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────

type SessionType = 'voice' | 'lesson' | 'reading' | 'writing' | 'listening';

interface FeedbackSession {
  id: string;
  type: SessionType;
  title: string;
  scenario: string;
  date: Date;
  durationMinutes: number;
  score: number;
  insight: string;
  insightType: 'strength' | 'improve' | 'progress';
  feedback?: {
    articulation: number;
    fluency: number;
    communication: number;
    scenario: number;
    summary: string;
    strengths: string[];
    improvements: string[];
  };
}

type FilterKey = 'all' | SessionType;

// ─── Constants ───────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'voice', label: 'Voice' },
  { key: 'lesson', label: 'Lessons' },
  { key: 'reading', label: 'Reading' },
  { key: 'writing', label: 'Writing' },
  { key: 'listening', label: 'Listening' },
];

const TYPE_CONFIG: Record<SessionType, {
  icon: string;
  gradientColors: readonly [string, string];
  borderColor: string;
  shadowColor: string;
  accentBar: readonly [string, string];
  cardBg: readonly [string, string];
  cardBorder: string;
}> = {
  voice: {
    icon: '\u{1F399}\uFE0F',
    gradientColors: ['rgba(0,54,255,0.18)', 'rgba(0,163,255,0.08)'],
    borderColor: 'rgba(0,54,255,0.20)',
    shadowColor: 'rgba(0,54,255,0.10)',
    accentBar: ['#0036FF', '#00A3FF'],
    cardBg: ['rgba(0,54,255,0.10)', 'rgba(0,54,255,0.03)'],
    cardBorder: 'rgba(0,54,255,0.18)',
  },
  lesson: {
    icon: '\u{1F4D8}',
    gradientColors: ['rgba(0,163,255,0.18)', 'rgba(6,214,160,0.08)'],
    borderColor: 'rgba(0,163,255,0.20)',
    shadowColor: 'rgba(0,163,255,0.10)',
    accentBar: ['#00A3FF', '#06D6A0'],
    cardBg: ['rgba(0,163,255,0.10)', 'rgba(0,163,255,0.03)'],
    cardBorder: 'rgba(0,163,255,0.18)',
  },
  reading: {
    icon: '\u{1F4D6}',
    gradientColors: ['rgba(139,92,246,0.18)', 'rgba(99,102,241,0.08)'],
    borderColor: 'rgba(139,92,246,0.20)',
    shadowColor: 'rgba(139,92,246,0.10)',
    accentBar: ['#8B5CF6', '#6366F1'],
    cardBg: ['rgba(139,92,246,0.10)', 'rgba(139,92,246,0.03)'],
    cardBorder: 'rgba(139,92,246,0.18)',
  },
  writing: {
    icon: '\u270D\uFE0F',
    gradientColors: ['rgba(6,214,160,0.18)', 'rgba(16,185,129,0.08)'],
    borderColor: 'rgba(6,214,160,0.20)',
    shadowColor: 'rgba(6,214,160,0.10)',
    accentBar: ['#06D6A0', '#10B981'],
    cardBg: ['rgba(6,214,160,0.10)', 'rgba(6,214,160,0.03)'],
    cardBorder: 'rgba(6,214,160,0.18)',
  },
  listening: {
    icon: '\u{1F3A7}',
    gradientColors: ['rgba(245,158,11,0.18)', 'rgba(239,68,68,0.08)'],
    borderColor: 'rgba(245,158,11,0.20)',
    shadowColor: 'rgba(245,158,11,0.10)',
    accentBar: ['#F59E0B', '#EF4444'],
    cardBg: ['rgba(245,158,11,0.10)', 'rgba(245,158,11,0.03)'],
    cardBorder: 'rgba(245,158,11,0.18)',
  },
};

const INSIGHT_ACCENT: Record<string, readonly [string, string]> = {
  strength: ['#10B981', '#06D6A0'],
  improve: ['#F59E0B', '#EF4444'],
  progress: ['#0036FF', '#00A3FF'],
};

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_SESSIONS: FeedbackSession[] = [
  {
    id: '1', type: 'voice', title: 'Business Negotiation Call',
    scenario: 'Business Meeting \u2014 Negotiation',
    date: new Date(), durationMinutes: 12, score: 82,
    insight: 'Conditional verbs improved \u2014 used "would have been" correctly 4 times',
    insightType: 'strength',
    feedback: { articulation: 85, fluency: 78, communication: 80, scenario: 84, summary: 'Strong negotiation vocab', strengths: ['Conditionals', 'Vocab'], improvements: ['Fillers'] },
  },
  {
    id: '2', type: 'lesson', title: 'Formal Email Writing',
    scenario: 'Professional Writing \u2014 Emails',
    date: new Date(), durationMinutes: 8, score: 88,
    insight: 'Excellent register control \u2014 formal tone maintained throughout',
    insightType: 'strength',
    feedback: { articulation: 90, fluency: 85, communication: 88, scenario: 90, summary: 'Great formal register', strengths: ['Register', 'Structure'], improvements: [] },
  },
  {
    id: '3', type: 'reading', title: 'Medical Terminology',
    scenario: 'Medical \u2014 Terminology',
    date: new Date(Date.now() - 86400000), durationMinutes: 15, score: 71,
    insight: 'Latin-root words \u2014 "diagnosis" and "prognosis" pronunciation needs work',
    insightType: 'improve',
    feedback: { articulation: 68, fluency: 72, communication: 70, scenario: 74, summary: 'Latin roots need focus', strengths: ['Comprehension'], improvements: ['Latin roots', 'Pronunciation'] },
  },
  {
    id: '4', type: 'voice', title: 'Job Interview Practice',
    scenario: 'Professional \u2014 Job Interview',
    date: new Date(Date.now() - 86400000), durationMinutes: 18, score: 79,
    insight: 'STAR method improved \u2014 structured answers 40% more concise than last time',
    insightType: 'progress',
    feedback: { articulation: 80, fluency: 75, communication: 82, scenario: 78, summary: 'Better structure', strengths: ['Structure'], improvements: ['Confidence'] },
  },
  {
    id: '5', type: 'listening', title: 'Earnings Call Comprehension',
    scenario: 'Business \u2014 Earnings Call',
    date: new Date(Date.now() - 86400000), durationMinutes: 14, score: 68,
    insight: 'Financial jargon gaps \u2014 "quarterly guidance" misunderstood in context',
    insightType: 'improve',
    feedback: { articulation: 65, fluency: 70, communication: 66, scenario: 72, summary: 'Finance vocab needs work', strengths: [], improvements: ['Finance vocab', 'Fast speech'] },
  },
  {
    id: '6', type: 'writing', title: 'Client Proposal Draft',
    scenario: 'Business Writing \u2014 Proposals',
    date: new Date(Date.now() - 172800000), durationMinutes: 10, score: 85,
    insight: 'Persuasive language mastery \u2014 effective use of "I\'d recommend"',
    insightType: 'strength',
    feedback: { articulation: 88, fluency: 82, communication: 86, scenario: 84, summary: 'Persuasive writing strong', strengths: ['Persuasion', 'Formal tone'], improvements: [] },
  },
  {
    id: '7', type: 'voice', title: 'Restaurant Ordering',
    scenario: 'Daily Life \u2014 Restaurant',
    date: new Date(Date.now() - 172800000), durationMinutes: 6, score: 91,
    insight: 'Natural conversation flow \u2014 zero hesitation on food vocabulary',
    insightType: 'strength',
    feedback: { articulation: 92, fluency: 90, communication: 91, scenario: 92, summary: 'Excellent casual flow', strengths: ['Fluency', 'Vocab'], improvements: [] },
  },
];

// ─── Helpers ─────────────────────────────────────────────────

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 65) return '#F59E0B';
  return '#EF4444';
}

function getScoreShadow(score: number): string {
  if (score >= 80) return 'rgba(16,185,129,0.3)';
  if (score >= 65) return 'rgba(245,158,11,0.3)';
  return 'rgba(239,68,68,0.3)';
}

// ─── Score Ring ──────────────────────────────────────────────

const HERO_RING_SIZE = 64;
const HERO_RING_STROKE = 5;
const HERO_RING_R = (HERO_RING_SIZE - HERO_RING_STROKE) / 2;
const HERO_RING_C = 2 * Math.PI * HERO_RING_R;

const CARD_RING_SIZE = 44;
const CARD_RING_STROKE = 3.5;
const CARD_RING_R = (CARD_RING_SIZE - CARD_RING_STROKE) / 2;
const CARD_RING_C = 2 * Math.PI * CARD_RING_R;

function HeroScoreRing({ score }: { score: number }) {
  const offset = HERO_RING_C * (1 - score / 100);
  return (
    <View style={styles.heroRingWrap}>
      <Svg width={HERO_RING_SIZE} height={HERO_RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0036FF" />
            <Stop offset="100%" stopColor="#00A3FF" />
          </SvgGradient>
        </Defs>
        <Circle
          cx={HERO_RING_SIZE / 2} cy={HERO_RING_SIZE / 2} r={HERO_RING_R}
          stroke="rgba(255,255,255,0.05)" strokeWidth={HERO_RING_STROKE} fill="transparent"
        />
        <Circle
          cx={HERO_RING_SIZE / 2} cy={HERO_RING_SIZE / 2} r={HERO_RING_R}
          stroke="url(#heroRingGrad)" strokeWidth={HERO_RING_STROKE} fill="transparent"
          strokeLinecap="round" strokeDasharray={HERO_RING_C} strokeDashoffset={offset}
        />
      </Svg>
      <Text style={styles.heroRingValue}>{score}</Text>
    </View>
  );
}

function CardScoreRing({ score }: { score: number }) {
  const offset = CARD_RING_C * (1 - score / 100);
  const strokeColor = getScoreColor(score);
  return (
    <View style={styles.cardRingWrap}>
      <Svg width={CARD_RING_SIZE} height={CARD_RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={CARD_RING_SIZE / 2} cy={CARD_RING_SIZE / 2} r={CARD_RING_R}
          stroke="rgba(255,255,255,0.04)" strokeWidth={CARD_RING_STROKE} fill="transparent"
        />
        <Circle
          cx={CARD_RING_SIZE / 2} cy={CARD_RING_SIZE / 2} r={CARD_RING_R}
          stroke={strokeColor} strokeWidth={CARD_RING_STROKE} fill="transparent"
          strokeLinecap="round" strokeDasharray={CARD_RING_C} strokeDashoffset={offset}
        />
      </Svg>
      <Text style={styles.cardRingValue}>{score}</Text>
    </View>
  );
}

// ─── Filter Chip ─────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      {active && (
        <LinearGradient
          colors={['rgba(0,54,255,0.08)', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Session Card ────────────────────────────────────────────

function SessionCard({
  session,
  index,
  onPress,
}: {
  session: FeedbackSession;
  index: number;
  onPress: () => void;
}) {
  const config = TYPE_CONFIG[session.type];
  const insightColors = INSIGHT_ACCENT[session.insightType];

  return (
    <Animated.View entering={FadeInDown.duration(350).delay(60 + index * 40)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.cardOuter}
      >
        <LinearGradient
          colors={config.cardBg as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: config.cardBorder }]}
        >
          {/* Left accent bar */}
          <LinearGradient
            colors={config.accentBar as [string, string]}
            style={styles.accentBar}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          {/* Top Row: Icon + Meta + Score Ring */}
          <View style={styles.cardTop}>
          <LinearGradient
            colors={config.gradientColors as [string, string]}
            style={[styles.sessionIcon, { borderColor: config.borderColor }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.sessionIconText}>{config.icon}</Text>
          </LinearGradient>

          <View style={styles.cardMeta}>
            <Text style={styles.cardTitle} numberOfLines={1}>{session.title}</Text>
            <View style={styles.cardSubRow}>
              <Text style={styles.cardSub}>
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
              </Text>
              <View style={styles.subDot} />
              <Text style={styles.cardSub}>{session.durationMinutes} min</Text>
              <View style={styles.subDot} />
              <Text style={styles.cardSub}>{formatTime(session.date)}</Text>
            </View>
          </View>

          <CardScoreRing score={session.score} />
        </View>

        {/* Insight Line */}
        <View style={styles.insightLine}>
          <LinearGradient
            colors={insightColors as [string, string]}
            style={styles.insightAccent}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <Text style={styles.insightText} numberOfLines={2}>
            <Text style={styles.insightBold}>
              {session.insight.split('\u2014')[0]}
            </Text>
            {session.insight.includes('\u2014') ? '\u2014' + session.insight.split('\u2014').slice(1).join('\u2014') : ''}
          </Text>
          <View style={styles.insightArrow}>
            <Ionicons name="chevron-forward" size={14} color="#6B7280" />
          </View>
        </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────

export default function FeedbackHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filteredSessions = useMemo(() => {
    if (activeFilter === 'all') return MOCK_SESSIONS;
    return MOCK_SESSIONS.filter((s) => s.type === activeFilter);
  }, [activeFilter]);

  // Group sessions by date label
  const groupedSessions = useMemo(() => {
    const groups: { label: string; data: FeedbackSession[] }[] = [];
    let currentLabel = '';

    filteredSessions.forEach((session) => {
      const label = getDateLabel(session.date);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, data: [session] });
      } else {
        groups[groups.length - 1].data.push(session);
      }
    });

    return groups;
  }, [filteredSessions]);

  // Compute summary stats
  const stats = useMemo(() => {
    const sessions = MOCK_SESSIONS;
    const avgScore = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
      : 0;
    const voiceCount = sessions.filter((s) => s.type === 'voice').length;
    const practiceCount = sessions.filter((s) => ['reading', 'writing', 'listening'].includes(s.type)).length;
    const lessonCount = sessions.filter((s) => s.type === 'lesson').length;
    return { avgScore, voiceCount, practiceCount, lessonCount, total: sessions.length };
  }, []);

  const handleCardPress = useCallback((session: FeedbackSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/feedback-detail',
      params: {
        scores: session.feedback ? JSON.stringify(session.feedback) : undefined,
        scenario: session.scenario,
        stairTitle: session.title,
        stairId: session.id,
      },
    });
  }, [router]);

  const handleFilterPress = useCallback((key: FilterKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(key);
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        bounces
      >
        {/* ═══ Header ═══ */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Ionicons name="filter-outline" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Ionicons name="ellipsis-vertical" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerTitle}>Your Feedback</Text>
          <Text style={styles.headerSubtitle}>
            {stats.total} sessions \u00B7 4 weeks
          </Text>
        </Animated.View>

        {/* ═══ Summary Card ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <View style={styles.summaryOuter}>
            {/* Outer glow shadow layer */}
            <View style={styles.summaryGlow} />
            <LinearGradient
              colors={['rgba(0,54,255,0.14)', 'rgba(0,20,60,0.7)', 'rgba(0,163,255,0.08)']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              {/* Top-right glow orb */}
              <View style={styles.glowOrb} />
              {/* Bottom-left subtle glow */}
              <View style={styles.glowOrbBottom} />

              <View style={styles.summaryTop}>
              <HeroScoreRing score={stats.avgScore} />
              <View style={styles.summaryInfo}>
                <View style={styles.cefrBadge}>
                  <LinearGradient
                    colors={['#0036FF', '#00A3FF']}
                    style={styles.cefrSquare}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.cefrSquareText}>B1</Text>
                  </LinearGradient>
                  <Text style={styles.cefrLabel}>Intermediate</Text>
                </View>
                <Text style={styles.summaryTitle}>Overall Performance</Text>
                <View style={styles.trendLine}>
                  <Ionicons name="trending-up" size={14} color="#10B981" />
                  <Text style={styles.trendText}>+8 points this week</Text>
                </View>
              </View>
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{stats.voiceCount}</Text>
                <Text style={styles.miniStatLabel}>Voice</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{stats.practiceCount}</Text>
                <Text style={styles.miniStatLabel}>Practice</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{stats.lessonCount}</Text>
                <Text style={styles.miniStatLabel}>Lessons</Text>
              </View>
            </View>
          </LinearGradient>
          </View>
        </Animated.View>

        {/* ═══ Filter Chips (Horizontal Scroll) ═══ */}
        <Animated.View entering={FadeIn.duration(300).delay(100)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            bounces={false}
          >
            {FILTERS.map((f) => (
              <FilterChip
                key={f.key}
                label={f.label}
                active={activeFilter === f.key}
                onPress={() => handleFilterPress(f.key)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* ═══ Session List (Grouped by Date) ═══ */}
        {groupedSessions.map((group) => (
          <View key={group.label}>
            {/* Date Divider */}
            <View style={styles.dateDivider}>
              <Text style={styles.dateLabel}>{group.label}</Text>
              <View style={styles.dateLine} />
            </View>

            {/* Session Cards */}
            {group.data.map((session, i) => (
              <SessionCard
                key={session.id}
                session={session}
                index={i}
                onPress={() => handleCardPress(session)}
              />
            ))}
          </View>
        ))}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    paddingBottom: spacing['2xl'],
  },

  // ── Header ──
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md + 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: glass.surface.light,
    borderWidth: 1,
    borderColor: glass.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: glass.surface.light,
    borderWidth: 1,
    borderColor: glass.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
  },

  // ── Summary Card ──
  summaryOuter: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  summaryGlow: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    bottom: -4,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(0,54,255,0.12)',
    // Simulates a diffused glow beneath the card
  },
  summaryCard: {
    padding: spacing.md + 4,
    borderRadius: borderRadius.xl - 4,
    borderWidth: 1.5,
    borderColor: 'rgba(0,54,255,0.22)',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0,54,255,0.16)',
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,163,255,0.08)',
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    marginBottom: spacing.md + 2,
  },
  heroRingWrap: {
    width: HERO_RING_SIZE,
    height: HERO_RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingValue: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  summaryInfo: {
    flex: 1,
  },
  cefrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingRight: 10,
    paddingVertical: 3,
    paddingLeft: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0,54,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,54,255,0.20)',
    marginBottom: 6,
  },
  cefrSquare: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cefrSquareText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cefrLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D6BFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  trendLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  miniStat: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(0,54,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,54,255,0.12)',
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Filter Chips ──
  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md + 4,
    gap: 6,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: 'rgba(0,54,255,0.15)',
    borderColor: 'rgba(0,54,255,0.30)',
  },
  chipInactive: {
    backgroundColor: glass.surface.thin,
    borderColor: glass.border.subtle,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.text.primary,
  },
  chipTextInactive: {
    color: colors.text.disabled,
  },

  // ── Date Divider ──
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: 10,
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: glass.border.subtle,
  },

  // ── Session Card ──
  cardOuter: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm + 2,
  },
  card: {
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '100%',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4,
    marginBottom: spacing.sm + 6,
  },
  sessionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sessionIconText: {
    fontSize: 19,
  },
  cardMeta: {
    flex: 1,
    marginLeft: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  cardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSub: {
    fontSize: 12,
    color: colors.text.disabled,
  },
  subDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4B5563',
  },
  cardRingWrap: {
    width: CARD_RING_SIZE,
    height: CARD_RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRingValue: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },

  // ── Insight Line ──
  insightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: spacing.md - 4,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.035)',
  },
  insightAccent: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  insightBold: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  insightArrow: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
