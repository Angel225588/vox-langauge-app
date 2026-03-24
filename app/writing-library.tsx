/**
 * Writing Library — Scenario Selection Grid
 *
 * Entry point for writing practice from the Practice tab.
 * Shows available writing scenarios with completion tracking.
 *
 * Flow: Practice Tab → Writing Library → Practice Writing → Feedback → Confetti → Library
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

const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.10)',
  gold: '#F59E0B',
  goldLight: '#FBBF24',
  text: '#F9FAFB',
  sub: '#9CA3AF',
  dim: 'rgba(255,255,255,0.15)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;

const CACHE_KEY = 'vox_writing_library_completed';

// ─── Writing Scenarios ──────────────────────────────
interface WritingScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: keyof typeof Ionicons.glyphMap;
  prompt: string;
  keyPhrases: string[];
  wordTarget: number;
}

const WRITING_SCENARIOS: WritingScenario[] = [
  {
    id: 'writing-1',
    title: 'Email to a Colleague',
    description: 'Write a professional email requesting a meeting about a project update.',
    category: 'Professional',
    difficulty: 'beginner',
    icon: 'mail-outline',
    prompt: 'Write a professional email to your colleague Marie requesting a meeting this week to discuss the project timeline. Be polite, clear, and suggest two possible times.',
    keyPhrases: ['Je vous écris pour', 'Serait-il possible de', 'Je vous propose', 'Dans l\'attente de votre réponse', 'Cordialement'],
    wordTarget: 60,
  },
  {
    id: 'writing-2',
    title: 'Restaurant Complaint',
    description: 'Write a polite but firm message about a bad dining experience.',
    category: 'Daily Life',
    difficulty: 'intermediate',
    icon: 'restaurant-outline',
    prompt: 'You had a disappointing experience at a restaurant last night. The food was cold and the service was slow. Write a polite but firm message to the restaurant manager explaining what happened and what you expect them to do.',
    keyPhrases: ['Je souhaite vous faire part de', 'Malheureusement', 'J\'aurais aimé que', 'Je vous serais reconnaissant de', 'En espérant'],
    wordTarget: 80,
  },
  {
    id: 'writing-3',
    title: 'Self Introduction',
    description: 'Introduce yourself for a networking event in the target language.',
    category: 'Professional',
    difficulty: 'beginner',
    icon: 'person-outline',
    prompt: 'You\'re attending a professional networking event. Write a short self-introduction that includes: who you are, what you do, your current project, and what you\'re looking for. Keep it natural and engaging.',
    keyPhrases: ['Je m\'appelle', 'Je travaille dans', 'Actuellement, je', 'Je cherche à', 'Ravi de vous rencontrer'],
    wordTarget: 50,
  },
  {
    id: 'writing-4',
    title: 'Travel Blog Post',
    description: 'Write about your favorite travel experience as a short blog entry.',
    category: 'Creative',
    difficulty: 'intermediate',
    icon: 'airplane-outline',
    prompt: 'Write a short blog entry about your most memorable travel experience. Describe where you went, what you saw, what you ate, and why it was special. Use vivid descriptions to make the reader feel like they were there.',
    keyPhrases: ['C\'était incroyable', 'Ce qui m\'a frappé', 'J\'ai découvert', 'Je recommande vivement', 'Cette expérience m\'a appris'],
    wordTarget: 100,
  },
];

// ─── Difficulty Badge ───────────────────────────────
function DifficultyBadge({ level }: { level: string }) {
  const color = level === 'beginner' ? '#10B981' : level === 'intermediate' ? '#F59E0B' : '#EF4444';
  return (
    <View style={[ds.badge, { backgroundColor: color + '20' }]}>
      <Text style={[ds.badgeText, { color }]}>{level.toUpperCase()}</Text>
    </View>
  );
}

const ds = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
});

// ═════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════

export default function WritingLibraryScreen() {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (raw) setCompletedIds(new Set(JSON.parse(raw)));
      })
      .catch(() => {});
  }, []);

  // Refresh on focus (when coming back from writing)
  useEffect(() => {
    const interval = setInterval(() => {
      AsyncStorage.getItem(CACHE_KEY)
        .then((raw) => {
          if (raw) setCompletedIds(new Set(JSON.parse(raw)));
        })
        .catch(() => {});
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScenarioPress = useCallback((scenario: WritingScenario) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/practice-writing',
      params: {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        scenarioPrompt: scenario.prompt,
        scenarioKeyPhrases: scenario.keyPhrases.join('|||'),
        scenarioWordTarget: String(scenario.wordTarget),
        scenarioCategory: scenario.category,
      },
    });
  }, [router]);

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Writing Practice</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={s.subtitle}>Choose a scenario and start writing</Text>
        </Animated.View>

        {WRITING_SCENARIOS.map((scenario, index) => {
          const isCompleted = completedIds.has(scenario.id);
          return (
            <Animated.View key={scenario.id} entering={FadeInDown.duration(400).delay(200 + index * 80)}>
              <TouchableOpacity
                style={[s.card, isCompleted && s.cardCompleted]}
                onPress={() => handleScenarioPress(scenario)}
                activeOpacity={0.8}
              >
                <View style={s.cardRow}>
                  <View style={[s.iconCircle, isCompleted && { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                    <Ionicons
                      name={isCompleted ? 'checkmark' : scenario.icon}
                      size={22}
                      color={isCompleted ? '#10B981' : C.gold}
                    />
                  </View>
                  <View style={s.cardContent}>
                    <View style={s.cardTitleRow}>
                      <Text style={[s.cardTitle, isCompleted && { color: '#10B981' }]} numberOfLines={1}>
                        {scenario.title}
                      </Text>
                      <DifficultyBadge level={scenario.difficulty} />
                    </View>
                    <Text style={s.cardDesc} numberOfLines={2}>{scenario.description}</Text>
                    <View style={s.cardMeta}>
                      <Text style={s.cardMetaText}>{scenario.category}</Text>
                      <Text style={s.cardMetaDot}>·</Text>
                      <Text style={s.cardMetaText}>~{scenario.wordTarget} words</Text>
                      {isCompleted && (
                        <>
                          <Text style={s.cardMetaDot}>·</Text>
                          <Text style={[s.cardMetaText, { color: '#10B981' }]}>Completed</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  subtitle: { fontSize: 14, color: C.sub, marginBottom: 20 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  cardCompleted: { borderColor: 'rgba(16,185,129,0.2)' },
  cardRow: { flexDirection: 'row', gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(245,158,11,0.12)', alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.text, flex: 1, marginRight: 8 },
  cardDesc: { fontSize: 13, color: C.sub, lineHeight: 18, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  cardMetaDot: { fontSize: 11, color: 'rgba(255,255,255,0.2)', marginHorizontal: 6 },
});
