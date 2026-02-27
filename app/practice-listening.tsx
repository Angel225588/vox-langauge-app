/**
 * Listening Practice Screen
 *
 * AI-generated listening exercise using user's stair vocabulary.
 * Sentences with TTS audio → comprehension questions → score.
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { generateListeningContent, type ListeningExercise } from '@/lib/ai/practiceGenerator';
import { savePracticeScore } from '@/lib/db/competencyMetrics';
import { storeActivityCompletion } from '@/app/lesson-session';
import * as Speech from 'expo-speech';

// ─── Palette ───
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  text: '#EEF0F6',
  sub: '#7E8BA4',
  rose: '#F472B6',
  green: '#10B981',
  red: '#EF4444',
  blue: '#1A6DFF',
};

type Phase = 'loading' | 'listen' | 'questions' | 'score';

export default function PracticeListeningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    returnToSession?: string;
    activityId?: string;
  }>();
  const isSessionActivity = params.returnToSession === 'true';

  const [phase, setPhase] = useState<Phase>('loading');
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadContent();
    return () => { Speech.stop(); };
  }, [user?.id]);

  const loadContent = useCallback(async () => {
    if (!user?.id) return;
    setPhase('loading');
    setError(null);
    setCurrentSentence(0);
    setCurrentQ(0);
    setShowTranslation(false);
    try {
      const content = await generateListeningContent(user.id);
      if (!content) {
        setError('Could not generate listening exercise. Check your learning path.');
        return;
      }
      setExercise(content);
      setAnswers(new Array(content.comprehensionQuestions.length).fill(null));
      setPhase('listen');
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    }
  }, [user?.id]);

  const speak = useCallback((text: string, slow: boolean = false) => {
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(text, {
      rate: slow ? 0.6 : 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, []);

  const handleNextSentence = () => {
    if (!exercise) return;
    setShowTranslation(false);
    if (currentSentence < exercise.sentences.length - 1) {
      setCurrentSentence(currentSentence + 1);
    } else {
      setPhase('questions');
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (!exercise) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < exercise.comprehensionQuestions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setPhase('score');
      }
    }, 600);
  };

  const score = exercise
    ? answers.reduce<number>((acc, ans, i) => {
        return acc + (ans === exercise.comprehensionQuestions[i]?.correctIndex ? 1 : 0);
      }, 0)
    : 0;
  const totalQ = exercise?.comprehensionQuestions.length || 0;

  // Save score when entering score phase
  useEffect(() => {
    if (phase !== 'score' || !user?.id || totalQ === 0) return;
    const pct = Math.round((score / totalQ) * 100);
    savePracticeScore(user.id, 'listening', {
      fluency: pct,
      communication: pct,
      articulation: Math.round(pct * 0.8),
      scenario: Math.round(pct * 0.7),
    }).catch(() => {});

    // Signal lesson-session if we're inside a lesson
    if (isSessionActivity && params.activityId) {
      storeActivityCompletion(params.activityId, pct).catch(() => {});
    }
  }, [phase]);

  // Return to lesson session or practice tab
  const handleDone = useCallback(() => {
    if (isSessionActivity) {
      router.replace('/lesson-session');
    } else {
      router.back();
    }
  }, [isSessionActivity, router]);

  // ═══ LOADING ═══
  if (phase === 'loading') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.rose} />
          <Text style={s.loadingText}>Generating listening exercise...</Text>
          {error && <Text style={[s.loadingText, { color: C.red, marginTop: 12 }]}>{error}</Text>}
          {error && (
            <TouchableOpacity style={s.retryBtn} onPress={loadContent}>
              <Text style={[s.retryText, { color: C.rose }]}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) return null;

  // ═══ LISTEN PHASE ═══
  if (phase === 'listen') {
    const sent = exercise.sentences[currentSentence];
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />

        {/* Progress */}
        <View style={s.progressRow}>
          {exercise.sentences.map((_, i) => (
            <View
              key={i}
              style={[
                s.progressDot,
                i === currentSentence && s.progressDotActive,
                i < currentSentence && { backgroundColor: C.green },
              ]}
            />
          ))}
        </View>

        <View style={s.listenContent}>
          <Animated.View entering={FadeIn.duration(300)} key={currentSentence} style={{ alignItems: 'center' }}>
            <Text style={s.sentenceNum}>
              Sentence {currentSentence + 1} of {exercise.sentences.length}
            </Text>

            {/* Audio controls */}
            <View style={s.audioRow}>
              <TouchableOpacity
                style={[s.audioBtn, s.audioBtnMain]}
                onPress={() => speak(sent.text)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isSpeaking ? 'volume-high' : 'play'}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.audioBtn, s.audioBtnSlow]}
                onPress={() => speak(sent.text, true)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>🐢</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.listenHint}>Tap to play the sentence</Text>

            {/* Sentence text (hidden until revealed) */}
            <TouchableOpacity
              style={s.sentenceCard}
              onPress={() => setShowTranslation(!showTranslation)}
              activeOpacity={0.8}
            >
              <Text style={s.sentenceText}>{sent.text}</Text>
              {showTranslation ? (
                <Text style={s.translationText}>{sent.translation}</Text>
              ) : (
                <Text style={s.tapReveal}>Tap to reveal translation</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Vocabulary sidebar */}
        {exercise.vocabulary.length > 0 && (
          <View style={s.vocabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
              {exercise.vocabulary.map((v, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.vocabChip}
                  onPress={() => speak(v.word)}
                  activeOpacity={0.7}
                >
                  <Text style={s.vocabWord}>{v.word}</Text>
                  {v.phonetic && <Text style={s.vocabPhonetic}>{v.phonetic}</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={s.bottomBar}>
          <TouchableOpacity onPress={handleNextSentence} activeOpacity={0.8}>
            <LinearGradient colors={[C.rose, '#DB2777']} style={s.ctaBtn}>
              <Text style={s.ctaText}>
                {currentSentence < exercise.sentences.length - 1 ? 'Next Sentence' : 'Start Questions'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ═══ QUESTIONS PHASE ═══
  if (phase === 'questions') {
    const q = exercise.comprehensionQuestions[currentQ];
    const selected = answers[currentQ];
    const isAnswered = selected !== null;

    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />
        <View style={s.progressRow}>
          {exercise.comprehensionQuestions.map((_, i) => (
            <View
              key={i}
              style={[
                s.progressDot,
                i === currentQ && s.progressDotActive,
                answers[i] !== null && {
                  backgroundColor: answers[i] === exercise.comprehensionQuestions[i].correctIndex
                    ? C.green : C.red,
                },
              ]}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          <Animated.View entering={FadeIn.duration(300)} key={currentQ}>
            <Text style={s.sentenceNum}>Question {currentQ + 1} of {totalQ}</Text>
            <Text style={s.qText}>{q.question}</Text>

            <View style={{ gap: 10, marginTop: 20 }}>
              {q.options.map((opt, i) => {
                let optStyle = s.optDefault;
                if (isAnswered && i === q.correctIndex) optStyle = s.optCorrect;
                else if (isAnswered && i === selected) optStyle = s.optWrong;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[s.option, optStyle]}
                    onPress={() => !isAnswered && handleAnswer(i)}
                    activeOpacity={isAnswered ? 1 : 0.7}
                    disabled={isAnswered}
                  >
                    <Text style={s.optLetter}>{String.fromCharCode(65 + i)}</Text>
                    <Text style={s.optText}>{opt}</Text>
                    {isAnswered && i === q.correctIndex && (
                      <Ionicons name="checkmark-circle" size={20} color={C.green} />
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
          <View style={[s.scoreCircle, { borderColor: C.rose }]}>
            <Text style={[s.scoreNum, { color: C.rose }]}>{score}/{totalQ}</Text>
          </View>
          <Text style={s.scoreLabel}>
            {score === totalQ ? 'Perfect!' : score >= totalQ / 2 ? 'Good job!' : 'Keep listening!'}
          </Text>
          <Text style={s.scoreSub}>Listening Comprehension</Text>

          <View style={{ gap: 12, marginTop: 32, width: '100%', paddingHorizontal: 24 }}>
            <TouchableOpacity onPress={loadContent} activeOpacity={0.8}>
              <LinearGradient colors={[C.rose, '#DB2777']} style={s.ctaBtn}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={s.ctaText}>New Exercise</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDone}
              style={[s.ctaBtn, { backgroundColor: C.card }]}
            >
              <Text style={[s.ctaText, { color: C.sub }]}>
                {isSessionActivity ? 'Continue Lesson' : 'Back to Practice'}
              </Text>
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
      <Text style={s.headerTitle}>Listening Practice</Text>
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
  retryText: { fontWeight: '600', fontSize: 14 },

  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.card },
  progressDotActive: { backgroundColor: C.rose, width: 20 },

  listenContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  sentenceNum: { fontSize: 12, fontWeight: '600', color: C.sub, marginBottom: 16 },

  audioRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  audioBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  audioBtnMain: { backgroundColor: C.rose },
  audioBtnSlow: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },

  listenHint: { fontSize: 12, color: C.sub, marginBottom: 24 },

  sentenceCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: C.border, width: '100%', alignItems: 'center',
  },
  sentenceText: { fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center', lineHeight: 26 },
  translationText: { fontSize: 14, color: C.sub, marginTop: 10, textAlign: 'center' },
  tapReveal: { fontSize: 12, color: C.sub + '80', marginTop: 10 },

  vocabBar: { paddingVertical: 12 },
  vocabChip: {
    backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  vocabWord: { fontSize: 13, fontWeight: '700', color: C.text },
  vocabPhonetic: { fontSize: 10, color: C.sub, marginTop: 2 },

  bottomBar: { padding: 20, paddingBottom: 10 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 16,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  qText: { fontSize: 18, fontWeight: '700', color: C.text, lineHeight: 26 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  optDefault: { backgroundColor: C.card, borderColor: C.border },
  optCorrect: { backgroundColor: C.green + '15', borderColor: C.green + '40' },
  optWrong: { backgroundColor: C.red + '15', borderColor: C.red + '40' },
  optLetter: { fontSize: 14, fontWeight: '700', color: C.sub, width: 20 },
  optText: { fontSize: 15, color: C.text, flex: 1 },

  scoreCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'transparent', borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontSize: 28, fontWeight: '900' },
  scoreLabel: { fontSize: 22, fontWeight: '800', color: C.text, marginTop: 16 },
  scoreSub: { fontSize: 14, color: C.sub, marginTop: 4 },
});
