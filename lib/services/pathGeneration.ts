/**
 * Path Generation Service
 *
 * Orchestrates the complete flow from onboarding data to stored learning path.
 * This service is the central coordinator for:
 * - Converting onboarding data to AI-compatible format
 * - Generating personalized learning paths with Gemini AI
 * - Storing paths in the database (learning_path, section, stairs)
 * - Initializing user AI memory for future personalization
 * - Handling fallback to templates when AI generation fails
 *
 * @module lib/services/pathGeneration
 */

import type {
  PathGenerationInput,
  GeneratedPath,
  GeneratedStair,
  VocabItem,
} from '@/types/learning';
import {
  generatePathSkeletonPrompt,
  generateStairContentPromptOnDemand,
  generatePathPrompt,
  PATH_TEMPLATES,
  extractJSON,
  validateGeneratedPath,
} from '@/lib/ai/prompts/pathGeneration';
import { initializeUserMemory } from '@/lib/ai/userMemory';

import {
  createLearningPath,
  createSection,
  createStairsForSection,
} from '@/lib/db/learningPaths';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Onboarding data structure from the V2 onboarding flow.
 * This is what we receive from the useOnboardingV2 hook.
 */
export interface OnboardingData {
  native_language: string | null;
  target_language: string | null;
  motivation: string | null;
  motivation_custom: string | null;
  why_now: string | null;
  proficiency_level: string | null;
  previous_attempts: string | null;
  timeline: string | null;
  commitment_stakes: string | null;
}

/**
 * Result of path creation operation.
 */
