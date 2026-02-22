/**
 * GlassBackground — Ambient gradient background for glassmorphic screens.
 * Replaces CometBackground with a calmer, premium feel.
 * Subtle radial glow that shifts between deep blue and muted purple.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/designSystem';

interface GlassBackgroundProps {
  children: React.ReactNode;
  /** Controls intensity of the ambient glow. Default: 'medium' */
  intensity?: 'subtle' | 'medium' | 'high';
}

const GLOW_OPACITY = {
  subtle: 0.04,
  medium: 0.07,
  high: 0.12,
};

export function GlassBackground({ children, intensity = 'medium' }: GlassBackgroundProps) {
  const opacity = GLOW_OPACITY[intensity];

  return (
    <View style={styles.container}>
      {/* Base dark background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.primary }]} />

      {/* Top-right ambient glow — blue */}
      <LinearGradient
        colors={[`rgba(0, 54, 255, ${opacity})`, 'transparent']}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 0.6 }}
        style={[StyleSheet.absoluteFill]}
      />

      {/* Bottom-left ambient glow — purple */}
      <LinearGradient
        colors={[`rgba(139, 92, 246, ${opacity * 0.6})`, 'transparent']}
        start={{ x: 0.1, y: 1 }}
        end={{ x: 0.7, y: 0.3 }}
        style={[StyleSheet.absoluteFill]}
      />

      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
