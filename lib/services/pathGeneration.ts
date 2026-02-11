/**
 * Path Generation Service
 *
 * Orchestrates the complete flow from onboarding data to stored learning path.
 * This service is the central coordinator for:
 * - Converting onboarding data to AI-compatible format
 * - Generating personalized learning paths with Claude + Gemini AI Orchestration
 * - Storing paths in the database (learning_path, section, stairs)
 * - Initializing user AI memory for future personalization
 * - Handling fallback to templates when AI generation fails
 *
 * ## AI Architecture (Claude + Gemini Orchestration)
 * - **Claude (Supervisor)**: Strategic planning, structure creation, validation
 * - **Gemini (Worker)**: Bulk content generation (vocabulary, scenarios, etc.)
 * - Falls back to Gemini-only mode if Claude is unavailable
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
  AIOrchestrator,
  isOrchestrationAvailable,
  type OrchestrationProgress,
} from '@/lib/ai/orchestrator';

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
  target_accent: string | null;  // User's preferred accent (e.g., 'es-latam', 'en-british')
  motivation: string | null;
  motivation_custom: string | null;
  why_now: string | null;
  proficiency_level: string | null;
  previous_attempts: string | null;
  timeline: string | null;
  commitment_stakes: string | null;
  stakes: string | null;
  // New fields from enhanced onboarding
  profession: string | null;
  profession_custom: string | null;
  scenarios: string[] | null;
  min_practice_time: number | null;
  max_practice_time: number | null;
  days_per_week: number | null;
}

/**
 * Result of path creation operation.
 */
export interface PathCreationResult {
  success: boolean;
  pathId?: string;
  error?: string;
  /** AI orchestration metrics (when using Claude + Gemini) */
  metrics?: {
    totalDurationMs: number;
    planningDurationMs: number;
    contentGenerationDurationMs: number;
    usedClaude: boolean;
  };
}

/**
 * Options for path creation.
 */
export interface PathCreationOptions {
  /**
   * Progress callback for streaming UI updates.
   * Called throughout the generation process with progress info.
   */
  onProgress?: (progress: OrchestrationProgress) => void;
  /**
   * Callback when early reveal threshold is reached.
   * Allows showing partial stairs before all content is ready.
   */
  onEarlyRevealReady?: (partialStairs: GeneratedStair[]) => void;
  /**
   * Force Gemini-only mode even if Claude is available.
   * Useful for A/B testing or when Claude quota is exceeded.
   */
  forceGeminiOnly?: boolean;
}

// ============================================================================
// MAIN ORCHESTRATION FUNCTION
// ============================================================================

/**
 * Creates a complete personalized learning path from onboarding data.
 *
 * This is the main entry point that orchestrates the entire path generation flow:
 * 1. Validates and transforms onboarding data
 * 2. Uses Claude + Gemini AI orchestration (falls back to Gemini-only if needed)
 * 3. Stores the path in the database (learning_path, section, stairs)
 * 4. Initializes user AI memory for future personalization
 *
 * ## AI Architecture
 * When Claude is available:
 * - Claude generates the strategic STRUCTURE (staircase plan)
 * - Gemini generates the CONTENT for each stair (vocabulary, scenarios)
 * - Progress events emitted for streaming UI updates
 *
 * When Claude is unavailable:
 * - Falls back to Gemini-only two-phase approach
 * - Still generates high-quality personalized paths
 *
 * @param userId - The user's unique identifier
 * @param onboardingData - Data collected during onboarding
 * @param options - Optional configuration for progress callbacks
 * @returns Promise with success status and path ID or error message
 *
 * @example
 * ```typescript
 * const result = await createPersonalizedPath('user-123', onboardingData, {
 *   onProgress: (p) => setProgress(p.progress),
 *   onEarlyRevealReady: (stairs) => showPartialStairs(stairs),
 * });
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
  onboardingData: OnboardingData,
  options: PathCreationOptions = {}
): Promise<PathCreationResult> {
  console.log('[PathGeneration] Starting path creation for user:', userId);
  console.log('[PathGeneration] Onboarding data:', JSON.stringify(onboardingData, null, 2));

  // Check AI availability
  const aiStatus = isOrchestrationAvailable();
  console.log('[PathGeneration] AI Status:', aiStatus);

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

    // Step 3: Generate the learning path
    let generatedPath: GeneratedPath;
    let usedClaude = false;
    let metrics: PathCreationResult['metrics'] | undefined;

    // Use Claude + Gemini orchestration if available and not forced to Gemini-only
    const useOrchestration = aiStatus.claude && !options.forceGeminiOnly;

    if (useOrchestration) {
      console.log('[PathGeneration] Using Claude + Gemini orchestration');

      const orchestrator = new AIOrchestrator({
        onProgress: options.onProgress,
        onEarlyRevealReady: options.onEarlyRevealReady,
        earlyRevealThreshold: 50, // Trigger at 50% completion
      });

      const result = await orchestrator.generateLearningPath(pathInput);

      if (result.success && result.path) {
        generatedPath = result.path;
        usedClaude = true;
        metrics = {
          totalDurationMs: result.metrics?.totalDurationMs ?? 0,
          planningDurationMs: result.metrics?.planningDurationMs ?? 0,
          contentGenerationDurationMs: result.metrics?.contentGenerationDurationMs ?? 0,
          usedClaude: true,
        };
        console.log('[PathGeneration] Orchestrator generated path:', generatedPath.path_title);
        console.log('[PathGeneration] Total stairs:', generatedPath.total_stairs);
        console.log('[PathGeneration] Metrics:', metrics);
      } else {
        console.warn('[PathGeneration] Orchestrator failed, falling back to Gemini-only:', result.error);
        // Fall through to Gemini-only approach below
        try {
          generatedPath = await generateLearningPathGeminiOnly(pathInput, options.onProgress);
        } catch (geminiError) {
          console.error('[PathGeneration] Gemini fallback also failed:', geminiError);
          console.log('[PathGeneration] Falling back to template-based path');
          generatedPath = generateFallbackPath(
            pathInput.motivation,
            pathInput.target_language,
            pathInput.proficiency_level,
            pathInput.timeline
          );
        }
      }
    } else {
      // Gemini-only mode
      console.log('[PathGeneration] Using Gemini-only mode');
      try {
        generatedPath = await generateLearningPathGeminiOnly(pathInput, options.onProgress);
        console.log('[PathGeneration] Gemini generated path:', generatedPath.path_title);
        console.log('[PathGeneration] Total stairs:', generatedPath.total_stairs);
      } catch (aiError) {
        console.error('[PathGeneration] AI generation failed:', aiError);
        console.log('[PathGeneration] Falling back to template-based path');

        // Fallback to template-based generation
        generatedPath = generateFallbackPath(
          pathInput.motivation,
          pathInput.target_language,
          pathInput.proficiency_level,
          pathInput.timeline
        );
      }
    }

    // Step 4: Store the path in the database
    const pathId = await storePath(userId, generatedPath, pathInput);
    console.log('[PathGeneration] Path stored successfully with ID:', pathId);

    // Step 5: Initialize user AI memory
    await initializeUserMemory({
      user_id: userId,
      native_language: pathInput.native_language,
      target_language: pathInput.target_language,
      target_accent: pathInput.target_accent,
      motivation: pathInput.motivation,
      motivation_custom: pathInput.motivation_custom,
      proficiency_level: pathInput.proficiency_level,
      commitment_stakes: pathInput.commitment_stakes,
      timeline: pathInput.timeline,
      previous_attempts: pathInput.previous_attempts,
      why_now: pathInput.why_now,
      profession: pathInput.profession,
      profession_custom: pathInput.profession_custom,
      scenarios: pathInput.scenarios,
      min_practice_time: pathInput.min_practice_time,
      max_practice_time: pathInput.max_practice_time,
      days_per_week: pathInput.days_per_week,
    });
    console.log('[PathGeneration] User AI memory initialized');

    // Emit final progress
    if (options.onProgress) {
      options.onProgress({
        phase: 'complete',
        progress: 100,
        message: 'Your learning path is ready!',
        totalStairs: generatedPath.total_stairs,
      });
    }

    return {
      success: true,
      pathId,
      metrics,
    };
  } catch (error) {
    console.error('[PathGeneration] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generates a learning path using Gemini-only approach (two-phase).
 * This is the fallback when Claude is not available.
 */
