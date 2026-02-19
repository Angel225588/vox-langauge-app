/**
 * Stair Session Flow Screen
 *
 * The core learning experience: one scenario, four skills.
 * Briefing → Vocabulary → Conversation → Reading → Writing → Summary
 *
 * Each stair IS a real-world scenario. Users don't just learn words —
 * they prepare for, practice, read about, and write about a situation
 * they'll actually face.
 *
 * Hybrid vocabulary: DB base + AI-created words for communication needs.
 * No CEFR gatekeeping — learn what you need to express your intentions.
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
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
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, neomorphism } from '@/constants/designSystem';
import { useStairSession } from '@/hooks/useStairSession';
import { useAuth } from '@/hooks/useAuth';
import { BackButton } from '@/components/ui/BackButton';
import type {
  SessionStep,
  SessionVocabItem,
  VocabularyStepResult,
  ReadingStepResult,
  WritingStepResult,
  ConversationStepResult,
} from '@/types/stairSession';
import { STEP_INFO } from '@/types/stairSession';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  // Load content on mount
  useEffect(() => {
    if (id && userId) {
      session.startSession();
    }
  }, [id, userId]);

  // Handle exit
  const handleExit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }, [router]);

  // Handle step completion and advance
  const handleStepComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    session.nextStep();
  }, [session]);

  // Loading state
  if (session.state.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Animated.Text
              entering={FadeIn.delay(300)}
              style={styles.loadingText}
            >
              Preparing your session...
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(600)}
              style={styles.loadingSubtext}
            >
              Loading vocabulary and scenario
            </Animated.Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error state
  if (session.state.error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={styles.gradient}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>!</Text>
            <Text style={styles.errorTitle}>Unable to load session</Text>
            <Text style={styles.errorMessage}>{session.state.error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => session.startSession()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
              <Text style={styles.exitText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // No content yet (no userId / auth)
  if (!session.content) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Sign in to start your session</Text>
            <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
              <Text style={styles.exitText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        {/* Header: progress + exit */}
        <SessionHeader
          currentStep={session.currentStep}
          progress={session.progress}
          onExit={handleExit}
          onBack={session.previousStep}
          stepIndex={session.state.stepIndex}
        />

        {/* Step Content */}
        <Animated.View
          key={session.currentStep}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(200)}
          style={styles.stepContainer}
        >
          {session.currentStep === 'briefing' && (
            <BriefingStep
              scenario={session.content.scenario}
              vocabularyCount={session.content.vocabulary.length}
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

          {session.currentStep === 'conversation' && (
            <ConversationStep
              scenario={session.content.scenario}
              vocabulary={session.content.vocabulary}
              onComplete={(result) => {
                session.submitConversationResult(result);
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
// SESSION HEADER
// ============================================================================

function SessionHeader({
  currentStep,
  progress,
  onExit,
  onBack,
  stepIndex,
}: {
  currentStep: SessionStep;
  progress: number;
  onExit: () => void;
  onBack: () => void;
  stepIndex: number;
}) {
  const stepInfo = STEP_INFO.find((s) => s.step === currentStep);

  return (
    <View style={styles.header}>
      {/* Top row: back + step label + close */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={stepIndex > 0 ? onBack : onExit}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.headerBackIcon}>
            {stepIndex > 0 ? '\u2039' : '\u00D7'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerStepLabel}>
          {stepInfo?.label || currentStep}
        </Text>

        <TouchableOpacity
          onPress={onExit}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.headerCloseIcon}>{'\u00D7'}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        {STEP_INFO.map((info, i) => (
          <View
            key={info.step}
            style={[
              styles.progressSegment,
              i <= stepIndex && styles.progressSegmentActive,
              i === stepIndex && styles.progressSegmentCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// STEP 1: MISSION BRIEFING
// ============================================================================

function BriefingStep({
  scenario,
  vocabularyCount,
  onContinue,
}: {
  scenario: NonNullable<ReturnType<typeof useStairSession>['content']>['scenario'];
  vocabularyCount: number;
  onContinue: () => void;
}) {
  return (
    <ScrollView
      style={styles.stepScroll}
      contentContainerStyle={styles.stepScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Scenario Title */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.briefingHeader}>
        <Text style={styles.briefingOverline}>YOUR MISSION</Text>
        <Text style={styles.briefingTitle}>{scenario.title}</Text>
        <Text style={styles.briefingDescription}>{scenario.description}</Text>
      </Animated.View>

      {/* Context Card */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.briefingCard}>
        <Text style={styles.briefingCardLabel}>THE SITUATION</Text>
        <Text style={styles.briefingCardText}>{scenario.context}</Text>
      </Animated.View>

      {/* AI Persona */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.briefingCard}>
        <Text style={styles.briefingCardLabel}>WHO YOU'LL TALK TO</Text>
        <Text style={styles.briefingCardText}>{scenario.ai_persona.role}</Text>
        <Text style={styles.briefingCardSubtext}>
          {scenario.ai_persona.speaking_style}
        </Text>
      </Animated.View>

      {/* Key Phrases Preview */}
      {scenario.key_phrases.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.briefingCard}>
          <Text style={styles.briefingCardLabel}>KEY PHRASES</Text>
          {scenario.key_phrases.slice(0, 4).map((kp, i) => (
            <View key={i} style={styles.keyPhraseRow}>
              <Text style={styles.keyPhraseText}>{kp.phrase}</Text>
              {kp.translation ? (
                <Text style={styles.keyPhraseTranslation}>{kp.translation}</Text>
              ) : null}
            </View>
          ))}
        </Animated.View>
      )}

      {/* Session Overview */}
      <Animated.View entering={FadeInDown.delay(500)} style={styles.sessionOverview}>
        <OverviewItem label="Vocabulary" value={`${vocabularyCount} words`} />
        <OverviewItem label="Conversation" value="AI voice call" />
        <OverviewItem label="Reading" value="1 passage" />
        <OverviewItem label="Writing" value="1 task" />
      </Animated.View>

      {/* Start Button */}
      <Animated.View entering={FadeInUp.delay(600)}>
        <TouchableOpacity onPress={onContinue} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Start Learning</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.overviewItem}>
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
    </View>
  );
}

// ============================================================================
// STEP 2: VOCABULARY PREVIEW
// ============================================================================

function VocabularyStep({
  vocabulary,
  onComplete,
  onAddWord,
}: {
  vocabulary: SessionVocabItem[];
  onComplete: (result: VocabularyStepResult) => void;
  onAddWord: (word: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const startTime = useRef(Date.now());

  const currentWord = vocabulary[currentIndex];
  const isLast = currentIndex >= vocabulary.length - 1;

  const handleKnow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setKnownCount((c) => c + 1);
    advance();
  };

  const handlePractice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPracticeCount((c) => c + 1);
    onAddWord(currentWord.word);
    advance();
  };

  const advance = () => {
    setShowTranslation(false);
    if (isLast) {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      onComplete({
        words_reviewed: vocabulary.length,
        words_known: knownCount + (isLast ? 1 : 0),
        words_to_practice: practiceCount,
        time_seconds: timeSpent,
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (!currentWord) return null;

  return (
    <View style={styles.vocabContainer}>
      {/* Progress indicator */}
      <Text style={styles.vocabProgress}>
        {currentIndex + 1} / {vocabulary.length}
      </Text>

      {/* Word Card */}
      <View style={styles.vocabCard}>
        <Text style={styles.vocabWord}>{currentWord.word}</Text>

        {currentWord.pronunciation && (
          <Text style={styles.vocabPronunciation}>{currentWord.pronunciation}</Text>
        )}

        {/* Tap to reveal */}
        <TouchableOpacity
          onPress={() => {
            setShowTranslation(!showTranslation);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={styles.vocabRevealButton}
        >
          {showTranslation ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Text style={styles.vocabTranslation}>{currentWord.translation}</Text>
              {currentWord.example_sentence && (
                <Text style={styles.vocabExample}>{currentWord.example_sentence}</Text>
              )}
              {currentWord.example_translation && (
                <Text style={styles.vocabExampleTranslation}>
                  {currentWord.example_translation}
                </Text>
              )}
            </Animated.View>
          ) : (
            <Text style={styles.vocabRevealText}>Tap to reveal translation</Text>
          )}
        </TouchableOpacity>

        {/* Source badge */}
        <View style={styles.vocabSourceBadge}>
          <Text style={styles.vocabSourceText}>
            {currentWord.source === 'ai_generated' ? 'AI' : 'Library'}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.vocabActions}>
        <TouchableOpacity onPress={handlePractice} style={styles.vocabAgainButton}>
          <Text style={styles.vocabAgainText}>Practice</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleKnow} style={styles.vocabKnowButton}>
          <LinearGradient
            colors={colors.gradients.success}
            style={styles.vocabKnowGradient}
          >
            <Text style={styles.vocabKnowText}>I know this</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// STEP 3: CONVERSATION (placeholder — uses existing VoiceCallScreen)
// ============================================================================

function ConversationStep({
  scenario,
  vocabulary,
  onComplete,
}: {
  scenario: NonNullable<ReturnType<typeof useStairSession>['content']>['scenario'];
  vocabulary: SessionVocabItem[];
  onComplete: (result: ConversationStepResult) => void;
}) {
  const startTime = useRef(Date.now());

  // TODO: Integrate with VoiceCallScreenElevenLabs component
  // For now, show a placeholder that simulates the conversation step
  const handleFinishCall = () => {
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    onComplete({
      messages_sent: 0,
      duration_seconds: duration,
      words_used_correctly: [],
      new_words_encountered: [],
      fluency_score: 70,
    });
  };

  return (
    <View style={styles.conversationContainer}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.conversationHeader}>
        <Text style={styles.conversationTitle}>AI Conversation</Text>
        <Text style={styles.conversationSubtitle}>{scenario.title}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.conversationCard}>
        <Text style={styles.conversationPersona}>
          {scenario.ai_persona.role}
        </Text>
        <Text style={styles.conversationContext}>
          {scenario.context}
        </Text>
      </Animated.View>

      {/* Objectives */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.conversationObjectives}>
        <Text style={styles.objectivesTitle}>Objectives</Text>
        {scenario.objectives.map((obj, i) => (
          <View key={i} style={styles.objectiveRow}>
            <View style={styles.objectiveDot} />
            <Text style={styles.objectiveText}>{obj}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Key vocab reminder */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.vocabReminder}>
        <Text style={styles.vocabReminderTitle}>Key vocabulary to use:</Text>
        <View style={styles.vocabChips}>
          {vocabulary.slice(0, 6).map((v, i) => (
            <View key={i} style={styles.vocabChip}>
              <Text style={styles.vocabChipText}>{v.word}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Start/End call button */}
      <View style={styles.conversationActions}>
        <TouchableOpacity onPress={handleFinishCall} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              Continue to Reading
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.conversationNote}>
          Voice calls will be available with ElevenLabs integration
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// STEP 4: READING
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
  const [currentQuestion, setCurrentQuestion] = useState(-1); // -1 = reading phase
  const [correctCount, setCorrectCount] = useState(0);
  const [tappedWords, setTappedWords] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  const handleWordTap = (word: string) => {
    if (!tappedWords.includes(word)) {
      setTappedWords((prev) => [...prev, word]);
      onAddWord(word);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleStartQuestions = () => {
    setCurrentQuestion(0);
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isCorrect = index === reading.questions[currentQuestion]?.correct_index;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }

    // Auto advance after brief delay
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestion >= reading.questions.length - 1) {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        const score = Math.round(
          ((correctCount + (isCorrect ? 1 : 0)) / reading.questions.length) * 100
        );
        onComplete({
          questions_total: reading.questions.length,
          questions_correct: correctCount + (isCorrect ? 1 : 0),
          words_tapped: tappedWords.length,
          time_seconds: timeSpent,
          comprehension_score: score,
        });
      } else {
        setCurrentQuestion((q) => q + 1);
      }
    }, 1200);
  };

  // Reading phase
  if (currentQuestion === -1) {
    return (
      <ScrollView
        style={styles.stepScroll}
        contentContainerStyle={styles.stepScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.readingTitle}>{reading.title}</Text>
        <Text style={styles.readingHint}>
          Tap highlighted words to see their translation
        </Text>

        <View style={styles.readingPassageCard}>
          <Text style={styles.readingPassage}>{reading.passage}</Text>
        </View>

        {/* Tappable words */}
        {reading.tappable_words.length > 0 && (
          <View style={styles.tappableSection}>
            <Text style={styles.tappableSectionTitle}>Vocabulary in this passage</Text>
            <View style={styles.tappableWords}>
              {reading.tappable_words.map((tw, i) => {
                const isTapped = tappedWords.includes(tw.word);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleWordTap(tw.word)}
                    style={[
                      styles.tappableWord,
                      isTapped && styles.tappableWordTapped,
                    ]}
                  >
                    <Text style={styles.tappableWordText}>{tw.word}</Text>
                    {isTapped && (
                      <Text style={styles.tappableWordTranslation}>
                        {tw.translation}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity onPress={handleStartQuestions} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              Answer Questions ({reading.questions.length})
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Questions phase
  const question = reading.questions[currentQuestion];
  if (!question) return null;

  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionProgress}>
        Question {currentQuestion + 1} of {reading.questions.length}
      </Text>

      <Text style={styles.questionText}>{question.question}</Text>

      <View style={styles.questionOptions}>
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = i === question.correct_index;
          const showResult = selectedAnswer !== null;

          return (
            <TouchableOpacity
              key={i}
              onPress={() => selectedAnswer === null && handleAnswer(i)}
              style={[
                styles.questionOption,
                showResult && isCorrect && styles.questionOptionCorrect,
                showResult && isSelected && !isCorrect && styles.questionOptionWrong,
              ]}
              disabled={selectedAnswer !== null}
            >
              <Text
                style={[
                  styles.questionOptionText,
                  showResult && isCorrect && styles.questionOptionTextCorrect,
                  showResult && isSelected && !isCorrect && styles.questionOptionTextWrong,
                ]}
              >
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
// STEP 5: WRITING
// ============================================================================

function WritingStep({
  writing,
  onComplete,
}: {
  writing: NonNullable<ReturnType<typeof useStairSession>['content']>['writing'];
  onComplete: (result: WritingStepResult) => void;
}) {
  const [text, setText] = useState(writing.starter || '');
  const startTime = useRef(Date.now());

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const vocabUsed = writing.key_vocabulary.filter((v) =>
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
    <ScrollView
      style={styles.stepScroll}
      contentContainerStyle={styles.stepScrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.writingTitle}>Writing Practice</Text>
      <Text style={styles.writingInstruction}>{writing.instruction}</Text>

      {/* Key vocab to use */}
      <View style={styles.writingVocabSection}>
        <Text style={styles.writingVocabLabel}>
          Use these words ({vocabUsed}/{writing.key_vocabulary.length}):
        </Text>
        <View style={styles.vocabChips}>
          {writing.key_vocabulary.map((word, i) => {
            const isUsed = text.toLowerCase().includes(word.toLowerCase());
            return (
              <View
                key={i}
                style={[styles.vocabChip, isUsed && styles.vocabChipUsed]}
              >
                <Text
                  style={[
                    styles.vocabChipText,
                    isUsed && styles.vocabChipTextUsed,
                  ]}
                >
                  {word}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Text input area */}
      <View style={styles.writingEditorContainer}>
        {/* Using Text component as a simple editor placeholder */}
        {/* TODO: Replace with WritingEditor component for full experience */}
        <View style={styles.writingEditor}>
          <Text style={styles.writingPlaceholder}>
            {text || 'Start writing here...'}
          </Text>
        </View>
        <Text style={styles.writingWordCount}>
          {wordCount} / {writing.target_length} words
        </Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={wordCount < 5}
      >
        <LinearGradient
          colors={wordCount >= 5 ? colors.gradients.primary : colors.gradients.dark}
          style={[styles.primaryButton, wordCount < 5 && styles.buttonDisabled]}
        >
          <Text style={styles.primaryButtonText}>Submit Writing</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ============================================================================
// STEP 6: SESSION SUMMARY
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Calculating results...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.stepScroll}
      contentContainerStyle={styles.stepScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Score circle */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.summaryScoreSection}>
        <View style={styles.summaryScoreCircle}>
          <Text style={styles.summaryScoreValue}>{summary.overall_score}</Text>
          <Text style={styles.summaryScoreLabel}>Overall</Text>
        </View>
      </Animated.View>

      {/* Time */}
      <Animated.View entering={FadeInDown.delay(200)}>
        <Text style={styles.summaryTime}>
          {Math.floor(summary.total_time_seconds / 60)}m {summary.total_time_seconds % 60}s
        </Text>
      </Animated.View>

      {/* Breakdown */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.summaryBreakdown}>
        <SummaryMetric label="Vocabulary" value={`${summary.vocab_reviewed} reviewed`} score={summary.steps.vocabulary ? Math.round((summary.steps.vocabulary.words_known / Math.max(summary.steps.vocabulary.words_reviewed, 1)) * 100) : 0} />
        <SummaryMetric label="Conversation" value={`${summary.conversation_score}%`} score={summary.conversation_score} />
        <SummaryMetric label="Reading" value={`${summary.reading_score}%`} score={summary.reading_score} />
        <SummaryMetric label="Writing" value={`${summary.writing_score}%`} score={summary.writing_score} />
      </Animated.View>

      {/* Words added */}
      {wordsAdded.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.summaryWordsAdded}>
          <Text style={styles.summaryWordsTitle}>
            {wordsAdded.length} words added to your vocabulary
          </Text>
          <View style={styles.vocabChips}>
            {wordsAdded.map((word, i) => (
              <View key={i} style={[styles.vocabChip, styles.vocabChipUsed]}>
                <Text style={[styles.vocabChipText, styles.vocabChipTextUsed]}>
                  {word}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* FSRS info */}
      <Animated.View entering={FadeInDown.delay(500)}>
        <Text style={styles.summaryFsrsNote}>
          {summary.fsrs_updates.length} vocabulary cards scheduled for review
        </Text>
      </Animated.View>

      {/* Finish button */}
      <Animated.View entering={FadeInUp.delay(600)}>
        <TouchableOpacity onPress={onFinish} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradients.success}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Complete Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

function SummaryMetric({
  label,
  value,
  score,
}: {
  label: string;
  value: string;
  score: number;
}) {
  const barColor =
    score >= 80 ? colors.success.DEFAULT :
    score >= 50 ? colors.warning.DEFAULT :
    colors.error.DEFAULT;

  return (
    <View style={styles.summaryMetricRow}>
      <Text style={styles.summaryMetricLabel}>{label}</Text>
      <View style={styles.summaryMetricBar}>
        <View
          style={[
            styles.summaryMetricBarFill,
            { width: `${Math.max(score, 5)}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <Text style={styles.summaryMetricValue}>{value}</Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  gradient: { flex: 1 },

  // Loading / Error
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.text.primary, fontSize: typography.fontSize.lg, fontWeight: '600', marginTop: spacing.lg },
  loadingSubtext: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.sm },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorIcon: { color: colors.error.DEFAULT, fontSize: 48, fontWeight: 'bold', marginBottom: spacing.md },
  errorTitle: { color: colors.text.primary, fontSize: typography.fontSize.xl, fontWeight: '700', marginBottom: spacing.sm },
  errorMessage: { color: colors.text.secondary, fontSize: typography.fontSize.base, textAlign: 'center', marginBottom: spacing.xl },
  retryButton: { backgroundColor: colors.primary.DEFAULT, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  retryText: { color: '#fff', fontWeight: '700', fontSize: typography.fontSize.base },
  exitButton: { paddingVertical: spacing.md },
  exitText: { color: colors.text.secondary, fontSize: typography.fontSize.base },

  // Header
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  headerBackIcon: { color: colors.text.primary, fontSize: 28, fontWeight: '300', width: 32, textAlign: 'center' },
  headerStepLabel: { color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  headerCloseIcon: { color: colors.text.secondary, fontSize: 24, width: 32, textAlign: 'center' },
  progressBarContainer: { flexDirection: 'row', gap: 4 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressSegmentActive: { backgroundColor: colors.primary.DEFAULT },
  progressSegmentCurrent: { backgroundColor: colors.primary.light },

  // Step container
  stepContainer: { flex: 1 },
  stepScroll: { flex: 1 },
  stepScrollContent: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },

  // Briefing
  briefingHeader: { marginBottom: spacing.xl },
  briefingOverline: { color: colors.primary.DEFAULT, fontSize: typography.fontSize.xs, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.sm },
  briefingTitle: { color: colors.text.primary, fontSize: 28, fontWeight: '800', marginBottom: spacing.sm },
  briefingDescription: { color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 24 },
  briefingCard: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  briefingCardLabel: { color: colors.primary.light, fontSize: typography.fontSize.xs, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm },
  briefingCardText: { color: colors.text.primary, fontSize: typography.fontSize.base, lineHeight: 22 },
  briefingCardSubtext: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs, fontStyle: 'italic' },
  keyPhraseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  keyPhraseText: { color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: '500', flex: 1 },
  keyPhraseTranslation: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginLeft: spacing.md },
  sessionOverview: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xl, gap: spacing.sm },
  overviewItem: { flex: 1, minWidth: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2, backgroundColor: colors.background.card, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  overviewLabel: { color: colors.text.secondary, fontSize: typography.fontSize.xs, fontWeight: '600', marginBottom: spacing.xs },
  overviewValue: { color: colors.text.primary, fontSize: typography.fontSize.sm, fontWeight: '600' },

  // Primary button
  primaryButton: { borderRadius: borderRadius.lg, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.md },
  primaryButtonText: { color: '#fff', fontSize: typography.fontSize.base, fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },

  // Vocabulary step
  vocabContainer: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  vocabProgress: { color: colors.text.secondary, fontSize: typography.fontSize.sm, textAlign: 'center', marginBottom: spacing.lg },
  vocabCard: { backgroundColor: colors.background.card, borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', minHeight: 240, justifyContent: 'center' },
  vocabWord: { color: colors.text.primary, fontSize: 36, fontWeight: '800', marginBottom: spacing.sm },
  vocabPronunciation: { color: colors.primary.light, fontSize: typography.fontSize.base, marginBottom: spacing.lg },
  vocabRevealButton: { alignItems: 'center', paddingVertical: spacing.md },
  vocabRevealText: { color: colors.text.secondary, fontSize: typography.fontSize.sm, fontStyle: 'italic' },
  vocabTranslation: { color: colors.secondary.DEFAULT, fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  vocabExample: { color: colors.text.primary, fontSize: typography.fontSize.base, textAlign: 'center', fontStyle: 'italic', marginTop: spacing.sm },
  vocabExampleTranslation: { color: colors.text.secondary, fontSize: typography.fontSize.sm, textAlign: 'center', marginTop: spacing.xs },
  vocabSourceBadge: { position: 'absolute', top: spacing.md, right: spacing.md, backgroundColor: 'rgba(0,54,255,0.15)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  vocabSourceText: { color: colors.primary.light, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  vocabActions: { flexDirection: 'row', gap: spacing.md },
  vocabAgainButton: { flex: 1, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: colors.error.DEFAULT, paddingVertical: spacing.md, alignItems: 'center' },
  vocabAgainText: { color: colors.error.DEFAULT, fontSize: typography.fontSize.base, fontWeight: '700' },
  vocabKnowButton: { flex: 1 },
  vocabKnowGradient: { borderRadius: borderRadius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  vocabKnowText: { color: '#fff', fontSize: typography.fontSize.base, fontWeight: '700' },

  // Conversation
  conversationContainer: { flex: 1, padding: spacing.lg },
  conversationHeader: { marginBottom: spacing.lg },
  conversationTitle: { color: colors.text.primary, fontSize: 24, fontWeight: '800' },
  conversationSubtitle: { color: colors.text.secondary, fontSize: typography.fontSize.base, marginTop: spacing.xs },
  conversationCard: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  conversationPersona: { color: colors.primary.light, fontSize: typography.fontSize.base, fontWeight: '600', marginBottom: spacing.sm },
  conversationContext: { color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 22 },
  conversationObjectives: { marginBottom: spacing.lg },
  objectivesTitle: { color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: '700', marginBottom: spacing.sm },
  objectiveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  objectiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary.DEFAULT, marginRight: spacing.sm },
  objectiveText: { color: colors.text.secondary, fontSize: typography.fontSize.sm, flex: 1 },
  vocabReminder: { marginBottom: spacing.lg },
  vocabReminderTitle: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.sm },
  vocabChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  vocabChip: { backgroundColor: 'rgba(0,54,255,0.12)', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  vocabChipText: { color: colors.primary.light, fontSize: typography.fontSize.xs, fontWeight: '600' },
  vocabChipUsed: { backgroundColor: 'rgba(16,185,129,0.15)' },
  vocabChipTextUsed: { color: colors.success.DEFAULT },
  conversationActions: { marginTop: 'auto', paddingBottom: spacing.lg },
  conversationNote: { color: colors.text.secondary, fontSize: typography.fontSize.xs, textAlign: 'center', marginTop: spacing.sm, fontStyle: 'italic' },

  // Reading
  readingTitle: { color: colors.text.primary, fontSize: 22, fontWeight: '800', marginBottom: spacing.xs },
  readingHint: { color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.lg, fontStyle: 'italic' },
  readingPassageCard: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  readingPassage: { color: colors.text.primary, fontSize: typography.fontSize.base, lineHeight: 26 },
  tappableSection: { marginBottom: spacing.lg },
  tappableSectionTitle: { color: colors.text.secondary, fontSize: typography.fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  tappableWords: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tappableWord: { backgroundColor: 'rgba(0,54,255,0.1)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: 'rgba(0,54,255,0.2)' },
  tappableWordTapped: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' },
  tappableWordText: { color: colors.primary.light, fontSize: typography.fontSize.sm, fontWeight: '600' },
  tappableWordTranslation: { color: colors.success.DEFAULT, fontSize: typography.fontSize.xs, marginTop: 2 },

  // Questions
  questionContainer: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  questionProgress: { color: colors.text.secondary, fontSize: typography.fontSize.sm, textAlign: 'center', marginBottom: spacing.lg },
  questionText: { color: colors.text.primary, fontSize: typography.fontSize.lg, fontWeight: '700', marginBottom: spacing.xl, lineHeight: 28 },
  questionOptions: { gap: spacing.md },
  questionOption: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  questionOptionCorrect: { borderColor: colors.success.DEFAULT, backgroundColor: 'rgba(16,185,129,0.08)' },
  questionOptionWrong: { borderColor: colors.error.DEFAULT, backgroundColor: 'rgba(239,68,68,0.08)' },
  questionOptionText: { color: colors.text.primary, fontSize: typography.fontSize.base },
  questionOptionTextCorrect: { color: colors.success.DEFAULT, fontWeight: '600' },
  questionOptionTextWrong: { color: colors.error.DEFAULT },

  // Writing
  writingTitle: { color: colors.text.primary, fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
  writingInstruction: { color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 24, marginBottom: spacing.lg },
  writingVocabSection: { marginBottom: spacing.lg },
  writingVocabLabel: { color: colors.text.secondary, fontSize: typography.fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  writingEditorContainer: { marginBottom: spacing.lg },
  writingEditor: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, minHeight: 160, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  writingPlaceholder: { color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 24 },
  writingWordCount: { color: colors.text.secondary, fontSize: typography.fontSize.xs, textAlign: 'right', marginTop: spacing.xs },

  // Summary
  summaryScoreSection: { alignItems: 'center', marginBottom: spacing.lg },
  summaryScoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: colors.primary.DEFAULT, alignItems: 'center', justifyContent: 'center' },
  summaryScoreValue: { color: colors.text.primary, fontSize: 40, fontWeight: '800' },
  summaryScoreLabel: { color: colors.text.secondary, fontSize: typography.fontSize.xs, fontWeight: '600', letterSpacing: 1, marginTop: -2 },
  summaryTime: { color: colors.text.secondary, fontSize: typography.fontSize.base, textAlign: 'center', marginBottom: spacing.xl },
  summaryBreakdown: { marginBottom: spacing.xl },
  summaryMetricRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  summaryMetricLabel: { color: colors.text.secondary, fontSize: typography.fontSize.sm, width: 100 },
  summaryMetricBar: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, marginHorizontal: spacing.sm, overflow: 'hidden' },
  summaryMetricBarFill: { height: '100%', borderRadius: 4 },
  summaryMetricValue: { color: colors.text.primary, fontSize: typography.fontSize.sm, fontWeight: '600', width: 80, textAlign: 'right' },
  summaryWordsAdded: { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  summaryWordsTitle: { color: colors.success.DEFAULT, fontSize: typography.fontSize.base, fontWeight: '700', marginBottom: spacing.sm },
  summaryFsrsNote: { color: colors.text.secondary, fontSize: typography.fontSize.sm, textAlign: 'center', marginBottom: spacing.xl, fontStyle: 'italic' },
});
