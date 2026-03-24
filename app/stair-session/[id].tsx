/**
 * Stair Session Flow — Thin Orchestrator
 *
 * Delegates every step to a real, tested component.
 * Briefing → Vocabulary → Listening → Conversation → Reading → Writing → Summary
 *
 * This file: step progression, session persistence (AsyncStorage),
 * type conversions (session → component types), and component rendering.
 */
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { useStairSession } from '@/hooks/useStairSession';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { MissionBriefingScreen } from '@/components/cards';
import { VocabularyCardFlow } from '@/components/cards/vocabulary/VocabularyCardFlow';
import { TeleprompterCard } from '@/components/cards/TeleprompterCard';
import { ReadingResultsCard } from '@/components/cards/ReadingResultsCard';
import { WritingTaskFlow } from '@/components/cards/writing/WritingTaskFlow';
import VoiceCallScreenElevenLabs from '@/components/cards/VoiceCallScreenElevenLabs';
import { ScoreRing, StatsGrid, WordsToPractice } from '@/components/feedback';
import PureAudioStage from '@/components/listening/PureAudioStage';
import LyricsSubtitleDisplay from '@/components/listening/LyricsSubtitleDisplay';
import ComprehensionQuiz from '@/components/listening/ComprehensionQuiz';
import { getDefaultVoiceForLanguage, getDialogueVoices } from '@/lib/voice/elevenLabsConfig';
import { advanceStairProgression } from '@/lib/services/previewStairs';
import type { SessionStep, SessionVocabItem, SessionListeningContent, VocabularyStepResult, ListeningStepResult, ConversationStepResult, ReadingStepResult, WritingStepResult } from '@/types/stairSession';
import { STEP_INFO } from '@/types/stairSession';
import type { VocabularyItem, VocabCardResult } from '@/types/vocabulary';
import type { WritingTask } from '@/components/cards/writing/types';
import type { Passage } from '@/lib/reading';
import type { VoiceScenario, SupportedLanguage } from '@/lib/voice';
import type { StatItem, WordToPractice } from '@/components/feedback';

// === SESSION PERSISTENCE =====================================================
const SESSION_KEY = 'vox-stair-session-state';
interface PersistedSession { stairId: string; stepIndex: number; results: Record<string, unknown>; wordsAdded: string[]; startedAt: number; }

async function saveSession(data: PersistedSession) {
  try { await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}
async function loadSession(stairId: string): Promise<PersistedSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PersistedSession;
    return p.stairId === stairId ? p : null;
  } catch { return null; }
}
async function clearSession() {
  try { await AsyncStorage.removeItem(SESSION_KEY); } catch {}
}

// === TYPE CONVERTERS =========================================================
function toVocabularyItem(v: SessionVocabItem, i: number): VocabularyItem {
  return {
    id: `sv-${i}`, word: v.word, translation: v.translation, phonetic: v.pronunciation,
    category: 'session', cefrLevel: (v.original_cefr as VocabularyItem['cefrLevel']) || 'B1',
    partOfSpeech: v.part_of_speech || 'noun', masteryScore: v.in_personal_vocab ? 60 : 0,
    priority: 5, timesCorrect: 0, timesIncorrect: 0, source: v.source || 'stair_content',
    exampleSentences: v.example_sentence ? [v.example_sentence] : [],
    addedAt: new Date().toISOString(), nextReviewDate: new Date().toISOString(),
    examples: v.example_sentence ? [{ text: v.example_sentence, translation: v.example_translation || '' }] : [],
    easeFactor: 2.5, interval: 0, repetitions: 0,
    cardVariantsCompleted: { introduction: false, listening: false, typing: false, speaking: false, audioQuiz: false },
    lastVariantShown: null,
  };
}

