/**
 * Form Validation Hook
 *
 * A comprehensive form validation system for React Native
 * with built-in validators, error handling, and field management.
 *
 * @example
 * const { fields, validateAll, isValid, reset } = useFormValidation({
 *   email: { value: '', rules: [required(), email()] },
 *   password: { value: '', rules: [required(), minLength(8)] },
 * });
 */

import { useState, useCallback, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ValidationRule = {
  validate: (value: string, allValues?: Record<string, string>) => boolean;
  message: string;
};

export type FieldConfig = {
  value: string;
  rules: ValidationRule[];
};

export type FieldState = {
  value: string;
  error: string | null;
  touched: boolean;
  dirty: boolean;
};

export type FormFields<T extends Record<string, FieldConfig>> = {
  [K in keyof T]: FieldState & {
    setValue: (value: string) => void;
    setTouched: (touched: boolean) => void;
    validate: () => boolean;
    reset: () => void;
  };
};

export type FormValidationResult<T extends Record<string, FieldConfig>> = {
  fields: FormFields<T>;
  values: Record<keyof T, string>;
  errors: Record<keyof T, string | null>;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  validateAll: () => boolean;
  validateField: (name: keyof T) => boolean;
  reset: () => void;
  resetField: (name: keyof T) => void;
  setFieldValue: (name: keyof T, value: string) => void;
  setFieldError: (name: keyof T, error: string | null) => void;
  getFieldProps: (name: keyof T) => {
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    error: string | undefined;
  };
};

// ============================================================================
// BUILT-IN VALIDATORS
// ============================================================================

/**
 * Required field validator
 */
export const required = (message = 'This field is required'): ValidationRule => ({
  validate: (value) => value.trim().length > 0,
  message,
});

/**
 * Email format validator
 */
export const email = (message = 'Please enter a valid email'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true; // Let required handle empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  message,
});

/**
 * Minimum length validator
 */
export const minLength = (min: number, message?: string): ValidationRule => ({
  validate: (value) => {
    if (!value) return true; // Let required handle empty
    return value.length >= min;
  },
  message: message || `Must be at least ${min} characters`,
});

/**
 * Maximum length validator
 */
export const maxLength = (max: number, message?: string): ValidationRule => ({
  validate: (value) => value.length <= max,
  message: message || `Must be no more than ${max} characters`,
});

/**
 * Pattern/regex validator
 */
export const pattern = (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true; // Let required handle empty
    return regex.test(value);
  },
  message,
});

/**
 * Numeric only validator
 */
export const numeric = (message = 'Must contain only numbers'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return /^\d+$/.test(value);
  },
  message,
});

/**
 * Alphabetic only validator
 */
export const alphabetic = (message = 'Must contain only letters'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return /^[a-zA-Z\s]+$/.test(value);
  },
  message,
});

/**
 * Alphanumeric validator
 */
export const alphanumeric = (message = 'Must contain only letters and numbers'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    return /^[a-zA-Z0-9]+$/.test(value);
  },
  message,
});

/**
 * Match another field validator (for password confirmation)
 */
export const matches = (fieldName: string, message?: string): ValidationRule => ({
  validate: (value, allValues) => {
    if (!value || !allValues) return true;
    return value === allValues[fieldName];
  },
  message: message || `Must match ${fieldName}`,
});

/**
 * Phone number validator (flexible international format)
 */
export const phone = (message = 'Please enter a valid phone number'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    // Accepts various formats: +1234567890, 123-456-7890, (123) 456-7890, etc.
    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },
  message,
});

/**
 * URL validator
 */
export const url = (message = 'Please enter a valid URL'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  message,
});

/**
 * Password strength validator
 * Requires: 8+ chars, uppercase, lowercase, number
 */
