/**
 * AI Practice Content Generator
 *
 * Generates personalized practice content for all modes (reading, writing, listening)
 * from the user's current stair content and profile. No pre-seeded library needed —
 * Gemini creates everything on-the-fly based on onboarding data.
 *
 * Flow: User stair vocab/grammar + profile → Gemini → Structured practice content
 */

import { generateJSON } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { getStairContent, getStaircaseParams, getStairsForHome } from '@/lib/db/learningPaths';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// Types
// =============================================================================

export interface ReadingPassage {
  title: string;
  passage: string;
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
// Helpers
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

// =============================================================================
// Content Generation
// =============================================================================

/**
 * Generate a reading passage based on user's current stair vocabulary and grammar.
 */
export async function generateReadingContent(
  userId: string,
  stairStepId?: string
): Promise<ReadingPassage | null> {
  try {
    const stepId = stairStepId || await getCurrentStairStepId(userId);
    if (!stepId) return null;

    const [content, params] = await Promise.all([
      getStairContent(stepId),
      getStaircaseParams(userId),
    ]);

    if (!content || !params) return null;

    const vocabWords = extractVocabWords(content.vocabulary);
    const grammarPoints = (content.grammar_points || []).slice(0, 5);

    const prompt = `Generate a reading passage for a language learner.

## Target Language: ${sanitizePromptInput(params.target_language)}
## Native Language: ${sanitizePromptInput(params.native_language)}
## Level: ${sanitizePromptInput(params.proficiency_level)}
## Motivation: ${sanitizePromptInput(params.motivation)}

## Vocabulary to Include (use at least 8 of these words naturally):
${vocabWords.join(', ')}

## Grammar to Practice:
${grammarPoints.join(', ')}

## Requirements:
- Write the passage IN THE TARGET LANGUAGE (${params.target_language})
- 120-250 words depending on proficiency level
- Professional/realistic context matching learner motivation
- Include 3 comprehension questions (in the native language: ${params.native_language})
- Each question has 4 options with one correct answer
- Questions test understanding, not translation

## Response Format (JSON only):
{
  "title": "Title of passage (in target language)",
  "passage": "The full reading passage in target language...",
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
 * Generate a writing prompt based on user's stair scenarios and profile.
 */
export async function generateWritingContent(
  userId: string,
  stairStepId?: string
): Promise<WritingPrompt | null> {
  try {
    const stepId = stairStepId || await getCurrentStairStepId(userId);
    if (!stepId) return null;

    const [content, params] = await Promise.all([
      getStairContent(stepId),
      getStaircaseParams(userId),
    ]);

    if (!content || !params) return null;

    const vocabWords = extractVocabWords(content.vocabulary);
    const scenarios = (content.scenarios || []).slice(0, 3);
    const scenarioContext = scenarios.map((s: any) =>
      typeof s === 'string' ? s : s.title || s.description || ''
    ).filter(Boolean).join('; ');

    const prompt = `Generate a writing exercise for a language learner.

## Target Language: ${sanitizePromptInput(params.target_language)}
## Native Language: ${sanitizePromptInput(params.native_language)}
## Level: ${sanitizePromptInput(params.proficiency_level)}
## Motivation: ${sanitizePromptInput(params.motivation)}
## Scenario Context: ${sanitizePromptInput(scenarioContext || 'general conversation')}

## Vocabulary to Practice:
${vocabWords.join(', ')}

## Requirements:
- Create a realistic writing scenario the learner might face
- Provide a clear prompt explaining what they need to write
- Include 4-6 key phrases they should try to use
- Set an appropriate word count target for their level
- Provide an example opening sentence in the target language
- Include a rubric (3-4 criteria) for self-evaluation
- All instructions in native language (${params.native_language})
- Key phrases and example opener in target language (${params.target_language})

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
 * Generate a listening exercise from user's stair vocabulary.
 */
export async function generateListeningContent(
  userId: string,
  stairStepId?: string
): Promise<ListeningExercise | null> {
  try {
    const stepId = stairStepId || await getCurrentStairStepId(userId);
    if (!stepId) return null;

    const [content, params] = await Promise.all([
      getStairContent(stepId),
      getStaircaseParams(userId),
    ]);

    if (!content || !params) return null;

    const vocabItems = extractVocabWithTranslations(content.vocabulary);

    const prompt = `Generate a listening comprehension exercise for a language learner.

## Target Language: ${sanitizePromptInput(params.target_language)}
## Native Language: ${sanitizePromptInput(params.native_language)}
## Level: ${sanitizePromptInput(params.proficiency_level)}

## Vocabulary:
${vocabItems.map(v => `${v.word} (${v.translation})`).join(', ')}

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
