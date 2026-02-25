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
import type { ConversationFeedback, DetailedStrength, DetailedImprovement } from '@/lib/db/conversations';
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
  overallMessage: string;
  strengths: string[];
  improvements: string[];
  detailedStrengths: DetailedStrength[];
  detailedImprovements: DetailedImprovement[];
  newVocabulary: string[];
  vocabUsed: string[];
  vocabMissed: string[];
}

// =============================================================================
// Feedback Generation
// =============================================================================

const FEEDBACK_SYSTEM_PROMPT = `You are an expert language proficiency evaluator for the Vox language learning app. You analyze voice conversation transcripts between a language learner and an AI tutor.

Your tone is professional and direct — like a respected coach, not a cheerleader. Be specific about what they did well and what to work on. Never use generic praise ("Great job!"), hype language ("AMAZING!"), or condescending encouragement ("Don't worry!"). Every strength must reference a specific skill. Every improvement must include an actionable suggestion.

Score accurately — don't inflate scores to be nice, but recognize genuine effort and progress.

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
  "overallMessage": "<1 sentence professional assessment, e.g. 'Solid performance. A few areas to refine.' — direct, no hype>",
  "strengths": ["<strength 1 as simple string>", "<strength 2>"],
  "improvements": ["<improvement 1 as simple string>", "<improvement 2>"],
  "detailedStrengths": [
    {
      "text": "<specific skill-referenced strength, 8-15 words, e.g. 'Accurate use of conditional tense in negotiation phrases.'>",
      "skill": "<one of: grammar, pronunciation, vocabulary, fluency, register, comprehension>"
    }
  ],
  "detailedImprovements": [
    {
      "area": "<short label, 2-4 words, e.g. 'Subjunctive mood'>",
      "suggestion": "<actionable suggestion, 10-20 words, e.g. 'Practice forming subjunctive clauses when expressing hypotheticals in formal settings.'>",
      "priority": "<one of: focus (high impact, address first), practice (moderate, improve over time), polish (minor refinement)>",
      "example": {
        "incorrect": "<optional: what the learner said wrong>",
        "correct": "<optional: the correct form>",
        "tip": "<optional: a practical tip if no before/after applies>"
      }
    }
  ],
  "newVocabulary": ["<new word learner used correctly for the first time>"],
  "vocabUsed": ["<words from pre-call vocab that learner actually used>"],
  "vocabMissed": ["<words from pre-call vocab that learner did NOT use or struggled with>"]
}

## Tone Rules for Feedback Text
- detailedStrengths: Each must reference a SPECIFIC skill (grammar pattern, pronunciation, vocabulary choice, register). Never generic ("Good job overall").
- detailedImprovements: 1-3 items max. Include "focus" priority only for high-impact issues. Include example.incorrect/correct when applicable.
- overallMessage: 1 sentence, professional, factual. Examples: "You handled this scenario well. A few areas to refine." / "Strong vocabulary range. Work on verb conjugation consistency."
- 2-4 detailedStrengths, 1-3 detailedImprovements.`;

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
      overallMessage: result.overallMessage || result.summary || 'Conversation analyzed.',
      detailedStrengths: result.detailedStrengths || [],
      detailedImprovements: result.detailedImprovements || [],
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
