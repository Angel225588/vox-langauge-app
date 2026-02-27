/**
 * Initial Vocabulary Generator
 *
 * Generates 80-100 core vocabulary words via a single Gemini call
 * after onboarding. These words feed ALL practice modes (reading,
 * writing, listening, voice) and form the foundation of the user's
 * word bank.
 *
 * Level adjustments:
 * - starting_fresh/basics: Simple forms, present tense, phonetic guidance
 * - conversational: Past/future tenses, less hand-holding
 * - confident/near_fluent: Idioms, slang, formal vs informal register
 */

import { generateJSON } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { addOrReinforceWord } from '@/lib/word-bank/storage';
import { getWordCount } from '@/lib/word-bank/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AddWordInput, CEFRLevel, PartOfSpeech } from '@/lib/word-bank/types';

// ============================================================================
// Types
// ============================================================================

interface VocabEntry {
  word: string;
  translation: string;
  phonetic: string;
  part_of_speech: string;
  example_sentence: string;
  example_translation: string;
  category: string;
  cefr_level: string;
  usage_note?: string;
}

interface GeminiVocabResponse {
  vocabulary: VocabEntry[];
}

interface InitialVocabInput {
  target_language: string;
  native_language: string;
  proficiency_level: string;
  profession?: string;
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_KEY_PREFIX = 'vox_initial_vocab_generated_';
const VALID_CEFR: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const PART_OF_SPEECH_MAP: Record<string, PartOfSpeech> = {
  verb: 'verb',
  noun: 'noun',
  adjective: 'adjective',
  adverb: 'adverb',
  phrase: 'phrase',
  connector: 'phrase',
  idiom: 'phrase',
  other: 'other',
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a stable cache key from language + level.
 * Uses a simple hash so we don't re-generate on restart.
 */
function getCacheKey(input: InitialVocabInput): string {
  const raw = `${input.target_language}_${input.proficiency_level}`.toLowerCase();
  return `${CACHE_KEY_PREFIX}${raw}`;
}

/**
 * Map proficiency level to CEFR range for the Gemini prompt.
 */
function getCefrRange(level: string): string {
  switch (level) {
    case 'starting_fresh':
      return 'A1 only';
    case 'basics':
      return 'A1-A2';
    case 'conversational':
      return 'A2-B1';
    case 'confident':
      return 'B1-B2';
    case 'near_fluent':
      return 'B2-C1';
    default:
      return 'A1-A2';
  }
}

/**
 * Map proficiency level to complexity instructions for Gemini.
 */
function getLevelInstructions(level: string): string {
  switch (level) {
    case 'starting_fresh':
      return `- Use only present tense verb forms
- Include phonetic guidance using native-language approximation
- Keep example sentences to 3-5 words
- Focus on survival phrases and basic greetings
- 90% A1 words, 10% A2`;
    case 'basics':
      return `- Use present and simple past tense
- Include IPA phonetic transcription
- Keep example sentences to 5-8 words
- Include common question forms
- 70% A1, 30% A2`;
    case 'conversational':
      return `- Include past, present, and future tenses
- Include common phrasal verbs and collocations
- Example sentences can be 8-12 words
- Include polite vs casual register
- 40% A2, 50% B1, 10% B2`;
    case 'confident':
      return `- Include complex verb tenses and moods
- Include idioms and slang (5-10 entries)
- Include formal vs informal register
- Example sentences 10-15 words with natural phrasing
- 30% B1, 50% B2, 20% C1`;
    case 'near_fluent':
      return `- Focus on nuances, idioms, and register variation
- Include professional and colloquial expressions
- Include false friends and common mistakes at this level
- Natural, complex example sentences
- 20% B1, 40% B2, 40% C1`;
    default:
      return `- Use present tense, simple vocabulary
- Include phonetic guidance
- 80% A1, 20% A2`;
  }
}

/**
 * Sanitize and validate a CEFR level string from Gemini output.
 */
function normalizeCefr(raw: string): CEFRLevel {
  const upper = (raw || '').toUpperCase().trim();
  if (VALID_CEFR.includes(upper as CEFRLevel)) return upper as CEFRLevel;
  return 'A1';
}

/**
 * Normalize part of speech from Gemini output.
 */
function normalizePartOfSpeech(raw: string): PartOfSpeech {
  const lower = (raw || '').toLowerCase().trim();
  return PART_OF_SPEECH_MAP[lower] || 'other';
}

// ============================================================================
// Core Generation
// ============================================================================

/**
 * Build the Gemini prompt for initial vocabulary generation.
 */
function buildPrompt(input: InitialVocabInput): string {
  const { target_language, native_language, proficiency_level, profession } = input;

  return `Generate initial core vocabulary for a ${sanitizePromptInput(proficiency_level)} learner of ${sanitizePromptInput(target_language)}.
Native language: ${sanitizePromptInput(native_language)}
${profession ? `Profession: ${sanitizePromptInput(profession)} (for context only — generate CORE vocabulary everyone needs, not profession-specific terms)` : ''}

## CEFR Range: ${getCefrRange(proficiency_level)}

## Level-Specific Instructions:
${getLevelInstructions(proficiency_level)}

## Categories to Cover (distribute evenly):
1. **Greetings & introductions** (8-10 entries): Hello, How are you?, My name is..., Nice to meet you, Goodbye
2. **Common questions** (8-10 entries): Where is...?, How much...?, What time...?, Do you speak...?, Can I...?
3. **Essential verbs** (12-15 entries): to be, to have, to go, to want, to need, to know, to speak, to understand, to help, to make, to give, to come
4. **Polite phrases** (6-8 entries): Please, Thank you, Excuse me, Sorry, You're welcome, Could you...?
5. **Emergency/survival** (6-8 entries): I don't understand, Can you repeat?, I need help, Where is the bathroom?, I'm lost
6. **Time & numbers** (8-10 entries): Today, tomorrow, yesterday, morning, afternoon, night, now, later, 1-10
7. **Connectors** (6-8 entries): And, but, because, also, then, however, or, so
8. **Daily essentials** (10-12 entries): Water, food, money, phone, house, street, car, work, family, friend
9. **Common idioms/expressions** (5-8 entries): Natural expressions everyone uses in ${target_language}

## Total: Generate exactly 85 entries.

## Response Format (JSON only, no markdown):
{
  "vocabulary": [
    {
      "word": "word or phrase in ${target_language}",
      "translation": "translation in ${native_language}",
      "phonetic": "IPA or native-approximation pronunciation",
      "part_of_speech": "verb|noun|phrase|adjective|adverb|connector|idiom",
      "example_sentence": "natural sentence using the word in ${target_language}",
      "example_translation": "translation of the example in ${native_language}",
      "category": "greeting|question|verb|polite|emergency|time|connector|daily|idiom",
      "cefr_level": "A1|A2|B1|B2|C1",
      "usage_note": "brief context when/how to use (optional)"
    }
  ]
}`;
}

/**
 * Generate initial vocabulary via Gemini and store in the word bank.
 *
 * - Checks cache to avoid re-generation on restart
 * - Checks if word bank already has words (skip if populated)
 * - Calls Gemini for 80-100 core vocabulary entries
 * - Stores each word via addOrReinforceWord() (handles duplicates)
 * - Sets cache flag on success
 *
 * @returns Number of words added to the word bank
 */
export async function generateInitialVocabulary(
  input: InitialVocabInput
): Promise<number> {
  const cacheKey = getCacheKey(input);

  // 1. Check cache — already generated for this language+level combo
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached === 'true') {
      console.log('[InitialVocab] Already generated, skipping');
      return 0;
    }
  } catch {
    // Continue — cache check is non-critical
  }

