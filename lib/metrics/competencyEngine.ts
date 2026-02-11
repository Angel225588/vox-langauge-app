/**
 * Competency Engine
 *
 * Pure logic for computing competency metrics, CEFR levels, trends,
 * and the full dashboard snapshot. No side effects — all data comes in as args.
 *
 * Used by: competency dashboard, practice tab KPIs.
 */

import {
  getAllScores,
  getScoreTrends,
  type PracticeScore,
  type PracticeType,
  type CompetencySnapshot,
} from '@/lib/db/competencyMetrics';

// =============================================================================
// CEFR Mapping
// =============================================================================

const CEFR_THRESHOLDS = [
  { level: 'A1', min: 0, max: 20 },
  { level: 'A2', min: 20, max: 40 },
  { level: 'B1', min: 40, max: 60 },
  { level: 'B2', min: 60, max: 80 },
  { level: 'C1', min: 80, max: 93 },
  { level: 'C2', min: 93, max: 100 },
] as const;

/**
 * Map a 0-100 score to CEFR level.
 */
export function mapScoreToCEFR(score: number): string {
  for (const t of CEFR_THRESHOLDS) {
    if (score < t.max) return t.level;
  }
  return 'C2';
}

/**
 * Calculate progress percentage within current CEFR band.
 */
export function getCEFRProgress(score: number): number {
  for (const t of CEFR_THRESHOLDS) {
    if (score < t.max) {
      const range = t.max - t.min;
      const position = score - t.min;
      return Math.round((position / range) * 100);
    }
  }
  return 100;
}

/**
 * Get the next CEFR level from current.
 */
export function getNextCEFR(current: string): string {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const idx = levels.indexOf(current);
  return idx < levels.length - 1 ? levels[idx + 1] : current;
}

// =============================================================================
// Score Computation
// =============================================================================

/**
 * Compute averages from a list of scores.
 */
export function computeAverages(scores: PracticeScore[]): {
  articulation: number;
  fluency: number;
  communication: number;
  scenario: number;
  overall: number;
} {
  if (scores.length === 0) {
    return { articulation: 0, fluency: 0, communication: 0, scenario: 0, overall: 0 };
  }

  const sum = scores.reduce(
    (acc, s) => ({
      articulation: acc.articulation + s.articulation,
      fluency: acc.fluency + s.fluency,
      communication: acc.communication + s.communication,
      scenario: acc.scenario + s.scenario,
    }),
    { articulation: 0, fluency: 0, communication: 0, scenario: 0 }
  );

  const n = scores.length;
  const articulation = Math.round(sum.articulation / n);
  const fluency = Math.round(sum.fluency / n);
  const communication = Math.round(sum.communication / n);
  const scenario = Math.round(sum.scenario / n);
  const overall = Math.round((articulation + fluency + communication + scenario) / 4);

  return { articulation, fluency, communication, scenario, overall };
}

/**
 * Break down scores by practice type.
 */
export function computeByType(
  scores: PracticeScore[]
): Record<PracticeType, { avg: number; count: number }> {
  const types: PracticeType[] = ['conversation', 'reading', 'writing', 'listening'];
  const result = {} as Record<PracticeType, { avg: number; count: number }>;

  for (const type of types) {
    const typeScores = scores.filter(s => s.type === type);
    if (typeScores.length === 0) {
      result[type] = { avg: 0, count: 0 };
    } else {
      const avg = Math.round(
        typeScores.reduce((sum, s) => sum + s.overallScore, 0) / typeScores.length
      );
      result[type] = { avg, count: typeScores.length };
    }
  }

  return result;
}

// =============================================================================
// Full Snapshot
// =============================================================================

/**
 * Get the complete competency snapshot for the dashboard.
 * Single call that assembles all data.
 */
export async function getCompetencySnapshot(userId: string): Promise<CompetencySnapshot> {
  const [allScores, trends] = await Promise.all([
    getAllScores(userId),
    getScoreTrends(userId),
  ]);

  const averages = computeAverages(allScores);
  const cefrLevel = mapScoreToCEFR(averages.overall);
  const cefrProgress = getCEFRProgress(averages.overall);
  const byType = computeByType(allScores);

  return {
    averages,
    trends,
    cefrLevel,
    cefrProgress,
    totalSessions: allScores.length,
    recentScores: allScores.slice(0, 20),
    byType,
  };
}
