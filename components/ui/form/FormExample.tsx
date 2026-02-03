/**
 * Form Examples
 *
 * Practical examples showing how to use the form validation system
 * with NeoInput integration.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Form,
  FormGroup,
  FormField,
  FormRow,
  FormDivider,
  FormActions,
  EmailField,
  PasswordField,
  PhoneField,
  useFormValidation,
  required,
  email,
  minLength,
  matches,
  phone,
  strongPassword,
} from './index';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// SIMPLE BUTTON COMPONENT
// ============================================================================

interface SimpleButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: React.ReactNode;
}

function SimpleButton({ label, onPress, variant = 'primary', disabled = false, icon }: SimpleButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon && <View style={styles.buttonIcon}>{icon}</View>}
      <Text style={[
        styles.buttonText,
        isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// EXAMPLE 1: LOGIN FORM
// ============================================================================

export function LoginFormExample() {
  const { fields, validateAll, values, reset } = useFormValidation({
    email: {
      value: '',
      rules: [required('Email is required'), email()],
    },
    password: {
      value: '',
      rules: [required('Password is required'), minLength(6, 'Password must be at least 6 characters')],
    },
  });

  const handleSubmit = () => {
    if (validateAll()) {
      Alert.alert('Success', `Logging in with ${values.email}`);
    }
  };

  return (
    <Form>
      <FormGroup title="Login" description="Enter your credentials to continue">
        <EmailField
          label="Email"
          value={fields.email.value}
          onChangeText={fields.email.setValue}
          onBlur={() => {
            fields.email.setTouched(true);
            fields.email.validate();
          }}
          error={fields.email.touched ? fields.email.error || undefined : undefined}
          required
          showSuccessState
        />

        <PasswordField
          label="Password"
          value={fields.password.value}
          onChangeText={fields.password.setValue}
          onBlur={() => {
            fields.password.setTouched(true);
            fields.password.validate();
          }}
          error={fields.password.touched ? fields.password.error || undefined : undefined}
          required
        />

        <FormActions>
          <SimpleButton label="Login" onPress={handleSubmit} variant="primary" />
          <SimpleButton label="Reset" onPress={reset} variant="secondary" />
        </FormActions>
      </FormGroup>
    </Form>
  );
}

// ============================================================================
// EXAMPLE 2: REGISTRATION FORM
// ============================================================================

export function RegistrationFormExample() {
  const { fields, validateAll, getFieldProps } = useFormValidation({
    firstName: {
      value: '',
      rules: [required('First name is required')],
    },
    lastName: {
      value: '',
      rules: [required('Last name is required')],
    },
    email: {
      value: '',
      rules: [required('Email is required'), email()],
    },
    phone: {
      value: '',
      rules: [phone('Please enter a valid phone number')],
    },
    password: {
      value: '',
      rules: [required('Password is required'), strongPassword()],
    },
    confirmPassword: {
      value: '',
      rules: [
        required('Please confirm your password'),
        matches('password', 'Passwords do not match'),
      ],
    },
  });

  const handleSubmit = () => {
    if (validateAll()) {
      Alert.alert('Success', 'Account created successfully!');
    }
  };

  return (
    <Form>
      {/* Personal Information */}
      <FormGroup title="Personal Information" variant="card" animated animationDelay={0}>
        <FormRow>
          <FormField
            name="firstName"
            label="First Name"
            placeholder="John"
            {...getFieldProps('firstName')}
            required
            showSuccessState
          />
          <FormField
            name="lastName"
            label="Last Name"
            placeholder="Doe"
            {...getFieldProps('lastName')}
            required
            showSuccessState
          />
        </FormRow>

        <EmailField
          label="Email"
          {...getFieldProps('email')}
          required
          showSuccessState
        />

        <PhoneField
          label="Phone (optional)"
          {...getFieldProps('phone')}
          helperText="We'll only use this for account recovery"
        />
      </FormGroup>

      <FormDivider label="Security" />

      {/* Security */}
      <FormGroup title="Security" variant="card" animated animationDelay={100}>
        <PasswordField
          label="Password"
          {...getFieldProps('password')}
          required
          helperText="8+ characters with uppercase, lowercase, and number"
        />

        <PasswordField
          label="Confirm Password"
          {...getFieldProps('confirmPassword')}
          required
        />
      </FormGroup>

      <FormActions>
        <SimpleButton
          label="Create Account"
          onPress={handleSubmit}
          variant="primary"
          icon={<Ionicons name="checkmark" size={16} color="#fff" />}
        />
      </FormActions>
    </Form>
  );
}

// ============================================================================
// EXAMPLE 3: PROFILE EDIT FORM
// ============================================================================

export function ProfileEditFormExample() {
  const { validateAll, getFieldProps, isDirty, reset } = useFormValidation({
    displayName: {
      value: 'John Doe',
      rules: [required('Display name is required'), minLength(2)],
    },
    bio: {
      value: 'Learning Spanish!',
      rules: [],
    },
    targetLanguage: {
      value: 'Spanish',
      rules: [required('Please select a target language')],
    },
  });

  const handleSave = () => {
    if (validateAll()) {
      Alert.alert('Saved', 'Your profile has been updated');
    }
  };

  return (
    <Form>
      <FormGroup title="Edit Profile" description="Update your public profile information">
        <FormField
          name="displayName"
          label="Display Name"
          placeholder="Your name"
          {...getFieldProps('displayName')}
          required
          showSuccessState
          leftIcon={<Ionicons name="person-outline" size={16} color={colors.text.tertiary} />}
        />

        <FormField
          name="bio"
          label="Bio"
          placeholder="Tell us about yourself..."
          {...getFieldProps('bio')}
          multiline
          numberOfLines={4}
          maxLength={200}
          helperText="A short description about you"
        />

        <FormField
          name="targetLanguage"
          label="Target Language"
          placeholder="Language you're learning"
          {...getFieldProps('targetLanguage')}
          required
          leftIcon={<Ionicons name="globe-outline" size={16} color={colors.text.tertiary} />}
        />

        <FormActions direction="row">
          <SimpleButton
            label="Cancel"
            onPress={reset}
            variant="secondary"
            disabled={!isDirty}
          />
          <SimpleButton
            label="Save Changes"
            onPress={handleSave}
            variant="primary"
            disabled={!isDirty}
          />
        </FormActions>
      </FormGroup>
    </Form>
  );
}

// ============================================================================
// DEMO SCREEN
// ============================================================================

export function FormDemoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Login Example */}
      <View style={styles.section}>
        <LoginFormExample />
      </View>

      <FormDivider />

      {/* Registration Example */}
      <View style={styles.section}>
        <RegistrationFormExample />
      </View>

      <FormDivider />

      {/* Profile Edit Example */}
      <View style={styles.section}>
        <ProfileEditFormExample />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  // Button styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: colors.primary.DEFAULT,
  },
  buttonSecondary: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextSecondary: {
    color: colors.text.primary,
  },
});
