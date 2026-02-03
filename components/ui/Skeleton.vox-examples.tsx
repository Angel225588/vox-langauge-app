/**
 * Skeleton Examples for Vox Language App
 *
 * Real-world examples specifically for Vox Language App screens and components.
 * These show exactly how to integrate skeletons into existing Vox components.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonList,
  SkeletonButton,
} from './Skeleton';
import { colors, spacing, borderRadius } from '../../constants/designSystem';

/**
 * Loading state for Vocabulary Card
 * Matches the layout of VocabularyCard component
 */
export function LoadingVocabularyCard() {
  return (
    <View style={styles.vocabCard}>
      {/* Image/illustration area */}
      <SkeletonBox
        width="100%"
        height={220}
        borderRadius={borderRadius.lg}
      />

      {/* Word section */}
      <View style={{ marginTop: spacing.lg }}>
        <SkeletonBox
          width="70%"
          height={32}
          borderRadius={borderRadius.sm}
          style={{ marginBottom: spacing.sm }}
        />
        <SkeletonBox
          width="40%"
          height={18}
          borderRadius={borderRadius.sm / 2}
        />
      </View>

      {/* Definition */}
      <View style={{ marginTop: spacing.lg }}>
        <SkeletonBox
          width={100}
          height={16}
          borderRadius={borderRadius.sm / 2}
          style={{ marginBottom: spacing.sm }}
        />
        <SkeletonText lines={2} lineHeight={16} />
      </View>

      {/* Example sentence */}
      <View style={{ marginTop: spacing.md }}>
        <SkeletonBox
          width={80}
          height={16}
          borderRadius={borderRadius.sm / 2}
          style={{ marginBottom: spacing.sm }}
        />
        <SkeletonText lines={1} lineHeight={16} />
      </View>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <SkeletonButton width="48%" height={52} />
        <SkeletonButton width="48%" height={52} />
      </View>
    </View>
  );
}

/**
 * Loading state for Quiz Card
 * Matches quiz/question card layouts
 */
export function LoadingQuizCard() {
  return (
    <View style={styles.quizCard}>
      {/* Progress indicator */}
      <View style={styles.row}>
        <SkeletonBox width={60} height={20} borderRadius={borderRadius.sm} />
        <SkeletonBox
          width="100%"
          height={8}
          borderRadius={borderRadius.full}
          style={{ marginLeft: spacing.sm }}
        />
      </View>

      {/* Question */}
      <View style={{ marginTop: spacing.xl }}>
        <SkeletonBox
          width="90%"
          height={24}
          borderRadius={borderRadius.sm}
          style={{ marginBottom: spacing.md }}
        />
        <SkeletonText lines={1} lineHeight={18} />
      </View>

      {/* Answer options */}
      <View style={{ marginTop: spacing.xl }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBox
            key={index}
            width="100%"
            height={60}
            borderRadius={borderRadius.md}
            style={index > 0 ? { marginTop: spacing.md } : undefined}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Loading state for Speaking Practice Card
 * Matches the speaking/pronunciation card layout
 */
export function LoadingSpeakingCard() {
  return (
    <View style={styles.speakingCard}>
      {/* Title */}
      <SkeletonBox
        width="60%"
        height={28}
        borderRadius={borderRadius.sm}
        style={{ marginBottom: spacing.lg }}
      />

      {/* Phrase/sentence to practice */}
      <View style={styles.phraseBox}>
        <SkeletonText lines={2} lineHeight={20} />
      </View>

      {/* Waveform visualization placeholder */}
      <View style={styles.waveformContainer}>
        {Array.from({ length: 30 }).map((_, index) => (
          <SkeletonBox
            key={index}
            width={6}
            height={Math.random() * 60 + 20}
            borderRadius={borderRadius.sm / 2}
            style={{ marginHorizontal: 2 }}
          />
        ))}
      </View>

      {/* Record button */}
      <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
        <SkeletonCircle size={72} />
      </View>

      {/* Tips section */}
      <View style={{ marginTop: spacing.xl }}>
        <SkeletonBox
          width={60}
          height={16}
          borderRadius={borderRadius.sm / 2}
          style={{ marginBottom: spacing.sm }}
        />
        <SkeletonText lines={2} lineHeight={14} />
      </View>
    </View>
  );
}

/**
 * Loading state for Lesson List
 * Matches the main lesson list screen
 */
export function LoadingLessonList() {
  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={{ marginBottom: spacing.md }}>
        <SkeletonBox
          width={150}
          height={24}
          borderRadius={borderRadius.sm}
        />
      </View>

      {/* Lesson items */}
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.lessonItem,
            index > 0 && { marginTop: spacing.md },
          ]}
        >
          {/* Lesson thumbnail/icon */}
          <SkeletonBox
            width={64}
            height={64}
            borderRadius={borderRadius.md}
          />

          {/* Lesson info */}
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <SkeletonBox
              width="70%"
              height={18}
              borderRadius={borderRadius.sm / 2}
              style={{ marginBottom: spacing.xs }}
            />
            <SkeletonBox
              width="90%"
              height={14}
              borderRadius={borderRadius.sm / 2}
              style={{ marginBottom: spacing.xs }}
            />

            {/* Progress and stats */}
            <View style={styles.row}>
              <SkeletonBox width={60} height={12} borderRadius={borderRadius.sm / 2} />
              <SkeletonBox
                width={60}
                height={12}
                borderRadius={borderRadius.sm / 2}
                style={{ marginLeft: spacing.sm }}
              />
            </View>
          </View>

          {/* Status indicator */}
          <SkeletonBox
            width={32}
            height={32}
            borderRadius={borderRadius.full}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Loading state for Progress Dashboard
 * Matches the user progress/stats screen
 */
export function LoadingProgressDashboard() {
  return (
    <View style={styles.container}>
      {/* Header with streak */}
      <View style={styles.dashboardHeader}>
        <SkeletonCircle size={80} />
        <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
          <SkeletonBox
            width={60}
            height={32}
            borderRadius={borderRadius.sm}
            style={{ marginBottom: spacing.xs }}
          />
          <SkeletonBox width={100} height={16} borderRadius={borderRadius.sm / 2} />
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.statCard}>
            <SkeletonBox
              width={48}
              height={24}
              borderRadius={borderRadius.sm}
              style={{ marginBottom: spacing.xs }}
            />
            <SkeletonBox width={80} height={14} borderRadius={borderRadius.sm / 2} />
          </View>
        ))}
      </View>

      {/* Recent activity */}
      <View style={{ marginTop: spacing.xl }}>
        <SkeletonBox
          width={150}
          height={20}
          borderRadius={borderRadius.sm}
          style={{ marginBottom: spacing.md }}
        />
        <SkeletonList count={4} showAvatar={false} showThumbnail />
      </View>
    </View>
  );
}

