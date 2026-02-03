/**
 * AI Module - Exports
 *
 * Centralized exports for all AI-related functionality.
 *
 * ## Architecture: Claude + Gemini Orchestration
 * - **Claude (Supervisor)**: Strategic planning, staircase structure, validation
 * - **Gemini (Worker)**: Bulk content generation (vocabulary, scenarios, etc.)
 * - Falls back to Gemini-only mode if Claude is unavailable
 */

// Gemini API Client
export {
  generateWithGemini,
  generateJSON,
  generateLearningPath,
  generateLearningPlan,
  GeminiError,
} from './gemini';

// Claude API Client
export {
  generateWithClaude,
  generateJSON as generateClaudeJSON,
  generateLearningPathPlan,
  isClaudeAvailable,
  ClaudeError,
  CLAUDE_CONFIG,
} from './claudeClient';

// Claude Types
export type {
  UserLearningProfile,
  StairBrief,
  LearningPathPlan,
} from './claudeClient';

// AI Orchestrator (Claude + Gemini)
export {
  AIOrchestrator,
  orchestratePathGeneration,
  isOrchestrationAvailable,
} from './orchestrator';

// Orchestrator Types
export type {
  OrchestrationPhase,
  OrchestrationProgress,
  OrchestrationResult,
  OrchestratorOptions,
} from './orchestrator';

// User Memory System
export {
  initializeUserMemory,
  getUserMemory,
  updateUserMemory,
  updateMemoryAfterLesson,
  updateMemoryAfterCalibrator,
  generateMemorySummary,
  analyzePatterns,
  calculateCEFRLevel,
} from './userMemory';

// User Memory Types
export type {
  UserAIMemory,
  LessonType,
  LessonResult,
  LessonProgress,
  SkillScores,
  LearningInsights,
  AIObservations,
  PersonalizedRecommendations,
} from './userMemory';
