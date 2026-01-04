/**
 * FeedbackSection Component
 *
 * Collapsible section with header and animated expand/collapse.
 * Used in all practice feedback screens.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// =============================================================================
// Types
// =============================================================================

export interface FeedbackSectionProps {
  /** Emoji icon for section */
  icon: string;
  /** Section title */
  title: string;
  /** Optional badge count */
  badge?: number;
  /** Whether section is expanded */
  expanded: boolean;
  /** Toggle callback */
  onToggle: () => void;
  /** Content to show when expanded */
  children: React.ReactNode;
  /** Optional accent color for badge */
  badgeColor?: string;
}

// =============================================================================
// Component
// =============================================================================

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  icon,
  title,
  badge,
  expanded,
  onToggle,
  children,
  badgeColor = colors.primary.DEFAULT,
}) => {
  const height = useSharedValue(expanded ? 1 : 0);
  const rotation = useSharedValue(expanded ? 180 : 0);

  useEffect(() => {
    height.value = withSpring(expanded ? 1 : 0, { damping: 15, stiffness: 120 });
    rotation.value = withSpring(expanded ? 180 : 0, { damping: 15, stiffness: 120 });
  }, [expanded]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    maxHeight: interpolate(height.value, [0, 1], [0, 600]),
    marginTop: interpolate(height.value, [0, 1], [0, spacing.md]),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityLabel={`${title}. ${expanded ? 'Collapse' : 'Expand'} section`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
          {badge !== undefined && badge > 0 && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.content, contentStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    overflow: 'hidden',
  },
});

export default FeedbackSection;
