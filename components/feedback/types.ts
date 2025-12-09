/**
 * Feedback System Types
 *
 * Shared types for the feedback detail screens (Writing & Recording).
 * Implements Vox's philosophy: "Confidence comes from a safe space where evolution is the reward"
 */

// =============================================================================
// SHARED FEEDBACK TYPES
// =============================================================================

export type FeedbackCategory = 'writing' | 'recording';

export interface FeedbackScore {
  label: string;
  value: number;          // 0-100
  color: string;
  description?: string;
}

export interface FeedbackStrength {
  id: string;
  text: string;
  icon?: string;
}

export interface FeedbackImprovement {
  id: string;
  area: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  examples?: string[];
}

export interface FeedbackProgress {
  metric: string;
  previousValue: number;
  currentValue: number;
  trend: 'up' | 'down' | 'stable';
  message: string;
}

// =============================================================================
// WRITING FEEDBACK TYPES
// =============================================================================

export interface WritingFeedbackData {
  id: string;
  noteId: string;
  title: string;
  category: string;
  completedAt: string;
  timeSpentMs: number;

  // Scores
  grammarScore: number;
  vocabularyScore: number;
  clarityScore: number;
  overallScore: number;

  // Content
  originalText: string;
  correctedText: string;

  // Analysis
  corrections: WritingCorrection[];
  strengths: FeedbackStrength[];
  improvements: FeedbackImprovement[];

  // Encouragement
  encouragementMessage: string;
  celebrationEmoji: string;

  // Progress (vs previous attempts)
  progress?: WritingProgress;
}

export interface WritingCorrection {
  id: string;
  type: 'grammar' | 'spelling' | 'vocabulary' | 'style' | 'punctuation';
  original: string;
  corrected: string;
  explanation: string;
  rule?: string;
  betterWayToSay?: string;  // Positive framing
}

export interface WritingProgress {
  previousAttempts: number;
  grammarTrend: FeedbackProgress;
  vocabularyTrend: FeedbackProgress;
  commonPatterns: string[];  // Recurring areas to work on
}

// =============================================================================
// RECORDING FEEDBACK TYPES
// =============================================================================

export interface RecordingFeedbackData {
  id: string;
  sessionId: string;
  title: string;
  passageCategory: string;
  completedAt: string;
  durationMs: number;

  // Scores (articulation, not accent!)
  articulationScore: number;   // Word clarity
  fluencyScore: number;        // Flow, pauses
  completionScore: number;     // Finished all words
  overallScore: number;

  // Audio
  recordingUrl?: string;

  // Analysis
  wordsTotal: number;
  wordsSpoken: number;
  problemWords: ProblemWord[];
  strengths: FeedbackStrength[];
  improvements: FeedbackImprovement[];

  // Encouragement
  encouragementMessage: string;
  celebrationEmoji: string;

  // Progress (vs previous attempts)
  progress?: RecordingProgress;
}

export interface ProblemWord {
  id: string;
  word: string;
  issueType: 'hesitation' | 'skipped' | 'incomplete' | 'repeated';
  context: string;              // Surrounding sentence
  suggestion: string;           // How to practice
  syllableBreakdown?: string;   // e.g., "ca-THE-dral"
  addedToWordBank: boolean;
  timestamp?: number;           // Position in recording
}

export interface RecordingProgress {
  previousAttempts: number;
  articulationTrend: FeedbackProgress;
  fluencyTrend: FeedbackProgress;
  improvedWords: string[];      // Words that got better
  persistentChallenges: string[]; // Still working on
}

// =============================================================================
// LIBRARY ITEM TYPES
// =============================================================================

export interface NoteLibraryItem {
  id: string;
  title: string;
  label: string;
  category: string;
  preview: string;              // First 100 chars
  createdAt: string;
  updatedAt: string;
  hasFeedback: boolean;
  feedbackScore?: number;
  practiceCount: number;
}

export interface RecordingLibraryItem {
  id: string;
  title: string;
  passageTitle: string;
  category: string;
  durationMs: number;
  createdAt: string;
  hasFeedback: boolean;
  feedbackScore?: number;
  isPublic: boolean;
}

// =============================================================================
// ENCOURAGEMENT MESSAGES
// =============================================================================

export const ENCOURAGEMENT_MESSAGES = {
  excellent: [
    "Outstanding work! Your dedication is paying off!",
    "Incredible progress! Keep this momentum going!",
    "You're on fire! Every practice session counts!",
  ],
  great: [
    "Great job! You're building real skills here!",
    "Solid work! Your effort is clearly showing!",
    "Well done! You're getting stronger every day!",
  ],
  good: [
    "Good progress! Every attempt makes you better!",
    "Nice work! You're moving in the right direction!",
    "Keep it up! Practice makes progress!",
  ],
  improving: [
    "You're improving! That's what matters most!",
    "Every practice session is a step forward!",
    "Your courage to try is what builds confidence!",
  ],
  encouraging: [
    "Remember: mistakes are just learning in disguise!",
    "You showed up and practiced - that's success!",
    "Every expert was once a beginner. Keep going!",
  ],
};

export const CELEBRATION_EMOJIS = {
  excellent: ['🎉', '🌟', '✨', '🏆', '💫'],
  great: ['👏', '🙌', '💪', '🎯', '⭐'],
  good: ['👍', '✅', '📈', '🔥', '💡'],
  improving: ['🌱', '📚', '🎓', '💭', '🧠'],
  encouraging: ['❤️', '🤗', '🌈', '🦋', '🌻'],
};

// Helper to get encouragement based on score
export function getEncouragement(score: number): { message: string; emoji: string } {
  let category: keyof typeof ENCOURAGEMENT_MESSAGES;

  if (score >= 90) category = 'excellent';
  else if (score >= 75) category = 'great';
  else if (score >= 60) category = 'good';
  else if (score >= 40) category = 'improving';
  else category = 'encouraging';

  const messages = ENCOURAGEMENT_MESSAGES[category];
  const emojis = CELEBRATION_EMOJIS[category];

  return {
    message: messages[Math.floor(Math.random() * messages.length)],
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  };
}

// =============================================================================
// FEEDBACK LANGUAGE HELPERS
// =============================================================================

export const FEEDBACK_LABELS = {
  // Types - positive framing
  grammar: 'Grammar Tip',
  spelling: 'Spelling Tip',
  vocabulary: 'Vocabulary Suggestion',
  style: 'Style Enhancement',
  punctuation: 'Punctuation Tip',

  // Issue types - neutral framing
  hesitation: 'Pacing Opportunity',
  skipped: 'Word to Practice',
  incomplete: 'Completion Opportunity',
  repeated: 'Fluency Note',
};

// Get positive label for correction type
export function getPositiveLabel(type: string): string {
  return FEEDBACK_LABELS[type as keyof typeof FEEDBACK_LABELS] || 'Suggestion';
}
