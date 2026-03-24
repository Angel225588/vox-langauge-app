/**
 * Guided Voice Practice — Orchestrator
 *
 * Manages the full flow: Briefing → Phrases → Call → Results → Completion
 *
 * Route: /voice-practice/[scenarioId]
 * Entry: Practice Tab → Scenario Selection → tap a scenario
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { useElevenLabsConversation } from '@/hooks/useElevenLabsConversation';
import { analyzeConversation } from '@/lib/ai/conversationFeedback';
import {
  buildGuidedSystemPrompt,
  buildGuidedFirstMessage,
  detectObjectiveCompletion,
} from '@/lib/voice/guidedPromptBuilder';
import { getDefaultVoiceForLanguage } from '@/lib/voice/elevenLabsConfig';
import { updateStreakData } from '@/lib/db/sqlite';
import { MissionBriefingScreen } from '@/components/cards/MissionBriefingScreen';
import { KeyPhrasesScreen } from '@/components/voice/KeyPhrasesScreen';
import { GuidedCallScreen } from '@/components/voice/GuidedCallScreen';
import { CallResultsScreen } from '@/components/voice/CallResultsScreen';
import { CallCompletionScreen } from '@/components/voice/CallCompletionScreen';
import { colors, spacing, typography } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';
import type { VoiceScenario } from '@/lib/voice/types';

type FlowStep = 'briefing' | 'phrases' | 'call' | 'results' | 'completion';

interface CallResults {
  overallScore: number;
  kpis: { articulation: number; fluency: number; communication: number; scenario: number };
  pointsEarned: number;
  objectivesCompleted: boolean[];
  feedbackSummary: string;
  duration: number;
  fullFeedback?: any; // Full feedback object for detail screen
}

export default function GuidedVoicePracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scenarioId: string; scenarioData?: string }>();
  const { user } = useAuth();
  const v3 = useOnboardingV3();

  // Flow state
  const [step, setStep] = useState<FlowStep>('briefing');
  const [results, setResults] = useState<CallResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Save transcript to ref — hook may clear messages after disconnect
  const savedTranscriptRef = useRef<any[]>([]);

  // Parse scenario from route params
  const scenario: VoiceScenario | null = params.scenarioData
    ? JSON.parse(params.scenarioData)
    : null;

  // Voice config
  const targetLang = v3.target_language || 'english';
  const langCode = targetLang === 'french' ? 'fr' : targetLang === 'spanish' ? 'es' : 'en';
  const voice = getDefaultVoiceForLanguage(langCode);
  const voiceName = voice?.name || 'Alex';

  // Build the guided prompt
  const systemPrompt = scenario ? buildGuidedSystemPrompt({
    scenario,
    targetLanguage: langCode,
    nativeLanguage: v3.native_language || 'english',
    proficiency: v3.proficiency_level || 'starting_fresh',
    userName: v3.first_name || undefined,
    voiceName,
  }) : '';

  // ElevenLabs hook
  const {
    isConnected,
    isSpeaking,
    messages,
    sessionDuration,
    startSession,
    endSession,
  } = useElevenLabsConversation({
    voice,
    targetLanguage: langCode,
    scenario: scenario?.id || 'practice',
    scenarioDescription: scenario?.description || '',
    userProficiency: v3.proficiency_level || 'starting_fresh',
    customSystemPrompt: systemPrompt,
    keyVocabulary: scenario?.keyVocabulary,
    targetDuration: scenario?.suggestedDuration || 300,
    onSessionEnd: async (session) => {
      await handleCallEnd(session);
    },
  });

  // Keep transcript ref up to date (messages from hook may clear after disconnect)
  useEffect(() => {
    if (messages.length > 0) {
      savedTranscriptRef.current = [...messages];
    }
  }, [messages]);

  // Handle call end → analyze → show results
  const handleCallEnd = useCallback(async (session?: any) => {
    if (!scenario) return;
    setStep('results');
    setIsAnalyzing(true);

    try {
      // Priority: session messages > saved ref > hook state
      const transcript = session?.messages?.length > 0
        ? session.messages
        : savedTranscriptRef.current.length > 0
          ? savedTranscriptRef.current
          : messages;

      console.log(`[VoicePractice] Analyzing ${transcript.length} messages`);
      const feedback = await analyzeConversation({
        messages: transcript,
        scenario: scenario.title,
        scenarioDescription: scenario.description,
        proficiency: v3.proficiency_level || 'starting_fresh',
        targetLanguage: langCode,
        vocabPrepWords: scenario.suggestedPhrases,
      });

      const objectivesCompleted = detectObjectiveCompletion(
        scenario.objectives,
        transcript,
      );

      const completedCount = objectivesCompleted.filter(Boolean).length;
      const overallScore = feedback?.feedback
        ? Math.round(
            (feedback.feedback.articulation +
              feedback.feedback.fluency +
              feedback.feedback.communication +
              feedback.feedback.scenario) / 4
          )
        : 65;

      // Calculate points: 20 base + 5/turn + 5 per objective
      const turns = transcript.filter((m: any) => m.role === 'user').length;
      const pointsEarned = 20 + turns * 5 + completedCount * 5;

      // Save points
      try {
        await updateStreakData({ pointsToAdd: pointsEarned });
      } catch {}

      setResults({
        overallScore,
        kpis: feedback?.feedback
          ? {
              articulation: feedback.feedback.articulation,
              fluency: feedback.feedback.fluency,
              communication: feedback.feedback.communication,
              scenario: feedback.feedback.scenario,
            }
          : { articulation: 70, fluency: 65, communication: 72, scenario: 68 },
        pointsEarned,
        objectivesCompleted,
        feedbackSummary: feedback?.feedback?.overallMessage || 'Good practice session.',
        fullFeedback: feedback?.feedback || null,
        duration: sessionDuration,
      });
    } catch (err) {
      console.error('[VoicePractice] Feedback analysis failed:', err);
      setResults({
        overallScore: 65,
        kpis: { articulation: 65, fluency: 60, communication: 68, scenario: 62 },
        pointsEarned: 20,
        objectivesCompleted: scenario.objectives.map(() => false),
        feedbackSummary: 'Great effort! Keep practicing to improve.',
        duration: sessionDuration,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [scenario, messages, sessionDuration, langCode, v3.proficiency_level]);

  // ─── Navigation handlers ───────────────────────────

  const handleStartCall = useCallback(async () => {
    setStep('call');
    try {
      await startSession();
    } catch (err) {
      console.error('[VoicePractice] Failed to start call:', err);
    }
  }, [startSession]);

  const handleEndCall = useCallback(async () => {
    // Save current messages before ending (hook may clear them)
    const currentMessages = [...savedTranscriptRef.current];
    try {
      await endSession();
      // onSessionEnd callback will call handleCallEnd with session data
    } catch {
      // endSession may fail if already disconnected — use saved transcript
      console.log(`[VoicePractice] Ending with ${currentMessages.length} saved messages`);
      await handleCallEnd({ messages: currentMessages });
    }
  }, [endSession, handleCallEnd]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // ─── Loading state ─────────────────────────────────

  if (!scenario) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading scenario...</Text>
      </View>
    );
  }

  // ─── Step routing ──────────────────────────────────

  switch (step) {
    case 'briefing':
      return (
        <MissionBriefingScreen
          title={scenario.title}
          description={scenario.description}
          difficulty={scenario.difficulty || 'intermediate'}
          yourRole={scenario.userRole}
          theirRole={scenario.aiRole}
          characterName={voiceName}
          objectives={scenario.objectives}
          onStartCall={handleStartCall}
          onPreviewVocabulary={() => setStep('phrases')}
          onBack={handleBack}
        />
      );

    case 'phrases': {
      // Build phrases with translations where available
      const phrasesList = (scenario.suggestedPhrases || []).map((p: any) => {
        if (typeof p === 'object' && p.text) return p; // Already has text + translation
        return { text: p, translation: '' };
      });
      // If no phrases at all, show a message
      if (phrasesList.length === 0) {
        phrasesList.push(
          { text: 'No key phrases for this scenario', translation: 'Start the call to practice freely' },
        );
      }
      return (
        <KeyPhrasesScreen
          scenarioTitle={scenario.title}
          phrases={phrasesList}
          onStartCall={handleStartCall}
          onBack={() => setStep('briefing')}
        />
      );
    }

    case 'call':
      return (
        <GuidedCallScreen
          scenarioTitle={scenario.title}
          characterName={voiceName}
          characterRole={scenario.aiRole}
          objectives={scenario.objectives}
          phrases={(scenario.suggestedPhrases || []).map(p => ({
            text: p,
            translation: '',
          }))}
          isConnected={isConnected}
          isSpeaking={isSpeaking}
          messages={messages}
          sessionDuration={sessionDuration}
          onEndCall={handleEndCall}
        />
      );

    case 'results':
      if (isAnalyzing || !results) {
        return (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.secondary.DEFAULT} />
            <Text style={styles.loadingText}>Analyzing your performance...</Text>
          </View>
        );
      }
      return (
        <CallResultsScreen
          overallScore={results.overallScore}
          kpis={results.kpis}
          pointsEarned={results.pointsEarned}
          scenarioTitle={scenario.title}
          objectives={scenario.objectives}
          objectivesCompleted={results.objectivesCompleted}
          feedbackSummary={results.feedbackSummary}
          onDetailedFeedback={() => {
            router.push({
              pathname: '/feedback-detail',
              params: {
                scores: JSON.stringify({
                  articulation: results.kpis.articulation,
                  fluency: results.kpis.fluency,
                  communication: results.kpis.communication,
                  scenario: results.kpis.scenario,
                  overallScore: results.overallScore,
                  pointsEarned: results.pointsEarned,
                }),
                type: 'voice',
                feedback: results.fullFeedback ? JSON.stringify(results.fullFeedback) : undefined,
              },
            });
          }}
          onDone={() => setStep('completion')}
        />
      );

    case 'completion':
      return (
        <CallCompletionScreen
          scenarioTitle={scenario.title}
          objectivesCompleted={results?.objectivesCompleted.filter(Boolean).length || 0}
          objectivesTotal={scenario.objectives.length}
          pointsEarned={results?.pointsEarned || 0}
          callDuration={results?.duration || 0}
          overallScore={results?.overallScore || 0}
          onContinuePracticing={() => {
            setStep('briefing');
            setResults(null);
          }}
          onBackToScenarios={handleBack}
        />
      );
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.regular,
    color: colors.text.secondary,
  },
});
