/**
 * Calibration System Components
 *
 * Quick level calibrator for the Vox Language App.
 * Points for completion, not accuracy. AI analyzes responses
 * to create personalized learning paths.
 *
 * Components:
 * - LevelCheckBanner: Home screen prompt to start calibration
 * - DeclaredLevelPicker: Self-assessment level selection
 * - CalibrationFlow: Main orchestrator component
 * - ResultsCard: Skill breakdown and recommendations
 *
 * Probes:
 * - VocabProbe: Vocabulary recognition
 * - ListeningProbe: Audio comprehension
 * - SpeakingProbe: Speaking sample
 * - WritingProbe: Writing sample (B1+)
 */

// Main components
export { LevelCheckBanner } from './LevelCheckBanner';
export { DeclaredLevelPicker } from './DeclaredLevelPicker';
export { CalibrationFlow } from './CalibrationFlow';
export { ResultsCard } from './ResultsCard';

// Probes
export { VocabProbe, ListeningProbe, SpeakingProbe, WritingProbe } from './probes';

// Hook
export { useCalibration } from './hooks/useCalibration';

// Re-export types
export type {
  CEFRLevel,
  DeclaredLevel,
  ProbeType,
  DeclaredLevelOption,
  ProbeResponse,
  VocabProbeItem,
  ListeningProbeItem,
  SpeakingProbeItem,
  WritingProbeItem,
  SkillAssessment,
  CalibrationResult,
  CalibrationState,
  CalibrationProbeProps,
  LevelCheckBannerProps,
  DeclaredLevelPickerProps,
  CalibrationFlowProps,
} from '@/types/calibration';

// Re-export constants
export {
  DECLARED_LEVEL_OPTIONS,
  PROBE_SEQUENCES,
  PROBE_POINTS,
  DECLARED_TO_CEFR_RANGE,
} from '@/types/calibration';
