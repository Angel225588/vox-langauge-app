/**
 * Reading System React Hooks
 *
 * Custom hooks for interacting with the Reading/Teleprompter system.
 * Provides reactive state management with loading/error handling.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReadingSession,
  CreateSessionInput,
  UpdateSessionInput,
  SessionFilter,
  ReadingStats,
  ProblemWord,
  ReadingFeedback,
  SourceType,
  ReadingDifficulty,
} from './types';
import * as storage from './storage';

// ============================================================================
// SINGLE SESSION HOOK
// ============================================================================

export interface UseReadingSessionReturn {
  /** The session data */
  session: ReadingSession | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Update the session */
  update: (input: UpdateSessionInput) => Promise<void>;
  /** Delete the session */
  delete: (permanent?: boolean) => Promise<boolean>;
  /** Add a problem word */
  addProblemWord: (problemWord: ProblemWord) => Promise<void>;
  /** Update scores */
  updateScores: (scores: {
    articulationScore: number;
    fluencyScore: number;
    wordsSpoken?: number;
  }) => Promise<void>;
  /** Update feedback */
  updateFeedback: (feedback: ReadingFeedback) => Promise<void>;
  /** Refresh session data */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing a single reading session
 *
 * @example
 * ```tsx
 * const { session, loading, update, addProblemWord } = useReadingSession(sessionId);
 *
 * const handleScoreUpdate = async () => {
 *   await updateScores({
 *     articulationScore: 85,
 *     fluencyScore: 90,
 *   });
 * };
 * ```
 */
export function useReadingSession(
  sessionId: string | null
): UseReadingSessionReturn {
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedSession = await storage.getSession(sessionId);
      setSession(fetchedSession);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch session'));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const update = useCallback(
    async (input: UpdateSessionInput) => {
      if (!sessionId) return;
      const updated = await storage.updateSession(sessionId, input);
      if (updated) {
        setSession(updated);
      }
    },
    [sessionId]
  );

  const deleteSession = useCallback(
    async (permanent: boolean = false): Promise<boolean> => {
      if (!sessionId) return false;
      const success = await storage.deleteSession(sessionId, permanent);
      if (success && !permanent) {
        // Refresh to show updated state
        await fetchSession();
      }
      return success;
    },
    [sessionId, fetchSession]
  );

  const addProblemWord = useCallback(
    async (problemWord: ProblemWord) => {
      if (!sessionId) return;
      const updated = await storage.addProblemWordToSession(sessionId, problemWord);
      if (updated) {
        setSession(updated);
      }
    },
    [sessionId]
  );

  const updateScores = useCallback(
    async (scores: {
      articulationScore: number;
      fluencyScore: number;
      wordsSpoken?: number;
    }) => {
      if (!sessionId) return;
      const updated = await storage.updateSessionScores(sessionId, scores);
      if (updated) {
        setSession(updated);
      }
    },
    [sessionId]
  );

  const updateFeedback = useCallback(
    async (feedback: ReadingFeedback) => {
      if (!sessionId) return;
      const updated = await storage.updateSessionFeedback(sessionId, feedback);
      if (updated) {
        setSession(updated);
      }
    },
    [sessionId]
  );

  return {
    session,
    loading,
    error,
    update,
    delete: deleteSession,
    addProblemWord,
    updateScores,
    updateFeedback,
    refresh: fetchSession,
  };
}

// ============================================================================
// SESSIONS LIST HOOK
// ============================================================================

export interface UseReadingSessionsOptions {
  /** Initial filter to apply */
  filter?: SessionFilter;
  /** Auto-refresh interval in ms (0 = disabled) */
  autoRefreshInterval?: number;
}

