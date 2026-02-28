/**
 * AI Practice Content Generator
 *
 * Generates personalized practice content for all modes (reading, writing, listening).
 * Uses a waterfall strategy for vocabulary source:
 * 1. Staircase content (Supabase — authenticated users with active path)
 * 2. Word bank (SQLite — populated after onboarding via initialVocabGenerator)
 * 3. Onboarding store (Zustand — minimal fallback for profile data)
 *
 * Flow: Vocab source + profile → Gemini → Structured practice content
 */

import { generateJSON } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { getStairContent, getStaircaseParams, getStairsForHome } from '@/lib/db/learningPaths';
import { getWordsByPriority, getWordCount } from '@/lib/word-bank/storage';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// Types
// =============================================================================

export interface ReadingPassage {
  title: string;
  passage: string;
  translation?: string;
  wordCount: number;
  difficulty: string;
  targetVocabulary: string[];
  comprehensionQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface WritingPrompt {
  title: string;
  scenario: string;
  prompt: string;
  keyPhrases: string[];
  wordCountTarget: number;
  exampleOpener: string;
  rubric: string[];
}

export interface ListeningExercise {
  title: string;
  sentences: {
    text: string;
    translation: string;
    slowText?: string;
  }[];
  vocabulary: {
    word: string;
    translation: string;
    phonetic?: string;
  }[];
  comprehensionQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface PracticeContent {
  reading: ReadingPassage | null;
  writing: WritingPrompt | null;
  listening: ListeningExercise | null;
  generatedAt: string;
  stairStepId: string | null;
}

/** Resolved vocabulary + profile data for content generation */
interface VocabAndProfile {
  vocabWords: string[];
  vocabWithTranslations: { word: string; translation: string }[];
  profile: {
    target_language: string;
    native_language: string;
    proficiency_level: string;
    motivation: string;
  };
  source: 'staircase' | 'word_bank' | 'onboarding';
  grammarPoints?: string[];
  scenarioContext?: string;
}

// =============================================================================
// Cache
// =============================================================================

const CACHE_KEY = 'vox_practice_content';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

async function getCachedContent(userId: string): Promise<PracticeContent | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - new Date(cached.generatedAt).getTime() > CACHE_TTL_MS) {
      return null; // Expired
    }
    return cached;
  } catch {
    return null;
  }
}

async function setCachedContent(userId: string, content: PracticeContent): Promise<void> {
  try {
    await AsyncStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(content));
  } catch {
    // Non-critical, continue
  }
}

// =============================================================================
// Vocab + Profile Resolution (Waterfall)
// =============================================================================

/**
 * Get the user's current stair step ID (the one they're working on).
 */
export async function getCurrentStairStepId(userId: string): Promise<string | null> {
  try {
    const stairs = await getStairsForHome(userId);
    const current = stairs.find(s => s.status === 'current');
    return current?.id || stairs[0]?.id || null;
  } catch {
    return null;
  }
}

/**
 * Extract vocabulary words from stair content (handles various formats).
 */
function extractVocabWords(vocabulary: any[]): string[] {
  return vocabulary
    .slice(0, 25)
    .map((v: any) => {
      if (typeof v === 'string') return v;
      return v.word || v.term || v.text || '';
    })
    .filter(Boolean);
}

/**
 * Extract vocabulary with translations from stair content.
 */
function extractVocabWithTranslations(vocabulary: any[]): { word: string; translation: string }[] {
  return vocabulary
    .slice(0, 15)
    .map((v: any) => {
      if (typeof v === 'string') return { word: v, translation: '' };
      return {
        word: v.word || v.term || v.text || '',
        translation: v.translation || v.meaning || v.definition || '',
      };
    })
    .filter(item => item.word);
}

/**
 * Resolve vocabulary and profile data using a waterfall strategy:
 * 1. Staircase content (authenticated users with active path)
 * 2. Word bank (populated after onboarding)
 * 3. Onboarding store (minimal fallback)
 */