function toWritingTask(w: { instruction: string; scenario_context: string; key_vocabulary: string[]; target_length: number }, title: string): WritingTask {
  return {
    id: `sw-${Date.now()}`, title, category: 'custom', scenario: w.instruction, goal: w.scenario_context,
    recommendations: w.key_vocabulary.map(v => `Use "${v}" in your writing`), targetLanguage: '',
    minWords: Math.max(10, Math.round(w.target_length * 0.5)), maxWords: w.target_length * 2, difficulty: 'intermediate',
  };
}

function toPassage(r: { title: string; passage: string }): Passage {
  const words = r.passage.split(/\s+/).filter(w => w.length > 0);
  return {
    id: `sr-${Date.now()}`, title: r.title, text: r.passage, difficulty: 'intermediate',
    category: 'session', wordCount: words.length, estimatedDuration: Math.ceil(words.length / 3), sourceType: 'ai_generated',
    createdAt: new Date().toISOString(),
  };
}

// === MAIN SCREEN =============================================================
export default function StairSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const onboarding = useOnboardingV3();
  const targetLang = (onboarding?.target_language || 'en') as SupportedLanguage;
  const session = useStairSession(id, user?.id || 'anonymous');
  const [vocabIdx, setVocabIdx] = useState(0);
  const [listenPhase, setListenPhase] = useState<'intro' | 'playing' | 'questions'>('intro');
  const listenStart = useRef(Date.now());
  const [readingRes, setReadingRes] = useState<{ duration: number; totalWords: number; recordingUri?: string } | null>(null);

  // Init & resume
  useEffect(() => {
    if (!id) return;
    (async () => {
      const saved = await loadSession(id);
      if (saved) { for (let i = 0; i < saved.stepIndex; i++) session.nextStep(); }
      session.startSession();
    })();
  }, [id]);

  // Persist on step change
  useEffect(() => {
    if (!id) return;
    saveSession({ stairId: id, stepIndex: session.state.stepIndex, results: session.state.results as any, wordsAdded: session.state.wordsAdded, startedAt: session.state.startedAt });
  }, [session.state.stepIndex, id]);

  const handleExit = useCallback(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.back(); }, [router]);
  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    session.nextStep(); setVocabIdx(0); setListenPhase('intro'); setReadingRes(null);
  }, [session]);

  // Loading / Error
  if (session.state.isLoading || !session.content) {
    return <SafeAreaView style={S.container}><View style={S.center}><ActivityIndicator size="large" color={colors.primary.DEFAULT} /><Text style={S.loadingText}>Preparing your session...</Text></View></SafeAreaView>;
  }
  if (session.state.error) {
    return <SafeAreaView style={S.container}><View style={S.center}><Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} /><Text style={S.errorTitle}>Unable to load session</Text><Text style={S.errorMsg}>{session.state.error}</Text><TouchableOpacity style={S.retryBtn} onPress={() => session.startSession()}><Text style={S.retryText}>Try Again</Text></TouchableOpacity></View></SafeAreaView>;
  }

  const c = session.content;

  // STEP 1: BRIEFING — full-screen MissionBriefingScreen
  if (session.currentStep === 'briefing') {
    return <MissionBriefingScreen title={c.scenario.title} description={c.scenario.description} difficulty="intermediate" yourRole="You" theirRole={c.scenario.ai_persona.role} objectives={c.scenario.objectives} onStartCall={handleNext} onBack={handleExit} />;
  }

  // STEP 4: CONVERSATION — full-screen voice call
  if (session.currentStep === 'conversation') {
    return <ConversationStep scenario={c.scenario} vocabulary={c.vocabulary} targetLang={targetLang} proficiency={(onboarding?.proficiency_level as string) || 'intermediate'} onComplete={(r) => { session.submitConversationResult(r); handleNext(); }} onBack={() => session.previousStep()} />;
  }

  // Steps with header
  return (
    <SafeAreaView style={S.container} edges={['top']}>
      <SessionHeader currentStep={session.currentStep} stepIndex={session.state.stepIndex} onExit={handleExit} onBack={session.state.stepIndex > 0 ? session.previousStep : handleExit} />
      <Animated.View key={session.currentStep} entering={SlideInRight.duration(300)} exiting={SlideOutLeft.duration(200)} style={S.flex}>
        {session.currentStep === 'vocabulary' && <VocabStep vocab={c.vocabulary} idx={vocabIdx} setIdx={setVocabIdx} onComplete={(r) => { session.submitVocabularyResult(r); handleNext(); }} onAddWord={session.addWordToVocab} />}
        {session.currentStep === 'listening' && <ListenStep listening={c.listening} targetLang={targetLang} phase={listenPhase} setPhase={setListenPhase} startRef={listenStart} onComplete={(r) => { session.submitListeningResult(r); handleNext(); }} />}
        {session.currentStep === 'reading' && <ReadStep reading={c.reading} res={readingRes} setRes={setReadingRes} onComplete={(r) => { session.submitReadingResult(r); handleNext(); }} />}
        {session.currentStep === 'writing' && <WriteStep writing={c.writing} title={c.scenario.title} onComplete={(r) => { session.submitWritingResult(r); handleNext(); }} />}
        {session.currentStep === 'summary' && <SummaryStep summary={session.summary} wordsAdded={session.state.wordsAdded} onFinish={async () => { await session.completeSession(); await clearSession(); if (id) try { await advanceStairProgression(id); } catch {} Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }} />}
      </Animated.View>
    </SafeAreaView>
  );
}

