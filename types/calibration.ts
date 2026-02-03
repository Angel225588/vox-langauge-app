/**
 * Calibration System Types
 *
 * Quick level calibrator - NOT a test, but a calibration tool.
 * Points for completion, no penalties for errors.
 * AI analyzes responses to create personalized learning paths.
 */

export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type DeclaredLevel =
  | 'beginner'      // A0 - Skip calibration, start immediately
  | 'basics'        // A1-A2 - Quick 2 min probe
  | 'intermediate'  // B1-B2 - 3 min probe
  | 'advanced';     // B2-C1 - 3 min probe

export type ProbeType =
  | 'vocabulary'    // Word recognition (all levels)
  | 'listening'     // Audio comprehension (all levels)
  | 'speaking'      // Pronunciation/fluency (all levels)
  | 'writing';      // Text production (B1+ only)

/**
 * User's self-declared level selection
 */
export interface DeclaredLevelOption {
  id: DeclaredLevel;
  title: string;
  description: string;
  emoji: string;
  skipCalibration?: boolean;  // true for 'beginner'
}

/**
 * Individual probe response - tracks behavior, not correctness
 */
export interface ProbeResponse {
  probeType: ProbeType;
  itemId: string;

  // Behavior tracking (for AI analysis)
  timeSpent: number;          // ms
  hesitationTime?: number;    // ms before first action
  audioReplays?: number;      // For listening probes

  // User input
  selectedOption?: string;    // For multiple choice
  userInput?: string;         // For typing/writing
  recordingUri?: string;      // For speaking

  // Self-assessment (optional)
  confidence?: 'low' | 'medium' | 'high';

  // Metadata
  difficulty: CEFRLevel;
  timestamp: number;
}

/**
 * Vocabulary probe item
 */
export interface VocabProbeItem {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  difficulty: CEFRLevel;
  category: string;
  partOfSpeech: string;
}

/**
 * Listening probe item
 */
export interface ListeningProbeItem {
  id: string;
  audioText: string;          // What's spoken
  audioUrl?: string;          // Pre-recorded audio (optional)
  options: string[];          // Multiple choice options
  correctIndex: number;
  difficulty: CEFRLevel;
  context?: string;           // e.g., "greeting", "shopping"
}

/**
 * Speaking probe prompt
 */
export interface SpeakingProbeItem {
  id: string;
  prompt: string;             // What to say/describe
  promptTranslation: string;  // In user's native language
  targetDuration: number;     // Expected seconds (15, 30, 60)
  difficulty: CEFRLevel;
  context: string;            // e.g., "describe your day"
  hints?: string[];           // Helper words/phrases
}

/**
 * Writing probe prompt (B1+ only)
 */
export interface WritingProbeItem {
  id: string;
  prompt: string;
  promptTranslation: string;
  targetLength: 'short' | 'medium';  // 1-2 sentences vs paragraph
  difficulty: CEFRLevel;
  context: string;
  exampleStart?: string;      // Optional sentence starter
}

/**
 * Skill assessment from a single probe
 */
export interface SkillAssessment {
  skill: ProbeType;
  estimatedLevel: CEFRLevel;
  confidence: number;         // 0-1, how confident is the assessment

  // AI insights (for flow generation)
  insights: {
    strengths: string[];
    areasToExplore: string[];
    suggestedFocus: string[];
  };
}

/**
 * Complete calibration result
 */
export interface CalibrationResult {
  // Overall assessment
  declaredLevel: DeclaredLevel;
  calibratedLevel: CEFRLevel;
  calibrationDate: string;

  // Per-skill breakdown
  skills: {
    vocabulary: SkillAssessment;
    listening: SkillAssessment;
    speaking: SkillAssessment;
    writing?: SkillAssessment;  // Only for B1+
  };

  // Raw responses (for AI analysis)
  responses: ProbeResponse[];

  // AI-generated recommendations
  recommendations: {
    startingPoint: string;          // Where to begin
    focusAreas: string[];           // Priority skills
    contentTypes: string[];         // Card types to emphasize
    estimatedTimeToNextLevel: string;
  };

  // Completion tracking
  pointsEarned: number;            // Points for participating
  probesCompleted: number;
  totalTime: number;               // Total calibration time in ms
}

/**
 * Calibration flow state
 */
export interface CalibrationState {
  // Flow status
  status: 'idle' | 'selecting-level' | 'in-progress' | 'analyzing' | 'complete';

  // User selection
  declaredLevel: DeclaredLevel | null;

  // Current progress
  currentProbeType: ProbeType | null;
  currentProbeIndex: number;

  // Probes for this calibration (based on declared level)
  probeSequence: ProbeType[];

  // Collected responses
  responses: ProbeResponse[];

  // Points (gamification - for completion, not accuracy)
  points: number;

  // Timing
  startTime: number | null;

  // Result (after completion)
  result: CalibrationResult | null;
}

/**
 * Props for calibration probe components
 */
export interface CalibrationProbeProps<T> {
  item: T;
  onComplete: (response: Omit<ProbeResponse, 'probeType' | 'timestamp'>) => void;
  onSkip?: () => void;
  showHints?: boolean;
  nativeLanguage?: string;
}

/**
 * Level check banner props
 */
export interface LevelCheckBannerProps {
  onStartCalibration: () => void;
  onSkipAsBeginner: () => void;
  dismissed?: boolean;
  onDismiss?: () => void;
}

/**
 * Declared level picker props
 */
export interface DeclaredLevelPickerProps {
  onSelect: (level: DeclaredLevel) => void;
  onBack?: () => void;
}

/**
 * Calibration flow props
 */
export interface CalibrationFlowProps {
  onComplete: (result: CalibrationResult) => void;
  onExit?: () => void;
  initialLevel?: DeclaredLevel;
}

/**
 * Default declared level options
 */
export const DECLARED_LEVEL_OPTIONS: DeclaredLevelOption[] = [
  {
    id: 'beginner',
    title: 'Complete Beginner',
    description: "I'm just starting out",
    emoji: '🌱',
    skipCalibration: true,
  },
  {
    id: 'basics',
    title: 'Know Some Basics',
    description: 'I know common words and simple phrases',
    emoji: '📚',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'I can have simple conversations',
    emoji: '💬',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'I can discuss complex topics',
    emoji: '🎯',
  },
];

/**
 * Probe sequences based on declared level
 */
export const PROBE_SEQUENCES: Record<DeclaredLevel, ProbeType[]> = {
  beginner: [],  // Skip calibration
  basics: ['vocabulary', 'listening', 'speaking'],
  intermediate: ['vocabulary', 'listening', 'speaking', 'writing'],
  advanced: ['vocabulary', 'listening', 'speaking', 'writing'],
};

/**
 * Points awarded for probe completion (not accuracy)
 */
export const PROBE_POINTS: Record<ProbeType, number> = {
  vocabulary: 10,
  listening: 15,
  speaking: 20,
  writing: 25,
};

/**
 * Map declared level to starting CEFR assessment range
 */
export const DECLARED_TO_CEFR_RANGE: Record<DeclaredLevel, { min: CEFRLevel; max: CEFRLevel }> = {
  beginner: { min: 'A0', max: 'A0' },
  basics: { min: 'A1', max: 'A2' },
  intermediate: { min: 'B1', max: 'B2' },
  advanced: { min: 'B2', max: 'C1' },
};
