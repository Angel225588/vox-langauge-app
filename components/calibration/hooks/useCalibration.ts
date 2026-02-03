/**
 * useCalibration Hook
 *
 * Manages calibration flow state, scoring, and level estimation.
 * Points are awarded for completion, not accuracy.
 * AI analysis happens on responses to determine actual level.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  CalibrationState,
  CalibrationResult,
  ProbeResponse,
  ProbeType,
  DeclaredLevel,
  CEFRLevel,
  SkillAssessment,
} from '@/types/calibration';
import {
  PROBE_SEQUENCES,
  PROBE_POINTS,
  DECLARED_TO_CEFR_RANGE,
} from '@/types/calibration';

const INITIAL_STATE: CalibrationState = {
  status: 'idle',
  declaredLevel: null,
  currentProbeType: null,
  currentProbeIndex: 0,
  probeSequence: [],
  responses: [],
  points: 0,
  startTime: null,
  result: null,
};

/**
 * Estimate CEFR level from probe responses
 * This is a simplified heuristic - in production, AI would analyze deeper
 */
function estimateSkillLevel(
  responses: ProbeResponse[],
  skill: ProbeType,
  declaredRange: { min: CEFRLevel; max: CEFRLevel }
): SkillAssessment {
  const skillResponses = responses.filter((r) => r.probeType === skill);

  if (skillResponses.length === 0) {
    return {
      skill,
      estimatedLevel: declaredRange.min,
      confidence: 0.3,
      insights: {
        strengths: [],
        areasToExplore: ['Complete calibration for this skill'],
        suggestedFocus: [],
      },
    };
  }

  // Analyze behavior patterns
  const avgTime = skillResponses.reduce((sum, r) => sum + r.timeSpent, 0) / skillResponses.length;
  const avgHesitation = skillResponses
    .filter((r) => r.hesitationTime !== undefined)
    .reduce((sum, r) => sum + (r.hesitationTime || 0), 0) / skillResponses.length || 0;
  const totalReplays = skillResponses.reduce((sum, r) => sum + (r.audioReplays || 0), 0);

  // Confidence patterns
  const highConfidenceCount = skillResponses.filter((r) => r.confidence === 'high').length;
  const lowConfidenceCount = skillResponses.filter((r) => r.confidence === 'low').length;

  // Estimate level based on patterns
  let estimatedLevel: CEFRLevel = declaredRange.min;
  let confidence = 0.5;

  // Quick responses + high confidence = likely higher level
  if (avgTime < 3000 && highConfidenceCount > lowConfidenceCount) {
    estimatedLevel = declaredRange.max;
    confidence = 0.7;
  }
  // Slow responses + many replays = likely lower level
  else if (avgTime > 8000 || totalReplays > skillResponses.length * 2) {
    estimatedLevel = declaredRange.min;
    confidence = 0.6;
  }
  // Middle ground
  else {
    const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const minIndex = levels.indexOf(declaredRange.min);
    const maxIndex = levels.indexOf(declaredRange.max);
    const midIndex = Math.floor((minIndex + maxIndex) / 2);
    estimatedLevel = levels[midIndex];
    confidence = 0.5;
  }

  // Generate insights based on behavior
  const strengths: string[] = [];
  const areasToExplore: string[] = [];
  const suggestedFocus: string[] = [];

  if (avgTime < 3000) {
    strengths.push('Quick response time');
  }
  if (highConfidenceCount > skillResponses.length / 2) {
    strengths.push('Good self-awareness');
  }
  if (avgHesitation < 1000) {
    strengths.push('Confident recall');
  }

  if (totalReplays > skillResponses.length) {
    areasToExplore.push('Audio processing speed');
    suggestedFocus.push('Listening practice with varied speeds');
  }
  if (lowConfidenceCount > skillResponses.length / 2) {
    areasToExplore.push('Building confidence');
    suggestedFocus.push('Spaced repetition for reinforcement');
  }
  if (avgHesitation > 3000) {
    areasToExplore.push('Recall speed');
    suggestedFocus.push('Quick-fire vocabulary drills');
  }

  return {
    skill,
    estimatedLevel,
    confidence,
    insights: {
      strengths,
      areasToExplore,
      suggestedFocus,
    },
  };
}

/**
 * Calculate overall CEFR level from skill assessments
 */
