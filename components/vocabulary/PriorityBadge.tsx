import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/designSystem';

interface PriorityBadgeProps {
  priority: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const getPriorityColor = () => {
    if (priority >= 8) {
      return {
        color: colors.error.DEFAULT,
        glow: colors.glow.error,
        label: 'Urgent',
      };
    } else if (priority >= 5) {
      return {
        color: colors.warning.DEFAULT,
        glow: 'rgba(245, 158, 11, 0.5)',
        label: 'Medium',
      };
    } else {
      return {
        color: colors.success.DEFAULT,
        glow: colors.glow.success,
        label: 'Low',
      };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          dot: { width: 8, height: 8 },
          text: { fontSize: 10 },
          container: { paddingHorizontal: 6, paddingVertical: 2 },
        };
      case 'lg':
        return {
          dot: { width: 16, height: 16 },
          text: { fontSize: 14 },
          container: { paddingHorizontal: 12, paddingVertical: 6 },
        };
      default: // md
        return {
          dot: { width: 12, height: 12 },
          text: { fontSize: 12 },
          container: { paddingHorizontal: 8, paddingVertical: 4 },
        };
    }
  };

  const priorityStyle = getPriorityColor();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container]}>
      <View
        style={[
          styles.dot,
          sizeStyles.dot,
          {
            backgroundColor: priorityStyle.color,
            shadowColor: priorityStyle.glow,
          },
        ]}
      />
      <Text style={[styles.text, sizeStyles.text, { color: priorityStyle.color }]}>
        {priority}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    fontWeight: '600',
  },
});
