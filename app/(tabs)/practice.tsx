/**
 * Practice Tab — Practice Zone
 *
 * Premium dark dashboard: 3 KPI hero boxes, glassy daily sphere,
 * quick actions, voice conversation hero, 2×3 skill grid
 * (Vocabulary, Reading, Writing, Listening, Library, Flow).
 *
 * Sphere: glassy, smooth, peaceful — a safe space indicator.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { VoxIcon } from '@/components/ui/rewards';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { useUserMetrics } from '@/hooks/useUserMetrics';
import { glass } from '@/constants/designSystem';

// ─── PRACTICE ZONE PALETTE ───
const PZ = {
  bg: '#080B14',
  glass: 'rgba(255,255,255,0.05)',
  glass2: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.06)',
  blue: '#1A6DFF',
  blueLight: '#4D94FF',
  cyan: '#00D2FF',
  green: '#10B981',
  greenLight: '#34D399',
  gold: '#F59E0B',
  goldLight: '#FBBF24',
  purple: '#818CF8',
  rose: '#F472B6',
  text: '#EEF0F6',
  sub: '#7E8BA4',
  dim: '#3E4862',
};

// ─── GRID (routes wired to AI-powered practice screens) ───
const GRID_ITEMS = [
  { title: 'Vocabulary', sub: 'Word bank & review', icon: 'albums-outline' as const, color: PZ.green, route: '/vocabulary-dashboard', badge: '' },
  { title: 'Reading', sub: 'AI library', icon: 'book-outline' as const, color: PZ.purple, route: '/library', badge: '' },
  { title: 'Writing', sub: 'AI prompt', icon: 'create-outline' as const, color: PZ.gold, route: '/practice-writing', badge: '' },
  { title: 'Listening', sub: 'Comprehension', icon: 'headset-outline' as const, color: PZ.rose, route: '/practice-listening', badge: '' },
  { title: 'Library', sub: 'Scenario decks', icon: 'library-outline' as const, color: PZ.cyan, route: '/vox-library', badge: '' },
  { title: 'Flow', sub: 'Guided session', icon: 'water-outline' as const, color: PZ.cyan, route: '', badge: 'GUIDED' },
];

// ─── MAP PZ COLORS → GLASS CONTAINER WORLDS ───
const getWorld = (color: string) => {
  if (color === PZ.cyan) return glass.container.cyan;
  if (color === PZ.blueLight || color === PZ.blue) return glass.container.blue;
  if (color === PZ.green || color === PZ.greenLight) return glass.container.green;
  if (color === PZ.gold || color === PZ.goldLight) return glass.container.amber;
  if (color === PZ.purple) return glass.container.purple;
  if (color === PZ.rose) return glass.container.rose;
  return glass.container.blue;
};

// ═══════════════════════════════════════
// ANIMATED NUMBER COUNTER
// ═══════════════════════════════════════

function AnimNum({
  to,
  suffix = '',
  size = 22,
  color = PZ.text,
  delay = 200,
}: {
  to: number;
  suffix?: string;
  size?: number;
  color?: string;
  delay?: number;
}) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now();
      function tick() {
        const elapsed = Date.now() - start;
        const p = Math.min(elapsed / 1200, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * to));
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, delay]);

  return (
    <Text
      style={{
        fontSize: size,
        fontWeight: '800',
        color,
        letterSpacing: -0.5,
        fontVariant: ['tabular-nums'],
      }}
    >
      {val}{suffix}
    </Text>
  );
}

// ═══════════════════════════════════════
// GLASSY SPHERE
// Peaceful, smooth, safe-space indicator.
// Soft glow, gentle water fill, glass sheen.
// ═══════════════════════════════════════

function GlowSphere({ percent, size = 48 }: { percent: number; size?: number }) {
  let main = PZ.blue;
  let light = PZ.blueLight;
  let glowRGBA = 'rgba(26,109,255,0.30)';

  if (percent >= 80) {
    main = PZ.gold;
    light = PZ.goldLight;
    glowRGBA = 'rgba(245,158,11,0.35)';
  } else if (percent >= 50) {
    main = PZ.green;
    light = PZ.greenLight;
    glowRGBA = 'rgba(16,185,129,0.30)';
  }

  const waterHeight = (percent / 100) * size;

  // Gentle breathing pulse (4s, calm)
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.12]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.45, 0.80]),
  }));

  // Subtle wave motion (3.5s, serene)
  const wave = useSharedValue(0);
  useEffect(() => {
    wave.value = withRepeat(
      withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(wave.value, [0, 1], [-size * 0.06, size * 0.06]) },
    ],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {/* Soft outer glow */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size + 26,
            height: size + 26,
            borderRadius: (size + 26) / 2,
            backgroundColor: glowRGBA,
          },
          glowStyle,
        ]}
      />

      {/* Sphere body */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: 'rgba(8,11,20,0.95)',
          borderWidth: 1.5,
          borderColor: main + '25',
        }}
      >
        {/* Water fill */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: -2,
              right: -2,
              height: waterHeight,
            },
            waveStyle,
          ]}
        >
          <LinearGradient
            colors={[light + '70', main + '99']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ flex: 1 }}
          />
          {/* Wave surface highlight */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: -size * 0.15,
              right: -size * 0.15,
              height: Math.max(3, size * 0.06),
              backgroundColor: light + '25',
              borderRadius: size,
            }}
          />
        </Animated.View>

        {/* Glass reflection — soft top-left shine */}
        <LinearGradient
          colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.03)', 'transparent']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 0.65 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size * 0.6,
            height: size * 0.5,
            borderTopLeftRadius: size / 2,
            borderTopRightRadius: size / 4,
            borderBottomLeftRadius: size / 4,
          }}
        />

        {/* Inner rim — frosted edge */}
        <View
          style={{
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            borderRadius: size / 2,
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        />
      </View>

      {/* Center text */}
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <AnimNum to={percent} suffix="%" size={17} color="#fff" delay={500} />
        <Text
          style={{
            fontSize: 8,
            fontWeight: '600',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginTop: 1,
          }}
        >
          DAILY
        </Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════
// PRACTICE SCREEN
// ═══════════════════════════════════════

export default function PracticeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { metrics } = useUserMetrics();
  const [showDevTools, setShowDevTools] = useState(false);

  const getTrend = (kpi: string) => {
    const t = metrics.trends.find(tr => tr.kpi === kpi);
    if (!t || t.direction === 'stable') return '';
    return t.direction === 'improving' ? `+${t.delta}` : `${t.delta}`;
  };

  const KPI_ITEMS = [
    { label: 'Articulation', value: metrics.articulation, suffix: '/100', color: PZ.cyan, trend: getTrend('articulation') },
    { label: 'Fluency', value: metrics.fluency, suffix: '/100', color: PZ.blueLight, trend: getTrend('fluency') },
    { label: 'Communication', value: metrics.communication, suffix: '/100', color: PZ.green, trend: getTrend('communication') },
  ];

  const handleVoiceConversation = useCallback(() => {
    router.push('/voice-conversation');
  }, [router]);

  const QUICK_ACTIONS = [
    { icon: 'flash' as const, label: 'Sprint', color: PZ.gold, route: '/flashcard/session' },
    { icon: 'shuffle-outline' as const, label: 'Random', color: PZ.purple, route: '/vocabulary-dashboard' },
    { icon: 'fitness' as const, label: 'Weak', color: PZ.rose, route: '/vocabulary-dashboard' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PZ.bg }} edges={['top']}>
      {/* ═══ HEADER ═══ */}
      <Animated.View entering={FadeInDown.duration(300)} style={s.header}>
        <TouchableOpacity
          style={s.activityBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/activity-dashboard' as any)}
        >
          <Ionicons name="stats-chart" size={18} color={PZ.blueLight} />
        </TouchableOpacity>
        <View style={s.headerStats}>
          <TouchableOpacity style={s.statPill} activeOpacity={0.7}>
            <VoxIcon size="sm" />
            <Text style={[s.statValue, { color: PZ.blue }]}>
              {metrics.totalPoints.toLocaleString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.statPill} activeOpacity={0.7}>
            <Icon name="flame" size={18} color="warning" />
            <Text style={[s.statValue, { color: PZ.gold }]}>{metrics.streak}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        bounces
      >
        {/* ═══ KPI BOXES (tap to open dashboard) ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(40)} style={s.kpiRow}>
          {KPI_ITEMS.map((kpi, i) => {
            const world = getWorld(kpi.color);
            return (
              <TouchableOpacity
                key={kpi.label}
                style={{ flex: 1 }}
                activeOpacity={0.7}
                onPress={() => router.push('/competency-dashboard' as any)}
              >
                <LinearGradient
                  colors={world.gradient}
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={[s.kpiBox, {
                    borderColor: world.border,
                    borderTopColor: kpi.color + '80',
                    borderTopWidth: 3,
                  }]}
                >
                  <Text style={s.kpiLabel}>{kpi.label}</Text>
                  <View style={s.kpiValueRow}>
                    <AnimNum
                      to={kpi.value}
                      size={28}
                      color={kpi.color}
                      delay={300 + i * 100}
                    />
                    <Text style={s.kpiSuffix}>{kpi.suffix}</Text>
                  </View>
                  <View style={s.trendRow}>
                    {kpi.trend ? (
                      <Text style={[s.trendText, { color: kpi.trend.startsWith('+') ? PZ.green : PZ.rose }]}>
                        {kpi.trend.startsWith('+') ? '\u2191' : '\u2193'} {kpi.trend}
                      </Text>
                    ) : (
                      <Text style={[s.trendText, { color: PZ.dim }]}>{'\u2500'}</Text>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* ═══ SPHERE + QUICK ACTIONS ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(80)} style={s.sphereRow}>
          <GlowSphere percent={metrics.dailyPercent} size={68} />
          <View style={s.quickActions}>
            {QUICK_ACTIONS.map((action) => {
              const world = getWorld(action.color);
              return (
                <TouchableOpacity
                  key={action.label}
                  style={[s.quickBtn, {
                    backgroundColor: world.chipBg,
                    borderColor: world.chipBorder,
                  }]}
                  activeOpacity={0.7}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name={action.icon} size={13} color={action.color} />
                    <Text style={[s.quickBtnText, { color: action.color }]}>{action.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* ═══ VOICE CONVERSATION HERO ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)}>
          <TouchableOpacity
            onPress={handleVoiceConversation}
            activeOpacity={0.9}
            style={{ marginBottom: 10 }}
          >
            <LinearGradient
              colors={['#0077FF', '#0050CC', '#003399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.voiceHero}
            >
              {/* Decorative circle */}
              <View style={s.voiceDecor} />

              {/* AI badge */}
              <View style={s.aiBadge}>
                <Text style={s.aiBadgeText}>AI</Text>
              </View>

              <View style={s.voiceInner}>
                <View style={s.voiceMicBox}>
                  <Ionicons name="mic" size={22} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.voiceTitle}>Voice Conversation</Text>
                  <Text style={s.voiceSub}>Fluency & articulation practice</Text>
                </View>
                <View style={s.voicePlayBtn}>
                  <Text style={{ fontSize: 14, color: '#fff' }}>{'\u25B6'}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ═══ 2x3 PRACTICE GRID ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)} style={s.gridContainer}>
          {[0, 2, 4].map((startIdx) => {
            const row = GRID_ITEMS.slice(startIdx, startIdx + 2);
            if (row.length === 0) return null;
            return (
              <View key={startIdx} style={s.gridRow}>
                {row.map((card) => {
                  const world = getWorld(card.color);
                  return (
                    <TouchableOpacity
                      key={card.title}
                      style={{ flex: 1 }}
                      activeOpacity={0.7}
                      onPress={() => { if (card.route) router.push(card.route as any); }}
                    >
                      <LinearGradient
                        colors={world.gradient}
                        start={{ x: 0.1, y: 0 }}
                        end={{ x: 0.9, y: 1 }}
                        style={[s.gridCard, { borderColor: world.border }]}
                      >
                        <View
                          style={[
                            s.gridIconBox,
                            { backgroundColor: world.iconBg, borderColor: world.border },
                          ]}
                        >
                          <Ionicons name={card.icon} size={22} color={card.color} />
                        </View>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={s.gridTitle}>{card.title}</Text>
                            {card.badge ? (
                              <View style={[s.gridBadge, { backgroundColor: world.countBg }]}>
                                <Text style={[s.gridBadgeText, { color: world.countColor }]}>{card.badge}</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={s.gridSub}>{card.sub}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </Animated.View>

        {/* ═══ DEV TOOLS (collapsible) ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={{ marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => setShowDevTools(!showDevTools)}
            activeOpacity={0.7}
            style={s.devHeader}
          >
            <Text style={s.devLabel}>Developer Tools</Text>
            <Ionicons
              name={showDevTools ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={PZ.dim}
            />
          </TouchableOpacity>

          {showDevTools && (
            <View style={{ marginTop: 8, gap: 8 }}>
              {[
                { label: 'Onboarding V3', route: '/(auth)/onboarding-v3' },
                { label: 'Lesson Screen', route: '/lesson/dev-test' },
                { label: 'Lesson (Mock Preview)', route: '/lesson-carousel' },
                { label: 'Feedback \u2192 Lesson Complete', route: '/feedback-detail' },
                { label: 'Test All Cards', route: '/test-cards' },
                { label: 'Voice System Test', route: '/test-voice-system' },
                { label: 'ElevenLabs Voice Test', route: '/test-elevenlabs' },
                { label: 'Gemini Live API Test', route: '/test-gemini-live' },
                { label: 'Interactive Scenarios', route: '/test-interactive-scenario' },
              ].map((tool) => (
                <TouchableOpacity
                  key={tool.label}
                  onPress={() => router.push(tool.route as any)}
                  style={s.devRow}
                  activeOpacity={0.7}
                >
                  <Text style={s.devRowText}>{tool.label}</Text>
                  <Text style={{ color: PZ.dim, fontSize: 12 }}>{'\u2192'}</Text>
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
  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: glass.container.blue.chipBg,
    borderWidth: 1,
    borderColor: glass.container.blue.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Scroll ───
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // ─── KPIs ───
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  kpiBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    overflow: 'hidden' as const,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E8BA4',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  kpiSuffix: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3E4862',
    marginBottom: 1,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },

  // ─── Sphere Row ───
  sphereRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  quickActions: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EEF0F6',
  },

  // ─── Voice Hero ───
  voiceHero: {
    borderRadius: 18,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#0047DB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  voiceDecor: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 120,
    height: 90,
    borderRadius: 60,
    backgroundColor: 'rgba(0,210,255,0.06)',
  },
  aiBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,210,255,0.15)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    zIndex: 2,
  },
  aiBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00D2FF',
    letterSpacing: 0.8,
  },
  voiceInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceMicBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  voiceSub: {
    fontSize: 11.5,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  voicePlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ─── 2x3 Grid ───
  gridContainer: {
    gap: 8,
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridCard: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    minHeight: 110,
    overflow: 'hidden' as const,
  },
  gridIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EEF0F6',
    letterSpacing: -0.2,
  },
  gridSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7E8BA4',
    marginTop: 1,
  },
  gridBadge: {
    backgroundColor: 'rgba(0,210,255,0.10)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  gridBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#00D2FF',
    letterSpacing: 0.5,
  },

  // ─── Dev Tools ───
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  devLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3E4862',
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
  },
  devRowText: {
    fontSize: 13,
    color: '#7E8BA4',
  },
});
