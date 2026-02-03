/**
 * AI Orchestrator - Claude + Gemini Coordination
 *
 * This module orchestrates the dual-AI system for generating personalized
 * learning paths in the Vox Language App.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    ORCHESTRATOR                                 │
 * │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
 * │  │   Claude    │ -> │   Gemini    │ -> │   Claude    │         │
 * │  │  (Planner)  │    │  (Content)  │    │ (Validator) │         │
 * │  │             │    │             │    │  [Phase 2]  │         │
 * │  └─────────────┘    └─────────────┘    └─────────────┘         │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Flow:
 * 1. User profile → Claude generates staircase STRUCTURE (StairBrief[])
 * 2. Each StairBrief → Gemini generates CONTENT (vocab, scenarios, etc.)
 * 3. (Phase 2) Content → Claude validates quality and CEFR appropriateness
 * 4. Progress events emitted throughout for streaming UI
 */

import { EventEmitter } from 'events';
import {
  generateLearningPathPlan,
  isClaudeAvailable,
  type UserLearningProfile,
  type StairBrief,
  type LearningPathPlan,
  ClaudeError,
} from './claudeClient';
import { generateWithGemini, GeminiError } from './gemini';
import type {
  GeneratedPath,
  GeneratedStair,
  VocabItem,
  Scenario,
  PathGenerationInput,
} from '@/types/learning';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Orchestration phases for progress tracking.
 */
export type OrchestrationPhase =
  | 'idle'
  | 'planning' // Claude generating staircase structure
  | 'generating_content' // Gemini generating content for each stair
  | 'validating' // Claude validating content (Phase 2)
  | 'complete'
  | 'error';

/**
 * Progress event emitted during orchestration.
 */
export interface OrchestrationProgress {
  phase: OrchestrationPhase;
  /** Overall progress percentage (0-100) */
  progress: number;
  /** Current stair being processed (1-indexed) */
  currentStair?: number;
  /** Total stairs in the path */
  totalStairs?: number;
  /** Human-readable status message */
  message: string;
  /** The stair that was just completed (for streaming UI) */
  completedStair?: GeneratedStair;
}

/**
 * Result from the orchestration process.
 */
export interface OrchestrationResult {
  success: boolean;
  path?: GeneratedPath;
  plan?: LearningPathPlan;
  error?: string;
  /** Timing metrics */
  metrics?: {
    totalDurationMs: number;
    planningDurationMs: number;
    contentGenerationDurationMs: number;
    validationDurationMs?: number;
    claudeTokensUsed?: number;
    geminiTokensUsed?: number;
  };
}

/**
 * Options for the orchestrator.
 */
export interface OrchestratorOptions {
  /** Enable Claude validation of Gemini content (Phase 2) */
  enableValidation?: boolean;
  /** Progress callback for streaming updates */
  onProgress?: (progress: OrchestrationProgress) => void;
  /** Threshold percentage to trigger early reveal (default: 50) */
  earlyRevealThreshold?: number;
  /** Callback when early reveal threshold is reached */
  onEarlyRevealReady?: (partialStairs: GeneratedStair[]) => void;
}

// ============================================================================
// GEMINI CONTENT GENERATION PROMPTS
// ============================================================================

/**
 * System instruction for Gemini content generation.
 */
const GEMINI_CONTENT_SYSTEM = `You are an expert language learning content creator.
Generate high-quality, pedagogically sound learning content for language learners.
Follow CEFR guidelines strictly. All content must be appropriate for the specified level.
Always respond with valid JSON.`;

/**
 * Generates a prompt for Gemini to create vocabulary and scenarios for a stair.
 */
