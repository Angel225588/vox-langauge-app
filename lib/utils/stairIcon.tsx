/**
 * Stair Icon Renderer
 *
 * Renders either an Ionicon (if value is a valid icon name)
 * or falls back to emoji text. This bridges the migration from
 * emoji-based stairs to icon-based stairs.
 */

import React from 'react';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/designSystem';

// Common Ionicon names used in stairs
const KNOWN_ICONS = new Set([
  'hand-left-outline', 'briefcase-outline', 'bar-chart-outline',
  'shield-checkmark-outline', 'cash-outline', 'chatbubbles-outline',
  'globe-outline', 'megaphone-outline', 'medkit-outline',
  'school-outline', 'airplane-outline', 'restaurant-outline',
  'people-outline', 'trophy', 'flame', 'library', 'rocket',
  'book-outline', 'document-text-outline', 'language-outline',
]);

/**
 * Check if a string is an Ionicon name (contains a hyphen or is a known icon).
 */
function isIconName(value: string): boolean {
  return KNOWN_ICONS.has(value) || (value.includes('-') && !value.includes(' '));
}

interface StairIconProps {
  value: string;
  size?: number;
  color?: string;
  fontSize?: number;
}

export function StairIcon({ value, size = 24, color = colors.primary.DEFAULT, fontSize = 24 }: StairIconProps) {
  if (isIconName(value)) {
    return <Ionicons name={value as any} size={size} color={color} />;
  }
  return <Text style={{ fontSize }}>{value}</Text>;
}
