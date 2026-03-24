/**
 * Home Screen - Duolingo-Style Learning Path
 *
 * Vertical scrolling staircase showing user's personalized learning path
 * This is the main homepage featuring the beautiful staircase design
 */

import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VoxIcon } from '@/components/ui/rewards';
import { Icon } from '@/components/ui/Icon';
import { CalibratorBanner } from '@/components/learning/CalibratorBanner';

import { useLearningPath, StairForDisplay } from '@/hooks/useLearningPath';
import { CondensedStairCard } from '@/components/staircase';
import { supabase } from '@/lib/db/supabase';
import { useUserMetrics } from '@/hooks/useUserMetrics';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { adaptV3ToOnboardingData } from '@/lib/services/v3DataAdapter';
import { getFeatureAccess, getVoiceUnlockMessage, type ProficiencyLevel } from '@/lib/utils/levelGating';
import { loadPreviewStairs } from '@/lib/services/previewStairs';
import { LinearGradient } from 'expo-linear-gradient';

// Flag emoji for each target language
const LANG_FLAGS: Record<string, string> = {
  english: '\u{1F1EC}\u{1F1E7}',
  french: '\u{1F1EB}\u{1F1F7}',
  spanish: '\u{1F1EA}\u{1F1F8}',
};

const { width, height } = Dimensions.get('window');

// No mock stairs — premium app shows only real personalized content

// ─── Voice CTA with flowing gradient animation ──────
// Aurora-like color shift + pulsing mic icon to suggest "speaking"