// === HEADER ==================================================================
function SessionHeader({ currentStep, stepIndex, onExit, onBack }: { currentStep: SessionStep; stepIndex: number; onExit: () => void; onBack: () => void }) {
  const info = STEP_INFO.find(s => s.step === currentStep);
  return (
    <View style={S.header}>
      <View style={S.headerRow}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}><Ionicons name={stepIndex > 0 ? 'chevron-back' : 'close'} size={24} color={colors.text.primary} /></TouchableOpacity>
        <Text style={S.headerLabel}>{info?.label || currentStep}</Text>
        <TouchableOpacity onPress={onExit} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}><Ionicons name="close" size={22} color={colors.text.secondary} /></TouchableOpacity>
      </View>
      <View style={S.progressBar}>{STEP_INFO.map((s, i) => <View key={s.step} style={[S.progressSeg, i <= stepIndex && S.progressSegActive, i === stepIndex && S.progressSegCurrent]} />)}</View>
    </View>
  );
}

// === STEP 2: VOCABULARY (VocabularyCardFlow) =================================
function VocabStep({ vocab, idx, setIdx, onComplete, onAddWord }: { vocab: SessionVocabItem[]; idx: number; setIdx: (i: number) => void; onComplete: (r: VocabularyStepResult) => void; onAddWord: (w: string) => void }) {
  const start = useRef(Date.now());
  const [known, setKnown] = useState(0);
  const [practice, setPractice] = useState(0);

  const item = useMemo(() => toVocabularyItem(vocab[idx], idx), [vocab, idx]);

  const handleDone = useCallback((results: VocabCardResult[]) => {
    const knew = results.some(r => r.correct);
    if (knew) setKnown(c => c + 1); else { setPractice(c => c + 1); onAddWord(vocab[idx].word); }
    if (idx >= vocab.length - 1) {
      onComplete({ words_reviewed: vocab.length, words_known: known + (knew ? 1 : 0), words_to_practice: practice + (knew ? 0 : 1), time_seconds: Math.floor((Date.now() - start.current) / 1000) });
    } else setIdx(idx + 1);
  }, [idx, vocab, known, practice, onComplete, onAddWord, setIdx]);

  return <VocabularyCardFlow key={idx} item={item} onComplete={handleDone} onExit={() => onComplete({ words_reviewed: idx, words_known: known, words_to_practice: practice, time_seconds: Math.floor((Date.now() - start.current) / 1000) })} fullFlow />;
}

