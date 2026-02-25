/**
 * RetentionChart — SVG line/area chart with animated draw-in.
 *
 * Shows weekly average overall score over the last 4-8 weeks.
 * Built with react-native-svg (already installed).
 * Area fill: LinearGradient from Electric Blue → transparent.
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@/constants/designSystem';

interface WeeklyScore {
  weekLabel: string;
  avg: number;
}

interface Props {
  weeklyScores: WeeklyScore[];
}

const CHART_HEIGHT = 120;
const CHART_PADDING_TOP = 10;
const CHART_PADDING_BOTTOM = 24;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function RetentionChart({ weeklyScores }: Props) {
  // Filter to only show weeks with data, or show all for context
  const dataPoints = weeklyScores.length > 0 ? weeklyScores : [];
  const hasData = dataPoints.some(d => d.avg > 0);

  // Find current value and trend
  const currentValue = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].avg : 0;
  const prevValue = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2].avg : 0;
  const delta = currentValue - prevValue;

  // Animation
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [weeklyScores]);

  if (!hasData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Score Trend</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Complete a few sessions to see your progress trend
          </Text>
        </View>
      </View>
    );
  }

  // Build SVG path
  const chartWidth = 280;
  const drawHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  const maxScore = 100;

  const points = dataPoints.map((d, i) => {
    const x = dataPoints.length > 1
      ? (i / (dataPoints.length - 1)) * chartWidth
      : chartWidth / 2;
    const y = CHART_PADDING_TOP + drawHeight - (d.avg / maxScore) * drawHeight;
    return { x, y };
  });

  // Smooth bezier curve
  const linePath = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${path} C ${cpX} ${prev.y} ${cpX} ${point.y} ${point.x} ${point.y}`;
  }, '');

  // Area path (line + close to bottom)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT - CHART_PADDING_BOTTOM} L ${points[0].x} ${CHART_HEIGHT - CHART_PADDING_BOTTOM} Z`;

  // Animated stroke dashoffset
  const pathLength = chartWidth * 2; // Approximate
  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - progress.value),
  }));

  const animatedAreaProps = useAnimatedProps(() => ({
    opacity: progress.value,
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Score Trend</Text>
        <View style={styles.valueRow}>
          <Text style={styles.currentValue}>{currentValue}</Text>
          {delta !== 0 && (
            <Text style={[styles.delta, { color: delta > 0 ? colors.success.DEFAULT : colors.error.DEFAULT }]}>
              {delta > 0 ? '+' : ''}{delta}
            </Text>
          )}
        </View>
      </View>

      {/* Chart */}
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary.DEFAULT} stopOpacity="0.3" />
            <Stop offset="1" stopColor={colors.primary.DEFAULT} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        <AnimatedPath
          d={areaPath}
          fill="url(#areaGrad)"
          animatedProps={animatedAreaProps}
        />

        {/* Line */}
        <AnimatedPath
          d={linePath}
          stroke={colors.primary.DEFAULT}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          animatedProps={animatedLineProps}
        />

        {/* End dot */}
        {points.length > 0 && (
          <Circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={4}
            fill={colors.primary.DEFAULT}
            stroke={colors.background.primary}
            strokeWidth={2}
          />
        )}
      </Svg>

      {/* Week labels */}
      <View style={styles.labels}>
        {dataPoints.map((d, i) => (
          <Text
            key={i}
            style={[
              styles.weekLabel,
              i === dataPoints.length - 1 && { color: colors.text.secondary },
            ]}
          >
            {d.weekLabel}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currentValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  delta: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  weekLabel: {
    fontSize: 9,
    color: colors.text.disabled,
    fontWeight: typography.fontWeight.medium,
  },
  emptyState: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
    textAlign: 'center',
  },
});
