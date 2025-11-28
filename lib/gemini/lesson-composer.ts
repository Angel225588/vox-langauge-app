/**
 * Gemini Lesson Composer
 *
 * AI-driven lesson composition that selects the best cards for each user
 * based on their goals, fears, performance, and available time.
 *
 * Uses card registry metadata and user performance data to create
 * personalized 3/5/7-card lesson sequences.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXPO_PUBLIC_GEMINI_API_KEY } from '@/lib/config/env';
import {
  getCardCatalog,
  getCardById,
  validateCardSelection,
  calculateTotalTime,
  type CardType,
  type CardMetadata,
} from '@/lib/registry/card-registry';
import type { UserLessonContext } from '@/lib/db/performance';

// ============================================================================
// Type Definitions
// ============================================================================

export type SessionMode = 'quick' | 'normal' | 'deep';

export interface CardSelection {
  cardType: CardType;
  difficulty: 'easy' | 'medium' | 'hard';
  reasoning: string;              // Why AI chose this card
  sequenceNumber: number;         // Position in lesson (1, 2, 3...)
  estimatedTime: number;          // minutes
}

export interface LessonPlan {
  lessonTitle: string;
  lessonDescription: string;
  reasoning: string;              // Overall strategy
  estimatedTime: number;          // Total minutes
  sessionMode: SessionMode;
  cards: CardSelection[];
  motivationAlignment: string;    // How lesson addresses user's fear/stakes
}

// ============================================================================
// Session Mode Configuration
// ============================================================================

const SESSION_CONFIG: Record<SessionMode, { cardCount: number; timeLimit: number }> = {
  quick: { cardCount: 3, timeLimit: 5 },    // 5 minutes
  normal: { cardCount: 5, timeLimit: 12 },  // 10-12 minutes
  deep: { cardCount: 7, timeLimit: 18 },    // 15-18 minutes
};

// ============================================================================
// Gemini Client
// ============================================================================

const genAI = new GoogleGenerativeAI(EXPO_PUBLIC_GEMINI_API_KEY);

// Use fast model for lesson composition
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.8,  // Balance creativity with consistency
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

// ============================================================================
// Prompt Builder
// ============================================================================

/**
 * Build comprehensive Gemini prompt with user context and card catalog
 */
