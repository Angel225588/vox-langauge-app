/**
 * Recordings Library - My Recordings Dashboard
 *
 * Shows all past reading sessions with recordings.
 * Features:
 * - List of recording cards with passage title, date, duration, score
 * - Performance distribution bars
 * - Tap to navigate to playback view
 * - Pull to refresh
 * - Filter/sort options
 * - Empty state
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { getSessions } from '@/lib/reading/storage';
import type { ReadingSession, SessionSortField, SortDirection } from '@/lib/reading/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterOption = 'all' | 'with_scores' | 'recent';
type SortOption = 'date' | 'score' | 'duration';

export default function RecordingsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      // Get sessions with recordings only
      const allSessions = await getSessions({
        userId: 'user_001', // TODO: Get from auth context
        includeDeleted: false,
      });

      // Filter to only sessions with recordings
      const sessionsWithRecordings = allSessions.filter(
        session => session.recordingUri && session.recordingUri.length > 0
      );

      setSessions(sessionsWithRecordings);
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let result = [...sessions];

    // Apply filter
    switch (filterOption) {
      case 'with_scores':
        result = result.filter(s => s.overallScore > 0);
        break;
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        result = result.filter(s => new Date(s.createdAt) >= weekAgo);
        break;
      case 'all':
      default:
        // No filtering
        break;
    }

    // Apply sort
    switch (sortOption) {
      case 'score':
        result.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case 'duration':
        result.sort((a, b) => b.recordingDurationMs - a.recordingDurationMs);
        break;
      case 'date':
      default:
        result.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [sessions, filterOption, sortOption]);

  // Handle back
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Handle recording press
  const handleRecordingPress = (session: ReadingSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to playback view with session ID
    console.log('Navigate to playback:', session.id);
  };

  // Toggle filters
  const toggleFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Recordings</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : `${filteredAndSortedSessions.length} recording${filteredAndSortedSessions.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
          <LinearGradient
            colors={showFilters ? colors.gradients.primary : ['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.1)'] as const}
            style={styles.filterButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.filterButtonIcon}>⚙️</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter/Sort Options */}
      {showFilters && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.filtersContainer}
        >
          {/* Filter Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filter</Text>
            <View style={styles.filterOptions}>
              <FilterChip
                label="All"
                active={filterOption === 'all'}
                onPress={() => setFilterOption('all')}
              />
              <FilterChip
                label="With Scores"
                active={filterOption === 'with_scores'}
                onPress={() => setFilterOption('with_scores')}
              />
              <FilterChip
                label="Recent (7d)"
                active={filterOption === 'recent'}
                onPress={() => setFilterOption('recent')}
              />
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.filterOptions}>
              <FilterChip
                label="Date"
                active={sortOption === 'date'}
                onPress={() => setSortOption('date')}
              />
              <FilterChip
                label="Score"
                active={sortOption === 'score'}
                onPress={() => setSortOption('score')}
              />
              <FilterChip
                label="Duration"
                active={sortOption === 'duration'}
                onPress={() => setSortOption('duration')}
              />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading recordings...</Text>
        </View>
      ) : filteredAndSortedSessions.length === 0 ? (
        <EmptyState filterOption={filterOption} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
        >
          {filteredAndSortedSessions.map((session, index) => (
            <RecordingCard
              key={session.id}
              session={session}
              index={index}
              onPress={() => handleRecordingPress(session)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// RecordingCard Component (Reusable)
// ============================================================================

interface RecordingCardProps {
  session: ReadingSession;
  index: number;
  onPress: () => void;
}

export function RecordingCard({ session, index, onPress }: RecordingCardProps) {
  // Format date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Format duration
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate performance distribution
  const getPerformanceDistribution = () => {
    const score = session.overallScore;

    if (score === 0) {
      // No analysis yet
      return { excellent: 0, good: 0, needs_work: 0, poor: 0 };
    }

    // Distribute based on score ranges
    if (score >= 90) {
      return { excellent: 80, good: 15, needs_work: 5, poor: 0 };
    } else if (score >= 75) {
      return { excellent: 50, good: 35, needs_work: 10, poor: 5 };
    } else if (score >= 60) {
      return { excellent: 30, good: 40, needs_work: 20, poor: 10 };
    } else {
      return { excellent: 10, good: 20, needs_work: 40, poor: 30 };
    }
  };

  const distribution = getPerformanceDistribution();
  const hasScore = session.overallScore > 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 100)}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.recordingCard}
      >
        <View style={styles.cardContent}>
          {/* Title & Difficulty */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {session.title || 'Untitled Reading'}
            </Text>
            <View style={[styles.difficultyBadge, getDifficultyColor(session.difficulty)]}>
              <Text style={styles.difficultyText}>
                {session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
              </Text>
            </View>
          </View>

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>📅</Text>
              <Text style={styles.metadataText}>{formatDate(session.createdAt)}</Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>⏱️</Text>
              <Text style={styles.metadataText}>{formatDuration(session.recordingDurationMs)}</Text>
            </View>

            {hasScore && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataIcon}>⭐</Text>
                <Text style={[styles.metadataText, styles.scoreText]}>
                  {Math.round(session.overallScore)}%
                </Text>
              </View>
            )}
          </View>

          {/* Performance Distribution Bar */}
          {hasScore ? (
            <View style={styles.distributionContainer}>
              <View style={styles.distributionBar}>
                {distribution.excellent > 0 && (
                  <View style={[styles.distributionSegment, { flex: distribution.excellent, backgroundColor: colors.success.DEFAULT }]} />
                )}
                {distribution.good > 0 && (
                  <View style={[styles.distributionSegment, { flex: distribution.good, backgroundColor: '#4ECDC4' }]} />
                )}
                {distribution.needs_work > 0 && (
                  <View style={[styles.distributionSegment, { flex: distribution.needs_work, backgroundColor: colors.warning.DEFAULT }]} />
                )}
                {distribution.poor > 0 && (
                  <View style={[styles.distributionSegment, { flex: distribution.poor, backgroundColor: colors.error.DEFAULT }]} />
                )}
              </View>
              <View style={styles.distributionLegend}>
                <Text style={styles.legendText}>
                  <Text style={{ color: colors.success.DEFAULT }}>●</Text> Excellent
                  <Text style={{ color: '#4ECDC4' }}> ●</Text> Good
                  <Text style={{ color: colors.warning.DEFAULT }}> ●</Text> Needs Work
                  <Text style={{ color: colors.error.DEFAULT }}> ●</Text> Poor
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noAnalysisContainer}>
              <Text style={styles.noAnalysisText}>Tap to analyze recording</Text>
            </View>
          )}
        </View>

        {/* Arrow indicator */}
        <View style={styles.cardArrow}>
          <Text style={styles.arrowIcon}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// FilterChip Component
