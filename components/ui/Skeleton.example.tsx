// @ts-nocheck
/**
 * Skeleton Component Examples
 *
 * This file demonstrates various use cases for the Skeleton loader components.
 * Copy these examples into your components to show loading states.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import {
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonList,
  SkeletonButton,
} from './Skeleton';
import { spacing, colors } from '../../constants/designSystem';

export function SkeletonExamples() {
  return (
    <ScrollView style={styles.container}>
      {/* Basic Skeleton Box */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>Basic Skeleton Box</ThemedText>
        <SkeletonBox width={200} height={20} />
      </View>

      {/* Multiple Text Lines */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>Text Skeleton (3 lines)</ThemedText>
        <SkeletonText lines={3} />
      </View>

      {/* Circle Avatar */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>Circle Skeleton (Avatar)</ThemedText>
        <View style={styles.row}>
          <SkeletonCircle size={48} />
          <SkeletonCircle size={64} style={{ marginLeft: spacing.md }} />
          <SkeletonCircle size={80} style={{ marginLeft: spacing.md }} />
        </View>
      </View>

      {/* Card with Image */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>Card Skeleton</ThemedText>
        <SkeletonCard />
      </View>

      {/* Card without Image */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>Card Skeleton (No Image)</ThemedText>
        <SkeletonCard showImage={false} lines={2} />
      </View>

      {/* Card with Avatar */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>Card Skeleton (With Avatar)</ThemedText>
        <SkeletonCard showAvatar lines={2} imageHeight={120} />
      </View>

      {/* List Items */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>List Skeleton (With Avatars)</ThemedText>
        <SkeletonList count={4} />
      </View>

      {/* List Items with Thumbnails */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>List Skeleton (With Thumbnails)</ThemedText>
        <SkeletonList count={3} showAvatar={false} showThumbnail />
      </View>

      {/* Buttons */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>Button Skeleton</ThemedText>
        <SkeletonButton />
        <SkeletonButton width={200} height={40} style={{ marginTop: spacing.md }} />
      </View>

      {/* Custom Composition */}
      <View style={styles.section}>
        <ThemedText style={styles.title}>Custom Composition</ThemedText>
        <View style={styles.customCard}>
          <View style={styles.row}>
            <SkeletonCircle size={56} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <SkeletonBox width="70%" height={18} />
              <SkeletonBox width="50%" height={14} style={{ marginTop: spacing.xs }} />
            </View>
          </View>
          <View style={{ marginTop: spacing.md }}>
            <SkeletonText lines={2} lineHeight={14} />
          </View>
          <View style={[styles.row, { marginTop: spacing.md }]}>
            <SkeletonButton width={100} height={36} />
            <SkeletonButton width={100} height={36} style={{ marginLeft: spacing.sm }} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Example: Loading Vocabulary Card
 */
export function LoadingVocabularyCard() {
  return (
    <View style={styles.vocabCard}>
      <SkeletonBox width="100%" height={200} />
      <View style={{ marginTop: spacing.lg }}>
        <SkeletonBox width="60%" height={24} style={{ marginBottom: spacing.md }} />
        <SkeletonText lines={2} lineHeight={16} />
      </View>
      <View style={{ marginTop: spacing.xl }}>
        <SkeletonButton height={48} />
      </View>
    </View>
  );
}

/**
 * Example: Loading Lesson List
 */
export function LoadingLessonList() {
  return (
    <View>
      {Array.from({ length: 5 }).map((_, index) => (
        <View
          key={index}
          style={[styles.lessonItem, index > 0 && { marginTop: spacing.md }]}
        >
          <SkeletonBox width={60} height={60} borderRadius={12} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <SkeletonBox width="70%" height={18} />
            <SkeletonBox width="90%" height={14} style={{ marginTop: spacing.xs }} />
            <View style={[styles.row, { marginTop: spacing.sm }]}>
              <SkeletonBox width={60} height={12} />
              <SkeletonBox width={60} height={12} style={{ marginLeft: spacing.sm }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Example: Loading Profile Header
 */
export function LoadingProfileHeader() {
  return (
    <View style={styles.profileHeader}>
      <SkeletonCircle size={100} />
      <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <SkeletonBox width={150} height={24} style={{ marginBottom: spacing.xs }} />
        <SkeletonBox width={200} height={16} />
      </View>
      <View style={[styles.row, { marginTop: spacing.lg, justifyContent: 'space-around' }]}>
        <View style={{ alignItems: 'center' }}>
          <SkeletonBox width={60} height={24} style={{ marginBottom: spacing.xs }} />
          <SkeletonBox width={80} height={14} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <SkeletonBox width={60} height={24} style={{ marginBottom: spacing.xs }} />
          <SkeletonBox width={80} height={14} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <SkeletonBox width={60} height={24} style={{ marginBottom: spacing.xs }} />
          <SkeletonBox width={80} height={14} />
        </View>
      </View>
    </View>
  );
}

/**
 * Example: Loading Quiz Card
 */
export function LoadingQuizCard() {
  return (
    <View style={styles.quizCard}>
      <SkeletonBox width="80%" height={20} style={{ marginBottom: spacing.lg }} />
      <SkeletonBox width="100%" height={100} style={{ marginBottom: spacing.xl }} />

      {/* Answer options */}
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonButton
          key={index}
          height={56}
          style={index > 0 ? { marginTop: spacing.md } : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text.secondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.md,
  },
  vocabCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.lg,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: spacing.md,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.xl,
  },
  quizCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.lg,
  },
});
