/**
 * Speaking Feedback System Types
 *
 * Types for the honest, balanced feedback system with:
 * - Gemini AI-powered analysis
 * - Effort-based points (more tries = more points)
 * - Goal-based word targeting
 * - Milestone tracking
 */

// ============================================================================
// Feedback Types
// ============================================================================

/**
 * Feedback mode - controls how honest/detailed feedback is
 */
export type FeedbackMode = 'encouraging' | 'balanced' | 'detailed';

/**
 * Severity of an issue for honest feedback
 */
export type IssueSeverity = 'minor' | 'moderate' | 'significant' | 'critical';

/**
 * Detailed word analysis from Gemini
 */
export interface WordAnalysis {
  /** The expected word */
  expected: string;

  /** What was actually spoken (null if skipped) */
  spoken: string | null;

  /** Whether word was correct */
  isCorrect: boolean;

  /** Severity of the issue (if incorrect) */
  severity?: IssueSeverity;

  /** Specific issue type */
  issueType?: 'skipped' | 'mispronounced' | 'hesitated' | 'substituted' | 'repeated';

  /** AI explanation of what went wrong */
  explanation?: string;

  /** How to correctly pronounce (phonetic hint) */
  pronunciationHint?: string;

  /** Suggested practice approach */
  practiceAdvice?: string;
}

/**
 * Honest, balanced feedback structure
 */
export interface HonestFeedback {
  // Raw Performance Data
  /** Exact accuracy percentage (no rounding up) */
  accuracyPercent: number;

  /** Number of words correct */
  wordsCorrect: number;

  /** Total words expected */
  wordsTotal: number;

  /** Words per minute */
  wpm: number;

  // Honest Assessment
  /** Honest summary - tells truth about performance */
  honestSummary: string;

  /** What actually went well (only real strengths, may be empty) */
  actualStrengths: string[];

  /** What needs work (specific, actionable) */
  areasNeedingWork: string[];

  /** Specific words that need practice */
  wordsToFocus: WordAnalysis[];

  // Balanced Encouragement
  /** Recognition of effort (not performance) */
  effortRecognition: string;

  /** Progress comparison (if available) */
  progressNote?: string;

  /** Next concrete step to improve */
  nextStep: string;

  // Detailed Mode Only
  /** Full word-by-word analysis */
  detailedAnalysis?: WordAnalysis[];

  /** Technical metrics */
  technicalMetrics?: {
    articulationScore: number;
    fluencyScore: number;
    completionRate: number;
    hesitationCount: number;
    averagePauseDuration: number;
  };
}

// ============================================================================
// Effort Points System
// ============================================================================

/**
 * Points earned from a practice session
 * Philosophy: More mistakes = more learning opportunity = more points for trying
 */
export interface EffortPoints {
  /** Points for attempting the exercise */
  attemptPoints: number;

  /** Points for completing (regardless of accuracy) */
  completionPoints: number;

  /** Bonus points for mistakes (learning opportunities!) */
  mistakePoints: number;

  /** Bonus for consecutive days */
  streakBonus: number;

  /** Bonus for practicing problem words */
  focusWordBonus: number;

  /** Bonus for trying difficult content */
  difficultyBonus: number;

  /** Total points earned */
  totalPoints: number;

  /** Explanation of points breakdown */
  breakdown: string;
}

/**
 * Points calculation configuration
 */
export interface PointsConfig {
  /** Base points per attempt */
  baseAttemptPoints: number;

  /** Points per word attempted */
  pointsPerWordAttempted: number;

  /** Bonus points per mistake (encourages trying!) */
  pointsPerMistake: number;

  /** Max mistake bonus (prevents gaming) */
  maxMistakeBonus: number;

  /** Streak multiplier per day */
  streakMultiplier: number;

  /** Max streak multiplier */
  maxStreakMultiplier: number;

  /** Points for practicing focus words */
  focusWordPoints: number;

  /** Difficulty multipliers */
  difficultyMultipliers: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

// ============================================================================
// Goal-Based Word System
// ============================================================================

/**
 * User's learning goal categories
 */
export type LearningGoalCategory =
  | 'travel'
  | 'business'
  | 'academic'
  | 'social'
  | 'professional_interview'
  | 'daily_conversation'
  | 'public_speaking'
  | 'custom';

/**
 * Word priority based on user goals
 */
export interface GoalWord {
  /** The word */
  word: string;

  /** Why this word matters for their goal */
  relevance: string;

  /** Priority level (1 = highest) */
  priority: 1 | 2 | 3;

  /** Category this word falls under */
  category: string;