function buildLessonComposerPrompt(
  userContext: UserLessonContext,
  sessionMode: SessionMode,
  constraints?: {
    requireOffline?: boolean;
    noVoiceInput?: boolean;
  }
): string {
  const config = SESSION_CONFIG[sessionMode];
  const catalog = getCardCatalog();

  // Filter cards by constraints
  let availableCards = catalog;
  if (constraints?.requireOffline) {
    availableCards = availableCards.filter(c => !c.requiresInternet);
  }
  if (constraints?.noVoiceInput) {
    availableCards = availableCards.filter(c => !c.requiresVoiceInput);
  }

  // Build card catalog section
  const cardCatalogText = availableCards
    .map(
      card => `
**${card.name}** (ID: "${card.id}")
- Objective: ${card.learningObjective}
- How it works: ${card.description}
- Skills: ${card.skillsFocus.join(', ')}
- Treats weak areas: ${card.weakAreasTreated.join(', ')}
- Utility Scores: Vocabulary=${card.utility.vocabulary}, Grammar=${card.utility.grammar}, Pronunciation=${card.utility.pronunciation}, Comprehension=${card.utility.comprehension}, Confidence=${card.utility.confidence}
- Difficulty levels: ${card.difficulty.join(', ')}
- Time: ~${card.timeEstimate} min
- Requires: ${[
          card.requiresAudio && 'audio',
          card.requiresInternet && 'internet',
          card.requiresVoiceInput && 'voice input',
        ]
          .filter(Boolean)
          .join(', ') || 'none'}
`
    )
    .join('\n');

  // Build user context section
  const weakAreasText =
    userContext.weakAreas.length > 0
      ? userContext.weakAreas.join(', ')
      : 'No weak areas identified yet (new user)';

  const performanceText =
    userContext.recentPerformance.totalAttempts > 0
      ? `
**Recent Performance:**
- Overall accuracy: ${userContext.recentPerformance.overallAccuracy}%
- Total attempts: ${userContext.recentPerformance.totalAttempts}
- Skills accuracy:
  - Listening: ${userContext.recentPerformance.skillAccuracy.listening}%
  - Speaking: ${userContext.recentPerformance.skillAccuracy.speaking}%
  - Reading: ${userContext.recentPerformance.skillAccuracy.reading}%
  - Writing: ${userContext.recentPerformance.skillAccuracy.writing}%
  - Grammar: ${userContext.recentPerformance.skillAccuracy.grammar}%
`
      : 'No performance data yet (new user)';

  // Build motivation section
  const motivationText = userContext.motivationData
    ? `
**User's Deep Motivation:**
- Why they want to learn: "${userContext.motivationData.why || 'Not specified'}"
- Their biggest fear: "${userContext.motivationData.fear || 'Not specified'}"
- What's at stake: "${userContext.motivationData.stakes || 'Not specified'}"
- Timeline: ${userContext.motivationData.timeline || 'Not specified'}
`
    : 'No motivation data available';

  // Build the complete prompt
  return `You are an expert language learning coach specializing in personalized lesson design.

## USER PROFILE

**Proficiency Level:** ${userContext.proficiencyLevel}
**Learning Goal:** ${userContext.learningGoal}

${motivationText}

**Identified Weak Areas:** ${weakAreasText}

${performanceText}

---

## YOUR MISSION

Create a personalized **${config.cardCount}-card lesson** (${sessionMode} session, ~${config.timeLimit} min total) that:

1. **Directly addresses their FEAR** - If they fear speaking, include speaking practice at appropriate difficulty
2. **Aligns with their STAKES** - High stakes = more focused/intensive practice
3. **Respects their TIMELINE** - Urgent = faster skill progression
4. **Strengthens WEAK AREAS** - Prioritize cards with high utility for identified weak areas
5. **Stays within TIME** - Total estimated time should be ≤ ${config.timeLimit} minutes
6. **Builds CONFIDENCE** - Progress from easier to harder, end on a win

---

## AVAILABLE CARD TYPES

${cardCatalogText}

---

## SELECTION STRATEGY

**For Weak Areas:**
- If weak in vocabulary → choose cards with vocabulary utility ≥ 7
- If weak in grammar → choose cards with grammar utility ≥ 7
- If weak in pronunciation → choose cards with pronunciation utility ≥ 7
- If weak in comprehension → choose cards with comprehension utility ≥ 7
- If weak in confidence → choose cards with confidence utility ≥ 7

**For Motivation Alignment:**
- Fear of "freezing up" → Start with recorded practice (speaking card, easy)
- Fear of "sounding stupid" → Build vocabulary first, then speaking
- High stakes (job interview) → Focus on professional conversation (role-play)
- Urgent timeline → Higher intensity, more cards per weak area

**Difficulty Progression:**
- Card 1-2: Easy (build confidence)
- Card 3-4: Medium (challenge them)
- Card 5+: Easy-Medium (end on success)

---

## OUTPUT FORMAT

Respond with ONLY valid JSON (no markdown, no backticks):

{
  "lessonTitle": "Short catchy title",
  "lessonDescription": "One sentence description",
  "reasoning": "Overall strategy: why these cards in this order",
  "estimatedTime": ${config.timeLimit},
  "sessionMode": "${sessionMode}",
  "cards": [
    {
      "cardType": "card-id-from-catalog",
      "difficulty": "easy",
      "reasoning": "Why this card first - relate to fear/stakes",
      "sequenceNumber": 1,
      "estimatedTime": 2
    }
  ],
  "motivationAlignment": "How this lesson specifically addresses their fear and stakes"
}

**IMPORTANT:**
- Use exact card IDs from the catalog above
- Total time must not exceed ${config.timeLimit} minutes
- Include exactly ${config.cardCount} cards
- Reference user's fear/stakes in reasoning
- Progress logically from easy to harder
`;
}

// ============================================================================
// Lesson Composition
// ============================================================================

/**
 * Compose a personalized lesson using Gemini AI
 */
export async function composeLessonWithGemini(
  userContext: UserLessonContext,
  sessionMode: SessionMode = 'normal',
  constraints?: {
    requireOffline?: boolean;
    noVoiceInput?: boolean;
  }
): Promise<LessonPlan> {
  console.log('[LessonComposer] Composing lesson...', {
    userId: userContext.userId,
    sessionMode,
    weakAreas: userContext.weakAreas,
  });

  try {
    // Build prompt
    const prompt = buildLessonComposerPrompt(userContext, sessionMode, constraints);

    // Call Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const lessonPlan = parseGeminiResponse(text, sessionMode);

    // Validate card selection
    const cardIds = lessonPlan.cards.map(c => c.cardType);
    const validation = validateCardSelection(cardIds, {
      maxTime: SESSION_CONFIG[sessionMode].timeLimit,
      requireOffline: constraints?.requireOffline,
      noVoiceInput: constraints?.noVoiceInput,
    });

    if (!validation.valid) {
      console.warn('[LessonComposer] Validation warnings:', validation.errors);
      // Continue anyway but log warnings
    }

    console.log('[LessonComposer] Lesson composed successfully:', lessonPlan.lessonTitle);
    return lessonPlan;
  } catch (error) {
    console.error('[LessonComposer] Error composing lesson:', error);
    // Fallback to default lesson
    return generateFallbackLesson(userContext, sessionMode);
  }
}

/**
 * Parse Gemini's JSON response
 */