/**
 * Loading state for Profile Screen
 * Matches user profile layout
 */
export function LoadingProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <SkeletonCircle size={100} />
        <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
          <SkeletonBox
            width={150}
            height={24}
            borderRadius={borderRadius.sm}
            style={{ marginBottom: spacing.xs }}
          />
          <SkeletonBox width={200} height={16} borderRadius={borderRadius.sm / 2} />
        </View>

        {/* Edit button */}
        <SkeletonButton
          width={120}
          height={40}
          style={{ marginTop: spacing.lg }}
        />
      </View>

      {/* Stats summary */}
      <View style={styles.statsRow}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.statItem}>
            <SkeletonBox
              width={60}
              height={24}
              borderRadius={borderRadius.sm}
              style={{ marginBottom: spacing.xs }}
            />
            <SkeletonBox width={80} height={14} borderRadius={borderRadius.sm / 2} />
          </View>
        ))}
      </View>

      {/* Achievements section */}
      <View style={{ marginTop: spacing.xl }}>
        <SkeletonBox
          width={150}
          height={20}
          borderRadius={borderRadius.sm}
          style={{ marginBottom: spacing.md }}
        />
        <View style={styles.achievementsGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBox
              key={index}
              width={100}
              height={100}
              borderRadius={borderRadius.md}
            />
          ))}
        </View>
      </View>

      {/* Settings options */}
      <View style={{ marginTop: spacing.xl }}>
        <SkeletonBox
          width={100}
          height={20}
          borderRadius={borderRadius.sm}
          style={{ marginBottom: spacing.md }}
        />
        {Array.from({ length: 4 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.settingItem,
              index > 0 && { marginTop: spacing.sm },
            ]}
          >
            <SkeletonBox width={32} height={32} borderRadius={borderRadius.sm} />
            <SkeletonBox
              width="70%"
              height={16}
              borderRadius={borderRadius.sm / 2}
              style={{ marginLeft: spacing.md }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Loading state for Writing Practice
 * Matches the Personal Script Builder layout
 */
export function LoadingWritingPractice() {
  return (
    <View style={styles.writingCard}>
      {/* Task header */}
      <View style={{ marginBottom: spacing.lg }}>
        <SkeletonBox
          width="80%"
          height={24}
          borderRadius={borderRadius.sm}
          style={{ marginBottom: spacing.sm }}
        />
        <SkeletonText lines={2} lineHeight={16} />
      </View>

      {/* Writing area */}
      <View style={styles.writingArea}>
        <SkeletonText lines={8} lineHeight={24} lineSpacing={spacing.md} />
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <SkeletonBox width={40} height={40} borderRadius={borderRadius.sm} />
        <SkeletonBox width={40} height={40} borderRadius={borderRadius.sm} />
        <SkeletonBox width={40} height={40} borderRadius={borderRadius.sm} />
        <SkeletonBox width={40} height={40} borderRadius={borderRadius.sm} />
      </View>

      {/* Submit button */}
      <SkeletonButton height={52} style={{ marginTop: spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
  },
  vocabCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
  },
  quizCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
  },
  speakingCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
  },
  writingCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phraseBox: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    height: 80,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  dashboardHeader: {
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  writingArea: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 200,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
  },
});
