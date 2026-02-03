/**
 * FormGroup Component
 *
 * Groups related form fields together with optional title,
 * description, and visual separation.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  error?: string;
  variant?: 'default' | 'card' | 'section';
  animated?: boolean;
  animationDelay?: number;
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FormGroup({
  children,
  title,
  description,
  error,
  variant = 'default',
  animated = false,
  animationDelay = 0,
  style,
}: FormGroupProps) {
  const containerStyle = [
    styles.container,
    variant === 'card' && styles.cardVariant,
    variant === 'section' && styles.sectionVariant,
    error && styles.errorState,
    style,
  ];

  const content = (
    <View style={containerStyle}>
      {/* Header */}
      {(title || description) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}

      {/* Fields */}
      <View style={styles.content}>{children}</View>

      {/* Group-level error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeInDown.delay(animationDelay).springify()}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

// ============================================================================
// ROW COMPONENT FOR HORIZONTAL FIELDS
// ============================================================================

export interface FormRowProps {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
}

export function FormRow({ children, gap = spacing.md, style }: FormRowProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <View style={[styles.row, { gap }, style]}>
      {childrenArray.map((child, index) => (
        <View key={index} style={styles.rowItem}>
          {child}
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

export interface FormDividerProps {
  label?: string;
  style?: ViewStyle;
}

export function FormDivider({ label, style }: FormDividerProps) {
  if (label) {
    return (
      <View style={[styles.dividerContainer, style]}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>{label}</Text>
        <View style={styles.dividerLine} />
      </View>
    );
  }

  return <View style={[styles.dividerFull, style]} />;
}

// ============================================================================
// FORM COMPONENT
// ============================================================================

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: () => void;
  style?: ViewStyle;
}

export function Form({ children, style }: FormProps) {
  return <View style={[styles.form, style]}>{children}</View>;
}

// ============================================================================
// FORM ACTIONS (BUTTON CONTAINER)
// ============================================================================

export interface FormActionsProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'left' | 'center' | 'right' | 'stretch';
  style?: ViewStyle;
}

export function FormActions({
  children,
  direction = 'column',
  align = 'stretch',
  style,
}: FormActionsProps) {
  const alignItems =
    align === 'left'
      ? 'flex-start'
      : align === 'right'
      ? 'flex-end'
      : align === 'center'
      ? 'center'
      : 'stretch';

  return (
    <View
      style={[
        styles.actions,
        { flexDirection: direction, alignItems },
        direction === 'row' && styles.actionsRow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Form
  form: {
    width: '100%',
  },

  // FormGroup
  container: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  cardVariant: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionVariant: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.lg,
    marginTop: spacing.md,
  },
  errorState: {
    borderColor: colors.error.DEFAULT,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  content: {
    width: '100%',
  },
  errorContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: `${colors.error.DEFAULT}15`,
    borderRadius: borderRadius.sm,
  },
  errorText: {
    color: colors.error.DEFAULT,
    fontSize: typography.fontSize.sm,
  },

  // FormRow
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  rowItem: {
    flex: 1,
  },

  // FormDivider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerLabel: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    paddingHorizontal: spacing.md,
  },
  dividerFull: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.lg,
  },

  // FormActions
  actions: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  actionsRow: {
    justifyContent: 'flex-end',
  },
});
