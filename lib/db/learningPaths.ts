/**
 * Supabase database operations for learning paths in Vox Language App.
 *
 * This module handles all database interactions for:
 * - Creating and managing learning paths
 * - Creating sections and stairs
 * - Retrieving user learning paths with nested data
 * - Updating stair status for progress tracking
 */

import { supabase } from '@/lib/db/supabase';
import {
  LearningPath,
  Section,
  Stair,
  LearningPathInsert,
  SectionInsert,
  StairInsert
} from '@/lib/db/schemas/learning';
import { GeneratedStair } from '@/types/learning';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Learning path with nested sections and stairs for display.
 */
export interface LearningPathWithStairs {
  id: string;
  title: string;
  description: string;
  sections: SectionWithStairs[];
  created_at: string;
}

/**
 * Section with its stairs for nested display.
 */
export interface SectionWithStairs {
  id: string;
  title: string;
  stairs: StairRecord[];
}

/**
 * Stair record from database query.
 */
export interface StairRecord {
  id: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  status: 'locked' | 'current' | 'completed';
  vocabulary_count: number;
  estimated_days: number;
  skills_required: string[];
  skills_unlocked: string[];
  created_at: string;
  completed_at?: string;
}

/**
 * Formatted stair for home screen display (matching MOCK_STAIRS structure).
 */
export interface StairForDisplay {
  id: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  status: 'locked' | 'current' | 'completed';
  vocabulary_count: number;
  estimated_days: number;
}

// ============================================================================
// LEARNING PATH OPERATIONS
// ============================================================================

/**
 * Create a new learning path for a user.
 *
 * @param userId - The user's UUID
 * @param pathData - Learning path data from onboarding
 * @returns The created path's ID, or null on error
 */
export async function createLearningPath(
  userId: string,
  pathData: {
    title: string;
    description: string;
    target_language: string;
    native_language: string;
    motivation: string;
    proficiency_level: string;
    timeline: string;
  }
): Promise<{ id: string } | null> {
  try {
    const insertData: LearningPathInsert = {
      user_id: userId,
      target_language: pathData.target_language,
      native_language: pathData.native_language,
      motivation: pathData.motivation,
      proficiency_level: pathData.proficiency_level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
      timeline: pathData.timeline,
      path_title: pathData.title,
      path_description: pathData.description,
      total_sections: 0,
      current_section: 1,
    };

    const { data, error } = await supabase
      .from('learning_paths')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating learning path:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception creating learning path:', error);
    return null;
  }
}

/**
 * Get the user's learning path with all sections and stairs.
 *
 * @param userId - The user's UUID
 * @returns Complete learning path with nested data, or null if not found
 */
export async function getUserLearningPath(userId: string): Promise<LearningPathWithStairs | null> {
  try {
    // Fetch learning path
    const { data: path, error: pathError } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (pathError || !path) {
      console.error('Error fetching learning path:', pathError);
      return null;
    }

    // Fetch sections for this path
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('*')
      .eq('path_id', path.id)
      .order('section_number', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return null;
    }

    // Fetch stairs for all sections
    const sectionIds = sections?.map(s => s.id) || [];
    const { data: stairs, error: stairsError } = await supabase
      .from('stairs')
      .select('*')
      .in('section_id', sectionIds)
      .order('order', { ascending: true });

    if (stairsError) {
      console.error('Error fetching stairs:', stairsError);
      return null;
    }

    // Group stairs by section
    const stairsBySection = (stairs || []).reduce((acc, stair) => {
      if (!acc[stair.section_id]) {
        acc[stair.section_id] = [];
      }
      acc[stair.section_id].push(stair);
      return acc;
    }, {} as Record<string, any[]>);

    // Build nested structure
    const sectionsWithStairs: SectionWithStairs[] = (sections || []).map(section => ({
      id: section.id,
      title: section.title,
      stairs: (stairsBySection[section.id] || []).map(stair => ({
        id: stair.id,
        order: stair.order,
        title: stair.title,
        emoji: stair.emoji,
        description: stair.description,
        status: stair.status,
        vocabulary_count: stair.vocabulary_count,
        estimated_days: stair.estimated_days,
        skills_required: stair.skills_required || [],
        skills_unlocked: stair.skills_unlocked || [],
        created_at: stair.created_at,
        completed_at: stair.completed_at,
      })),
    }));

    return {
      id: path.id,
      title: path.path_title,
      description: path.path_description,
      sections: sectionsWithStairs,
      created_at: path.created_at,
    };
  } catch (error) {
    console.error('Exception fetching user learning path:', error);
    return null;
  }
}

// ============================================================================
// SECTION OPERATIONS
// ============================================================================

/**
 * Create a new section within a learning path.
 *
 * @param pathId - The learning path's UUID
 * @param sectionData - Section data including order, title, and description
 * @returns The created section's ID, or null on error
 */
