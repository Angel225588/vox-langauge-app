/**
 * Skill Currency Icons
 *
 * Three specialized currency icons for different language skills:
 * - FluencyFlame: Speaking & Pronunciation (Coral/Orange)
 * - ComprehensionCrystal: Listening & Reading (Teal/Cyan)
 * - ExpressionEmber: Writing & Production (Violet/Purple)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { rewardCurrencies, animation } from '@/constants/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);

export type SkillIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SkillType = 'fluency' | 'comprehension' | 'expression';

export interface SkillCurrencyIconProps {
  type: SkillType;
  size?: SkillIconSize | number;
  animated?: boolean;
  glowing?: boolean;
}

const SIZE_MAP: Record<SkillIconSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

// Colors sourced from design system for consistency
const SKILL_COLORS = {
  fluency: {
    start: rewardCurrencies.fluency.primary,
    end: rewardCurrencies.fluency.secondary,
    glow: rewardCurrencies.fluency.glow,
    accent: rewardCurrencies.fluency.accent,
  },
  comprehension: {
    start: rewardCurrencies.comprehension.primary,
    end: rewardCurrencies.comprehension.secondary,
    glow: rewardCurrencies.comprehension.glow,
    accent: rewardCurrencies.comprehension.accent,
  },
  expression: {
    start: rewardCurrencies.expression.primary,
    end: rewardCurrencies.expression.secondary,
    glow: rewardCurrencies.expression.glow,
    accent: rewardCurrencies.expression.accent,
  },
};

// Accessibility descriptions for each skill type
const SKILL_DESCRIPTIONS = {
  fluency: 'Flame with sound waves - earned from speaking and pronunciation practice',
  comprehension: 'Crystal with ear symbol - earned from listening and reading practice',
  expression: 'Quill pen with spark - earned from writing and production practice',
};

// ============================================================================
// FLUENCY FLAME - Speaking & Pronunciation
// ============================================================================

function FluencyFlameIcon({ size, colorScheme }: { size: number; colorScheme: typeof SKILL_COLORS.fluency }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityLabel={`Fluency Flame - ${SKILL_DESCRIPTIONS.fluency}`}
    >
      <Defs>
        <LinearGradient id="fluencyGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor={colorScheme.start} />
          <Stop offset="100%" stopColor={colorScheme.end} />
        </LinearGradient>
        <LinearGradient id="fluencyInner" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor={colorScheme.end} />
          <Stop offset="100%" stopColor={colorScheme.accent} />
        </LinearGradient>
      </Defs>

      {/* Outer flame shape */}
      <Path
        d="M32 4
           C38 12 48 20 48 32
           C48 44 40 56 32 60
           C24 56 16 44 16 32
           C16 20 26 12 32 4"
        fill="url(#fluencyGradient)"
      />

      {/* Inner flame */}
      <Path
        d="M32 16
           C36 22 42 28 42 36
           C42 44 38 52 32 54
           C26 52 22 44 22 36
           C22 28 28 22 32 16"
        fill="url(#fluencyInner)"
        opacity="0.8"
      />

      {/* Sound wave lines inside flame */}
      <G stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" fill="none">
        <Path d="M28 34 Q32 30 36 34" />
        <Path d="M26 40 Q32 34 38 40" />
        <Path d="M24 46 Q32 38 40 46" />
      </G>

      {/* Core glow */}
      <Circle cx="32" cy="44" r="4" fill="white" opacity="0.6" />
    </Svg>
  );
}

// ============================================================================
// COMPREHENSION CRYSTAL - Listening & Reading
// ============================================================================

function ComprehensionCrystalIcon({ size, colorScheme }: { size: number; colorScheme: typeof SKILL_COLORS.comprehension }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityLabel={`Comprehension Crystal - ${SKILL_DESCRIPTIONS.comprehension}`}
    >
      <Defs>
        <LinearGradient id="compGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colorScheme.start} />
          <Stop offset="100%" stopColor={colorScheme.end} />
        </LinearGradient>
        <LinearGradient id="compShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="white" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Diamond/crystal shape */}
      <Path
        d="M32 4 L52 24 L52 40 L32 60 L12 40 L12 24 Z"
        fill="url(#compGradient)"
        stroke={colorScheme.start}
        strokeWidth="1"
      />

      {/* Inner facets */}
      <Path
        d="M32 12 L44 24 L44 36 L32 48 L20 36 L20 24 Z"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />

      {/* Ear/listening symbol */}
      <G stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
        {/* Ear outline */}
        <Path d="M28 26 Q22 32 28 40 Q32 44 36 40" />
        {/* Sound waves entering */}
        <Path d="M38 28 Q42 32 38 36" />
        <Path d="M42 24 Q48 32 42 40" />
      </G>

      {/* Shine overlay */}
      <Path
        d="M32 4 L52 24 L32 24 L12 24 Z"
        fill="url(#compShine)"
      />
    </Svg>
  );
}

