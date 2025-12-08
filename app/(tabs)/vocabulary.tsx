/**
 * Vocabulary Tab - My Vocabulary Dashboard
 *
 * Main screen for viewing and managing the user's word bank.
 * Features: stats overview, search, word list, category grid, add/edit words.
 *
 * Supports two view modes:
 * - Grid: Category-based view with visual cards
 * - List: Traditional word list with search/filter
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useWordBank, useWordBankStats, BankWord, AddWordInput, WordBankStats } from '@/lib/word-bank';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import WordList from '@/components/vocabulary/WordList';
import { CategoryGrid } from '@/components/vocabulary/CategoryGrid';
import { ViewToggle, ViewMode } from '@/components/vocabulary/ViewToggle';
import { aggregateWordsIntoCategories } from '@/lib/utils/categoryUtils';

export default function VocabularyScreen() {
  const { words, loading, error, addWord, deleteWord, refreshWords } = useWordBank();
  const { stats, loading: statsLoading, refresh: refreshStats } = useWordBankStats();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<BankWord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Aggregate words into categories for grid view
  const categories = useMemo(() => {
    // Need to adapt BankWord from word-bank to the format expected by categoryUtils
    const adaptedWords = words.map(w => ({
      ...w,
      id: w.id,
      word: w.word,
      translation: w.translation,
      category: w.category,
      masteryScore: w.masteryScore,
    }));
    return aggregateWordsIntoCategories(adaptedWords as any);
  }, [words]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshWords(), refreshStats()]);
    setRefreshing(false);
  }, [refreshWords, refreshStats]);

  // Handle word added - refresh stats
  const handleWordAdded = useCallback(async (input: AddWordInput): Promise<BankWord> => {
    const newWord = await addWord(input);
    await refreshStats(); // Refresh stats after adding
    return newWord;
  }, [addWord, refreshStats]);

  // Handle word deleted - refresh stats
  const handleWordDeleted = useCallback(async (id: string): Promise<boolean> => {
    const success = await deleteWord(id);
    if (success) {
      await refreshStats(); // Refresh stats after deleting
    }
    return success;
  }, [deleteWord, refreshStats]);

  // Handle word press - show detail modal
  const handleWordPress = (word: BankWord) => {
    setSelectedWord(word);
    setShowDetailModal(true);
  };

  // Handle category press - switch to list view filtered by category
  const handleCategoryPress = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
    setViewMode('list');
  }, []);

  // Clear category filter
  const handleClearCategoryFilter = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  // Filter words by search query and/or category
  const filteredWords = useMemo(() => {
    let result = words;

    // Filter by category if selected
    if (selectedCategory) {
      result = result.filter(
        (word) => word.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter(
        (word) =>
          word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.translation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [words, selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Vocabulary</Text>
          <Text style={styles.headerSubtitle}>
            {statsLoading ? '...' : `${stats?.totalWords || 0} words`}
          </Text>
        </View>
        <ViewToggle mode={viewMode} onModeChange={setViewMode} />
      </View>

      {/* Stats Bar */}
      <Animated.View entering={FadeInDown.duration(400).springify()}>
        <View style={styles.statsContainer}>
          <StatCard
            label="Total Words"
            value={stats?.totalWords || 0}
            colors={colors.gradients.primary}
          />
          <StatCard
            label="Due for Review"
            value={stats?.wordsNeedingReview || 0}
            colors={colors.gradients.warning}
          />
          <StatCard
            label="Avg Mastery"
            value={`${Math.round(stats?.averageMastery || 0)}%`}
            colors={colors.gradients.success}
          />
        </View>
      </Animated.View>

      {/* View Content - Grid or List */}
      {viewMode === 'grid' ? (
        /* Category Grid View */
        <ScrollView
          style={styles.gridScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridScrollContent}
        >
          <CategoryGrid
            categories={categories}
            onCategoryPress={handleCategoryPress}
            loading={loading}
          />
        </ScrollView>
      ) : (
        /* List View */
        <>
          {/* Category Filter Badge (if filtering) */}
          {selectedCategory && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={styles.categoryFilterContainer}
            >
              <View style={styles.categoryFilterBadge}>
                <Text style={styles.categoryFilterText}>
                  📁 {selectedCategory}
                </Text>
                <TouchableOpacity
                  onPress={handleClearCategoryFilter}
                  style={styles.clearCategoryButton}
                >
                  <Text style={styles.clearCategoryIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search words..."
                placeholderTextColor={colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
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
        </>
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Word Modal */}
      <AddWordModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleWordAdded}
      />

      {/* Word Detail Modal */}
      <WordDetailModal
        visible={showDetailModal}
        word={selectedWord}
        onClose={() => setShowDetailModal(false)}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  colors: string[];
}

function StatCard({ label, value, colors: gradientColors }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <LinearGradient
        colors={gradientColors}
        style={styles.statCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

// ============================================================================
// Add Word Modal Component
// ============================================================================

interface AddWordModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (input: AddWordInput) => Promise<BankWord>;
}

function AddWordModal({ visible, onClose, onAdd }: AddWordModalProps) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!word.trim() || !translation.trim()) {
      Alert.alert('Error', 'Please enter both word and translation');
      return;
    }

    try {
      setLoading(true);
      await onAdd({
        word: word.trim(),
        translation: translation.trim(),
        category,
        source: 'manual',
      });
      setWord('');
      setTranslation('');
      setCategory('general');
      onClose();
      Alert.alert('Success', 'Word added to your vocabulary!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add word. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Word</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Word (e.g., bonjour)"
            placeholderTextColor={colors.text.tertiary}
            value={word}
            onChangeText={setWord}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Translation (e.g., hello)"
            placeholderTextColor={colors.text.tertiary}
            value={translation}
            onChangeText={setTranslation}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Category (e.g., greetings)"
            placeholderTextColor={colors.text.tertiary}
            value={category}
            onChangeText={setCategory}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={handleAdd}
              disabled={loading}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>Add Word</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Word Detail Modal Component
// ============================================================================

interface WordDetailModalProps {
  visible: boolean;
  word: BankWord | null;
  onClose: () => void;
}

function WordDetailModal({ visible, word, onClose }: WordDetailModalProps) {
  if (!word) return null;

  const masteryPercentage = Math.round(word.masteryScore);
  const accuracy =
    word.timesCorrect + word.timesIncorrect > 0
      ? Math.round((word.timesCorrect / (word.timesCorrect + word.timesIncorrect)) * 100)
      : 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Word & Translation */}
            <View style={styles.detailHeader}>
              <Text style={styles.detailWord}>{word.word}</Text>
              <Text style={styles.detailTranslation}>{word.translation}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.detailStatsGrid}>
              <View style={styles.detailStatItem}>
                <Text style={styles.detailStatLabel}>Mastery</Text>
                <Text style={styles.detailStatValue}>{masteryPercentage}%</Text>
              </View>
              <View style={styles.detailStatItem}>
                <Text style={styles.detailStatLabel}>Accuracy</Text>
                <Text style={styles.detailStatValue}>{accuracy}%</Text>
              </View>
              <View style={styles.detailStatItem}>
                <Text style={styles.detailStatLabel}>Category</Text>
                <Text style={styles.detailStatValue}>{word.category}</Text>
              </View>
              <View style={styles.detailStatItem}>
                <Text style={styles.detailStatLabel}>Level</Text>
                <Text style={styles.detailStatValue}>{word.cefrLevel}</Text>
              </View>
            </View>

            {/* Example Sentences */}
            {word.exampleSentences && word.exampleSentences.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Examples</Text>
                {word.exampleSentences.map((sentence, index) => (
                  <Text key={index} style={styles.detailExample}>
                    • {sentence}
                  </Text>
                ))}
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity style={styles.detailCloseButton} onPress={onClose}>
              <Text style={styles.detailCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },

  // Grid View
  gridScrollView: {
    flex: 1,
  },
  gridScrollContent: {
    paddingBottom: spacing.xl * 3, // Extra space for FAB
  },

  // Category Filter
  categoryFilterContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  categoryFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.DEFAULT + '20',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT + '40',
  },
  categoryFilterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.light,
    textTransform: 'capitalize',
  },
  clearCategoryButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    backgroundColor: colors.primary.DEFAULT + '30',
    borderRadius: borderRadius.full,
  },
  clearCategoryIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.bold,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  statCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    opacity: 0.9,
    textAlign: 'center',
  },

  // Search
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  clearIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    paddingHorizontal: spacing.sm,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.lg,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Add Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  addButton: {
    flex: 1,
  },
  addButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // Detail Modal
  detailModalContent: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailHeader: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  detailWord: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  detailTranslation: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
  },
  detailStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  detailStatItem: {
    width: '47%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  detailStatValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  detailSection: {
    marginBottom: spacing.lg,
  },
  detailSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  detailExample: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  detailCloseButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  detailCloseButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
});
