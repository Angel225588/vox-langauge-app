/**
 * GlassCard — Frosted glass card using design system tokens.
 * Wraps BlurView + semi-transparent surface + luminous border.
 *
 * Variants:
 * - default:    Standard glass card (most screens)
 * - elevated:   Modals, sheets, lesson cards
 * - subtle:     Background panels, grouped sections
 * - accent:     Blue-tinted for selected/active states
 * - onboarding: Extra prominent for onboarding steps
 */

import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass, borderRadius } from '@/constants/designSystem';

type GlassVariant = 'default' | 'elevated' | 'subtle' | 'accent' | 'onboarding';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: GlassVariant;
  /** Override border radius. Default: borderRadius.xl (24) */
  radius?: number;
  /** Additional styles applied to the outer container */
  style?: ViewStyle;
  /** Whether to show the shadow. Default: true */
  shadow?: boolean;
  /** Whether this card is in a selected/active state */
  selected?: boolean;
}

const VARIANT_MAP = {
  default: glass.card.default,
  elevated: glass.card.elevated,
  subtle: glass.card.subtle,
  accent: glass.card.accent,
  onboarding: glass.card.onboarding,
};

const SHADOW_MAP: Record<string, ViewStyle> = {
  default: glass.shadow.sm,
  elevated: glass.shadow.md,
  subtle: {},
  accent: glass.shadow.glow,
  onboarding: glass.shadow.md,
};

export function GlassCard({
  children,
  variant = 'default',
  radius = borderRadius.xl,
  style,
  shadow = true,
  selected = false,
}: GlassCardProps) {
  const preset = selected ? glass.card.accent : VARIANT_MAP[variant];
  const shadowStyle = shadow ? (selected ? glass.shadow.glow : SHADOW_MAP[variant]) : {};

  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
        },
        shadowStyle as ViewStyle,
        style,
      ]}
    >
      {/* Blur backdrop */}
      <BlurView
        intensity={preset.blur}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />

      {/* Surface tint + border */}
      <View
        style={[
          {
            backgroundColor: preset.backgroundColor,
            borderColor: preset.borderColor,
            borderWidth: preset.borderWidth,
            borderRadius: radius,
          },
          // Inner highlight on top edge for elevated/onboarding
          (variant === 'elevated' || variant === 'onboarding') && {
            borderTopColor: glass.innerHighlight.top.borderTopColor,
            borderTopWidth: glass.innerHighlight.top.borderTopWidth,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
