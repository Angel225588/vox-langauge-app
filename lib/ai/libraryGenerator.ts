/**
 * AI Library Recommendation Generator
 *
 * Generates personalized lecture/reading recommendations based on user's
 * learning profile, current level, and motivation. Cached weekly.
 *
 * Flow: User profile → Gemini → Structured lecture metadata → Library screen
 * Passage text is generated lazily when the user opens a lecture.
 */

import { generateJSON } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { getStaircaseParams, getStairContent } from '@/lib/db/learningPaths';
import { getCurrentStairStepId } from '@/lib/ai/practiceGenerator';
import { getWordsByPriority, getWordCount } from '@/lib/word-bank/storage';
import { getScoreHistory } from '@/lib/db/competencyMetrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// Types
// =============================================================================

export interface LibraryLecture {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  wordCount: number;
  imageUrl: string;
  featured?: boolean;
  reason?: string;
}

interface LibraryCache {
  lectures: LibraryLecture[];
  generatedAt: string;
  userId: string;
}

// =============================================================================
// Constants
// =============================================================================

const CACHE_KEY = 'vox_library_recommendations';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PASSAGE_CACHE_PREFIX = 'vox_library_passage_';

/** Map full language names to ISO codes for cache consistency */
const LANG_NAME_TO_CODE: Record<string, string> = {
  english: 'en', french: 'fr', spanish: 'es',
  german: 'de', italian: 'it', portuguese: 'pt',
  japanese: 'ja', chinese: 'zh', korean: 'ko',
};

function normalizeLangCode(lang?: string): string {
  if (!lang) return 'en';
  const lower = lang.toLowerCase();
  return LANG_NAME_TO_CODE[lower] || lower;
}

/** Curated Unsplash images per category for visual quality */
const CATEGORY_IMAGES: Record<string, string[]> = {
  Business: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
  ],
  Travel: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  ],
  'Daily Life': [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80',
  ],
  Health: [
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  ],
  Food: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  ],
  Social: [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
  ],
  Professional: [
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
  ],
  Culture: [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
  ],
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80';

// =============================================================================
// Cache
// =============================================================================

