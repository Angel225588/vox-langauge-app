/**
 * Reading Library — 2x2 Thumbnail Grid
 *
 * YouTube thumbnail-style cards with Unsplash images.
 * Personalized to onboarding profile and recommendations.
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
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { generateLibraryRecommendations, LibraryLecture } from '@/lib/ai/libraryGenerator';

// ─── Palette ────────────────────────────────────────
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  blue: '#0036FF',
  blueLight: '#3D6BFF',
  text: '#F9FAFB',
  sub: '#9CA3AF',
  dim: 'rgba(255,255,255,0.15)',
  success: '#10B981',
  overlay: 'rgba(0,0,0,0.55)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 0.7; // 16:11-ish ratio like YouTube

// ─── Types ──────────────────────────────────────────
interface Lecture {
  id: string;
  title: string;
  subtitle?: string;
  wordCount: number;
  questionCount: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hasTeleprompter: boolean;
  imageUrl?: string;
  reason?: string;
}

// ─── Difficulty config ──────────────────────────────
const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  intermediate: { label: 'Intermediate', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  advanced: { label: 'Advanced', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

// ─── Default Lectures (shown while AI loads) ────────
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80';

const DEFAULT_LECTURES: Lecture[] = [
  {
    id: 'reading-1',
    title: 'The New Office',
    subtitle: 'Professional vocabulary',
    wordCount: 150,
    questionCount: 3,
    category: 'Work',
    difficulty: 'beginner',
    hasTeleprompter: true,
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
  },
  {
    id: 'reading-2',
    title: 'First Day Abroad',
    subtitle: 'Travel essentials',
    wordCount: 200,
    questionCount: 4,
    category: 'Travel',
    difficulty: 'beginner',
    hasTeleprompter: true,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  },
];

const CACHE_KEY = 'vox_reading_library_completed';

// ═════════════════════════════════════════════════════
// THUMBNAIL CARD
// ═════════════════════════════════════════════════════

function ThumbnailCard({
  lecture,
  isCompleted,
  onPress,
  index,
}: {
  lecture: Lecture;
  isCompleted: boolean;
  onPress: () => void;
  index: number;
}) {
  const diff = DIFFICULTY_CONFIG[lecture.difficulty] || DIFFICULTY_CONFIG.beginner;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200 + index * 120)}>
      <TouchableOpacity
        style={s.card}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityLabel={`${lecture.title}, ${lecture.category}, ${lecture.wordCount} words`}
      >
        {/* Image */}
        <View style={s.imageContainer}>
          <Image
            source={{ uri: lecture.imageUrl || FALLBACK_IMAGE }}
            style={s.image}
            resizeMode="cover"
          />

          {/* Gradient overlay at bottom of image */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={s.imageGradient}
          />

          {/* Category pill on image */}
          <View style={s.categoryPill}>
            <Text style={s.categoryText}>{lecture.category}</Text>
          </View>

          {/* Completed check */}
          {isCompleted && (
            <View style={s.completedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={C.success} />
            </View>
          )}

          {/* Duration / word count on image bottom-right */}
          <View style={s.durationBadge}>
            <Ionicons name="time-outline" size={10} color="rgba(255,255,255,0.9)" />
            <Text style={s.durationText}>
              {Math.ceil(lecture.wordCount / 130)} min
            </Text>
          </View>
        </View>

        {/* Text content below image */}
        <View style={s.cardContent}>
          <Text style={s.cardTitle} numberOfLines={2}>
            {lecture.title}
          </Text>

          <View style={s.cardFooter}>
            {/* Difficulty */}
            <View style={[s.diffBadge, { backgroundColor: diff.bg }]}>
              <Text style={[s.diffText, { color: diff.color }]}>{diff.label}</Text>
            </View>

            {/* Mic icon */}
            <View style={s.micDot}>
              <Ionicons name="mic" size={10} color={C.blueLight} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ═════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════

export default function ReadingLibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const v3Store = useOnboardingV3();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [lectures, setLectures] = useState<Lecture[]>(DEFAULT_LECTURES);
  const [loading, setLoading] = useState(false);

  // Load completed lectures
  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (raw) setCompletedIds(new Set(JSON.parse(raw)));
      })
      .catch(() => {});
  }, []);

  // Load AI-personalized lectures (language-aware)
  const targetLang = v3Store.target_language || 'english';
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    setLoading(true);
    generateLibraryRecommendations(userId, false, targetLang)
      .then((aiLectures) => {
        if (aiLectures.length > 0) {
          const mapped: Lecture[] = aiLectures.slice(0, 4).map((l) => ({
            id: l.id,
            title: l.title,
            subtitle: l.subtitle,
            wordCount: l.wordCount,
            questionCount: 3,
            category: l.category,
            difficulty: l.difficulty,
            hasTeleprompter: true,
            imageUrl: l.imageUrl,
            reason: l.reason,
          }));
          setLectures(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, targetLang]);

  const handleLecturePress = useCallback(
    (lecture: Lecture) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/reading-goal',
        params: {
          lectureId: lecture.id,
          title: lecture.title,
          subtitle: lecture.subtitle || '',
          wordCount: String(lecture.wordCount),
          questionCount: String(lecture.questionCount),
          category: lecture.category,
          difficulty: lecture.difficulty,
          language: targetLang,
          imageUrl: lecture.imageUrl || '',
        },
      });
    },
    [router, targetLang],
  );

  const handleRandomExercise = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/practice-reading');
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const totalSlots = 4;
  const emptySlots = Math.max(0, totalSlots - lectures.length);

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Reading</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <Animated.View entering={FadeIn.duration(500).delay(50)}>
          <Text style={s.heroTitle}>Your Readings</Text>
          <Text style={s.heroSub}>
            {loading
              ? 'Finding personalized articles...'
              : 'Curated for your level and goals'}
          </Text>
        </Animated.View>

        {/* Loading indicator */}
        {loading && (
          <View style={s.loadingRow}>
            <ActivityIndicator size="small" color={C.blueLight} />
          </View>
        )}

        {/* 2x2 Thumbnail Grid */}
        <View style={s.grid}>
          {lectures.map((lecture, index) => (
            <ThumbnailCard
              key={lecture.id}
              lecture={lecture}
              isCompleted={completedIds.has(lecture.id)}
              onPress={() => handleLecturePress(lecture)}
              index={index}
            />
          ))}

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <Animated.View
              key={`empty-${i}`}
              entering={FadeInDown.duration(400).delay(500 + i * 100)}
            >
              <View style={s.emptyCard}>
                <View style={s.emptyImagePlaceholder}>
                  <Ionicons name="lock-closed" size={20} color={C.dim} />
                </View>
                <View style={s.cardContent}>
                  <Text style={s.emptyText}>Complete a reading{'\n'}to unlock more</Text>
                </View>
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
            <Ionicons name="shuffle" size={18} color="#FFFFFF" />
            <Text style={s.ctaText}>Quick Exercise</Text>
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

  // Hero
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 14,
    fontWeight: '500',
    color: C.sub,
    marginBottom: 20,
  },

  // Loading
  loadingRow: {
    alignItems: 'center',
    marginBottom: 16,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },

  // Thumbnail card
  card: {
    width: CARD_WIDTH,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },

  // Image section
  imageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },

  // Category pill (top-left on image)
  categoryPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Completed badge (top-right on image)
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Duration (bottom-right on image)
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },

  // Text content below image
  cardContent: {
    padding: 10,
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Difficulty badge
  diffBadge: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  diffText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Mic dot
  micDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 54, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty card
  emptyCard: {
    width: CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.dim,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  emptyImagePlaceholder: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
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
    borderRadius: 14,
    paddingVertical: 15,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