// === STEP 3: LISTENING (PureAudioStage → Lyrics → ComprehensionQuiz) =========
function ListenStep({ listening, targetLang, phase, setPhase, startRef, onComplete }: { listening: SessionListeningContent; targetLang: SupportedLanguage; phase: 'intro' | 'playing' | 'questions'; setPhase: (p: 'intro' | 'playing' | 'questions') => void; startRef: React.MutableRefObject<number>; onComplete: (r: ListeningStepResult) => void }) {
  const [line, setLine] = useState(0);
  const [full, setFull] = useState(false);
  const { speakSequence, stop: stopTTS, isSpeaking } = useElevenLabsTTS();
  const insets = useSafeAreaInsets();

  const startPlay = useCallback(async () => {
    setPhase('playing'); startRef.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const dv = getDefaultVoiceForLanguage(targetLang);
      const voices = listening.type === 'dialogue' ? getDialogueVoices(targetLang, 2) : [];
      const seq = listening.lines.map((l, i) => {
        let voiceId = dv?.id;
        if (listening.type === 'dialogue' && voices.length >= 2) voiceId = l.speaker === 'A' ? voices[0]?.id : voices[1]?.id;
        return { text: l.text, voiceId, delayBefore: i === 0 ? 500 : 800 };
      });
      await speakSequence(seq, (i) => setLine(i));
      setFull(true); setPhase('questions');
    } catch { setFull(true); setPhase('questions'); }
  }, [listening, targetLang, speakSequence, setPhase, startRef]);

  if (phase === 'intro') {
    return (
      <View style={S.flex}>
        <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={S.overline}>{listening.type === 'story' ? '📖 STORY' : '💬 DIALOGUE'}</Text>
          <Text style={S.title}>{listening.title}</Text>
          <Text style={S.body}>{listening.description}</Text>
        </ScrollView>
        <FixedCTA label="Listen Now" onPress={startPlay} icon="headset" insets={insets} />
      </View>
    );
  }

  if (phase === 'playing') {
    const dl = listening.lines.map(l => ({ speaker: l.speaker_name, text: l.text, translation: l.translation }));
    return (
      <View style={S.flex}>
        <PureAudioStage isSpeaking={isSpeaking} variant="listen" />
        <LyricsSubtitleDisplay dialogueLines={dl} currentLineIndex={line} audioProgress={listening.lines.length > 0 ? line / listening.lines.length : 0} audioDuration={listening.lines.length * 5} audioCurrentTime={line * 5} />
        <FixedCTA label="Skip to Questions" onPress={async () => { await stopTTS(); setPhase('questions'); }} variant="secondary" insets={insets} />
      </View>
    );
  }

  // Questions
  const qs = listening.questions.map(q => ({ question: q.question, options: q.options, correctIndex: q.correct_index }));
  return <ComprehensionQuiz questions={qs} isRevealMode onComplete={(score) => { const t = Math.floor((Date.now() - startRef.current) / 1000); const total = listening.questions.length; onComplete({ questions_total: total, questions_correct: score, comprehension_score: total > 0 ? Math.round((score / total) * 100) : 0, listened_fully: full, time_seconds: t }); }} />;
}