// ============================================================================
// EXPRESSION EMBER - Writing & Production
// ============================================================================

function ExpressionEmberIcon({ size, colorScheme }: { size: number; colorScheme: typeof SKILL_COLORS.expression }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityLabel={`Expression Ember - ${SKILL_DESCRIPTIONS.expression}`}
    >
      <Defs>
        <LinearGradient id="exprGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={colorScheme.start} />
          <Stop offset="100%" stopColor={colorScheme.end} />
        </LinearGradient>
        <LinearGradient id="sparkGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#FFF8DC" />
        </LinearGradient>
      </Defs>

      {/* Pen/quill body */}
      <Path
        d="M44 8 L56 20 L24 52 L12 56 L16 44 Z"
        fill="url(#exprGradient)"
        stroke={colorScheme.start}
        strokeWidth="1"
      />

      {/* Pen nib detail */}
      <Path
        d="M20 48 L24 52 L12 56 L16 44 Z"
        fill={colorScheme.start}
      />

      {/* Writing line */}
      <Path
        d="M14 54 L10 58"
        stroke={colorScheme.end}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Spark at tip */}
      <G>
        {/* Main spark */}
        <Circle cx="14" cy="54" r="4" fill="url(#sparkGradient)" />
        {/* Spark rays */}
        <G stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round">
          <Path d="M14 48 L14 44" />
          <Path d="M8 54 L4 54" />
          <Path d="M10 50 L6 46" />
          <Path d="M10 58 L6 62" />
        </G>
      </G>

      {/* Highlight on pen */}
      <Path
        d="M42 12 L50 20 L30 40"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Inner pen detail */}
      <Path
        d="M38 16 L48 26"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SkillCurrencyIcon({
  type,
  size = 'md',
  animated = false,
  glowing = false,
}: SkillCurrencyIconProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size];
  const colorScheme = SKILL_COLORS[type];

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      const flickerDuration = animation.duration.iconFlicker;
      const shimmerDuration = animation.duration.iconShimmer;

      if (type === 'fluency') {
        // Flame flicker - uses iconFlicker duration
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: flickerDuration }),
            withTiming(0.95, { duration: flickerDuration * 0.8 }),
            withTiming(1.02, { duration: flickerDuration }),
            withTiming(1, { duration: flickerDuration })
          ),
          -1,
          false
        );
      } else if (type === 'comprehension') {
        // Crystal shimmer - uses iconShimmer duration
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: shimmerDuration }),
            withTiming(1, { duration: shimmerDuration })
          ),
          -1,
          false
        );
      } else {
        // Pen spark - uses iconFlicker for micro-movements
        rotation.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: flickerDuration * 0.8 }),
            withTiming(5, { duration: flickerDuration * 0.8 }),
            withTiming(0, { duration: flickerDuration * 0.8 })
          ),
          -1,
          false
        );
      }
    }
  }, [animated, type]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: type === 'comprehension' ? opacity.value : 1,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: type === 'comprehension' ? opacity.value : 1,
  }));

  const renderIcon = () => {
    switch (type) {
      case 'fluency':
        return <FluencyFlameIcon size={pixelSize} colorScheme={colorScheme} />;
      case 'comprehension':
        return <ComprehensionCrystalIcon size={pixelSize} colorScheme={colorScheme} />;
      case 'expression':
        return <ExpressionEmberIcon size={pixelSize} colorScheme={colorScheme} />;
    }
  };

  return (
    <AnimatedView style={[styles.container, animatedStyle, { width: pixelSize, height: pixelSize }]}>
      {/* Glow effect - sized from design system */}
      {glowing && (
        <AnimatedView
          style={[
            styles.glow,
            glowAnimatedStyle,
            {
              width: pixelSize * rewardCurrencies.glowSize.multiplier,
              height: pixelSize * rewardCurrencies.glowSize.multiplier,
              borderRadius: pixelSize * rewardCurrencies.glowSize.multiplier * 0.5,
              backgroundColor: colorScheme.glow,
            },
          ]}
        />
      )}

      {renderIcon()}
    </AnimatedView>
  );
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export function FluencyFlame(props: Omit<SkillCurrencyIconProps, 'type'>) {
  return <SkillCurrencyIcon {...props} type="fluency" />;
}

export function ComprehensionCrystal(props: Omit<SkillCurrencyIconProps, 'type'>) {
  return <SkillCurrencyIcon {...props} type="comprehension" />;
}

export function ExpressionEmber(props: Omit<SkillCurrencyIconProps, 'type'>) {
  return <SkillCurrencyIcon {...props} type="expression" />;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
  },
});

export default SkillCurrencyIcon;