function calculateOverallLevel(skills: {
  vocabulary: SkillAssessment;
  listening: SkillAssessment;
  speaking: SkillAssessment;
  writing?: SkillAssessment;
}): CEFRLevel {
  const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const skillLevels = [
    skills.vocabulary.estimatedLevel,
    skills.listening.estimatedLevel,
    skills.speaking.estimatedLevel,
  ];

  if (skills.writing) {
    skillLevels.push(skills.writing.estimatedLevel);
  }

  // Calculate weighted average (writing counts more if present)
  const levelIndices = skillLevels.map((l) => levels.indexOf(l));
  const avgIndex = Math.round(
    levelIndices.reduce((sum, idx) => sum + idx, 0) / levelIndices.length
  );

  return levels[Math.max(0, Math.min(avgIndex, levels.length - 1))];
}

/**
 * Generate AI recommendations based on calibration
 */
function generateRecommendations(
  skills: {
    vocabulary: SkillAssessment;
    listening: SkillAssessment;
    speaking: SkillAssessment;
    writing?: SkillAssessment;
  },
  overallLevel: CEFRLevel
): CalibrationResult['recommendations'] {
  const weakestSkill = Object.entries(skills)
    .filter(([_, v]) => v !== undefined)
    .sort((a, b) => {
      const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      return levels.indexOf(a[1].estimatedLevel) - levels.indexOf(b[1].estimatedLevel);
    })[0];

  const focusAreas: string[] = [];
  const contentTypes: string[] = [];

  // Based on level
  if (overallLevel === 'A0' || overallLevel === 'A1') {
    focusAreas.push('Basic vocabulary building', 'Simple sentence patterns');
    contentTypes.push('IntroductionCard', 'AudioQuizCard', 'ListeningCard');
  } else if (overallLevel === 'A2' || overallLevel === 'B1') {
    focusAreas.push('Conversational fluency', 'Grammar accuracy');
    contentTypes.push('SpeakingCard', 'TypingCard', 'FillInBlankCard');
  } else {
    focusAreas.push('Complex expression', 'Nuanced vocabulary');
    contentTypes.push('WritingTask', 'RolePlayCard', 'StorytellingCard');
  }

  // Based on weakest skill
  if (weakestSkill) {
    const [skillName, assessment] = weakestSkill;
    focusAreas.push(...assessment.insights.suggestedFocus);
  }

  // Starting point based on level
  const startingPoints: Record<CEFRLevel, string> = {
    A0: 'Essential actions and pronouns for daily life',
    A1: 'Common phrases and basic conversations',
    A2: 'Everyday situations and simple discussions',
    B1: 'Extended conversations and expressing opinions',
    B2: 'Complex topics and professional contexts',
    C1: 'Nuanced expression and advanced vocabulary',
    C2: 'Native-like fluency refinement',
  };

  return {
    startingPoint: startingPoints[overallLevel],
    focusAreas: [...new Set(focusAreas)].slice(0, 4),
    contentTypes: [...new Set(contentTypes)].slice(0, 3),
    estimatedTimeToNextLevel: getTimeEstimate(overallLevel),
  };
}

function getTimeEstimate(level: CEFRLevel): string {
  const estimates: Record<CEFRLevel, string> = {
    A0: '2-4 weeks to A1',
    A1: '1-2 months to A2',
    A2: '2-3 months to B1',
    B1: '3-4 months to B2',
    B2: '4-6 months to C1',
    C1: '6+ months to C2',
    C2: 'Maintenance mode',
  };
  return estimates[level];
}