  // 2. Check if word bank already has words (e.g. from previous session)
  try {
    const existingCount = await getWordCount();
    if (existingCount >= 50) {
      console.log(`[InitialVocab] Word bank already has ${existingCount} words, skipping`);
      await AsyncStorage.setItem(cacheKey, 'true');
      return 0;
    }
  } catch {
    // Continue — count check is non-critical
  }

  // 3. Generate via Gemini (85 entries ≈ 25KB JSON, needs higher token limit)
  console.log('[InitialVocab] Generating core vocabulary via Gemini...');
  const prompt = buildPrompt(input);
  const response = await generateJSON<GeminiVocabResponse>(prompt, {
    maxOutputTokens: 16384,
  });

  if (!response?.vocabulary || !Array.isArray(response.vocabulary)) {
    throw new Error('Gemini returned invalid vocabulary structure');
  }

  // 4. Store each word in the word bank
  let added = 0;
  const errors: string[] = [];

  for (const entry of response.vocabulary) {
    try {
      if (!entry.word || !entry.translation) continue;

      const wordInput: AddWordInput = {
        word: entry.word.trim(),
        translation: entry.translation.trim(),
        phonetic: entry.phonetic?.trim() || undefined,
        category: entry.category?.toLowerCase().trim() || 'general',
        cefrLevel: normalizeCefr(entry.cefr_level),
        partOfSpeech: normalizePartOfSpeech(entry.part_of_speech),
        source: 'lesson', // 'lesson' source marks onboarding vocab
        exampleSentences: entry.example_sentence
          ? [entry.example_sentence.trim()]
          : [],
        milestoneTags: ['onboarding'],
      };

      await addOrReinforceWord(wordInput);
      added++;
    } catch (err) {
      errors.push(`Failed to add "${entry.word}": ${err}`);
    }
  }

  // 5. Set cache flag
  if (added > 0) {
    try {
      await AsyncStorage.setItem(cacheKey, 'true');
    } catch {
      // Non-critical
    }
  }

  console.log(`[InitialVocab] Added ${added} words to bank (${errors.length} errors)`);
  if (errors.length > 0) {
    console.warn('[InitialVocab] Errors:', errors.slice(0, 5));
  }

  return added;
}

/**
 * Check if initial vocabulary has already been generated for a given config.
 */
export async function isInitialVocabGenerated(input: InitialVocabInput): Promise<boolean> {
  try {
    const cached = await AsyncStorage.getItem(getCacheKey(input));
    return cached === 'true';
  } catch {
    return false;
  }
}

/**
 * Clear the initial vocabulary generation cache (for testing or re-generation).
 */
export async function clearInitialVocabCache(input: InitialVocabInput): Promise<void> {
  try {
    await AsyncStorage.removeItem(getCacheKey(input));
  } catch {
    // Non-critical
  }
}
