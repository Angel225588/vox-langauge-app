/**
 * Recordings Library Screen
 *
 * Displays all saved recordings from reading/teleprompter practice sessions.
 * Each recording card has a "View Feedback" button that navigates to detailed feedback.
 *
 * Features:
 * - Header with back button and title
 * - Stats bar showing total recordings, practice time, and best score
 * - Filter options: All | Public | Private
 * - Sort options: Recent | Best Score | Most Practiced
 * - Recording cards with metadata and feedback navigation
 * - Empty state for no recordings
 * - Staggered animations with FadeInDown
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

type FilterOption = 'all' | 'public' | 'private';
type SortOption = 'recent' | 'best_score' | 'most_practiced';

interface Recording {
  id: string;
  title: string;
  category: string;
  duration: number; // in seconds
  dateRecorded: string; // ISO string
  score: number; // articulation score 0-100
  isPublic: boolean;
  audioUri: string;
  practiceCount: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_RECORDINGS: Recording[] = [
  {
    id: 'rec_001',
    title: 'A Morning in Paris',
    category: 'Travel',
    duration: 154, // 2:34
    dateRecorded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    score: 92,
    isPublic: true,
    audioUri: 'file://recordings/morning_paris.m4a',
    practiceCount: 5,
  },
  {
    id: 'rec_002',
    title: 'Job Interview Practice',
    category: 'Professional',
    duration: 189, // 3:09
    dateRecorded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    score: 87,
    isPublic: false,
    audioUri: 'file://recordings/job_interview.m4a',
    practiceCount: 12,
  },
  {
    id: 'rec_003',
    title: 'Restaurant Ordering',
    category: 'Daily Life',
    duration: 98, // 1:38
    dateRecorded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    score: 95,
    isPublic: true,
    audioUri: 'file://recordings/restaurant.m4a',
    practiceCount: 8,
  },
  {
    id: 'rec_004',
    title: 'Phone Call Conversation',
    category: 'Communication',
    duration: 142, // 2:22
    dateRecorded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    score: 89,
    isPublic: false,
    audioUri: 'file://recordings/phone_call.m4a',
    practiceCount: 6,
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function RecordingsLibraryScreen() {
  const router = useRouter();
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  // Calculate stats
  const stats = useMemo(() => {
    const totalRecordings = MOCK_RECORDINGS.length;
    const totalPracticeTime = MOCK_RECORDINGS.reduce((sum, rec) => sum + rec.duration, 0);
    const bestScore = MOCK_RECORDINGS.reduce((max, rec) => Math.max(max, rec.score), 0);

    return {
      totalRecordings,
      totalPracticeTime: Math.floor(totalPracticeTime / 60), // in minutes
      bestScore,
    };
  }, []);

  // Filter and sort recordings
  const filteredAndSortedRecordings = useMemo(() => {
    let result = [...MOCK_RECORDINGS];

    // Apply filter
    switch (filterOption) {
      case 'public':
        result = result.filter(rec => rec.isPublic);
        break;
      case 'private':
        result = result.filter(rec => !rec.isPublic);
        break;
      case 'all':
      default:
        // No filtering
        break;
    }

    // Apply sort
    switch (sortOption) {
      case 'best_score':
        result.sort((a, b) => b.score - a.score);
        break;
      case 'most_practiced':
        result.sort((a, b) => b.practiceCount - a.practiceCount);
        break;
      case 'recent':
      default:
        result.sort((a, b) =>
          new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime()
        );
        break;
    }

    return result;
  }, [filterOption, sortOption]);

  // Handlers
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handlePlayRecording = (recording: Recording) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Play recording:', recording.id);
    // TODO: Implement inline audio playback
  };

  const handleViewFeedback = (recording: Recording) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to feedback detail screen
    router.push(`/recording-feedback/${recording.id}` as any);
  };

  const handleFilterChange = (option: FilterOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterOption(option);
  };

  const handleSortChange = (option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortOption(option);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <BackButton onPress={handleBack} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Recordings</Text>
          <Text style={styles.headerSubtitle}>Reading practice sessions</Text>
        </View>
      </Animated.View>

      {/* Stats Bar */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={styles.statsBar}
      >
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalRecordings}</Text>
          <Text style={styles.statLabel}>Recordings</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalPracticeTime}m</Text>
          <Text style={styles.statLabel}>Practice Time</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statValueHighlight]}>{stats.bestScore}%</Text>
          <Text style={styles.statLabel}>Best Score</Text>
        </View>
      </Animated.View>

      {/* Filter Options */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.filterSection}
      >
        <Text style={styles.filterSectionTitle}>Filter</Text>
        <View style={styles.filterOptions}>
          <FilterPill
            label="All"
            active={filterOption === 'all'}
            onPress={() => handleFilterChange('all')}
          />
          <FilterPill
            label="Public"
            icon="🌐"
            active={filterOption === 'public'}
            onPress={() => handleFilterChange('public')}
          />
          <FilterPill
            label="Private"
            icon="🔒"
            active={filterOption === 'private'}
            onPress={() => handleFilterChange('private')}
          />
        </View>
      </Animated.View>

      {/* Sort Options */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(300)}
        style={styles.sortSection}
      >
        <Text style={styles.sortSectionTitle}>Sort By</Text>
        <View style={styles.sortOptions}>
          <SortChip
            label="Recent"
            active={sortOption === 'recent'}
            onPress={() => handleSortChange('recent')}
          />
          <SortChip
            label="Best Score"
            active={sortOption === 'best_score'}
            onPress={() => handleSortChange('best_score')}
          />
          <SortChip
            label="Most Practiced"
            active={sortOption === 'most_practiced'}
            onPress={() => handleSortChange('most_practiced')}
          />
        </View>
      </Animated.View>

      {/* Recordings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAndSortedRecordings.length === 0 ? (
          <EmptyState filterOption={filterOption} />
        ) : (
          filteredAndSortedRecordings.map((recording, index) => (
            <RecordingCard
              key={recording.id}
              recording={recording}
              index={index}
              onPlay={() => handlePlayRecording(recording)}
              onViewFeedback={() => handleViewFeedback(recording)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// FilterPill Component
// ============================================================================

interface FilterPillProps {
  label: string;
  icon?: string;
  active: boolean;
  onPress: () => void;
}

function FilterPill({ label, icon, active, onPress }: FilterPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.filterPill}
    >
      {active ? (
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.filterPillGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {icon && <Text style={styles.filterPillIcon}>{icon}</Text>}
          <Text style={styles.filterPillTextActive}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.filterPillInactive}>
          {icon && <Text style={styles.filterPillIconInactive}>{icon}</Text>}
          <Text style={styles.filterPillTextInactive}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// SortChip Component
// ============================================================================

interface SortChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function SortChip({ label, active, onPress }: SortChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.sortChip}
    >
      <View style={[styles.sortChipContent, active && styles.sortChipActive]}>
        <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// RecordingCard Component
// ============================================================================

interface RecordingCardProps {
  recording: Recording;
  index: number;
  onPlay: () => void;
  onViewFeedback: () => void;
}

function RecordingCard({ recording, index, onPlay, onViewFeedback }: RecordingCardProps) {
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
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.success.DEFAULT;
    if (score >= 75) return colors.secondary.DEFAULT;
    if (score >= 60) return colors.warning.DEFAULT;
    return colors.error.DEFAULT;
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(400 + index * 100)}
      style={styles.recordingCard}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {/* Waveform Icon */}
          <View style={styles.waveformContainer}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.waveformGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.waveformIcon}>🎤</Text>
            </LinearGradient>
          </View>

          {/* Title & Category */}
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {recording.title}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{recording.category}</Text>
            </View>
          </View>
        </View>

        {/* Score Ring */}
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreRing, { borderColor: getScoreColor(recording.score) }]}>
            <Text style={[styles.scoreValue, { color: getScoreColor(recording.score) }]}>
              {recording.score}
            </Text>
          </View>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </View>

      {/* Card Metadata */}
      <View style={styles.cardMetadata}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataIcon}>📅</Text>
          <Text style={styles.metadataText}>{formatDate(recording.dateRecorded)}</Text>
        </View>

        <View style={styles.metadataItem}>
          <Text style={styles.metadataIcon}>⏱️</Text>
          <Text style={styles.metadataText}>{formatDuration(recording.duration)}</Text>
        </View>

        <View style={styles.metadataItem}>
          <Text style={styles.metadataIcon}>{recording.isPublic ? '🌐' : '🔒'}</Text>
          <Text style={styles.metadataText}>{recording.isPublic ? 'Public' : 'Private'}</Text>
        </View>
      </View>

      {/* Card Actions */}
      <View style={styles.cardActions}>
        {/* Play Button */}
        <TouchableOpacity
          onPress={onPlay}
          activeOpacity={0.8}
          style={styles.playButton}
        >
          <View style={styles.playButtonContent}>
            <Text style={styles.playButtonIcon}>▶️</Text>
            <Text style={styles.playButtonText}>Play</Text>
          </View>
        </TouchableOpacity>

        {/* View Feedback Button */}
        <TouchableOpacity
          onPress={onViewFeedback}
          activeOpacity={0.8}
          style={styles.feedbackButton}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.feedbackButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.feedbackButtonText}>View Feedback</Text>
            <Text style={styles.feedbackButtonIcon}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
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
      case 'public':
        return 'You don\'t have any public recordings yet.\nMake a recording public to share with others!';
      case 'private':
        return 'You don\'t have any private recordings yet.\nKeep your practice sessions private for personal review.';
      default:
        return 'You don\'t have any recordings yet.\nStart your first reading session to begin!';
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.emptyState}
    >
      <Text style={styles.emptyStateIcon}>🎙️</Text>
      <Text style={styles.emptyStateTitle}>No Recordings Found</Text>
      <Text style={styles.emptyStateMessage}>{getMessage()}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.emptyStateButton}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.emptyStateButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.emptyStateButtonIcon}>🎤</Text>
          <Text style={styles.emptyStateButtonText}>Start Recording</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
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
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statValueHighlight: {
    color: colors.success.light,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },

  // Filter Section
  filterSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterSectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterPill: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  filterPillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterPillInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  filterPillIcon: {
    fontSize: 14,
  },
  filterPillIconInactive: {
    fontSize: 14,
    opacity: 0.6,
  },
  filterPillTextActive: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  filterPillTextInactive: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Sort Section
  sortSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sortSectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortChip: {
    flex: 1,
  },
  sortChipContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  sortChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: colors.primary.DEFAULT,
  },
  sortChipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  sortChipTextActive: {
    color: colors.primary.light,
    fontWeight: typography.fontWeight.semibold,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Recording Card
  recordingCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  waveformContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  waveformGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformIcon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.light,
  },

  // Score Container
  scoreContainer: {
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  scoreRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  scoreValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 4,
  },

  // Card Metadata
  cardMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
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

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  playButton: {
    flex: 0,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  playButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  playButtonIcon: {
    fontSize: 12,
  },
  playButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  feedbackButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  feedbackButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  feedbackButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  feedbackButtonIcon: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  emptyStateIcon: {
    fontSize: 80,
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
    marginBottom: spacing.xl,
  },
  emptyStateButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyStateButtonIcon: {
    fontSize: 20,
  },
  emptyStateButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
