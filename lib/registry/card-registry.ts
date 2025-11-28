/**
 * Card Registry System
 *
 * Centralized catalog of all learning card types with metadata for AI-driven lesson composition.
 * Each card includes utility scores that help Gemini AI select the best cards for each user's
 * learning goals, weak areas, and emotional context (fears, stakes, motivation).
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type SkillType = 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar';
export type WeakAreaType = 'vocabulary' | 'pronunciation' | 'grammar' | 'comprehension' | 'confidence';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type CardType =
  | 'single-vocab'
  | 'multiple-choice'
  | 'image-quiz'
  | 'audio-to-image'
  | 'text-input'
  | 'speaking'
  | 'sentence-scramble'
  | 'fill-in-blank'
  | 'describe-image'
  | 'storytelling'
  | 'question-game'
  | 'role-play';

/**
 * Utility scores help AI optimize card selection for user's weak areas
 * Scoring:
 * - High (8): Primary focus of the card
 * - Medium (5): Secondary benefit
 * - Low (2): Minimal or no focus
 */
export interface UtilityScores {
  vocabulary: number;      // 0-10 scale
  grammar: number;
  pronunciation: number;
  comprehension: number;
  confidence: number;
}

/**
 * Complete metadata for each card type
 */
export interface CardMetadata {
  id: CardType;
  name: string;                        // Human-readable name
  learningObjective: string;           // What this card teaches
  description: string;                 // How the card works (for AI prompt)

  // AI Selection Criteria
  skillsFocus: SkillType[];            // Primary skills practiced
  weakAreasTreated: WeakAreaType[];    // Weak areas this card addresses
  utility: UtilityScores;              // Utility scores for AI optimization

  // Practical Constraints
  difficulty: DifficultyLevel[];       // Available difficulty levels
  timeEstimate: number;                // Estimated minutes per card
  requiresAudio: boolean;              // Needs audio playback
  requiresInternet: boolean;           // Needs internet connection
  requiresVoiceInput: boolean;         // Needs microphone

  // Content Schema
  contentSchema: string;               // TypeScript type name for content validation
}

// ============================================================================
// Card Registry
// ============================================================================