// ============================================================================

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.8}
      style={styles.filterChip}
    >
      {active ? (
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.filterChipGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.filterChipTextActive}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.filterChipInactive}>
          <Text style={styles.filterChipTextInactive}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// EmptyState Component
// ============================================================================

interface EmptyStateProps {
  filterOption: FilterOption;
}

function EmptyState({ filterOption }: EmptyStateProps) {
  const getMessage = () => {
    switch (filterOption) {
      case 'with_scores':
        return 'No analyzed recordings yet.\nComplete a reading session to see your scores!';
      case 'recent':
        return 'No recordings from the past week.\nTime to practice your reading!';
      default:
        return 'No recordings yet.\nStart your first reading session!';
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.emptyState}
    >
      <Text style={styles.emptyStateIcon}>🎤</Text>
      <Text style={styles.emptyStateTitle}>No Recordings Found</Text>
      <Text style={styles.emptyStateMessage}>{getMessage()}</Text>
    </Animated.View>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner':
      return { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: colors.success.DEFAULT };
    case 'intermediate':
      return { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: colors.warning.DEFAULT };
    case 'advanced':
      return { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: colors.error.DEFAULT };
    default:
      return { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: colors.primary.DEFAULT };
  }
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
  },
  backButton: {
    paddingVertical: spacing.xs,
    marginRight: spacing.md,
  },
  backButtonText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  headerContent: {
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
  filterButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  filterButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonIcon: {
    fontSize: 20,
  },

  // Filters
  filtersContainer: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  filterChipGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipInactive: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
  },
  filterChipTextActive: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  filterChipTextInactive: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Content
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Recording Card
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 24,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metadataIcon: {
    fontSize: 14,
  },
  metadataText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  scoreText: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.light,
  },

  // Performance Distribution
  distributionContainer: {
    marginTop: spacing.xs,
  },
  distributionBar: {
    height: 6,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  distributionSegment: {
    height: '100%',
  },
  distributionLegend: {
    marginTop: spacing.xs,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  noAnalysisContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  noAnalysisText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Card Arrow
  cardArrow: {
    marginLeft: spacing.md,
  },
  arrowIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.text.tertiary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