// === STEP 4: CONVERSATION ====================================================
function ConversationStep({ scenario, vocabulary, targetLang, proficiency, onComplete, onBack }: { scenario: any; vocabulary: SessionVocabItem[]; targetLang: SupportedLanguage; proficiency: string; onComplete: (r: ConversationStepResult) => void; onBack: () => void }) {
  const [phase, setPhase] = useState<'prep' | 'call'>('prep');
  const start = useRef(Date.now());
  const insets = useSafeAreaInsets();
  const vs: VoiceScenario = useMemo(() => ({ id: `st-${Date.now()}`, title: scenario.title, description: scenario.description, difficulty: 'intermediate' as const, context: scenario.context, aiRole: scenario.ai_persona.role, objectives: scenario.objectives, suggestedPhrases: scenario.key_phrases.map((k: any) => k.phrase), category: 'professional' as const }), [scenario]);
  const voice = useMemo(() => getDefaultVoiceForLanguage(targetLang), [targetLang]);

  if (phase === 'prep') {
    return (
      <SafeAreaView style={S.container} edges={['top']}>
        <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={onBack} style={{ marginBottom: spacing.md }}><Ionicons name="chevron-back" size={24} color={colors.text.primary} /></TouchableOpacity>
          <Text style={S.overline}>CONVERSATION</Text>
          <Text style={S.title}>{scenario.title}</Text>
          <Text style={S.body}>You'll talk to: {scenario.ai_persona.role}</Text>
        </ScrollView>
        <FixedCTA label="Start Call" onPress={() => { start.current = Date.now(); setPhase('call'); }} icon="call" color={colors.success.DEFAULT} insets={insets} />
      </SafeAreaView>
    );
  }

  return <VoiceCallScreenElevenLabs scenario={vs} voice={voice} targetLanguage={targetLang} proficiency={proficiency as any} onComplete={(r) => onComplete({ messages_sent: r.messages?.length ?? 0, duration_seconds: Math.floor((Date.now() - start.current) / 1000), words_used_correctly: [], new_words_encountered: [], fluency_score: r.success ? 70 : 40 })} onBack={() => setPhase('prep')} />;
}

// === STEP 5: READING (TeleprompterCard → ReadingResultsCard) =================
function ReadStep({ reading, res, setRes, onComplete }: { reading: any; res: any; setRes: (r: any) => void; onComplete: (r: ReadingStepResult) => void }) {
  const passage = useMemo(() => toPassage(reading), [reading]);

  if (!res) return <TeleprompterCard passage={passage} onFinish={setRes} onBack={() => onComplete({ questions_total: 0, questions_correct: 0, words_tapped: 0, time_seconds: 0, comprehension_score: 0 })} />;

  return <ReadingResultsCard results={res} analysisResult={null} onPracticeAgain={() => setRes(null)} onFinish={() => onComplete({ questions_total: reading.questions?.length || 0, questions_correct: 0, words_tapped: 0, time_seconds: res.duration, comprehension_score: 75 })} />;
}

// === STEP 6: WRITING (WritingTaskFlow) =======================================
function WriteStep({ writing, title, onComplete }: { writing: any; title: string; onComplete: (r: WritingStepResult) => void }) {
  const task = useMemo(() => toWritingTask(writing, title), [writing, title]);
  return <WritingTaskFlow task={task} onComplete={(r) => { const wc = r.originalText.trim().split(/\s+/).length; onComplete({ word_count: wc, key_vocab_used: writing.key_vocabulary.filter((v: string) => r.originalText.toLowerCase().includes(v.toLowerCase())).length, key_vocab_total: writing.key_vocabulary.length, time_seconds: Math.floor(r.timeSpentMs / 1000), grammar_score: r.analysis?.grammarScore, corrections: r.analysis?.corrections.length }); }} onExit={() => onComplete({ word_count: 0, key_vocab_used: 0, key_vocab_total: writing.key_vocabulary.length, time_seconds: 0 })} />;
}

