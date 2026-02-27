/**
 * Post-Call Processor
 *
 * Orchestrates the full post-call flow after an ElevenLabs conversation ends:
 *   1. Save session + messages to Supabase
 *   2. Run AI feedback analysis (4 KPIs)
 *   3. Process vocabulary loop (FSRS updates)
 *   4. Update user AI memory with conversation insights
 *
 * Called from VoiceCallScreenElevenLabs.onComplete callback.
 */

import {
  saveConversationSession,
  updateSessionFeedback,
  updateSessionVocabResults,
} from '@/lib/db/conversations';
import { analyzeConversation } from '@/lib/ai/conversationFeedback';
import { processPostCallVocab } from '@/lib/voice/vocabLoop';
import { updateMemoryAfterLesson } from '@/lib/ai/userMemory';
import type { ElevenLabsMessage } from '@/lib/voice/elevenLabsTypes';
import type { ConversationFeedback } from '@/lib/db/conversations';

// =============================================================================
// Types
// =============================================================================

export interface PostCallInput {
  userId: string;
  messages: ElevenLabsMessage[];
  scenario: string;
  scenarioDescription?: string;
  voiceId?: string;
  accent?: string;
  proficiency: string;
  targetLanguage: string;
  durationSeconds: number;
  pointsEarned: number;
  elevenlabsConversationId?: string;
  stairStepId?: string;
  vocabPrepWords?: string[];
}

export interface PostCallResult {
  sessionId: string | null;
  feedback: ConversationFeedback | null;
  vocabStats: {
    wordsReinforced: number;
    wordsWeakened: number;
    wordsAdded: number;
  };
}

// =============================================================================
// Main Processor
// =============================================================================

/**
 * Process a completed voice conversation.
 * This is the single entry point called after every ElevenLabs call ends.
 *
 * Runs steps sequentially since each depends on the previous:
 * save → analyze → vocab loop → memory update
 */
export async function processPostCall(input: PostCallInput): Promise<PostCallResult> {
  const result: PostCallResult = {
    sessionId: null,
    feedback: null,
    vocabStats: { wordsReinforced: 0, wordsWeakened: 0, wordsAdded: 0 },
  };

  const userMessages = input.messages.filter((m) => m.role === 'user');
  const totalUserWords = userMessages.reduce((sum, m) => sum + m.content.split(' ').length, 0);

  // Step 1: Save session to Supabase
  try {
    result.sessionId = await saveConversationSession({
      userId: input.userId,
      elevenLabsConversationId: input.elevenlabsConversationId,
      scenario: input.scenario,
      scenarioDescription: input.scenarioDescription,
      voiceId: input.voiceId,
      accent: input.accent,
      proficiency: input.proficiency,
      targetLanguage: input.targetLanguage,
      startedAt: input.messages[0]?.timestamp || Date.now(),
      endedAt: Date.now(),
      durationSeconds: input.durationSeconds,
      turnCount: userMessages.length,
      userWordCount: totalUserWords,
      avgWordsPerTurn: userMessages.length > 0 ? totalUserWords / userMessages.length : 0,
      pointsEarned: input.pointsEarned,
      messages: input.messages,
      stairStepId: input.stairStepId,
      vocabPrepWords: input.vocabPrepWords,
    });

    console.log(`[PostCall] Step 1: Session saved (${result.sessionId})`);
  } catch (error) {
    console.error('[PostCall] Step 1 failed (session save):', error);
  }

  // Step 2: AI feedback analysis
  try {
    const analysis = await analyzeConversation({
      messages: input.messages,
      scenario: input.scenario,
      scenarioDescription: input.scenarioDescription,
      proficiency: input.proficiency,
      targetLanguage: input.targetLanguage,
      vocabPrepWords: input.vocabPrepWords,
    });

    if (analysis) {
      result.feedback = analysis.feedback;

      // Save feedback to session
      if (result.sessionId) {
        await updateSessionFeedback(result.sessionId, analysis.feedback);
        await updateSessionVocabResults(
          result.sessionId,
          analysis.vocabUsed,
          analysis.vocabMissed
        );
      }

      // Step 3: Process vocab loop (FSRS updates)
      try {
        result.vocabStats = await processPostCallVocab({
          vocabUsed: analysis.vocabUsed,
          vocabMissed: analysis.vocabMissed,
          newVocabulary: analysis.feedback.newVocabulary,
          targetLanguage: input.targetLanguage,
          scenario: input.scenario,
        });

        console.log(`[PostCall] Step 3: Vocab loop processed`, result.vocabStats);
      } catch (error) {
        console.error('[PostCall] Step 3 failed (vocab loop):', error);
      }

      console.log(`[PostCall] Step 2: Feedback generated`, {
        articulation: result.feedback.articulation,
        fluency: result.feedback.fluency,
        communication: result.feedback.communication,
        scenario: result.feedback.scenario,
      });
    }
  } catch (error) {
    console.error('[PostCall] Step 2 failed (feedback):', error);
  }

  // Step 4: Update user AI memory
  try {
    await updateMemoryAfterLesson(input.userId, {
      lesson_type: 'conversation',
      cards_good: result.feedback
        ? Math.round(
            (result.feedback.articulation +
              result.feedback.fluency +
              result.feedback.communication +
              result.feedback.scenario) /
              4
          )
        : 0,
      cards_total: 100,
      vocab_learned: [],
      time_spent: input.durationSeconds,
      conversation_messages: input.messages.filter(m => m.role === 'user').length,
    });

    console.log('[PostCall] Step 4: User memory updated');
  } catch (error) {
    console.error('[PostCall] Step 4 failed (memory):', error);
  }

  return result;
}
