/**
 * Reading/Teleprompter System
 *
 * Complete reading practice system for Vox Language App.
 * Manages reading sessions with audio recording, transcription analysis,
 * and AI-powered feedback.
 *
 * @example
 * ```tsx
 * import {
 *   useReadingSession,
 *   useReadingSessions,
 *   useActiveSession,
 *   createSession,
 *   ReadingSession,
 * } from '@/lib/reading';
 *
 * // In a component
 * const { activeSession, startSession, stopRecording } = useActiveSession();
 * const { sessions, loading } = useReadingSessions({ filter: { userId: 'user_123' } });
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core entities
  ReadingSession,
  ProblemWord,
  ReadingFeedback,
  ArticulationAnalysis,
  Passage,

  // Input types
  CreateSessionInput,
  UpdateSessionInput,
  SessionFilter,

  // Statistics
  ReadingStats,
  ReadingProgress,

  // Database types
  ReadingSessionRow,

  // Utility types
  SourceType,
  ReadingDifficulty,
  IssueType,
  SessionSortField,
  SortDirection,
  SortConfig,
  PaginatedSessions,
} from './types';

// ============================================================================
// SCHEMA
// ============================================================================

export {
  READING_SESSIONS_TABLE,
  ReadingSessionColumns,
  CREATE_READING_SESSIONS_TABLE,
  CREATE_INDEXES,
  initializeReadingSessionsTable,
  tableExists,
  getRowCount,
  getActiveRowCount,
  dropReadingSessionsTable,
  softDeleteAllSessions,
  permanentlyDeleteOldSessions,
  calculateWordCount,
  estimateReadingDuration,
  calculateOverallScore,
  validateScore,
} from './schema';

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

export {
  // CRUD operations
  createSession,
  getSession,
  updateSession,
  deleteSession,
  restoreSession,

  // Query operations
  getSessions,
  getRecentSessions,
  getSessionsBySourceType,
  getSessionsByDifficulty,
  searchSessions,

  // Analysis operations
  addProblemWordToSession,
  updateSessionScores,
  updateSessionFeedback,
  completeSessionAnalysis,

  // Statistics
  getReadingStats,
  getSessionCount,
  hasAnySessions,
} from './storage';

// ============================================================================
// REACT HOOKS
// ============================================================================

export {
  useReadingSession,
  useReadingSessions,
  useActiveSession,
  useSessionStats,
  useRecentSessions,
  useSessionsBySource,
  useSessionsByDifficulty,
} from './hooks';

// Hook types
export type {
  UseReadingSessionReturn,
  UseReadingSessionsOptions,
  UseReadingSessionsReturn,
  UseActiveSessionReturn,
  UseSessionStatsReturn,
  UseRecentSessionsOptions,
  UseRecentSessionsReturn,
  UseSessionsBySourceOptions,
  UseSessionsBySourceReturn,
  UseSessionsByDifficultyOptions,
  UseSessionsByDifficultyReturn,
} from './hooks';

// ============================================================================
// AUDIO RECORDING
// ============================================================================

export {
  // Core recording functions
  requestAudioPermissions,
  checkAudioPermissions,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  getRecordingStatus,

  // Playback functions
  playRecording,
  stopPlayback,
  unloadSound,

  // File management
  deleteRecording,
  getRecordingInfo,
  getRecordingBase64,
  moveRecording,
  moveRecordingToPermanentStorage,
  copyRecording,

  // Utilities
  formatDuration,
  isValidRecordingUri,
  getRecordingExtension,
  generateRecordingFilename,
} from './audioRecording';

export type {
  RecordingState,
  RecordingResult,
  RecordingFileInfo,
} from './audioRecording';

// Audio Recording Hook
export { useAudioRecording } from './useAudioRecording';
export type { UseAudioRecordingReturn } from './useAudioRecording';

// Audio Playback Hook
export { useAudioPlayback } from './useAudioPlayback';
export type {
  UseAudioPlaybackReturn,
  UseAudioPlaybackOptions,
  WordWithTimestamp,
} from './useAudioPlayback';

// ============================================================================
// SPEECH-TO-TEXT
// ============================================================================

export {
  // Transcription functions
  transcribeAudio,
  transcribeWithHint,
  mockTranscribe,

  // Utility functions
  isWhisperAvailable,
  getSupportedLanguages,
  isLanguageSupported,
  getLanguageName,
} from './speechToText';

export type {
  TranscriptionWord,
  TranscriptionSegment,
  TranscriptionResult,
  TranscriptionOptions,
} from './speechToText';

// Transcription Hook
export { useTranscription } from './useTranscription';
export type {
  UseTranscriptionReturn,
  UseTranscriptionOptions,
} from './useTranscription';

// ============================================================================
// ARTICULATION ANALYSIS ENGINE
// ============================================================================

export {
  // Main analysis function
  analyzeArticulation,

  // Helper utilities
  normalizeText,
  levenshteinDistance,
  getSentenceContext,
  generateSuggestion,
} from './articulationEngine';

export type {
  AnalysisInput,
  AnalysisResult,
} from './articulationEngine';

// Articulation Analysis Hook
export { useArticulationAnalysis } from './useArticulationAnalysis';
export type { UseArticulationAnalysisReturn } from './useArticulationAnalysis';

// ============================================================================
// PASSAGE GENERATION (AI)
// ============================================================================

export {
  // AI passage generation
  generatePassage,
  generatePassageWithTargetWords,
  generatePassageBatch,

  // Topic suggestions
  getTopicSuggestions,
} from './passageGenerator';

export type {
  PassageGeneratorOptions,
} from './passageGenerator';

// ============================================================================
// CURATED PASSAGES
// ============================================================================

export {
  // Query functions
  getPassagesByDifficulty,
  getAllCuratedPassages,
  getRandomPassage,
  searchPassages,
  getPassagesByCategory,
  getPassagesByTags,
  getMostPopularPassages,
  getPassageStats,

  // Curated passages collection
  CURATED_PASSAGES,
} from './curatedPassages';

export type {
  CuratedPassage,
} from './curatedPassages';

// ============================================================================
// PASSAGE STORAGE (User-imported)
// ============================================================================

export {
  // CRUD operations
  saveUserPassage,
  getUserPassages,
  getUserPassage,
  deleteUserPassage,
  updateUserPassage,

  // Query operations
  searchUserPassages,
  getUserPassagesByDifficulty,
  getUserPassagesByCategory,
  getUserPassageStats,

  // Utility functions
  validatePassage,
  clearUserPassages,
  exportUserPassages,
  importUserPassages,
} from './passageStorage';

export type {
  UserPassage,
} from './passageStorage';
