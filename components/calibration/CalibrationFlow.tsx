/**
 * CalibrationFlow
 *
 * Main orchestrator for the level calibration experience.
 * Manages the flow: Level Selection → Probes → Analysis → Results
 * Points for completion, not accuracy - all analysis is for AI use.
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, spacing, typography } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';

// Components
import { DeclaredLevelPicker } from './DeclaredLevelPicker';
import { ResultsCard } from './ResultsCard';
import { VocabProbe } from './probes/VocabProbe';
import { ListeningProbe } from './probes/ListeningProbe';
import { SpeakingProbe } from './probes/SpeakingProbe';
import { WritingProbe } from './probes/WritingProbe';

// Hooks and types
import { useCalibration } from './hooks/useCalibration';
import type {
  CalibrationFlowProps,
  ProbeType,
  ProbeResponse,
  VocabProbeItem,
  ListeningProbeItem,
  SpeakingProbeItem,
  WritingProbeItem,
  CEFRLevel,
  DeclaredLevel,
} from '@/types/calibration';
import { DECLARED_TO_CEFR_RANGE } from '@/types/calibration';

// Sample probe data - In production, this would come from API based on declared level
const getSampleVocabItems = (level: DeclaredLevel): VocabProbeItem[] => {
  const range = DECLARED_TO_CEFR_RANGE[level];
  const items: Record<CEFRLevel, VocabProbeItem[]> = {
    A0: [],
    A1: [
      { id: 'v1', word: 'Hello', translation: 'Hola', phonetic: '/həˈloʊ/', difficulty: 'A1', category: 'Greetings', partOfSpeech: 'interjection' },
      { id: 'v2', word: 'Water', translation: 'Agua', phonetic: '/ˈwɔːtər/', difficulty: 'A1', category: 'Basic Nouns', partOfSpeech: 'noun' },
      { id: 'v3', word: 'Good', translation: 'Bueno', phonetic: '/ɡʊd/', difficulty: 'A1', category: 'Adjectives', partOfSpeech: 'adjective' },
    ],
    A2: [
      { id: 'v4', word: 'Weather', translation: 'Clima', phonetic: '/ˈweðər/', difficulty: 'A2', category: 'Nature', partOfSpeech: 'noun' },
      { id: 'v5', word: 'Understand', translation: 'Entender', phonetic: '/ˌʌndərˈstænd/', difficulty: 'A2', category: 'Verbs', partOfSpeech: 'verb' },
      { id: 'v6', word: 'Excited', translation: 'Emocionado', phonetic: '/ɪkˈsaɪtɪd/', difficulty: 'A2', category: 'Emotions', partOfSpeech: 'adjective' },
    ],
    B1: [
      { id: 'v7', word: 'Opportunity', translation: 'Oportunidad', phonetic: '/ˌɑːpərˈtuːnəti/', difficulty: 'B1', category: 'Abstract', partOfSpeech: 'noun' },
      { id: 'v8', word: 'Improve', translation: 'Mejorar', phonetic: '/ɪmˈpruːv/', difficulty: 'B1', category: 'Verbs', partOfSpeech: 'verb' },
      { id: 'v9', word: 'Significant', translation: 'Significativo', phonetic: '/sɪɡˈnɪfɪkənt/', difficulty: 'B1', category: 'Adjectives', partOfSpeech: 'adjective' },
    ],
    B2: [
      { id: 'v10', word: 'Accomplish', translation: 'Lograr', phonetic: '/əˈkɑːmplɪʃ/', difficulty: 'B2', category: 'Verbs', partOfSpeech: 'verb' },
      { id: 'v11', word: 'Inevitable', translation: 'Inevitable', phonetic: '/ɪˈnevɪtəbl/', difficulty: 'B2', category: 'Adjectives', partOfSpeech: 'adjective' },
      { id: 'v12', word: 'Consequence', translation: 'Consecuencia', phonetic: '/ˈkɑːnsɪkwens/', difficulty: 'B2', category: 'Abstract', partOfSpeech: 'noun' },
    ],
    C1: [
      { id: 'v13', word: 'Meticulous', translation: 'Meticuloso', phonetic: '/məˈtɪkjələs/', difficulty: 'C1', category: 'Adjectives', partOfSpeech: 'adjective' },
      { id: 'v14', word: 'Eloquent', translation: 'Elocuente', phonetic: '/ˈeləkwənt/', difficulty: 'C1', category: 'Adjectives', partOfSpeech: 'adjective' },
    ],
    C2: [
      { id: 'v15', word: 'Serendipity', translation: 'Serendipia', phonetic: '/ˌserənˈdɪpɪti/', difficulty: 'C2', category: 'Abstract', partOfSpeech: 'noun' },
    ],
  };

  // Get items for the declared level range
  const result: VocabProbeItem[] = [];
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const minIdx = levels.indexOf(range.min as CEFRLevel);
  const maxIdx = levels.indexOf(range.max as CEFRLevel);

  for (let i = minIdx; i <= maxIdx; i++) {
    result.push(...items[levels[i]]);
  }

  return result.slice(0, 5); // Return max 5 items
};

const getSampleListeningItems = (level: DeclaredLevel): ListeningProbeItem[] => {
  const items: ListeningProbeItem[] = [
    {
      id: 'l1',
      audioText: 'I would like a glass of water, please.',
      options: ['Ordering a drink', 'Asking for directions', 'Making a phone call', 'Buying clothes'],
      correctIndex: 0,
      difficulty: 'A1',
      context: 'restaurant',
    },
    {
      id: 'l2',
      audioText: 'The weather forecast says it will rain tomorrow.',
      options: ['Planning outdoor activities', 'Weather prediction', 'News about sports', 'Traffic update'],
      correctIndex: 1,
      difficulty: 'A2',
      context: 'weather',
    },
    {
      id: 'l3',
      audioText: 'I have been working on this project for three months.',
      options: ['Discussing work duration', 'Planning vacation', 'Scheduling a meeting', 'Job interview'],
      correctIndex: 0,
      difficulty: 'B1',
      context: 'work',
    },
  ];

  const range = DECLARED_TO_CEFR_RANGE[level];
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const minIdx = levels.indexOf(range.min as CEFRLevel);

  // Filter by level range
  return items.filter((item) => {
    const itemIdx = levels.indexOf(item.difficulty);
    return itemIdx >= minIdx;
  }).slice(0, 3);
};

const getSampleSpeakingItem = (level: DeclaredLevel): SpeakingProbeItem => {
  const items: Record<DeclaredLevel, SpeakingProbeItem> = {
    beginner: {
      id: 's0',
      prompt: 'Say these words: Hello, Thank you, Goodbye',
      promptTranslation: 'Di estas palabras: Hola, Gracias, Adiós',
      targetDuration: 15,
      difficulty: 'A0',
      context: 'basic words',
      hints: ['Hello', 'Thank you', 'Goodbye'],
    },
    basics: {
      id: 's1',
      prompt: 'Introduce yourself briefly. Say your name and where you are from.',
      promptTranslation: 'Preséntate brevemente. Di tu nombre y de dónde eres.',
      targetDuration: 20,
      difficulty: 'A1',
      context: 'introduction',
      hints: ['My name is...', 'I am from...', 'Nice to meet you'],
    },
    intermediate: {
      id: 's2',
      prompt: 'Describe what you did last weekend in a few sentences.',
      promptTranslation: 'Describe lo que hiciste el fin de semana pasado en unas oraciones.',
      targetDuration: 30,
      difficulty: 'B1',
      context: 'past activities',
      hints: ['On Saturday I...', 'Then I...', 'It was...'],
    },
    advanced: {
      id: 's3',
      prompt: 'Share your opinion on a current topic that interests you.',
      promptTranslation: 'Comparte tu opinión sobre un tema actual que te interese.',
      targetDuration: 45,
      difficulty: 'B2',
      context: 'opinion',
      hints: ['I believe that...', 'In my opinion...', 'The reason is...'],
    },
  };

  return items[level];
};

const getSampleWritingItem = (level: DeclaredLevel): WritingProbeItem => {
  const items: Record<DeclaredLevel, WritingProbeItem> = {
    beginner: {
      id: 'w0',
      prompt: 'Write a simple greeting',
      promptTranslation: 'Escribe un saludo simple',
      targetLength: 'short',
      difficulty: 'A0',
      context: 'greeting',
      exampleStart: 'Hello, ',
    },
    basics: {
      id: 'w1',
      prompt: 'Write a short message to a friend about your day.',
      promptTranslation: 'Escribe un mensaje corto a un amigo sobre tu día.',
      targetLength: 'short',
      difficulty: 'A2',
      context: 'casual message',
      exampleStart: 'Hi! Today I ',
    },
    intermediate: {
      id: 'w2',
      prompt: 'Write a brief paragraph about your favorite hobby and why you enjoy it.',
      promptTranslation: 'Escribe un párrafo breve sobre tu pasatiempo favorito y por qué lo disfrutas.',
      targetLength: 'medium',
      difficulty: 'B1',
      context: 'hobby description',
    },
    advanced: {
      id: 'w3',
      prompt: 'Write a short email requesting a meeting with a colleague to discuss a project.',
      promptTranslation: 'Escribe un correo breve solicitando una reunión con un colega para discutir un proyecto.',
      targetLength: 'medium',
      difficulty: 'B2',
      context: 'professional email',
    },
  };

  return items[level];
};

// Progress indicator component
function ProgressIndicator({
  current,
  total,
  currentProbe,
}: {
  current: number;
  total: number;
  currentProbe: ProbeType | null;
}) {
  const probeLabels: Record<ProbeType, string> = {
    vocabulary: 'Vocabulary',
    listening: 'Listening',
    speaking: 'Speaking',
    writing: 'Writing',
  };

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressDots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < current && styles.progressDotCompleted,
              i === current && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
      {currentProbe && (
        <Text style={styles.progressLabel}>
          {probeLabels[currentProbe]} ({current + 1}/{total})
        </Text>
      )}
    </View>
  );
}

// Analyzing state component
function AnalyzingState() {
  const haptics = useHaptics();

  useEffect(() => {
    // Gentle haptic to indicate processing
    const timer = setTimeout(() => haptics.light(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.analyzingContainer}
    >
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      <Text style={styles.analyzingTitle}>Analyzing your responses...</Text>
      <Text style={styles.analyzingSubtitle}>
        Creating your personalized learning path
      </Text>
    </Animated.View>
  );
}

export function CalibrationFlow({
  onComplete,
  onExit,
  initialLevel,
}: CalibrationFlowProps) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const {
    state,
    progress,
    startCalibration,
    recordResponse,
    skipProbe,
    finalizeCalibration,
    resetCalibration,
  } = useCalibration();

  // Start with initial level if provided
  useEffect(() => {
    if (initialLevel) {
      startCalibration(initialLevel);
    }
  }, [initialLevel]);

  // Auto-finalize when analyzing
  useEffect(() => {
    if (state.status === 'analyzing') {
      const timer = setTimeout(() => {
        finalizeCalibration();
      }, 1500); // Brief delay for visual feedback
      return () => clearTimeout(timer);
    }
  }, [state.status, finalizeCalibration]);

  // Get current probe items based on declared level
  const vocabItems = useMemo(
    () => (state.declaredLevel ? getSampleVocabItems(state.declaredLevel) : []),
    [state.declaredLevel]
  );

  const listeningItems = useMemo(
    () => (state.declaredLevel ? getSampleListeningItems(state.declaredLevel) : []),
    [state.declaredLevel]
  );

  const speakingItem = useMemo(
    () => (state.declaredLevel ? getSampleSpeakingItem(state.declaredLevel) : null),
    [state.declaredLevel]
  );

  const writingItem = useMemo(
    () => (state.declaredLevel ? getSampleWritingItem(state.declaredLevel) : null),
    [state.declaredLevel]
  );

  // Calculate probe index within each type
  const getProbeIndexForType = (probeType: ProbeType): number => {
    const probesOfType = state.responses.filter((r) => r.probeType === probeType);
    return probesOfType.length;
  };

  const handleLevelSelect = (level: DeclaredLevel) => {
    haptics.medium();
    startCalibration(level);
  };

  const handleProbeComplete = (
    probeType: ProbeType,
    response: Omit<ProbeResponse, 'probeType' | 'timestamp'>
  ) => {
    haptics.light();
    recordResponse({
      ...response,
      probeType,
    });
  };

  const handleSkip = () => {
    haptics.light();
    skipProbe();
  };

  const handleResultsContinue = () => {
    if (state.result) {
      onComplete(state.result);
    }
  };

  const handleBack = () => {
    haptics.light();
    resetCalibration();
    onExit?.();
  };

  // Render based on current state
  const renderContent = () => {
    switch (state.status) {
      case 'idle':
      case 'selecting-level':
        return (
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.fullScreen}
          >
            <DeclaredLevelPicker
              onSelect={handleLevelSelect}
              onBack={onExit ? handleBack : undefined}
            />
          </Animated.View>
        );

      case 'in-progress':
        const currentProbe = state.currentProbeType;

        if (!currentProbe) return null;

        return (
          <Animated.View
            key={`${currentProbe}-${state.currentProbeIndex}`}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.fullScreen}
          >
            {/* Progress indicator */}
            <View style={[styles.probeHeader, { paddingTop: insets.top + spacing.sm }]}>
              <ProgressIndicator
                current={state.currentProbeIndex}
                total={state.probeSequence.length}
                currentProbe={currentProbe}
              />
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsValue}>{state.points}</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>

            {/* Current probe */}
            <View style={styles.probeContent}>
              {currentProbe === 'vocabulary' && vocabItems.length > 0 && (
                <VocabProbe
                  item={vocabItems[getProbeIndexForType('vocabulary') % vocabItems.length]}
                  onComplete={(response) => handleProbeComplete('vocabulary', response)}
                  onSkip={handleSkip}
                />
              )}
              {currentProbe === 'listening' && listeningItems.length > 0 && (
                <ListeningProbe
                  item={listeningItems[getProbeIndexForType('listening') % listeningItems.length]}
                  onComplete={(response) => handleProbeComplete('listening', response)}
                  onSkip={handleSkip}
                />
              )}
              {currentProbe === 'speaking' && speakingItem && (
                <SpeakingProbe
                  item={speakingItem}
                  onComplete={(response) => handleProbeComplete('speaking', response)}
                  onSkip={handleSkip}
                  showHints
                />
              )}
              {currentProbe === 'writing' && writingItem && (
                <WritingProbe
                  item={writingItem}
                  onComplete={(response) => handleProbeComplete('writing', response)}
                  onSkip={handleSkip}
                />
              )}
            </View>
          </Animated.View>
        );

      case 'analyzing':
        return (
          <AnalyzingState />
        );

      case 'complete':
        if (!state.result) return null;
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.fullScreen}
          >
            <ResultsCard
              result={state.result}
              onContinue={handleResultsContinue}
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  fullScreen: {
    flex: 1,
  },
  probeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  progressContainer: {
    flex: 1,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.medium,
  },
  progressDotCompleted: {
    backgroundColor: colors.success.DEFAULT,
  },
  progressDotActive: {
    backgroundColor: colors.primary.DEFAULT,
    width: 24,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: 2,
  },
  pointsValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning.light,
  },
  pointsLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.warning.light,
  },
  probeContent: {
    flex: 1,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  analyzingTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  analyzingSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