function VoiceCTA({ cefrLevel, onPress }: { cefrLevel: string; onPress: () => void }) {
  const flow = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Slow aurora flow — 4s cycle
    flow.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    // Mic pulse — gentle scale 1→1.12→1
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  // Flowing overlay — sweeps left to right
  const overlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(flow.value, [0, 1], [-width * 0.6, width * 0.6]) }],
    opacity: interpolate(flow.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  // Mic icon pulse
  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  // Glow ring synced to pulse
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [1, 1.12], [0.15, 0.45]),
    transform: [{ scale: interpolate(pulse.value, [1, 1.12], [1, 1.25]) }],
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={['#0029CC', '#0036FF', '#3D6BFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(61, 107, 255, 0.4)',
        }}
      >
        {/* Flowing light overlay */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -20,
              bottom: -20,
              width: width * 0.7,
              borderRadius: width * 0.35,
            },
            overlayStyle,
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.12)', 'rgba(100,180,255,0.18)', 'rgba(255,255,255,0.12)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: width * 0.35 }}
          />
        </Animated.View>

        {/* Content row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1 }}>
          {/* Mic icon with pulse + glow ring */}
          <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1.5,
                  borderColor: 'rgba(255,255,255,0.35)',
                },
                glowStyle,
              ]}
            />
            <Animated.View
              style={[
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                micStyle,
              ]}
            >
              <Ionicons name="mic" size={22} color="#fff" />
            </Animated.View>
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: '#FFFFFF',
              letterSpacing: -0.3,
            }}>
              Practice Speaking
            </Text>
            <Text style={{
              fontSize: typography.fontSize.xs,
              color: 'rgba(255, 255, 255, 0.65)',
              marginTop: 2,
            }}>
              AI conversation  ·  {cefrLevel}
            </Text>
          </View>

          {/* Arrow — design system icon */}
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Home Screen ────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation('home');
  const { metrics } = useUserMetrics();
  const [userId, setUserId] = useState<string | null>(null);

  // Derive level + flag from V3 store (always fresh, including after edit-profile)
  const v3 = useOnboardingV3().getOnboardingData();
  const adapted = adaptV3ToOnboardingData(v3);
  const userLevel = adapted.proficiency_level as ProficiencyLevel | null;
  const featureAccess = getFeatureAccess(userLevel);
  const flagEmoji = LANG_FLAGS[v3.target_language || ''] || '\u{1F30D}';

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Use the learning path hook - falls back to preview/mock data if no path exists
  const { stairs: realStairs, isLoading, hasPath, completeStair } = useLearningPath(userId);

  // Load preview stairs from onboarding (personalized but no auth)
  const [previewStairs, setPreviewStairs] = useState<StairForDisplay[] | null>(null);
  useEffect(() => {
    loadPreviewStairs().then(async (loaded) => {
      if (loaded && loaded.length > 0) {
        setPreviewStairs(loaded);
        return;
      }

      // No stairs in AsyncStorage — regenerate from V3 onboarding data
      const v3 = useOnboardingV3.getState();
      if (v3.completed && v3.scenarios.length > 0) {
        console.log('[Home] No preview stairs found, regenerating from V3 data');
        const { generatePreviewStairs, storePreviewStairs } = await import('@/lib/services/previewStairs');
        const freshStairs = generatePreviewStairs({
          scenarios: v3.scenarios,
          target_language: v3.target_language || 'english',
          profession: v3.profession || undefined,
          proficiency_level: v3.proficiency_level || undefined,
        });
        if (freshStairs.length > 0) {
          await storePreviewStairs(freshStairs);
          setPreviewStairs(freshStairs);
        }
      }
    });
  }, []);

  // Priority: real Supabase stairs > preview stairs from onboarding > empty
  const stairs = hasPath && realStairs.length > 0
    ? realStairs
    : previewStairs && previewStairs.length > 0
      ? previewStairs
      : [];

  // ─── Staggered Stair Reveal Animation ─────────────
  // Reveals stairs one by one with 250ms delay between each.
  // Uses a stable stairsKey to restart reveal when the actual stairs data changes
  // (e.g., preview stairs loading from AsyncStorage replaces MOCK_STAIRS).
  const [revealedCount, setRevealedCount] = useState(0);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stairsKey = stairs.map(s => s.id).join(',');

  useEffect(() => {
    if (isLoading || stairs.length === 0) return;

    // Reset and restart reveal for new stairs data
    setRevealedCount(0);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);

    const total = stairs.length;
    let current = 0;
    const revealNext = () => {
      current++;
      setRevealedCount(current);
      if (current < total) {
        revealTimerRef.current = setTimeout(revealNext, 250);
      }
    };
    // First card appears after a short initial delay
    revealTimerRef.current = setTimeout(revealNext, 300);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, [isLoading, stairsKey]);

  const isStairRevealed = useCallback(
    (index: number) => index < revealedCount,
    [revealedCount],
  );

  const handleStairPress = (stairId: string, status: string) => {
    if (status === 'locked') {
      // Show locked message
      return;
    }

    // Navigate to lesson preview carousel → then to stair session
    console.log('Starting stair:', stairId);
    router.push(`/lesson/${stairId}`);
  };

  // Determine calibrator status based on stairs completion
  const completedStairs = stairs.filter(s => s.status === 'completed').length;
  const totalStairs = stairs.length;
  const calibratorStatus = completedStairs >= totalStairs
    ? 'ready'
    : completedStairs > 0
      ? 'locked'
      : 'locked';

  const handleCalibratorStart = () => {
    console.log('Starting calibrator assessment');
    // TODO: Navigate to calibrator flow
    // router.push('/calibrator/1');
  };

  const handleSkillPress = (skill: 'speaking' | 'listening' | 'writing') => {
    console.log('Starting skill calibration:', skill);
    // TODO: Navigate to specific skill calibration
    // router.push(`/calibrator/${skill}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
      <View
        style={{ flex: 1 }}
      >
        {/* Sticky Header - Always Visible */}
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            backgroundColor: 'transparent',
          }}
        >
          {/* Top Row: Flag, Points, Streak - No Bubbles */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            {/* Language Flag (left) — reflects V3 target language */}
            <Text style={{ fontSize: 32 }}>{flagEmoji}</Text>

            {/* Points and Streak (right side) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              {/* Vox Points */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <VoxIcon size="sm" />
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    marginLeft: spacing.xs,
                  }}
                >
                  {metrics.totalPoints.toLocaleString()}
                </Text>
              </View>

              {/* Streak */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="flame" size="lg" color="warning" />
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    marginLeft: spacing.xs,
                  }}
                >
                  {metrics.streak}
                </Text>
              </View>
            </View>
          </View>

          {/* Title - My Roadmap */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              textAlign: 'center',
              letterSpacing: -0.5,
            }}
          >
            {t('title')}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

          {/* Level-Gated Voice CTA — aligned with staircase cards */}
          {featureAccess.showVoiceCTA && (
            <Animated.View
              entering={FadeInDown.duration(600).delay(100)}
              style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}
            >
              <VoiceCTA
                cefrLevel={featureAccess.cefr}
                onPress={() => {
                  const defaultScenario = {
                    id: 'quick-practice',
                    title: 'Free Practice',
                    description: 'Open conversation practice',
                    context: 'A friendly conversation',
                    aiRole: 'Conversation Partner',
                    userRole: 'Learner',
                    objectives: ['Introduce yourself', 'Ask about their day', 'Describe your work', 'End politely'],
                    language: v3.target_language || 'english',
                    difficulty: 'intermediate',
                    category: 'general',
                    suggestedPhrases: [],
                    keyVocabulary: [],
                    suggestedDuration: 300,
                  };
                  router.push({
                    pathname: '/voice-practice/[scenarioId]' as any,
                    params: { scenarioId: 'quick-practice', scenarioData: JSON.stringify(defaultScenario) },
                  });
                }}
              />
            </Animated.View>
          )}

          {/* Voice Unlock Teaser for Beginners */}
          {featureAccess.showVoiceTeaser && (
            <Animated.View
              entering={FadeInDown.duration(600).delay(100)}
              style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}
            >
              <View
                style={{
                  borderRadius: borderRadius.xl,
                  padding: spacing.lg,
                  backgroundColor: colors.background.card,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 54, 255, 0.3)',
                  borderStyle: 'dashed',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: borderRadius.full,
                    backgroundColor: 'rgba(0, 54, 255, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.md,
                  }}>
                    <Ionicons name="lock-closed" size={28} color={colors.primary.DEFAULT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                    }}>
                      Voice Conversations
                    </Text>
                    <Text style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}>
                      {getVoiceUnlockMessage(userLevel)}
                    </Text>
                  </View>
                </View>
                {/* Progress indicator */}
                <View style={{ marginTop: spacing.md }}>
                  <View style={{
                    height: 4,
                    backgroundColor: 'rgba(0, 54, 255, 0.2)',
                    borderRadius: borderRadius.full,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      width: userLevel === 'elementary' ? '60%' : '30%',
                      height: '100%',
                      backgroundColor: colors.primary.DEFAULT,
                      borderRadius: borderRadius.full,
                    }} />
                  </View>
                  <Text style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    marginTop: spacing.xs,
                    textAlign: 'right',
                  }}>
                    {userLevel === 'elementary' ? 'Almost there!' : 'Keep learning!'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={{ color: colors.text.secondary, marginTop: spacing.md }}>
                {t('loading')}
              </Text>
            </View>
          )}

{/* Staircase (Vertical) */}
          {!isLoading && (
            <View
              style={{
                paddingHorizontal: spacing.md,
                paddingBottom: spacing.lg,
              }}
            >
              {stairs.map((stair, index) => (
                <CondensedStairCard
                  key={stair.id}
                  stair={stair}
                  index={index}
                  isRevealed={isStairRevealed(index)}
                  onPress={() => handleStairPress(stair.id, stair.status)}
                />
              ))}
            </View>
          )}

          {/* Calibrator Banner - After each section */}
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}>
            <CalibratorBanner
              sectionNumber={1}
              status={calibratorStatus}
              onStart={handleCalibratorStart}
              onSkillPress={handleSkillPress}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

