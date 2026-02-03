/**
 * AudioButton - Usage Examples
 *
 * Demonstrates how to use the AudioButton component across the app.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AudioButton } from './AudioButton';
import { colors, spacing, typography } from '@/constants/designSystem';

export function AudioButtonExamples() {
  const [isPlayingNormal, setIsPlayingNormal] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayNormal = () => {
    setIsPlayingNormal(!isPlayingNormal);
    // Simulate audio playback
    setTimeout(() => setIsPlayingNormal(false), 2000);
  };

  const handlePlaySlow = () => {
    setIsPlayingSlow(!isPlayingSlow);
    // Simulate audio playback
    setTimeout(() => setIsPlayingSlow(false), 3000);
  };

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AudioButton Examples</Text>

      {/* Normal Play Button */}
      <View style={styles.section}>
        <Text style={styles.label}>Normal Speed</Text>
        <View style={styles.row}>
          <AudioButton
            variant="play"
            size="sm"
            isPlaying={isPlayingNormal}
            onPress={handlePlayNormal}
          />
          <AudioButton
            variant="play"
            size="md"
            isPlaying={isPlayingNormal}
            onPress={handlePlayNormal}
          />
          <AudioButton
            variant="play"
            size="lg"
            isPlaying={isPlayingNormal}
            onPress={handlePlayNormal}
          />
        </View>
      </View>

      {/* Slow Play Button */}
      <View style={styles.section}>
        <Text style={styles.label}>Slow Speed (0.5x)</Text>
        <View style={styles.row}>
          <AudioButton
            variant="slow"
            size="sm"
            isPlaying={isPlayingSlow}
            onPress={handlePlaySlow}
          />
          <AudioButton
            variant="slow"
            size="md"
            isPlaying={isPlayingSlow}
            onPress={handlePlaySlow}
          />
          <AudioButton
            variant="slow"
            size="lg"
            isPlaying={isPlayingSlow}
            onPress={handlePlaySlow}
          />
        </View>
      </View>

      {/* Loading State */}
      <View style={styles.section}>
        <Text style={styles.label}>Loading State</Text>
        <View style={styles.row}>
          <AudioButton
            variant="play"
            size="sm"
            isLoading={isLoading}
            onPress={handleLoadingDemo}
          />
          <AudioButton
            variant="play"
            size="md"
            isLoading={isLoading}
            onPress={handleLoadingDemo}
          />
          <AudioButton
            variant="play"
            size="lg"
            isLoading={isLoading}
            onPress={handleLoadingDemo}
          />
        </View>
      </View>

      {/* Disabled State */}
      <View style={styles.section}>
        <Text style={styles.label}>Disabled</Text>
        <View style={styles.row}>
          <AudioButton
            variant="play"
            size="sm"
            disabled
            onPress={() => {}}
          />
          <AudioButton
            variant="play"
            size="md"
            disabled
            onPress={() => {}}
          />
          <AudioButton
            variant="play"
            size="lg"
            disabled
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Real-world Example */}
      <View style={styles.section}>
        <Text style={styles.label}>Audio Controls (Real-world Example)</Text>
        <View style={styles.audioControls}>
          <AudioButton
            variant="play"
            size="md"
            isPlaying={isPlayingNormal}
            onPress={handlePlayNormal}
          />
          <AudioButton
            variant="slow"
            size="md"
            isPlaying={isPlayingSlow}
            onPress={handlePlaySlow}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  label: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: 24,
    gap: spacing.lg,
    alignSelf: 'flex-start',
  },
});
