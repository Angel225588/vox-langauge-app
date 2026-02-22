/**
 * Competency Dashboard Screen
 *
 * Visual overview of user's language competency across 4 KPIs.
 * Shows CEFR level, trends, per-skill breakdown, session history.
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useUserMetrics } from '@/hooks/useUserMetrics';
import { getNextCEFR } from '@/lib/metrics/competencyEngine';
import type { CompetencySnapshot } from '@/lib/db/competencyMetrics';

// ─── Palette ───
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  card2: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.06)',
  text: '#EEF0F6',
  sub: '#7E8BA4',
  dim: '#3E4862',
  blue: '#1A6DFF',
  cyan: '#00D2FF',
  green: '#10B981',
  gold: '#F59E0B',
  purple: '#818CF8',
  rose: '#F472B6',
  red: '#EF4444',
};

const KPI_CONFIG = [
  { key: 'articulation' as const, label: 'Articulation', icon: 'mic-outline' as const, color: C.cyan, desc: 'Pronunciation clarity' },
  { key: 'fluency' as const, label: 'Fluency', icon: 'water-outline' as const, color: C.blue, desc: 'Speaking flow' },
  { key: 'communication' as const, label: 'Communication', icon: 'chatbubbles-outline' as const, color: C.green, desc: 'Idea expression' },
  { key: 'scenario' as const, label: 'Scenario', icon: 'briefcase-outline' as const, color: C.gold, desc: 'Real-world handling' },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  conversation: { label: 'Voice', color: C.blue },
  reading: { label: 'Reading', color: C.purple },
  writing: { label: 'Writing', color: C.gold },
  listening: { label: 'Listening', color: C.rose },
};

export default function CompetencyDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { metrics, loading } = useUserMetrics();
  const snapshot = metrics.snapshot;

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.blue} />
          <Text style={s.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const data = snapshot;

  const nextCEFR = getNextCEFR(data.cefrLevel);

  return (
    <SafeAreaView style={s.container}>
      <Header onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ═══ CEFR LEVEL BADGE ═══ */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <View style={s.cefrCard}>
            <View style={s.cefrBadge}>
              <Text style={s.cefrLevel}>{data.cefrLevel}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cefrTitle}>Current Level</Text>
              <View style={s.cefrProgressBar}>
                <LinearGradient
                  colors={[C.blue, C.cyan]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[s.cefrProgressFill, { width: `${Math.max(5, data.cefrProgress)}%` as any }]}
                />
              </View>
              <Text style={s.cefrSub}>
                {data.cefrProgress}% to {nextCEFR}
              </Text>
            </View>
            <View style={s.sessionsBox}>
              <Text style={s.sessionsNum}>{data.totalSessions}</Text>
              <Text style={s.sessionsLabel}>sessions</Text>
            </View>
          </View>
        </Animated.View>

        {/* ═══ 4 KPI RINGS ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(60)} style={s.kpiGrid}>
          {KPI_CONFIG.map((kpi) => {
            const value = data.averages[kpi.key];
            const trend = data.trends.find(t => t.kpi === kpi.key);
            const trendIcon = trend?.direction === 'improving' ? 'trending-up'
              : trend?.direction === 'declining' ? 'trending-down'
              : 'remove-outline';
            const trendColor = trend?.direction === 'improving' ? C.green
              : trend?.direction === 'declining' ? C.red
              : C.dim;

            return (
              <View key={kpi.key} style={s.kpiCard}>
                {/* Ring */}
                <View style={[s.ring, { borderColor: kpi.color + '30' }]}>
                  <View style={[s.ringFill, {
                    borderColor: kpi.color,
                    borderTopColor: value > 25 ? kpi.color : 'transparent',
                    borderRightColor: value > 50 ? kpi.color : 'transparent',
                    borderBottomColor: value > 75 ? kpi.color : 'transparent',
                    borderLeftColor: value > 0 ? kpi.color : 'transparent',
                  }]} />
                  <Text style={[s.ringValue, { color: kpi.color }]}>{value}</Text>
                </View>
                <Text style={s.kpiLabel}>{kpi.label}</Text>
                {/* Trend */}
                <View style={s.trendRow}>
                  <Ionicons name={trendIcon as any} size={12} color={trendColor} />
                  {trend && trend.delta !== 0 && (
                    <Text style={[s.trendDelta, { color: trendColor }]}>
                      {trend.delta > 0 ? '+' : ''}{trend.delta}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* ═══ BY TYPE BREAKDOWN ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(120)}>
          <Text style={s.sectionTitle}>By Practice Type</Text>
          <View style={s.typeRow}>
            {(['conversation', 'reading', 'writing', 'listening'] as const).map((type) => {
              const info = TYPE_LABELS[type];
              const typeData = data.byType[type];
              return (
                <View key={type} style={s.typeCard}>
                  <View style={[s.typeDot, { backgroundColor: info.color }]} />
                  <Text style={s.typeLabel}>{info.label}</Text>
                  <Text style={[s.typeScore, { color: info.color }]}>
                    {typeData.count > 0 ? typeData.avg : '--'}
                  </Text>
                  <Text style={s.typeCount}>{typeData.count} {typeData.count === 1 ? 'session' : 'sessions'}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ═══ RECENT SESSIONS ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(180)}>
          <Text style={s.sectionTitle}>Recent Sessions</Text>
          {data.recentScores.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="bar-chart-outline" size={28} color={C.dim} />
              <Text style={s.emptyText}>Complete a practice session to see your progress here.</Text>
            </View>
          ) : (
            <View style={{ gap: 6 }}>
              {data.recentScores.slice(0, 15).map((score) => {
                const typeInfo = TYPE_LABELS[score.type] || { label: score.type, color: C.sub };
                const date = new Date(score.completedAt);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                return (
                  <View key={score.id} style={s.sessionRow}>
                    <View style={[s.sessionDot, { backgroundColor: typeInfo.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.sessionType}>{typeInfo.label}</Text>
                      <Text style={s.sessionDate}>{dateStr}</Text>
                    </View>
                    <View style={s.sessionScores}>
                      <Text style={[s.sessionScore, { color: C.cyan }]}>{score.articulation}</Text>
                      <Text style={s.sessionSep}>/</Text>
                      <Text style={[s.sessionScore, { color: C.blue }]}>{score.fluency}</Text>
                      <Text style={s.sessionSep}>/</Text>
                      <Text style={[s.sessionScore, { color: C.green }]}>{score.communication}</Text>
                      <Text style={s.sessionSep}>/</Text>
                      <Text style={[s.sessionScore, { color: C.gold }]}>{score.scenario}</Text>
                    </View>
                    <View style={s.overallBadge}>
                      <Text style={s.overallText}>{score.overallScore}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* ═══ KPI LEGEND ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(240)}>
          <Text style={s.sectionTitle}>What We Measure</Text>
          <View style={{ gap: 8 }}>
            {KPI_CONFIG.map((kpi) => (
              <View key={kpi.key} style={s.legendRow}>
                <Ionicons name={kpi.icon} size={16} color={kpi.color} />
                <View style={{ flex: 1 }}>
                  <Text style={s.legendLabel}>{kpi.label}</Text>
                  <Text style={s.legendDesc}>{kpi.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── HEADER ───
function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={C.text} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Your Progress</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

// ─── STYLES ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: 16, paddingBottom: 100 },
  loadingText: { color: C.sub, fontSize: 14, marginTop: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },

  // CEFR Card
  cefrCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card2, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 14,
  },
  cefrBadge: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.blue + '18', borderWidth: 1.5, borderColor: C.blue + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  cefrLevel: { fontSize: 18, fontWeight: '900', color: C.blue },
  cefrTitle: { fontSize: 11, fontWeight: '600', color: C.sub, marginBottom: 6 },
  cefrProgressBar: {
    height: 6, borderRadius: 3, backgroundColor: C.card,
    overflow: 'hidden', marginBottom: 4,
  },
  cefrProgressFill: { height: 6, borderRadius: 3 },
  cefrSub: { fontSize: 10, fontWeight: '600', color: C.dim },
  sessionsBox: { alignItems: 'center' },
  sessionsNum: { fontSize: 20, fontWeight: '800', color: C.text },
  sessionsLabel: { fontSize: 9, fontWeight: '600', color: C.dim, textTransform: 'uppercase' },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20,
  },
  kpiCard: {
    width: '48%' as any, backgroundColor: C.card, borderRadius: 14,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border,
    flexGrow: 1, flexBasis: '45%' as any,
  },
  ring: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  ringFill: {
    position: 'absolute', width: 56, height: 56, borderRadius: 28,
    borderWidth: 3,
  },
  ringValue: { fontSize: 18, fontWeight: '800' },
  kpiLabel: { fontSize: 11, fontWeight: '700', color: C.text, marginBottom: 2 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendDelta: { fontSize: 10, fontWeight: '700' },

  // Section
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: C.sub, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 10, marginTop: 4,
  },

  // By Type
  typeRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  typeCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 3,
  },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  typeLabel: { fontSize: 9, fontWeight: '700', color: C.sub, textTransform: 'uppercase' },
  typeScore: { fontSize: 18, fontWeight: '800' },
  typeCount: { fontSize: 8, color: C.dim },

  // Sessions
  sessionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: C.border,
  },
  sessionDot: { width: 4, height: 28, borderRadius: 2 },
  sessionType: { fontSize: 12, fontWeight: '700', color: C.text },
  sessionDate: { fontSize: 9, color: C.dim },
  sessionScores: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sessionScore: { fontSize: 11, fontWeight: '700' },
  sessionSep: { fontSize: 9, color: C.dim },
  overallBadge: {
    backgroundColor: C.card2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: C.border,
  },
  overallText: { fontSize: 13, fontWeight: '800', color: C.text },

  // Empty
  emptyCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 24,
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.border,
  },
  emptyText: { fontSize: 13, color: C.sub, textAlign: 'center' },

  // Legend
  legendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: C.border,
  },
  legendLabel: { fontSize: 12, fontWeight: '700', color: C.text },
  legendDesc: { fontSize: 10, color: C.sub },
});