function parseGeminiResponse(text: string, sessionMode: SessionMode): LessonPlan {
  // Remove markdown code blocks if present
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/```\n?/g, '');
  }

  try {
    const parsed = JSON.parse(cleanText);
    return {
      lessonTitle: parsed.lessonTitle || 'Personalized Practice',
      lessonDescription: parsed.lessonDescription || 'Custom lesson for you',
      reasoning: parsed.reasoning || '',
      estimatedTime: parsed.estimatedTime || SESSION_CONFIG[sessionMode].timeLimit,
      sessionMode,
      cards: parsed.cards || [],
      motivationAlignment: parsed.motivationAlignment || '',
    };
  } catch (error) {
    console.error('[LessonComposer] JSON parse error:', error);
    throw new Error('Failed to parse Gemini response');
  }
}

/**
 * Generate fallback lesson if Gemini fails
 */
function generateFallbackLesson(
  userContext: UserLessonContext,
  sessionMode: SessionMode
): LessonPlan {
  const config = SESSION_CONFIG[sessionMode];
  const weakAreas = userContext.weakAreas;

  // Default card progression
  let cardSequence: CardType[];

  if (weakAreas.includes('vocabulary')) {
    cardSequence = ['single-vocab', 'multiple-choice', 'fill-in-blank', 'image-quiz', 'text-input'];
  } else if (weakAreas.includes('grammar')) {
    cardSequence = ['sentence-scramble', 'fill-in-blank', 'multiple-choice', 'text-input', 'single-vocab'];
  } else if (weakAreas.includes('pronunciation') || weakAreas.includes('confidence')) {
    cardSequence = ['single-vocab', 'audio-to-image', 'speaking', 'describe-image', 'multiple-choice'];
  } else {
    // Balanced approach for new users
    cardSequence = ['single-vocab', 'multiple-choice', 'audio-to-image', 'text-input', 'speaking'];
  }

  // Select appropriate number of cards
  const selectedCards = cardSequence.slice(0, config.cardCount);

  return {
    lessonTitle: 'Balanced Practice Session',
    lessonDescription: 'A well-rounded practice covering multiple skills',
    reasoning: 'Using default balanced progression while Gemini is unavailable',
    estimatedTime: config.timeLimit,
    sessionMode,
    cards: selectedCards.map((cardType, index) => ({
      cardType,
      difficulty: index < 2 ? 'easy' : index < 4 ? 'medium' : 'easy',
      reasoning: 'Selected for balanced skill development',
      sequenceNumber: index + 1,
      estimatedTime: getCardById(cardType)?.timeEstimate || 2,
    })),
    motivationAlignment: 'Balanced practice to build overall confidence and skills',
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get lesson plan summary for UI display
 */
export function getLessonSummary(lessonPlan: LessonPlan): {
  title: string;
  cardCount: number;
  timeEstimate: string;
  skillsFocused: string[];
  difficulty: string;
} {
  const skillsSet = new Set<string>();
  lessonPlan.cards.forEach(card => {
    const metadata = getCardById(card.cardType);
    metadata?.skillsFocus.forEach(skill => skillsSet.add(skill));
  });

  const difficultyCount = {
    easy: lessonPlan.cards.filter(c => c.difficulty === 'easy').length,
    medium: lessonPlan.cards.filter(c => c.difficulty === 'medium').length,
    hard: lessonPlan.cards.filter(c => c.difficulty === 'hard').length,
  };

  let difficultyLabel = 'Mixed';
  if (difficultyCount.easy > difficultyCount.medium + difficultyCount.hard) {
    difficultyLabel = 'Easy';
  } else if (difficultyCount.hard > 0) {
    difficultyLabel = 'Challenging';
  }

  return {
    title: lessonPlan.lessonTitle,
    cardCount: lessonPlan.cards.length,
    timeEstimate: `${lessonPlan.estimatedTime} min`,
    skillsFocused: Array.from(skillsSet),
    difficulty: difficultyLabel,
  };
}

/**
 * Validate lesson plan completeness
 */
export function validateLessonPlan(lessonPlan: LessonPlan): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!lessonPlan.lessonTitle) {
    errors.push('Missing lesson title');
  }

  if (!lessonPlan.cards || lessonPlan.cards.length === 0) {
    errors.push('No cards in lesson plan');
  }

  if (lessonPlan.cards) {
    lessonPlan.cards.forEach((card, index) => {
      if (!card.cardType) {
        errors.push(`Card ${index + 1}: Missing card type`);
      }
      if (!card.difficulty) {
        errors.push(`Card ${index + 1}: Missing difficulty`);
      }
      if (card.sequenceNumber !== index + 1) {
        errors.push(`Card ${index + 1}: Incorrect sequence number`);
      }
    });
  }

  const config = SESSION_CONFIG[lessonPlan.sessionMode];
  if (lessonPlan.cards && lessonPlan.cards.length !== config.cardCount) {
    errors.push(
      `Expected ${config.cardCount} cards for ${lessonPlan.sessionMode} mode, got ${lessonPlan.cards.length}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
