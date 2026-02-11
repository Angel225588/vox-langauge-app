/**
 * SettingRow - Reusable row for settings/preferences.
 * Layout: [colored icon circle] Label --- Value [chevron]
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

export interface SettingRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  isLast?: boolean;
  danger?: boolean;
}

export function SettingRow({
  iconName,
  label,
  value,
  onPress,
  color = colors.primary.DEFAULT,
  isLast = false,
  danger = false,
}: SettingRowProps) {
  const resolvedColor = danger ? colors.error.DEFAULT : color;

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: resolvedColor + '18' }]}>
        <Ionicons name={iconName} size={18} color={resolvedColor} />
      </View>
      <Text style={[styles.label, danger && { color: colors.error.DEFAULT }]}>
        {label}
      </Text>
      <View style={styles.rightSide}>
        {value && (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        )}
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.text.tertiary}
            style={{ marginLeft: spacing.sm }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.overlay.light5,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  label: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '40%',
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});

export default SettingRow;
