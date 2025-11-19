-- =========================================
-- VOX LANGUAGE APP - SUPABASE DATABASE SCHEMA
-- =========================================
-- This schema defines all tables for the Supabase PostgreSQL database
-- Run this SQL in your Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- USER PROFILES TABLE
-- =========================================
-- Extends Supabase auth.users with additional profile data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  target_language TEXT NOT NULL CHECK (target_language IN ('english', 'french', 'spanish')),
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  interests TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =========================================
-- LESSONS TABLE
-- =========================================
-- Core lesson content created by admins
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('verbs', 'objects', 'food', 'travel', 'conversation', 'grammar', 'other')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  target_language TEXT NOT NULL CHECK (target_language IN ('english', 'french', 'spanish')),
  sequence INTEGER NOT NULL, -- Order in curriculum
  content JSONB NOT NULL, -- Flexible content structure
  thumbnail_url TEXT,
  estimated_time INTEGER, -- Minutes
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_category ON lessons(category);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX idx_lessons_target_language ON lessons(target_language);

-- RLS for lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published lessons are viewable by all authenticated users"
  ON lessons FOR SELECT
  USING (is_published = TRUE AND auth.role() = 'authenticated');

-- =========================================
-- FLASHCARDS TABLE
-- =========================================
-- Individual flashcards linked to lessons
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL, -- Word or phrase in target language
  back_text TEXT NOT NULL, -- Translation or definition
  image_url TEXT,
  audio_url TEXT,
  phonetics TEXT, -- IPA phonetic transcription
  examples TEXT[], -- Example sentences
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flashcards_lesson_id ON flashcards(lesson_id);
CREATE INDEX idx_flashcards_category ON flashcards(category);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flashcards are viewable by all authenticated users"
  ON flashcards FOR SELECT
  USING (auth.role() = 'authenticated');

-- =========================================
-- USER PROGRESS TABLE
-- =========================================
-- Track user completion of lessons and points earned
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  streak_count INTEGER DEFAULT 0,
  last_practice_date DATE,
  total_practice_time INTEGER DEFAULT 0, -- Seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_completed ON user_progress(completed);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- =========================================
-- FLASHCARD REVIEWS TABLE (Spaced Repetition)
-- =========================================
-- Stores spaced repetition data using SM-2 algorithm
CREATE TABLE flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  ease_factor DECIMAL DEFAULT 2.5 CHECK (ease_factor >= 1.3),
  interval INTEGER DEFAULT 0 CHECK (interval >= 0), -- Days until next review
  repetitions INTEGER DEFAULT 0 CHECK (repetitions >= 0), -- Consecutive correct answers
  next_review TIMESTAMP WITH TIME ZONE NOT NULL,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);

CREATE INDEX idx_flashcard_reviews_user_id ON flashcard_reviews(user_id);
CREATE INDEX idx_flashcard_reviews_next_review ON flashcard_reviews(next_review);

ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own flashcard reviews"
  ON flashcard_reviews FOR ALL
  USING (auth.uid() = user_id);

-- =========================================
-- USER STORIES TABLE
-- =========================================
-- AI-generated or user-created stories for reading practice
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  target_language TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  vocabulary_words TEXT[], -- Words to highlight
  read_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_is_public ON stories(is_public);
CREATE INDEX idx_stories_difficulty ON stories(difficulty);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public stories"
  ON stories FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own stories"
  ON stories FOR ALL
  USING (auth.uid() = user_id);

-- =========================================
-- AUDIO RECORDINGS TABLE
-- =========================================
-- User practice recordings
CREATE TABLE audio_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL, -- Stored in Supabase Storage
  duration INTEGER, -- Seconds
  is_public BOOLEAN DEFAULT FALSE,
  transcription TEXT, -- AI-generated transcription
  feedback JSONB, -- AI feedback on pronunciation, fluency, etc.
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audio_recordings_user_id ON audio_recordings(user_id);
CREATE INDEX idx_audio_recordings_is_public ON audio_recordings(is_public);

ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public recordings"
  ON audio_recordings FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own recordings"
  ON audio_recordings FOR ALL
  USING (auth.uid() = user_id);

-- =========================================
-- LEADERBOARD TABLE
-- =========================================
-- Track user rankings based on practice attempts (not perfection)
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  total_practice_sessions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  rank INTEGER,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period, period_start)
);

CREATE INDEX idx_leaderboard_period ON leaderboard(period, period_start);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is viewable by all authenticated users"
  ON leaderboard FOR SELECT
  USING (auth.role() = 'authenticated');

-- =========================================
-- COMMUNITY FEEDBACK TABLE
-- =========================================
-- Users can give feedback on recordings
CREATE TABLE community_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recording_id UUID REFERENCES audio_recordings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_helpful BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_community_feedback_recording_id ON community_feedback(recording_id);

ALTER TABLE community_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback on public recordings"
  ON community_feedback FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create feedback"
  ON community_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =========================================
-- FUNCTIONS AND TRIGGERS
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_reviews_updated_at BEFORE UPDATE ON flashcard_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS void AS $$
BEGIN
  -- Update weekly leaderboard
  INSERT INTO leaderboard (user_id, username, total_points, total_practice_sessions, current_streak, longest_streak, period, period_start, period_end, rank)
  SELECT
    p.id,
    p.username,
    COALESCE(SUM(up.points), 0) as total_points,
    COUNT(DISTINCT up.id) as total_practice_sessions,
    MAX(up.streak_count) as current_streak,
    MAX(up.streak_count) as longest_streak,
    'weekly'::text,
    date_trunc('week', CURRENT_DATE)::date,
    (date_trunc('week', CURRENT_DATE) + interval '6 days')::date,
    ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT up.id) DESC, SUM(up.points) DESC)::integer
  FROM profiles p
  LEFT JOIN user_progress up ON p.id = up.user_id
    AND up.updated_at >= date_trunc('week', CURRENT_DATE)
  GROUP BY p.id, p.username
  ON CONFLICT (user_id, period, period_start)
  DO UPDATE SET
    total_points = EXCLUDED.total_points,
    total_practice_sessions = EXCLUDED.total_practice_sessions,
    current_streak = EXCLUDED.current_streak,
    rank = EXCLUDED.rank,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- STORAGE BUCKETS
-- =========================================
-- Run these in Supabase Storage section:

-- 1. Create 'avatars' bucket (public)
-- 2. Create 'lesson-media' bucket (public) - for images and audio in lessons
-- 3. Create 'user-recordings' bucket (public for shared, private for personal)
-- 4. Create 'story-media' bucket (public)

-- =========================================
-- SEED DATA (Optional - for testing)
-- =========================================

-- Insert sample lesson categories
INSERT INTO lessons (title, description, category, difficulty, target_language, sequence, content, is_published)
VALUES
  ('Common Greetings', 'Learn basic greetings in everyday situations', 'conversation', 'easy', 'english', 1, '{"type": "vocabulary", "words": ["hello", "goodbye", "please", "thank you"]}', true),
  ('Food Vocabulary', 'Essential food and dining vocabulary', 'food', 'easy', 'english', 2, '{"type": "vocabulary", "words": ["apple", "bread", "water", "restaurant"]}', true),
  ('Travel Essentials', 'Useful phrases for travelers', 'travel', 'medium', 'english', 3, '{"type": "phrases", "content": ["Where is...?", "How much...?", "I would like..."]}', true);

-- Note: Remember to set up RLS policies for storage buckets in Supabase dashboard
