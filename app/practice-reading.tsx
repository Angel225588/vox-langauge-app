/**
 * Reading Practice Screen
 *
 * AI-generated reading passage based on user's current stair vocabulary/grammar.
 * Shows passage in target language → comprehension questions → score.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { generateReadingContent, type ReadingPassage } from '@/lib/ai/practiceGenerator';
import { savePracticeScore } from '@/lib/db/competencyMetrics';

// ─── Palette (matches practice tab) ───
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  text: '#EEF0F6',
  sub: '#7E8BA4',
  purple: '#818CF8',
  green: '#10B981',
  red: '#EF4444',
  blue: '#1A6DFF',
  gold: '#F59E0B',
};

type Phase = 'loading' | 'reading' | 'questions' | 'score';

export default function PracticeReadingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadContent();
  }, [user?.id]);

  const loadContent = useCallback(async () => {
    if (!user?.id) return;
    setPhase('loading');
    setError(null);
    try {
      const content = await generateReadingContent(user.id);
      if (!content) {
        setError('Could not generate reading content. Check your learning path.');
        return;
      }
      setPassage(content);
      setAnswers(new Array(content.comprehensionQuestions.length).fill(null));
      setPhase('reading');
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    }
  }, [user?.id]);

  const handleStartQuestions = () => {
    setPhase('questions');
  };

  const handleAnswer = (optionIndex: number) => {
    if (!passage) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQ < passage.comprehensionQuestions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setPhase('score');
      }
    }, 600);
  };

  const score = passage
    ? answers.reduce<number>((acc, ans, i) => {
        return acc + (ans === passage.comprehensionQuestions[i]?.correctIndex ? 1 : 0);
      }, 0)
    : 0;

  const totalQ = passage?.comprehensionQuestions.length || 0;

  // Save score when entering score phase
  useEffect(() => {
    if (phase !== 'score' || !user?.id || totalQ === 0) return;
    const pct = Math.round((score / totalQ) * 100);
    savePracticeScore(user.id, 'reading', {
      communication: pct,
      scenario: pct,
      fluency: Math.round(pct * 0.8),
      articulation: Math.round(pct * 0.7),
    }).catch(() => {});
  }, [phase]);

  // ═══ LOADING ═══
  if (phase === 'loading') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.purple} />
          <Text style={s.loadingText}>Generating your reading passage...</Text>
          {error && <Text style={[s.loadingText, { color: C.red, marginTop: 12 }]}>{error}</Text>}
          {error && (
            <TouchableOpacity style={s.retryBtn} onPress={loadContent}>
              <Text style={s.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!passage) return null;

  // ═══ READING PHASE ═══
  if (phase === 'reading') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(400)}>
            {/* Title */}
            <Text style={s.title}>{passage.title}</Text>
            <View style={s.metaRow}>
              <View style={[s.badge, { backgroundColor: C.purple + '20' }]}>
                <Text style={[s.badgeText, { color: C.purple }]}>
                  {passage.difficulty?.toUpperCase() || 'READING'}
                </Text>
              </View>
              <Text style={s.wordCount}>{passage.wordCount || passage.passage.split(' ').length} words</Text>
            </View>

            {/* Passage */}
            <View style={s.passageCard}>
              <Text style={s.passageText}>{passage.passage}</Text>
            </View>

            {/* Vocab highlight */}
            {passage.targetVocabulary && passage.targetVocabulary.length > 0 && (
              <View style={s.vocabSection}>
                <Text style={s.vocabLabel}>Key vocabulary in this passage:</Text>
                <View style={s.vocabTags}>
                  {passage.targetVocabulary.slice(0, 8).map((word, i) => (
                    <View key={i} style={s.vocabTag}>
                      <Text style={s.vocabTagText}>{word}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* CTA */}
        <View style={s.bottomBar}>
          <TouchableOpacity onPress={handleStartQuestions} activeOpacity={0.8}>
            <LinearGradient
              colors={[C.purple, '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>Answer Questions</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ═══ QUESTIONS PHASE ═══
  if (phase === 'questions') {
    const q = passage.comprehensionQuestions[currentQ];
    const selected = answers[currentQ];
    const isAnswered = selected !== null;
    const isCorrect = selected === q.correctIndex;

    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />
        <View style={s.qProgress}>
          {passage.comprehensionQuestions.map((_, i) => (
            <View
              key={i}
              style={[
                s.qDot,
                i === currentQ && s.qDotActive,
                answers[i] !== null && {
                  backgroundColor: answers[i] === passage.comprehensionQuestions[i].correctIndex
                    ? C.green : C.red,
                },
              ]}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          <Animated.View entering={FadeIn.duration(300)} key={currentQ}>
            <Text style={s.qNumber}>Question {currentQ + 1} of {totalQ}</Text>
            <Text style={s.qText}>{q.question}</Text>

            <View style={{ gap: 10, marginTop: 20 }}>
              {q.options.map((opt, i) => {
                let optStyle = s.optionDefault;
                if (isAnswered && i === q.correctIndex) optStyle = s.optionCorrect;
                else if (isAnswered && i === selected) optStyle = s.optionWrong;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[s.option, optStyle]}
                    onPress={() => !isAnswered && handleAnswer(i)}
                    activeOpacity={isAnswered ? 1 : 0.7}
                    disabled={isAnswered}
                  >
                    <Text style={[s.optionLetter, isAnswered && i === q.correctIndex && { color: C.green }]}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                    <Text style={s.optionText}>{opt}</Text>
                    {isAnswered && i === q.correctIndex && (
                      <Ionicons name="checkmark-circle" size={20} color={C.green} />
                    )}
                    {isAnswered && i === selected && i !== q.correctIndex && (
                      <Ionicons name="close-circle" size={20} color={C.red} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ═══ SCORE PHASE ═══
  return (
    <SafeAreaView style={s.container}>
      <Header onBack={() => router.back()} />
      <View style={s.center}>
        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
          <View style={s.scoreCircle}>
            <Text style={s.scoreNum}>{score}/{totalQ}</Text>
          </View>
          <Text style={s.scoreLabel}>
            {score === totalQ ? 'Perfect!' : score >= totalQ / 2 ? 'Good job!' : 'Keep practicing!'}
          </Text>
          <Text style={s.scoreSub}>Reading Comprehension</Text>

          <View style={{ gap: 12, marginTop: 32, width: '100%', paddingHorizontal: 24 }}>
            <TouchableOpacity onPress={loadContent} activeOpacity={0.8}>
              <LinearGradient colors={[C.purple, '#6366F1']} style={s.ctaBtn}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={s.ctaText}>New Passage</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[s.ctaBtn, { backgroundColor: C.card }]}
            >
              <Text style={[s.ctaText, { color: C.sub }]}>Back to Practice</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─── HEADER ───
function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={C.text} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Reading Practice</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

// ─── STYLES ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: 20, paddingBottom: 100 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },

  loadingText: { color: C.sub, fontSize: 14, marginTop: 16 },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 10, backgroundColor: C.card,
  },
  retryText: { color: C.purple, fontWeight: '600', fontSize: 14 },

  title: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  wordCount: { fontSize: 12, color: C.sub },

  passageCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: C.border,
  },
  passageText: { fontSize: 16, lineHeight: 26, color: C.text },

  vocabSection: { marginTop: 16 },
  vocabLabel: { fontSize: 12, fontWeight: '600', color: C.sub, marginBottom: 8 },
  vocabTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  vocabTag: {
    backgroundColor: C.purple + '15', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  vocabTagText: { fontSize: 12, fontWeight: '600', color: C.purple },

  bottomBar: { padding: 20, paddingBottom: 10 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 16,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Questions
  qProgress: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  qDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.card },
  qDotActive: { backgroundColor: C.purple, width: 20 },
  qNumber: { fontSize: 12, fontWeight: '600', color: C.sub, marginBottom: 8 },
  qText: { fontSize: 18, fontWeight: '700', color: C.text, lineHeight: 26 },

  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  optionDefault: { backgroundColor: C.card, borderColor: C.border },
  optionCorrect: { backgroundColor: C.green + '15', borderColor: C.green + '40' },
  optionWrong: { backgroundColor: C.red + '15', borderColor: C.red + '40' },
  optionLetter: { fontSize: 14, fontWeight: '700', color: C.sub, width: 20 },
  optionText: { fontSize: 15, color: C.text, flex: 1 },

  // Score
  scoreCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: C.purple + '20', borderWidth: 3, borderColor: C.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontSize: 28, fontWeight: '900', color: C.purple },
  scoreLabel: { fontSize: 22, fontWeight: '800', color: C.text, marginTop: 16 },
  scoreSub: { fontSize: 14, color: C.sub, marginTop: 4 },
});