function generateStairContentPrompt(brief: StairBrief, targetLanguage: string, nativeLanguage: string): string {
  return `${GEMINI_CONTENT_SYSTEM}

Create comprehensive learning content for a language learning stair with the following brief:

## Stair Brief
- **Theme**: ${brief.theme}
- **CEFR Level**: ${brief.cefrLevel}
- **Target Language**: ${targetLanguage}
- **Native Language**: ${nativeLanguage}

### Vocabulary Focus
${brief.vocabularyFocus.map((v, i) => `${i + 1}. ${v}`).join('\n')}

### Grammar Patterns
${brief.grammarPatterns.map((g, i) => `${i + 1}. ${g}`).join('\n')}

### Communicative Goals
${brief.communicativeGoals.map((c, i) => `${i + 1}. ${c}`).join('\n')}

### Constraints
- Word frequency band: ${brief.constraints.wordFrequencyBand[0]}-${brief.constraints.wordFrequencyBand[1]}
- Maximum sentence length: ${brief.constraints.maxSentenceLength} words
- Topics to avoid: ${brief.constraints.avoidTopics.join(', ') || 'None'}

## Required Output
Generate a JSON object with:

1. **vocabulary**: Array of 8-12 vocabulary items relevant to the theme
   - Each item: { word, translation, pronunciation, example_sentence, example_translation, part_of_speech, difficulty }
   - Difficulty: "easy" for high-frequency words, "medium" for moderate, "hard" for challenging

2. **scenarios**: Array of 2-3 conversation scenarios
   - Each scenario: { title, description, context, key_phrases }
   - Scenarios should practice the communicative goals

3. **grammar_points**: Array of 2-4 grammar explanations
   - Brief explanations of the patterns with examples

## JSON Output Format
\`\`\`json
{
  "vocabulary": [
    {
      "word": "target language word",
      "translation": "native language translation",
      "pronunciation": "IPA or phonetic guide",
      "example_sentence": "Example in target language",
      "example_translation": "Translation of example",
      "part_of_speech": "noun|verb|adjective|etc",
      "difficulty": "easy|medium|hard"
    }
  ],
  "scenarios": [
    {
      "title": "Scenario name",
      "description": "Brief description",
      "context": "Setting and situation",
      "key_phrases": ["phrase1", "phrase2"]
    }
  ],
  "grammar_points": ["Grammar point 1 with example", "Grammar point 2 with example"]
}
\`\`\`

IMPORTANT:
- All vocabulary and sentences must be in ${targetLanguage}
- All translations must be in ${nativeLanguage}
- Respect the CEFR level ${brief.cefrLevel} strictly
- Ensure content is culturally appropriate and engaging`;
}

// ============================================================================
// STAIR CONTENT GENERATION
// ============================================================================

/**
 * Content generated by Gemini for a single stair.
 */
interface StairContent {
  vocabulary: VocabItem[];
  scenarios: Scenario[];
  grammar_points: string[];
}

/**
 * Generates content for a single stair using Gemini.
 */
async function generateStairContent(
  brief: StairBrief,
  targetLanguage: string,
  nativeLanguage: string
): Promise<StairContent> {
  const prompt = generateStairContentPrompt(brief, targetLanguage, nativeLanguage);

  const rawResponse = await generateWithGemini(prompt);

  // Extract JSON from response
  const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : rawResponse.trim();

  try {
    const content = JSON.parse(jsonString) as StairContent;

    // Validate required fields
    if (!Array.isArray(content.vocabulary) || content.vocabulary.length === 0) {
      throw new Error('Invalid vocabulary array');
    }
    if (!Array.isArray(content.scenarios)) {
      content.scenarios = []; // Scenarios are optional
    }
    if (!Array.isArray(content.grammar_points)) {
      content.grammar_points = [];
    }

    return content;
  } catch (error: any) {
    throw new GeminiError(
      `Failed to parse stair content JSON: ${error.message}`,
      'INVALID_JSON',
      true
    );
  }
}

// ============================================================================
// MAIN ORCHESTRATOR CLASS
// ============================================================================

/**
 * AI Orchestrator for coordinating Claude and Gemini.
 *
 * Usage:
 * ```typescript
 * const orchestrator = new AIOrchestrator({
 *   onProgress: (progress) => console.log(progress),
 *   onEarlyRevealReady: (stairs) => showPartialStairs(stairs),
 * });
 *
 * const result = await orchestrator.generateLearningPath(userProfile);
 * ```
 */
