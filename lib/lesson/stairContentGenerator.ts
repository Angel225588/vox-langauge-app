/**
 * Stair Content Generator
 *
 * Generates personalized AI content for ALL stairs (not just discovery).
 * Uses the same waterfall pattern as discoveryGenerator:
 *   1. Check cache
 *   2. Generate first activity content
 *   3. Background-generate remaining activities
 *
 * Content is personalized based on the stair's theme (extracted from title),
 * the user's profile (language, level, scenarios, profession), and word bank.
 *
 * This module reuses the same content types and activity generators from
 * discoveryGenerator, but with prompts adapted for non-first lessons:
 * - No "this is your FIRST lesson" framing
 * - Content references the stair's specific scenario/theme
 * - Difficulty scales with stair order
 */

import { generateJSON } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { getWordsByPriority, getWordCount } from '@/lib/word-bank/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getScoreHistory, type PracticeScore } from '@/lib/db/competencyMetrics';
import { getUserProfile, getSafeProfile, buildCacheKey } from './profileLoader';
import type { UserProfile } from './profileLoader';
import type { LessonPlan, LessonActivity } from './lessonEngine';
import type { BankWord } from '@/lib/word-bank/types';
import type {
  ActivityContent,
  VocabularyContent,
  ListeningContent,
  ReadingContent,
  WritingContent,
  VoiceCallContent,
  VocabWord,
  VocabCategory,
  DiscoveryLessonContent,
} from './discoveryGenerator';

// Re-export the content type so lesson-session can use a single import
export type { DiscoveryLessonContent as StairLessonContent };

// ─── Cache ────────────────────────────────────────────

const CACHE_PREFIX = 'vox_stair_content_';

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

export async function clearStairCache(planId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${planId}`);
  } catch {
    // Non-critical
  }
}

// ─── Word Bank Helpers ────────────────────────────────

async function getStairWords(wordCount: number): Promise<BankWord[]> {
  try {
    const count = await getWordCount();
    if (count === 0) return [];
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

// ─── Stair Context ────────────────────────────────────

/**
 * Extract a scenario/theme from the stair title.
 * "Client Meetings: In Practice" -> "Client Meetings"
 * "Sprint Planning: Advanced" -> "Sprint Planning"
 */
function extractStairTheme(stairTitle: string): string {
  const colonIndex = stairTitle.indexOf(':');
  if (colonIndex > 0) return stairTitle.substring(0, colonIndex).trim();
  return stairTitle;
}

/**
 * Determine difficulty context text based on stair order.
 * Higher-order stairs get harder content prompts.
 */
function getDifficultyContext(stairOrder: number, levelGroup: string): string {
  if (stairOrder <= 2) {
    return 'This is an early lesson. Content should be foundational and build confidence.';
  }
  if (stairOrder <= 5) {
    return 'This is a mid-level lesson. Content should be moderately challenging and practical.';
  }
  if (stairOrder <= 8) {
    return 'This is an advanced lesson. Content should be challenging with nuanced vocabulary and complex structures.';
  }
  return 'This is a mastery-level lesson. Content should be sophisticated, professional, and push the learner.';
}

// ─── Performance Context (Feedback Loop) ──────────────

/**
 * Build a performance context string from recent practice scores.
 * This tells the AI generator what the user is strong/weak at,
 * so content can adapt (e.g., more listening practice if listening scores are low).
 *
 * Returns an empty string if no scores are available.
 */
async function buildPerformanceContext(userId: string): Promise<string> {
  try {
    const scores = await getScoreHistory(userId, 14); // Last 2 weeks
    if (scores.length === 0) return '';

    const kpis = ['articulation', 'fluency', 'communication', 'scenario'] as const;
    const averages: Record<string, number> = {};

    for (const kpi of kpis) {
      const measured = scores.filter((s) => s[kpi] > 0);
      if (measured.length > 0) {
        averages[kpi] = Math.round(
          measured.reduce((sum, s) => sum + s[kpi], 0) / measured.length,
        );
      }
    }

    if (Object.keys(averages).length === 0) return '';

    // Find strengths and weaknesses
    const entries = Object.entries(averages).sort((a, b) => a[1] - b[1]);
    const weakest = entries[0];
    const strongest = entries[entries.length - 1];

    const lines: string[] = [
      `## Learner Performance (last ${scores.length} sessions):`,
    ];

    for (const [kpi, avg] of entries) {
      lines.push(`- ${kpi}: ${avg}/100`);
    }

    if (weakest && strongest && weakest[0] !== strongest[0]) {
      lines.push(`\nFocus area: The learner's ${weakest[0]} score is lowest (${weakest[1]}). ` +
        `Design content that gives extra practice in this area while building on their strength in ${strongest[0]} (${strongest[1]}).`);
    }

    return lines.join('\n');
  } catch {
    return '';
  }
}