export interface UseReadingSessionsReturn {
  /** All sessions matching the current filter */
  sessions: ReadingSession[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Create a new session */
  createSession: (input: CreateSessionInput) => Promise<ReadingSession>;
  /** Delete a session */
  deleteSession: (id: string, permanent?: boolean) => Promise<boolean>;
  /** Refresh the session list */
  refreshSessions: () => Promise<void>;
  /** Update the filter */
  setFilter: (filter: SessionFilter) => void;
  /** Current filter */
  filter: SessionFilter;
}

/**
 * Hook for managing multiple reading sessions
 *
 * @example
 * ```tsx
 * const {
 *   sessions,
 *   loading,
 *   createSession,
 *   setFilter
 * } = useReadingSessions({ filter: { userId: 'user_123' } });
 *
 * const handleCreate = async () => {
 *   await createSession({
 *     userId: 'user_123',
 *     sourceType: 'ai_story',
 *     text: 'Once upon a time...',
 *     difficulty: 'intermediate',
 *   });
 * };
 * ```
 */
export function useReadingSessions(
  options: UseReadingSessionsOptions = {}
): UseReadingSessionsReturn {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<SessionFilter>(options.filter || {});

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSessions = await storage.getSessions(filter);
      setSessions(fetchedSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Auto-refresh
  useEffect(() => {
    if (options.autoRefreshInterval && options.autoRefreshInterval > 0) {
      const interval = setInterval(fetchSessions, options.autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSessions, options.autoRefreshInterval]);

  const createSession = useCallback(
    async (input: CreateSessionInput): Promise<ReadingSession> => {
      const newSession = await storage.createSession(input);
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    },
    []
  );

  const deleteSession = useCallback(
    async (id: string, permanent: boolean = false): Promise<boolean> => {
      const success = await storage.deleteSession(id, permanent);
      if (success) {
        if (permanent) {
          // Remove from list
          setSessions((prev) => prev.filter((s) => s.id !== id));
        } else {
          // Refresh to show updated state
          await fetchSessions();
        }
      }
      return success;
    },
    [fetchSessions]
  );

  return {
    sessions,
    loading,
    error,
    createSession,
    deleteSession,
    refreshSessions: fetchSessions,
    setFilter,
    filter,
  };
}

// ============================================================================
// ACTIVE SESSION HOOK (for recording)
// ============================================================================

export interface UseActiveSessionReturn {
  /** Current active session */
  activeSession: ReadingSession | null;
  /** Whether recording is in progress */
  isRecording: boolean;
  /** Start a new recording session */
  startSession: (input: CreateSessionInput) => Promise<ReadingSession>;
  /** Stop recording and save */
  stopRecording: (recordingUri: string, durationMs: number) => Promise<void>;
  /** Cancel current session */
  cancelSession: () => Promise<void>;
  /** Update active session */
  updateSession: (input: UpdateSessionInput) => Promise<void>;
}

/**
 * Hook for managing the active recording session
 *
 * @example
 * ```tsx
 * const {
 *   activeSession,
 *   isRecording,
 *   startSession,
 *   stopRecording
 * } = useActiveSession();
 *
 * const handleStart = async () => {
 *   await startSession({
 *     userId: 'user_123',
 *     sourceType: 'ai_story',
 *     text: passageText,
 *     difficulty: 'intermediate',
 *   });
 * };
 * ```
 */
export function useActiveSession(): UseActiveSessionReturn {
  const [activeSession, setActiveSession] = useState<ReadingSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startSession = useCallback(
    async (input: CreateSessionInput): Promise<ReadingSession> => {
      const session = await storage.createSession(input);
      setActiveSession(session);
      setIsRecording(true);
      return session;
    },
    []
  );

  const stopRecording = useCallback(
    async (recordingUri: string, durationMs: number) => {
      if (!activeSession) return;

      const updated = await storage.updateSession(activeSession.id, {
        recordingUri,
        recordingDurationMs: durationMs,
      });

      if (updated) {
        setActiveSession(updated);
      }
      setIsRecording(false);
    },
    [activeSession]
  );

  const cancelSession = useCallback(async () => {
    if (!activeSession) return;

    // Soft delete the session
    await storage.deleteSession(activeSession.id, false);
    setActiveSession(null);
    setIsRecording(false);
  }, [activeSession]);

  const updateSession = useCallback(
    async (input: UpdateSessionInput) => {
      if (!activeSession) return;

      const updated = await storage.updateSession(activeSession.id, input);
      if (updated) {
        setActiveSession(updated);
      }
    },
    [activeSession]
  );

  return {
    activeSession,
    isRecording,
    startSession,
    stopRecording,
    cancelSession,
    updateSession,
  };
}

// ============================================================================
// SESSION STATS HOOK
// ============================================================================

export interface UseSessionStatsReturn {
  /** Aggregate statistics */
  stats: ReadingStats | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh stats */
  refresh: () => Promise<void>;
}

/**
 * Hook for reading session statistics
 *
 * @example
 * ```tsx
 * const { stats, loading } = useSessionStats('user_123');
 *
 * if (loading) return <Loading />;
 *
 * return (
 *   <View>
 *     <Text>Total Sessions: {stats?.totalSessions}</Text>
 *     <Text>Average Score: {stats?.averageScore}%</Text>
 *   </View>
 * );
 * ```
 */
export function useSessionStats(userId: string | null): UseSessionStatsReturn {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedStats = await storage.getReadingStats(userId);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

// ============================================================================
// RECENT SESSIONS HOOK
// ============================================================================

export interface UseRecentSessionsOptions {
  /** User ID */
  userId: string;
  /** Number of sessions to fetch */
  limit?: number;
}

export interface UseRecentSessionsReturn {
  /** Recent sessions */
  recentSessions: ReadingSession[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching recent sessions
 *
 * @example
 * ```tsx
 * const { recentSessions, loading } = useRecentSessions({
 *   userId: 'user_123',
 *   limit: 5
 * });
 * ```
 */
export function useRecentSessions(
  options: UseRecentSessionsOptions
): UseRecentSessionsReturn {
  const { userId, limit = 10 } = options;
  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sessions = await storage.getRecentSessions(userId, limit);
      setRecentSessions(sessions);
    } catch (err) {
      console.error('Error fetching recent sessions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch recent sessions'));
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return {
    recentSessions,
    loading,
    error,
    refresh: fetchRecent,
  };
}

// ============================================================================
// SESSIONS BY SOURCE HOOK
// ============================================================================

export interface UseSessionsBySourceOptions {
  /** User ID */
  userId: string;
  /** Source type */
  sourceType: SourceType;
  /** Limit */
  limit?: number;
}

export interface UseSessionsBySourceReturn {
  /** Sessions from source */
  sessions: ReadingSession[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching sessions by source type
 *
 * @example
 * ```tsx
 * const { sessions } = useSessionsBySource({
 *   userId: 'user_123',
 *   sourceType: 'ai_story'
 * });
 * ```
 */
export function useSessionsBySource(
  options: UseSessionsBySourceOptions
): UseSessionsBySourceReturn {
  const { userId, sourceType, limit } = options;
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSessions = await storage.getSessionsBySourceType(
        userId,
        sourceType,
        limit
      );
      setSessions(fetchedSessions);
    } catch (err) {
      console.error('Error fetching sessions by source:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch sessions by source')
      );
    } finally {
      setLoading(false);
    }
  }, [userId, sourceType, limit]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
  };
}

// ============================================================================
// SESSIONS BY DIFFICULTY HOOK
// ============================================================================

export interface UseSessionsByDifficultyOptions {
  /** User ID */
  userId: string;
  /** Difficulty level */
  difficulty: ReadingDifficulty;
  /** Limit */
  limit?: number;
}

export interface UseSessionsByDifficultyReturn {
  /** Sessions at difficulty */
  sessions: ReadingSession[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching sessions by difficulty
 *
 * @example
 * ```tsx
 * const { sessions } = useSessionsByDifficulty({
 *   userId: 'user_123',
 *   difficulty: 'intermediate'
 * });
 * ```
 */
export function useSessionsByDifficulty(
  options: UseSessionsByDifficultyOptions
): UseSessionsByDifficultyReturn {
  const { userId, difficulty, limit } = options;
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSessions = await storage.getSessionsByDifficulty(
        userId,
        difficulty,
        limit
      );
      setSessions(fetchedSessions);
    } catch (err) {
      console.error('Error fetching sessions by difficulty:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch sessions by difficulty')
      );
    } finally {
      setLoading(false);
    }
  }, [userId, difficulty, limit]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
  };
}
