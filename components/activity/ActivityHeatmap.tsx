/**
 * ActivityHeatmap — GitHub-style 90-day study heatmap.
 *
 * 13 columns (weeks) x 7 rows (Mon-Sun) View grid.
 * Color scale: Electric Blue at 5 opacity levels.
 * Touch a cell to see date + session count tooltip.
 */

import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { calculateIntensity, toDateKey, type ActivityDay } from '@/lib/metrics/activityTracker';

interface Props {
  days: Map<string, ActivityDay>;
  daysBack?: number;
}

const DAY_SIZE = 18;
const DAY_GAP = 3;
const DAY_LABELS = ['M', '', 'W', '', 'F', '', 'S'];

// Intensity → Electric Blue opacity
const INTENSITY_COLORS: Record<number, string> = {
  0: 'rgba(255, 255, 255, 0.04)',
  1: 'rgba(0, 54, 255, 0.20)',
  2: 'rgba(0, 54, 255, 0.40)',
  3: 'rgba(0, 54, 255, 0.65)',
  4: 'rgba(0, 54, 255, 0.90)',
};

export function ActivityHeatmap({ days, daysBack = 91 }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; sessions: number } | null>(null);

  // Build grid: 13 weeks x 7 days, most recent day at bottom-right
  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    const totalWeeks = 13;
    const cells: { date: string; intensity: number; sessions: number }[][] = [];
    const months: { label: string; col: number }[] = [];

    // Find the Monday of the earliest week
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - mondayOffset - (totalWeeks - 1) * 7);

    let lastMonth = -1;

    for (let week = 0; week < totalWeeks; week++) {
      const weekCells: { date: string; intensity: number; sessions: number }[] = [];

      for (let dow = 0; dow < 7; dow++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + week * 7 + dow);
        const dateKey = toDateKey(cellDate);
        const day = days.get(dateKey);
        const sessions = day?.sessions || 0;

        // Track month labels
        if (cellDate.getMonth() !== lastMonth && dow === 0) {
          lastMonth = cellDate.getMonth();
          months.push({
            label: cellDate.toLocaleDateString('en-US', { month: 'short' }),
            col: week,
          });
        }

        // Grey out future dates
        const isFuture = cellDate > endDate;

        weekCells.push({
          date: dateKey,
          intensity: isFuture ? -1 : calculateIntensity(sessions),
          sessions,
        });
      }
      cells.push(weekCells);
    }

    return { grid: cells, monthLabels: months };
  }, [days, daysBack]);

  return (
    <View style={styles.container}>
      {/* Month labels */}
      <View style={styles.monthRow}>
        <View style={{ width: 20 }} />
        {monthLabels.map((m, i) => (
          <Text
            key={`${m.label}-${i}`}
            style={[
              styles.monthLabel,
              { left: 20 + m.col * (DAY_SIZE + DAY_GAP) },
            ]}
          >
            {m.label}
          </Text>
        ))}
      </View>

      <View style={styles.gridRow}>
        {/* Day labels (Mon, Wed, Fri, Sun) */}
        <View style={styles.dayLabels}>
          {DAY_LABELS.map((label, i) => (
            <View key={i} style={{ height: DAY_SIZE, justifyContent: 'center' }}>
              <Text style={styles.dayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Heatmap grid */}
        <View style={styles.grid}>
          {grid.map((week, wi) => (
            <View key={wi} style={styles.weekColumn}>
              {week.map((cell, di) => (
                <TouchableOpacity
                  key={cell.date}
                  onPress={() => {
                    if (cell.intensity >= 0) {
                      setTooltip(
                        tooltip?.date === cell.date
                          ? null
                          : { date: cell.date, sessions: cell.sessions }
                      );
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.cell,
                      {
                        backgroundColor:
                          cell.intensity < 0
                            ? 'transparent'
                            : INTENSITY_COLORS[cell.intensity],
                      },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Tooltip */}
      {tooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {new Date(tooltip.date + 'T12:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {' \u2022 '}
            {tooltip.sessions} {tooltip.sessions === 1 ? 'session' : 'sessions'}
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[styles.legendCell, { backgroundColor: INTENSITY_COLORS[level] }]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  monthRow: {
    position: 'relative',
    height: 18,
    marginBottom: spacing.xs,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  gridRow: {
    flexDirection: 'row',
  },
  dayLabels: {
    width: 20,
    gap: DAY_GAP,
    marginRight: 2,
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.disabled,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    gap: DAY_GAP,
  },
  weekColumn: {
    gap: DAY_GAP,
  },
  cell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: 4,
  },
  tooltip: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.overlay.light10,
  },
  tooltipText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  legendText: {
    fontSize: 10,
    color: colors.text.disabled,
    fontWeight: typography.fontWeight.medium,
  },
  legendCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});