export const CARD_REGISTRY: Record<CardType, CardMetadata> = {
  /**
   * 1. Single Vocabulary Card
   * Display word with image, translation, phonetics, and audio
   */
  'single-vocab': {
    id: 'single-vocab',
    name: 'Vocabulary Card',
    learningObjective: 'Vocabulary acquisition and pronunciation',
    description: 'Shows a word with image, translation, phonetic pronunciation, and optional audio. User reviews and learns new vocabulary passively.',
    skillsFocus: ['listening', 'reading'],
    weakAreasTreated: ['vocabulary', 'pronunciation'],
    utility: {
      vocabulary: 8,      // High: primary focus
      grammar: 2,         // Low: minimal focus
      pronunciation: 5,   // Medium: audio available
      comprehension: 5,   // Medium: see word in context
      confidence: 5,      // Medium: passive learning builds familiarity
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 1,
    requiresAudio: true,
    requiresInternet: false,
    requiresVoiceInput: false,
    contentSchema: 'SingleVocabContent',
  },

  /**
   * 2. Multiple Choice Card
   * Select correct word from options based on translation or definition
   */
  'multiple-choice': {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    learningObjective: 'Vocabulary recognition and comprehension',
    description: 'User sees a translation or definition and must select the correct word from 3-4 options. Tests vocabulary recall and comprehension.',
    skillsFocus: ['reading', 'grammar'],
    weakAreasTreated: ['vocabulary', 'comprehension'],
    utility: {
      vocabulary: 8,
      grammar: 5,         // Medium: understanding word relationships
      pronunciation: 2,
      comprehension: 8,
      confidence: 5,
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 1,
    requiresAudio: false,
    requiresInternet: false,
    requiresVoiceInput: false,
    contentSchema: 'MultipleChoiceContent',
  },

  /**
   * 3. Image Quiz Card
   * Match image to correct word from multiple options
   */
  'image-quiz': {
    id: 'image-quiz',
    name: 'Image Quiz',
    learningObjective: 'Visual vocabulary association',
    description: 'Shows an image and user selects the correct word from options. Strengthens visual-word connections.',
    skillsFocus: ['reading'],
    weakAreasTreated: ['vocabulary', 'comprehension'],
    utility: {
      vocabulary: 8,
      grammar: 2,
      pronunciation: 2,
      comprehension: 8,
      confidence: 5,
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 1,
    requiresAudio: false,
    requiresInternet: false,
    requiresVoiceInput: false,
    contentSchema: 'ImageQuizContent',
  },

  /**
   * 4. Audio to Image Card
   * Listen to audio and select matching image
   */
  'audio-to-image': {
    id: 'audio-to-image',
    name: 'Audio to Image',
    learningObjective: 'Listening comprehension and word recognition',
    description: 'User hears a word or phrase and must select the matching image from a grid. Trains listening skills and audio-visual association.',
    skillsFocus: ['listening'],
    weakAreasTreated: ['vocabulary', 'pronunciation', 'comprehension'],
    utility: {
      vocabulary: 8,
      grammar: 2,
      pronunciation: 5,   // Medium: hear correct pronunciation
      comprehension: 8,
      confidence: 5,
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 1,
    requiresAudio: true,
    requiresInternet: false,
    requiresVoiceInput: false,
    contentSchema: 'AudioToImageContent',
  },

  /**
   * 5. Text Input Card
   * Type what you hear (dictation exercise)
   */
  'text-input': {
    id: 'text-input',
    name: 'Text Input (Dictation)',
    learningObjective: 'Listening comprehension and spelling',
    description: 'User hears audio and types what they hear. Tests listening accuracy and spelling. Provides hints if struggling.',
    skillsFocus: ['listening', 'writing', 'grammar'],
    weakAreasTreated: ['vocabulary', 'comprehension'],
    utility: {
      vocabulary: 8,
      grammar: 5,         // Medium: correct spelling and structure
      pronunciation: 2,
      comprehension: 8,
      confidence: 5,
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 2,
    requiresAudio: true,
    requiresInternet: false,
    requiresVoiceInput: false,
    contentSchema: 'TextInputContent',
  },

  /**
   * 6. Speaking Card
   * Record pronunciation of target word or phrase
   */
  'speaking': {
    id: 'speaking',
    name: 'Speaking Practice',
    learningObjective: 'Pronunciation practice and speaking confidence',
    description: 'Shows a word/phrase with phonetics and audio. User records themselves saying it. Builds speaking confidence in a safe environment.',
    skillsFocus: ['speaking'],
    weakAreasTreated: ['pronunciation', 'confidence'],
    utility: {
      vocabulary: 5,
      grammar: 2,
      pronunciation: 8,
      comprehension: 2,
      confidence: 8,      // High: encourages speaking practice
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 2,
    requiresAudio: true,
    requiresInternet: false,
    requiresVoiceInput: true,
    contentSchema: 'SpeakingContent',
  },

  /**
   * 7. Sentence Scramble Card (NEW)
   * Drag and drop words to form correct sentence
   */
  'sentence-scramble': {
    id: 'sentence-scramble',
    name: 'Sentence Scramble',
    learningObjective: 'Grammar and word order understanding',
    description: 'Shuffled word tiles that user drags into correct order to form a grammatically correct sentence. Teaches intuitive grammar and word order.',
    skillsFocus: ['grammar', 'reading'],
    weakAreasTreated: ['grammar', 'comprehension'],
    utility: {
      vocabulary: 5,
      grammar: 8,         // High: primary focus
      pronunciation: 2,
      comprehension: 8,
      confidence: 5,
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 2,
    requiresAudio: true,  // Plays correct sentence when complete
    requiresInternet: false,
    requiresVoiceInput: false,
    contentSchema: 'SentenceScrambleContent',
  },

  /**
   * 8. Fill in the Blank Card (NEW)
   * Complete dialogue by selecting correct word/phrase
   */
  'fill-in-blank': {
    id: 'fill-in-blank',
    name: 'Fill in the Blank',
    learningObjective: 'Contextual vocabulary and grammar',
    description: 'Shows dialogue with a blank. User selects the correct word/phrase from options to complete it naturally. Teaches context-based language use.',
    skillsFocus: ['reading', 'grammar'],
    weakAreasTreated: ['vocabulary', 'grammar', 'comprehension'],
    utility: {
      vocabulary: 8,
      grammar: 8,
      pronunciation: 2,
      comprehension: 8,
      confidence: 5,
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 2,
    requiresAudio: true,  // Reads complete dialogue
    requiresInternet: false,
    requiresVoiceInput: false,
    contentSchema: 'FillInBlankContent',
  },

  /**
   * 9. Describe Image Card (NEW)
   * Type or speak description of an image
   */
  'describe-image': {
    id: 'describe-image',
    name: 'Describe the Image',
    learningObjective: 'Creative vocabulary use and spontaneous expression',
    description: 'Shows an image. User types or speaks a description. AI detects keywords and provides encouragement. Promotes creative language production.',
    skillsFocus: ['writing', 'speaking'],
    weakAreasTreated: ['vocabulary', 'confidence'],
    utility: {
      vocabulary: 8,
      grammar: 5,
      pronunciation: 5,   // Medium: if using voice mode
      comprehension: 5,
      confidence: 8,      // High: encourages spontaneous creation
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 3,
    requiresAudio: false,
    requiresInternet: false, // Keyword matching can be local
    requiresVoiceInput: false, // Optional, not required
    contentSchema: 'DescribeImageContent',
  },

  /**
   * 10. Storytelling Card (NEW)
   * Create story connecting 3-5 images
   */
  'storytelling': {
    id: 'storytelling',
    name: 'Storytelling',
    learningObjective: 'Narrative flow and complex sentence construction',
    description: 'Shows 3-5 images in sequence. User types or speaks a story connecting them. Encourages conjunctions, transitions, and creative expression.',
    skillsFocus: ['writing', 'speaking', 'grammar'],
    weakAreasTreated: ['vocabulary', 'grammar', 'confidence'],
    utility: {
      vocabulary: 8,
      grammar: 8,         // High: requires sentence construction
      pronunciation: 2,
      comprehension: 5,
      confidence: 8,      // High: creative freedom
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 4,
    requiresAudio: false,
    requiresInternet: false, // AI analysis optional
    requiresVoiceInput: false,
    contentSchema: 'StorytellingContent',
  },

  /**
   * 11. Question Game Card (NEW)
   * "20 Questions" style - ask yes/no questions to guess mystery word
   */
  'question-game': {
    id: 'question-game',
    name: 'Question Game (20 Questions)',
    learningObjective: 'Question formation and logical thinking',
    description: 'AI has a mystery word. User asks yes/no questions to guess it. Teaches question formation and provides grammar feedback.',
    skillsFocus: ['writing', 'grammar'],
    weakAreasTreated: ['vocabulary', 'grammar', 'comprehension', 'confidence'],
    utility: {
      vocabulary: 8,
      grammar: 8,
      pronunciation: 2,
      comprehension: 8,
      confidence: 8,      // High: interactive game format
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 5,
    requiresAudio: false,
    requiresInternet: true, // Needs Gemini AI to respond
    requiresVoiceInput: false,
    contentSchema: 'QuestionGameContent',
  },

  /**
   * 12. Role Play Card (NEW)
   * Conversation with AI in specific scenario
   */
  'role-play': {
    id: 'role-play',
    name: 'Role Play',
    learningObjective: 'Practical dialogue and spontaneous conversation',
    description: 'AI plays a role (waiter, interviewer, friend). User responds via text or voice. Practices real-world conversations with gentle corrections.',
    skillsFocus: ['speaking', 'writing', 'listening', 'grammar'],
    weakAreasTreated: ['vocabulary', 'grammar', 'pronunciation', 'comprehension', 'confidence'],
    utility: {
      vocabulary: 8,
      grammar: 8,
      pronunciation: 8,   // High: especially in voice mode
      comprehension: 8,
      confidence: 8,      // High: simulates real conversations
    },
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 5,
    requiresAudio: true,  // AI speaks responses
    requiresInternet: true, // Needs Gemini AI
    requiresVoiceInput: false, // Optional
    contentSchema: 'RolePlayContent',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get complete card catalog for AI prompt
 */
export function getCardCatalog(): CardMetadata[] {
  return Object.values(CARD_REGISTRY);
}

/**
 * Get card metadata by ID
 */
export function getCardById(id: CardType): CardMetadata | undefined {
  return CARD_REGISTRY[id];
}

/**
 * Get cards focused on specific skill
 */
export function getCardsBySkill(skill: SkillType): CardMetadata[] {
  return getCardCatalog().filter(card => card.skillsFocus.includes(skill));
}

/**
 * Get cards that treat specific weak area
 */
export function getCardsByWeakArea(weakArea: WeakAreaType): CardMetadata[] {
  return getCardCatalog().filter(card => card.weakAreasTreated.includes(weakArea));
}

/**
 * Get cards with high utility for a specific weak area (score >= 7)
 */
export function getHighUtilityCards(weakArea: WeakAreaType): CardMetadata[] {
  return getCardCatalog().filter(card => {
    const utilityScore = card.utility[weakArea];
    return utilityScore >= 7;
  });
}

/**
 * Get cards that work offline
 */
export function getOfflineCards(): CardMetadata[] {
  return getCardCatalog().filter(card => !card.requiresInternet);
}

/**
 * Get cards that don't require voice input (good for users who fear speaking)
 */
export function getSafeCards(): CardMetadata[] {
  return getCardCatalog().filter(card => !card.requiresVoiceInput);
}

/**
 * Get cards within time constraint
 */
export function getCardsByTime(maxMinutes: number): CardMetadata[] {
  return getCardCatalog().filter(card => card.timeEstimate <= maxMinutes);
}

/**
 * Calculate total estimated time for a set of cards
 */
export function calculateTotalTime(cardIds: CardType[]): number {
  return cardIds.reduce((total, id) => {
    const card = getCardById(id);
    return total + (card?.timeEstimate || 0);
  }, 0);
}

/**
 * Validate card selection (ensure cards exist and constraints are met)
 */
export function validateCardSelection(
  cardIds: CardType[],
  constraints?: {
    maxTime?: number;
    requireOffline?: boolean;
    noVoiceInput?: boolean;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check all cards exist
  for (const id of cardIds) {
    if (!getCardById(id)) {
      errors.push(`Card '${id}' not found in registry`);
    }
  }

  if (constraints) {
    // Check time constraint
    if (constraints.maxTime) {
      const totalTime = calculateTotalTime(cardIds);
      if (totalTime > constraints.maxTime) {
        errors.push(`Total time (${totalTime} min) exceeds limit (${constraints.maxTime} min)`);
      }
    }

    // Check offline requirement
    if (constraints.requireOffline) {
      const onlineCards = cardIds.filter(id => {
        const card = getCardById(id);
        return card?.requiresInternet;
      });
      if (onlineCards.length > 0) {
        errors.push(`Cards require internet but offline mode requested: ${onlineCards.join(', ')}`);
      }
    }

    // Check voice input requirement
    if (constraints.noVoiceInput) {
      const voiceCards = cardIds.filter(id => {
        const card = getCardById(id);
        return card?.requiresVoiceInput;
      });
      if (voiceCards.length > 0) {
        errors.push(`Cards require voice but user prefers no voice input: ${voiceCards.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Summary Statistics
// ============================================================================

/**
 * Get registry statistics for debugging/monitoring
 */
export function getRegistryStats() {
  const catalog = getCardCatalog();
  return {
    totalCards: catalog.length,
    bySkill: {
      listening: getCardsBySkill('listening').length,
      speaking: getCardsBySkill('speaking').length,
      reading: getCardsBySkill('reading').length,
      writing: getCardsBySkill('writing').length,
      grammar: getCardsBySkill('grammar').length,
    },
    byWeakArea: {
      vocabulary: getCardsByWeakArea('vocabulary').length,
      pronunciation: getCardsByWeakArea('pronunciation').length,
      grammar: getCardsByWeakArea('grammar').length,
      comprehension: getCardsByWeakArea('comprehension').length,
      confidence: getCardsByWeakArea('confidence').length,
    },
    offlineCards: getOfflineCards().length,
    voiceRequiredCards: catalog.filter(c => c.requiresVoiceInput).length,
    internetRequiredCards: catalog.filter(c => c.requiresInternet).length,
    avgTimeEstimate: catalog.reduce((sum, c) => sum + c.timeEstimate, 0) / catalog.length,
  };
}
