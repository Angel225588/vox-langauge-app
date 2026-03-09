/**
 * Reading Goal Screen — Banner Image + Briefing
 *
 * Uses the same lecture image as a full-width banner with overlay title.
 * Glassmorphic steps card below explains what the user will do.
 *
 * Flow: Reading Library → Reading Goal → Teleprompter → Results
 */

import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// ─── Palette ────────────────────────────────────────
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  blue: '#0036FF',
  blueLight: '#3D6BFF',
  text: '#F9FAFB',
  sub: '#9CA3AF',
  dim: 'rgba(255,255,255,0.25)',
  success: '#10B981',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 220;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80';

// ─── Difficulty config ──────────────────────────────
const DIFFICULTY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  beginner: { label: 'Beginner', icon: 'leaf-outline', color: '#10B981' },
  intermediate: { label: 'Intermediate', icon: 'flame-outline', color: '#F59E0B' },
  advanced: { label: 'Advanced', icon: 'diamond-outline', color: '#EF4444' },
};

export default function ReadingGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    lectureId: string;
    title: string;
    subtitle: string;
    wordCount: string;
    questionCount: string;
    category: string;
    difficulty: string;
    language: string;
    imageUrl: string;
  }>();

  const title = params.title || 'Reading Practice';
  const subtitle = params.subtitle || '';
  const wordCount = params.wordCount || '150';
  const category = params.category || 'General';
  const difficulty = params.difficulty || 'beginner';
  const imageUrl = params.imageUrl || FALLBACK_IMAGE;
  const diff = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.beginner;

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
        language: params.language || 'english',
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
      desc: 'Pronunciation, fluency & articulation scores',
    },
  ];

  return (
    <View style={s.container}>
      {/* Banner Image with Overlay */}
      <View style={s.bannerContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={s.bannerImage}
          resizeMode="cover"
        />

        {/* Gradient overlays */}
        <LinearGradient
          colors={['rgba(8,11,20,0.6)', 'transparent']}
          style={s.bannerGradientTop}
        />
        <LinearGradient
          colors={['transparent', C.bg]}
          style={s.bannerGradientBottom}
        />

        {/* Back button */}
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={12}
          style={[s.backBtn, { top: insets.top + 8 }]}
        >
          <View style={s.backBtnCircle}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </View>
        </TouchableOpacity>

        {/* Category pill on banner */}
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
          style={s.bannerCategory}
        >
          <Text style={s.bannerCategoryText}>{category}</Text>
        </Animated.View>

        {/* Title overlay at bottom of banner */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={s.bannerTitleContainer}
        >
          <Text style={s.bannerTitle}>{title}</Text>
          {subtitle ? (
            <Text style={s.bannerSubtitle}>{subtitle}</Text>
          ) : null}
        </Animated.View>
      </View>

      {/* Body */}
      <View style={s.body}>
        {/* Meta pills */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={s.metaRow}
        >
          <View style={s.metaPill}>
            <Ionicons name="document-text-outline" size={13} color={C.sub} />
            <Text style={s.metaText}>{wordCount} words</Text>
          </View>
          <View style={[s.metaPill, { borderColor: diff.color + '30' }]}>
            <Ionicons name={diff.icon as any} size={13} color={diff.color} />
            <Text style={[s.metaText, { color: diff.color }]}>{diff.label}</Text>
          </View>
          <View style={s.metaPill}>
            <Ionicons name="mic-outline" size={13} color={C.blueLight} />
            <Text style={[s.metaText, { color: C.blueLight }]}>Read aloud</Text>
          </View>
        </Animated.View>

        {/* Steps card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(350)}
          style={s.stepsCard}
        >
          <Text style={s.stepsTitle}>What you'll do</Text>
          {steps.map((step, i) => (
            <View key={step.title} style={s.stepRow}>
              <View style={s.stepNumber}>
                <Text style={s.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={s.stepIconBox}>
                <Ionicons name={step.icon} size={16} color={C.blueLight} />
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
        <Animated.View
          entering={FadeInDown.duration(400).delay(500)}
          style={{ paddingBottom: insets.bottom + 8 }}
        >
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
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Banner
  bannerContainer: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  bannerGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCategory: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bannerCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerTitleContainer: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Body
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Meta pills
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.sub,
  },

  // Steps card (glassmorphic)
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
  stepIconBox: {
    width: 34,
    height: 34,
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
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
