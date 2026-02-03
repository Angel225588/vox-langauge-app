/**
 * FormField Component
 *
 * A wrapper component that connects form validation with NeoInput
 * and provides consistent field styling and error display.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { NeoInput, NeoTextarea } from '@/components/ui/neomorphic/NeoInput';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// TYPES
// ============================================================================

export interface FormFieldProps {
  // Field identification
  name: string;
  label?: string;
  helperText?: string;

  // Value and state
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;

  // Input configuration
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;

  // State indicators
  showSuccessState?: boolean;
  disabled?: boolean;
  required?: boolean;

  // Styling
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FormField({
  name,
  label,
  helperText,
  value,
  onChangeText,
  onBlur,
  error,
  touched = false,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  leftIcon,
  rightIcon,
  onRightIconPress,
  showSuccessState = false,
  disabled = false,
  required = false,
  style,
}: FormFieldProps) {
  // Animation for error shake
  const shakeX = useSharedValue(0);

  // Shake animation when error appears
  React.useEffect(() => {
    if (error && touched) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error, touched]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Determine if we should show error
  const showError = touched && !!error;
  const showSuccess = touched && !error && showSuccessState && value.length > 0;

  // Right icon based on state
  const stateIcon = showError ? (
    <Ionicons name="close-circle" size={16} color={colors.error.DEFAULT} />
  ) : showSuccess ? (
    <Ionicons name="checkmark-circle" size={16} color={colors.success.DEFAULT} />
  ) : rightIcon;

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {/* Label with required indicator */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input */}
      {multiline ? (
        <NeoTextarea
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
        />
      ) : (
        <NeoInput
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
          }}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          leftIcon={leftIcon}
          rightIcon={stateIcon}
          onRightIconPress={onRightIconPress}
          error={showError ? error : undefined}
          disabled={disabled}
        />
      )}

      {/* Helper text or error message */}
      <View style={styles.bottomContainer}>
        {showError ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}

        {/* Character count for fields with maxLength */}
        {maxLength && !multiline && (
          <Text style={styles.charCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// ============================================================================
// CONVENIENCE VARIANTS
// ============================================================================

/**
 * Email field with preset configuration
 */
export function EmailField(props: Omit<FormFieldProps, 'keyboardType' | 'autoCapitalize' | 'name'> & { name?: string }) {
  return (
    <FormField
      {...props}
      name={props.name || 'email'}
      keyboardType="email-address"
      autoCapitalize="none"
      leftIcon={<Ionicons name="mail-outline" size={16} color={colors.text.tertiary} />}
      placeholder={props.placeholder || 'Enter your email'}
    />
  );
}

/**
 * Password field with toggle visibility
 */
export function PasswordField(props: Omit<FormFieldProps, 'secureTextEntry' | 'name'> & { name?: string }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <FormField
      {...props}
      name={props.name || 'password'}
      secureTextEntry={!visible}
      leftIcon={<Ionicons name="lock-closed-outline" size={16} color={colors.text.tertiary} />}
      rightIcon={
        <Ionicons
          name={visible ? 'eye-outline' : 'eye-off-outline'}
          size={16}
          color={colors.text.tertiary}
        />
      }
      onRightIconPress={() => setVisible(!visible)}
      placeholder={props.placeholder || 'Enter your password'}
    />
  );
}

/**
 * Phone number field
 */
export function PhoneField(props: Omit<FormFieldProps, 'keyboardType' | 'name'> & { name?: string }) {
  return (
    <FormField
      {...props}
      name={props.name || 'phone'}
      keyboardType="phone-pad"
      leftIcon={<Ionicons name="call-outline" size={16} color={colors.text.tertiary} />}
      placeholder={props.placeholder || 'Enter your phone number'}
    />
  );
}

/**
 * Search field
 */
export function SearchField(props: Omit<FormFieldProps, 'leftIcon' | 'name'> & { name?: string }) {
  return (
    <FormField
      {...props}
      name={props.name || 'search'}
      leftIcon={<Ionicons name="search-outline" size={16} color={colors.text.tertiary} />}
      placeholder={props.placeholder || 'Search...'}
    />
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  required: {
    color: colors.error.DEFAULT,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 20,
    marginTop: spacing.xs,
  },
  helperText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    flex: 1,
  },
  errorText: {
    color: colors.error.DEFAULT,
    fontSize: typography.fontSize.xs,
    flex: 1,
  },
  charCount: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
  },
});
