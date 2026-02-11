/**
 * Practice Tab — Practice Zone
 *
 * Premium dark dashboard: 3 KPI boxes, glassy daily sphere,
 * quick actions, voice conversation hero, 2×2 skill grid,
 * guided Flow card with shimmer.
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
  Dimensions,
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
import { getConversationStats } from '@/lib/db/conversations';
import { getUserMemory } from '@/lib/ai/userMemory';

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
  { title: 'Vocabulary', sub: 'Flashcard flow', emoji: '\u{1F4C7}', color: PZ.green, route: '/flashcard/session' },
  { title: 'Reading', sub: 'AI passage', emoji: '\u{1F4D6}', color: PZ.purple, route: '/practice-reading' },
  { title: 'Writing', sub: 'AI prompt', emoji: '\u270F\uFE0F', color: PZ.gold, route: '/practice-writing' },
  { title: 'Listening', sub: 'Comprehension', emoji: '\u{1F3A7}', color: PZ.rose, route: '/practice-listening' },
];

const FLOW_STEPS = [
  { emoji: '\u{1F4C7}', label: 'Vocab', color: PZ.green },
  { emoji: '\u{1F4D6}', label: 'Read', color: PZ.purple },
  { emoji: '\u270F\uFE0F', label: 'Write', color: PZ.gold },
  { emoji: '\u{1F4DE}', label: 'AI Call', color: PZ.cyan },
];

const CONTENT_WIDTH = Dimensions.get('window').width - 32;

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
  let glowRGBA = 'rgba(26,109,255,0.18)';

  if (percent >= 80) {
    main = PZ.gold;
    light = PZ.goldLight;
    glowRGBA = 'rgba(245,158,11,0.22)';
  } else if (percent >= 50) {
    main = PZ.green;
    light = PZ.greenLight;
    glowRGBA = 'rgba(16,185,129,0.18)';
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
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.06]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.65]),
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
            width: size + 18,
            height: size + 18,
            borderRadius: (size + 18) / 2,
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
        <AnimNum to={percent} suffix="%" size={13} color="#fff" delay={500} />
        <Text
          style={{
            fontSize: 6.5,
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
  const [showDevTools, setShowDevTools] = useState(false);

  // ─── Real KPI Data ───
  const [kpiData, setKpiData] = useState({
    articulation: 0,
    fluency: 0,
    totalVocab: 0,
    totalPoints: 0,
    streak: 0,
    dailyPercent: 0,
  });

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [stats, memory] = await Promise.all([
          getConversationStats(user.id),
          getUserMemory(user.id),
        ]);
        setKpiData({
          articulation: stats?.avgArticulation || 0,
          fluency: stats?.avgFluency || 0,
          totalVocab: memory?.total_vocab_learned || 0,
          totalPoints: (stats?.totalSessions || 0) * 50 + (memory?.total_lessons_completed || 0) * 25,
          streak: memory?.current_streak || 0,
          dailyPercent: memory?.total_lessons_completed
            ? Math.min(100, Math.round((memory.total_lessons_completed % 5) / 5 * 100))
            : 0,
        });
      } catch (err) {
        console.warn('[Practice] Failed to load KPI data:', err);
      }
    })();
  }, [user?.id]);

  const KPI_ITEMS = [
    { label: 'Articulation', value: kpiData.articulation, suffix: '/100', color: PZ.cyan, trend: '' },
    { label: 'Fluency', value: kpiData.fluency, suffix: '/100', color: PZ.blueLight, trend: '' },
    { label: 'Words', value: kpiData.totalVocab, suffix: '', color: PZ.green, trend: '' },
  ];

  // Shimmer animation for Flow card
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-CONTENT_WIDTH, CONTENT_WIDTH]) },
    ],
  }));

  const handleVoiceConversation = useCallback(() => {
    router.push('/voice-conversation');
  }, [router]);

  const handleQuickAction = useCallback(
    (_label: string) => {
      router.push('/vocab-practice/vocab-1');
    },
    [router],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PZ.bg }} edges={['top']}>
      {/* ═══ HEADER ═══ */}
      <Animated.View entering={FadeInDown.duration(300)} style={s.header}>
        <View />
        <View style={s.headerStats}>
          <TouchableOpacity style={s.statPill} activeOpacity={0.7}>
            <VoxIcon size="sm" />
            <Text style={[s.statValue, { color: PZ.blue }]}>
              {kpiData.totalPoints.toLocaleString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.statPill} activeOpacity={0.7}>
            <Icon name="flame" size={18} color="warning" />
            <Text style={[s.statValue, { color: PZ.gold }]}>{kpiData.streak}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        bounces
      >
        {/* ═══ 3 KPI BOXES ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(40)} style={s.kpiRow}>
          {KPI_ITEMS.map((kpi, i) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
              <AnimNum
                to={kpi.value}
                suffix={kpi.suffix}
                size={22}
                color={kpi.color}
                delay={300 + i * 100}
              />
              <View style={s.trendRow}>
                <Text style={s.trendText}>{'\u2191'} {kpi.trend}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ═══ SPHERE + QUICK ACTIONS ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(80)} style={s.sphereRow}>
          <GlowSphere percent={kpiData.dailyPercent} size={48} />
          <View style={s.quickActions}>
            {['\u26A1 Sprint', '\u{1F3B2} Random', '\u25CE Weak'].map((label) => (
              <TouchableOpacity
                key={label}
                style={s.quickBtn}
                activeOpacity={0.7}
                onPress={() => handleQuickAction(label)}
              >
                <Text style={s.quickBtnText}>{label}</Text>
              </TouchableOpacity>
            ))}
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
                  <Text style={{ fontSize: 22 }}>{'\u{1F399}\uFE0F'}</Text>
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

        {/* ═══ 2x2 PRACTICE GRID ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)} style={s.gridContainer}>
          {[0, 2].map((startIdx) => (
            <View key={startIdx} style={s.gridRow}>
              {GRID_ITEMS.slice(startIdx, startIdx + 2).map((card) => (
                <TouchableOpacity
                  key={card.title}
                  style={[s.gridCard, { backgroundColor: card.color + '08' }]}
                  activeOpacity={0.7}
                  onPress={() => router.push(card.route as any)}
                >
                  <View
                    style={[
                      s.gridIconBox,
                      { backgroundColor: card.color + '14', borderColor: card.color + '20' },
                    ]}
                  >
                    <Text style={{ fontSize: 19 }}>{card.emoji}</Text>
                  </View>
                  <View>
                    <Text style={s.gridTitle}>{card.title}</Text>
                    <Text style={s.gridSub}>{card.sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </Animated.View>

        {/* ═══ FLOW CARD ═══ */}
        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <TouchableOpacity style={s.flowCard} activeOpacity={0.8}>
            {/* Shimmer accent bar */}
            <View style={s.shimmerTrack}>
              <Animated.View style={[s.shimmerBar, shimmerStyle]}>
                <LinearGradient
                  colors={[
                    'transparent',
                    PZ.cyan + '40',
                    PZ.blueLight + '60',
                    PZ.green + '40',
                    'transparent',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>

            <View style={s.flowInner}>
              {/* Top row */}
              <View style={s.flowTopRow}>
                <LinearGradient
                  colors={['rgba(0,210,255,0.12)', 'rgba(26,109,255,0.12)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.flowIconBox}
                >
                  <Text style={{ fontSize: 18 }}>{'\u{1F30A}'}</Text>
                </LinearGradient>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.flowTitle}>Flow</Text>
                    <View style={s.guidedBadge}>
                      <Text style={s.guidedText}>GUIDED</Text>
                    </View>
                  </View>
                  <Text style={s.flowSub}>
                    Vocab {'\u2192'} reading {'\u2192'} writing {'\u2192'} AI call
                  </Text>
                </View>

                <LinearGradient
                  colors={['#0066FF', '#004ACC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.flowPlayBtn}
                >
                  <Text style={{ fontSize: 11, color: '#fff' }}>{'\u25B6'}</Text>
                </LinearGradient>
              </View>

              {/* Steps preview */}
              <View style={s.stepsContainer}>
                {FLOW_STEPS.map((step, i) => (
                  <View key={step.label} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ alignItems: 'center', gap: 2, flex: 1 }}>
                      <View
                        style={[
                          s.stepIcon,
                          { backgroundColor: step.color + '14', borderColor: step.color + '20' },
                        ]}
                      >
                        <Text style={{ fontSize: 12 }}>{step.emoji}</Text>
                      </View>
                      <Text style={s.stepLabel}>{step.label}</Text>
                    </View>
                    {i < FLOW_STEPS.length - 1 && <View style={s.stepLine} />}
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 4,
  },
  kpiLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#3E4862',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 10,
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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

  // ─── 2x2 Grid ───
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
    padding: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  gridIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EEF0F6',
    letterSpacing: -0.2,
  },
  gridSub: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#7E8BA4',
    marginTop: 1,
  },

  // ─── Flow Card ───
  flowCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  shimmerTrack: {
    height: 2,
    overflow: 'hidden',
  },
  shimmerBar: {
    width: '100%',
    height: 2,
  },
  flowInner: {
    padding: 14,
    paddingTop: 12,
  },
  flowTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flowIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(77,148,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EEF0F6',
    letterSpacing: -0.2,
  },
  guidedBadge: {
    backgroundColor: 'rgba(0,210,255,0.1)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  guidedText: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#00D2FF',
    letterSpacing: 0.5,
  },
  flowSub: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#7E8BA4',
    marginTop: 1,
  },
  flowPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#0047DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  stepIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 7.5,
    fontWeight: '600',
    color: '#3E4862',
  },
  stepLine: {
    width: 14,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
    marginBottom: 10,
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
