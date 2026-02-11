/**
 * Conversation Feedback Engine
 *
 * Post-call analysis of ElevenLabs voice conversations.
 * Sends transcript to Claude for scoring on our 4 core KPIs:
 *   1. Articulation — Can they pronounce clearly?
 *   2. Fluency — Can they speak without excessive pausing?
 *   3. Communication — Can they express their meaning?
 *   4. Scenario Competency — Can they handle the real-world situation?
 *
 * Also extracts vocabulary usage for the FSRS feedback loop.
 */

import { generateJSON } from './claudeClient';
import { sanitizePromptInput } from './sanitize';
import type { ConversationFeedback } from '@/lib/db/conversations';
import type { ElevenLabsMessage } from '@/lib/voice/elevenLabsTypes';

// =============================================================================
// Types
// =============================================================================

interface FeedbackInput {
  /** Full conversation transcript */
  messages: ElevenLabsMessage[];
  /** Scenario the conversation was about */
  scenario: string;
  /** Scenario description for context */
  scenarioDescription?: string;
  /** User's proficiency level */
  proficiency: string;
  /** Target language being practiced */
  targetLanguage: string;
  /** Words shown to user before call (vocab prep) */
  vocabPrepWords?: string[];
}

interface RawFeedbackResponse {
  articulation: number;
  fluency: number;
  communication: number;
  scenario: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  newVocabulary: string[];
  vocabUsed: string[];
  vocabMissed: string[];
}

// =============================================================================
// Feedback Generation
// =============================================================================

const FEEDBACK_SYSTEM_PROMPT = `You are an expert language proficiency evaluator for the Vox language learning app. You analyze voice conversation transcripts between a language learner and an AI tutor.

Your evaluation must be professional, encouraging, and actionable. Score accurately — don't inflate scores to be nice, but recognize genuine effort and progress.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.`;

/**
 * Analyze a conversation transcript and generate feedback scores.
 *
 * Returns null if Claude is unavailable (graceful degradation).
 */
export async function analyzeConversation(
  input: FeedbackInput
): Promise<{ feedback: ConversationFeedback; vocabUsed: string[]; vocabMissed: string[] } | null> {
  const userMessages = input.messages.filter((m) => m.role === 'user');
  const aiMessages = input.messages.filter((m) => m.role === 'assistant');

  // Need at least 2 user messages for meaningful analysis
  if (userMessages.length < 2) {
    return getMinimalFeedback(input);
  }

  // Build transcript text
  const transcript = input.messages
    .map((m) => `${m.role === 'user' ? 'LEARNER' : 'TUTOR'}: ${m.content}`)
    .join('\n');

  const vocabPrepSection = input.vocabPrepWords?.length
    ? `\n## Pre-Call Vocabulary (words shown to learner before conversation)\n${input.vocabPrepWords.join(', ')}`
    : '';

  const prompt = `Analyze this ${sanitizePromptInput(input.targetLanguage)} language conversation between a learner (proficiency: ${sanitizePromptInput(input.proficiency)}) and an AI tutor.

## Scenario
${sanitizePromptInput(input.scenario)}${input.scenarioDescription ? ': ' + sanitizePromptInput(input.scenarioDescription) : ''}
${vocabPrepSection}

## Transcript
${transcript}

## Scoring Instructions

Rate each metric from 0-100 based on the learner's messages ONLY:

1. **articulation** (0-100): Spelling accuracy in transcript as proxy for pronunciation clarity. Consider: correct word forms, accent marks, proper spelling of target language words.

2. **fluency** (0-100): Response complexity and naturalness. Consider: sentence length variation, use of connectors, conversational flow, not just single-word answers.

3. **communication** (0-100): Did the learner express their intended meaning? Consider: relevance to conversation, ability to convey ideas, appropriate vocabulary usage, successful information exchange.

4. **scenario** (0-100): Did the learner handle the real-world scenario? Consider: appropriate register (formal/informal), scenario-specific vocabulary, task completion, cultural appropriateness.

## Response Format

Return this exact JSON structure:
{
  "articulation": <number 0-100>,
  "fluency": <number 0-100>,
  "communication": <number 0-100>,
  "scenario": <number 0-100>,
  "summary": "<1-2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<specific actionable improvement 1>", "<specific actionable improvement 2>"],
  "newVocabulary": ["<new word learner used correctly for the first time>"],
  "vocabUsed": ["<words from pre-call vocab that learner actually used>"],
  "vocabMissed": ["<words from pre-call vocab that learner did NOT use or struggled with>"]
}`;

  try {
    const result = await generateJSON<RawFeedbackResponse>(prompt, FEEDBACK_SYSTEM_PROMPT);

    if (!result) {
      return getMinimalFeedback(input);
    }

    // Clamp scores to 0-100
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

    const feedback: ConversationFeedback = {
      articulation: clamp(result.articulation),
      fluency: clamp(result.fluency),
      communication: clamp(result.communication),
      scenario: clamp(result.scenario),
      summary: result.summary || 'Conversation analyzed.',
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      newVocabulary: result.newVocabulary || [],
    };

    return {
      feedback,
      vocabUsed: result.vocabUsed || [],
      vocabMissed: result.vocabMissed || [],
    };
  } catch (error) {
    console.error('[ConversationFeedback] Analysis failed:', error);
    return getMinimalFeedback(input);
  }
}

/**
 * Generate minimal feedback when Claude is unavailable or transcript is too short.
 * Uses heuristics from transcript data.
 */
function getMinimalFeedback(
  input: FeedbackInput
): { feedback: ConversationFeedback; vocabUsed: string[]; vocabMissed: string[] } {
  const userMessages = input.messages.filter((m) => m.role === 'user');
  const totalWords = userMessages.reduce((sum, m) => sum + m.content.split(' ').length, 0);
  const avgWords = userMessages.length > 0 ? totalWords / userMessages.length : 0;

  // Heuristic scores based on engagement metrics
  const engagementScore = Math.min(100, userMessages.length * 12);
  const verbosityScore = Math.min(100, avgWords * 10);
  const baseScore = Math.round((engagementScore + verbosityScore) / 2);

  return {
    feedback: {
      articulation: baseScore,
      fluency: baseScore,
      communication: baseScore,
      scenario: baseScore,
      summary: userMessages.length < 2
        ? 'Conversation was too short for detailed analysis. Try speaking more next time!'
        : 'Basic analysis completed. Detailed feedback requires AI evaluation.',
      strengths: userMessages.length >= 2 ? ['You participated in the conversation'] : [],
      improvements: ['Try to speak more and use longer sentences'],
      newVocabulary: [],
    },
    vocabUsed: [],
    vocabMissed: input.vocabPrepWords || [],
  };
}