export interface PathCreationResult {
  success: boolean;
  pathId?: string;
  error?: string;
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Creates a complete personalized learning path from onboarding data.
 *
 * This is the main entry point that orchestrates the entire path generation flow:
 * 1. Validates and transforms onboarding data
 * 2. Calls Gemini AI to generate the learning path
 * 3. Stores the path in the database (learning_path, section, stairs)
 * 4. Initializes user AI memory for future personalization
 *
 * @param userId - The user's unique identifier
 * @param onboardingData - Data collected during onboarding
 * @returns Promise with success status and path ID or error message
 *
 * @example
 * ```typescript
 * const result = await createPersonalizedPath('user-123', onboardingData);
 * if (result.success) {
 *   console.log('Path created:', result.pathId);
 *   router.push('/home');
 * } else {
 *   console.error('Failed:', result.error);
 * }
 * ```
 */
export async function createPersonalizedPath(
  userId: string,
  onboardingData: OnboardingData
): Promise<PathCreationResult> {
  console.log('[PathGeneration] Starting path creation for user:', userId);
  console.log('[PathGeneration] Onboarding data:', JSON.stringify(onboardingData, null, 2));

  try {
    // Step 1: Validate onboarding data
    const validationError = validateOnboardingData(onboardingData);
    if (validationError) {
      console.error('[PathGeneration] Validation failed:', validationError);
      return {
        success: false,
        error: validationError,
      };
    }

    // Step 2: Transform onboarding data to PathGenerationInput format
    const pathInput = transformOnboardingToInput(userId, onboardingData);
    console.log('[PathGeneration] Transformed input:', JSON.stringify(pathInput, null, 2));

    // Step 3: Generate the learning path with Gemini AI
    let generatedPath: GeneratedPath;
    try {
      generatedPath = await generateLearningPath(pathInput);
      console.log('[PathGeneration] AI generated path:', generatedPath.path_title);
      console.log('[PathGeneration] Total stairs:', generatedPath.total_stairs);
    } catch (aiError) {
      console.error('[PathGeneration] AI generation failed:', aiError);
      console.log('[PathGeneration] Falling back to template-based path');

      // Fallback to template-based generation
      generatedPath = generateFallbackPath(
        pathInput.motivation,
        pathInput.target_language,
        pathInput.proficiency_level
      );
    }

    // Step 4: Store the path in the database
    const pathId = await storePath(userId, generatedPath, pathInput);
    console.log('[PathGeneration] Path stored successfully with ID:', pathId);

    // Step 5: Initialize user AI memory
    await initializeUserMemory({
      user_id: userId,
      native_language: pathInput.native_language,
      target_language: pathInput.target_language,
      motivation: pathInput.motivation,
      motivation_custom: pathInput.motivation_custom,
      proficiency_level: pathInput.proficiency_level,
      commitment_stakes: pathInput.commitment_stakes,
    });
    console.log('[PathGeneration] User AI memory initialized');

    return {
      success: true,
      pathId,
    };
  } catch (error) {
    console.error('[PathGeneration] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Validates onboarding data before processing.
 *
 * @param data - Onboarding data to validate
 * @returns Error message if invalid, null if valid
 */
function validateOnboardingData(data: OnboardingData): string | null {
  if (!data.native_language) {
    return 'Native language is required';
  }

  if (!data.target_language) {
    return 'Target language is required';
  }

  if (!data.motivation && !data.motivation_custom) {
    return 'Motivation is required';
  }

  if (!data.proficiency_level) {
    return 'Proficiency level is required';
  }

  if (!data.timeline) {
    return 'Timeline is required';
  }

  if (!data.commitment_stakes) {
    return 'Commitment stakes are required';
  }

  return null;
}

/**
 * Transforms onboarding data into PathGenerationInput format for AI.
 *
 * Maps the onboarding hook data structure to the format expected by
 * the AI prompt generation system.
 *
 * @param userId - User's unique identifier
 * @param data - Onboarding data from useOnboardingV2 hook
 * @returns PathGenerationInput formatted for AI generation
 */
function transformOnboardingToInput(
  userId: string,
  data: OnboardingData
): PathGenerationInput {
  // Map proficiency level to standardized format
  const proficiencyMap: Record<string, 'beginner' | 'elementary' | 'intermediate' | 'advanced'> = {
    'beginner': 'beginner',
    'elementary': 'elementary',
    'intermediate': 'intermediate',
    'upper_intermediate': 'intermediate',
    'advanced': 'advanced',
  };

  const proficiency = proficiencyMap[data.proficiency_level || 'beginner'] || 'beginner';

  // Map timeline to standardized format
  const timelineMap: Record<string, '1_month' | '3_months' | '6_months' | '1_year'> = {
    '1-3_months': '1_month',
    '3-6_months': '3_months',
    '6-12_months': '6_months',
    'no_deadline': '1_year',
  };

  const timeline = timelineMap[data.timeline || '3-6_months'] || '3_months';

  return {
    user_id: userId,
    target_language: data.target_language!,
    native_language: data.native_language!,
    motivation: data.motivation || 'custom',
    motivation_custom: data.motivation_custom || undefined,
    why_now: data.why_now || undefined,
    proficiency_level: proficiency,
    timeline,
    previous_attempts: data.previous_attempts || undefined,
    commitment_stakes: data.commitment_stakes!,
  };
}

// ============================================================================
// AI GENERATION - TWO PHASE APPROACH
// ============================================================================

/**
 * Skeleton structure returned by phase 1 (path structure only, no detailed content)
 */
interface PathSkeleton {
  path_title: string;
  path_description: string;
  total_stairs: number;
  estimated_completion: string;
  stairs: Array<{
    order: number;
    title: string;
    emoji: string;
    description: string;
    grammar_focus?: string[];
    skills_required: string[];
    skills_unlocked: string[];
    estimated_days: number;
  }>;
}

/**
 * Detailed stair content returned by phase 2 (on-demand)
 */
interface StairDetailedContent {
  vocabulary: Array<{
    word: string;
    translation: string;
    pronunciation?: string;
    example_sentence?: string;
    example_translation?: string;
    part_of_speech: string;
    difficulty: string;
  }>;
  grammar_points: string[];
  scenarios: Array<{
    title: string;
    description: string;
    context: string;
    key_phrases: string[];
  }>;
}

/**
 * Phase 1: Generate path SKELETON only (fast, ~1-2 seconds)
 * Creates the structure without detailed vocabulary content.
 */
async function generatePathSkeleton(input: PathGenerationInput): Promise<PathSkeleton> {
  console.log('[PathGeneration] Phase 1: Generating path skeleton...');

  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: 2048, // Skeleton is small, 2K tokens is plenty
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const prompt = generatePathSkeletonPrompt(input);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  console.log('[PathGeneration] Skeleton received, length:', text.length);

  const skeleton = extractJSON<PathSkeleton>(text);

  // Validate skeleton has 8 stairs
  if (!skeleton.stairs || skeleton.stairs.length < 8) {
    throw new Error('Skeleton must have at least 8 stairs');
  }

  console.log('[PathGeneration] Skeleton validated:', skeleton.path_title);
  return skeleton;
}

/**
 * Phase 2: Generate detailed content for a SINGLE stair (on-demand)
 * Called when user is about to start a new stair.
 */
async function generateStairDetailedContent(
  stairSkeleton: PathSkeleton['stairs'][0],
  input: PathGenerationInput,
  userMetrics?: {
    vocab_mastery_rate?: number;
    common_mistakes?: string[];
    preferred_topics?: string[];
    speaking_confidence?: number;
  }
): Promise<StairDetailedContent> {
  console.log('[PathGeneration] Phase 2: Generating content for stair:', stairSkeleton.title);

  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: 4096, // Single stair content is ~2-3K tokens
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const prompt = generateStairContentPromptOnDemand(stairSkeleton, input, userMetrics);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  console.log('[PathGeneration] Stair content received, length:', text.length);

  const content = extractJSON<StairDetailedContent>(text);

  // Validate content
  if (!content.vocabulary || content.vocabulary.length < 5) {
    throw new Error('Stair content must have at least 5 vocabulary items');
  }

  console.log('[PathGeneration] Stair content validated, vocab count:', content.vocabulary.length);
  return content;
}

/**
 * Main function: Generates learning path using two-phase approach.
 *
 * Phase 1: Generate skeleton (structure only) - FAST
 * Phase 2: Generate detailed content for FIRST stair only
 *
 * Result: User gets started quickly, other stairs load on-demand.
 */
async function generateLearningPath(input: PathGenerationInput): Promise<GeneratedPath> {
  console.log('[PathGeneration] Starting two-phase path generation...');

  // Phase 1: Get skeleton
  const skeleton = await generatePathSkeleton(input);

  // Phase 2: Get detailed content for FIRST stair only
  const firstStairContent = await generateStairDetailedContent(skeleton.stairs[0], input);

  // Combine skeleton + first stair content into GeneratedPath
  const stairs: GeneratedStair[] = skeleton.stairs.map((stairSkeleton, index): GeneratedStair => {
    if (index === 0) {
      // First stair has full content - normalize vocabulary to match VocabItem type
      const normalizedVocab: VocabItem[] = firstStairContent.vocabulary.map(v => ({
        word: v.word,
        translation: v.translation,
        pronunciation: v.pronunciation,
        example_sentence: v.example_sentence || `Example with ${v.word}`,
        example_translation: v.example_translation || `Ejemplo con ${v.translation}`,
        part_of_speech: v.part_of_speech,
        difficulty: (['easy', 'medium', 'hard'].includes(v.difficulty)
          ? v.difficulty
          : 'medium') as 'easy' | 'medium' | 'hard',
      }));

      return {
        order: stairSkeleton.order,
        title: stairSkeleton.title,
        emoji: stairSkeleton.emoji,
        description: stairSkeleton.description,
        vocabulary: normalizedVocab,
        grammar_points: firstStairContent.grammar_points,
        scenarios: firstStairContent.scenarios,
        skills_required: stairSkeleton.skills_required,
        skills_unlocked: stairSkeleton.skills_unlocked,
        estimated_days: stairSkeleton.estimated_days,
        content_loaded: true,
      };
    } else {
      // Other stairs have skeleton only (content loaded on-demand later)
      return {
        order: stairSkeleton.order,
        title: stairSkeleton.title,
        emoji: stairSkeleton.emoji,
        description: stairSkeleton.description,
        vocabulary: [], // Empty - will be loaded on-demand
        grammar_points: stairSkeleton.grammar_focus || [],
        scenarios: [], // Empty - will be loaded on-demand
        skills_required: stairSkeleton.skills_required,
        skills_unlocked: stairSkeleton.skills_unlocked,
        estimated_days: stairSkeleton.estimated_days,
        content_loaded: false, // Flag to indicate content needs loading
      };
    }
  });

  const generatedPath: GeneratedPath = {
    path_title: skeleton.path_title,
    path_description: skeleton.path_description,
    total_stairs: skeleton.total_stairs,
    estimated_completion: skeleton.estimated_completion,
    stairs,
  };

  console.log('[PathGeneration] Two-phase generation complete!');
  console.log('[PathGeneration] - Path:', generatedPath.path_title);
  console.log('[PathGeneration] - First stair vocab:', firstStairContent.vocabulary.length, 'items');

  return generatedPath;
}

/**
 * Export for on-demand stair content loading.
 * Call this when user reaches ~80% of current stair to pre-load next one.
 */
export async function loadStairContentOnDemand(
  stairSkeleton: {
    order: number;
    title: string;
    description: string;
    grammar_focus?: string[];
    skills_required?: string[];
    skills_unlocked?: string[];
  },
  input: PathGenerationInput,
  userMetrics?: {
    vocab_mastery_rate?: number;
    common_mistakes?: string[];
    preferred_topics?: string[];
    speaking_confidence?: number;
  }
): Promise<StairDetailedContent> {
  return generateStairDetailedContent(
    {
      ...stairSkeleton,
      emoji: '',
      estimated_days: 7,
      skills_required: stairSkeleton.skills_required || [],
      skills_unlocked: stairSkeleton.skills_unlocked || [],
    },
    input,
    userMetrics
  );
}

// ============================================================================
// FALLBACK PATH GENERATION
// ============================================================================

/**
 * Generates a fallback learning path using templates when AI fails.
 *
 * Uses the PATH_TEMPLATES to create a basic but functional learning path
 * based on the user's motivation. This ensures users always get a path
 * even if AI generation fails.
 *
 * Now uses skeleton approach: only first stair has full content.
 *
 * @param motivation - User's primary motivation (career, travel, etc.)
 * @param targetLanguage - Target language being learned
 * @param proficiencyLevel - User's proficiency level
 * @returns GeneratedPath using template structure
 */
function generateFallbackPath(
  motivation: string,
  targetLanguage: string,
  proficiencyLevel: string
): GeneratedPath {
  console.log('[PathGeneration] Generating fallback path from template (skeleton approach)');

  // Get template for motivation, default to 'travel' if not found
  const templateKey = motivation as keyof typeof PATH_TEMPLATES;
  const template = PATH_TEMPLATES[templateKey] || PATH_TEMPLATES.travel;

  // Create stairs from template - only first stair gets full content
  const stairs: GeneratedStair[] = template.stairProgression.map((title, index) => {
    const isFirstStair = index === 0;

    return {
      order: index + 1,
      title,
      emoji: getStairEmoji(index),
      description: `Build your skills in ${title.toLowerCase()}`,
      // Only first stair gets vocabulary - others load on-demand
      vocabulary: isFirstStair ? generateBasicVocabulary(title, 12) : [],
      grammar_points: [
        'Basic sentence structure',
        'Common verb conjugations',
        'Question formation',
      ],
      // Only first stair gets scenarios - others load on-demand
      scenarios: isFirstStair ? [
        {
          title: `Practice ${title}`,
          description: `Real-world practice scenario for ${title.toLowerCase()}`,
          context: `You're in a situation where you need to use ${title.toLowerCase()}`,
          key_phrases: ['Hello', 'Thank you', 'Please', 'Excuse me'],
        },
        {
          title: `Advanced ${title}`,
          description: `More complex scenario for ${title.toLowerCase()}`,
          context: `Building on basics with more advanced ${title.toLowerCase()}`,
          key_phrases: ['How are you?', 'Nice to meet you', 'See you later'],
        },
      ] : [],
      skills_required: index === 0 ? [] : [`Skills from ${template.stairProgression[index - 1]}`],
      skills_unlocked: [`${title} mastery`],
      estimated_days: 7,
      // Flag for skeleton stairs that need content loaded
      ...(isFirstStair ? {} : { content_loaded: false }),
    } as GeneratedStair;
  });

  return {
    path_title: `Your ${targetLanguage} Journey: ${motivation}`,
    path_description: `A personalized path to help you achieve your ${motivation} goals in ${targetLanguage}. This path focuses on practical, real-world skills.`,
    total_stairs: stairs.length,
    estimated_completion: getEstimatedCompletion(stairs.length, proficiencyLevel),
    stairs,
  };
}

/**
 * Generates basic vocabulary items for a stair title.
 * This is a simple fallback - in production, you'd want a vocabulary database.
 */
function generateBasicVocabulary(title: string, count: number): any[] {
  // Simple placeholder vocabulary
  const vocabTemplates = [
    { word: 'hello', translation: 'hola', part_of_speech: 'interjection', difficulty: 'easy' },
    { word: 'goodbye', translation: 'adiós', part_of_speech: 'interjection', difficulty: 'easy' },
    { word: 'please', translation: 'por favor', part_of_speech: 'adverb', difficulty: 'easy' },
    { word: 'thank you', translation: 'gracias', part_of_speech: 'phrase', difficulty: 'easy' },
    { word: 'yes', translation: 'sí', part_of_speech: 'adverb', difficulty: 'easy' },
    { word: 'no', translation: 'no', part_of_speech: 'adverb', difficulty: 'easy' },
    { word: 'excuse me', translation: 'perdón', part_of_speech: 'phrase', difficulty: 'easy' },
    { word: 'sorry', translation: 'lo siento', part_of_speech: 'phrase', difficulty: 'easy' },
  ];

  // Generate vocabulary items with example sentences
  return Array.from({ length: count }, (_, i) => {
    const template = vocabTemplates[i % vocabTemplates.length];
    return {
      ...template,
      example_sentence: `Example sentence using ${template.word}`,
      example_translation: `Ejemplo usando ${template.translation}`,
    };
  });
}

/**
 * Gets an appropriate emoji for a stair based on its index.
 */
function getStairEmoji(index: number): string {
  const emojis = ['📱', '🎯', '💼', '🌍', '💬', '⭐', '🚀', '🎓'];
  return emojis[index % emojis.length];
}

/**
 * Estimates completion time based on number of stairs and proficiency level.
 */
function getEstimatedCompletion(stairCount: number, proficiencyLevel: string): string {
  const weeksPerStair = proficiencyLevel === 'beginner' ? 2 : 1;
  const totalWeeks = stairCount * weeksPerStair;

  if (totalWeeks < 4) return `${totalWeeks} weeks`;
  if (totalWeeks < 12) return `${Math.round(totalWeeks / 4)} months`;
  return `${Math.round(totalWeeks / 12)} months`;
}

// ============================================================================
// PATH STORAGE
// ============================================================================

/**
 * Orchestrates storing the generated path in the database.
 *
 * Creates database records in this order:
 * 1. learning_path record (main path container)
 * 2. section record (first section with 5-7 stairs)
 * 3. stair records (individual stairs with vocabulary and scenarios)
 *
 * @param userId - User's unique identifier
 * @param generatedPath - The AI-generated or template-based path
 * @param input - Original path generation input
 * @returns Promise resolving to the created path ID
 */
async function storePath(
  userId: string,
  generatedPath: GeneratedPath,
  input: PathGenerationInput
): Promise<string> {
  console.log('[PathGeneration] Storing path in database...');

  // Map proficiency levels to CEFR format for database
  const cefrMap: Record<string, string> = {
    'beginner': 'A1',
    'elementary': 'A2',
    'intermediate': 'B1',
    'upper_intermediate': 'B2',
    'advanced': 'C1',
  };
  const cefrLevel = cefrMap[input.proficiency_level] || 'A1';

  // Step 1: Create learning_path record
  const pathResult = await createLearningPath(userId, {
    title: generatedPath.path_title,
    description: generatedPath.path_description,
    target_language: input.target_language,
    native_language: input.native_language,
    motivation: input.motivation,
    proficiency_level: cefrLevel,
    timeline: input.timeline,
  });

  if (!pathResult) {
    console.error('[PathGeneration] createLearningPath returned null');
    console.error('[PathGeneration] Check database constraints and RLS policies');
    console.error('[PathGeneration] User ID:', userId);
    console.error('[PathGeneration] Path data:', JSON.stringify({
      title: generatedPath.path_title,
      total_stairs: generatedPath.total_stairs,
    }, null, 2));
    throw new Error('Failed to create learning path in database. Check console for details.');
  }

  const pathId = pathResult.id;
  console.log('[PathGeneration] Created learning_path with ID:', pathId);

  // Step 2: Create section record
  const sectionResult = await createSection(pathId, {
    order: 1,
    title: 'Section 1: Foundation',
    description: `First ${generatedPath.stairs.length} stairs of your learning journey`,
  });

  if (!sectionResult) {
    throw new Error('Failed to create section in database');
  }

  const sectionId = sectionResult.id;
  console.log('[PathGeneration] Created section with ID:', sectionId);

  // Step 3: Create stair records (batch insert)
  const stairsSuccess = await createStairsForSection(sectionId, generatedPath.stairs);

  if (!stairsSuccess) {
    throw new Error('Failed to create stairs in database');
  }

  console.log('[PathGeneration] Created', generatedPath.stairs.length, 'stairs');
  console.log('[PathGeneration] Path stored successfully!');

  return pathId;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  transformOnboardingToInput,
  generateFallbackPath,
  storePath,
  validateOnboardingData,
};