async function generateLearningPathGeminiOnly(
  input: PathGenerationInput,
  onProgress?: (progress: OrchestrationProgress) => void
): Promise<GeneratedPath> {
  // Emit progress for skeleton phase
  onProgress?.({
    phase: 'planning',
    progress: 10,
    message: 'Creating your personalized learning path...',
  });

  const generatedPath = await generateLearningPath(input);

  // Emit progress for content phase
  onProgress?.({
    phase: 'generating_content',
    progress: 80,
    message: 'Adding vocabulary and scenarios...',
    totalStairs: generatedPath.total_stairs,
  });

  return generatedPath;
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
  const missing: string[] = [];

  if (!data.native_language) {
    missing.push('native language');
  }

  if (!data.target_language) {
    missing.push('target language');
  }

  if (!data.motivation && !data.motivation_custom) {
    missing.push('motivation');
  }

  if (!data.proficiency_level) {
    missing.push('proficiency level');
  }

  if (!data.timeline) {
    missing.push('timeline');
  }

  if (!data.commitment_stakes && !data.stakes && (!data.scenarios || data.scenarios.length === 0)) {
    missing.push('scenarios');
  }

  if (missing.length > 0) {
    return `Onboarding incomplete — missing: ${missing.join(', ')}. Please go back and complete all steps.`;
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
  // Map proficiency level to standardized format (preserve upper_intermediate)
  const proficiencyMap: Record<string, 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced'> = {
    'beginner': 'beginner',
    'elementary': 'elementary',
    'intermediate': 'intermediate',
    'upper_intermediate': 'upper_intermediate',
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
    target_accent: data.target_accent || undefined,  // Preserve accent for voice conversations
    motivation: data.motivation || 'custom',
    motivation_custom: data.motivation_custom || undefined,
    why_now: data.why_now || undefined,
    proficiency_level: proficiency,
    timeline,
    previous_attempts: data.previous_attempts || undefined,
    commitment_stakes: (data.commitment_stakes || data.stakes || (data.scenarios ? data.scenarios[0] : ''))!,
    profession: data.profession || undefined,
    profession_custom: data.profession_custom || undefined,
    scenarios: data.scenarios || undefined,
    min_practice_time: data.min_practice_time || undefined,
    max_practice_time: data.max_practice_time || undefined,
    days_per_week: data.days_per_week || undefined,
  };
}

// ============================================================================
// STAIR COUNT CALCULATION
// ============================================================================

/**
 * Derives the optimal stair count from user timeline + proficiency.
 * Returns a count between 4 and 10, with the last stair reserved for recalibration.
 */
