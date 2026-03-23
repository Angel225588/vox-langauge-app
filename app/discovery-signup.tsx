/**
 * Discovery Sign-Up Wall
 *
 * Shown after completing the discovery lesson for unauthenticated users.
 * Displays earned scores and motivates account creation.
 * Professional tone — no guilt-tripping, just clear value.
 */

import { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, glass } from '@/constants/designSystem';

// ─── Types ───────────────────────────────────────────────────
interface Scores {
  articulation: number;
  fluency: number;
  communication: number;
  scenario: number;
}

// ─── Constants ───────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const KPI_CONFIG = [
  { key: 'articulation' as const, label: 'Articulation', icon: 'mic-outline' as const, color: '#00A3FF' },
  { key: 'fluency' as const, label: 'Fluency', icon: 'speedometer-outline' as const, color: '#06D6A0' },
  { key: 'communication' as const, label: 'Communication', icon: 'chatbubbles-outline' as const, color: '#8B5CF6' },
  { key: 'scenario' as const, label: 'Scenario', icon: 'briefcase-outline' as const, color: '#F59E0B' },
];

const VALUE_PROPS = [
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Your data stays private',
    desc: 'No ads, no tracking, no data selling',
    color: '#06D6A0',
  },
  {
    icon: 'locate-outline' as const,
    title: 'Personalized to your profession',
    desc: 'Lessons built around your real scenarios',
    color: '#00A3FF',
  },
  {
    icon: 'trending-up-outline' as const,
    title: 'Track real communication ability',
    desc: 'Measure articulation, fluency, and more',
    color: '#8B5CF6',
  },
];

// ─── Main Screen ────────────────────────────────────────────
export default function DiscoverySignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    scores: string;
    stairTitle: string;
    cefrLevel: string;
  }>();

  const scores: Scores = useMemo(() => {
    try {
      return JSON.parse(params.scores || '{}');
    } catch {
      return { articulation: 0, fluency: 0, communication: 0, scenario: 0 };
    }
  }, [params.scores]);

  const stairTitle = params.stairTitle || 'Discovery Lesson';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* ═══ Header ═══ */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.headerSection}
        >
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color="#06D6A0" />
          </View>
          <Text style={styles.title}>Lesson Complete!</Text>
          <Text style={styles.subtitle}>{stairTitle}</Text>
        </Animated.View>

        {/* ═══ KPI Scores ═══ */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(250)}
          style={styles.scoresCard}
        >
          <View style={styles.scoresGrid}>
            {KPI_CONFIG.map((kpi) => {
              const score = scores[kpi.key] ?? 0;
              const scoreColor = score >= 50 ? kpi.color : colors.text.disabled;
              return (
                <View key={kpi.key} style={styles.scoreItem}>
                  <Ionicons name={kpi.icon} size={18} color={scoreColor} />
                  <Text style={[styles.scoreValue, { color: scoreColor }]}>
                    {score}
                  </Text>
                  <Text style={styles.scoreLabel}>{kpi.label}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ═══ Value Propositions ═══ */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          style={styles.valueCard}
        >
          {VALUE_PROPS.map((prop, index) => (
            <View
              key={prop.title}
              style={[
                styles.valueRow,
                index < VALUE_PROPS.length - 1 && styles.valueRowBorder,
              ]}
            >
              <View style={styles.valueIcon}>
                <Ionicons name={prop.icon} size={20} color={prop.color} />
              </View>
              <View style={styles.valueText}>
                <Text style={styles.valueTitle}>{prop.title}</Text>
                <Text style={styles.valueDesc}>{prop.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* ═══ CTAs ═══ */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(550)}
          style={styles.ctaSection}
        >
          {/* Primary: Create Account */}
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/onboarding-v3/signup' as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={colors.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryCta}
            >
              <Text style={styles.primaryCtaText}>Create Free Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign in link */}
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/onboarding-v3/login' as any)}
            activeOpacity={0.7}
            style={styles.signInBtn}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>

          {/* Skip link */}
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/home')}
            activeOpacity={0.7}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Continue without account</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(6, 214, 160, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 214, 160, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Scores card
  scoresCard: {
    backgroundColor: glass.surface.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: glass.border.light,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scoreItem: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2 - spacing.sm) / 2,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  scoreValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Value propositions card
  valueCard: {
    backgroundColor: glass.surface.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: glass.border.light,
    padding: spacing.md,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: spacing.sm + 2,
  },
  valueRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: glass.border.subtle,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 54, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    flex: 1,
  },
  valueTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  valueDesc: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
  },

  // CTAs
  ctaSection: {
    paddingTop: spacing.md,
  },
  primaryCta: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  primaryCtaText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
    letterSpacing: -0.2,
  },
  signInBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  signInText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  signInLink: {
    color: '#3D6BFF',
    fontWeight: typography.fontWeight.semibold,
  },
  skipBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.disabled,
  },
});
