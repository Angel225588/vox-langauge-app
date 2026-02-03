/**
 * Form Components
 *
 * A comprehensive form system with validation, field grouping,
 * and integration with NeoInput components.
 *
 * @example
 * import {
 *   Form,
 *   FormGroup,
 *   FormField,
 *   FormRow,
 *   FormDivider,
 *   FormActions,
 *   EmailField,
 *   PasswordField,
 * } from '@/components/ui/form';
 *
 * import { useFormValidation, validators } from '@/lib/hooks/useFormValidation';
 */

// Form field components
export { FormField, EmailField, PasswordField, PhoneField, SearchField } from './FormField';

// Form group and layout components
export { Form, FormGroup, FormRow, FormDivider, FormActions } from './FormGroup';

// Re-export validation hook and validators for convenience
export {
  useFormValidation,
  validators,
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
} from '@/lib/hooks/useFormValidation';

// Types
export type { FormFieldProps } from './FormField';
export type { FormGroupProps, FormRowProps, FormDividerProps, FormActionsProps, FormProps } from './FormGroup';
export type {
  ValidationRule,
  FieldConfig,
  FieldState,
  FormFields,
  FormValidationResult,
} from '@/lib/hooks/useFormValidation';
