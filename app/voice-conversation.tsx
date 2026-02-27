/**
 * Voice Conversation Screen
 *
 * Select a scenario and start a real-time voice conversation
 * with an AI tutor. Premium, minimalist design.
 *
 * Now powered by ElevenLabs Conversational AI for:
 * - Automatic voice activity detection (no manual mute)
 * - Natural conversation flow
 * - Better voice quality
 * - Full transcript saving
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { hasConsent, setConsent } from '@/lib/privacy/consentManager';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { PostCallFeedbackScreen, MissionBriefingScreen } from '@/components/cards';
import VoiceCallScreenElevenLabs, {
  VoiceCallCompletionResult,
} from '@/components/cards/VoiceCallScreenElevenLabs';
import {
  getScenariosForLanguage,
  getScenariosByDifficulty,
  VoiceScenario,
  getCharacter,
  ConversationMessage,
  AccentType,
  getAccentsForLanguage,
  getDefaultAccent,
  SupportedLanguage,
} from '@/lib/voice';
import {
  getScenariosForUser,
  getEnhancedScenariosForUser,
  getScenariosForStair,
  getStairVoiceScenarios,
  createUserProfile,
  createEnhancedUserProfile,
  MatchedScenario,
  StairContext,
} from '@/lib/voice/scenarioMatcher';
import type { ElevenLabsMessage } from '@/lib/voice/elevenLabsTypes';
import {
  getDefaultVoiceForLanguage,
  getVoiceById,
} from '@/lib/voice/elevenLabsConfig';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { useAuth } from '@/hooks/useAuth';
import { processPostCallVocab } from '@/lib/voice/vocabLoop';
import {
  saveConversationSession,
  updateSessionFeedback,
  updateSessionVocabResults,
  type ConversationFeedback,
} from '@/lib/db/conversations';
import { getCurrentStairStepId } from '@/lib/ai/practiceGenerator';
import { storeActivityCompletion } from '@/app/lesson-session';
import { getStairSkeleton } from '@/lib/db/learningPaths';
import {
  generateScenariosFromOnboarding,
  enrichStairScenarios,
} from '@/lib/voice/scenarioGenerator';

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

// Scenario icon mapping - related icons for each scenario type
const SCENARIO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'cafe-order': 'cafe-outline',
  'restaurant': 'restaurant-outline',
  'directions': 'navigate-outline',
  'shopping': 'bag-outline',
  'hotel': 'bed-outline',
  'airport': 'airplane-outline',
  'doctor': 'medical-outline',
  'interview': 'briefcase-outline',
  'phone-call': 'call-outline',
  'meeting': 'people-outline',
  'dating': 'heart-outline',
  'emergency': 'alert-circle-outline',
  'default': 'chatbubbles-outline',
};

// Helper to get scenario icon
const getScenarioIcon = (scenario: VoiceScenario): keyof typeof Ionicons.glyphMap => {
  // Check if scenario ID matches any known icon
  const iconKey = Object.keys(SCENARIO_ICONS).find(key =>
    scenario.id.toLowerCase().includes(key) ||
    scenario.category?.toLowerCase().includes(key)
  );
  return iconKey ? SCENARIO_ICONS[iconKey] : SCENARIO_ICONS.default;
};

// Flow states: selection → goal → call → feedback
type FlowState = 'selection' | 'goal' | 'call' | 'feedback';

// Storage key for saved transcripts
const TRANSCRIPTS_STORAGE_KEY = 'vox_conversation_transcripts';

// Saved transcript structure
interface SavedTranscript {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  characterName?: string;
  messages: ElevenLabsMessage[];
  duration: number;
  timestamp: number;
}

// Map V3 full language names to SupportedLanguage codes
const LANG_NAME_TO_CODE: Record<string, SupportedLanguage> = {
  english: 'en',
  french: 'fr',
  spanish: 'es',
};

export default function VoiceConversationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const sessionParams = useLocalSearchParams<{
    returnToSession?: string;
    activityId?: string;
  }>();
  const isSessionActivity = sessionParams.returnToSession === 'true';
  const { data: v2Data } = useOnboardingV2();
  const v3Store = useOnboardingV3();
  const [selectedScenario, setSelectedScenario] = useState<VoiceScenario | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [flowState, setFlowState] = useState<FlowState>('selection');

  // Merge V3 + V2 onboarding data (prefer V3 when available)
  const hasV3Data = !!v3Store.target_language;
  const targetLanguage: SupportedLanguage = (
    hasV3Data
      ? LANG_NAME_TO_CODE[v3Store.target_language || '']
      : (v2Data.target_language as SupportedLanguage)
  ) || 'es';

  // Unified onboarding data for existing code (backward-compatible shape)
  const onboardingData = {
    target_language: targetLanguage,
    motivation: v3Store.goal || v2Data.motivation || null,
    motivations: v2Data.motivations || null,
    proficiency_level: v3Store.proficiency_level || v2Data.proficiency_level || null,
    profession: v3Store.profession || v2Data.profession || null,
    scenarios: v3Store.scenarios?.length ? v3Store.scenarios : (v2Data.scenarios || null),
    min_practice_time: v3Store.schedule_time || v2Data.min_practice_time || null,
    max_practice_time: v2Data.max_practice_time || null,
  };
  const [selectedAccent, setSelectedAccent] = useState<AccentType>(getDefaultAccent(targetLanguage));
  const [showAccentSelector, setShowAccentSelector] = useState(false);

  // Track the Supabase session ID for feedback persistence (Fix 4)
  const [supabaseSessionId, setSupabaseSessionId] = useState<string | null>(null);

  // Track current stair context for scenario matching (Fix 3)
  const [stairContext, setStairContext] = useState<StairContext | null>(null);
  const [currentStairStepId, setCurrentStairStepId] = useState<string | null>(null);

  // Stair DB scenarios (personalized to user's current learning path)
  const [stairScenarios, setStairScenarios] = useState<MatchedScenario[]>([]);

  // AI-generated scenarios from onboarding data (Tier 3)
  const [generatedScenarios, setGeneratedScenarios] = useState<VoiceScenario[]>([]);

  // Extended to include full transcript for saving
  const [lastConversation, setLastConversation] = useState<{
    messages: ConversationMessage[];
    duration: number;
    scenarioTitle: string;
    characterName?: string;
    hadError?: boolean;
    transcript?: ElevenLabsMessage[];
  } | null>(null);

  // Get available accents for the user's target language
  const availableAccents = getAccentsForLanguage(targetLanguage);

  // Calculate target session duration from onboarding practice time
  const targetDurationSeconds = onboardingData.min_practice_time
    ? onboardingData.min_practice_time * 60  // Use minimum as target
    : 300; // Default 5 min

  // Create enhanced user profile from full onboarding data for personalized scenarios
  const enhancedProfile = createEnhancedUserProfile(onboardingData);

  // Three-tier waterfall: stair rich → stair enrich → onboarding generate → hardcoded
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Tier 1+2: Try stair scenarios (authenticated users with learning path)
        if (user?.id) {
          const stepId = await getCurrentStairStepId(user.id);
          if (stepId) {
            if (!cancelled) setCurrentStairStepId(stepId);
            const skeleton = await getStairSkeleton(stepId);
            if (skeleton && !cancelled) {
              setStairContext({
                skillsFocus: skeleton.skills_unlocked || [],
                scenarioTags: skeleton.skills_required || [],
                difficulty: onboardingData.proficiency_level || 'beginner',
              });
            }

            // Fetch stair-generated scenarios from DB
            const dbScenarios = await getStairVoiceScenarios(stepId, user.id, enhancedProfile);
            if (dbScenarios.length > 0) {
              // Show immediately (thin or rich)
              if (!cancelled) setStairScenarios(dbScenarios);
              console.log('[VoiceConversation] Loaded stair DB scenarios:', dbScenarios.length);

              // Tier 1: If scenarios already have systemPromptTemplate, we're done
              const hasRichData = dbScenarios.some(s => s.systemPromptTemplate);
              if (!hasRichData) {
                // Tier 2: Enrich thin scenarios with Gemini in background
                try {
                  const enriched = await enrichStairScenarios(
                    dbScenarios,
                    targetLanguage,
                    onboardingData.proficiency_level || 'beginner'
                  );
                  if (!cancelled && enriched.length > 0) {
                    // Re-attach match metadata from originals
                    const enrichedMatched: MatchedScenario[] = enriched.map((s, i) => ({
                      ...s,
                      relevanceScore: dbScenarios[i]?.relevanceScore ?? 90,
                      matchReason: 'Personalized for your learning path',
                    }));
                    setStairScenarios(enrichedMatched);
                    console.log('[VoiceConversation] Enriched stair scenarios:', enrichedMatched.length);
                  }
                } catch (err) {
                  console.warn('[VoiceConversation] Enrichment failed (non-fatal):', err);
                }
              }
              return; // Stair scenarios found, no need for Tier 3
            }
          }
        }

        // Tier 3: No stair scenarios — generate from onboarding data
        if (hasV3Data && v3Store.profession) {
          try {
            const generated = await generateScenariosFromOnboarding({
              first_name: v3Store.first_name || '',
              target_language: v3Store.target_language || 'spanish',
              native_language: v3Store.native_language || 'english',
              proficiency_level: v3Store.proficiency_level || 'conversational',
              goal: v3Store.goal || '',
              profession: v3Store.profession || '',
              scenarios: v3Store.scenarios || [],
            });

            if (!cancelled && generated.length > 0) {
              setGeneratedScenarios(generated);
              console.log('[VoiceConversation] Generated onboarding scenarios:', generated.length);
            }
          } catch (err) {
            console.warn('[VoiceConversation] Onboarding generation failed (non-fatal):', err);
          }
        }
        // Tier 4: Hardcoded library is always the base (handled by personalizedScenarios memo)
      } catch (err) {
        console.warn('[VoiceConversation] Scenario waterfall failed:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  // Priority: AI-generated (Tier 3) > Stair DB (Tier 1/2) > Hardcoded (Tier 4)
  const personalizedScenarios = useMemo(() => {
    const hardcoded = stairContext
      ? getScenariosForStair(stairContext, enhancedProfile)
      : getEnhancedScenariosForUser(enhancedProfile);

    // Convert AI-generated scenarios to MatchedScenario format
    const generatedMatched: MatchedScenario[] = generatedScenarios.map((s, i) => ({
      ...s,
      relevanceScore: 95 - i,
      matchReason: 'Personalized for you',
    }));

    // Deduplicate by id: generated > stair > hardcoded
    const seenIds = new Set<string>();
    const result: MatchedScenario[] = [];

    for (const s of [...generatedMatched, ...stairScenarios, ...hardcoded]) {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        result.push(s);
      }
    }

    return result;
  }, [generatedScenarios, stairScenarios, stairContext, enhancedProfile.targetLanguage, enhancedProfile.motivation, enhancedProfile.proficiencyLevel, enhancedProfile.profession]);

  // Debug logging for onboarding data
  console.log('[VoiceConversation] Enhanced user profile from onboarding:', {
    targetLanguage: onboardingData.target_language,
    motivation: onboardingData.motivation,
    motivations: onboardingData.motivations,
    profession: onboardingData.profession,
    proficiency: onboardingData.proficiency_level,
    selectedScenarios: onboardingData.scenarios,
    scenarioCount: personalizedScenarios.length,
    topScenario: personalizedScenarios[0]?.title,
    hasStairContext: !!stairContext,
  });

  // Filter by difficulty if selected
  const filteredScenarios: MatchedScenario[] = difficultyFilter === 'all'
    ? personalizedScenarios
    : personalizedScenarios.filter(s => s.difficulty === difficultyFilter);

  // Check if ElevenLabs is configured
  const hasApiKey = !!(process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID);

  // Save transcript to AsyncStorage
  const saveTranscript = useCallback(async (transcript: SavedTranscript) => {
    try {
      const existingData = await AsyncStorage.getItem(TRANSCRIPTS_STORAGE_KEY);
      const transcripts: SavedTranscript[] = existingData ? JSON.parse(existingData) : [];

      // Add new transcript at the beginning
      transcripts.unshift(transcript);

      // Keep only the last 50 transcripts
      const trimmedTranscripts = transcripts.slice(0, 50);

      await AsyncStorage.setItem(TRANSCRIPTS_STORAGE_KEY, JSON.stringify(trimmedTranscripts));
      console.log('[VoiceConversation] Transcript saved:', transcript.id);
    } catch (error) {
      console.error('[VoiceConversation] Failed to save transcript:', error);
    }
  }, []);

  const handleScenarioSelect = (scenario: VoiceScenario) => {
    if (!hasApiKey) {
      Alert.alert(
        'ElevenLabs Not Configured',
        'Please add your ElevenLabs Agent ID to continue.\n\nAdd EXPO_PUBLIC_ELEVENLABS_AGENT_ID to your .env file.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedScenario(scenario);
    setFlowState('goal'); // Go to goal page first
  };

  const handleStartCall = async () => {
    const consented = await hasConsent('voice_recording');
    if (!consented) {
      Alert.alert(
        'Voice Recording Consent',
        'Vox sends your voice to a third-party speech service (ElevenLabs) for real-time conversation. Your audio is processed in real-time and is not stored by Vox. Do you consent to voice recording for this session?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'I Consent',
            onPress: async () => {
              await setConsent('voice_recording', true);
              setFlowState('call');
            },
          },
        ]
      );
      return;
    }
    setFlowState('call');
  };

  const handleGoalBack = () => {
    setFlowState('selection');
    setSelectedScenario(null);
  };

  // Handle conversation completion - save to Supabase + vocab loop + show feedback
  const handleConversationComplete = async (result: VoiceCallCompletionResult) => {
    const { success, messages, endReason, duration, transcript } = result;

    console.log('[VoiceConversation] handleConversationComplete called:', {
      success,
      endReason,
      messageCount: messages.length,
      duration,
      hasTranscript: !!transcript,
    });

    // Show feedback screen if:
    // 1. Has 2+ messages (proper conversation), OR
    // 2. Duration >= 30 seconds (fallback - transcripts may not be captured but conversation happened)
    const hasEnoughContent = messages.length >= 2 || duration >= 30;

    if (hasEnoughContent && selectedScenario) {
      const character = selectedScenario.characterId
        ? getCharacter(selectedScenario.characterId)
        : null;

      // Save transcript to AsyncStorage (existing behavior)
      if (transcript && transcript.length > 0) {
        const savedTranscript: SavedTranscript = {
          id: `transcript_${Date.now()}`,
          scenarioId: selectedScenario.id,
          scenarioTitle: selectedScenario.title,
          characterName: character?.name,
          messages: transcript,
          duration,
          timestamp: Date.now(),
        };
        await saveTranscript(savedTranscript);
      }

      // Fix 2: Save session to Supabase + close vocab loop
      if (user?.id) {
        const userMessages = messages.filter(m => m.role === 'user');
        const userWordCount = userMessages.reduce(
          (sum, m) => sum + m.content.split(/\s+/).filter(w => w.length > 0).length,
          0
        );
        const turnCount = Math.min(
          messages.filter(m => m.role === 'user').length,
          messages.filter(m => m.role === 'assistant').length
        );

        // Save to Supabase
        try {
          const sessionId = await saveConversationSession({
            userId: user.id,
            scenario: selectedScenario.id,
            scenarioDescription: selectedScenario.description,
            proficiency: onboardingData.proficiency_level || 'intermediate',
            targetLanguage,
            startedAt: Date.now() - (duration * 1000),
            endedAt: Date.now(),
            durationSeconds: duration,
            turnCount,
            userWordCount,
            avgWordsPerTurn: turnCount > 0 ? Math.round(userWordCount / turnCount) : 0,
            pointsEarned: 0,
            messages: transcript || [],
            stairStepId: currentStairStepId || undefined,
          });

          if (sessionId) {
            setSupabaseSessionId(sessionId);
            console.log('[VoiceConversation] Session saved to Supabase:', sessionId);
          }
        } catch (err) {
          console.warn('[VoiceConversation] Failed to save session to Supabase:', err);
        }

        // Fix 2: Close the vocab loop — extract words and feed back to FSRS
        try {
          const allUserText = userMessages.map(m => m.content).join(' ');
          const userWords = allUserText
            .toLowerCase()
            .replace(/[^\w\sáéíóúñüàèìòùâêîôûäëïöüçß]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2);
          const uniqueUserWords = [...new Set(userWords)];

          await processPostCallVocab({
            vocabUsed: uniqueUserWords.slice(0, 30),
            vocabMissed: [], // Would require AI analysis of expected vs actual usage
            newVocabulary: [], // New words will be identified by AI feedback
            targetLanguage,
            scenario: selectedScenario.id,
          });
        } catch (err) {
          console.warn('[VoiceConversation] Vocab loop failed (non-fatal):', err);
        }
      }

      setLastConversation({
        messages,
        duration,
        scenarioTitle: selectedScenario.title,
        characterName: character?.name,
        hadError: endReason === 'error',
        transcript,
      });
      setFlowState('feedback');
    } else {
      // Only show generic alert for very short conversations (< 30s and no messages)
      setFlowState('selection');
      setSelectedScenario(null);

      const alertTitle = endReason === 'error'
        ? 'Connection Issue'
        : 'Conversation ended';
      const alertMessage = endReason === 'error'
        ? 'There was a problem with the connection. Please try again.'
        : messages.length > 0
          ? `You exchanged ${Math.floor(messages.length / 2)} turns.`
          : 'Try again to practice more!';

      Alert.alert(alertTitle, alertMessage, [{ text: 'OK' }]);
    }
  };

  // Fix 4: Persist feedback to Supabase before leaving
  const handleFeedbackDone = useCallback(async () => {
    // Persist feedback if we have a Supabase session ID and conversation data
    if (supabaseSessionId && lastConversation) {
      try {
        const userMessages = lastConversation.messages.filter(m => m.role === 'user');
        const totalWords = userMessages.reduce(
          (sum, m) => sum + m.content.split(/\s+/).filter(w => w.length > 0).length,
          0
        );
        const avgWordsPerTurn = userMessages.length > 0 ? totalWords / userMessages.length : 0;

        // Compute feedback scores (same logic as PostCallFeedbackScreen's analyzeConversation)
        const exchanges = Math.min(
          lastConversation.messages.filter(m => m.role === 'user').length,
          lastConversation.messages.filter(m => m.role === 'assistant').length,
        );
        const lengthScore = Math.min(avgWordsPerTurn / 15, 1) * 100;
        const engagementScore = Math.min(exchanges / 8, 1) * 100;
        const overallScore = Math.round(lengthScore * 0.4 + engagementScore * 0.6);

        const feedback: ConversationFeedback = {
          articulation: Math.round(overallScore * 0.9),
          fluency: Math.round(lengthScore),
          communication: Math.round(engagementScore),
          scenario: Math.round(overallScore),
          summary: `${exchanges} exchanges, ${totalWords} words spoken`,
          strengths: [],
          improvements: [],
          newVocabulary: [],
        };

        await updateSessionFeedback(supabaseSessionId, feedback);
        console.log('[VoiceConversation] Feedback persisted to Supabase');

        // Signal lesson-session if we're inside a lesson
        if (isSessionActivity && sessionParams.activityId) {
          await storeActivityCompletion(sessionParams.activityId, overallScore);
        }
      } catch (err) {
        console.warn('[VoiceConversation] Failed to persist feedback:', err);
      }
    } else if (isSessionActivity && sessionParams.activityId) {
      // No Supabase session but still in lesson — signal completion with default score
      await storeActivityCompletion(sessionParams.activityId, 70);
    }

    if (isSessionActivity) {
      router.replace('/lesson-session');
      return;
    }

    setFlowState('selection');
    setLastConversation(null);
    setSelectedScenario(null);
    setSupabaseSessionId(null);
  }, [supabaseSessionId, lastConversation, isSessionActivity, sessionParams.activityId, router]);

  const handlePracticeAgain = () => {
    // Keep selectedScenario to restart with same scenario
    setLastConversation(null);
    setFlowState('call');
  };

  const handleBack = () => {
    if (flowState === 'call') {
      Alert.alert(
        'End Conversation?',
        'Are you sure you want to leave the conversation?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              setFlowState('selection');
              setSelectedScenario(null);
            },
          },
        ]
      );
    } else if (flowState === 'goal') {
      handleGoalBack();
    } else if (flowState === 'feedback') {
      handleFeedbackDone();
    } else if (isSessionActivity) {
      // In a lesson session — skip the activity with default score
      if (sessionParams.activityId) {
        storeActivityCompletion(sessionParams.activityId, 50).catch(() => {});
      }
      router.replace('/lesson-session');
    } else {
      router.back();
    }
  };

  // Show feedback screen after conversation
  // Use lastConversation data (not selectedScenario) since scenario may have been cleared
  if (flowState === 'feedback' && lastConversation) {
    return (
      <PostCallFeedbackScreen
        duration={lastConversation.duration}
        messages={lastConversation.messages}
        scenarioTitle={lastConversation.scenarioTitle}
        characterName={lastConversation.characterName}
        onPracticeAgain={handlePracticeAgain}
        onDone={handleFeedbackDone}
      />
    );
  }

  // Show goal page (pre-call briefing) - Mission Briefing style
  if (flowState === 'goal' && selectedScenario) {
    // Get character for the scenario
    const character = selectedScenario.characterId
      ? getCharacter(selectedScenario.characterId)
      : null;

    // Generate role descriptions based on scenario
    // Prefer scenario-provided roles (from stair DB scenarios) over hardcoded heuristics
    const getRoles = () => {
      if (selectedScenario.userRole && selectedScenario.aiRole) {
        return {
          yourRole: selectedScenario.userRole,
          theirRole: selectedScenario.aiRole,
          characterIcon: getScenarioIcon(selectedScenario) as string,
        };
      }

      const scenarioId = selectedScenario.id.toLowerCase();

      if (scenarioId.includes('cafe') || scenarioId.includes('coffee')) {
        return {
          yourRole: 'A customer ordering coffee',
          theirRole: 'A friendly barista',
          characterIcon: 'cafe-outline',
        };
      } else if (scenarioId.includes('restaurant')) {
        return {
          yourRole: 'A customer ordering food',
          theirRole: 'A restaurant waiter',
          characterIcon: 'restaurant-outline',
        };
      } else if (scenarioId.includes('direction')) {
        return {
          yourRole: 'A tourist asking for directions',
          theirRole: 'A helpful local',
          characterIcon: 'map-outline',
        };
      } else if (scenarioId.includes('shop')) {
        return {
          yourRole: 'A customer shopping',
          theirRole: 'A store clerk',
          characterIcon: 'cart-outline',
        };
      } else if (scenarioId.includes('hotel')) {
        return {
          yourRole: 'A guest checking in',
          theirRole: 'A hotel receptionist',
          characterIcon: 'bed-outline',
        };
      } else if (scenarioId.includes('airport') || scenarioId.includes('travel')) {
        return {
          yourRole: 'A traveler at the airport',
          theirRole: 'An airline staff member',
          characterIcon: 'airplane-outline',
        };
      } else {
        return {
          yourRole: 'Yourself, practicing conversation',
          theirRole: character?.name || 'A native speaker',
          characterIcon: 'chatbubbles-outline',
        };
      }
    };

    // Generate mission objectives based on scenario
    // Prefer scenario-provided objectives (from stair DB scenarios) over hardcoded heuristics
    const getObjectives = () => {
      if (selectedScenario.objectives && selectedScenario.objectives.length > 0) {
        return selectedScenario.objectives;
      }

      const scenarioId = selectedScenario.id.toLowerCase();

      if (scenarioId.includes('cafe') || scenarioId.includes('coffee')) {
        return [
          'Greet the barista and place your order',
          'Ask about sizes or recommendations',
          'Complete the payment and thank them',
        ];
      } else if (scenarioId.includes('restaurant')) {
        return [
          'Ask for a table and read the menu',
          'Order food and drinks for yourself',
          'Ask for the check when finished',
        ];
      } else if (scenarioId.includes('direction')) {
        return [
          'Ask how to get to your destination',
          'Understand the directions given',
          'Confirm and thank them for help',
        ];
      } else if (scenarioId.includes('shop')) {
        return [
          'Ask about product availability',
          'Inquire about prices or sizes',
          'Complete a purchase or thank them',
        ];
      } else {
        return [
          'Introduce yourself naturally',
          'Ask and answer basic questions',
          'Keep the conversation flowing in Spanish',
        ];
      }
    };

    const roles = getRoles();
    const objectives = getObjectives();

    const handlePreviewVocabulary = () => {
      // TODO: Navigate to vocabulary preview page
      console.log('Preview vocabulary for scenario:', selectedScenario.id);
    };

    return (
      <MissionBriefingScreen
        title={selectedScenario.title}
        description={selectedScenario.description}
        difficulty={selectedScenario.difficulty as 'beginner' | 'intermediate' | 'advanced'}
        duration={`~${Math.round(targetDurationSeconds / 60)} min`}
        yourRole={roles.yourRole}
        theirRole={roles.theirRole}
        characterEmoji={roles.characterIcon}
        objectives={objectives}
        onStartCall={handleStartCall}
        onPreviewVocabulary={handlePreviewVocabulary}
        onBack={handleGoalBack}
      />
    );
  }

  // Show conversation view (active call) - Now using ElevenLabs
  if (flowState === 'call' && selectedScenario) {
    const character = selectedScenario.characterId
      ? getCharacter(selectedScenario.characterId)
      : undefined;

    // Map onboarding proficiency to ElevenLabs proficiency format
    const proficiencyMap: Record<string, 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'native'> = {
      'beginner': 'beginner',
      'elementary': 'elementary',
      'intermediate': 'intermediate',
      'upper_intermediate': 'advanced',
      'advanced': 'advanced',
    };
    const userProficiency = proficiencyMap[onboardingData.proficiency_level || 'intermediate'] || 'intermediate';

    // Get the appropriate ElevenLabs voice for the scenario language
    const scenarioLanguage = selectedScenario.language as SupportedLanguage;
    const voiceConfig = getDefaultVoiceForLanguage(scenarioLanguage);

    console.log('[VoiceConversation] Using voice:', {
      voiceConfig: voiceConfig?.name,
      voiceId: voiceConfig?.elevenLabsVoiceId,
      language: scenarioLanguage,
    });

    return (
      <VoiceCallScreenElevenLabs
        scenario={selectedScenario}
        character={character}
        voice={voiceConfig}
        proficiency={userProficiency}
        targetDuration={targetDurationSeconds}
        onComplete={handleConversationComplete}
        onBack={handleBack}
      />
    );
  }

  // Show scenario selection
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Voice Practice</Text>
          <Text style={styles.subtitle}>Real conversations with AI</Text>
        </View>
        {/* Call icon indicator */}
        <View style={styles.callIndicator}>
          <Ionicons name="call" size={18} color={colors.primary.DEFAULT} />
        </View>
      </View>

      {/* Accent Selector - Premium Style */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.accentContainer}>
        <TouchableOpacity
          style={styles.accentButton}
          onPress={() => setShowAccentSelector(!showAccentSelector)}
          activeOpacity={0.7}
        >
          <View style={styles.accentButtonLeft}>
            <Text style={styles.accentFlag}>
              {availableAccents.find(a => a.id === selectedAccent)?.flag || '🌍'}
            </Text>
            <View>
              <Text style={styles.accentLabel}>Accent</Text>
              <Text style={styles.accentButtonText}>
                {availableAccents.find(a => a.id === selectedAccent)?.name || 'Select'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={showAccentSelector ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Accent Dropdown */}
        {showAccentSelector && (
          <Animated.View entering={FadeInUp.duration(200)} style={styles.accentDropdown}>
            {availableAccents.map((accent, index) => (
              <Pressable
                key={accent.id}
                style={({ pressed }) => [
                  styles.accentOption,
                  selectedAccent === accent.id && styles.accentOptionActive,
                  pressed && styles.accentOptionPressed,
                  index === availableAccents.length - 1 && styles.accentOptionLast,
                ]}
                onPress={() => {
                  setSelectedAccent(accent.id);
                  setShowAccentSelector(false);
                }}
              >
                <Text style={styles.accentFlag}>{accent.flag}</Text>
                <Text style={[
                  styles.accentOptionText,
                  selectedAccent === accent.id && styles.accentOptionTextActive,
                ]}>
                  {accent.name}
                </Text>
                {selectedAccent === accent.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary.DEFAULT} />
                )}
              </Pressable>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      {/* Difficulty Filter - Pill Style */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['all', 'beginner', 'intermediate', 'advanced'] as DifficultyFilter[]).map(
            (difficulty) => (
              <Pressable
                key={difficulty}
                style={({ pressed }) => [
                  styles.filterChip,
                  difficultyFilter === difficulty && styles.filterChipActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setDifficultyFilter(difficulty)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    difficultyFilter === difficulty && styles.filterChipTextActive,
                  ]}
                >
                  {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>
      </View>

      {/* Scenarios List - Premium Dark Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredScenarios.length === 0 ? (
          <Animated.View entering={FadeIn.delay(100)} style={styles.emptyState}>
            <Ionicons name="language-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Scenarios Available</Text>
            <Text style={styles.emptyStateText}>
              Scenarios for {targetLanguage.toUpperCase()} are coming soon!
            </Text>
          </Animated.View>
        ) : (
          filteredScenarios.map((scenario, index) => {
            const scenarioIcon = getScenarioIcon(scenario);
            const difficultyColor =
              scenario.difficulty === 'beginner'
                ? colors.success.DEFAULT
                : scenario.difficulty === 'intermediate'
                ? colors.warning.DEFAULT
                : colors.error.DEFAULT;

            // Check if this is a highly recommended scenario (score > 80)
            const isRecommended = scenario.relevanceScore >= 80;

            return (
              <Animated.View
                key={scenario.id}
                entering={FadeInDown.duration(300).delay(index * 80)}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.scenarioCard,
                    isRecommended && styles.scenarioCardRecommended,
                    pressed && styles.scenarioCardPressed,
                  ]}
                  onPress={() => handleScenarioSelect(scenario)}
                >
                  {/* Icon Container with subtle glow */}
                  <View style={[styles.iconContainer, { borderColor: difficultyColor + '40' }]}>
                    <Ionicons name={scenarioIcon} size={28} color={colors.text.primary} />
                  </View>

                  {/* Scenario Info */}
                  <View style={styles.scenarioInfo}>
                    <View style={styles.scenarioTitleRow}>
                      <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                      {isRecommended && (
                        <View style={styles.recommendedBadge}>
                          <Ionicons name="star" size={10} color={colors.warning.DEFAULT} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.scenarioDescription} numberOfLines={2}>
                      {scenario.description}
                    </Text>

                    {/* Match reason and difficulty */}
                    <View style={styles.metaRow}>
                      <View style={styles.difficultyRow}>
                        <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
                        <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                          {scenario.difficulty}
                        </Text>
                      </View>
                      {scenario.matchReason && (
                        <Text style={styles.matchReasonText}>
                          {scenario.matchReason}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Call arrow */}
                  <View style={styles.callArrow}>
                    <Ionicons name="call" size={20} color={colors.primary.DEFAULT} />
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  callIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Accent Selector - Premium Style
  accentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  accentButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accentFlag: {
    fontSize: 24,
  },
  accentLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accentButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  accentDropdown: {
    marginTop: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  accentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  accentOptionLast: {
    borderBottomWidth: 0,
  },
  accentOptionActive: {
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
  },
  accentOptionPressed: {
    backgroundColor: 'rgba(0, 54, 255, 0.05)',
  },
  accentOptionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  accentOptionTextActive: {
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.semibold,
  },

  // Difficulty Filter
  filterContainer: {
    paddingVertical: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
  },

  // Scenarios List
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Scenario Card - Premium Dark Style
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  scenarioCardRecommended: {
    borderColor: colors.primary.DEFAULT + '40',
    backgroundColor: colors.background.card,
  },
  scenarioCardPressed: {
    backgroundColor: colors.background.elevated,
    transform: [{ scale: 0.98 }],
  },

  // Icon Container
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // Scenario Info
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  recommendedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.warning.DEFAULT + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },

  // Meta Row (difficulty + match reason)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Difficulty Indicator
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },

  // Match Reason
  matchReasonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },

  // Call Arrow
  callArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 54, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
