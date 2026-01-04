/**
 * Feedback System Components
 *
 * Reusable components for all practice feedback screens:
 * - Voice Practice
 * - Reading Practice
 * - Writing Practice
 * - Vocabulary Practice
 *
 * Philosophy: "Confidence comes from a safe space where evolution is the reward"
 */

export * from './types';

// Score visualization
export { ScoreRing, getScoreColor, getScoreMessage, SCORE_COLORS } from './ScoreRing';
export type { ScoreRingProps } from './ScoreRing';

// Stats display
export { StatsGrid } from './StatsGrid';
export type { StatsGridProps, StatItem } from './StatsGrid';

// Collapsible sections
export { FeedbackSection } from './FeedbackSection';
export type { FeedbackSectionProps } from './FeedbackSection';

// Words to practice
export {
  WordsToPractice,
  getSeverityColor,
  getSeverityLabel,
} from './WordsToPractice';
export type {
  WordsToPracticeProps,
  WordToPractice,
  WordSeverity,
} from './WordsToPractice';