export function calculateStairCount(
  timeline: '1_month' | '3_months' | '6_months' | '1_year',
  proficiency: 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced'
): number {
  const isAdvanced = proficiency === 'upper_intermediate' || proficiency === 'intermediate' || proficiency === 'advanced';

  switch (timeline) {
    case '1_month':
      return isAdvanced ? 5 : 4;
    case '3_months':
      return isAdvanced ? 7 : 6;
    case '6_months':
      return 8;
    case '1_year':
      return 10;
    default:
      return 6;
  }
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

  const stairCount = calculateStairCount(
    input.timeline as '1_month' | '3_months' | '6_months' | '1_year',
    input.proficiency_level as 'beginner' | 'elementary' | 'intermediate' | 'advanced'
  );

  const prompt = generatePathSkeletonPrompt(input, undefined, stairCount);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  console.log('[PathGeneration] Skeleton received, length:', text.length);

  const skeleton = extractJSON<PathSkeleton>(text);

  // Validate skeleton has minimum stairs (flexible: 4-12)
  if (!skeleton.stairs || skeleton.stairs.length < 4) {
    throw new Error('Skeleton must have at least 4 stairs');
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

  // Ensure last stair is a recalibration stair
  const lastStair = stairs[stairs.length - 1];
  if (!lastStair.is_recalibration) {
    stairs.push({
      order: stairs.length + 1,
      title: 'Recalibration & Review',
      emoji: '🔄',
      description: 'Review everything you\'ve learned and assess your progress to plan your next steps.',
      vocabulary: [],
      grammar_points: ['Review all grammar from previous stairs'],
      scenarios: [],
      skills_required: stairs.map(s => s.title),
      skills_unlocked: ['Self-assessment', 'Path adaptation'],
      estimated_days: 3,
      content_loaded: false,
      is_recalibration: true,
    });
  }

  const generatedPath: GeneratedPath = {
    path_title: skeleton.path_title,
    path_description: skeleton.path_description,
    total_stairs: stairs.length,
    estimated_completion: skeleton.estimated_completion,
    stairs,
  };

  console.log('[PathGeneration] Two-phase generation complete!');
  console.log('[PathGeneration] - Path:', generatedPath.path_title);
  console.log('[PathGeneration] - Total stairs (incl. recalibration):', stairs.length);
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
 * Stair count is derived from timeline + proficiency, with recalibration at end.
 *
 * @param motivation - User's primary motivation (career, travel, etc.)
 * @param targetLanguage - Target language being learned
 * @param proficiencyLevel - User's proficiency level
 * @param timeline - User's timeline (optional, defaults to 3_months)
 * @returns GeneratedPath using template structure
 */
function generateFallbackPath(
  motivation: string,
  targetLanguage: string,
  proficiencyLevel: string,
  timeline: string = '3_months'
): GeneratedPath {
  console.log('[PathGeneration] Generating fallback path from template (skeleton approach)');

  // Get template for motivation, default to 'travel' if not found
  const templateKey = motivation as keyof typeof PATH_TEMPLATES;
  const template = PATH_TEMPLATES[templateKey] || PATH_TEMPLATES.travel;

  // Calculate stair count based on timeline + proficiency
  const stairCount = calculateStairCount(
    timeline as '1_month' | '3_months' | '6_months' | '1_year',
    proficiencyLevel as 'beginner' | 'elementary' | 'intermediate' | 'advanced'
  );

  // Trim template progression to fit stair count (minus 1 for recalibration)
  const contentStairCount = stairCount - 1;
  const progression = template.stairProgression.slice(0, contentStairCount);

  // Create stairs from template - only first stair gets full content
  // Each stair gets vocabulary and scenarios that match its blended theme
  const stairs: GeneratedStair[] = progression.map((title, index) => {
    const isFirstStair = index === 0;

    return {
      order: index + 1,
      title,
      emoji: getStairEmoji(index),
      description: getStairDescription(title, motivation),
      vocabulary: isFirstStair ? generateStairVocabulary(title, motivation, 12, targetLanguage) : [],
      grammar_points: getStairGrammarPoints(index),
      scenarios: isFirstStair ? generateStairScenarios(title, motivation) : [],
      skills_required: index === 0 ? [] : [`${progression[index - 1]} mastery`],
      skills_unlocked: [`${title} mastery`],
      estimated_days: 7,
      ...(isFirstStair ? {} : { content_loaded: false }),
    } as GeneratedStair;
  });

  // Add recalibration stair at the end
  stairs.push({
    order: stairs.length + 1,
    title: 'Recalibration & Review',
    emoji: '🔄',
    description: 'Review everything you\'ve learned and assess your progress to plan your next steps.',
    vocabulary: [],
    grammar_points: ['Review all grammar from previous stairs'],
    scenarios: [],
    skills_required: progression.map(t => `${t} mastery`),
    skills_unlocked: ['Self-assessment', 'Path adaptation'],
    estimated_days: 3,
    content_loaded: false,
    is_recalibration: true,
  });

  // Map language codes to display names
  const langNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French' };
  const motivationNames: Record<string, string> = {
    travel: 'Travel & Adventure', career: 'Career & Business', education: 'Education',
    love: 'Love & Relationships', relocation: 'Living Abroad', challenge: 'Personal Growth', custom: 'Your Goals',
  };
  const langDisplay = langNames[targetLanguage] || targetLanguage;
  const motivationDisplay = motivationNames[motivation] || 'Your Goals';

  return {
    path_title: `Your ${langDisplay} Journey: ${motivationDisplay}`,
    path_description: `A personalized path to help you achieve your goals in ${langDisplay}. This path focuses on practical, real-world skills.`,
    total_stairs: stairs.length,
    estimated_completion: getEstimatedCompletion(stairs.length, proficiencyLevel),
    stairs,
  };
}

// ============================================================================
// STAIR-SPECIFIC VOCABULARY & SCENARIO CATALOGUES
// Blended Learning Model: 60% universal + 40% field-specific per stair
// ============================================================================

/**
 * Universal vocabulary by stair theme (shared across all motivations).
 * These are the 60% universal words every learner needs.
 */
const UNIVERSAL_VOCAB: Record<string, Array<{ word: string; translation: string; part_of_speech: string; difficulty: string; example_sentence: string; example_translation: string }>> = {
  'meeting_people': [
    { word: 'hello', translation: 'hola', part_of_speech: 'interjection', difficulty: 'easy', example_sentence: 'Hello, my name is Ana.', example_translation: 'Hola, mi nombre es Ana.' },
    { word: 'nice to meet you', translation: 'mucho gusto', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Nice to meet you, Maria!', example_translation: '¡Mucho gusto, María!' },
    { word: 'my name is', translation: 'me llamo', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'My name is Carlos.', example_translation: 'Me llamo Carlos.' },
    { word: 'how are you', translation: 'cómo estás', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Hi! How are you today?', example_translation: '¡Hola! ¿Cómo estás hoy?' },
    { word: 'good morning', translation: 'buenos días', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Good morning, how are you?', example_translation: 'Buenos días, ¿cómo estás?' },
    { word: 'goodbye', translation: 'adiós', part_of_speech: 'interjection', difficulty: 'easy', example_sentence: 'Goodbye, see you tomorrow!', example_translation: '¡Adiós, nos vemos mañana!' },
    { word: 'please', translation: 'por favor', part_of_speech: 'adverb', difficulty: 'easy', example_sentence: 'Can you help me, please?', example_translation: '¿Puedes ayudarme, por favor?' },
    { word: 'thank you', translation: 'gracias', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Thank you very much!', example_translation: '¡Muchas gracias!' },
  ],
  'talking_about_yourself': [
    { word: 'I am', translation: 'yo soy', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I am a student.', example_translation: 'Yo soy estudiante.' },
    { word: 'I live in', translation: 'yo vivo en', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'I live in New York.', example_translation: 'Yo vivo en Nueva York.' },
    { word: 'I like', translation: 'me gusta', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I like coffee in the morning.', example_translation: 'Me gusta el café por la mañana.' },
    { word: 'I work', translation: 'yo trabajo', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I work in an office.', example_translation: 'Yo trabajo en una oficina.' },
    { word: 'family', translation: 'familia', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'My family lives in Spain.', example_translation: 'Mi familia vive en España.' },
    { word: 'friend', translation: 'amigo', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'She is my best friend.', example_translation: 'Ella es mi mejor amiga.' },
    { word: 'country', translation: 'país', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'What country are you from?', example_translation: '¿De qué país eres?' },
    { word: 'age', translation: 'edad', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'I am 25 years old.', example_translation: 'Tengo 25 años.' },
  ],
  'daily_conversations': [
    { word: 'today', translation: 'hoy', part_of_speech: 'adverb', difficulty: 'easy', example_sentence: 'What are you doing today?', example_translation: '¿Qué haces hoy?' },
    { word: 'tomorrow', translation: 'mañana', part_of_speech: 'adverb', difficulty: 'easy', example_sentence: 'I have a meeting tomorrow.', example_translation: 'Tengo una reunión mañana.' },
    { word: 'time', translation: 'hora/tiempo', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'What time is it?', example_translation: '¿Qué hora es?' },
    { word: 'to need', translation: 'necesitar', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'I need to buy food.', example_translation: 'Necesito comprar comida.' },
    { word: 'to go', translation: 'ir', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'Where do you want to go?', example_translation: '¿A dónde quieres ir?' },
    { word: 'to eat', translation: 'comer', part_of_speech: 'verb', difficulty: 'easy', example_sentence: "Let's eat together.", example_translation: 'Comamos juntos.' },
    { word: 'to buy', translation: 'comprar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I want to buy a book.', example_translation: 'Quiero comprar un libro.' },
    { word: 'money', translation: 'dinero', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'How much money do I need?', example_translation: '¿Cuánto dinero necesito?' },
  ],
  'food_and_plans': [
    { word: 'restaurant', translation: 'restaurante', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'This restaurant is very good.', example_translation: 'Este restaurante es muy bueno.' },
    { word: 'menu', translation: 'menú', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Can I see the menu?', example_translation: '¿Puedo ver el menú?' },
    { word: 'water', translation: 'agua', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'A glass of water, please.', example_translation: 'Un vaso de agua, por favor.' },
    { word: 'to order', translation: 'pedir', part_of_speech: 'verb', difficulty: 'medium', example_sentence: "I'd like to order the chicken.", example_translation: 'Me gustaría pedir el pollo.' },
    { word: 'the bill', translation: 'la cuenta', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'The bill, please.', example_translation: 'La cuenta, por favor.' },
    { word: 'delicious', translation: 'delicioso', part_of_speech: 'adjective', difficulty: 'easy', example_sentence: 'This food is delicious!', example_translation: '¡Esta comida es deliciosa!' },
    { word: 'to make plans', translation: 'hacer planes', part_of_speech: 'phrase', difficulty: 'medium', example_sentence: "Let's make plans for Friday.", example_translation: 'Hagamos planes para el viernes.' },
    { word: 'weekend', translation: 'fin de semana', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'What are you doing this weekend?', example_translation: '¿Qué haces este fin de semana?' },
  ],
  'expressing_opinions': [
    { word: 'I think', translation: 'yo creo/pienso', part_of_speech: 'phrase', difficulty: 'medium', example_sentence: 'I think this is a good idea.', example_translation: 'Creo que es una buena idea.' },
    { word: 'I agree', translation: 'estoy de acuerdo', part_of_speech: 'phrase', difficulty: 'medium', example_sentence: 'I completely agree with you.', example_translation: 'Estoy completamente de acuerdo contigo.' },
    { word: 'I disagree', translation: 'no estoy de acuerdo', part_of_speech: 'phrase', difficulty: 'medium', example_sentence: 'I disagree, I see it differently.', example_translation: 'No estoy de acuerdo, lo veo diferente.' },
    { word: 'because', translation: 'porque', part_of_speech: 'conjunction', difficulty: 'easy', example_sentence: 'I like it because it is fun.', example_translation: 'Me gusta porque es divertido.' },
    { word: 'better', translation: 'mejor', part_of_speech: 'adjective', difficulty: 'easy', example_sentence: 'This one is better than that one.', example_translation: 'Este es mejor que ese.' },
    { word: 'important', translation: 'importante', part_of_speech: 'adjective', difficulty: 'easy', example_sentence: 'This is very important.', example_translation: 'Esto es muy importante.' },
    { word: 'interesting', translation: 'interesante', part_of_speech: 'adjective', difficulty: 'easy', example_sentence: 'That movie was really interesting.', example_translation: 'Esa película fue muy interesante.' },
    { word: 'to prefer', translation: 'preferir', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'I prefer tea over coffee.', example_translation: 'Prefiero el té al café.' },
  ],
  'asking_questions': [
    { word: 'where', translation: 'dónde', part_of_speech: 'adverb', difficulty: 'easy', example_sentence: 'Where is the bathroom?', example_translation: '¿Dónde está el baño?' },
    { word: 'how much', translation: 'cuánto', part_of_speech: 'adverb', difficulty: 'easy', example_sentence: 'How much does this cost?', example_translation: '¿Cuánto cuesta esto?' },
    { word: 'can you repeat', translation: 'puede repetir', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Can you repeat that, please?', example_translation: '¿Puede repetir eso, por favor?' },
    { word: 'speak slowly', translation: 'hablar despacio', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Speak slowly, please.', example_translation: 'Hable despacio, por favor.' },
    { word: 'what does it mean', translation: 'qué significa', part_of_speech: 'phrase', difficulty: 'medium', example_sentence: 'What does this word mean?', example_translation: '¿Qué significa esta palabra?' },
    { word: 'I don\'t understand', translation: 'no entiendo', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Sorry, I don\'t understand.', example_translation: 'Perdón, no entiendo.' },
    { word: 'to help', translation: 'ayudar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'Can you help me?', example_translation: '¿Puedes ayudarme?' },
    { word: 'to know', translation: 'saber', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'Do you know where the station is?', example_translation: '¿Sabes dónde está la estación?' },
  ],
  'handling_problems': [
    { word: 'problem', translation: 'problema', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'I have a problem with my order.', example_translation: 'Tengo un problema con mi pedido.' },
    { word: 'to need help', translation: 'necesitar ayuda', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'I need help, please.', example_translation: 'Necesito ayuda, por favor.' },
    { word: 'wrong', translation: 'equivocado/mal', part_of_speech: 'adjective', difficulty: 'medium', example_sentence: 'Something is wrong.', example_translation: 'Algo está mal.' },
    { word: 'to fix', translation: 'arreglar', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'Can you fix this?', example_translation: '¿Puedes arreglar esto?' },
    { word: 'sorry', translation: 'lo siento', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Sorry about the confusion.', example_translation: 'Lo siento por la confusión.' },
    { word: 'to wait', translation: 'esperar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'Can you wait a moment?', example_translation: '¿Puedes esperar un momento?' },
    { word: 'emergency', translation: 'emergencia', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'This is an emergency!', example_translation: '¡Esto es una emergencia!' },
    { word: 'to call', translation: 'llamar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I need to call a doctor.', example_translation: 'Necesito llamar a un doctor.' },
  ],
  'deeper_conversations': [
    { word: 'to believe', translation: 'creer', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'I believe in hard work.', example_translation: 'Creo en el trabajo duro.' },
    { word: 'experience', translation: 'experiencia', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'That was an amazing experience.', example_translation: 'Fue una experiencia increíble.' },
    { word: 'future', translation: 'futuro', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'What are your plans for the future?', example_translation: '¿Cuáles son tus planes para el futuro?' },
    { word: 'to dream', translation: 'soñar', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'I dream of traveling the world.', example_translation: 'Sueño con viajar por el mundo.' },
    { word: 'culture', translation: 'cultura', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'I love learning about new cultures.', example_translation: 'Me encanta aprender sobre nuevas culturas.' },
    { word: 'to remember', translation: 'recordar', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'I remember my first trip.', example_translation: 'Recuerdo mi primer viaje.' },
    { word: 'to change', translation: 'cambiar', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'People can always change.', example_translation: 'Las personas siempre pueden cambiar.' },
    { word: 'happiness', translation: 'felicidad', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'Happiness comes from within.', example_translation: 'La felicidad viene de adentro.' },
  ],
};

/**
 * French translations for universal vocabulary (fallback path).
 * Used when target_language is 'fr' to avoid serving Spanish words to French learners.
 */
const UNIVERSAL_VOCAB_FR: Record<string, Array<{ word: string; translation: string; part_of_speech: string; difficulty: string; example_sentence: string; example_translation: string }>> = {
  'meeting_people': [
    { word: 'bonjour', translation: 'hello', part_of_speech: 'interjection', difficulty: 'easy', example_sentence: 'Bonjour, je m\'appelle Ana.', example_translation: 'Hello, my name is Ana.' },
    { word: 'enchanté', translation: 'nice to meet you', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Enchanté, Marie !', example_translation: 'Nice to meet you, Marie!' },
    { word: 'je m\'appelle', translation: 'my name is', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Je m\'appelle Carlos.', example_translation: 'My name is Carlos.' },
    { word: 'comment allez-vous', translation: 'how are you', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Bonjour ! Comment allez-vous aujourd\'hui ?', example_translation: 'Hello! How are you today?' },
    { word: 'au revoir', translation: 'goodbye', part_of_speech: 'interjection', difficulty: 'easy', example_sentence: 'Au revoir, à demain !', example_translation: 'Goodbye, see you tomorrow!' },
    { word: 's\'il vous plaît', translation: 'please', part_of_speech: 'adverb', difficulty: 'easy', example_sentence: 'Pouvez-vous m\'aider, s\'il vous plaît ?', example_translation: 'Can you help me, please?' },
    { word: 'merci', translation: 'thank you', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Merci beaucoup !', example_translation: 'Thank you very much!' },
    { word: 'excusez-moi', translation: 'excuse me', part_of_speech: 'phrase', difficulty: 'easy', example_sentence: 'Excusez-moi, où est la gare ?', example_translation: 'Excuse me, where is the station?' },
  ],
  'daily_conversations': [
    { word: 'aujourd\'hui', translation: 'today', part_of_speech: 'adverb', difficulty: 'easy', example_sentence: 'Que faites-vous aujourd\'hui ?', example_translation: 'What are you doing today?' },
    { word: 'demain', translation: 'tomorrow', part_of_speech: 'adverb', difficulty: 'easy', example_sentence: 'J\'ai une réunion demain.', example_translation: 'I have a meeting tomorrow.' },
    { word: 'l\'heure', translation: 'time', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Quelle heure est-il ?', example_translation: 'What time is it?' },
    { word: 'avoir besoin', translation: 'to need', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'J\'ai besoin d\'acheter de la nourriture.', example_translation: 'I need to buy food.' },
    { word: 'aller', translation: 'to go', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'Où voulez-vous aller ?', example_translation: 'Where do you want to go?' },
    { word: 'manger', translation: 'to eat', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'Mangeons ensemble.', example_translation: 'Let\'s eat together.' },
    { word: 'acheter', translation: 'to buy', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'Je veux acheter un livre.', example_translation: 'I want to buy a book.' },
    { word: 'argent', translation: 'money', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Combien d\'argent ai-je besoin ?', example_translation: 'How much money do I need?' },
  ],
};

/**
 * Field-specific vocabulary by motivation (the 40% specialist words).
 */
const FIELD_VOCAB: Record<string, Record<string, Array<{ word: string; translation: string; part_of_speech: string; difficulty: string; example_sentence: string; example_translation: string }>>> = {
  career: {
    'meeting_people': [
      { word: 'colleague', translation: 'colega', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'This is my colleague from marketing.', example_translation: 'Este es mi colega de marketing.' },
      { word: 'business card', translation: 'tarjeta de presentación', part_of_speech: 'noun', difficulty: 'medium', example_sentence: "Here's my business card.", example_translation: 'Aquí tiene mi tarjeta de presentación.' },
      { word: 'company', translation: 'empresa', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Which company do you work for?', example_translation: '¿En qué empresa trabajas?' },
      { word: 'meeting', translation: 'reunión', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'We have a meeting at 3.', example_translation: 'Tenemos una reunión a las 3.' },
    ],
    'talking_about_yourself': [
      { word: 'experience', translation: 'experiencia', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'I have 5 years of experience.', example_translation: 'Tengo 5 años de experiencia.' },
      { word: 'position', translation: 'puesto/cargo', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'What is your current position?', example_translation: '¿Cuál es tu puesto actual?' },
      { word: 'skills', translation: 'habilidades', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'My main skills are leadership and communication.', example_translation: 'Mis principales habilidades son liderazgo y comunicación.' },
      { word: 'goal', translation: 'meta/objetivo', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'My goal is to grow in this company.', example_translation: 'Mi meta es crecer en esta empresa.' },
    ],
    'daily_conversations': [
      { word: 'deadline', translation: 'fecha límite', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'The deadline is next Friday.', example_translation: 'La fecha límite es el próximo viernes.' },
      { word: 'email', translation: 'correo electrónico', part_of_speech: 'noun', difficulty: 'easy', example_sentence: "I'll send you an email.", example_translation: 'Te enviaré un correo electrónico.' },
      { word: 'schedule', translation: 'horario', part_of_speech: 'noun', difficulty: 'medium', example_sentence: "Let me check my schedule.", example_translation: 'Déjame revisar mi horario.' },
      { word: 'project', translation: 'proyecto', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'This project is very important.', example_translation: 'Este proyecto es muy importante.' },
    ],
    'expressing_opinions': [
      { word: 'strategy', translation: 'estrategia', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'We need a new strategy.', example_translation: 'Necesitamos una nueva estrategia.' },
      { word: 'proposal', translation: 'propuesta', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'I have a proposal for the team.', example_translation: 'Tengo una propuesta para el equipo.' },
      { word: 'budget', translation: 'presupuesto', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'The budget is limited this quarter.', example_translation: 'El presupuesto es limitado este trimestre.' },
      { word: 'to approve', translation: 'aprobar', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'Did the manager approve the plan?', example_translation: '¿El gerente aprobó el plan?' },
    ],
  },
  travel: {
    'meeting_people': [
      { word: 'tourist', translation: 'turista', part_of_speech: 'noun', difficulty: 'easy', example_sentence: "I'm a tourist from the US.", example_translation: 'Soy turista de Estados Unidos.' },
      { word: 'hostel', translation: 'hostal', part_of_speech: 'noun', difficulty: 'easy', example_sentence: "I'm staying at a hostel nearby.", example_translation: 'Me estoy quedando en un hostal cercano.' },
      { word: 'to travel', translation: 'viajar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I love to travel to new places.', example_translation: 'Me encanta viajar a lugares nuevos.' },
      { word: 'passport', translation: 'pasaporte', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Do I need my passport here?', example_translation: '¿Necesito mi pasaporte aquí?' },
    ],
    'daily_conversations': [
      { word: 'map', translation: 'mapa', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Do you have a map of the city?', example_translation: '¿Tienes un mapa de la ciudad?' },
      { word: 'station', translation: 'estación', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Where is the train station?', example_translation: '¿Dónde está la estación de tren?' },
      { word: 'ticket', translation: 'boleto', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'One ticket to the center, please.', example_translation: 'Un boleto al centro, por favor.' },
      { word: 'to get lost', translation: 'perderse', part_of_speech: 'verb', difficulty: 'medium', example_sentence: "I think I'm lost.", example_translation: 'Creo que estoy perdido.' },
    ],
    'food_and_plans': [
      { word: 'local food', translation: 'comida local', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'I want to try the local food.', example_translation: 'Quiero probar la comida local.' },
      { word: 'reservation', translation: 'reservación', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'I have a reservation for two.', example_translation: 'Tengo una reservación para dos.' },
      { word: 'to recommend', translation: 'recomendar', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'Can you recommend a good place?', example_translation: '¿Puedes recomendar un buen lugar?' },
      { word: 'sightseeing', translation: 'turismo', part_of_speech: 'noun', difficulty: 'medium', example_sentence: "We're going sightseeing tomorrow.", example_translation: 'Vamos a hacer turismo mañana.' },
    ],
    'handling_problems': [
      { word: 'lost luggage', translation: 'equipaje perdido', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'My luggage is lost!', example_translation: '¡Mi equipaje está perdido!' },
      { word: 'embassy', translation: 'embajada', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'Where is the nearest embassy?', example_translation: '¿Dónde está la embajada más cercana?' },
      { word: 'pharmacy', translation: 'farmacia', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Is there a pharmacy nearby?', example_translation: '¿Hay una farmacia cerca?' },
      { word: 'insurance', translation: 'seguro', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'I have travel insurance.', example_translation: 'Tengo seguro de viaje.' },
    ],
  },
  love: {
    'meeting_people': [
      { word: 'beautiful', translation: 'hermoso/a', part_of_speech: 'adjective', difficulty: 'easy', example_sentence: 'You look beautiful tonight.', example_translation: 'Te ves hermosa esta noche.' },
      { word: 'single', translation: 'soltero/a', part_of_speech: 'adjective', difficulty: 'easy', example_sentence: 'Are you single?', example_translation: '¿Estás soltero/a?' },
      { word: 'to like', translation: 'gustar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I like your smile.', example_translation: 'Me gusta tu sonrisa.' },
      { word: 'date', translation: 'cita', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Would you like to go on a date?', example_translation: '¿Te gustaría ir a una cita?' },
    ],
    'talking_about_yourself': [
      { word: 'hobby', translation: 'pasatiempo', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'My hobbies are cooking and reading.', example_translation: 'Mis pasatiempos son cocinar y leer.' },
      { word: 'to enjoy', translation: 'disfrutar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I enjoy spending time with you.', example_translation: 'Disfruto pasar tiempo contigo.' },
      { word: 'personality', translation: 'personalidad', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'You have a great personality.', example_translation: 'Tienes una gran personalidad.' },
      { word: 'relationship', translation: 'relación', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'I want a serious relationship.', example_translation: 'Quiero una relación seria.' },
    ],
    'expressing_opinions': [
      { word: 'to love', translation: 'amar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I love you.', example_translation: 'Te amo.' },
      { word: 'to miss', translation: 'extrañar', part_of_speech: 'verb', difficulty: 'medium', example_sentence: 'I miss you so much.', example_translation: 'Te extraño mucho.' },
      { word: 'feelings', translation: 'sentimientos', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'I have strong feelings for you.', example_translation: 'Tengo sentimientos fuertes por ti.' },
      { word: 'happy', translation: 'feliz', part_of_speech: 'adjective', difficulty: 'easy', example_sentence: 'You make me so happy.', example_translation: 'Me haces tan feliz.' },
    ],
  },
  education: {
    'meeting_people': [
      { word: 'professor', translation: 'profesor/a', part_of_speech: 'noun', difficulty: 'easy', example_sentence: "I'm Professor Garcia.", example_translation: 'Soy el Profesor García.' },
      { word: 'classmate', translation: 'compañero de clase', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'She is my classmate.', example_translation: 'Ella es mi compañera de clase.' },
      { word: 'to study', translation: 'estudiar', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I study at the university.', example_translation: 'Estudio en la universidad.' },
      { word: 'major/degree', translation: 'carrera', part_of_speech: 'noun', difficulty: 'medium', example_sentence: 'What is your major?', example_translation: '¿Cuál es tu carrera?' },
    ],
    'daily_conversations': [
      { word: 'homework', translation: 'tarea', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'Did you finish the homework?', example_translation: '¿Terminaste la tarea?' },
      { word: 'library', translation: 'biblioteca', part_of_speech: 'noun', difficulty: 'easy', example_sentence: "Let's study at the library.", example_translation: 'Vamos a estudiar en la biblioteca.' },
      { word: 'exam', translation: 'examen', part_of_speech: 'noun', difficulty: 'easy', example_sentence: 'The exam is next week.', example_translation: 'El examen es la próxima semana.' },
      { word: 'to learn', translation: 'aprender', part_of_speech: 'verb', difficulty: 'easy', example_sentence: 'I want to learn something new.', example_translation: 'Quiero aprender algo nuevo.' },
    ],
  },
};

/**
 * Maps a stair title to a vocabulary theme key.
 */
function getVocabTheme(stairTitle: string): string {
  const title = stairTitle.toLowerCase();
  if (title.includes('meeting') || title.includes('greeting') || title.includes('first')) return 'meeting_people';
  if (title.includes('yourself') || title.includes('experience') || title.includes('know')) return 'talking_about_yourself';
  if (title.includes('daily') || title.includes('getting around') || title.includes('errand') || title.includes('office') || title.includes('transport')) return 'daily_conversations';
  if (title.includes('food') || title.includes('plan') || title.includes('restaurant') || title.includes('shopping')) return 'food_and_plans';
  if (title.includes('opinion') || title.includes('feeling') || title.includes('express')) return 'expressing_opinions';
  if (title.includes('question') || title.includes('asking') || title.includes('interview') || title.includes('help')) return 'asking_questions';
  if (title.includes('problem') || title.includes('handling') || title.includes('emergenc') || title.includes('negotiat') || title.includes('disagree')) return 'handling_problems';
  if (title.includes('deep') || title.includes('advanced') || title.includes('network') || title.includes('presentation') || title.includes('debate') || title.includes('fluency') || title.includes('story') || title.includes('future') || title.includes('dream')) return 'deeper_conversations';
  return 'daily_conversations'; // safe default
}

/**
 * Generates stair-specific vocabulary following the Blended Learning Model.
 * 60% universal words + 40% field-specific words, matched to the stair's theme.
 */
function generateStairVocabulary(stairTitle: string, motivation: string, count: number, targetLanguage?: string): any[] {
  const theme = getVocabTheme(stairTitle);
  // Select language-appropriate universal vocabulary (French gets French fallback)
  const vocabSource = targetLanguage === 'fr' ? UNIVERSAL_VOCAB_FR : UNIVERSAL_VOCAB;
  const universal = vocabSource[theme] || vocabSource['daily_conversations'] || UNIVERSAL_VOCAB['daily_conversations'];

  // Get field-specific vocab for this motivation + theme
  const motivationVocab = FIELD_VOCAB[motivation as keyof typeof FIELD_VOCAB];
  const fieldSpecific = motivationVocab?.[theme] || [];

  // Blend: take ~60% universal, ~40% field-specific
  const universalCount = Math.ceil(count * 0.6);
  const fieldCount = count - universalCount;

  const blended = [
    ...universal.slice(0, universalCount),
    ...fieldSpecific.slice(0, fieldCount),
  ];

  // If we don't have enough, pad with remaining universal
  while (blended.length < count && blended.length < universal.length + fieldSpecific.length) {
    const remaining = [...universal, ...fieldSpecific].filter(
      v => !blended.some(b => b.word === v.word)
    );
    if (remaining.length === 0) break;
    blended.push(remaining[0]);
  }

  return blended.slice(0, count);
}

/**
 * Generates stair-specific scenarios matching the stair's blended theme.
 */
function generateStairScenarios(stairTitle: string, motivation: string): Array<{ title: string; description: string; context: string; key_phrases: string[] }> {
  const theme = getVocabTheme(stairTitle);

  const scenarioTemplates: Record<string, Record<string, Array<{ title: string; description: string; context: string; key_phrases: string[] }>>> = {
    career: {
      'meeting_people': [
        { title: 'Conference Networking', description: 'Introduce yourself at a professional event', context: "You're at a business conference and need to network with other professionals.", key_phrases: ['Nice to meet you', 'I work at...', "Here's my card", 'What do you do?'] },
        { title: 'First Day at the Office', description: 'Meet your new coworkers', context: "It's your first day at a new job and you need to introduce yourself to the team.", key_phrases: ['Good morning', 'My name is...', "I'm the new...", 'Nice to be here'] },
      ],
      'daily_conversations': [
        { title: 'Email & Meeting Setup', description: 'Coordinate with colleagues', context: 'You need to schedule a meeting and follow up via email.', key_phrases: ['Are you free on...?', "Let's schedule a meeting", "I'll send you the details", 'Please confirm'] },
        { title: 'Office Small Talk', description: 'Chat with coworkers during break', context: "You're in the break room and making conversation with colleagues.", key_phrases: ['How was your weekend?', 'Did you see...?', "I'm working on...", "Let's grab lunch"] },
      ],
    },
    travel: {
      'meeting_people': [
        { title: 'Hostel Common Room', description: 'Meet fellow travelers', context: "You're in a hostel common room and want to chat with other travelers.", key_phrases: ["Where are you from?", "How long are you staying?", "Have you been to...?", "Let's explore together"] },
        { title: 'Local Guide', description: 'Chat with a local guide', context: "You've met a local who offers to show you around.", key_phrases: ["What's your favorite place?", "Can you show me...?", "Is it far?", "That sounds amazing"] },
      ],
      'food_and_plans': [
        { title: 'Street Food Market', description: 'Order food at a local market', context: "You're at a busy street food market and want to try something local.", key_phrases: ["What's this?", "Is it spicy?", "I'll try that one", "How much?"] },
        { title: 'Planning Tomorrow', description: 'Plan an adventure with new friends', context: "You're planning tomorrow's activities with people you met at the hostel.", key_phrases: ["What should we do?", "I heard about...", "What time?", "Sounds great!"] },
      ],
    },
    love: {
      'meeting_people': [
        { title: 'Coffee Date', description: 'First meeting at a café', context: "You're meeting someone for the first time at a cozy café.", key_phrases: ["You look great", "Tell me about yourself", "I love that too", "Can I get you something?"] },
        { title: 'Party Introduction', description: 'Meet someone at a social gathering', context: "You're at a friend's party and notice someone interesting.", key_phrases: ["Do you know the host?", "What brings you here?", "I like your...", "Can I get your number?"] },
      ],
      'expressing_opinions': [
        { title: 'Getting to Know Each Other', description: 'Share feelings and preferences', context: "You're on a date and sharing what matters to you.", key_phrases: ["I feel the same way", "What matters to you?", "I really enjoy...", "You make me feel..."] },
        { title: 'Planning the Future', description: 'Talk about hopes and dreams', context: "You're in a relationship and discussing future plans together.", key_phrases: ["I dream of...", "What do you think about...?", "Someday I want to...", "Together we could..."] },
      ],
    },
    education: {
      'meeting_people': [
        { title: 'First Day of Class', description: 'Introduce yourself to classmates', context: "It's the first day of university and everyone is introducing themselves.", key_phrases: ["What are you studying?", "Which year are you in?", "Where are you from?", "Want to study together?"] },
        { title: 'Office Hours', description: 'Visit a professor for help', context: "You need help understanding a topic and visit your professor.", key_phrases: ["Could you explain...?", "I don't understand...", "Can I ask a question?", "Thank you for your time"] },
      ],
      'daily_conversations': [
        { title: 'Study Group', description: 'Coordinate with classmates', context: "You're forming a study group for an upcoming exam.", key_phrases: ["When should we meet?", "Did you understand...?", "Let me explain...", "Let's practice together"] },
        { title: 'Campus Life', description: 'Navigate university facilities', context: "You're new on campus and need to find buildings and resources.", key_phrases: ["Where is the...?", "What time does it open?", "How do I register?", "Can I borrow...?"] },
      ],
    },
  };

  // Default scenario if no specific one exists for this motivation + theme
  const defaultScenarios = [
    { title: `Practicing ${stairTitle}`, description: `Real-world practice for ${stairTitle.toLowerCase()}`, context: `You're in an everyday situation where you need to use ${stairTitle.toLowerCase()} skills.`, key_phrases: ['Can you help me?', 'I would like...', 'Thank you', 'Could you repeat that?'] },
    { title: `Building Confidence`, description: `More complex practice for ${stairTitle.toLowerCase()}`, context: `A challenging situation that builds on your ${stairTitle.toLowerCase()} skills.`, key_phrases: ['I think...', 'In my opinion...', 'What do you suggest?', "That's a good point"] },
  ];

  return scenarioTemplates[motivation]?.[theme] || defaultScenarios;
}

/**
 * Returns grammar points appropriate for the stair's position in the journey.
 */
function getStairGrammarPoints(stairIndex: number): string[] {
  const grammarByLevel: string[][] = [
    ['Present tense (to be, to have)', 'Basic sentence structure (Subject + Verb + Object)', 'Masculine/feminine nouns'],
    ['Present tense (regular verbs)', 'Asking yes/no questions', 'Possessive adjectives (my, your)'],
    ['Present tense (irregular verbs)', 'Prepositions of place and time', 'Articles (the, a/an)'],
    ['Past tense (regular verbs)', 'Time expressions (yesterday, last week)', 'Direct object pronouns'],
    ['Past tense (irregular verbs)', 'Comparatives and superlatives', 'Indirect object pronouns'],
    ['Future tense', 'Conditional expressions (I would like)', 'Reflexive verbs'],
    ['Subjunctive mood (basics)', 'Expressing obligation (have to, must)', 'Relative clauses'],
    ['Advanced past tenses', 'Reported speech', 'Complex sentence connectors'],
    ['Subjunctive vs indicative', 'Passive voice', 'Hypothetical situations (if I were...)'],
  ];
  return grammarByLevel[Math.min(stairIndex, grammarByLevel.length - 1)];
}

/**
 * Gets an appropriate emoji for a stair based on its index.
 */
function getStairEmoji(index: number): string {
  const emojis = ['👋', '🗣️', '📱', '🍽️', '💭', '❓', '🔧', '🌟', '🚀'];
  return emojis[index % emojis.length];
}

/**
 * Generates a meaningful description for a stair that reflects the blended learning approach.
 */
function getStairDescription(stairTitle: string, motivation: string): string {
  const motivationContext: Record<string, string> = {
    career: 'professional settings',
    travel: 'travel situations',
    love: 'personal relationships',
    education: 'academic environments',
    relocation: 'daily life abroad',
    challenge: 'real-world conversations',
    custom: 'your personal goals',
  };
  const context = motivationContext[motivation] || 'everyday situations';
  return `Master everyday language through ${stairTitle.toLowerCase()}, with vocabulary for ${context}.`;
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

  // Step 1: Create learning_path record (includes target_accent for voice features)
  const pathResult = await createLearningPath(userId, {
    title: generatedPath.path_title,
    description: generatedPath.path_description,
    target_language: input.target_language,
    native_language: input.native_language,
    target_accent: input.target_accent,  // Persist accent for voice conversations
    motivation: input.motivation,
    proficiency_level: cefrLevel,
    timeline: input.timeline,
    total_stairs: generatedPath.total_stairs,
  });
  console.log('[PathGeneration] Storing with accent:', input.target_accent || 'default');

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

// Re-export types for convenience
export type { PathGenerationInput } from '@/types/learning';
export type { OrchestrationProgress } from '@/lib/ai/orchestrator';
export { isOrchestrationAvailable } from '@/lib/ai/orchestrator';