export class AIOrchestrator extends EventEmitter {
  private options: Required<OrchestratorOptions>;
  private phase: OrchestrationPhase = 'idle';
  private aborted = false;

  constructor(options: OrchestratorOptions = {}) {
    super();
    this.options = {
      enableValidation: options.enableValidation ?? false,
      onProgress: options.onProgress ?? (() => {}),
      earlyRevealThreshold: options.earlyRevealThreshold ?? 50,
      onEarlyRevealReady: options.onEarlyRevealReady ?? (() => {}),
    };
  }

  /**
   * Aborts the current orchestration.
   */
  abort(): void {
    this.aborted = true;
  }

  /**
   * Emits a progress update.
   */
  private emitProgress(progress: Partial<OrchestrationProgress>): void {
    const fullProgress: OrchestrationProgress = {
      phase: this.phase,
      progress: 0,
      message: '',
      ...progress,
    };

    this.options.onProgress(fullProgress);
    this.emit('progress', fullProgress);
  }

  /**
   * Maps user input from onboarding to UserLearningProfile for Claude.
   */
  private mapInputToProfile(input: PathGenerationInput): UserLearningProfile {
    // Map proficiency level to CEFR
    const levelToCEFR: Record<string, 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'> = {
      beginner: 'A1',
      elementary: 'A2',
      intermediate: 'B1',
      advanced: 'B2',
    };