async function getVocabAndProfile(
  userId: string,
  stairStepId?: string | null
): Promise<VocabAndProfile | null> {
  // ── Tier 1: Try staircase path ──────────────────────
  const stepId = stairStepId || await getCurrentStairStepId(userId);
  if (stepId) {
    try {
      const [content, params] = await Promise.all([
        getStairContent(stepId),
        getStaircaseParams(userId),
      ]);

      if (content && params) {
        const vocabWords = extractVocabWords(content.vocabulary);
        const vocabWithTranslations = extractVocabWithTranslations(content.vocabulary);
        const grammarPoints = (content.grammar_points || []).slice(0, 5);
        const scenarios = (content.scenarios || []).slice(0, 3);
        const scenarioContext = scenarios
          .map((s: any) => (typeof s === 'string' ? s : s.title || s.description || ''))
          .filter(Boolean)
          .join('; ');

        if (vocabWords.length > 0) {
          return {
            vocabWords,
            vocabWithTranslations,
            profile: {
              target_language: params.target_language,
              native_language: params.native_language,
              proficiency_level: params.proficiency_level,
              motivation: params.motivation,
            },
            source: 'staircase',
            grammarPoints,
            scenarioContext,
          };
        }
      }
    } catch {
      // Fall through to word bank
    }
  }

  // ── Tier 2: Try word bank ───────────────────────────
  try {
    const wordCount = await getWordCount();
    if (wordCount >= 10) {
      const bankWords = await getWordsByPriority(25);
      const vocabWords = bankWords.map(w => w.word);
      const vocabWithTranslations = bankWords.slice(0, 15).map(w => ({
        word: w.word,
        translation: w.translation,
      }));

      // Get profile from onboarding store (non-hook access)
      const profile = getProfileFromOnboarding();
      if (profile) {
        return {
          vocabWords,
          vocabWithTranslations,
          profile,
          source: 'word_bank',
        };
      }
    }
  } catch {
    // Fall through to onboarding
  }

  // ── Tier 3: Onboarding store only ───────────────────
  const profile = getProfileFromOnboarding();
  if (profile) {
    return {
      vocabWords: [],
      vocabWithTranslations: [],
      profile,
      source: 'onboarding',
    };
  }

  return null;
}

/**
 * Get user profile from V3 onboarding Zustand store (non-hook access).
 */
function getProfileFromOnboarding(): VocabAndProfile['profile'] | null {
  try {
    const state = useOnboardingV3.getState();
    if (!state.target_language) return null;

    return {
      target_language: state.target_language,
      native_language: state.native_language || 'english',
      proficiency_level: state.proficiency_level || 'starting_fresh',
      motivation: state.goal || 'general communication',
    };
  } catch {
    return null;
  }
}

// =============================================================================
// Content Generation
// =============================================================================

/**
 * Generate a reading passage using resolved vocab + profile.
 */
