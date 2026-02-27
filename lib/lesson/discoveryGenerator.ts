/**
 * Discovery Lesson Content Generator
 *
 * Generates personalized content for the discovery lesson — the MOST
 * important lesson in the app. This is where users decide if they stay.
 *
 * Architecture:
 * - Vocabulary activity: pulls directly from word bank (no AI cost)
 * - Listening/Reading/Writing: Gemini generates content using word bank words
 * - Voice call: prepares scenario context (no upfront Gemini call)
 *
 * Content is generated per-activity in waterfall order matching the
 * lesson template for the user's level:
 *   Beginner:     Vocabulary → Listening → Voice (30s)
 *   Intermediate: Listening → Reading → Voice (60s)
 *   Advanced:     Reading → Voice (90s) → Writing
 *
 * Error strategy: if any AI generation fails, fall back to template-based
 * content so the user is never blocked.
 */

import { generateJSON } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { getWordsByPriority, getWords, getWordCount } from '@/lib/word-bank/storage';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LessonPlan, LessonActivity } from './lessonEngine';
import type { BankWord } from '@/lib/word-bank/types';

// ─── Types ────────────────────────────────────────────

export interface VocabularyContent {
  type: 'vocabulary';
  words: VocabWord[];
  categories: VocabCategory[];
}

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  partOfSpeech: string;
  category: string;
  exampleSentence?: string;
}

export interface VocabCategory {
  name: string;
  count: number;
}

export interface ListeningContent {
  type: 'listening';
  title: string;
  dialogue: DialogueLine[];
  vocabulary: ListeningVocab[];
  comprehensionQuestions: ComprehensionQuestion[];
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation: string;
}

