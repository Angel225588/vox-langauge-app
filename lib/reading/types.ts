/**
 * Reading/Teleprompter System Types
 *
 * Complete TypeScript type definitions for the Vox Reading system.
 * This system manages reading practice sessions with audio recording,
 * transcription analysis, and feedback generation.
 */

// ============================================================================
// Enums and Type Aliases
// ============================================================================

/**
 * Source type for reading content
 */
export type SourceType =
  | 'ai_story'        // AI-generated story
  | 'user_story'      // User-created story
  | 'lesson'          // From a lesson
  | 'imported'        // Imported content
  | 'curated';        // Curated passage

/**
 * Difficulty levels for reading content
 */
export type ReadingDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Types of issues with pronunciation/reading
 */
export type IssueType =
  | 'skipped'         // Word was skipped
  | 'hesitated'       // Hesitation before word
  | 'mispronounced'   // Incorrect pronunciation
  | 'repeated';       // Word repeated unnecessarily

// ============================================================================
// Core Reading Session Entity
// ============================================================================

/**
 * Main reading session entity
 *
 * Represents a complete reading practice session with recording,
 * analysis, and feedback.
 */
export interface ReadingSession {
  /** Unique identifier for the session */
  id: string;

  /** User ID (for multi-user support) */
  userId: string;

  /** ISO date string when session was created */
  createdAt: string;

  /** ISO date string when session was last updated */
  updatedAt: string;

  // Content Information
  /** Type of content source */
  sourceType: SourceType;

  /** ID of the source (lesson, story, etc.) if applicable */
  sourceId?: string;

  /** Full text content that was read */
  text: string;

  /** Optional title for the reading */
  title?: string;

  /** Difficulty level of the content */
  difficulty: ReadingDifficulty;

  // Recording Data
  /** URI/path to the audio recording file */
  recordingUri?: string;

  /** Duration of recording in milliseconds */
  recordingDurationMs: number;

  // Analysis Results
  /** Full transcription of the recording */
  transcription?: string;

  /** Number of words in the original text */
  wordsExpected: number;

  /** Number of words actually spoken (from transcription) */
  wordsSpoken: number;

  /** Articulation/clarity score (0-100) */
  articulationScore: number;

  /** Fluency/smoothness score (0-100) */
  fluencyScore: number;

  /** Overall composite score (0-100) */
  overallScore: number;

  // Problem Words
  /** Array of words that had issues */
  problemWords: ProblemWord[];

  // User Controls
  /** Whether this session is publicly visible */
  isPublic: boolean;

  /** Soft delete flag */
  isDeleted: boolean;

  // Feedback
  /** AI-generated feedback for the session */
  feedback?: ReadingFeedback;
}

// ============================================================================
// Problem Word Tracking
// ============================================================================

/**
 * Represents a word that had issues during reading
 *
 * Used for targeted practice and word bank integration
 */
export interface ProblemWord {
  /** The word that had an issue */
  word: string;

  /** Type of issue encountered */
  issueType: IssueType;

  /** Timestamp in recording when issue occurred (ms) */
  timestamp: number;

  /** Expected timestamp for this word (ms) */
  expectedTimestamp?: number;

  /** Surrounding context (sentence containing the word) */
  context: string;

  /** Suggestion for improvement */
  suggestion?: string;

  /** Whether this word was added to user's Word Bank */
  addedToWordBank: boolean;

  /** ID of word in Word Bank if added */
  wordBankId?: string;
}

// ============================================================================
// Feedback and Analysis
// ============================================================================

/**
 * AI-generated feedback for a reading session
 *
 * Provides encouragement and actionable improvement suggestions
 */
export interface ReadingFeedback {
  /** Overall summary of performance */
  summary: string;

  /** Things the user did well */
  strengths: string[];

  /** Areas for improvement */
  improvements: string[];

  /** Encouraging message */
  encouragement: string;

  /** Suggested next steps */
  nextSteps: string[];
}

/**
 * Detailed articulation analysis
 *
 * Breaks down specific aspects of pronunciation quality
 */
export interface ArticulationAnalysis {
  /** Clarity of individual words (0-100) */
  wordClarity: number;

  /** Completion of syllables (0-100) */
  syllableCompletion: number;

  /** Appropriate pause placement (0-100) */
  pausePlacement: number;

  /** Clear word boundaries (0-100) */
  wordBoundaries: number;

  /** Number of hesitations detected */
  hesitationCount: number;

  /** Average duration of pauses (ms) */
  averagePauseDuration: number;
}

// ============================================================================
// Passage Management
// ============================================================================

/**
 * A reading passage/content piece
 *
 * Represents content that can be used for reading practice
 */
export interface Passage {
  /** Unique identifier */
  id: string;

  /** Passage title */
  title: string;

  /** Full text content */
  text: string;

  /** Difficulty level */
  difficulty: ReadingDifficulty;

  /** Category/topic (e.g., 'travel', 'food', 'business') */
  category: string;

  /** Total word count */
  wordCount: number;

  /** Estimated reading duration in seconds */
  estimatedDuration: number;

  /** Source type */
  sourceType: 'curated' | 'ai_generated' | 'user_imported';

  /** Optional words from user's Word Bank to emphasize */
  targetWords?: string[];