export const strongPassword = (message = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule => ({
  validate: (value) => {
    if (!value) return true;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasMinLength = value.length >= 8;
    return hasUppercase && hasLowercase && hasNumber && hasMinLength;
  },
  message,
});

/**
 * Custom validator factory
 */
export const custom = (
  validateFn: (value: string, allValues?: Record<string, string>) => boolean,
  message: string
): ValidationRule => ({
  validate: validateFn,
  message,
});

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useFormValidation<T extends Record<string, FieldConfig>>(
  config: T
): FormValidationResult<T> {
  // Initialize field states
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>(() => {
    const initial: Record<string, FieldState> = {};
    for (const key in config) {
      initial[key] = {
        value: config[key].value,
        error: null,
        touched: false,
        dirty: false,
      };
    }
    return initial;
  });

  // Validate a single field
  const validateField = useCallback((name: keyof T): boolean => {
    const fieldConfig = config[name];
    const fieldState = fieldStates[name as string];

    if (!fieldConfig || !fieldState) return true;

    // Get all current values for cross-field validation
    const allValues: Record<string, string> = {};
    for (const key in fieldStates) {
      allValues[key] = fieldStates[key].value;
    }

    // Run through all rules
    for (const rule of fieldConfig.rules) {
      if (!rule.validate(fieldState.value, allValues)) {
        setFieldStates(prev => ({
          ...prev,
          [name]: { ...prev[name as string], error: rule.message },
        }));
        return false;
      }
    }

    // Clear error if all rules pass
    setFieldStates(prev => ({
      ...prev,
      [name]: { ...prev[name as string], error: null },
    }));
    return true;
  }, [config, fieldStates]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    let allValid = true;
    const newStates = { ...fieldStates };

    // Get all current values
    const allValues: Record<string, string> = {};
    for (const key in fieldStates) {
      allValues[key] = fieldStates[key].value;
    }

    for (const name in config) {
      const fieldConfig = config[name];
      const fieldState = fieldStates[name];

      let fieldError: string | null = null;

      for (const rule of fieldConfig.rules) {
        if (!rule.validate(fieldState.value, allValues)) {
          fieldError = rule.message;
          allValid = false;
          break;
        }
      }

      newStates[name] = {
        ...fieldState,
        error: fieldError,
        touched: true,
      };
    }

    setFieldStates(newStates);
    return allValid;
  }, [config, fieldStates]);

  // Set field value
  const setFieldValue = useCallback((name: keyof T, value: string) => {
    setFieldStates(prev => ({
      ...prev,
      [name]: {
        ...prev[name as string],
        value,
        dirty: true,
        // Clear error when user starts typing (optional - can be removed for validate-on-change)
        error: null,
      },
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((name: keyof T, touched: boolean) => {
    setFieldStates(prev => ({
      ...prev,
      [name]: { ...prev[name as string], touched },
    }));
  }, []);

  // Set field error manually
  const setFieldError = useCallback((name: keyof T, error: string | null) => {
    setFieldStates(prev => ({
      ...prev,
      [name]: { ...prev[name as string], error },
    }));
  }, []);

  // Reset single field
  const resetField = useCallback((name: keyof T) => {
    setFieldStates(prev => ({
      ...prev,
      [name]: {
        value: config[name].value,
        error: null,
        touched: false,
        dirty: false,
      },
    }));
  }, [config]);

  // Reset all fields
  const reset = useCallback(() => {
    const initial: Record<string, FieldState> = {};
    for (const key in config) {
      initial[key] = {
        value: config[key].value,
        error: null,
        touched: false,
        dirty: false,
      };
    }
    setFieldStates(initial);
  }, [config]);

  // Get props for NeoInput integration
  const getFieldProps = useCallback((name: keyof T) => ({
    value: fieldStates[name as string]?.value || '',
    onChangeText: (text: string) => setFieldValue(name, text),
    onBlur: () => {
      setFieldTouched(name, true);
      validateField(name);
    },
    error: fieldStates[name as string]?.touched
      ? fieldStates[name as string]?.error || undefined
      : undefined,
  }), [fieldStates, setFieldValue, setFieldTouched, validateField]);

  // Build fields object with methods
  const fields = useMemo(() => {
    const result: Record<string, FieldState & {
      setValue: (value: string) => void;
      setTouched: (touched: boolean) => void;
      validate: () => boolean;
      reset: () => void;
    }> = {};

    for (const name in config) {
      result[name] = {
        ...fieldStates[name],
        setValue: (value: string) => setFieldValue(name as keyof T, value),
        setTouched: (touched: boolean) => setFieldTouched(name as keyof T, touched),
        validate: () => validateField(name as keyof T),
        reset: () => resetField(name as keyof T),
      };
    }

    return result as FormFields<T>;
  }, [config, fieldStates, setFieldValue, setFieldTouched, validateField, resetField]);

  // Compute derived state
  const values = useMemo(() => {
    const result: Record<string, string> = {};
    for (const key in fieldStates) {
      result[key] = fieldStates[key].value;
    }
    return result as Record<keyof T, string>;
  }, [fieldStates]);

  const errors = useMemo(() => {
    const result: Record<string, string | null> = {};
    for (const key in fieldStates) {
      result[key] = fieldStates[key].error;
    }
    return result as Record<keyof T, string | null>;
  }, [fieldStates]);

  const isValid = useMemo(() => {
    return Object.values(fieldStates).every(field => !field.error);
  }, [fieldStates]);

  const isDirty = useMemo(() => {
    return Object.values(fieldStates).some(field => field.dirty);
  }, [fieldStates]);

  const isTouched = useMemo(() => {
    return Object.values(fieldStates).some(field => field.touched);
  }, [fieldStates]);

  return {
    fields,
    values,
    errors,
    isValid,
    isDirty,
    isTouched,
    validateAll,
    validateField,
    reset,
    resetField,
    setFieldValue,
    setFieldError,
    getFieldProps,
  };
}

// Export validators as a collection
export const validators = {
  required,
  email,
  minLength,
  maxLength,
  pattern,
  numeric,
  alphabetic,
  alphanumeric,
  matches,
  phone,
  url,
  strongPassword,
  custom,
};
