/**
 * Listening Library — 2x2 Lecture Grid
 *
 * Entry point for listening practice from the Practice tab.
 * Shows available listening exercises as vinyl/disk cards.
 * Completed exercises unlock new ones.
 *
 * Flow: Practice Tab → Listening Library → Practice Listening → Results
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

// ─── Palette ────────────────────────────────────────
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.10)',
  teal: '#06D6A0',
  tealLight: '#4ECDC4',
  text: '#F9FAFB',
  sub: '#9CA3AF',
  dim: 'rgba(255,255,255,0.15)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;

// ─── Types ──────────────────────────────────────────
interface ListeningLecture {
  id: string;
  title: string;
  duration: string;
  newWords: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ─── Default Lectures ───────────────────────────────
const DEFAULT_LECTURES: ListeningLecture[] = [
  {
    id: 'listening-1',
    title: 'At the Cafe',
    duration: '2:30',
    newWords: 5,
    category: 'Daily Life',
    difficulty: 'beginner',
  },
  {
    id: 'listening-2',
    title: 'Business Meeting',
    duration: '3:15',
    newWords: 8,
    category: 'Work',
    difficulty: 'intermediate',
  },
];

const CACHE_KEY = 'vox_listening_library_completed';

// ─── Vinyl Disk Component ───────────────────────────
function VinylDisk({ color = C.teal }: { color?: string }) {
  return (
    <View style={vinylStyles.container}>
      {/* Outer ring */}
      <View style={[vinylStyles.outerRing, { borderColor: color }]}>
        {/* Middle ring */}
        <View style={vinylStyles.middleRing}>
          {/* Grooves */}
          <View style={vinylStyles.groove1} />
          <View style={vinylStyles.groove2} />
          {/* Center */}
          <View style={[vinylStyles.center, { backgroundColor: color }]}>
            <View style={vinylStyles.centerDot} />
          </View>
        </View>
      </View>
    </View>
  );
}

const DISK_SIZE = CARD_SIZE * 0.5;

const vinylStyles = StyleSheet.create({
  container: {
    width: DISK_SIZE,
    height: DISK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  outerRing: {
    width: DISK_SIZE,
    height: DISK_SIZE,
    borderRadius: DISK_SIZE / 2,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRing: {
    width: DISK_SIZE * 0.75,
    height: DISK_SIZE * 0.75,
    borderRadius: (DISK_SIZE * 0.75) / 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groove1: {
    position: 'absolute',
    width: DISK_SIZE * 0.6,
    height: DISK_SIZE * 0.6,
    borderRadius: (DISK_SIZE * 0.6) / 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  groove2: {
    position: 'absolute',
    width: DISK_SIZE * 0.45,
    height: DISK_SIZE * 0.45,
    borderRadius: (DISK_SIZE * 0.45) / 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  center: {
    width: DISK_SIZE * 0.28,
    height: DISK_SIZE * 0.28,
    borderRadius: (DISK_SIZE * 0.28) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});

// ═════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════

export default function ListeningLibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (raw) setCompletedIds(new Set(JSON.parse(raw)));
      })
      .catch(() => {});
  }, []);

  const handleLecturePress = useCallback(
    (lecture: ListeningLecture) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/practice-listening');
    },
    [router],
  );

  const handleRandomExercise = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/practice-listening');
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

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
        <Text style={s.headerTitle}>Listening Practice</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={s.subtitle}>
            Listen to conversations and test your comprehension
          </Text>
        </Animated.View>

        {/* 2x2 Grid */}
        <View style={s.grid}>
          {lectures.map((lecture, index) => {
            const isCompleted = completedIds.has(lecture.id);
            const diskColor = index % 2 === 0 ? C.teal : C.tealLight;
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
                  {/* Vinyl disk */}
                  <VinylDisk color={diskColor} />

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
                    <Text style={s.cardMetaText}>{lecture.duration}</Text>
                    <Text style={s.cardMetaDot}>·</Text>
                    <Text style={s.cardMetaText}>
                      {lecture.newWords} new words
                    </Text>
                  </View>
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
            colors={[C.teal, C.tealLight]}
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

  // Badges
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 214, 160, 0.30)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: C.teal,
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
