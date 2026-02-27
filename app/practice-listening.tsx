/**
 * Listening Practice Screen — 4-Stage Scaffolding Loop
 *
 * Progressive listening exercise that proves comprehension improvement:
 *   Stage 1: Pure audio → quiz (before score)
 *   Stage 2: Audio + target language subtitles
 *   Stage 3: Audio + native translation subtitles
 *   Stage 4: Pure audio → quiz (after score) → results comparison
 *
 * Supports two entry modes:
 * - Lesson session: discoveryContent passed via route params
 * - Practice tab: AI-generated via practiceGenerator
 *
 * Audio: ElevenLabs TTS with expo-speech fallback.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAuth } from '@/hooks/useAuth';
import { generateListeningContent, type ListeningExercise } from '@/lib/ai/practiceGenerator';
import type { ListeningContent, DialogueLine } from '@/lib/lesson/discoveryGenerator';
import { savePracticeScore } from '@/lib/db/competencyMetrics';
import { storeActivityCompletion } from '@/app/lesson-session';
import { updateStreakData } from '@/lib/db/sqlite';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

import StageIndicator from '@/components/listening/StageIndicator';
import SubtitleDisplay from '@/components/listening/SubtitleDisplay';
import ComprehensionQuiz from '@/components/listening/ComprehensionQuiz';
import ResultsComparison from '@/components/listening/ResultsComparison';
import { LISTENING } from '@/components/listening/theme';

// ─── Types ───────────────────────────────────────────────

type ListeningStage =
  | 'loading'
  | 'stage1_listen'
  | 'stage1_quiz'
  | 'stage2_subtitles'
  | 'stage3_translation'
  | 'stage4_listen'
  | 'stage4_quiz'
  | 'results';

/** Normalized content shape used by all stages */
interface NormalizedContent {
  title: string;
  dialogueLines: DialogueLine[];
  vocabulary: { word: string; translation: string; phonetic?: string }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

// ─── Helpers ─────────────────────────────────────────────

/** Map a ListeningStage to the 1-4 stage number for the indicator */
function stageToNumber(stage: ListeningStage): number {
  switch (stage) {
    case 'stage1_listen':
    case 'stage1_quiz':
      return 1;
    case 'stage2_subtitles':
      return 2;
    case 'stage3_translation':
      return 3;
    case 'stage4_listen':
    case 'stage4_quiz':
      return 4;
    default:
      return 1;
  }
}

/** Fisher-Yates shuffle that returns a new array */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Shuffle options for each question while tracking the new correct index */
function shuffleQuestionOptions(
  questions: NormalizedContent['questions'],
): NormalizedContent['questions'] {
  return questions.map((q) => {
    // Create index mapping
    const indices = q.options.map((_, i) => i);
    const shuffled = shuffleArray(indices);
    const newOptions = shuffled.map((i) => q.options[i]);
    const newCorrectIndex = shuffled.indexOf(q.correctIndex);
    return { ...q, options: newOptions, correctIndex: newCorrectIndex };
  });
}

/** Normalize discovery ListeningContent into our common shape */
function normalizeDiscoveryContent(dc: ListeningContent): NormalizedContent {
  return {
    title: dc.title,
    dialogueLines: dc.dialogue.map((d) => ({
      speaker: d.speaker,
      text: d.text,
      translation: d.translation,
    })),
    vocabulary: dc.vocabulary,
    questions: dc.comprehensionQuestions,
  };
}

/** Normalize practice-tab ListeningExercise into our common shape */
function normalizeExerciseContent(ex: ListeningExercise): NormalizedContent {
  return {
    title: ex.title,
    dialogueLines: ex.sentences.map((s, i) => ({
      speaker: `Speaker ${i % 2 === 0 ? 'A' : 'B'}`,
      text: s.text,
      translation: s.translation,
    })),
    vocabulary: ex.vocabulary,
    questions: ex.comprehensionQuestions,
  };
}

// ═════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════

export default function PracticeListeningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    returnToSession?: string;
    activityId?: string;
    discoveryContent?: string;
  }>();
  const isSessionActivity = params.returnToSession === 'true';

  // ─── State ──────────────────────────────────────────
  const [stage, setStage] = useState<ListeningStage>('loading');
  const [content, setContent] = useState<NormalizedContent | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<NormalizedContent['questions'] | null>(null);
  const [beforeScore, setBeforeScore] = useState(0);
  const [afterScore, setAfterScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ─── Audio ──────────────────────────────────────────
  const tts = useElevenLabsTTS();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechStopRef = useRef(false);

  // Build the full dialogue text for TTS
  const fullDialogueText = useMemo(() => {
    if (!content) return '';
    return content.dialogueLines.map((l) => l.text).join('. ');
  }, [content]);

  // ─── Speak function with ElevenLabs → expo-speech fallback ──
  const speakDialogue = useCallback(
    async (slow: boolean = false) => {
      if (!content || isSpeaking) return;

      setIsSpeaking(true);
      speechStopRef.current = false;

      try {
        if (tts.isConfigured) {
          // ElevenLabs: speak the full dialogue as a sequence
          await tts.speakSequence(
            content.dialogueLines.map((line) => ({
              text: line.text,
              delayBefore: 200,
            })),
          );
        } else {
          // Fallback: expo-speech
          const text = fullDialogueText;
          await new Promise<void>((resolve) => {
            Speech.speak(text, {
              rate: slow ? 0.6 : 0.85,
              onDone: resolve,
              onError: () => resolve(),
            });
          });
        }
      } catch {
        // Audio failure is non-blocking
      }

      if (!speechStopRef.current) {
        setIsSpeaking(false);
      }
    },
    [content, isSpeaking, tts, fullDialogueText],
  );

  const speakSlow = useCallback(async () => {
    if (!content || isSpeaking) return;

    setIsSpeaking(true);
    speechStopRef.current = false;

    try {
      if (tts.isConfigured) {
        // Slow mode — speak each line individually at a slower pace
        for (const line of content.dialogueLines) {
          if (speechStopRef.current) break;
          await tts.speak(line.text, undefined, 0.75);
          // Pause between lines
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        const text = fullDialogueText;
        await new Promise<void>((resolve) => {
          Speech.speak(text, {
            rate: 0.6,
            onDone: resolve,
            onError: () => resolve(),
          });
        });
      }
    } catch {
      // Non-blocking
    }

    if (!speechStopRef.current) {
      setIsSpeaking(false);
    }
  }, [content, isSpeaking, tts, fullDialogueText]);

  const stopSpeaking = useCallback(async () => {
    speechStopRef.current = true;
    setIsSpeaking(false);
    try {
      await tts.stop();
      Speech.stop();
    } catch {
      // Ignore
    }
  }, [tts]);

  // ─── Content Loading ───────────────────────────────
  const loadContent = useCallback(async () => {
    setStage('loading');
    setError(null);
    setBeforeScore(0);
    setAfterScore(0);
    setShuffledQuestions(null);

    try {
      // Try discovery content from route params first
      if (params.discoveryContent) {
        const parsed: ListeningContent = JSON.parse(params.discoveryContent);
        const normalized = normalizeDiscoveryContent(parsed);
        if (normalized.dialogueLines.length > 0 && normalized.questions.length > 0) {
          setContent(normalized);
          setStage('stage1_listen');
          return;
        }
      }

      // Fall back to AI generation (practice tab mode)
      if (!user?.id) {
        setError('Sign in to generate listening exercises.');
        return;
      }

      const exercise = await generateListeningContent(user.id);
      if (!exercise) {
        setError('Could not generate listening exercise. Check your learning path.');
        return;
      }
      const normalized = normalizeExerciseContent(exercise);
      setContent(normalized);
      setStage('stage1_listen');
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    }
  }, [params.discoveryContent, user?.id]);

  // Initial load
  useEffect(() => {
    loadContent();
    return () => {
      Speech.stop();
    };
  }, []);

  // ─── Stage Transitions ─────────────────────────────

  const handleStage1QuizComplete = useCallback(
    (score: number) => {
      setBeforeScore(score);
      // Prepare shuffled questions for stage 4
      if (content) {
        setShuffledQuestions(shuffleQuestionOptions(content.questions));
      }
      setStage('stage2_subtitles');
    },
    [content],
  );

  const handleStage4QuizComplete = useCallback(
    (score: number) => {
      setAfterScore(score);
      setStage('results');
    },
    [],
  );

  // ─── Score Persistence ─────────────────────────────
  const totalQuestions = content?.questions.length || 0;
  const pointsRef = useRef(0);

  useEffect(() => {
    if (stage !== 'results' || totalQuestions === 0) return;

    const pct = Math.round((afterScore / totalQuestions) * 100);
    const practicePoints = 10 + Math.round(pct / 10);
    pointsRef.current = practicePoints;

    // Save competency score
    const userId = user?.id;
    if (userId) {
      savePracticeScore(userId, 'listening', {
        fluency: pct,
        communication: pct,
        articulation: Math.round(pct * 0.8),
        scenario: Math.round(pct * 0.7),
      }).catch(() => {});

      // Persist points
      updateStreakData(userId, practicePoints).catch(() => {});

      // Signal lesson-session if inside a lesson
      if (isSessionActivity && params.activityId) {
        storeActivityCompletion(params.activityId, pct).catch(() => {});
      }
    }
  }, [stage, afterScore, totalQuestions, user?.id, isSessionActivity, params.activityId]);

  // ─── Navigation ────────────────────────────────────

  const handleDone = useCallback(() => {
    stopSpeaking();
    if (isSessionActivity) {
      router.replace('/lesson-session');
    } else {
      router.back();
    }
  }, [isSessionActivity, router, stopSpeaking]);

  const handleNewExercise = useCallback(() => {
    stopSpeaking();
    loadContent();
  }, [stopSpeaking, loadContent]);

  // ═══ RENDER ════════════════════════════════════════

  // ─── LOADING ──────────────────────────────────────
  if (stage === 'loading') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => { stopSpeaking(); router.back(); }} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={LISTENING.teal} />
          <Text style={s.loadingText}>Generating listening exercise...</Text>
          {error && (
            <>
              <Text style={[s.loadingText, { color: LISTENING.red, marginTop: 12 }]}>
                {error}
              </Text>
              <TouchableOpacity style={s.retryBtn} onPress={loadContent}>
                <Text style={s.retryText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!content) return null;

  // ─── QUIZ STAGES (Stage 1 and Stage 4) ─────────────
  if (stage === 'stage1_quiz') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => { stopSpeaking(); router.back(); }} />
        <StageIndicator currentStage={1} />
        <ComprehensionQuiz
          questions={content.questions}
          isRevealMode={false}
          onComplete={handleStage1QuizComplete}
        />
      </SafeAreaView>
    );
  }

  if (stage === 'stage4_quiz') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => { stopSpeaking(); router.back(); }} />
        <StageIndicator currentStage={4} />
        <ComprehensionQuiz
          questions={shuffledQuestions || content.questions}
          isRevealMode={true}
          onComplete={handleStage4QuizComplete}
        />
      </SafeAreaView>
    );
  }

  // ─── RESULTS ──────────────────────────────────────
  if (stage === 'results') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => { stopSpeaking(); router.back(); }} />
        <ResultsComparison
          beforeScore={beforeScore}
          afterScore={afterScore}
          totalQuestions={totalQuestions}
          points={pointsRef.current}
          onNewExercise={handleNewExercise}
          onContinue={handleDone}
          continueLabel={isSessionActivity ? 'Continue Lesson' : 'Back to Practice'}
        />
      </SafeAreaView>
    );
  }

  // ─── LISTEN / SUBTITLE STAGES ─────────────────────
  const currentStageNum = stageToNumber(stage);
  const subtitleMode: 'hidden' | 'target' | 'translation' =
    stage === 'stage2_subtitles'
      ? 'target'
      : stage === 'stage3_translation'
        ? 'translation'
        : 'hidden';

  const actionLabel =
    stage === 'stage1_listen' || stage === 'stage4_listen'
      ? 'Answer Questions'
      : 'Next Stage';

  const handleAction = () => {
    stopSpeaking();
    switch (stage) {
      case 'stage1_listen':
        setStage('stage1_quiz');
        break;
      case 'stage2_subtitles':
        setStage('stage3_translation');
        break;
      case 'stage3_translation':
        setStage('stage4_listen');
        break;
      case 'stage4_listen':
        setStage('stage4_quiz');
        break;
    }
  };

  const showVocabSidebar =
    (stage === 'stage1_listen' || stage === 'stage4_listen') &&
    content.vocabulary.length > 0;

  return (
    <SafeAreaView style={s.container}>
      <Header onBack={() => { stopSpeaking(); router.back(); }} />

      {/* Stage indicator */}
      <StageIndicator currentStage={currentStageNum} />

      {/* Audio controls */}
      <View style={s.audioSection}>
        <Animated.View entering={FadeIn.duration(300)} key={stage} style={s.audioContent}>
          {/* Audio buttons */}
          <View style={s.audioRow}>
            <TouchableOpacity
              onPress={isSpeaking ? stopSpeaking : () => speakDialogue(false)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={LISTENING.tealGradient}
                style={s.audioBtnMain}
              >
                <Ionicons
                  name={isSpeaking ? 'stop' : 'play'}
                  size={28}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.audioBtnSlow}
              onPress={isSpeaking ? stopSpeaking : speakSlow}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>🐢</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.audioHint}>
            {isSpeaking ? 'Playing...' : 'Tap to play the dialogue'}
          </Text>
        </Animated.View>
      </View>

      {/* Subtitle display area */}
      <SubtitleDisplay
        mode={subtitleMode}
        dialogueLines={content.dialogueLines}
      />

      {/* Vocabulary sidebar */}
      {showVocabSidebar && (
        <View style={s.vocabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
          >
            {content.vocabulary.map((v, i) => (
              <TouchableOpacity
                key={i}
                style={s.vocabChip}
                onPress={() => {
                  if (tts.isConfigured) {
                    tts.speak(v.word).catch(() => {});
                  } else {
                    Speech.speak(v.word);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={s.vocabWord}>{v.word}</Text>
                {v.phonetic && <Text style={s.vocabPhonetic}>{v.phonetic}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Action button */}
      <View style={s.bottomBar}>
        <TouchableOpacity onPress={handleAction} activeOpacity={0.8}>
          <LinearGradient
            colors={LISTENING.tealGradient}
            style={s.ctaBtn}
          >
            <Text style={s.ctaText}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── HEADER ─────────────────────────────────────────────

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={LISTENING.textPrimary} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Listening Practice</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LISTENING.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    color: LISTENING.textPrimary,
  },
  loadingText: {
    color: LISTENING.textTertiary,
    fontSize: 14,
    marginTop: 16,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: LISTENING.glassBg,
  },
  retryText: {
    fontWeight: '600',
    fontSize: 14,
    color: LISTENING.teal,
  },

  // Audio section
  audioSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  audioContent: {
    alignItems: 'center',
  },
  audioRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  audioBtnMain: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBtnSlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LISTENING.glassBg,
    borderWidth: 1,
    borderColor: LISTENING.glassBorder,
  },
  audioHint: {
    fontSize: 12,
    color: LISTENING.textTertiary,
  },

  // Vocabulary sidebar
  vocabBar: {
    paddingVertical: 12,
  },
  vocabChip: {
    backgroundColor: LISTENING.glassBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: LISTENING.glassBorder,
    alignItems: 'center',
  },
  vocabWord: {
    fontSize: 13,
    fontWeight: '700',
    color: LISTENING.textPrimary,
  },
  vocabPhonetic: {
    fontSize: 10,
    color: LISTENING.textTertiary,
    marginTop: 2,
  },

  // Bottom bar
  bottomBar: {
    padding: 20,
    paddingBottom: 10,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