export async function createSection(
  pathId: string,
  sectionData: {
    order: number;
    title: string;
    description: string;
  }
): Promise<{ id: string } | null> {
  try {
    const insertData: SectionInsert = {
      path_id: pathId,
      section_number: sectionData.order,
      title: sectionData.title,
      description: sectionData.description,
      status: sectionData.order === 1 ? 'active' : 'locked',
      stairs_count: 0,
    };

    const { data, error } = await supabase
      .from('sections')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating section:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception creating section:', error);
    return null;
  }
}

// ============================================================================
// STAIR OPERATIONS
// ============================================================================

/**
 * Create a single stair within a section.
 *
 * @param sectionId - The section's UUID
 * @param stairData - Stair data including title, emoji, vocabulary count, etc.
 * @returns The created stair's ID, or null on error
 */
export async function createStair(
  sectionId: string,
  stairData: {
    order: number;
    title: string;
    emoji: string;
    description: string;
    vocabulary_count: number;
    estimated_days: number;
    skills_required: string[];
    skills_unlocked: string[];
  }
): Promise<{ id: string } | null> {
  try {
    const insertData: StairInsert = {
      section_id: sectionId,
      order: stairData.order,
      title: stairData.title,
      emoji: stairData.emoji,
      description: stairData.description,
      vocabulary_count: stairData.vocabulary_count,
      estimated_days: stairData.estimated_days,
      skills_required: stairData.skills_required,
      skills_unlocked: stairData.skills_unlocked,
      status: stairData.order === 1 ? 'current' : 'locked',
      lessons_count: 5,
    };

    const { data, error } = await supabase
      .from('stairs')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating stair:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception creating stair:', error);
    return null;
  }
}

/**
 * Batch create multiple stairs for a section.
 * This is more efficient than creating stairs one by one.
 *
 * @param sectionId - The section's UUID
 * @param stairs - Array of generated stairs from AI
 * @returns True if successful, false on error
 */
export async function createStairsForSection(
  sectionId: string,
  stairs: GeneratedStair[]
): Promise<boolean> {
  try {
    const insertData: StairInsert[] = stairs.map((stair, index) => ({
      section_id: sectionId,
      order: stair.order,
      title: stair.title,
      emoji: stair.emoji,
      description: stair.description,
      vocabulary_count: stair.vocabulary?.length || 0,
      estimated_days: stair.estimated_days,
      skills_required: stair.skills_required || [],
      skills_unlocked: stair.skills_unlocked || [],
      status: index === 0 ? 'current' : 'locked',
      lessons_count: 5,
    }));

    const { error } = await supabase
      .from('stairs')
      .insert(insertData);

    if (error) {
      console.error('Error batch creating stairs:', error);
      return false;
    }

    // Update section's stairs_count
    const { error: updateError } = await supabase
      .from('sections')
      .update({ stairs_count: stairs.length })
      .eq('id', sectionId);

    if (updateError) {
      console.error('Error updating section stairs_count:', updateError);
    }

    return true;
  } catch (error) {
    console.error('Exception batch creating stairs:', error);
    return false;
  }
}

/**
 * Update a stair's status (locked, current, completed).
 *
 * @param stairId - The stair's UUID
 * @param status - New status for the stair
 * @returns True if successful, false on error
 */
export async function updateStairStatus(
  stairId: string,
  status: 'locked' | 'current' | 'completed'
): Promise<boolean> {
  try {
    const updateData: Partial<Stair> = {
      status,
      ...(status === 'completed' && { completed_at: new Date().toISOString() }),
    };

    const { error } = await supabase
      .from('stairs')
      .update(updateData)
      .eq('id', stairId);

    if (error) {
      console.error('Error updating stair status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating stair status:', error);
    return false;
  }
}

/**
 * Get stairs formatted for the home screen display.
 * Returns stairs from all sections in the user's learning path.
 *
 * @param userId - The user's UUID
 * @returns Array of stairs formatted for display, or empty array on error
 */
export async function getStairsForHome(userId: string): Promise<StairForDisplay[]> {
  try {
    // First get the user's learning path
    const { data: path, error: pathError } = await supabase
      .from('learning_paths')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (pathError || !path) {
      console.error('Error fetching learning path:', pathError);
      return [];
    }

    // Get all sections for this path
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('id')
      .eq('path_id', path.id);

    if (sectionsError || !sections) {
      console.error('Error fetching sections:', sectionsError);
      return [];
    }

    const sectionIds = sections.map(s => s.id);

    // Get all stairs for these sections
    const { data: stairs, error: stairsError } = await supabase
      .from('stairs')
      .select('id, order, title, emoji, description, status, vocabulary_count, estimated_days')
      .in('section_id', sectionIds)
      .order('order', { ascending: true });

    if (stairsError) {
      console.error('Error fetching stairs:', stairsError);
      return [];
    }

    // Format stairs for display
    return (stairs || []).map(stair => ({
      id: stair.id,
      order: stair.order,
      title: stair.title,
      emoji: stair.emoji,
      description: stair.description,
      status: stair.status,
      vocabulary_count: stair.vocabulary_count,
      estimated_days: stair.estimated_days,
    }));
  } catch (error) {
    console.error('Exception fetching stairs for home:', error);
    return [];
  }
}
