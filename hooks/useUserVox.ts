/**
 * useUserVox — Hook for managing the user's personal Vox category collection.
 *
 * Provides browsable categories from the Vox Library, the user's saved
 * categories, and add/remove operations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';
import type { UserVoxCategory, CategoryInfo } from '@/types/voxLibrary';
import {
  getAvailableCategories,
  getUserVoxCategories,
  addCategoryToUserVox,
  removeFromUserVox,
} from '@/lib/services/voxLibrary';

interface UseUserVoxReturn {
  /** User's saved Vox categories */
  categories: UserVoxCategory[];
  /** All browsable categories from the library */
  availableCategories: CategoryInfo[];
  /** Add a category to the user's Vox */
  addCategory: (slug: string, label: string) => Promise<void>;
  /** Remove a category from the user's Vox */
  removeCategory: (slug: string) => Promise<void>;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Check if a category is already in the user's Vox */
  isInVox: (slug: string) => boolean;
  /** Refresh both available and user categories */
  refresh: () => Promise<void>;
}

export function useUserVox(): UseUserVoxReturn {
  const { user } = useAuth();
  const { data: onboardingData } = useOnboardingV2();

  const [categories, setCategories] = useState<UserVoxCategory[]>([]);
  const [availableCategories, setAvailableCategories] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive the language pair from onboarding data
  const languagePair = useMemo(() => {
    if (onboardingData.native_language && onboardingData.target_language) {
      return `${onboardingData.native_language}-${onboardingData.target_language}`;
    }
    return null;
  }, [onboardingData.native_language, onboardingData.target_language]);

  // Map onboarding proficiency to CEFR level
  const cefrLevel = useMemo(() => {
    const map: Record<string, string> = {
      beginner: 'A1',
      elementary: 'A2',
      intermediate: 'B1',
      upper_intermediate: 'B2',
      advanced: 'C1',
    };
    return onboardingData.proficiency_level
      ? map[onboardingData.proficiency_level] ?? undefined
      : undefined;
  }, [onboardingData.proficiency_level]);

  const fetchData = useCallback(async () => {
    if (!user?.id || !languagePair) return;

    setIsLoading(true);
    try {
      const [userCats, available] = await Promise.all([
        getUserVoxCategories(user.id),
        getAvailableCategories(languagePair, cefrLevel),
      ]);
      setCategories(userCats);
      setAvailableCategories(available);
    } catch (err) {
      console.error('[useUserVox] Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, languagePair, cefrLevel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCategory = useCallback(
    async (slug: string, label: string) => {
      if (!user?.id) return;
      // Optimistic update
      const optimistic: UserVoxCategory = {
        id: `temp-${slug}`,
        user_id: user.id,
        category_slug: slug,
        category_label: label,
        priority: 0,
        is_active: true,
        added_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, optimistic]);

      try {
        await addCategoryToUserVox(user.id, slug, label);
        // Refresh to get the real row from the server
        const updated = await getUserVoxCategories(user.id);
        setCategories(updated);
      } catch (err) {
        // Rollback
        setCategories((prev) => prev.filter((c) => c.category_slug !== slug));
        console.error('[useUserVox] Failed to add category:', err);
      }
    },
    [user?.id]
  );

  const removeCategory = useCallback(
    async (slug: string) => {
      if (!user?.id) return;
      // Optimistic removal
      const backup = categories;
      setCategories((prev) => prev.filter((c) => c.category_slug !== slug));

      try {
        await removeFromUserVox(user.id, slug);
      } catch (err) {
        // Rollback
        setCategories(backup);
        console.error('[useUserVox] Failed to remove category:', err);
      }
    },
    [user?.id, categories]
  );

  const isInVox = useCallback(
    (slug: string) => categories.some((c) => c.category_slug === slug),
    [categories]
  );

  return {
    categories,
    availableCategories,
    addCategory,
    removeCategory,
    isLoading,
    isInVox,
    refresh: fetchData,
  };
}
