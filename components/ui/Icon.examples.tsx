/**
 * Icon System - Usage Examples
 *
 * This file demonstrates how to use the Icon and IconButton components
 * throughout the Vox Language App.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/designSystem';

/**
 * Example 1: Basic Icon Usage
 */
export function BasicIconExample() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Basic Icons</Text>

      {/* Using size variants */}
      <View style={styles.row}>
        <Icon name="checkmark" size="sm" />
        <Icon name="checkmark" size="md" />
        <Icon name="checkmark" size="lg" />
        <Icon name="checkmark" size="xl" />
      </View>

      {/* Using color variants */}
      <View style={styles.row}>
        <Icon name="heart" size="lg" color="error" />
        <Icon name="checkmark-circle" size="lg" color="success" />
        <Icon name="warning" size="lg" color="warning" />
        <Icon name="info" size="lg" color="primary" />
      </View>
    </View>
  );
}

/**
 * Example 2: Common Icons
 */
export function CommonIconsExample() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Common Icons</Text>

      {/* Media controls */}
      <View style={styles.row}>
        <Icon name="play" size="lg" color="primary" />
        <Icon name="pause" size="lg" color="primary" />
        <Icon name="stop" size="lg" color="primary" />
        <Icon name="mic" size="lg" color="error" />
        <Icon name="volume-high" size="lg" color="secondary" />
      </View>

      {/* Navigation */}
      <View style={styles.row}>
        <Icon name="chevron-back" size="lg" />
        <Icon name="chevron-forward" size="lg" />
        <Icon name="chevron-up" size="lg" />
        <Icon name="chevron-down" size="lg" />
      </View>

      {/* Actions */}
      <View style={styles.row}>
        <Icon name="checkmark" size="lg" color="success" />
        <Icon name="close" size="lg" color="error" />
        <Icon name="add" size="lg" color="primary" />
        <Icon name="trash" size="lg" color="error" />
      </View>
    </View>
  );
}

/**
 * Example 3: IconButton Usage
 */
export function IconButtonExample() {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Icon Buttons</Text>

      {/* Default variant */}
      <View style={styles.row}>
        <IconButton
          name="settings"
          onPress={handlePress}
          accessibilityLabel="Settings"
        />
        <IconButton
          name="search"
          onPress={handlePress}
          accessibilityLabel="Search"
        />
        <IconButton
          name="menu"
          onPress={handlePress}
          accessibilityLabel="Menu"
        />
      </View>

      {/* Filled variant */}
      <View style={styles.row}>
        <IconButton
          name="play"
          variant="filled"
          backgroundColor="primary"
          onPress={handlePress}
          accessibilityLabel="Play"
        />
        <IconButton
          name="mic"
          variant="filled"
          backgroundColor="error"
          onPress={handlePress}
          accessibilityLabel="Record"
        />
        <IconButton
          name="heart"
          variant="filled"
          backgroundColor="accent-pink"
          onPress={handlePress}
          accessibilityLabel="Like"
        />
      </View>

      {/* Outlined variant */}
      <View style={styles.row}>
        <IconButton
          name="checkmark"
          variant="outlined"
          borderColor="success"
          color="success"
          onPress={handlePress}
          accessibilityLabel="Confirm"
        />
        <IconButton
          name="close"
          variant="outlined"
          borderColor="error"
          color="error"
          onPress={handlePress}
          accessibilityLabel="Close"
        />
      </View>

      {/* Ghost variant */}
      <View style={styles.row}>
        <IconButton
          name="info"
          variant="ghost"
          color="primary"
          onPress={handlePress}
          accessibilityLabel="Information"
        />
        <IconButton
          name="help"
          variant="ghost"
          color="secondary"
          onPress={handlePress}
          accessibilityLabel="Help"
        />
      </View>

      {/* Different shapes */}
      <View style={styles.row}>
        <IconButton
          name="star"
          shape="circle"
          variant="filled"
          backgroundColor="warning"
          onPress={handlePress}
          accessibilityLabel="Star"
        />
        <IconButton
          name="star"
          shape="rounded"
          variant="filled"
          backgroundColor="warning"
          onPress={handlePress}
          accessibilityLabel="Star"
        />
        <IconButton
          name="star"
          shape="square"
          variant="filled"
          backgroundColor="warning"
          onPress={handlePress}
          accessibilityLabel="Star"
        />
      </View>
    </View>
  );
}

/**
 * Example 4: Real-World Use Cases
 */
export function RealWorldExamples() {
  const handleBack = () => console.log('Go back');
  const handlePlay = () => console.log('Play audio');
  const handleFavorite = () => console.log('Toggle favorite');
  const handleSettings = () => console.log('Open settings');

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Real-World Examples</Text>

      {/* Header with back button */}
      <View style={styles.header}>
        <IconButton
          name="chevron-back"
          onPress={handleBack}
          variant="ghost"
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Lesson Title</Text>
        <IconButton
          name="settings"
          onPress={handleSettings}
          variant="ghost"
          accessibilityLabel="Settings"
        />
      </View>

      {/* Audio player controls */}
      <View style={styles.playerControls}>
        <IconButton
          name="play-circle"
          size="xl"
          variant="filled"
          backgroundColor="primary"
          onPress={handlePlay}
          accessibilityLabel="Play audio"
        />
        <IconButton
          name="heart-outline"
          variant="ghost"
          color="text-secondary"
          onPress={handleFavorite}
          accessibilityLabel="Add to favorites"
        />
      </View>

      {/* Status indicators */}
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Icon name="checkmark-circle" size="md" color="success" />
          <Text style={styles.statusText}>Completed</Text>
        </View>
        <View style={styles.statusItem}>
          <Icon name="flame" size="md" color="warning" />
          <Text style={styles.statusText}>5 day streak</Text>
        </View>
        <View style={styles.statusItem}>
          <Icon name="trophy" size="md" color="accent-cyan" />
          <Text style={styles.statusText}>Level 3</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
