/**
 * SkillCarousel - Rotating Skill Banners
 *
 * Swipeable carousel showing user's skill metrics.
 * Automatically advances every 30-60 seconds.
 * Prioritizes by weakest skill first.
 *
 * Skills: Speaking, Listening, Writing, Reading
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  PanResponder,
  Animated as RNAnimated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/designSystem';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// ============================================================================
// Types
// ============================================================================

export interface SkillScore {
  type: 'speaking' | 'listening' | 'writing' | 'reading';
  score: number; // 0-100
  label: string;
  icon: string;
  color: string;
  description: string;
}

interface SkillCarouselProps {
  skills: SkillScore[];
  onSkillPress?: (skill: SkillScore) => void;
}

// ============================================================================
// Constants
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const AUTO_ADVANCE_DELAY = Math.random() * 15000 + 30000; // 30-45s

// Skill gradients
const SKILL_GRADIENTS: Record<string, [string, string]> = {
  speaking: ['#FF6B6B', '#FF8E72'],      // Red-orange
  listening: ['#4ECDC4', '#45B7AA'],     // Teal
  writing: ['#95E1D3', '#6EE7DE'],       // Mint-cyan
  reading: ['#FFD93D', '#F5A962'],       // Yellow-orange
};

// ============================================================================
// Component
// ============================================================================

export function SkillCarousel({ skills, onSkillPress }: SkillCarouselProps) {
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const animValue = useRef(new RNAnimated.Value(0)).current;
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const panResponderRef = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, { dx }) => Math.abs(dx) > 10,
    onPanResponderRelease: (_, { vx, dx }) => {
      clearAutoAdvance();

      // Swipe threshold: 20% of card width or velocity > 0.5
      const threshold = CARD_WIDTH * 0.2;
      if (Math.abs(dx) > threshold || Math.abs(vx) > 0.5) {
        const direction = dx > 0 ? -1 : 1; // Swipe right = prev, left = next
        const newIndex = (currentIndex + direction + skills.length) % skills.length;
        handleIndexChange(newIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Reset animation
      RNAnimated.spring(animValue, {
        toValue: 0,
        useNativeDriver: false,
      }).start();

      startAutoAdvance();
    },
  })).current;

  // Sorted skills by score (weakest first)
  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => a.score - b.score);
  }, [skills]);

  // Auto-advance timer
  const startAutoAdvance = useCallback(() => {
    clearAutoAdvance();
    autoAdvanceRef.current = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % sortedSkills.length;
      handleIndexChange(nextIndex);
    }, AUTO_ADVANCE_DELAY);
  }, [currentIndex, sortedSkills.length]);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  const handleIndexChange = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    RNAnimated.timing(animValue, {
      toValue: newIndex,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animValue]);

  // Start auto-advance on mount
  useEffect(() => {
    startAutoAdvance();
    return () => clearAutoAdvance();
  }, [startAutoAdvance, clearAutoAdvance]);

  if (sortedSkills.length === 0) {
    return null;
  }

  const currentSkill = sortedSkills[currentIndex];
  const [gradStart, gradEnd] = SKILL_GRADIENTS[currentSkill.type] || ['#6366F1', '#8B5CF6'];

  // Score color
  const scoreColor = currentSkill.score >= 80
    ? colors.success.DEFAULT
    : currentSkill.score >= 60
      ? colors.accent.orange
      : colors.error.DEFAULT;

  return (
    <View style={styles.container}>
      {/* Carousel Card */}
      <View
        style={styles.cardWrapper}
        {...panResponderRef.panHandlers}
      >
        <LinearGradient
          colors={[gradStart, gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Corner Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{currentSkill.label}</Text>
          </View>

          {/* Icon + Score */}
          <View style={styles.contentWrapper}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={currentSkill.icon as any}
                size={56}
                color="white"
              />
            </View>

            <View style={styles.scoreSection}>
              <Text style={styles.scoreLabel}>Current Score</Text>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {currentSkill.score}%
              </Text>
              <Text style={styles.description}>{currentSkill.description}</Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => {
              clearAutoAdvance();
              onSkillPress?.(currentSkill);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Practice Now</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Dot Indicators + Navigation */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {sortedSkills.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
              onPress={() => {
                clearAutoAdvance();
                handleIndexChange(index);
                startAutoAdvance();
              }}
            />
          ))}
        </View>

        {/* Arrow Navigation (hidden if only 1 skill) */}
        {sortedSkills.length > 1 && (
          <View style={styles.navButtons}>
            <TouchableOpacity
              onPress={() => {
                clearAutoAdvance();
                const prev = (currentIndex - 1 + sortedSkills.length) % sortedSkills.length;
                handleIndexChange(prev);
                startAutoAdvance();
              }}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                clearAutoAdvance();
                const next = (currentIndex + 1) % sortedSkills.length;
                handleIndexChange(next);
                startAutoAdvance();
              }}
              style={styles.navButton}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: 'transparent',
  },

  cardWrapper: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },

  card: {
    width: CARD_WIDTH,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },

  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreSection: {
    flex: 1,
  },

  scoreLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },

  scoreValue: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: 'white',
    marginBottom: spacing.xs,
  },

  description: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },

  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  ctaText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: 'white',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },

  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.card,
  },

  dotActive: {
    backgroundColor: colors.primary.DEFAULT,
    width: 24,
  },

  navButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  navButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SkillCarousel;
