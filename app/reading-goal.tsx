/**
 * Reading Goal Screen — Briefing Before Teleprompter
 *
 * Shows what the user is about to do:
 * - Lecture title and metadata
 * - What they'll practice (read aloud, pronunciation feedback)
 * - Start button → Teleprompter
 *
 * Flow: Reading Library → Reading Goal → Teleprompter → Results
 */

import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// ─── Palette ────────────────────────────────────────
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.10)',
  blue: '#0036FF',
  blueLight: '#3D6BFF',
  text: '#F9FAFB',
  sub: '#9CA3AF',
  dim: 'rgba(255,255,255,0.25)',
};

export default function ReadingGoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lectureId: string;
    title: string;
    wordCount: string;
    questionCount: string;
    category: string;
    difficulty: string;
  }>();

  const title = params.title || 'Reading Practice';
  const wordCount = params.wordCount || '150';
  const category = params.category || 'General';
  const difficulty = params.difficulty || 'beginner';

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/teleprompter',
      params: {
        storyId: params.lectureId,
        title: params.title,
        category: params.category,
        difficulty: params.difficulty,
        wordCount: params.wordCount,
        returnTo: 'reading-library',
      },
    });
  }, [router, params]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const steps = [
    {
      icon: 'book-outline' as const,
      title: 'Read the passage',
      desc: 'Text scrolls at your chosen speed',
    },
    {
      icon: 'mic-outline' as const,
      title: 'Read aloud',
      desc: 'Your voice is recorded for analysis',
    },
    {
      icon: 'analytics-outline' as const,
      title: 'Get feedback',
      desc: 'Pronunciation, fluency, and articulation scores',
    },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Reading Goal</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={s.body}>
        {/* Lecture info */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={s.heroSection}
        >
          <View style={s.iconCircle}>
            <Ionicons name="book" size={32} color={C.blueLight} />
          </View>
          <Text style={s.title}>{title}</Text>
          <View style={s.metaRow}>
            <View style={s.metaPill}>
              <Ionicons name="document-text-outline" size={12} color={C.sub} />
              <Text style={s.metaText}>{wordCount} words</Text>
            </View>
            <View style={s.metaPill}>
              <Ionicons name="fitness-outline" size={12} color={C.sub} />
              <Text style={s.metaText}>{difficulty}</Text>
            </View>
            <View style={s.metaPill}>
              <Ionicons name="pricetag-outline" size={12} color={C.sub} />
              <Text style={s.metaText}>{category}</Text>
            </View>
          </View>
        </Animated.View>

        {/* What you'll do */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(250)}
          style={s.stepsCard}
        >
          <Text style={s.stepsTitle}>What you'll do</Text>
          {steps.map((step, i) => (
            <View key={step.title} style={s.stepRow}>
              <View style={s.stepNumber}>
                <Text style={s.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={s.stepIcon}>
                <Ionicons name={step.icon} size={18} color={C.blueLight} />
              </View>
              <View style={s.stepContent}>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient
              colors={[C.blue, C.blueLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.ctaBtn}
            >
              <Ionicons name="play" size={18} color="#FFFFFF" />
              <Text style={s.ctaText}>Start Reading</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 54, 255, 0.10)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 54, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.sub,
    textTransform: 'capitalize',
  },

  // Steps
  stepsCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 54, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.blueLight,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 54, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: C.sub,
  },

  // CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
