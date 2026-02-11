/**
 * Vox Library query service.
 *
 * Provides functions to query the curated content database (scenarios,
 * vocabulary, grammar) and manage user category preferences ("Add to my Vox").
 */

import { supabase } from '@/lib/db/supabase';
import type {
  CEFRLevel,
  VoxLibraryQuery,
  VoxLibraryResult,
  ScenarioWithContent,
  VoxVocabulary,
  VoxVocabularyTagged,
  VoxGrammarPoint,
  VoxGrammarPointTagged,
  UserVoxCategory,
  CategoryInfo,
} from '@/types/voxLibrary';

// ============================================================================
// HELPERS
// ============================================================================

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Returns the CEFR level one step below the given level.
 * Returns the same level if already at A1.
 */
function getPreviousCEFR(level: CEFRLevel): CEFRLevel {
  const idx = CEFR_ORDER.indexOf(level);
  return idx > 0 ? CEFR_ORDER[idx - 1] : level;
}

/**
 * Transform raw Supabase joined scenario rows into ScenarioWithContent[].
 * Supabase returns nested junction data that needs to be flattened.
 */
function transformScenarios(raw: any[] | null): ScenarioWithContent[] {
  if (!raw) return [];

  return raw.map((row) => {
    // Extract vocabulary from nested junction
    const vocabulary: VoxVocabularyTagged[] = (
      row.vox_scenario_vocabulary ?? []
    ).map((sv: any) => ({
      ...sv.vox_vocabulary,
      relevance: sv.relevance,
      sort_order: sv.sort_order,
    }));

    // Extract grammar from nested junction
    const grammar_points: VoxGrammarPointTagged[] = (
      row.vox_scenario_grammar ?? []
    ).map((sg: any) => ({
      ...sg.vox_grammar_points,
      relevance: sg.relevance,
      sort_order: sg.sort_order,
    }));

    // Remove nested junction keys from the scenario row
    const {
      vox_scenario_vocabulary: _sv,
      vox_scenario_grammar: _sg,
      ...scenario
    } = row;

    return {
      ...scenario,
      vocabulary: vocabulary.sort((a, b) => a.sort_order - b.sort_order),
      grammar_points: grammar_points.sort((a, b) => a.sort_order - b.sort_order),
    } as ScenarioWithContent;
  });
}

/**
 * Count unique vocabulary items across scenarios and additional vocab.
 */
function countUniqueVocab(
  scenarios: ScenarioWithContent[],
  extraVocab: VoxVocabulary[] | null
): number {
  const ids = new Set<string>();
  for (const s of scenarios) {
    for (const v of s.vocabulary) {
      ids.add(v.id);
    }
  }
  if (extraVocab) {
    for (const v of extraVocab) {
      ids.add(v.id);
    }
  }
  return ids.size;
}

// ============================================================================
// MAIN QUERY
// ============================================================================

/**
 * Query the Vox Library for scenarios, vocabulary, and grammar matching the
 * user's onboarding selections.
 *
 * Returns scenarios with embedded vocabulary and grammar, plus additional
 * profession-relevant vocabulary and grammar for the user's CEFR level.
 */
export async function queryVoxLibrary(
  query: VoxLibraryQuery
): Promise<VoxLibraryResult> {
  // 1. Fetch scenarios with embedded vocabulary and grammar via joins
  const { data: rawScenarios, error: scenarioError } = await supabase
    .from('vox_scenarios')
    .select(
      `
      *,
      vox_scenario_vocabulary(
        relevance,
        sort_order,
        vox_vocabulary(*)
      ),
      vox_scenario_grammar(
        relevance,
        sort_order,
        vox_grammar_points(*)
      )
    `
    )
    .in('slug', query.scenarios)
    .contains('language_pairs', [query.language_pair])
    .contains('cefr_levels', [query.cefr_level])
    .eq('is_active', true);

  if (scenarioError) {
    throw new Error(`Failed to query Vox Library scenarios: ${scenarioError.message}`);
  }

  const scenarios = transformScenarios(rawScenarios);

  // Collect vocabulary IDs already present in selected scenarios
  const scenarioVocabIds = new Set<string>();
  for (const s of scenarios) {
    for (const v of s.vocabulary) {
      scenarioVocabIds.add(v.id);
    }
  }

  // 2. Fetch additional profession vocabulary not already in selected scenarios
  const previousLevel = getPreviousCEFR(query.cefr_level);
  const cefrFilter =
    previousLevel === query.cefr_level
      ? [query.cefr_level]
      : [query.cefr_level, previousLevel];

  const { data: extraVocab, error: vocabError } = await supabase
    .from('vox_vocabulary')
    .select('*')
    .eq('language_pair', query.language_pair)
    .in('cefr_level', cefrFilter)
    .contains('profession_tags', [query.profession])
    .eq('is_active', true)
    .order('frequency_rank', { ascending: true, nullsFirst: false })
    .limit(50);

  if (vocabError) {
    throw new Error(`Failed to query additional vocabulary: ${vocabError.message}`);
  }

  // Filter out vocabulary already included in scenarios
  const additionalVocabulary = (extraVocab ?? []).filter(
    (v) => !scenarioVocabIds.has(v.id)
  );

  // 3. Fetch additional grammar for the level
  const { data: extraGrammar, error: grammarError } = await supabase
    .from('vox_grammar_points')
    .select('*')
    .eq('target_language', query.target_language)
    .in('cefr_level', cefrFilter)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (grammarError) {
    throw new Error(`Failed to query additional grammar: ${grammarError.message}`);
  }

  return {
    scenarios,
    additional_vocabulary: additionalVocabulary,
    additional_grammar: (extraGrammar ?? []) as VoxGrammarPoint[],
    total_vocab_count: countUniqueVocab(scenarios, additionalVocabulary),
    total_scenario_count: scenarios.length,
  };
}