  /** ISO date string when created */
  createdAt: string;
}

// ============================================================================
// CRUD Input Types
// ============================================================================

/**
 * Input for creating a new reading session
 *
 * Only required fields needed - computed fields added automatically
 */
export interface CreateSessionInput {
  /** User ID */
  userId: string;

  /** Type of content source */
  sourceType: SourceType;

  /** ID of the source (optional) */
  sourceId?: string;

  /** Text content to read */
  text: string;

  /** Optional title */
  title?: string;

  /** Difficulty level */
  difficulty: ReadingDifficulty;

  /** Recording URI (optional - can be added later) */
  recordingUri?: string;

  /** Recording duration in milliseconds (default: 0) */
  recordingDurationMs?: number;

  /** Whether session is public (default: false) */
  isPublic?: boolean;
}

/**
 * Input for updating an existing reading session
 *
 * All fields optional - only provided fields will be updated
 */
export interface UpdateSessionInput {
  /** Update title */
  title?: string;

  /** Update difficulty */
  difficulty?: ReadingDifficulty;

  /** Update recording URI */
  recordingUri?: string;

  /** Update recording duration */
  recordingDurationMs?: number;

  /** Update transcription */
  transcription?: string;

  /** Update words spoken */
  wordsSpoken?: number;

  /** Update articulation score */
  articulationScore?: number;

  /** Update fluency score */
  fluencyScore?: number;

  /** Update overall score */
  overallScore?: number;

  /** Update problem words */
  problemWords?: ProblemWord[];

  /** Update feedback */
  feedback?: ReadingFeedback;

  /** Update public visibility */
  isPublic?: boolean;

  /** Update deleted status */
  isDeleted?: boolean;
}

/**
 * Filter options for querying sessions
 *
 * All fields optional - combine for refined queries
 */
export interface SessionFilter {
  /** Filter by user ID */
  userId?: string;

  /** Filter by source type */
  sourceType?: SourceType;

  /** Filter by difficulty */
  difficulty?: ReadingDifficulty;

  /** Filter by minimum score */
  minScore?: number;

  /** Filter by maximum score */
  maxScore?: number;

  /** Include deleted sessions (default: false) */
  includeDeleted?: boolean;

  /** Only public sessions */
  onlyPublic?: boolean;

  /** Search query for title or text */
  searchQuery?: string;

  /** Limit number of results */
  limit?: number;

  /** Offset for pagination */
  offset?: number;

  /** Date range start (ISO string) */
  dateFrom?: string;

  /** Date range end (ISO string) */
  dateTo?: string;
}

// ============================================================================
// Statistics and Analytics
// ============================================================================

/**
 * Aggregate statistics for reading sessions
 *
 * Provides overview of user's reading progress
 */
export interface ReadingStats {
  /** Total number of sessions */
  totalSessions: number;

  /** Total reading time in minutes */
  totalReadingMinutes: number;

  /** Average overall score (0-100) */
  averageScore: number;

  /** Average articulation score (0-100) */
  averageArticulationScore: number;

  /** Average fluency score (0-100) */
  averageFluencyScore: number;

  /** Sessions by difficulty level */
  sessionsByDifficulty: Record<ReadingDifficulty, number>;

  /** Sessions by source type */
  sessionsBySource: Record<SourceType, number>;

  /** Total unique problem words encountered */
  uniqueProblemWords: number;

  /** Most common problem words */
  topProblemWords: Array<{
    word: string;
    count: number;
    issueTypes: IssueType[];
  }>;

  /** Score improvement trend (last N sessions) */
  recentScoreTrend: number[]; // Array of recent scores

  /** Longest reading streak (consecutive days) */
  longestStreak: number;

  /** Current reading streak (consecutive days) */
  currentStreak: number;
}

/**
 * Progress tracking over time
 */
export interface ReadingProgress {
  /** Progress data points by date */
  dataPoints: Array<{
    date: string;
    sessionsCount: number;
    averageScore: number;
  }>;

  /** Overall improvement percentage */
  improvementPercentage: number;

  /** Areas showing improvement */
  strengths: string[];

  /** Areas needing focus */
  weaknesses: string[];
}

// ============================================================================
// Database Types
// ============================================================================

/**
 * Raw database row structure
 *
 * Used for SQLite storage - JSON fields stored as strings
 */
export interface ReadingSessionRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  source_type: SourceType;
  source_id: string | null;
  text: string;
  title: string | null;
  difficulty: ReadingDifficulty;
  recording_uri: string | null;
  recording_duration_ms: number;
  transcription: string | null;
  words_expected: number;
  words_spoken: number;
  articulation_score: number;
  fluency_score: number;
  overall_score: number;
  problem_words: string; // JSON array
  is_public: number; // SQLite boolean (0 or 1)
  is_deleted: number; // SQLite boolean (0 or 1)
  feedback: string | null; // JSON object
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Sort field options
 */
export type SessionSortField =
  | 'createdAt'
  | 'overallScore'
  | 'articulationScore'
  | 'fluencyScore'
  | 'recordingDurationMs'
  | 'difficulty';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  field: SessionSortField;
  direction: SortDirection;
}

/**
 * Pagination result
 */
export interface PaginatedSessions {
  sessions: ReadingSession[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
