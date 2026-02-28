/**
 * Reading Library — 2x2 Lecture Grid
 *
 * Entry point for reading practice from the Practice tab.
 * Shows available lectures as cards in a 2-column grid.
 * Completed lectures unlock new ones.
 *
 * Flow: Practice Tab → Reading Library → Reading Goal → Teleprompter → Results
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';

// ─── Palette ────────────────────────────────────────
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.10)',
  blue: '#0036FF',
  blueLight: '#3D6BFF',
  text: '#F9FAFB',
  sub: '#9CA3AF',
  dim: 'rgba(255,255,255,0.15)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;

// ─── Types ──────────────────────────────────────────
interface Lecture {
  id: string;
  title: string;
  wordCount: number;
  questionCount: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hasTeleprompter: boolean;
}

// ─── Default Lectures ───────────────────────────────
const DEFAULT_LECTURES: Lecture[] = [
  {
    id: 'reading-1',
    title: 'The New Office',
    wordCount: 150,
    questionCount: 3,
    category: 'Work',
    difficulty: 'beginner',
    hasTeleprompter: true,
  },
  {
    id: 'reading-2',
    title: 'First Day Abroad',
    wordCount: 200,
    questionCount: 4,
    category: 'Travel',
    difficulty: 'beginner',
    hasTeleprompter: true,
  },
];

const CACHE_KEY = 'vox_reading_library_completed';

// ═════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════

export default function ReadingLibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const v3Store = useOnboardingV3();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Load completed lectures
  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (raw) setCompletedIds(new Set(JSON.parse(raw)));
      })
      .catch(() => {});
  }, []);

  const handleLecturePress = useCallback(
    (lecture: Lecture) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/reading-goal',
        params: {
          lectureId: lecture.id,
          title: lecture.title,
          wordCount: String(lecture.wordCount),
          questionCount: String(lecture.questionCount),
          category: lecture.category,
          difficulty: lecture.difficulty,
        },
      });
    },
    [router],
  );

  const handleRandomExercise = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/practice-reading');
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Build grid: available lectures + empty slots
  const totalSlots = 4;
  const lectures = DEFAULT_LECTURES;
  const emptySlots = Math.max(0, totalSlots - lectures.length);

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Reading Practice</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={s.subtitle}>
            Read aloud and get pronunciation feedback
          </Text>
        </Animated.View>

        {/* 2x2 Grid */}
        <View style={s.grid}>
          {lectures.map((lecture, index) => {
            const isCompleted = completedIds.has(lecture.id);
            return (
              <Animated.View
                key={lecture.id}
                entering={FadeInDown.duration(400).delay(200 + index * 100)}
              >
                <TouchableOpacity
                  style={s.card}
                  onPress={() => handleLecturePress(lecture)}
                  activeOpacity={0.8}
                >
                  {/* Book illustration */}
                  <View style={s.bookIllustration}>
                    <View style={s.bookSpine} />
                    <View style={s.bookPage}>
                      <View style={s.textLine} />
                      <View style={[s.textLine, { width: '80%' }]} />
                      <View style={[s.textLine, { width: '60%' }]} />
                      <View style={s.textLine} />
                      <View style={[s.textLine, { width: '70%' }]} />
                    </View>
                  </View>

                  {/* Badge */}
                  {!isCompleted && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>NEW</Text>
                    </View>
                  )}
                  {isCompleted && (
                    <View style={[s.badge, s.badgeCompleted]}>
                      <Ionicons name="checkmark" size={10} color="#10B981" />
                    </View>
                  )}

                  {/* Info */}
                  <Text style={s.cardTitle} numberOfLines={1}>
                    {lecture.title}
                  </Text>
                  <View style={s.cardMeta}>
                    <Text style={s.cardMetaText}>
                      {lecture.wordCount} words
                    </Text>
                    <Text style={s.cardMetaDot}>·</Text>
                    <Text style={s.cardMetaText}>
                      {lecture.questionCount} questions
                    </Text>
                  </View>

                  {/* Mic indicator */}
                  {lecture.hasTeleprompter && (
                    <View style={s.micBadge}>
                      <Ionicons name="mic" size={10} color={C.blueLight} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <Animated.View
              key={`empty-${i}`}
              entering={FadeInDown.duration(400).delay(400 + i * 100)}
            >
              <View style={s.emptyCard}>
                <Ionicons name="lock-closed" size={24} color={C.dim} />
                <Text style={s.emptyText}>Complete a lecture{'\n'}to unlock</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={s.ctaBar}>
        <TouchableOpacity onPress={handleRandomExercise} activeOpacity={0.85}>
          <LinearGradient
            colors={[C.blue, C.blueLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Text style={s.ctaText}>Start Random Exercise</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: C.sub,
    marginBottom: 20,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },

  // Lecture card
  card: {
    width: CARD_SIZE,
    aspectRatio: 0.85,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    justifyContent: 'space-between',
  },

  // Book illustration
  bookIllustration: {
    flexDirection: 'row',
    height: 64,
    marginBottom: 8,
  },
  bookSpine: {
    width: 6,
    height: '100%',
    backgroundColor: C.blueLight,
    borderRadius: 2,
    marginRight: 6,
  },
  bookPage: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
    padding: 8,
    gap: 4,
    justifyContent: 'center',
  },
  textLine: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 1.5,
    width: '100%',
  },

  // Badges
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 54, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.30)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: C.blueLight,
    letterSpacing: 0.5,
  },
  badgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.30)',
  },

  // Card info
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 11,
    fontWeight: '500',
    color: C.sub,
  },
  cardMetaDot: {
    fontSize: 11,
    color: C.sub,
  },

  // Mic badge
  micBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 54, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty card
  emptyCard: {
    width: CARD_SIZE,
    aspectRatio: 0.85,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.dim,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '500',
    color: C.dim,
    textAlign: 'center',
    lineHeight: 16,
  },

  // CTA
  ctaBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