// ─── Activity Content Generators ──────────────────────

async function generateVocabularyContent(
  activity: LessonActivity,
): Promise<VocabularyContent> {
  const wordCount =
    activity.config.type === 'vocabulary' ? activity.config.word_count : 5;

  const bankWords = await getStairWords(wordCount);

  return {
    type: 'vocabulary',
    words: bankWordsToVocab(bankWords),
    categories: groupByCategory(bankWords),
  };
}

async function generateListeningContent(
  activity: LessonActivity,
  profile: UserProfile,
  words: BankWord[],
  stairTheme: string,
  difficultyContext: string,
  performanceContext: string,
): Promise<ListeningContent> {
  const sentenceCount =
    activity.config.type === 'listening' ? activity.config.sentence_count : 6;

  const vocabList = words
    .slice(0, 15)
    .map((w) => `${w.word} (${w.translation})`)
    .join(', ');

  const prompt = `Generate a listening comprehension exercise for a language learner.

## Context
${difficultyContext}
The lesson topic is "${sanitizePromptInput(stairTheme)}".
${performanceContext}
${profile.firstName ? `The learner's name is ${sanitizePromptInput(profile.firstName)}.` : ''}

## Target Language: ${sanitizePromptInput(profile.targetLanguage)}
## Native Language: ${sanitizePromptInput(profile.nativeLanguage)}
## Level: ${sanitizePromptInput(profile.proficiencyLevel)}
## Topic Focus: ${sanitizePromptInput(stairTheme)}
${profile.profession ? `## Profession: ${sanitizePromptInput(profile.profession)}` : ''}

## Vocabulary to include (use at least 5 naturally):
${vocabList}

## Requirements:
- Create a dialogue between 2-3 people with ${sentenceCount} exchanges
- Give each speaker a real name appropriate to the target language
- Each speaker must have a gender (male/female) and mood (neutral/friendly/formal/excited/serious/warm)
- Write the dialogue IN THE TARGET LANGUAGE (${profile.targetLanguage})
- The scenario should be realistic and relate to "${stairTheme}"
- Include translations for each line in the native language (${profile.nativeLanguage})
- Include a vocabulary list with key words used
- Generate TWO sets of 3 comprehension questions each:
  - "beforeQuestions": easier gist-level questions (main topic, who is speaking, general mood)
  - "afterQuestions": harder detail questions (specific words, exact meaning, inference)

## Response Format (JSON only):
{
  "title": "Dialogue title (in native language)",
  "dialogue": [
    { "speaker": "Marie", "text": "Line in target language", "translation": "Translation", "gender": "female", "mood": "friendly" }
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
  ],
  "beforeQuestions": [
    {
      "question": "Easy gist question in native language?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ],
  "afterQuestions": [
    {
      "question": "Harder detail question in native language?",
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
    console.warn('[StairContentGenerator] Listening generation failed, using fallback:', error);
    return createFallbackListeningContent(profile, words);
  }
}

async function generateReadingContent(
  activity: LessonActivity,
  profile: UserProfile,
  words: BankWord[],
  stairTheme: string,
  difficultyContext: string,
  performanceContext: string,
): Promise<ReadingContent> {
  const targetWordCount =
    activity.config.type === 'reading' ? activity.config.word_count : 150;
  const questionCount =
    activity.config.type === 'reading' ? activity.config.question_count : 3;

  const vocabWords = words.slice(0, 15).map((w) => w.word).join(', ');

  const prompt = `Generate a reading passage for a language learner.

## Context
${difficultyContext}
The lesson topic is "${sanitizePromptInput(stairTheme)}".
${performanceContext}

## Target Language: ${sanitizePromptInput(profile.targetLanguage)}
## Native Language: ${sanitizePromptInput(profile.nativeLanguage)}
## Level: ${sanitizePromptInput(profile.proficiencyLevel)}
## Topic Focus: ${sanitizePromptInput(stairTheme)}
${profile.profession ? `## Profession: ${sanitizePromptInput(profile.profession)}` : ''}

## Vocabulary to include (use at least 8 naturally):
${vocabWords}

## Requirements:
- Write the passage IN THE TARGET LANGUAGE (${profile.targetLanguage})
- ${targetWordCount} words, professional/realistic context related to "${stairTheme}"
- Include a full translation of the passage in the native language (${profile.nativeLanguage})
- Include ${questionCount} comprehension questions in the native language
- Each question has 4 options with one correct answer
- Questions test understanding, not translation

## Response Format (JSON only):
{
  "title": "Passage title (in target language)",
  "passage": "The full reading passage in target language...",
  "translation": "Full translation of the passage in native language...",
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
    console.warn('[StairContentGenerator] Reading generation failed, using fallback:', error);
    return createFallbackReadingContent(profile, words);
  }
}

async function generateWritingContent(
  activity: LessonActivity,
  profile: UserProfile,
  words: BankWord[],
  stairTheme: string,
  difficultyContext: string,
  performanceContext: string,
): Promise<WritingContent> {
  const wordTarget =
    activity.config.type === 'writing' ? activity.config.word_target : 80;

  const vocabWords = words.slice(0, 10).map((w) => w.word).join(', ');

  const prompt = `Generate a writing exercise for a language learner.

## Context
${difficultyContext}
The lesson topic is "${sanitizePromptInput(stairTheme)}".
${performanceContext}

## Target Language: ${sanitizePromptInput(profile.targetLanguage)}
## Native Language: ${sanitizePromptInput(profile.nativeLanguage)}
## Level: ${sanitizePromptInput(profile.proficiencyLevel)}
## Topic Focus: ${sanitizePromptInput(stairTheme)}
${profile.profession ? `## Profession: ${sanitizePromptInput(profile.profession)}` : ''}

## Vocabulary to practice:
${vocabWords}

## Requirements:
- Create a realistic writing scenario related to "${stairTheme}"
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
    console.warn('[StairContentGenerator] Writing generation failed, using fallback:', error);
    return createFallbackWritingContent(profile, words, stairTheme);
  }
}

function generateVoiceCallContent(
  activity: LessonActivity,
  profile: UserProfile,
  words: BankWord[],
  stairTheme: string,
): VoiceCallContent {
  const durationSeconds =
    activity.config.type === 'voice_call' ? activity.config.duration_seconds : 60;

  const scenarioDescription = profile.profession
    ? `A conversation about ${stairTheme.toLowerCase()} in a ${profile.profession} context.`
    : `A conversation about ${stairTheme.toLowerCase()}.`;

  const suggestedTopics = [
    stairTheme,
    ...profile.scenarios.slice(0, 2),
  ];

  return {
    type: 'voice_call',
    scenarioTitle: stairTheme,
    scenarioDescription,
    suggestedTopics,
    keyVocabulary: words.slice(0, 8).map((w) => w.word),
    durationSeconds,
  };
}

// ─── Fallback Content ─────────────────────────────────

function createFallbackListeningContent(
  profile: UserProfile,
  words: BankWord[],
): ListeningContent {
  const vocab = words.slice(0, 5);
  return {
    type: 'listening',
    title: 'Listening Practice',
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
        question: 'Which of these words did you hear?',
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
  const translation = vocab.map((w) => w.translation).join('. ') + '.';
  return {
    type: 'reading',
    title: 'Reading Practice',
    passage,
    translation,
    wordCount: passage.split(/\s+/).length,
    targetVocabulary: vocab.map((w) => w.word),
    comprehensionQuestions: [
      {
        question: 'What is the main topic of this passage?',
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
  stairTheme: string,
): WritingContent {
  const vocab = words.slice(0, 5);
  return {
    type: 'writing',
    title: 'Writing Practice',
    scenario: `You are writing about ${stairTheme.toLowerCase()} in a ${profile.goal} context.`,
    prompt: `Write a short response related to ${stairTheme.toLowerCase()}. Try to use some of the vocabulary you have learned.`,
    keyPhrases: vocab.map((w) => w.word),
    wordCountTarget: 50,
    exampleOpener: vocab[0]?.exampleSentences?.[0] || vocab[0]?.word || '',
  };
}

// ─── Cache Validation ─────────────────────────────────

function isCacheValid(cached: DiscoveryLessonContent, plan: LessonPlan): boolean {
  for (const activity of plan.activities) {
    const content = cached.activities[activity.id];
    if (content && content.type !== activity.type) {
      console.warn(
        `[StairContentGenerator] Cache mismatch: activity ${activity.id} expects '${activity.type}' but cache has '${content.type}'`,
      );
      return false;
    }
  }
  return true;
}

// ─── Single Activity Generator ────────────────────────

async function generateActivityContent(
  activity: LessonActivity,
  profile: UserProfile | null,
  words: BankWord[],
  stairTheme: string,
  difficultyContext: string,
  performanceContext: string,
): Promise<ActivityContent> {
  const safeProfile = getSafeProfile(profile, 'StairContentGenerator');

  switch (activity.type) {
    case 'vocabulary':
      return generateVocabularyContent(activity);

    case 'listening':
      return generateListeningContent(activity, safeProfile, words, stairTheme, difficultyContext, performanceContext);

    case 'reading':
      return generateReadingContent(activity, safeProfile, words, stairTheme, difficultyContext, performanceContext);

    case 'writing':
      return generateWritingContent(activity, safeProfile, words, stairTheme, difficultyContext, performanceContext);

    case 'voice_call':
      return generateVoiceCallContent(activity, safeProfile, words, stairTheme);

    default:
      throw new Error(`Unknown activity type: ${(activity as any).type}`);
  }
}

// ─── Main Generator ──────────────────────────────────

/**
 * Generate all content for a stair lesson plan (non-discovery).
 *
 * Uses the stair's title to extract the theme/scenario, then generates
 * content for each activity personalized to that theme.
 *
 * Results are cached in AsyncStorage keyed by plan ID.
 */
export async function generateStairLessonContent(
  plan: LessonPlan,
  userId: string,
): Promise<DiscoveryLessonContent> {
  // Load profile first — need language for cache key
  const profile = await getUserProfile();
  if (!profile) {
    console.error(
      '[StairContentGenerator] CRITICAL: No profile loaded — content will default to English.',
    );
  }

  // Include language in cache key so switching languages doesn't serve stale content
  const cacheKey = buildCacheKey(plan.id, profile);

  // Check cache first
  const cached = await getCachedContent(cacheKey);
  if (cached && isCacheValid(cached, plan)) {
    console.log(`[StairContentGenerator] Using cached cached content for`, plan.id);
    return cached;
  }
  if (cached) {
    console.warn('[StairContentGenerator] Stale cache detected, regenerating for', plan.id);
    await clearStairCache(cacheKey);
  }
  const bankWords = await getStairWords(25);
  const stairTheme = extractStairTheme(plan.stair_title);
  const difficultyContext = getDifficultyContext(
    // Estimate stair order from the plan ID or use a default
    parseInt(plan.stair_id.replace(/\D/g, '') || '3', 10),
    plan.level_group,
  );

  // Build performance context from recent scores (feedback loop)
  const performanceContext = await buildPerformanceContext(userId);

  const activities: Record<string, ActivityContent> = {};

  for (const activity of plan.activities) {
    try {
      const content = await generateActivityContent(
        activity,
        profile,
        bankWords,
        stairTheme,
        difficultyContext,
        performanceContext,
      );
      activities[activity.id] = content;
    } catch (error) {
      console.error(
        `[StairContentGenerator] Failed to generate content for ${activity.type}:`,
        error,
      );
    }
  }

  const result: DiscoveryLessonContent = {
    activities,
    generatedAt: new Date().toISOString(),
    planId: plan.id,
  };

  await setCachedContent(cacheKey, result);

  console.log(
    `[StairContentGenerator] Generated cached content for ${Object.keys(activities).length}/${plan.activities.length} activities`,
  );

  return result;
}

/**
 * Generate content for the first activity only (fast start).
 * Remaining activities are generated in background.
 */
export async function generateFirstStairActivityContent(
  plan: LessonPlan,
  userId: string,
): Promise<DiscoveryLessonContent> {
  const profile = await getUserProfile();
  const cacheKey = buildCacheKey(plan.id, profile);

  const cached = await getCachedContent(cacheKey);
  if (cached && Object.keys(cached.activities).length > 0 && isCacheValid(cached, plan)) {
    console.log(`[StairContentGenerator] First activity already cached for`, plan.id);
    return cached;
  }

  const bankWords = await getStairWords(25);
  const stairTheme = extractStairTheme(plan.stair_title);
  const difficultyContext = getDifficultyContext(
    parseInt(plan.stair_id.replace(/\D/g, '') || '3', 10),
    plan.level_group,
  );
  const performanceContext = await buildPerformanceContext(userId);

  const firstActivity = plan.activities[0];
  const activities: Record<string, ActivityContent> = {};

  if (firstActivity) {
    try {
      const content = await generateActivityContent(
        firstActivity,
        profile,
        bankWords,
        stairTheme,
        difficultyContext,
        performanceContext,
      );
      activities[firstActivity.id] = content;
    } catch (error) {
      console.warn('[StairContentGenerator] First activity generation failed:', error);
    }
  }

  const result: DiscoveryLessonContent = {
    activities,
    generatedAt: new Date().toISOString(),
    planId: plan.id,
  };

  await setCachedContent(cacheKey, result);
  console.log(`[StairContentGenerator] First activity (${firstActivity?.type}) cached`);
  return result;
}

/**
 * Generate remaining activity content (activities 2+) and merge into cache.
 * Designed to run in background while the user does the first activity.
 */
export async function generateRemainingStairActivities(
  plan: LessonPlan,
  userId: string,
): Promise<DiscoveryLessonContent> {
  const profile = await getUserProfile();
  const cacheKey = buildCacheKey(plan.id, profile);

  const existing = await getCachedContent(cacheKey);
  const cacheValid = existing ? isCacheValid(existing, plan) : true;
  const activities: Record<string, ActivityContent> = cacheValid
    ? { ...(existing?.activities || {}) }
    : {};

  if (!cacheValid) {
    await clearStairCache(cacheKey);
  }

  const missing = plan.activities.filter((a) => {
    const cached = activities[a.id];
    return !cached || cached.type !== a.type;
  });
  if (missing.length === 0) {
    console.log(`[StairContentGenerator] All activities already cached for`, plan.id);
    return existing!;
  }

  const bankWords = await getStairWords(25);
  const stairTheme = extractStairTheme(plan.stair_title);
  const difficultyContext = getDifficultyContext(
    parseInt(plan.stair_id.replace(/\D/g, '') || '3', 10),
    plan.level_group,
  );
  const performanceContext = await buildPerformanceContext(userId);

  for (const activity of missing) {
    try {
      const content = await generateActivityContent(
        activity,
        profile,
        bankWords,
        stairTheme,
        difficultyContext,
        performanceContext,
      );
      activities[activity.id] = content;
      console.log(`[StairContentGenerator] Background: generated ${activity.type}`);
    } catch (error) {
      console.warn(
        `[StairContentGenerator] Background gen failed for ${activity.type}:`,
        error,
      );
    }
  }

  const result: DiscoveryLessonContent = {
    activities,
    generatedAt: new Date().toISOString(),
    planId: plan.id,
  };

  await setCachedContent(cacheKey, result);
  console.log(
    `[StairContentGenerator] Background complete (${lang}): ${Object.keys(activities).length}/${plan.activities.length} activities`,
  );
  return result;
}