    return {
      nativeLanguage: input.native_language,
      targetLanguage: input.target_language,
      currentLevel: levelToCEFR[input.proficiency_level] || 'A1',
      learningGoals: input.motivation_custom
        ? [input.motivation, input.motivation_custom]
        : [input.motivation],
      interests: input.why_now ? [input.why_now] : [],
      dailyTimeMinutes: 15, // Default, can be expanded
      motivation: input.motivation,
      timeline: input.timeline,
    };
  }

  /**
   * Converts a StairBrief + StairContent into a GeneratedStair.
   */
  private convertToGeneratedStair(
    brief: StairBrief,
    content: StairContent
  ): GeneratedStair {
    // Generate emoji based on theme
    const themeEmojis: Record<string, string> = {
      greetings: '👋',
      food: '🍽️',
      travel: '✈️',
      shopping: '🛒',
      work: '💼',
      family: '👨‍👩‍👧‍👦',
      weather: '🌤️',
      health: '🏥',
      entertainment: '🎬',
      sports: '⚽',
      education: '📚',
      technology: '💻',
      nature: '🌿',
      home: '🏠',
      transportation: '🚗',
    };

    const emoji = Object.entries(themeEmojis).find(([key]) =>
      brief.theme.toLowerCase().includes(key)
    )?.[1] || '📖';

    return {
      order: brief.position,
      title: brief.theme,
      emoji,
      description: `Master ${brief.theme.toLowerCase()} at ${brief.cefrLevel} level. Focus on ${brief.communicativeGoals[0]?.toLowerCase() || 'practical communication'}.`,
      vocabulary: content.vocabulary,
      grammar_points: content.grammar_points,
      scenarios: content.scenarios,
      skills_required: brief.position > 1 ? [`stair_${brief.position - 1}`] : [],
      skills_unlocked: [`stair_${brief.position}`],
      estimated_days: Math.ceil(content.vocabulary.length / 4) + 1,
      content_loaded: true,
    };
  }

  /**
   * Main orchestration method - generates a complete learning path.
   *
   * @param input - User's onboarding data
   * @returns Complete learning path with content
   */
  async generateLearningPath(input: PathGenerationInput): Promise<OrchestrationResult> {
    const startTime = Date.now();
    let planningDuration = 0;
    let contentDuration = 0;

    this.aborted = false;
    this.phase = 'idle';

    try {
      // ========================================
      // PHASE 1: Claude generates staircase structure
      // ========================================
      this.phase = 'planning';
      this.emitProgress({
        phase: 'planning',
        progress: 5,
        message: 'Claude is designing your personalized learning path...',
      });

      const profile = this.mapInputToProfile(input);
      const planStartTime = Date.now();

      let plan: LearningPathPlan | null = null;

      if (isClaudeAvailable()) {
        console.log('[Orchestrator] Using Claude for strategic planning');
        plan = await generateLearningPathPlan(profile);
      }

      // Fallback to Gemini-only mode if Claude unavailable
      if (!plan) {
        console.log('[Orchestrator] Claude unavailable, using Gemini fallback');
        plan = await this.generateFallbackPlan(profile);
      }

      planningDuration = Date.now() - planStartTime;

      if (this.aborted) {
        return { success: false, error: 'Aborted by user' };
      }

      this.emitProgress({
        phase: 'planning',
        progress: 20,
        totalStairs: plan.stairs.length,
        message: `Plan created! ${plan.stairs.length} learning stairs designed.`,
      });

      // ========================================
      // PHASE 2: Gemini generates content for each stair
      // ========================================
      this.phase = 'generating_content';
      const contentStartTime = Date.now();
      const generatedStairs: GeneratedStair[] = [];
      let earlyRevealTriggered = false;

      for (let i = 0; i < plan.stairs.length; i++) {
        if (this.aborted) {
          return { success: false, error: 'Aborted by user' };
        }

        const brief = plan.stairs[i];
        const stairNumber = i + 1;
        const baseProgress = 20;
        const contentProgressRange = 70; // 20-90% for content generation
        const progressPerStair = contentProgressRange / plan.stairs.length;
        const currentProgress = baseProgress + (i * progressPerStair);

        this.emitProgress({
          phase: 'generating_content',
          progress: Math.round(currentProgress),
          currentStair: stairNumber,
          totalStairs: plan.stairs.length,
          message: `Generating content for "${brief.theme}" (${stairNumber}/${plan.stairs.length})...`,
        });

        try {
          // Generate content with Gemini
          const content = await generateStairContent(
            brief,
            profile.targetLanguage,
            profile.nativeLanguage
          );

          // Convert to GeneratedStair
          const generatedStair = this.convertToGeneratedStair(brief, content);
          generatedStairs.push(generatedStair);

          // Emit progress with completed stair
          this.emitProgress({
            phase: 'generating_content',
            progress: Math.round(currentProgress + progressPerStair),
            currentStair: stairNumber,
            totalStairs: plan.stairs.length,
            message: `Completed "${brief.theme}"`,
            completedStair: generatedStair,
          });

          // Check early reveal threshold
          const completionPercent = ((i + 1) / plan.stairs.length) * 100;
          if (!earlyRevealTriggered && completionPercent >= this.options.earlyRevealThreshold) {
            earlyRevealTriggered = true;
            this.options.onEarlyRevealReady([...generatedStairs]);
            this.emit('earlyRevealReady', [...generatedStairs]);
          }

        } catch (error: any) {
          console.error(`[Orchestrator] Failed to generate content for stair ${stairNumber}:`, error);

          // Create skeleton stair on failure
          generatedStairs.push({
            order: brief.position,
            title: brief.theme,
            emoji: '📖',
            description: `Learn ${brief.theme.toLowerCase()} at ${brief.cefrLevel} level.`,
            vocabulary: [],
            grammar_points: brief.grammarPatterns,
            scenarios: [],
            skills_required: brief.position > 1 ? [`stair_${brief.position - 1}`] : [],
            skills_unlocked: [`stair_${brief.position}`],
            estimated_days: 2,
            content_loaded: false, // Mark as needing content load
          });
        }
      }

      contentDuration = Date.now() - contentStartTime;

      // ========================================
      // PHASE 3: Complete
      // ========================================
      this.phase = 'complete';

      const generatedPath: GeneratedPath = {
        path_title: `Personalized ${profile.targetLanguage} Journey`,
        path_description: `A custom learning path designed for your ${profile.currentLevel} level, focusing on ${profile.learningGoals.join(', ')}.`,
        total_stairs: generatedStairs.length,
        estimated_completion: plan.estimatedDuration,
        stairs: generatedStairs,
      };

      this.emitProgress({
        phase: 'complete',
        progress: 100,
        totalStairs: generatedStairs.length,
        message: 'Your learning path is ready!',
      });

      return {
        success: true,
        path: generatedPath,
        plan,
        metrics: {
          totalDurationMs: Date.now() - startTime,
          planningDurationMs: planningDuration,
          contentGenerationDurationMs: contentDuration,
        },
      };

    } catch (error: any) {
      this.phase = 'error';

      const errorMessage = error instanceof ClaudeError || error instanceof GeminiError
        ? error.message
        : `Orchestration failed: ${error.message}`;

      this.emitProgress({
        phase: 'error',
        progress: 0,
        message: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
        metrics: {
          totalDurationMs: Date.now() - startTime,
          planningDurationMs: planningDuration,
          contentGenerationDurationMs: contentDuration,
        },
      };
    }
  }

  /**
   * Fallback plan generation using Gemini when Claude is unavailable.
   * Creates a simpler structure that still works with the content generator.
   */
  private async generateFallbackPlan(profile: UserLearningProfile): Promise<LearningPathPlan> {
    console.log('[Orchestrator] Generating fallback plan with Gemini');

    // Generate a basic plan with Gemini
    const prompt = `You are a language learning curriculum expert. Create a learning path plan for:
- Native Language: ${profile.nativeLanguage}
- Target Language: ${profile.targetLanguage}
- Current Level: ${profile.currentLevel}
- Goals: ${profile.learningGoals.join(', ')}
- Daily Time: ${profile.dailyTimeMinutes} minutes

Create 6-8 themed learning units (stairs) appropriate for their level.

Return JSON:
{
  "stairs": [
    {
      "id": "stair_1",
      "position": 1,
      "theme": "Theme name",
      "cefrLevel": "${profile.currentLevel}",
      "vocabularyFocus": ["word1", "word2"],
      "grammarPatterns": ["pattern1"],
      "communicativeGoals": ["goal1"],
      "constraints": {
        "wordFrequencyBand": [1, 3000],
        "maxSentenceLength": 10,
        "avoidTopics": []
      }
    }
  ],
  "estimatedDuration": "4 weeks",
  "progressionLogic": "Description of progression"
}`;

    const rawResponse = await generateWithGemini(prompt);
    const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : rawResponse.trim();

    const parsed = JSON.parse(jsonString) as Partial<LearningPathPlan>;

    return {
      userId: 'fallback',
      totalStairs: parsed.stairs?.length ?? 6,
      estimatedDuration: parsed.estimatedDuration ?? '4 weeks',
      stairs: parsed.stairs ?? [],
      progressionLogic: parsed.progressionLogic ?? 'Progressive difficulty',
      metadata: {
        generatedAt: new Date().toISOString(),
        modelVersion: 'gemini-2.0-flash-fallback',
      },
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Creates an orchestrator and generates a learning path in one call.
 * Simplified API for common use cases.
 *
 * @param input - User's onboarding data
 * @param onProgress - Optional progress callback
 * @returns Generated learning path result
 */
export async function orchestratePathGeneration(
  input: PathGenerationInput,
  onProgress?: (progress: OrchestrationProgress) => void
): Promise<OrchestrationResult> {
  const orchestrator = new AIOrchestrator({ onProgress });
  return orchestrator.generateLearningPath(input);
}

/**
 * Checks if the dual-AI orchestration is available.
 * Returns true if both Claude and Gemini are configured.
 */
export function isOrchestrationAvailable(): {
  claude: boolean;
  gemini: boolean;
  full: boolean;
} {
  const claude = isClaudeAvailable();
  const gemini = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  return {
    claude,
    gemini,
    full: claude && gemini,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ClaudeError, GeminiError };