// ============================================================================
// CATEGORY BROWSING
// ============================================================================

/**
 * Get available content categories from the Vox Library for a given language
 * pair and optional CEFR level. Used for the "Browse Library" / category
 * picker UI.
 */
export async function getAvailableCategories(
  languagePair: string,
  cefrLevel?: string
): Promise<CategoryInfo[]> {
  // Get distinct context_types from scenarios matching the language pair
  let scenarioQuery = supabase
    .from('vox_scenarios')
    .select('context_type, slug')
    .contains('language_pairs', [languagePair])
    .eq('is_active', true);

  if (cefrLevel) {
    scenarioQuery = scenarioQuery.contains('cefr_levels', [cefrLevel]);
  }

  const { data: scenarioRows, error: scenarioError } = await scenarioQuery;

  if (scenarioError) {
    throw new Error(`Failed to query categories: ${scenarioError.message}`);
  }

  // Get vocab counts per category for the language pair
  let vocabQuery = supabase
    .from('vox_vocabulary')
    .select('category')
    .eq('language_pair', languagePair)
    .eq('is_active', true);

  if (cefrLevel) {
    vocabQuery = vocabQuery.eq('cefr_level', cefrLevel);
  }

  const { data: vocabRows, error: vocabError } = await vocabQuery;

  if (vocabError) {
    throw new Error(`Failed to query vocab categories: ${vocabError.message}`);
  }

  // Aggregate scenario counts by context_type
  const scenarioCounts = new Map<string, number>();
  for (const row of scenarioRows ?? []) {
    const ct = row.context_type;
    scenarioCounts.set(ct, (scenarioCounts.get(ct) ?? 0) + 1);
  }

  // Aggregate vocab counts by category
  const vocabCounts = new Map<string, number>();
  for (const row of vocabRows ?? []) {
    const cat = row.category;
    vocabCounts.set(cat, (vocabCounts.get(cat) ?? 0) + 1);
  }

  // Merge all unique category keys
  const allCategories = new Set([
    ...scenarioCounts.keys(),
    ...vocabCounts.keys(),
  ]);

  return Array.from(allCategories).map((category) => ({
    category,
    scenario_count: scenarioCounts.get(category) ?? 0,
    vocab_count: vocabCounts.get(category) ?? 0,
  }));
}

// ============================================================================
// USER VOX CATEGORIES ("Add to my Vox")
// ============================================================================

/**
 * Add a content category to the user's personal Vox collection.
 */
export async function addCategoryToUserVox(
  userId: string,
  categorySlug: string,
  categoryLabel: string
): Promise<void> {
  const { error } = await supabase.from('user_vox_categories').upsert(
    {
      user_id: userId,
      category_slug: categorySlug,
      category_label: categoryLabel,
    },
    { onConflict: 'user_id,category_slug' }
  );

  if (error) {
    throw new Error(`Failed to add category to user Vox: ${error.message}`);
  }
}

/**
 * Get all content categories the user has added to their Vox collection.
 */
export async function getUserVoxCategories(
  userId: string
): Promise<UserVoxCategory[]> {
  const { data, error } = await supabase
    .from('user_vox_categories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user Vox categories: ${error.message}`);
  }

  return (data ?? []) as UserVoxCategory[];
}

/**
 * Remove a category from the user's personal Vox collection.
 * Performs a hard delete rather than soft-delete.
 */
export async function removeFromUserVox(
  userId: string,
  categorySlug: string
): Promise<void> {
  const { error } = await supabase
    .from('user_vox_categories')
    .delete()
    .eq('user_id', userId)
    .eq('category_slug', categorySlug);

  if (error) {
    throw new Error(`Failed to remove category from user Vox: ${error.message}`);
  }
}
