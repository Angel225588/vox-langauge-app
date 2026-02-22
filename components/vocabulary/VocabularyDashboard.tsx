/**
 * VocabularyDashboard — Reusable Vocabulary Dashboard Component
 *
 * Extracted from app/(tabs)/vocabulary.tsx for use in both the hidden tab
 * and the /vocabulary-dashboard stack route (accessible from Practice grid).
 *
 * Key sections:
 * 1. Practice Now CTA - Words due for review
 * 2. Progress Breakdown - Strong/Learning/New
 * 3. Focus Words - Weak words that need attention
 * 4. Categories - Browse by topic
 * 5. Recently Added - Motivation through activity
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useWordBank, useWordBankStats, BankWord } from '@/lib/word-bank';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { Icon } from '@/components/ui/Icon';

import { PracticeNowCard } from '@/components/vocabulary/PracticeNowCard';
import { ProgressBreakdown } from '@/components/vocabulary/ProgressBreakdown';
import { FocusWordsList } from '@/components/vocabulary/FocusWordsList';
import { RecentlyAddedList } from '@/components/vocabulary/RecentlyAddedList';
import { CategoryScroller } from '@/components/vocabulary/CategoryScroller';
import { WordDetailPopup } from '@/components/vocabulary/WordDetailPopup';
import WordList from '@/components/vocabulary/WordList';

export function VocabularyDashboard() {
  const router = useRouter();
  const { words, loading, refreshWords, deleteWord } = useWordBank();
  const { stats, loading: statsLoading, refresh: refreshStats } = useWordBankStats();

  // UI State
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWord, setSelectedWord] = useState<BankWord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshWords(), refreshStats()]);
    setRefreshing(false);
  }, [refreshWords, refreshStats]);

  // Word press handler
  const handleWordPress = useCallback((word: BankWord) => {
    setSelectedWord(word);
    setShowDetailModal(true);
  }, []);

  // Category filter
  const handleCategoryPress = useCallback((category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      setShowSearch(true);
    }
  }, []);

  // Progress category filter (Strong/Learning/New)
  const handleProgressCategoryPress = useCallback((_category: 'strong' | 'learning' | 'new') => {
    setShowSearch(true);
  }, []);

  // Navigate to practice
  const handlePracticePress = useCallback(() => {
    router.push('/vocab-practice/review' as any);
  }, [router]);

  // Navigate to focus words practice
  const handleFocusWordsPractice = useCallback(() => {
    router.push('/vocab-practice/focus' as any);
  }, [router]);

  // See all weak words
  const handleSeeAllFocusWords = useCallback(() => {
    setShowSearch(true);
  }, []);

  // Handle word deleted
  const handleWordDeleted = useCallback(async (id: string): Promise<boolean> => {
    const success = await deleteWord(id);
    if (success) {
      await refreshStats();
    }
    return success;
  }, [deleteWord, refreshStats]);

  // Filter words by search and category
  const filteredWords = useMemo(() => {
    let result = words;

    if (selectedCategory) {
      result = result.filter(
        (word) => word.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      result = result.filter(
        (word) =>
          word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.translation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [words, selectedCategory, searchQuery]);

  const isLoading = loading || statsLoading;

  // If search/filter mode, show list view
  if (showSearch) {
    return (
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <TouchableOpacity
            onPress={() => {
              setShowSearch(false);
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            style={styles.backButton}
            accessibilityLabel="Go back to vocabulary dashboard"
            accessibilityRole="button"
          >
            <Icon name="arrow-back" size="md" color="primary" />
          </TouchableOpacity>

          <View style={styles.searchInputContainer}>
            <Icon name="search" size="sm" color="tertiary" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search words..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              accessibilityLabel="Search words and translations"
              accessibilityRole="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size="sm" color="tertiary" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter Badge */}
        {selectedCategory && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.filterBadgeContainer}>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedCategory}</Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={styles.clearFilterButton}
              >
                <Icon name="close" size="sm" color="primary" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Results count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredWords.length} {filteredWords.length === 1 ? 'word' : 'words'}
          </Text>
        </View>

        {/* Word List */}
        <WordList
          words={filteredWords}
          loading={loading}
          onWordPress={handleWordPress}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onDelete={handleWordDeleted}
        />

        {/* Word Detail Modal */}
        {selectedWord && (
          <WordDetailPopup
            visible={showDetailModal}
            word={selectedWord}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </View>
    );
  }

  // Main dashboard view
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Words</Text>
          <Text style={styles.headerSubtitle}>
            {isLoading ? '...' : `${words.length} words learned`}
          </Text>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          onPress={() => setShowSearch(true)}
          style={styles.searchButton}
          accessibilityLabel="Search vocabulary"
          accessibilityRole="button"
        >
          <Icon name="search" size="md" color="secondary" />
        </TouchableOpacity>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* 1. Practice Now CTA */}
        <PracticeNowCard
          wordsDue={stats?.wordsNeedingReview || 0}
          onPress={handlePracticePress}
          loading={isLoading}
        />

        {/* 2. Progress Breakdown */}
        <ProgressBreakdown
          words={words}
          onCategoryPress={handleProgressCategoryPress}
          loading={isLoading}
        />

        {/* 3. Focus Words (Weak Words) */}
        <FocusWordsList
          words={words}
          limit={5}
          onWordPress={handleWordPress}
          onSeeAll={handleSeeAllFocusWords}
          onPractice={handleFocusWordsPractice}
          loading={isLoading}
        />

        {/* 4. Categories */}
        <CategoryScroller
          words={words}
          onCategoryPress={handleCategoryPress}
          selectedCategory={selectedCategory}
          loading={isLoading}
        />

        {/* 5. Recently Added */}
        <RecentlyAddedList
          words={words}
          limit={5}
          onWordPress={handleWordPress}
          loading={isLoading}
        />

        {/* Bottom padding for safe area */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Word Detail Modal */}
      {selectedWord && (
        <WordDetailPopup
          visible={showDetailModal}
          word={selectedWord}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
  },
  bottomPadding: {
    height: spacing['3xl'],
  },

  // Search Header
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },

  // Filter Badge
  filterBadgeContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 54, 255, 0.15)',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 54, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.light,
    textTransform: 'capitalize',
  },
  clearFilterButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    backgroundColor: 'rgba(0, 54, 255, 0.2)',
    borderRadius: borderRadius.full,
  },

  // Results
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});

export default VocabularyDashboard;
