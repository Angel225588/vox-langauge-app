/**
 * Goal-Based Word Targeting System
 *
 * Provides words tailored to user's specific learning goals:
 * - Travel: airport, hotel, directions, food ordering
 * - Business: meetings, presentations, negotiations
 * - Academic: essays, discussions, presentations
 * - Interview: self-introduction, experiences, strengths
 * - Daily: greetings, shopping, small talk
 * - Public Speaking: transitions, emphasis, confidence phrases
 *
 * Words are prioritized based on:
 * 1. Goal relevance
 * 2. User's problem history
 * 3. Frequency of use in real scenarios
 */

import type {
  GoalWord,
  GoalWordConfig,
  LearningGoalCategory,
} from './speakingFeedbackTypes';

// ============================================================================
// Goal-Based Word Banks
// ============================================================================

/**
 * Words organized by learning goal
 */
export const GOAL_WORD_BANKS: Record<LearningGoalCategory, GoalWord[]> = {
  travel: [
    // Priority 1: Essential travel words
    { word: 'airport', relevance: 'Essential for air travel', priority: 1, category: 'transportation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'passport', relevance: 'Required for international travel', priority: 1, category: 'documents', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'reservation', relevance: 'Hotels and restaurants', priority: 1, category: 'booking', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'directions', relevance: 'Finding your way', priority: 1, category: 'navigation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'emergency', relevance: 'Safety situations', priority: 1, category: 'safety', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 2: Common travel words
    { word: 'accommodation', relevance: 'Finding places to stay', priority: 2, category: 'lodging', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'itinerary', relevance: 'Travel planning', priority: 2, category: 'planning', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'currency', relevance: 'Money exchange', priority: 2, category: 'finance', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'luggage', relevance: 'Carrying belongings', priority: 2, category: 'transportation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'departure', relevance: 'Leaving for trips', priority: 2, category: 'transportation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 3: Useful travel phrases
    { word: 'recommendation', relevance: 'Getting local tips', priority: 3, category: 'social', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'destination', relevance: 'Where you\'re going', priority: 3, category: 'planning', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'souvenir', relevance: 'Shopping for memories', priority: 3, category: 'shopping', mastered: false, practiceCount: 0, lastAccuracy: 0 },
  ],

  business: [
    // Priority 1: Essential business words
    { word: 'presentation', relevance: 'Sharing ideas with colleagues', priority: 1, category: 'meetings', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'negotiation', relevance: 'Making deals', priority: 1, category: 'deals', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'deadline', relevance: 'Time management', priority: 1, category: 'planning', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'proposal', relevance: 'Suggesting ideas', priority: 1, category: 'communication', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'collaboration', relevance: 'Working together', priority: 1, category: 'teamwork', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 2: Common business words
    { word: 'strategy', relevance: 'Planning approach', priority: 2, category: 'planning', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'implementation', relevance: 'Putting plans into action', priority: 2, category: 'execution', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'stakeholder', relevance: 'People involved in decisions', priority: 2, category: 'people', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'revenue', relevance: 'Money earned', priority: 2, category: 'finance', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'efficiency', relevance: 'Working smarter', priority: 2, category: 'performance', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 3: Advanced business words
    { word: 'sustainability', relevance: 'Long-term thinking', priority: 3, category: 'strategy', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'scalability', relevance: 'Growth potential', priority: 3, category: 'strategy', mastered: false, practiceCount: 0, lastAccuracy: 0 },
  ],

  academic: [
    // Priority 1: Essential academic words
    { word: 'hypothesis', relevance: 'Research foundations', priority: 1, category: 'research', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'analysis', relevance: 'Examining information', priority: 1, category: 'research', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'conclusion', relevance: 'Summarizing findings', priority: 1, category: 'writing', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'methodology', relevance: 'Research approach', priority: 1, category: 'research', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'evidence', relevance: 'Supporting claims', priority: 1, category: 'argumentation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 2: Common academic words
    { word: 'furthermore', relevance: 'Connecting ideas', priority: 2, category: 'transitions', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'consequently', relevance: 'Showing results', priority: 2, category: 'transitions', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'significant', relevance: 'Important findings', priority: 2, category: 'description', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'theoretical', relevance: 'Concept-based', priority: 2, category: 'description', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'comprehensive', relevance: 'Complete coverage', priority: 2, category: 'description', mastered: false, practiceCount: 0, lastAccuracy: 0 },
  ],

  professional_interview: [
    // Priority 1: Essential interview words
    { word: 'experience', relevance: 'Your work history', priority: 1, category: 'background', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'accomplishment', relevance: 'Your achievements', priority: 1, category: 'achievements', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'responsibility', relevance: 'Your duties', priority: 1, category: 'roles', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'qualification', relevance: 'Your skills and credentials', priority: 1, category: 'skills', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'opportunity', relevance: 'Why you want the job', priority: 1, category: 'motivation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 2: Common interview words
    { word: 'challenge', relevance: 'Difficult situations', priority: 2, category: 'stories', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'initiative', relevance: 'Taking action', priority: 2, category: 'traits', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'contribution', relevance: 'What you bring', priority: 2, category: 'value', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'leadership', relevance: 'Guiding others', priority: 2, category: 'skills', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'enthusiasm', relevance: 'Showing interest', priority: 2, category: 'attitude', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 3: Advanced interview words
    { word: 'adaptability', relevance: 'Handling change', priority: 3, category: 'traits', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'entrepreneurial', relevance: 'Business mindset', priority: 3, category: 'traits', mastered: false, practiceCount: 0, lastAccuracy: 0 },
  ],

  daily_conversation: [
    // Priority 1: Essential daily words
    { word: 'appreciate', relevance: 'Expressing gratitude', priority: 1, category: 'emotions', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'unfortunately', relevance: 'Sharing bad news gently', priority: 1, category: 'transitions', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'definitely', relevance: 'Strong agreement', priority: 1, category: 'agreement', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'actually', relevance: 'Clarifying points', priority: 1, category: 'clarification', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'probably', relevance: 'Expressing likelihood', priority: 1, category: 'hedging', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 2: Common daily words
    { word: 'absolutely', relevance: 'Strong emphasis', priority: 2, category: 'emphasis', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'basically', relevance: 'Simplifying explanations', priority: 2, category: 'explanation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'honestly', relevance: 'Being sincere', priority: 2, category: 'honesty', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'especially', relevance: 'Highlighting importance', priority: 2, category: 'emphasis', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'eventually', relevance: 'Talking about time', priority: 2, category: 'time', mastered: false, practiceCount: 0, lastAccuracy: 0 },
  ],

  social: [
    // Priority 1: Essential social words
    { word: 'congratulations', relevance: 'Celebrating others', priority: 1, category: 'celebration', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'introduction', relevance: 'Meeting people', priority: 1, category: 'meeting', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'invitation', relevance: 'Social events', priority: 1, category: 'events', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'recommendation', relevance: 'Suggesting things', priority: 1, category: 'suggestions', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'arrangement', relevance: 'Making plans', priority: 1, category: 'planning', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 2: Common social words
    { word: 'acquaintance', relevance: 'People you know', priority: 2, category: 'relationships', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'atmosphere', relevance: 'Describing places', priority: 2, category: 'description', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'celebration', relevance: 'Happy events', priority: 2, category: 'events', mastered: false, practiceCount: 0, lastAccuracy: 0 },
  ],

  public_speaking: [
    // Priority 1: Essential public speaking words
    { word: 'furthermore', relevance: 'Connecting points', priority: 1, category: 'transitions', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'consequently', relevance: 'Showing results', priority: 1, category: 'transitions', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'emphasize', relevance: 'Highlighting key points', priority: 1, category: 'emphasis', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'illustrate', relevance: 'Giving examples', priority: 1, category: 'examples', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'summarize', relevance: 'Wrapping up', priority: 1, category: 'conclusion', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    // Priority 2: Common public speaking words
    { word: 'demonstrate', relevance: 'Showing how', priority: 2, category: 'explanation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'elaborate', relevance: 'Providing details', priority: 2, category: 'explanation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'perspective', relevance: 'Points of view', priority: 2, category: 'argumentation', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'nevertheless', relevance: 'Contrasting points', priority: 2, category: 'transitions', mastered: false, practiceCount: 0, lastAccuracy: 0 },
    { word: 'specifically', relevance: 'Being precise', priority: 2, category: 'precision', mastered: false, practiceCount: 0, lastAccuracy: 0 },
  ],

  custom: [],
};

// ============================================================================
// Word Selection Functions
// ============================================================================

/**
 * Get words for a session based on user's goal and history
 */
export function getSessionWords(
  config: GoalWordConfig,
  sessionWordCount: number = 10
): GoalWord[] {
  const allWords: GoalWord[] = [];

  // Add primary goal words
  const primaryWords = GOAL_WORD_BANKS[config.primaryGoal] || [];
  allWords.push(...primaryWords);

  // Add secondary goal words
  for (const goal of config.secondaryGoals) {
    const secondaryWords = GOAL_WORD_BANKS[goal] || [];
    allWords.push(...secondaryWords);
  }

  // Add custom words
  for (const word of config.customWords) {
    allWords.push({
      word,
      relevance: 'Custom focus word',
      priority: 1,
      category: 'custom',
      mastered: false,
      practiceCount: 0,
      lastAccuracy: 0,
    });
  }

  // Add problem words with high priority
  for (const word of config.problemWords) {
    const existing = allWords.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (existing) {
      existing.priority = 1; // Boost priority
    } else {
      allWords.push({
        word,
        relevance: 'Problem word - needs practice',
        priority: 1,
        category: 'problem',
        mastered: false,
        practiceCount: 0,
        lastAccuracy: 0,
      });
    }
  }

  // Sort by priority and mastery status
  const sorted = allWords.sort((a, b) => {
    // Unmastered first
    if (a.mastered !== b.mastered) return a.mastered ? 1 : -1;
    // Then by priority
    if (a.priority !== b.priority) return a.priority - b.priority;
    // Then by practice count (less practiced first)
    return a.practiceCount - b.practiceCount;
  });

  // Remove duplicates
  const seen = new Set<string>();
  const unique = sorted.filter(w => {
    const key = w.word.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, sessionWordCount);
}

/**
 * Update word stats after practice
 */
export function updateWordStats(
  word: GoalWord,
  wasCorrect: boolean
): GoalWord {
  const updated = { ...word };
  updated.practiceCount++;
  updated.lastAccuracy = wasCorrect ? 100 : 0;

  // Check if mastered (correct 3+ times in a row would need tracking)
  // For now, simple: 80%+ accuracy over 5 practices = mastered
  if (updated.practiceCount >= 5 && updated.lastAccuracy >= 80) {
    updated.mastered = true;
  }

  return updated;
}

/**
 * Get words that need the most practice
 */
export function getWordsNeedingPractice(
  words: GoalWord[],
  count: number = 5
): GoalWord[] {
  return words
    .filter(w => !w.mastered)
    .sort((a, b) => {
      // Lowest accuracy first
      if (a.lastAccuracy !== b.lastAccuracy) return a.lastAccuracy - b.lastAccuracy;
      // Then by priority
      return a.priority - b.priority;
    })
    .slice(0, count);
}

/**
 * Get mastery progress for a goal
 */
export function getGoalMasteryProgress(
  goal: LearningGoalCategory,
  userWordStats: GoalWord[]
): {
  totalWords: number;
  masteredWords: number;
  progressPercent: number;
  topPriorityRemaining: GoalWord[];
} {
  const goalWords = GOAL_WORD_BANKS[goal] || [];
  const totalWords = goalWords.length;

  // Match user stats with goal words
  const masteredCount = userWordStats.filter(w =>
    w.mastered && goalWords.some(gw => gw.word.toLowerCase() === w.word.toLowerCase())
  ).length;

  const progressPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  // Get remaining priority 1 words
  const topPriorityRemaining = goalWords
    .filter(gw => {
      const userWord = userWordStats.find(uw => uw.word.toLowerCase() === gw.word.toLowerCase());
      return gw.priority === 1 && (!userWord || !userWord.mastered);
    });

  return {
    totalWords,
    masteredWords: masteredCount,
    progressPercent,
    topPriorityRemaining,
  };
}

/**
 * Create a default goal word config
 */
export function createDefaultGoalConfig(
  primaryGoal: LearningGoalCategory,
  problemWords: string[] = []
): GoalWordConfig {
  return {
    primaryGoal,
    secondaryGoals: [],
    customWords: [],
    problemWords,
    sessionTargetWords: getSessionWords({
      primaryGoal,
      secondaryGoals: [],
      customWords: [],
      problemWords,
      sessionTargetWords: [],
    }),
  };
}