  /** Whether user has mastered it */
  mastered: boolean;

  /** Number of times practiced */
  practiceCount: number;

  /** Last accuracy on this word */
  lastAccuracy: number;
}

/**
 * Goal-based word targeting configuration
 */
export interface GoalWordConfig {
  /** User's primary goal */
  primaryGoal: LearningGoalCategory;

  /** User's secondary goals */
  secondaryGoals: LearningGoalCategory[];

  /** Custom focus words added by user */
  customWords: string[];

  /** Words identified as problem areas */
  problemWords: string[];

  /** Target words for current session */
  sessionTargetWords: GoalWord[];
}

// ============================================================================
// Milestone System
// ============================================================================

/**
 * Types of milestones
 */
export type MilestoneType =
  | 'attempts'           // Total practice attempts
  | 'streak'             // Consecutive days
  | 'words_practiced'    // Total words attempted
  | 'words_mastered'     // Words consistently correct
  | 'accuracy_achieved'  // Reached accuracy threshold
  | 'minutes_practiced'  // Total practice time
  | 'mistakes_learned'   // Mistakes that became correct
  | 'goal_words'         // Goal-specific words mastered
  | 'improvement';       // Improvement from baseline

/**
 * A milestone definition
 */
export interface Milestone {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description */
  description: string;

  /** Type of milestone */
  type: MilestoneType;

  /** Target value to achieve */
  targetValue: number;

  /** Current progress value */
  currentValue: number;

  /** Whether achieved */
  isAchieved: boolean;

  /** When achieved (ISO string) */
  achievedAt?: string;

  /** Points awarded for achieving */
  pointsAwarded: number;

  /** Icon name for display */
  icon: string;

  /** Tier (bronze, silver, gold, platinum) */
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

/**
 * User's milestone progress
 */
export interface MilestoneProgress {
  /** Total milestones achieved */
  totalAchieved: number;

  /** Total milestones available */
  totalAvailable: number;

  /** Recently achieved (last 7 days) */
  recentlyAchieved: Milestone[];

  /** Next milestones close to achieving */
  upcomingMilestones: Milestone[];

  /** All milestones by category */
  milestonesByType: Record<MilestoneType, Milestone[]>;

  /** Total points from milestones */
  totalMilestonePoints: number;
}

// ============================================================================
// Combined Session Result
// ============================================================================

/**
 * Complete result from a speaking practice session
 */
export interface SpeakingSessionResult {
  /** Session ID */
  sessionId: string;

  /** Timestamp */
  timestamp: string;

  /** The expected text */
  expectedText: string;

  /** What was transcribed */
  transcribedText: string;

  /** Honest feedback */
  feedback: HonestFeedback;

  /** Points earned */
  points: EffortPoints;

  /** Milestones achieved this session */
  milestonesAchieved: Milestone[];

  /** Updated milestone progress */
  milestoneProgress: MilestoneProgress;

  /** Goal words practiced */
  goalWordsPracticed: GoalWord[];

  /** Words added to focus list */
  wordsAddedToFocus: string[];
}

// ============================================================================
// Gemini Analysis Types
// ============================================================================

/**
 * Input for Gemini speaking analysis
 */
export interface GeminiSpeakingInput {
  /** Expected text user should have read */
  expectedText: string;

  /** Transcribed text from Whisper */
  transcribedText: string;

  /** Word-level transcription data */
  transcriptionWords: Array<{
    word: string;
    start: number;
    end: number;
    confidence?: number;
  }>;

  /** User's learning goal for context */
  userGoal?: LearningGoalCategory;

  /** User's proficiency level */
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';

  /** Language being learned */
  targetLanguage: string;

  /** Previous accuracy on same content (for progress tracking) */
  previousAccuracy?: number;
}

/**
 * Gemini's analysis response
 */
export interface GeminiSpeakingAnalysis {
  /** Word-by-word analysis */
  wordAnalysis: WordAnalysis[];

  /** Overall accuracy (0-100) */
  overallAccuracy: number;

  /** Honest summary of performance */
  honestSummary: string;

  /** Actual strengths (may be empty if none) */
  strengths: string[];

  /** Areas needing work */
  areasToImprove: string[];

  /** Priority words to practice */
  priorityWords: string[];

  /** Pronunciation patterns to work on */
  pronunciationPatterns: string[];

  /** Encouragement based on effort */
  effortEncouragement: string;

  /** Specific next step */
  recommendedNextStep: string;

  /** Whether significant improvement from previous attempt */
  showedImprovement?: boolean;
}