// === STEP 7: SUMMARY (ScoreRing + StatsGrid + WordsToPractice) ===============
function SummaryStep({ summary, wordsAdded, onFinish }: { summary: any; wordsAdded: string[]; onFinish: () => void }) {
  const insets = useSafeAreaInsets();
  if (!summary) return <View style={S.center}><ActivityIndicator size="large" color={colors.primary.DEFAULT} /><Text style={S.loadingText}>Calculating results...</Text></View>;

  const stats: StatItem[] = [
    { icon: '🎧', value: `${summary.listening_score}%`, label: 'Listening', color: colors.secondary.DEFAULT },
    { icon: '🗣️', value: `${summary.conversation_score}%`, label: 'Speaking', color: colors.primary.DEFAULT },
    { icon: '📖', value: `${summary.reading_score}%`, label: 'Reading', color: '#8B5CF6' },
    { icon: '✍️', value: `${summary.writing_score}%`, label: 'Writing', color: '#F59E0B' },
  ];
  const wtp: WordToPractice[] = wordsAdded.map(w => ({ word: w, issue: 'Flagged during session', severity: 'moderate' as const }));

  return (
    <View style={S.flex}>
      <ScrollView style={S.scroll} contentContainerStyle={[S.scrollContent, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)} style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <ScoreRing score={summary.overall_score} size={160} label="Overall" />
          <Text style={S.summaryTime}>{Math.floor(summary.total_time_seconds / 60)}m {summary.total_time_seconds % 60}s</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300)}><StatsGrid stats={stats} /></Animated.View>
        {wordsAdded.length > 0 && <Animated.View entering={FadeInDown.delay(500)} style={{ marginTop: spacing.lg }}><Text style={S.sectionLabel}>WORDS TO PRACTICE</Text><WordsToPractice words={wtp} /></Animated.View>}
        <Animated.View entering={FadeIn.delay(700)}><Text style={S.fsrsNote}>{summary.fsrs_updates.length} vocabulary cards scheduled for review</Text></Animated.View>
      </ScrollView>
      <FixedCTA label="Complete Session" onPress={onFinish} color={colors.success.DEFAULT} insets={insets} />
    </View>
  );
}

// === FIXED CTA (always bottom, safe area) ====================================
function FixedCTA({ label, onPress, icon, color, variant = 'primary', insets, disabled }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; color?: string; variant?: 'primary' | 'secondary'; insets: { bottom: number }; disabled?: boolean }) {
  const bg: [string, string] = variant === 'secondary' ? [colors.background.card, colors.background.elevated] : [color || colors.primary.DEFAULT, color ? `${color}CC` : colors.primary.light];
  return (
    <View style={[S.fixedCTA, { paddingBottom: insets.bottom + spacing.md }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={disabled}>
        <LinearGradient colors={disabled ? ['#333', '#222'] : bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.ctaGradient}>
          {icon && <Ionicons name={icon} size={20} color="#fff" style={{ marginRight: spacing.sm }} />}
          <Text style={[S.ctaText, variant === 'secondary' && { color: colors.text.secondary }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// === STYLES ==================================================================
const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.text.primary, fontSize: typography.fontSize.lg, fontWeight: '600', marginTop: spacing.lg },
  errorTitle: { color: colors.text.primary, fontSize: typography.fontSize.xl, fontWeight: '700', marginTop: spacing.md },
  errorMsg: { color: colors.text.secondary, fontSize: typography.fontSize.base, textAlign: 'center', marginTop: spacing.sm },
  retryBtn: { backgroundColor: colors.primary.DEFAULT, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.xl },
  retryText: { color: '#fff', fontWeight: '700' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  headerLabel: { color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  progressBar: { flexDirection: 'row', gap: 3 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressSegActive: { backgroundColor: colors.primary.DEFAULT },
  progressSegCurrent: { backgroundColor: colors.primary.light },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xl * 3 },
  overline: { color: colors.primary.DEFAULT, fontSize: typography.fontSize.xs, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.sm },
  title: { color: colors.text.primary, fontSize: 26, fontWeight: '800', marginBottom: spacing.sm },
  body: { color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 24, marginBottom: spacing.lg },
  summaryTime: { color: colors.text.secondary, fontSize: typography.fontSize.base, marginTop: spacing.md },
  sectionLabel: { color: colors.primary.light, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm },
  fsrsNote: { color: colors.text.tertiary, fontSize: typography.fontSize.sm, textAlign: 'center', marginTop: spacing.lg, fontStyle: 'italic' },
  fixedCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.background.primary },
  ctaGradient: { borderRadius: borderRadius.lg, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: typography.fontSize.base, fontWeight: '700' },
});
