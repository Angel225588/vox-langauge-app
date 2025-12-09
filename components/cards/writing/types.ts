/**
 * Writing Task Types
 *
 * Type definitions for the Personal Script Builder / Writing Task system.
 * Supports TBLT (Task-Based Language Teaching) approach.
 */

export type TaskCategory =
  | 'daily_routine'
  | 'self_introduction'
  | 'job_interview'
  | 'email'
  | 'message'
  | 'travel'
  | 'opinion'
  | 'story'
  | 'custom';

export type CorrectionType =
  | 'grammar'
  | 'spelling'
  | 'vocabulary'
  | 'style'
  | 'punctuation';

export interface WritingTask {
  id: string;
  title: string;
  category: TaskCategory;
  scenario: string;           // "Write an email to your neighbor..."
  goal: string;               // "Practice formal request language"
  context?: string;           // Additional context
  recommendations: string[];  // Tips before starting
  targetLanguage: string;
  minWords?: number;
  maxWords?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface GrammarCorrection {
  id: string;
  type: CorrectionType;
  original: string;
  corrected: string;
  explanation: string;
  rule?: string;              // Grammar rule name
  position: {
    start: number;
    end: number;
  };
}

export interface WritingAnalysis {
  corrections: GrammarCorrection[];
  correctedText: string;
  overallFeedback: string;
  strengths: string[];
  areasToImprove: string[];
  grammarScore: number;       // 0-100
  vocabularyScore: number;    // 0-100
  clarityScore: number;       // 0-100
}

export interface UserNote {
  id: string;
  title: string;
  content: string;
  correctedContent?: string;
  label: string;              // Auto or manual label
  taskId?: string;            // Reference to original task
  category: TaskCategory;
  analysis?: WritingAnalysis;
  createdAt: string;
  updatedAt: string;
  practiceCount: number;
  lastPracticed?: string;
}

export interface WritingTaskResult {
  taskId: string;
  originalText: string;
  correctedText: string;
  title: string;
  label: string;
  analysis: WritingAnalysis;
  completedAt: string;
  timeSpentMs: number;
}