export interface ListeningVocab {
  word: string;
  translation: string;
  phonetic?: string;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ReadingContent {
  type: 'reading';
  title: string;
  passage: string;
  wordCount: number;
  targetVocabulary: string[];
  comprehensionQuestions: ComprehensionQuestion[];
}

export interface WritingContent {
  type: 'writing';
  title: string;
  scenario: string;
  prompt: string;
  keyPhrases: string[];
  wordCountTarget: number;
  exampleOpener: string;
}

export interface VoiceCallContent {
  type: 'voice_call';
  scenarioTitle: string;
  scenarioDescription: string;
  suggestedTopics: string[];
  keyVocabulary: string[];
  durationSeconds: number;
}

export type ActivityContent =
  | VocabularyContent
  | ListeningContent
  | ReadingContent
  | WritingContent
  | VoiceCallContent;

export interface DiscoveryLessonContent {
  activities: Record<string, ActivityContent>;
  generatedAt: string;
  planId: string;
}

// ─── User Profile (non-hook access) ──────────────────

interface UserProfile {
  targetLanguage: string;
  nativeLanguage: string;
  proficiencyLevel: string;
  goal: string;
  profession: string;
  scenarios: string[];
  firstName: string;
}

function getUserProfile(): UserProfile | null {
  try {
    const state = useOnboardingV3.getState();
    if (!state.target_language) return null;

    return {
      targetLanguage: state.target_language,
      nativeLanguage: state.native_language || 'english',
      proficiencyLevel: state.proficiency_level || 'starting_fresh',
      goal: state.goal || 'general communication',
      profession: state.profession || state.profession_custom || '',
      scenarios: [...state.scenarios, ...state.custom_scenarios],
      firstName: state.first_name || '',
    };
  } catch {
    return null;
  }
}

// ─── Cache ────────────────────────────────────────────

const CACHE_PREFIX = 'vox_discovery_content_';

async function getCachedContent(planId: string): Promise<DiscoveryLessonContent | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${planId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function setCachedContent(planId: string, content: DiscoveryLessonContent): Promise<void> {
  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${planId}`, JSON.stringify(content));
  } catch {
    // Non-critical
  }
}

// ─── Word Bank Helpers ────────────────────────────────

async function getDiscoveryWords(wordCount: number): Promise<BankWord[]> {
  try {
    const count = await getWordCount();
    if (count === 0) return [];

    // Get high-priority words for the lesson
    return await getWordsByPriority(wordCount);
  } catch {
    return [];
  }
}

function groupByCategory(words: BankWord[]): VocabCategory[] {
  const counts: Record<string, number> = {};
  for (const w of words) {
    const cat = w.category || 'general';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function bankWordsToVocab(words: BankWord[]): VocabWord[] {
  return words.map((w) => ({
    id: w.id,
    word: w.word,
    translation: w.translation,
    phonetic: w.phonetic,
    partOfSpeech: w.partOfSpeech,
    category: w.category || 'general',
    exampleSentence: w.exampleSentences?.[0],
  }));
}

// ─── Activity Content Generators ──────────────────────

/**
 * Vocabulary activity — no AI call needed.
 * Pulls directly from the word bank, grouped by category.
 */
async function generateVocabularyContent(
  activity: LessonActivity,
): Promise<VocabularyContent> {
  const wordCount =
    activity.config.type === 'vocabulary' ? activity.config.word_count : 5;

  const bankWords = await getDiscoveryWords(wordCount);

  return {
    type: 'vocabulary',
    words: bankWordsToVocab(bankWords),
    categories: groupByCategory(bankWords),
  };
}

/**
 * Listening activity — Gemini generates a short dialogue using word bank vocab.
 */
async function generateListeningContent(
  activity: LessonActivity,
  profile: UserProfile,
  words: BankWord[],
): Promise<ListeningContent> {
  const sentenceCount =
    activity.config.type === 'listening' ? activity.config.sentence_count : 5;

  const vocabList = words
    .slice(0, 15)
    .map((w) => `${w.word} (${w.translation})`)
    .join(', ');

  const scenarioContext =
    profile.scenarios.length > 0
      ? profile.scenarios.slice(0, 2).join(', ')
      : profile.goal;

  const prompt = `Generate a listening comprehension exercise for a language learner.

## Context
This is the user's FIRST lesson. Keep it encouraging and achievable.
${profile.firstName ? `The learner's name is ${sanitizePromptInput(profile.firstName)}.` : ''}

## Target Language: ${sanitizePromptInput(profile.targetLanguage)}
## Native Language: ${sanitizePromptInput(profile.nativeLanguage)}
## Level: ${sanitizePromptInput(profile.proficiencyLevel)}
## Scenario: ${sanitizePromptInput(scenarioContext)}
${profile.profession ? `## Profession: ${sanitizePromptInput(profile.profession)}` : ''}

## Vocabulary to include (use at least 5 naturally):
${vocabList}

## Requirements:
- Create a dialogue between 2 people with ${sentenceCount} exchanges
- Write the dialogue IN THE TARGET LANGUAGE (${profile.targetLanguage})
- The scenario should feel realistic and relate to the learner's context
- Include translations for each line in the native language (${profile.nativeLanguage})
- Add 3 comprehension questions in the native language
- Each question has 4 options with one correct answer
- Include a vocabulary list with the key words used

## Response Format (JSON only):
{
  "title": "Dialogue title (in native language)",
  "dialogue": [
    { "speaker": "Speaker A", "text": "Line in target language", "translation": "Translation" }
  ],
  "vocabulary": [
    { "word": "word", "translation": "translation", "phonetic": "/phonetic/" }
  ],
  "comprehensionQuestions": [
    {
      "question": "Question in native language?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ]
}`;

  try {
    const result = await generateJSON<Omit<ListeningContent, 'type'>>(prompt);
    if (!result?.dialogue?.length) throw new Error('Empty dialogue');

    return { type: 'listening', ...result };
  } catch (error) {
    console.warn('[DiscoveryGenerator] Listening generation failed, using fallback:', error);
    return createFallbackListeningContent(profile, words);
  }
}

/**
 * Reading activity — Gemini generates a passage using word bank vocab.
 */
async function generateReadingContent(
  activity: LessonActivity,
  profile: UserProfile,
  words: BankWord[],
): Promise<ReadingContent> {
  const targetWordCount =
    activity.config.type === 'reading' ? activity.config.word_count : 150;
  const questionCount =
    activity.config.type === 'reading' ? activity.config.question_count : 3;

  const vocabWords = words.slice(0, 15).map((w) => w.word).join(', ');

  const scenarioContext =
    profile.scenarios.length > 0
      ? profile.scenarios.slice(0, 2).join(', ')
      : profile.goal;

  const prompt = `Generate a reading passage for a language learner.

## Context
This is the user's FIRST lesson. The passage should be approachable and build confidence.

## Target Language: ${sanitizePromptInput(profile.targetLanguage)}
## Native Language: ${sanitizePromptInput(profile.nativeLanguage)}
## Level: ${sanitizePromptInput(profile.proficiencyLevel)}
## Scenario: ${sanitizePromptInput(scenarioContext)}
${profile.profession ? `## Profession: ${sanitizePromptInput(profile.profession)}` : ''}

## Vocabulary to include (use at least 8 naturally):
${vocabWords}

## Requirements:
- Write the passage IN THE TARGET LANGUAGE (${profile.targetLanguage})
- ${targetWordCount} words, professional/realistic context
- Include ${questionCount} comprehension questions in the native language (${profile.nativeLanguage})
- Each question has 4 options with one correct answer
- Questions test understanding, not translation

## Response Format (JSON only):
{
  "title": "Passage title (in target language)",
  "passage": "The full reading passage in target language...",
  "wordCount": ${targetWordCount},
  "targetVocabulary": ["word1", "word2"],
  "comprehensionQuestions": [
    {
      "question": "Question in native language?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ]
}`;

  try {
    const result = await generateJSON<Omit<ReadingContent, 'type'>>(prompt);
    if (!result?.passage) throw new Error('Empty passage');

    return { type: 'reading', ...result };
  } catch (error) {
    console.warn('[DiscoveryGenerator] Reading generation failed, using fallback:', error);
    return createFallbackReadingContent(profile, words);
  }
}

/**
 * Writing activity — Gemini generates a writing prompt based on user scenarios.
 */
async function generateWritingContent(
  activity: LessonActivity,
  profile: UserProfile,
  words: BankWord[],
): Promise<WritingContent> {
  const wordTarget =
    activity.config.type === 'writing' ? activity.config.word_target : 80;

  const vocabWords = words.slice(0, 10).map((w) => w.word).join(', ');

  const scenarioContext =
    profile.scenarios.length > 0
      ? profile.scenarios[0]
      : profile.goal;

  const prompt = `Generate a writing exercise for a language learner.

## Context
This is the user's FIRST lesson. The prompt should be inviting, not intimidating.

## Target Language: ${sanitizePromptInput(profile.targetLanguage)}
## Native Language: ${sanitizePromptInput(profile.nativeLanguage)}
## Level: ${sanitizePromptInput(profile.proficiencyLevel)}
## Scenario: ${sanitizePromptInput(scenarioContext)}
${profile.profession ? `## Profession: ${sanitizePromptInput(profile.profession)}` : ''}

## Vocabulary to practice:
${vocabWords}

## Requirements:
- Create a realistic writing scenario the learner might face
- Provide a clear prompt in the native language (${profile.nativeLanguage})
- Include 4-6 key phrases in the target language they should try to use
- Target word count: ${wordTarget}
- Provide an example opening sentence in the target language
- Tone: encouraging, professional

## Response Format (JSON only):
{
  "title": "Writing task title (in native language)",
  "scenario": "Context: You are writing a... (native language)",
  "prompt": "Write a message that... (native language)",
  "keyPhrases": ["phrase in target lang", "phrase 2"],
  "wordCountTarget": ${wordTarget},
  "exampleOpener": "Opening sentence in target language..."
}`;

  try {
    const result = await generateJSON<Omit<WritingContent, 'type'>>(prompt);
    if (!result?.prompt) throw new Error('Empty prompt');

    return { type: 'writing', ...result };
  } catch (error) {
    console.warn('[DiscoveryGenerator] Writing generation failed, using fallback:', error);
    return createFallbackWritingContent(profile, words);
  }
}

/**
 * Voice call activity — prepares scenario context, no Gemini call needed.
 */
function generateVoiceCallContent(
  activity: LessonActivity,
  profile: UserProfile,
  words: BankWord[],
): VoiceCallContent {
  const durationSeconds =
    activity.config.type === 'voice_call' ? activity.config.duration_seconds : 30;

  const scenarioTitle =
    profile.scenarios.length > 0
      ? profile.scenarios[0]
      : 'General conversation';

  const scenarioDescription = profile.profession
    ? `A short conversation about ${scenarioTitle.toLowerCase()} in a ${profile.profession} context.`
    : `A short conversation about ${scenarioTitle.toLowerCase()}.`;

  const suggestedTopics = profile.scenarios.length > 0
    ? profile.scenarios.slice(0, 3)
    : [profile.goal, 'Introduce yourself', 'Talk about your day'];

  return {
    type: 'voice_call',
    scenarioTitle,
    scenarioDescription,
    suggestedTopics,
    keyVocabulary: words.slice(0, 8).map((w) => w.word),
    durationSeconds,
  };
}

// ─── Fallback Content (template-based) ────────────────

function createFallbackListeningContent(
  profile: UserProfile,
  words: BankWord[],
): ListeningContent {
  const vocab = words.slice(0, 5);
  return {
    type: 'listening',
    title: 'First Listening Practice',
    dialogue: vocab.map((w, i) => ({
      speaker: i % 2 === 0 ? 'Speaker A' : 'Speaker B',
      text: w.exampleSentences?.[0] || w.word,
      translation: w.translation,
    })),
    vocabulary: vocab.map((w) => ({
      word: w.word,
      translation: w.translation,
      phonetic: w.phonetic,
    })),
    comprehensionQuestions: [
      {
        question: `Which of these words did you hear?`,
        options: [
          vocab[0]?.translation || 'Option A',
          vocab[1]?.translation || 'Option B',
          vocab[2]?.translation || 'Option C',
          vocab[3]?.translation || 'Option D',
        ],
        correctIndex: 0,
      },
    ],
  };
}

function createFallbackReadingContent(
  profile: UserProfile,
  words: BankWord[],
): ReadingContent {
  const vocab = words.slice(0, 8);
  const passage = vocab.map((w) => w.exampleSentences?.[0] || w.word).join('. ') + '.';
  return {
    type: 'reading',
    title: 'First Reading Practice',
    passage,
    wordCount: passage.split(/\s+/).length,
    targetVocabulary: vocab.map((w) => w.word),
    comprehensionQuestions: [
      {
        question: `What is the main topic of this passage?`,
        options: [
          vocab[0]?.category || 'General',
          'Sports',
          'Weather',
          'Technology',
        ],
        correctIndex: 0,
      },
    ],
  };
}

function createFallbackWritingContent(
  profile: UserProfile,
  words: BankWord[],
): WritingContent {
  const vocab = words.slice(0, 5);
  return {
    type: 'writing',
    title: 'First Writing Practice',
    scenario: `You are introducing yourself in a ${profile.goal} context.`,
    prompt: `Write a short introduction about yourself. Try to use some of the vocabulary you have learned.`,
    keyPhrases: vocab.map((w) => w.word),
    wordCountTarget: 50,
    exampleOpener: vocab[0]?.exampleSentences?.[0] || vocab[0]?.word || '',
  };
}

// ─── Main Generator ──────────────────────────────────

/**
 * Generate all content for a discovery lesson plan.
 *
 * For each activity in the plan, generates the appropriate content
 * type using word bank data and (for listening/reading/writing) Gemini.
 *
 * Results are cached in AsyncStorage keyed by plan ID.
 */
export async function generateDiscoveryLessonContent(
  plan: LessonPlan,
  userId: string,
): Promise<DiscoveryLessonContent> {
  // Check cache first
  const cached = await getCachedContent(plan.id);
  if (cached) {
    console.log('[DiscoveryGenerator] Using cached content for', plan.id);
    return cached;
  }

  const profile = getUserProfile();
  if (!profile) {
    console.warn('[DiscoveryGenerator] No user profile available, using minimal content');
  }

  // Load word bank words once for all activities
  const bankWords = await getDiscoveryWords(25);

  // Generate content for each activity sequentially (waterfall)
  // Sequential so we can give the user progressive feedback
  const activities: Record<string, ActivityContent> = {};

  for (const activity of plan.activities) {
    try {
      const content = await generateActivityContent(
        activity,
        profile,
        bankWords,
      );
      activities[activity.id] = content;
    } catch (error) {
      console.error(
        `[DiscoveryGenerator] Failed to generate content for ${activity.type}:`,
        error,
      );
      // Skip this activity — the UI should handle missing content gracefully
    }
  }

  const result: DiscoveryLessonContent = {
    activities,
    generatedAt: new Date().toISOString(),
    planId: plan.id,
  };

  // Cache the result
  await setCachedContent(plan.id, result);

  console.log(
    `[DiscoveryGenerator] Generated content for ${Object.keys(activities).length}/${plan.activities.length} activities`,
  );

  return result;
}

/**
 * Generate content for a single activity based on its type.
 */
async function generateActivityContent(
  activity: LessonActivity,
  profile: UserProfile | null,
  words: BankWord[],
): Promise<ActivityContent> {
  // Use a minimal profile if none available
  const safeProfile: UserProfile = profile || {
    targetLanguage: 'english',
    nativeLanguage: 'spanish',
    proficiencyLevel: 'starting_fresh',
    goal: 'general communication',
    profession: '',
    scenarios: [],
    firstName: '',
  };

  switch (activity.type) {
    case 'vocabulary':
      return generateVocabularyContent(activity);

    case 'listening':
      return generateListeningContent(activity, safeProfile, words);

    case 'reading':
      return generateReadingContent(activity, safeProfile, words);

    case 'writing':
      return generateWritingContent(activity, safeProfile, words);

    case 'voice_call':
      return generateVoiceCallContent(activity, safeProfile, words);

    default:
      throw new Error(`Unknown activity type: ${(activity as any).type}`);
  }
}

/**
 * Generate content for a single activity by ID within a plan.
 * Useful for lazy-loading individual activities.
 */
export async function generateSingleActivityContent(
  plan: LessonPlan,
  activityId: string,
): Promise<ActivityContent | null> {
  const activity = plan.activities.find((a) => a.id === activityId);
  if (!activity) return null;

  const profile = getUserProfile();
  const bankWords = await getDiscoveryWords(25);

  try {
    return await generateActivityContent(activity, profile, bankWords);
  } catch (error) {
    console.error(
      `[DiscoveryGenerator] Failed to generate single activity ${activityId}:`,
      error,
    );
    return null;
  }
}

/**
 * Generate and cache content for ONLY the first activity of a discovery lesson.
 * Used during onboarding to get the user into the lesson ASAP.
 * Remaining activities are generated in background by lesson-session.
 */
export async function generateFirstActivityContent(
  plan: LessonPlan,
  userId: string,
): Promise<DiscoveryLessonContent> {
  // Check cache first — if any content exists, use it
  const cached = await getCachedContent(plan.id);
  if (cached && Object.keys(cached.activities).length > 0) {
    console.log('[DiscoveryGenerator] First activity already cached for', plan.id);
    return cached;
  }

  const profile = getUserProfile();
  const bankWords = await getDiscoveryWords(25);

  const firstActivity = plan.activities[0];
  const activities: Record<string, ActivityContent> = {};

  if (firstActivity) {
    try {
      const content = await generateActivityContent(firstActivity, profile, bankWords);
      activities[firstActivity.id] = content;
    } catch (error) {
      console.warn('[DiscoveryGenerator] First activity generation failed:', error);
    }
  }

  const result: DiscoveryLessonContent = {
    activities,
    generatedAt: new Date().toISOString(),
    planId: plan.id,
  };

  await setCachedContent(plan.id, result);
  console.log(`[DiscoveryGenerator] First activity (${firstActivity?.type}) cached`);
  return result;
}

/**
 * Generate remaining activity content (activities 2+) and merge into cache.
 * Designed to run in background while the user does the first activity.
 */
export async function generateRemainingActivities(
  plan: LessonPlan,
  userId: string,
): Promise<DiscoveryLessonContent> {
  // Load existing cache (should have first activity from creating-path)
  const existing = await getCachedContent(plan.id);
  const activities: Record<string, ActivityContent> = { ...(existing?.activities || {}) };

  // Check if all activities are already generated
  const missing = plan.activities.filter(a => !activities[a.id]);
  if (missing.length === 0) {
    console.log('[DiscoveryGenerator] All activities already cached for', plan.id);
    return existing!;
  }

  const profile = getUserProfile();
  const bankWords = await getDiscoveryWords(25);

  // Generate only missing activities
  for (const activity of missing) {
    try {
      const content = await generateActivityContent(activity, profile, bankWords);
      activities[activity.id] = content;
      console.log(`[DiscoveryGenerator] Background: generated ${activity.type}`);
    } catch (error) {
      console.warn(
        `[DiscoveryGenerator] Background gen failed for ${activity.type}:`,
        error,
      );
    }
  }

  const result: DiscoveryLessonContent = {
    activities,
    generatedAt: new Date().toISOString(),
    planId: plan.id,
  };

  await setCachedContent(plan.id, result);
  console.log(
    `[DiscoveryGenerator] Background complete: ${Object.keys(activities).length}/${plan.activities.length} activities`,
  );
  return result;
}

/**
 * Clear cached discovery content for a specific plan.
 */
export async function clearDiscoveryCache(planId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${planId}`);
  } catch {
    // Non-critical
  }
}