export async function generateReadingContent(
  userId: string,
  stairStepId?: string
): Promise<ReadingPassage | null> {
  try {
    const data = await getVocabAndProfile(userId, stairStepId);
    if (!data || data.vocabWords.length === 0) return null;

    const prompt = `Generate a reading passage for a language learner.

## Target Language: ${sanitizePromptInput(data.profile.target_language)}
## Native Language: ${sanitizePromptInput(data.profile.native_language)}
## Level: ${sanitizePromptInput(data.profile.proficiency_level)}
## Motivation: ${sanitizePromptInput(data.profile.motivation)}

## Vocabulary to Include (use at least 8 of these words naturally):
${data.vocabWords.join(', ')}

${data.grammarPoints?.length ? `## Grammar to Practice:\n${data.grammarPoints.join(', ')}` : ''}

## Requirements:
- Write the passage IN THE TARGET LANGUAGE (${data.profile.target_language})
- 120-250 words depending on proficiency level
- Professional/realistic context matching learner motivation
- Include a full translation of the passage in the native language (${data.profile.native_language})
- Include 3 comprehension questions (in the native language: ${data.profile.native_language})
- Each question has 4 options with one correct answer
- Questions test understanding, not translation

## Response Format (JSON only):
{
  "title": "Title of passage (in target language)",
  "passage": "The full reading passage in target language...",
  "translation": "Full translation of the passage in native language...",
  "wordCount": 180,
  "difficulty": "intermediate",
  "targetVocabulary": ["word1", "word2"],
  "comprehensionQuestions": [
    {
      "question": "What did the character do? (in native language)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}`;

    const result = await generateJSON<ReadingPassage>(prompt);
    if (!result?.passage) return null;
    return result;
  } catch (error) {
    console.error('[PracticeGenerator] Reading generation failed:', error);
    return null;
  }
}

/**
 * Generate a writing prompt using resolved vocab + profile.
 */
export async function generateWritingContent(
  userId: string,
  stairStepId?: string
): Promise<WritingPrompt | null> {
  try {
    const data = await getVocabAndProfile(userId, stairStepId);
    if (!data || data.vocabWords.length === 0) return null;

    const prompt = `Generate a writing exercise for a language learner.

## Target Language: ${sanitizePromptInput(data.profile.target_language)}
## Native Language: ${sanitizePromptInput(data.profile.native_language)}
## Level: ${sanitizePromptInput(data.profile.proficiency_level)}
## Motivation: ${sanitizePromptInput(data.profile.motivation)}
## Scenario Context: ${sanitizePromptInput(data.scenarioContext || 'general conversation')}

## Vocabulary to Practice:
${data.vocabWords.join(', ')}

## Requirements:
- Create a realistic writing scenario the learner might face
- Provide a clear prompt explaining what they need to write
- Include 4-6 key phrases they should try to use
- Set an appropriate word count target for their level
- Provide an example opening sentence in the target language
- Include a rubric (3-4 criteria) for self-evaluation
- All instructions in native language (${data.profile.native_language})
- Key phrases and example opener in target language (${data.profile.target_language})

## Response Format (JSON only):
{
  "title": "Writing task title (in native language)",
  "scenario": "Context: You are writing a... (native language)",
  "prompt": "Write a message/email/note that... (native language)",
  "keyPhrases": ["phrase in target lang", "phrase 2"],
  "wordCountTarget": 80,
  "exampleOpener": "Opening sentence example in target language...",
  "rubric": ["Uses at least 4 key phrases", "Clear structure", "Appropriate register"]
}`;

    const result = await generateJSON<WritingPrompt>(prompt);
    if (!result?.prompt) return null;
    return result;
  } catch (error) {
    console.error('[PracticeGenerator] Writing generation failed:', error);
    return null;
  }
}

/**
 * Generate a listening exercise using resolved vocab + profile.
 */
export async function generateListeningContent(
  userId: string,
  stairStepId?: string
): Promise<ListeningExercise | null> {
  try {
    const data = await getVocabAndProfile(userId, stairStepId);
    if (!data || data.vocabWithTranslations.length === 0) return null;

    const prompt = `Generate a listening comprehension exercise for a language learner.

## Target Language: ${sanitizePromptInput(data.profile.target_language)}
## Native Language: ${sanitizePromptInput(data.profile.native_language)}
## Level: ${sanitizePromptInput(data.profile.proficiency_level)}

## Vocabulary:
${data.vocabWithTranslations.map(v => `${v.word} (${v.translation})`).join(', ')}

## Requirements:
- Create 5 sentences in the TARGET language using the vocabulary
- Include translations in the native language
- Create 3 comprehension questions about the sentences (in native language)
- Each question has 4 options with one correct answer
- Questions test listening comprehension
- Include vocabulary list with translations

## Response Format (JSON only):
{
  "title": "Listening exercise title (native language)",
  "sentences": [
    { "text": "Sentence in target language", "translation": "Translation in native language" }
  ],
  "vocabulary": [
    { "word": "word", "translation": "translation", "phonetic": "/phonetic/" }
  ],
  "comprehensionQuestions": [
    {
      "question": "Question in native language",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ]
}`;

    const result = await generateJSON<ListeningExercise>(prompt);
    if (!result?.sentences) return null;
    return result;
  } catch (error) {
    console.error('[PracticeGenerator] Listening generation failed:', error);
    return null;
  }
}

/**
 * Generate all practice content for a user. Uses cache if available.
 */
export async function generateAllPracticeContent(
  userId: string,
  forceRefresh: boolean = false
): Promise<PracticeContent> {
  // Check cache first
  if (!forceRefresh) {
    const cached = await getCachedContent(userId);
    if (cached) return cached;
  }

  const stairStepId = await getCurrentStairStepId(userId);

  // Generate all content in parallel
  const [reading, writing, listening] = await Promise.all([
    generateReadingContent(userId, stairStepId || undefined),
    generateWritingContent(userId, stairStepId || undefined),
    generateListeningContent(userId, stairStepId || undefined),
  ]);

  const content: PracticeContent = {
    reading,
    writing,
    listening,
    generatedAt: new Date().toISOString(),
    stairStepId,
  };

  // Cache the result
  await setCachedContent(userId, content);

  return content;
}
