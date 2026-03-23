/**
 * Stair Session Flow Screen — PRODUCTION
 *
 * The core guided learning experience. One scenario, six skills.
 * Briefing → Vocabulary → Listening → Conversation → Reading → Writing → Summary
 *
 * Design philosophy:
 * - Professional, fast, straight to the point
 * - Big buttons, minimal text, maximum value
 * - Vocabulary in batches (see all first, then practice)
 * - Listening = scenario story that motivates before conversation
 * - Conversation = real ElevenLabs voice call
 * - Reading = teleprompter with audio
 * - Writing = real text editor
 *
 * Every second of the user's time must deliver value.
 */

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { useStairSession } from '@/hooks/useStairSession';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import VoiceCallScreenElevenLabs from '@/components/cards/VoiceCallScreenElevenLabs';
import type { VoiceCallCompletionResult } from '@/components/cards/VoiceCallScreenElevenLabs';
import { getDefaultVoiceForLanguage } from '@/lib/voice/elevenLabsConfig';
import type {
  SessionStep,
  SessionVocabItem,
  SessionListeningContent,
  ListeningStepResult,
  VocabularyStepResult,
  ReadingStepResult,
  WritingStepResult,
  ConversationStepResult,
} from '@/types/stairSession';
import { STEP_INFO } from '@/types/stairSession';
import type { VoiceScenario, SupportedLanguage } from '@/lib/voice';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function StairSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = user?.id;
  const session = useStairSession(id, userId);

  useEffect(() => {
    if (id && userId) {
      session.startSession();
    }
  }, [id, userId]);

  const handleExit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }, [router]);

  const handleStepComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    session.nextStep();
  }, [session]);

  // Loading state
  if (session.state.isLoading) {
    return (
      <SafeAreaView style={S.container}>
        <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={S.gradient}>
          <View style={S.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={S.loadingText}>Preparing your session...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error state
  if (session.state.error) {
    return (
      <SafeAreaView style={S.container}>
        <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={S.gradient}>
          <View style={S.centerContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
            <Text style={S.errorTitle}>Unable to load session</Text>
            <Text style={S.errorMsg}>{session.state.error}</Text>
            <TouchableOpacity style={S.retryBtn} onPress={() => session.startSession()}>
              <Text style={S.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!session.content) {
    return (
      <SafeAreaView style={S.container}>
        <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={S.gradient}>
          <View style={S.centerContainer}>
            <Text style={S.loadingText}>Sign in to start</Text>
            <TouchableOpacity onPress={handleExit} style={{ marginTop: spacing.lg }}>
              <Text style={S.linkText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // When in conversation mode, render full-screen voice call
  if (session.currentStep === 'conversation') {
    return (
      <ConversationStep
        scenario={session.content.scenario}
        vocabulary={session.content.vocabulary}
        onComplete={(result) => {
          session.submitConversationResult(result);
          handleStepComplete();
        }}
        onBack={() => session.previousStep()}
      />
    );
  }

  return (
    <SafeAreaView style={S.container} edges={['top']}>
      <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={S.gradient}>
        <SessionHeader
          currentStep={session.currentStep}
          stepIndex={session.state.stepIndex}
          onExit={handleExit}
          onBack={session.state.stepIndex > 0 ? session.previousStep : handleExit}
        />

        <Animated.View
          key={session.currentStep}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(200)}
          style={S.stepContainer}
        >
          {session.currentStep === 'briefing' && (
            <BriefingStep
              scenario={session.content.scenario}
              onContinue={handleStepComplete}
            />
          )}

          {session.currentStep === 'vocabulary' && (
            <VocabularyStep
              vocabulary={session.content.vocabulary}
              onComplete={(result) => {
                session.submitVocabularyResult(result);
                handleStepComplete();
              }}
              onAddWord={session.addWordToVocab}
            />
          )}

          {session.currentStep === 'listening' && (
            <ListeningStep
              listening={session.content.listening}
              onComplete={(result) => {
                session.submitListeningResult(result);
                handleStepComplete();
              }}
            />
          )}

          {session.currentStep === 'reading' && (
            <ReadingStep
              reading={session.content.reading}
              onComplete={(result) => {
                session.submitReadingResult(result);
                handleStepComplete();
              }}
              onAddWord={session.addWordToVocab}
            />
          )}

          {session.currentStep === 'writing' && (
            <WritingStep
              writing={session.content.writing}
              onComplete={(result) => {
                session.submitWritingResult(result);
                handleStepComplete();
              }}
            />
          )}

          {session.currentStep === 'summary' && (
            <SummaryStep
              summary={session.summary}
              wordsAdded={session.state.wordsAdded}
              onFinish={async () => {
                await session.completeSession();
                router.back();
              }}
            />
          )}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ============================================================================
// SESSION HEADER — minimal, professional
// ============================================================================

function SessionHeader({
  currentStep,
  stepIndex,
  onExit,
  onBack,
}: {
  currentStep: SessionStep;
  stepIndex: number;
  onExit: () => void;
  onBack: () => void;
}) {
  const stepInfo = STEP_INFO.find(s => s.step === currentStep);

  return (
    <View style={S.header}>
      <View style={S.headerRow}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name={stepIndex > 0 ? 'chevron-back' : 'close'} size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={S.headerLabel}>{stepInfo?.label || currentStep}</Text>
        <TouchableOpacity onPress={onExit} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      <View style={S.progressBar}>
        {STEP_INFO.map((info, i) => (
          <View
            key={info.step}
            style={[
              S.progressSeg,
              i <= stepIndex && S.progressSegActive,
              i === stepIndex && S.progressSegCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// STEP 1: BRIEFING — Quick, direct, no fluff
// ============================================================================

function BriefingStep({
  scenario,
  onContinue,
}: {
  scenario: NonNullable<ReturnType<typeof useStairSession>['content']>['scenario'];
  onContinue: () => void;
}) {
  return (
    <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.delay(100)}>
        <Text style={S.overline}>YOUR MISSION</Text>
        <Text style={S.title}>{scenario.title}</Text>
        <Text style={S.body}>{scenario.description}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={S.card}>
        <Text style={S.cardLabel}>THE SITUATION</Text>
        <Text style={S.cardText}>{scenario.context}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={S.card}>
        <Text style={S.cardLabel}>YOU'LL TALK TO</Text>
        <Text style={S.cardText}>{scenario.ai_persona.role}</Text>
        <Text style={S.cardSub}>{scenario.ai_persona.speaking_style}</Text>
      </Animated.View>

      {scenario.key_phrases.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400)} style={S.card}>
          <Text style={S.cardLabel}>KEY PHRASES</Text>
          {scenario.key_phrases.slice(0, 4).map((kp, i) => (
            <View key={i} style={S.phraseRow}>
              <Text style={S.phraseText}>{kp.phrase}</Text>
              {kp.translation ? <Text style={S.phraseTrans}>{kp.translation}</Text> : null}
            </View>
          ))}
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.delay(500)}>
        <CTAButton label="Let's Go" onPress={onContinue} />
      </Animated.View>
    </ScrollView>
  );
}

// ============================================================================
// STEP 2: VOCABULARY — Batch overview first, then quick review
// ============================================================================

type VocabPhase = 'overview' | 'review';

function VocabularyStep({
  vocabulary,
  onComplete,
  onAddWord,
}: {
  vocabulary: SessionVocabItem[];
  onComplete: (result: VocabularyStepResult) => void;
  onAddWord: (word: string) => void;
}) {
  const [phase, setPhase] = useState<VocabPhase>('overview');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const startTime = useRef(Date.now());

  // PHASE 1: Overview — show ALL words at once, quick scan
  if (phase === 'overview') {
    return (
      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown}>
          <Text style={S.title}>Words for this scenario</Text>
          <Text style={S.body}>Quick scan — tap any word to hear it. Then we'll do a fast review.</Text>
        </Animated.View>

        <View style={S.vocabGrid}>
          {vocabulary.map((word, i) => (
            <Animated.View key={word.word} entering={FadeInDown.delay(i * 60)}>
              <VocabOverviewChip word={word} />
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(vocabulary.length * 60 + 200)}>
          <CTAButton
            label={`Quick Review (${vocabulary.length} words)`}
            onPress={() => setPhase('review')}
          />
        </Animated.View>
      </ScrollView>
    );
  }

  // PHASE 2: Quick review — swipe through, Know/Practice
  const currentWord = vocabulary[reviewIndex];
  const isLast = reviewIndex >= vocabulary.length - 1;

  const advance = (knew: boolean) => {
    if (knew) {
      setKnownCount(c => c + 1);
    } else {
      setPracticeCount(c => c + 1);
      onAddWord(currentWord.word);
    }
    setShowTranslation(false);

    if (isLast) {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      onComplete({
        words_reviewed: vocabulary.length,
        words_known: knownCount + (knew ? 1 : 0),
        words_to_practice: practiceCount + (knew ? 0 : 1),
        time_seconds: timeSpent,
      });
    } else {
      setReviewIndex(i => i + 1);
    }
  };

  if (!currentWord) return null;

  return (
    <View style={S.vocabReviewContainer}>
      {/* Progress */}
      <Text style={S.vocabProgress}>
        {reviewIndex + 1} / {vocabulary.length}
      </Text>

      {/* Card */}
      <Animated.View key={reviewIndex} entering={SlideInRight.duration(250)} style={S.vocabCard}>
        <Text style={S.vocabWord}>{currentWord.word}</Text>
        {currentWord.pronunciation && (
          <Text style={S.vocabPhonetic}>/{currentWord.pronunciation}/</Text>
        )}

        {/* Audio button */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Speech.speak(currentWord.word, { rate: 0.85 });
          }}
          style={S.vocabAudioBtn}
        >
          <Ionicons name="volume-high" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Tap to reveal */}
        <TouchableOpacity
          onPress={() => { setShowTranslation(!showTranslation); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={S.vocabReveal}
        >
          {showTranslation ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Text style={S.vocabTranslation}>{currentWord.translation}</Text>
              {currentWord.example_sentence && (
                <Text style={S.vocabExample}>"{currentWord.example_sentence}"</Text>
              )}
            </Animated.View>
          ) : (
            <Text style={S.vocabRevealHint}>Tap to reveal</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Big action buttons */}
      <View style={S.vocabActions}>
        <TouchableOpacity onPress={() => advance(false)} style={S.btnPractice} activeOpacity={0.85}>
          <LinearGradient colors={colors.gradients.error} style={S.btnGradient}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={S.btnLabel}>Practice</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => advance(true)} style={S.btnKnow} activeOpacity={0.85}>
          <LinearGradient colors={colors.gradients.success} style={S.btnGradient}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={S.btnLabel}>Know it</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Single vocab chip in overview grid — tap to hear */
function VocabOverviewChip({ word }: { word: SessionVocabItem }) {
  const [expanded, setExpanded] = useState(false);

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(word.word, { rate: 0.85 });
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity onPress={handleTap} style={S.vocabChip} activeOpacity={0.8}>
      <View style={S.vocabChipRow}>
        <Ionicons name="volume-medium-outline" size={16} color={colors.primary.light} />
        <Text style={S.vocabChipWord}>{word.word}</Text>
      </View>
      {expanded && (
        <Animated.View entering={FadeIn.duration(150)}>
          <Text style={S.vocabChipTrans}>{word.translation}</Text>
          {word.pronunciation && <Text style={S.vocabChipPhonetic}>/{word.pronunciation}/</Text>}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// STEP 3: LISTENING — Scenario story with audio + questions
// ============================================================================

function ListeningStep({
  listening,
  onComplete,
}: {
  listening: SessionListeningContent;
  onComplete: (result: ListeningStepResult) => void;
}) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'questions' | 'done'>('intro');
  const [currentLine, setCurrentLine] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [listenedFully, setListenedFully] = useState(false);
  const startTime = useRef(Date.now());

  const { speak, speakSequence, stop: stopTTS, isSpeaking } = useElevenLabsTTS();

  // Start playing all lines
  const handleStartListening = useCallback(async () => {
    setPhase('playing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const sequence = listening.lines.map((line, idx) => ({
        text: line.text,
        delayBefore: idx === 0 ? 500 : 800,
      }));

      await speakSequence(sequence, (lineIndex) => {
        setCurrentLine(lineIndex);
      });

      setListenedFully(true);
      setPhase('questions');
    } catch (err) {
      console.error('[Listening] TTS error:', err);
      // Fallback: mark as listened and move to questions
      setListenedFully(true);
      setPhase('questions');
    }
  }, [listening.lines, speakSequence]);

  // Handle skip to questions
  const handleSkipToQuestions = useCallback(async () => {
    await stopTTS();
    setPhase('questions');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [stopTTS]);

  // Handle question answer
  const handleAnswer = useCallback((index: number) => {
    setSelectedAnswer(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isCorrect = index === listening.questions[questionIndex]?.correct_index;
    if (isCorrect) setCorrectCount(c => c + 1);

    setTimeout(() => {
      setSelectedAnswer(null);
      if (questionIndex >= listening.questions.length - 1) {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        const score = Math.round(
          ((correctCount + (isCorrect ? 1 : 0)) / listening.questions.length) * 100
        );
        onComplete({
          questions_total: listening.questions.length,
          questions_correct: correctCount + (isCorrect ? 1 : 0),
          comprehension_score: score,
          listened_fully: listenedFully,
          time_seconds: timeSpent,
        });
      } else {
        setQuestionIndex(q => q + 1);
      }
    }, 1200);
  }, [questionIndex, correctCount, listening.questions, listenedFully, onComplete]);

  // INTRO
  if (phase === 'intro') {
    return (
      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={S.listenBadge}>
            <Ionicons name={listening.type === 'story' ? 'book' : 'chatbubbles'} size={16} color={colors.primary.light} />
            <Text style={S.listenBadgeText}>{listening.type === 'story' ? 'STORY' : 'DIALOGUE'}</Text>
          </View>
          <Text style={S.title}>{listening.title}</Text>
          <Text style={S.body}>{listening.description}</Text>
        </Animated.View>

        {/* Vocabulary spotlight */}
        <Animated.View entering={FadeInDown.delay(200)} style={S.card}>
          <Text style={S.cardLabel}>WORDS TO LISTEN FOR</Text>
          <View style={S.spotlightChips}>
            {listening.vocabulary_spotlight.map((word, i) => (
              <View key={i} style={S.spotlightChip}>
                <Text style={S.spotlightChipText}>{word}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          <CTAButton label="Listen Now" onPress={handleStartListening} icon="headset" />
        </Animated.View>
      </ScrollView>
    );
  }

  // PLAYING — show lines as they're spoken
  if (phase === 'playing') {
    return (
      <View style={S.listeningPlayContainer}>
        {/* Waveform indicator */}
        <Animated.View entering={FadeIn} style={S.waveContainer}>
          <View style={S.waveBarRow}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  S.waveBar,
                  {
                    height: isSpeaking ? 12 + Math.sin(i * 0.8 + Date.now() / 200) * 20 : 8,
                    opacity: isSpeaking ? 0.6 + Math.sin(i * 0.5) * 0.4 : 0.3,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={S.speakingIndicator}>
            {isSpeaking ? 'Listening...' : 'Processing...'}
          </Text>
        </Animated.View>

        {/* Current line display */}
        <ScrollView style={S.linesScroll} showsVerticalScrollIndicator={false}>
          {listening.lines.map((line, i) => (
            <Animated.View
              key={i}
              entering={i <= currentLine ? FadeInDown.delay(i * 100) : undefined}
              style={[
                S.lineContainer,
                i === currentLine && S.lineActive,
                i > currentLine && S.lineFuture,
              ]}
            >
              {listening.type === 'dialogue' && (
                <Text style={[S.lineSpeaker, i === currentLine && S.lineSpeakerActive]}>
                  {line.speaker_name}
                </Text>
              )}
              <Text style={[S.lineText, i === currentLine && S.lineTextActive, i > currentLine && S.lineTextFuture]}>
                {line.text}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Skip button */}
        <TouchableOpacity onPress={handleSkipToQuestions} style={S.skipBtn}>
          <Text style={S.skipText}>Skip to Questions →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // QUESTIONS
  if (phase === 'questions') {
    const question = listening.questions[questionIndex];
    if (!question) return null;

    return (
      <View style={S.questionContainer}>
        <Text style={S.questionProgress}>
          Question {questionIndex + 1} / {listening.questions.length}
        </Text>
        <Text style={S.questionText}>{question.question}</Text>
        <View style={S.questionOptions}>
          {question.options.map((option, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === question.correct_index;
            const showResult = selectedAnswer !== null;

            return (
              <TouchableOpacity
                key={i}
                onPress={() => selectedAnswer === null && handleAnswer(i)}
                style={[
                  S.questionOption,
                  showResult && isCorrect && S.questionCorrect,
                  showResult && isSelected && !isCorrect && S.questionWrong,
                ]}
                disabled={selectedAnswer !== null}
              >
                <Text style={[
                  S.questionOptionText,
                  showResult && isCorrect && { color: colors.success.DEFAULT },
                  showResult && isSelected && !isCorrect && { color: colors.error.DEFAULT },
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Daily tip */}
        <Animated.View entering={FadeIn.delay(500)} style={S.dailyTip}>
          <Ionicons name="bulb-outline" size={16} color={colors.warning.DEFAULT} />
          <Text style={S.dailyTipText}>{listening.daily_tip}</Text>
        </Animated.View>
      </View>
    );
  }

  return null;
}

// ============================================================================
// STEP 4: CONVERSATION — Real ElevenLabs voice call
// ============================================================================

function ConversationStep({
  scenario,
  vocabulary,
  onComplete,
  onBack,
}: {
  scenario: NonNullable<ReturnType<typeof useStairSession>['content']>['scenario'];
  vocabulary: SessionVocabItem[];
  onComplete: (result: ConversationStepResult) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<'prep' | 'call' | 'done'>('prep');
  const startTime = useRef(Date.now());
  const onboarding = useOnboardingV3();

  // Build a VoiceScenario from session scenario
  const voiceScenario: VoiceScenario = useMemo(() => ({
    id: `stair-${Date.now()}`,
    title: scenario.title,
    description: scenario.description,
    difficulty: 'intermediate' as const,
    context: scenario.context,
    aiRole: scenario.ai_persona.role,
    objectives: scenario.objectives,
    suggestedPhrases: scenario.key_phrases.map(kp => kp.phrase),
    category: 'professional' as const,
  }), [scenario]);

  const targetLang = (onboarding?.target_language || 'en') as SupportedLanguage;
  const voice = useMemo(() => getDefaultVoiceForLanguage(targetLang), [targetLang]);

  const handleCallComplete = useCallback((result: VoiceCallCompletionResult) => {
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    onComplete({
      messages_sent: result.messages?.length ?? 0,
      duration_seconds: duration,
      words_used_correctly: [],
      new_words_encountered: [],
      fluency_score: result.success ? 70 : 40,
    });
  }, [onComplete]);

  // PRE-CALL: Quick vocab reminder + start button
  if (phase === 'prep') {
    return (
      <SafeAreaView style={S.container} edges={['top']}>
        <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={S.gradient}>
          <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={onBack} style={{ marginBottom: spacing.md }}>
              <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <Animated.View entering={FadeInDown.delay(100)}>
              <Text style={S.overline}>CONVERSATION</Text>
              <Text style={S.title}>{scenario.title}</Text>
              <Text style={S.body}>You'll talk to: {scenario.ai_persona.role}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)} style={S.card}>
              <Text style={S.cardLabel}>OBJECTIVES</Text>
              {scenario.objectives.map((obj, i) => (
                <View key={i} style={S.objectiveRow}>
                  <View style={S.objectiveDot} />
                  <Text style={S.objectiveText}>{obj}</Text>
                </View>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300)} style={S.card}>
              <Text style={S.cardLabel}>KEY PHRASES TO USE</Text>
              <View style={S.chipRow}>
                {vocabulary.slice(0, 6).map((v, i) => (
                  <View key={i} style={S.spotlightChip}>
                    <Text style={S.spotlightChipText}>{v.word}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400)}>
              <CTAButton
                label="Start Call"
                onPress={() => { startTime.current = Date.now(); setPhase('call'); }}
                icon="call"
                color={colors.success.DEFAULT}
              />
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // CALL: Full-screen ElevenLabs voice call
  return (
    <VoiceCallScreenElevenLabs
      scenario={voiceScenario}
      voice={voice}
      targetLanguage={targetLang}
      proficiency={(onboarding?.proficiency_level as any) || 'intermediate'}
      onComplete={handleCallComplete}
      onBack={() => setPhase('prep')}
    />
  );
}

// ============================================================================
// STEP 5: READING — passage + comprehension questions
// ============================================================================

function ReadingStep({
  reading,
  onComplete,
  onAddWord,
}: {
  reading: NonNullable<ReturnType<typeof useStairSession>['content']>['reading'];
  onComplete: (result: ReadingStepResult) => void;
  onAddWord: (word: string) => void;
}) {
  const [phase, setPhase] = useState<'read' | 'questions'>('read');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [tappedWords, setTappedWords] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  const handleWordTap = (word: string) => {
    if (!tappedWords.includes(word)) {
      setTappedWords(prev => [...prev, word]);
      onAddWord(word);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isCorrect = index === reading.questions[questionIndex]?.correct_index;
    if (isCorrect) setCorrectCount(c => c + 1);

    setTimeout(() => {
      setSelectedAnswer(null);
      if (questionIndex >= reading.questions.length - 1) {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const score = Math.round((finalCorrect / reading.questions.length) * 100);
        onComplete({
          questions_total: reading.questions.length,
          questions_correct: finalCorrect,
          words_tapped: tappedWords.length,
          time_seconds: timeSpent,
          comprehension_score: score,
        });
      } else {
        setQuestionIndex(q => q + 1);
      }
    }, 1200);
  };

  // Reading phase
  if (phase === 'read') {
    return (
      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={S.title}>{reading.title}</Text>
        <Text style={S.body}>Read the passage. Tap unfamiliar words to save them.</Text>

        <View style={S.readingPassage}>
          <Text style={S.passageText}>{reading.passage}</Text>
        </View>

        {reading.tappable_words.length > 0 && (
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={S.cardLabel}>TAP TO LEARN</Text>
            <View style={S.chipRow}>
              {reading.tappable_words.map((tw, i) => {
                const isTapped = tappedWords.includes(tw.word);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleWordTap(tw.word)}
                    style={[S.tappableWord, isTapped && S.tappableWordDone]}
                  >
                    <Text style={[S.tappableText, isTapped && S.tappableTextDone]}>{tw.word}</Text>
                    {isTapped && <Text style={S.tappableTrans}>{tw.translation}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <CTAButton
          label={`Answer ${reading.questions.length} Questions`}
          onPress={() => setPhase('questions')}
        />
      </ScrollView>
    );
  }

  // Questions phase
  const question = reading.questions[questionIndex];
  if (!question) return null;

  return (
    <View style={S.questionContainer}>
      <Text style={S.questionProgress}>Question {questionIndex + 1} / {reading.questions.length}</Text>
      <Text style={S.questionText}>{question.question}</Text>
      <View style={S.questionOptions}>
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = i === question.correct_index;
          const showResult = selectedAnswer !== null;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => selectedAnswer === null && handleAnswer(i)}
              style={[
                S.questionOption,
                showResult && isCorrect && S.questionCorrect,
                showResult && isSelected && !isCorrect && S.questionWrong,
              ]}
              disabled={selectedAnswer !== null}
            >
              <Text style={[
                S.questionOptionText,
                showResult && isCorrect && { color: colors.success.DEFAULT },
                showResult && isSelected && !isCorrect && { color: colors.error.DEFAULT },
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================================
// STEP 6: WRITING — Real text editor
// ============================================================================

function WritingStep({
  writing,
  onComplete,
}: {
  writing: NonNullable<ReturnType<typeof useStairSession>['content']>['writing'];
  onComplete: (result: WritingStepResult) => void;
}) {
  const [text, setText] = useState('');
  const startTime = useRef(Date.now());
  const insets = useSafeAreaInsets();

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const vocabUsed = writing.key_vocabulary.filter(v =>
    text.toLowerCase().includes(v.toLowerCase())
  ).length;

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete({
      word_count: wordCount,
      key_vocab_used: vocabUsed,
      key_vocab_total: writing.key_vocabulary.length,
      time_seconds: timeSpent,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={S.title}>Writing Practice</Text>
        <Text style={S.body}>{writing.instruction}</Text>

        {/* Vocab chips */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={S.cardLabel}>USE THESE WORDS ({vocabUsed}/{writing.key_vocabulary.length})</Text>
          <View style={S.chipRow}>
            {writing.key_vocabulary.map((word, i) => {
              const isUsed = text.toLowerCase().includes(word.toLowerCase());
              return (
                <View key={i} style={[S.spotlightChip, isUsed && S.chipUsed]}>
                  <Text style={[S.spotlightChipText, isUsed && S.chipUsedText]}>
                    {isUsed ? '✓ ' : ''}{word}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Text editor */}
        <View style={S.editorContainer}>
          <TextInput
            multiline
            value={text}
            onChangeText={setText}
            placeholder="Start writing here..."
            placeholderTextColor={colors.text.tertiary}
            style={S.editor}
            textAlignVertical="top"
          />
          <Text style={S.wordCounter}>{wordCount} / {writing.target_length} words</Text>
        </View>

        <CTAButton
          label="Submit Writing"
          onPress={handleSubmit}
          disabled={wordCount < 3}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STEP 7: SUMMARY — with listening score
// ============================================================================

function SummaryStep({
  summary,
  wordsAdded,
  onFinish,
}: {
  summary: ReturnType<typeof useStairSession>['summary'];
  wordsAdded: string[];
  onFinish: () => void;
}) {
  if (!summary) {
    return (
      <View style={S.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={S.loadingText}>Calculating results...</Text>
      </View>
    );
  }

  const metrics = [
    { label: 'Listening', value: `${summary.listening_score}%`, score: summary.listening_score, color: colors.secondary.DEFAULT },
    { label: 'Conversation', value: `${summary.conversation_score}%`, score: summary.conversation_score, color: colors.primary.DEFAULT },
    { label: 'Reading', value: `${summary.reading_score}%`, score: summary.reading_score, color: '#8B5CF6' },
    { label: 'Writing', value: `${summary.writing_score}%`, score: summary.writing_score, color: '#F59E0B' },
  ];

  return (
    <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Score */}
      <Animated.View entering={FadeInDown.delay(100)} style={S.summaryScore}>
        <View style={S.scoreCircle}>
          <Text style={S.scoreValue}>{summary.overall_score}</Text>
          <Text style={S.scoreLabel}>Overall</Text>
        </View>
        <Text style={S.summaryTime}>
          {Math.floor(summary.total_time_seconds / 60)}m {summary.total_time_seconds % 60}s
        </Text>
      </Animated.View>

      {/* Breakdown bars */}
      <Animated.View entering={FadeInDown.delay(200)} style={S.summaryBreakdown}>
        {metrics.map((m, i) => (
          <Animated.View key={m.label} entering={FadeInDown.delay(250 + i * 80)} style={S.metricRow}>
            <Text style={S.metricLabel}>{m.label}</Text>
            <View style={S.metricBarBg}>
              <View style={[S.metricBarFill, { width: `${Math.max(m.score, 5)}%`, backgroundColor: m.color }]} />
            </View>
            <Text style={S.metricValue}>{m.value}</Text>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Words added */}
      {wordsAdded.length > 0 && (
        <Animated.View entering={FadeInDown.delay(500)} style={S.card}>
          <Text style={[S.cardLabel, { color: colors.success.DEFAULT }]}>
            {wordsAdded.length} WORDS ADDED
          </Text>
          <View style={S.chipRow}>
            {wordsAdded.map((word, i) => (
              <View key={i} style={[S.spotlightChip, S.chipUsed]}>
                <Text style={[S.spotlightChipText, S.chipUsedText]}>{word}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.delay(600)}>
        <Text style={S.fsrsNote}>
          {summary.fsrs_updates.length} vocabulary cards scheduled for review
        </Text>
        <CTAButton label="Complete Session" onPress={onFinish} color={colors.success.DEFAULT} />
      </Animated.View>
    </ScrollView>
  );
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function CTAButton({
  label,
  onPress,
  icon,
  color,
  disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={disabled} style={{ marginTop: spacing.md }}>
      <LinearGradient
        colors={disabled ? ['#333', '#222'] : [color || colors.primary.DEFAULT, color ? `${color}CC` : colors.primary.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[S.cta, disabled && { opacity: 0.5 }]}
      >
        {icon && <Ionicons name={icon} size={20} color="#fff" style={{ marginRight: spacing.sm }} />}
        <Text style={S.ctaText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  gradient: { flex: 1 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.text.primary, fontSize: typography.fontSize.lg, fontWeight: '600', marginTop: spacing.lg },
  errorTitle: { color: colors.text.primary, fontSize: typography.fontSize.xl, fontWeight: '700', marginTop: spacing.md },
  errorMsg: { color: colors.text.secondary, fontSize: typography.fontSize.base, textAlign: 'center', marginTop: spacing.sm },
  retryBtn: { backgroundColor: colors.primary.DEFAULT, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.xl },
  retryText: { color: '#fff', fontWeight: '700' },
  linkText: { color: colors.text.secondary, fontSize: typography.fontSize.base },

  // Header
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  headerLabel: { color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  progressBar: { flexDirection: 'row', gap: 3 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressSegActive: { backgroundColor: colors.primary.DEFAULT },
  progressSegCurrent: { backgroundColor: colors.primary.light },

  // Step container
  stepContainer: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xl * 3 },

  // Typography
  overline: { color: colors.primary.DEFAULT, fontSize: typography.fontSize.xs, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.sm },
  title: { color: colors.text.primary, fontSize: 26, fontWeight: '800', marginBottom: spacing.sm },
  body: { color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 24, marginBottom: spacing.lg },

  // Cards
  card: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardLabel: { color: colors.primary.light, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm },
  cardText: { color: colors.text.primary, fontSize: typography.fontSize.base, lineHeight: 22 },
  cardSub: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs, fontStyle: 'italic' },

  // Phrases
  phraseRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  phraseText: { color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: '500', flex: 1 },
  phraseTrans: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginLeft: spacing.md },

  // CTA
  cta: { borderRadius: borderRadius.lg, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: typography.fontSize.base, fontWeight: '700' },

  // Vocabulary overview grid
  vocabGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.lg },
  vocabChip: { backgroundColor: colors.background.card, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', minWidth: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2 - 1 },
  vocabChipRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  vocabChipWord: { color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: '600' },
  vocabChipTrans: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs },
  vocabChipPhonetic: { color: colors.primary.light, fontSize: typography.fontSize.xs, marginTop: 2 },

  // Vocabulary review
  vocabReviewContainer: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  vocabProgress: { color: colors.text.secondary, fontSize: typography.fontSize.sm, textAlign: 'center', marginBottom: spacing.lg },
  vocabCard: { backgroundColor: colors.background.card, borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', minHeight: 200, justifyContent: 'center' },
  vocabWord: { color: colors.text.primary, fontSize: 36, fontWeight: '800' },
  vocabPhonetic: { color: colors.primary.light, fontSize: typography.fontSize.base, marginTop: spacing.xs },
  vocabAudioBtn: { backgroundColor: colors.primary.DEFAULT, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  vocabReveal: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  vocabRevealHint: { color: colors.text.tertiary, fontSize: typography.fontSize.sm, fontStyle: 'italic' },
  vocabTranslation: { color: colors.secondary.DEFAULT, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  vocabExample: { color: colors.text.secondary, fontSize: typography.fontSize.sm, textAlign: 'center', marginTop: spacing.sm, fontStyle: 'italic' },
  vocabActions: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.sm },
  btnPractice: { flex: 1, borderRadius: borderRadius.lg, overflow: 'hidden' },
  btnKnow: { flex: 1, borderRadius: borderRadius.lg, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: spacing.sm },
  btnLabel: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: '700' },

  // Listening
  listenBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  listenBadgeText: { color: colors.primary.light, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  spotlightChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  spotlightChip: { backgroundColor: 'rgba(99,102,241,0.12)', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.md },
  spotlightChipText: { color: colors.primary.light, fontSize: typography.fontSize.sm, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chipUsed: { backgroundColor: 'rgba(16,185,129,0.15)' },
  chipUsedText: { color: colors.success.DEFAULT },

  // Listening play state
  listeningPlayContainer: { flex: 1, padding: spacing.lg },
  waveContainer: { alignItems: 'center', paddingVertical: spacing.xl },
  waveBarRow: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 48 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: colors.secondary.DEFAULT },
  speakingIndicator: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.md },
  linesScroll: { flex: 1, marginVertical: spacing.md },
  lineContainer: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.xs },
  lineActive: { backgroundColor: 'rgba(99,102,241,0.08)' },
  lineFuture: { opacity: 0.4 },
  lineSpeaker: { color: colors.text.tertiary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  lineSpeakerActive: { color: colors.primary.light },
  lineText: { color: colors.text.primary, fontSize: typography.fontSize.base, lineHeight: 22 },
  lineTextActive: { fontWeight: '600' },
  lineTextFuture: { color: colors.text.tertiary },
  skipBtn: { alignSelf: 'center', paddingVertical: spacing.md },
  skipText: { color: colors.text.secondary, fontSize: typography.fontSize.sm },

  // Daily tip
  dailyTip: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.xl },
  dailyTipText: { color: colors.text.secondary, fontSize: typography.fontSize.sm, flex: 1, lineHeight: 20 },

  // Questions (shared)
  questionContainer: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  questionProgress: { color: colors.text.secondary, fontSize: typography.fontSize.sm, textAlign: 'center', marginBottom: spacing.lg },
  questionText: { color: colors.text.primary, fontSize: typography.fontSize.lg, fontWeight: '700', marginBottom: spacing.xl, lineHeight: 28 },
  questionOptions: { gap: spacing.md },
  questionOption: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  questionCorrect: { borderColor: colors.success.DEFAULT, backgroundColor: 'rgba(16,185,129,0.08)' },
  questionWrong: { borderColor: colors.error.DEFAULT, backgroundColor: 'rgba(239,68,68,0.08)' },
  questionOptionText: { color: colors.text.primary, fontSize: typography.fontSize.base },

  // Objectives
  objectiveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  objectiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary.DEFAULT, marginRight: spacing.sm },
  objectiveText: { color: colors.text.secondary, fontSize: typography.fontSize.sm, flex: 1 },

  // Reading
  readingPassage: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  passageText: { color: colors.text.primary, fontSize: typography.fontSize.base, lineHeight: 26 },
  tappableWord: { backgroundColor: 'rgba(99,102,241,0.1)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)' },
  tappableWordDone: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' },
  tappableText: { color: colors.primary.light, fontSize: typography.fontSize.sm, fontWeight: '600' },
  tappableTextDone: { color: colors.success.DEFAULT },
  tappableTrans: { color: colors.success.DEFAULT, fontSize: typography.fontSize.xs, marginTop: 2 },

  // Writing
  editorContainer: { marginBottom: spacing.lg },
  editor: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, minHeight: 180, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', color: colors.text.primary, fontSize: typography.fontSize.base, lineHeight: 24 },
  wordCounter: { color: colors.text.tertiary, fontSize: typography.fontSize.xs, textAlign: 'right', marginTop: spacing.xs },

  // Summary
  summaryScore: { alignItems: 'center', marginBottom: spacing.lg },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: colors.primary.DEFAULT, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { color: colors.text.primary, fontSize: 40, fontWeight: '800' },
  scoreLabel: { color: colors.text.secondary, fontSize: typography.fontSize.xs, fontWeight: '600', letterSpacing: 1 },
  summaryTime: { color: colors.text.secondary, fontSize: typography.fontSize.base, marginTop: spacing.sm },
  summaryBreakdown: { marginBottom: spacing.lg },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  metricLabel: { color: colors.text.secondary, fontSize: typography.fontSize.sm, width: 100 },
  metricBarBg: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, marginHorizontal: spacing.sm, overflow: 'hidden' },
  metricBarFill: { height: '100%', borderRadius: 4 },
  metricValue: { color: colors.text.primary, fontSize: typography.fontSize.sm, fontWeight: '600', width: 50, textAlign: 'right' },
  fsrsNote: { color: colors.text.tertiary, fontSize: typography.fontSize.sm, textAlign: 'center', marginBottom: spacing.md, fontStyle: 'italic' },
});
