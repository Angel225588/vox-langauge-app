// ============================================================================
// VOX LIBRARY TYPES
// ============================================================================

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ContextType =
  | 'business'
  | 'social'
  | 'daily_life'
  | 'travel'
  | 'professional'
  | 'emergency';

export type VocabCategory = 'universal' | 'field-specific' | 'survival';

export type VocabRelevance = 'core' | 'supporting' | 'advanced';

export type GrammarCategory =
  | 'tense'
  | 'mood'
  | 'syntax'
  | 'morphology'
  | 'punctuation';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrase'
  | 'other';

export type Difficulty = 'easy' | 'medium' | 'hard';

// --- Scenario ---

export interface VoxScenario {
  id: string;
  slug: string;
  title: string;
  description: string;
  profession_tags: string[];
  context_type: ContextType;
  cefr_levels: CEFRLevel[];
  language_pairs: string[];
  key_phrases: ScenarioPhrase[];
  ai_persona: AiPersona | null;
  objectives: string[];
  estimated_minutes: number;
  prerequisite_scenario_ids: string[];
  related_scenario_ids: string[];
  difficulty_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScenarioPhrase {
  phrase: string;
  translation: string;
  language_pair: string;
  when_to_use: string;
}

export interface AiPersona {
  role: string;
  personality: string;
  background: string;
  speaking_style: string;
}

// --- Vocabulary ---

export interface VoxVocabulary {
  id: string;
  word: string;
  translation: string;
  pronunciation: string | null;
  native_approximation: string | null;
  audio_url: string | null;
  language_pair: string;
  target_language: string;
  native_language: string;
  part_of_speech: PartOfSpeech;
  cefr_level: CEFRLevel;
  difficulty: Difficulty;
  category: VocabCategory;
  profession_tags: string[];
  topic_tags: string[];
  example_sentence: string | null;
  example_translation: string | null;
  usage_notes: string | null;
  memory_tip: string | null;
  frequency_rank: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Grammar ---

export interface VoxGrammarPoint {
  id: string;
  slug: string;
  title: string;
  explanation: string;
  target_language: string;
  cefr_level: CEFRLevel;
  grammar_category: GrammarCategory;
  examples: GrammarExample[];
  common_mistakes: GrammarMistake[];
  scenario_tags: string[];
  prerequisite_grammar_ids: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GrammarExample {
  example: string;
  translation: string;
  breakdown: string;
}

export interface GrammarMistake {
  mistake: string;
  correction: string;
  explanation: string;
}

// --- Junction types (with expanded relations) ---

export interface ScenarioWithContent extends VoxScenario {
  vocabulary: VoxVocabularyTagged[];
  grammar_points: VoxGrammarPointTagged[];
}

export interface VoxVocabularyTagged extends VoxVocabulary {
  relevance: VocabRelevance;
  sort_order: number;
}

export interface VoxGrammarPointTagged extends VoxGrammarPoint {
  relevance: 'core' | 'supporting';
  sort_order: number;
}

// --- Query types ---

export interface VoxLibraryQuery {
  profession: string;
  scenarios: string[];
  cefr_level: CEFRLevel;
  language_pair: string;
  target_language: string;
  native_language: string;
}

export interface VoxLibraryResult {
  scenarios: ScenarioWithContent[];
  additional_vocabulary: VoxVocabulary[];
  additional_grammar: VoxGrammarPoint[];
  total_vocab_count: number;
  total_scenario_count: number;
}

// --- User Vox Categories ---

export interface UserVoxCategory {
  id: string;
  user_id: string;
  category_slug: string;
  category_label: string;
  priority: number;
  is_active: boolean;
  added_at: string;
}

export interface AddToVoxRequest {
  category_slug: string;
  category_label: string;
}

// --- Category browsing ---

export interface CategoryInfo {
  category: string;
  scenario_count: number;
  vocab_count: number;
}
