/**
 * StageIndicator — 4-dot progress indicator for listening stages
 *
 * Shows completed (solid teal), active (animated teal gradient pill),
 * and upcoming (gray) dots with a label below.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LISTENING, STAGE_LABELS } from './theme';

interface StageIndicatorProps {
  /** Current stage number (1-4) */
  currentStage: number;
  /** Total stages — defaults to 4 */
  totalStages?: number;
}

const DOT_SPRING = { damping: 15, stiffness: 150 };
const DOT_SIZE = 8;
const ACTIVE_WIDTH = 24;

export default function StageIndicator({
  currentStage,
  totalStages = 4,
}: StageIndicatorProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={`Stage ${currentStage} of ${totalStages}, ${STAGE_LABELS[currentStage - 1]}`}
    >
      <View style={styles.dotRow}>
        {Array.from({ length: totalStages }, (_, i) => {
          const stageNum = i + 1;
          if (stageNum < currentStage) {
            // Completed
            return (
              <View
                key={i}
                style={styles.dotCompleted}
                accessibilityLabel={`Stage ${stageNum}, ${STAGE_LABELS[i]}, completed`}
              />
            );
          }
          if (stageNum === currentStage) {
            // Active — animated pill with gradient
            return <ActiveDot key={i} index={i} />;
          }
          // Upcoming
          return (
            <View
              key={i}
              style={styles.dot}
              accessibilityLabel={`Stage ${stageNum}, ${STAGE_LABELS[i]}, upcoming`}
            />
          );
        })}
      </View>

      <Animated.Text
        entering={FadeIn.duration(300)}
        key={currentStage}
        style={styles.label}
      >
        <Text style={styles.labelStageNum}>Stage {currentStage}: </Text>
        {STAGE_LABELS[currentStage - 1]}
      </Animated.Text>
    </View>
  );
}

/** Animated active dot that expands from 8 to 24px */
function ActiveDot({ index }: { index: number }) {
  const width = useSharedValue(DOT_SIZE);

  useEffect(() => {
    width.value = withSpring(ACTIVE_WIDTH, DOT_SPRING);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    overflow: 'hidden' as const,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      accessibilityLabel={`Stage ${index + 1}, ${STAGE_LABELS[index]}, current`}
    >
      <LinearGradient
        colors={LISTENING.tealGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.dotActiveGradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: LISTENING.gray,
  },
  dotCompleted: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: LISTENING.teal,
  },
  dotActiveGradient: {
    flex: 1,
    borderRadius: DOT_SIZE / 2,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: LISTENING.textSecondary,
    textAlign: 'center',
  },
  labelStageNum: {
    color: LISTENING.teal,
    fontWeight: '700',
  },
});
