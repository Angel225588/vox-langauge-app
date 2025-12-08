import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { neomorphism, borderRadius, spacing, typography } from '@/constants/designSystem';

interface NeoInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export function NeoInput({
  value,
  onChangeText,
  placeholder = '',
  label,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  disabled = false,
  style,
  inputStyle,
}: NeoInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={neomorphism.input.placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// Search Input variant
interface NeoSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  style?: ViewStyle;
}

export function NeoSearchInput({
  value,
  onChangeText,
  placeholder = 'Search',
  onSubmit,
  style,
}: NeoSearchInputProps) {
  return (
    <View style={[styles.searchContainer, style]}>
      <View style={styles.searchIconContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={neomorphism.input.placeholder}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={styles.searchInput}
      />
    </View>
  );
}

// Textarea variant
interface NeoTextareaProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  numberOfLines?: number;
  maxLength?: number;
  style?: ViewStyle;
}

export function NeoTextarea({
  value,
  onChangeText,
  placeholder = 'Your message',
  label,
  numberOfLines = 4,
  maxLength,
  style,
}: NeoTextareaProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.textareaContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={neomorphism.input.placeholder}
          multiline
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          textAlignVertical="top"
          style={styles.textarea}
        />

        {maxLength && (
          <Text style={styles.charCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: neomorphism.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },

  // Standard input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: neomorphism.input.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: neomorphism.input.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: neomorphism.accent,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: neomorphism.input.text,
    fontSize: typography.fontSize.base,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  errorText: {
    color: '#EF4444',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },

  // Search input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: neomorphism.input.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: neomorphism.input.border,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIconContainer: {
    marginRight: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    color: neomorphism.input.text,
    fontSize: typography.fontSize.base,
  },

  // Textarea
  textareaContainer: {
    backgroundColor: neomorphism.input.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: neomorphism.input.border,
    padding: spacing.md,
  },
  textarea: {
    color: neomorphism.input.text,
    fontSize: typography.fontSize.base,
    minHeight: 100,
  },
  charCount: {
    color: neomorphism.text.inactive,
    fontSize: typography.fontSize.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