async function getCachedLibrary(userId: string, language?: string): Promise<LibraryCache | null> {
  try {
    const langKey = normalizeLangCode(language);
    const raw = await AsyncStorage.getItem(`${CACHE_KEY}_${userId}_${langKey}`);
    if (!raw) return null;
    const cached: LibraryCache = JSON.parse(raw);
    if (Date.now() - new Date(cached.generatedAt).getTime() > CACHE_TTL_MS) {
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

async function setCachedLibrary(userId: string, cache: LibraryCache, language?: string): Promise<void> {
  try {
    const langKey = normalizeLangCode(language);
    await AsyncStorage.setItem(`${CACHE_KEY}_${userId}_${langKey}`, JSON.stringify(cache));
  } catch {
    // Non-critical
  }
}

// =============================================================================
// Image helpers
// =============================================================================

function getImageForCategory(category: string, index: number): string {
  const images = CATEGORY_IMAGES[category];
  if (images && images.length > 0) {
    return images[index % images.length];
  }
  // Try partial match
  const key = Object.keys(CATEGORY_IMAGES).find(k =>
    category.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(category.toLowerCase())
  );
  if (key) {
    const imgs = CATEGORY_IMAGES[key];
    return imgs[index % imgs.length];
  }
  return FALLBACK_IMAGE;
}

// =============================================================================
// Learner Context (word bank + performance history)
// =============================================================================

/**
 * Build enriched learner context from word bank and recent performance.
 * Used to personalize both recommendations and passage generation.
 */
async function getLearnerContext(userId: string): Promise<{
  weakWords: string;
  performanceSummary: string;
}> {
  let weakWords = '';
  let performanceSummary = '';

  try {
    // Word bank: high-priority (weakest) words the user struggles with
    const wordCount = await getWordCount();
    if (wordCount >= 5) {
      const priorityWords = await getWordsByPriority(15);
      const weakList = priorityWords
        .filter(w => w.masteryScore < 70) // focus on unmastered words
        .map(w => w.word)
        .slice(0, 10);
      if (weakList.length > 0) {
        weakWords = weakList.join(', ');
      }
    }
  } catch {
    // Word bank not available — continue without
  }

  try {
    // Performance: last 14 days of reading scores
    const scores = await getScoreHistory(userId, 14);
    const readingScores = scores.filter(s => s.type === 'reading');
    if (readingScores.length > 0) {
      const avgArticulation = Math.round(
        readingScores.reduce((sum, s) => sum + s.articulation, 0) / readingScores.length
      );
      const avgFluency = Math.round(
        readingScores.reduce((sum, s) => sum + s.fluency, 0) / readingScores.length
      );
      const avgOverall = Math.round(
        readingScores.reduce((sum, s) => sum + s.overallScore, 0) / readingScores.length
      );
      performanceSummary = `Articulation: ${avgArticulation}/100, Fluency: ${avgFluency}/100, Overall: ${avgOverall}/100 (${readingScores.length} sessions in 14 days)`;
    }
  } catch {
    // No scores yet — continue without
  }

  return { weakWords, performanceSummary };
}

// =============================================================================
// Generation
// =============================================================================

/**
 * Generate personalized library recommendations for a user.
 * Returns cached results if available (weekly refresh).
 */
export async function generateLibraryRecommendations(
  userId: string,
  forceRefresh: boolean = false,
  language?: string
): Promise<LibraryLecture[]> {
  // Check cache (language-aware)
  if (!forceRefresh) {
    const cached = await getCachedLibrary(userId, language);
    if (cached) return cached.lectures;
  }

  try {
    const [params, stairStepId, learnerCtx] = await Promise.all([
      getStaircaseParams(userId),
      getCurrentStairStepId(userId),
      getLearnerContext(userId),
    ]);

    if (!params) return [];

    // Get current vocabulary context for relevance
    let vocabContext = '';
    if (stairStepId) {
      const content = await getStairContent(stairStepId);
      if (content?.vocabulary) {
        const words = content.vocabulary
          .slice(0, 15)
          .map((v: any) => (typeof v === 'string' ? v : v.word || v.term || ''))
          .filter(Boolean);
        vocabContext = words.join(', ');
      }
    }

    const prompt = `Generate 8 personalized reading lecture recommendations for a language learner.

## Learner Profile
- Target Language: ${sanitizePromptInput(params.target_language)}
- Native Language: ${sanitizePromptInput(params.native_language)}
- Level: ${sanitizePromptInput(params.proficiency_level)}
- Motivation: ${sanitizePromptInput(params.motivation)}${params.motivation_custom ? ` (${sanitizePromptInput(params.motivation_custom)})` : ''}
${vocabContext ? `- Current Vocabulary: ${sanitizePromptInput(vocabContext)}` : ''}
${learnerCtx.weakWords ? `- Words to reinforce (user struggles with these): ${sanitizePromptInput(learnerCtx.weakWords)}` : ''}
${learnerCtx.performanceSummary ? `- Recent Reading Performance: ${sanitizePromptInput(learnerCtx.performanceSummary)}` : ''}

## Requirements
- Generate 8 lectures that are MOST useful for this learner's goals and level
- Mix of categories relevant to their motivation (e.g., business learner gets business + professional + social)
- 3 should be marked as "featured" (most important this week)
- Each lecture has a clear reason why it's recommended
- Titles and subtitles in the NATIVE language (${params.native_language})
- Difficulty matches or slightly stretches their current level
- Word counts: beginner 80-150, intermediate 150-250, advanced 250-400
- Duration in minutes based on word count and difficulty
- Categories: Business, Travel, Daily Life, Health, Food, Social, Professional, Culture

## Response Format (JSON only)
{
  "lectures": [
    {
      "title": "Lecture title in native language",
      "subtitle": "Brief description in native language",
      "category": "Business",
      "difficulty": "intermediate",
      "duration": "5 min",
      "wordCount": 200,
      "featured": true,
      "reason": "Why this is recommended (native language, 1 sentence)"
    }
  ]
}`;

    const result = await generateJSON<{ lectures: Omit<LibraryLecture, 'id' | 'imageUrl'>[] }>(prompt);

    if (!result?.lectures || !Array.isArray(result.lectures)) return [];

    const timestamp = Date.now();
    const lectures: LibraryLecture[] = result.lectures.map((lecture, i) => ({
      ...lecture,
      id: `ai-${timestamp}-${i}`,
      imageUrl: getImageForCategory(lecture.category, i),
    }));

    // Cache (language-aware)
    await setCachedLibrary(userId, {
      lectures,
      generatedAt: new Date().toISOString(),
      userId,
    }, language || params.target_language);

    return lectures;
  } catch (error) {
    console.error('[LibraryGenerator] Failed to generate recommendations:', error);
    return [];
  }
}

// =============================================================================
// Passage Generation (lazy — called from teleprompter)
// =============================================================================

interface CachedPassage {
  text: string;
  generatedAt: string;
}

/**
 * Generate the actual reading passage for a library lecture.
 * Called lazily from the teleprompter when the user opens a lecture.
 * Cached per lecture ID.
 */
export async function generateLecturePassage(
  userId: string,
  lectureId: string,
  metadata: {
    title: string;
    category: string;
    difficulty: string;
    wordCount: number;
    language?: string;
  }
): Promise<string | null> {
  // Check passage cache (language-aware)
  const langKey = normalizeLangCode(metadata.language);
  const cacheId = `${PASSAGE_CACHE_PREFIX}${lectureId}_${langKey}`;
  try {
    const raw = await AsyncStorage.getItem(cacheId);
    if (raw) {
      const cached: CachedPassage = JSON.parse(raw);
      return cached.text;
    }
  } catch {
    // Continue to generate
  }

  try {
    const [params, stairStepId, learnerCtx] = await Promise.all([
      getStaircaseParams(userId),
      getCurrentStairStepId(userId),
      getLearnerContext(userId),
    ]);

    // Use passed language as authority, staircase params as enrichment
    const targetLang = metadata.language || params?.target_language || 'english';
    const nativeLang = params?.native_language || 'english';
    const level = params?.proficiency_level || metadata.difficulty;

    // Get current vocabulary for integration
    let vocabContext = '';
    if (stairStepId) {
      const content = await getStairContent(stairStepId);
      if (content?.vocabulary) {
        const words = content.vocabulary
          .slice(0, 20)
          .map((v: any) => (typeof v === 'string' ? v : v.word || v.term || ''))
          .filter(Boolean);
        vocabContext = words.join(', ');
      }
    }

    const prompt = `Generate a reading passage for a language learner to read aloud.

## Context
- Title: ${sanitizePromptInput(metadata.title)}
- Category: ${sanitizePromptInput(metadata.category)}
- Difficulty: ${sanitizePromptInput(metadata.difficulty)}
- Target word count: ${metadata.wordCount}
- Target Language: ${sanitizePromptInput(targetLang)}
- Native Language: ${sanitizePromptInput(nativeLang)}
- Level: ${sanitizePromptInput(level)}
${vocabContext ? `- Vocabulary to naturally include: ${sanitizePromptInput(vocabContext)}` : ''}
${learnerCtx.weakWords ? `- PRIORITY: Naturally weave in these words the user needs to practice: ${sanitizePromptInput(learnerCtx.weakWords)}` : ''}
${learnerCtx.performanceSummary ? `- Learner's recent reading scores: ${sanitizePromptInput(learnerCtx.performanceSummary)}. Adjust complexity accordingly.` : ''}

## Requirements
- Write the passage ENTIRELY in the target language (${targetLang}). NOT in ${nativeLang} or English.
- Write fluent, natural ${targetLang} that flows smoothly when read aloud
- Sentences should connect naturally with proper transitions and cohesion
- Make it engaging and relevant to the category/title
- Use natural, realistic language appropriate for the difficulty level
- Include dialogue where appropriate
- Structure with clear paragraphs (separate with double newlines)
- Aim for exactly ${metadata.wordCount} words

## Response Format
Return ONLY valid JSON. Use \\n for paragraph breaks inside the passage string.
IMPORTANT: Escape any quotation marks inside the passage with backslash (\\").
{
  "passage": "First paragraph in ${targetLang}.\\n\\nSecond paragraph..."
}`;

    const result = await generateJSON<{ passage: string }>(prompt);
    if (!result?.passage) return null;

    // Cache the passage (language-aware key)
    try {
      await AsyncStorage.setItem(
        cacheId,
        JSON.stringify({ text: result.passage, generatedAt: new Date().toISOString() })
      );
    } catch {
      // Non-critical
    }

    return result.passage;
  } catch (error) {
    console.error('[LibraryGenerator] Failed to generate passage:', error);
    return null;
  }
}
