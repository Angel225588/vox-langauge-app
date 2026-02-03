/**
 * CalibratorBanner Interactive Demo
 *
 * Interactive demo component to test all states and transitions.
 * Can be used in app/(tabs)/icon-demo.tsx or a separate demo screen.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CalibratorBanner } from './CalibratorBanner';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';

export function CalibratorBannerDemo() {
  const [status, setStatus] = useState<'locked' | 'ready' | 'completed'>('locked');
  const [score, setScore] = useState<number>(85);
  const [completedAt, setCompletedAt] = useState<string>(new Date().toISOString());

  const handleStart = () => {
    console.log('Starting calibration assessment...');
    alert(`Status: ${status}\nAction: ${status === 'completed' ? 'Retake' : 'Start'} Assessment`);
  };

  const simulateComplete = (newScore: number) => {
    setStatus('completed');
    setScore(newScore);
    setCompletedAt(new Date().toISOString());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CalibratorBanner Demo</Text>
        <Text style={styles.subtitle}>
          Test all states and interactions
        </Text>
      </View>

      {/* Current State Display */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <Text style={styles.statusValue}>{status.toUpperCase()}</Text>
        {status === 'completed' && (
          <Text style={styles.scoreValue}>Score: {score}%</Text>
        )}
      </View>

      {/* Banner Preview */}
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Preview</Text>
        <CalibratorBanner
          sectionNumber={1}
          status={status}
          onStart={handleStart}
          completedAt={completedAt}
          score={score}
        />
      </View>

      {/* State Controls */}
      <View style={styles.controlsSection}>
        <Text style={styles.sectionTitle}>Change State</Text>

        <TouchableOpacity
          style={[
            styles.controlButton,
            status === 'locked' && styles.controlButtonActive,
          ]}
          onPress={() => setStatus('locked')}
        >
          <Text style={styles.controlButtonText}>🔒 Locked</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            status === 'ready' && styles.controlButtonActive,
          ]}
          onPress={() => setStatus('ready')}
        >
          <Text style={styles.controlButtonText}>🎯 Ready</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            status === 'completed' && styles.controlButtonActive,
          ]}
          onPress={() => simulateComplete(85)}
        >
          <Text style={styles.controlButtonText}>✅ Completed (85%)</Text>
        </TouchableOpacity>
      </View>

      {/* Score Controls (only for completed state) */}
      {status === 'completed' && (
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Adjust Score</Text>

          <View style={styles.scoreButtons}>
            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => simulateComplete(60)}
            >
              <Text style={styles.scoreButtonText}>60%</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => simulateComplete(75)}
            >
              <Text style={styles.scoreButtonText}>75%</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => simulateComplete(85)}
            >
              <Text style={styles.scoreButtonText}>85%</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => simulateComplete(100)}
            >
              <Text style={styles.scoreButtonText}>100%</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Info Panel */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>State Information</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Locked State</Text>
          <Text style={styles.infoText}>
            • Grayed out appearance{'\n'}
            • Shows "Complete all stairs to unlock"{'\n'}
            • Warning haptic feedback when tapped{'\n'}
            • Button is disabled
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Ready State</Text>
          <Text style={styles.infoText}>
            • Animated glow border (pulsing){'\n'}
            • Scale animation (1.0 → 1.02){'\n'}
            • Shows "Ready" badge{'\n'}
            • Gradient "Start Assessment" button{'\n'}
            • Displays skill icons
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Completed State</Text>
          <Text style={styles.infoText}>
            • Shows checkmark icon{'\n'}
            • Displays score percentage{'\n'}
            • Shows completion date{'\n'}
            • "Retake Assessment" option{'\n'}
            • No animations
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  statusCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.DEFAULT,
  },
  scoreValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success.light,
    marginTop: spacing.xs,
  },
  previewSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  controlsSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  controlButton: {
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
  },
  controlButtonActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.background.elevated,
  },
  controlButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  scoreButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginHorizontal: spacing.xs,
  },
  scoreButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  infoSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing['2xl'],
  },
  infoCard: {
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default CalibratorBannerDemo;