export function useCalibration() {
  const [state, setState] = useState<CalibrationState>(INITIAL_STATE);

  /**
   * Start calibration with selected declared level
   */
  const startCalibration = useCallback((declaredLevel: DeclaredLevel) => {
    const probeSequence = PROBE_SEQUENCES[declaredLevel];

    // Beginners skip calibration
    if (declaredLevel === 'beginner' || probeSequence.length === 0) {
      const result: CalibrationResult = {
        declaredLevel,
        calibratedLevel: 'A0',
        calibrationDate: new Date().toISOString(),
        skills: {
          vocabulary: {
            skill: 'vocabulary',
            estimatedLevel: 'A0',
            confidence: 1,
            insights: {
              strengths: ['Starting fresh!'],
              areasToExplore: ['Building foundational vocabulary'],
              suggestedFocus: ['Daily life words', 'Basic actions'],
            },
          },
          listening: {
            skill: 'listening',
            estimatedLevel: 'A0',
            confidence: 1,
            insights: {
              strengths: [],
              areasToExplore: ['Developing ear for the language'],
              suggestedFocus: ['Short audio clips', 'Repeated exposure'],
            },
          },
          speaking: {
            skill: 'speaking',
            estimatedLevel: 'A0',
            confidence: 1,
            insights: {
              strengths: [],
              areasToExplore: ['Pronunciation basics'],
              suggestedFocus: ['Word-by-word practice', 'Mimicking native speakers'],
            },
          },
        },
        responses: [],
        recommendations: {
          startingPoint: 'Essential actions and pronouns for daily life',
          focusAreas: ['Basic vocabulary', 'Simple pronunciation', 'Common greetings'],
          contentTypes: ['IntroductionCard', 'AudioQuizCard'],
          estimatedTimeToNextLevel: '2-4 weeks to A1',
        },
        pointsEarned: 50, // Bonus for starting!
        probesCompleted: 0,
        totalTime: 0,
      };

      setState({
        ...INITIAL_STATE,
        status: 'complete',
        declaredLevel,
        result,
        points: 50,
      });
      return;
    }

    setState({
      status: 'in-progress',
      declaredLevel,
      currentProbeType: probeSequence[0],
      currentProbeIndex: 0,
      probeSequence,
      responses: [],
      points: 0,
      startTime: Date.now(),
      result: null,
    });
  }, []);

  /**
   * Record a probe response and move to next
   */
  const recordResponse = useCallback((response: Omit<ProbeResponse, 'timestamp'>) => {
    setState((prev) => {
      const fullResponse: ProbeResponse = {
        ...response,
        timestamp: Date.now(),
      };

      const newResponses = [...prev.responses, fullResponse];
      const pointsForProbe = PROBE_POINTS[response.probeType] || 10;
      const newPoints = prev.points + pointsForProbe;

      // Check if there are more probes
      const nextIndex = prev.currentProbeIndex + 1;
      const hasMore = nextIndex < prev.probeSequence.length;

      if (hasMore) {
        return {
          ...prev,
          currentProbeIndex: nextIndex,
          currentProbeType: prev.probeSequence[nextIndex],
          responses: newResponses,
          points: newPoints,
        };
      }

      // Calibration complete - analyze results
      return {
        ...prev,
        status: 'analyzing',
        currentProbeType: null,
        responses: newResponses,
        points: newPoints,
      };
    });
  }, []);

  /**
   * Skip current probe (still counts as participation)
   */
  const skipProbe = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentProbeIndex + 1;
      const hasMore = nextIndex < prev.probeSequence.length;

      if (hasMore) {
        return {
          ...prev,
          currentProbeIndex: nextIndex,
          currentProbeType: prev.probeSequence[nextIndex],
          // Still get some points for participating
          points: prev.points + 5,
        };
      }

      return {
        ...prev,
        status: 'analyzing',
        currentProbeType: null,
        points: prev.points + 5,
      };
    });
  }, []);

  /**
   * Finalize calibration and generate results
   */
  const finalizeCalibration = useCallback(() => {
    setState((prev) => {
      if (!prev.declaredLevel) return prev;

      const declaredRange = DECLARED_TO_CEFR_RANGE[prev.declaredLevel];

      // Assess each skill
      const vocabularyAssessment = estimateSkillLevel(prev.responses, 'vocabulary', declaredRange);
      const listeningAssessment = estimateSkillLevel(prev.responses, 'listening', declaredRange);
      const speakingAssessment = estimateSkillLevel(prev.responses, 'speaking', declaredRange);

      const skills: CalibrationResult['skills'] = {
        vocabulary: vocabularyAssessment,
        listening: listeningAssessment,
        speaking: speakingAssessment,
      };

      // Only include writing for B1+
      if (prev.probeSequence.includes('writing')) {
        skills.writing = estimateSkillLevel(prev.responses, 'writing', declaredRange);
      }

      const overallLevel = calculateOverallLevel(skills);
      const recommendations = generateRecommendations(skills, overallLevel);

      const result: CalibrationResult = {
        declaredLevel: prev.declaredLevel,
        calibratedLevel: overallLevel,
        calibrationDate: new Date().toISOString(),
        skills,
        responses: prev.responses,
        recommendations,
        pointsEarned: prev.points + 25, // Bonus for completing
        probesCompleted: prev.responses.length,
        totalTime: prev.startTime ? Date.now() - prev.startTime : 0,
      };

      return {
        ...prev,
        status: 'complete',
        result,
        points: prev.points + 25,
      };
    });
  }, []);

  /**
   * Reset calibration
   */
  const resetCalibration = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /**
   * Get current progress info
   */
  const progress = useMemo(() => {
    const total = state.probeSequence.length;
    const current = state.currentProbeIndex;
    return {
      current: current + 1,
      total,
      percentage: total > 0 ? Math.round(((current + 1) / total) * 100) : 0,
    };
  }, [state.probeSequence.length, state.currentProbeIndex]);

  return {
    state,
    progress,
    startCalibration,
    recordResponse,
    skipProbe,
    finalizeCalibration,
    resetCalibration,
  };
}
