/**
 * CalibratorBanner Examples
 *
 * Example usage of the CalibratorBanner component in different states.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { CalibratorBanner } from './CalibratorBanner';
import { colors, spacing } from '@/constants/designSystem';

export function CalibratorBannerExamples() {
  const handleStart = () => {
    console.log('Starting calibration assessment...');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Locked State */}
      <View style={styles.section}>
        <CalibratorBanner
          sectionNumber={1}
          status="locked"
          onStart={handleStart}
        />
      </View>

      {/* Ready State */}
      <View style={styles.section}>
        <CalibratorBanner
          sectionNumber={2}
          status="ready"
          onStart={handleStart}
        />
      </View>

      {/* Completed State */}
      <View style={styles.section}>
        <CalibratorBanner
          sectionNumber={3}
          status="completed"
          onStart={handleStart}
          completedAt="2025-12-10T14:30:00Z"
          score={85}
        />
      </View>

      {/* Completed State - Perfect Score */}
      <View style={styles.section}>
        <CalibratorBanner
          sectionNumber={4}
          status="completed"
          onStart={handleStart}
          completedAt="2025-12-11T09:15:00Z"
          score={100}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingVertical: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
});

export default CalibratorBannerExamples;
