-- FSRS (Free Spaced Repetition Scheduler) Schema
-- Adds FSRS columns to support Anki-grade spaced repetition.
-- Coexists with SM-2 — existing cards migrate on next review.

-- Flashcard progress: add FSRS columns
ALTER TABLE user_flashcard_progress
  ADD COLUMN IF NOT EXISTS algorithm TEXT NOT NULL DEFAULT 'fsrs',
  ADD COLUMN IF NOT EXISTS fsrs_stability REAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fsrs_difficulty REAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fsrs_elapsed_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fsrs_scheduled_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fsrs_reps INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fsrs_lapses INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fsrs_state INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fsrs_last_review TIMESTAMPTZ;

-- Mark existing reviewed cards as SM-2 for migration tracking
UPDATE user_flashcard_progress
  SET algorithm = 'sm2'
  WHERE repetitions > 0 AND algorithm = 'fsrs';

-- Index for FSRS state queries (find cards in learning/relearning)
CREATE INDEX IF NOT EXISTS idx_progress_fsrs_state
  ON user_flashcard_progress(fsrs_state);

-- Index for algorithm filtering
CREATE INDEX IF NOT EXISTS idx_progress_algorithm
  ON user_flashcard_progress(algorithm);
