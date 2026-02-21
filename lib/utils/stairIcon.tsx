/**
 * Stair Icon Renderer
 *
 * Renders either an Ionicon (if value is a valid icon name)
 * or falls back to emoji text. Only icons in the KNOWN_ICONS
 * set are rendered — unknown names get a fallback icon.
 */

import React from 'react';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/designSystem';

// Verified Ionicons names used across stair cards and scenario mappings.
// Every entry here is a real Ionicons glyph — no guessing.
const KNOWN_ICONS = new Set([
  // General
  'chatbubble-outline', 'chatbubbles-outline', 'chatbubble-ellipses-outline',
  'chatbox-outline', 'call-outline', 'mic-outline', 'videocam-outline',
  'mail-outline', 'send-outline',
  // Professional
  'briefcase-outline', 'business-outline', 'people-outline',
  'people-circle-outline', 'person-add-outline',
  // Medical
  'medkit-outline', 'heart-outline', 'flask-outline', 'fitness-outline',
  // Navigation / Places
  'globe-outline', 'earth-outline', 'map-outline', 'compass-outline',
  'airplane-outline', 'bed-outline', 'restaurant-outline', 'cart-outline',
  'storefront-outline',
  // Documents / Education
  'document-outline', 'document-text-outline', 'clipboard-outline',
  'book-outline', 'school-outline', 'create-outline', 'pencil-outline',
  // Legal / Government
  'hammer-outline', 'shield-outline', 'shield-checkmark-outline',
  'flag-outline', 'ribbon-outline', 'newspaper-outline',
  // Tech
  'code-slash-outline', 'git-network-outline', 'terminal-outline',
  // Creative
  'color-palette-outline', 'brush-outline', 'film-outline', 'bulb-outline',
  // Data / Analytics
  'analytics-outline', 'bar-chart-outline', 'easel-outline',
  // Finance
  'cash-outline', 'card-outline', 'pricetags-outline', 'wallet-outline',
  // Actions
  'hand-left-outline', 'swap-horizontal-outline', 'megaphone-outline',
  'rocket-outline', 'search-outline', 'star-outline', 'warning-outline',
  'alert-circle-outline', 'calendar-outline', 'recording-outline',
  // Rewards
  'trophy', 'flame', 'library',
  // Staircase special
  'refresh-outline', 'lock-closed-outline',
]);

// Icon names from SCENARIO_EMOJIS that aren't real Ionicons — map to valid alternatives
const ICON_ALIASES: Record<string, string> = {
  'handshake-outline': 'people-outline',
  'podium-outline': 'easel-outline',
  'chatbox-outline': 'chatbubble-outline',
  'code-slash': 'code-slash-outline',
};

const FALLBACK_ICON = 'chatbubble-outline';

function resolveIcon(value: string): string | null {
  if (KNOWN_ICONS.has(value)) return value;
  if (ICON_ALIASES[value]) return ICON_ALIASES[value];
  return null;
}

interface StairIconProps {
  value: string;
  size?: number;
  color?: string;
  fontSize?: number;
}

export function StairIcon({ value, size = 24, color = '#FFFFFF', fontSize = 24 }: StairIconProps) {
  const resolved = resolveIcon(value);

  if (resolved) {
    return <Ionicons name={resolved as any} size={size} color={color} />;
  }

  // If it looks like an icon name but isn't known, use fallback
  if (value.includes('-') && !value.includes(' ')) {
    return <Ionicons name={FALLBACK_ICON as any} size={size} color={color} />;
  }

  // Otherwise it's an emoji
  return <Text style={{ fontSize, color }}>{value}</Text>;
}
