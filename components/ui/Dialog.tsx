import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Modal, ModalProps } from './Modal';
import { NeoButton } from './neomorphic/NeoButton';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  neomorphism,
} from '@/constants/designSystem';

// ============================================================================
// AlertDialog - Simple alert with title, message, and OK button
// ============================================================================

export interface AlertDialogProps extends Pick<ModalProps, 'visible' | 'onDismiss'> {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  icon?: React.ReactNode;
}

/**
 * AlertDialog - Simple alert dialog
 *
 * @example
 * ```tsx
 * <AlertDialog
 *   visible={showAlert}
 *   title="Success"
 *   message="Your changes have been saved."
 *   onDismiss={() => setShowAlert(false)}
 * />
 * ```
 */
export function AlertDialog({
  visible,
  onDismiss,
  title,
  message,
  confirmText = 'OK',
  onConfirm,
  icon,
}: AlertDialogProps) {
  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm?.();
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      placement="center"
      dismissOnBackdropPress={true}
    >
      <View style={styles.dialogContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          <NeoButton
            title={confirmText}
            onPress={handleConfirm}
            variant="primary"
            size="md"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// ConfirmDialog - Confirmation dialog with Cancel and Confirm buttons
// ============================================================================

export interface ConfirmDialogProps extends Pick<ModalProps, 'visible' | 'onDismiss'> {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  icon?: React.ReactNode;
}

/**
 * ConfirmDialog - Confirmation dialog with two actions
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   visible={showConfirm}
 *   title="Delete Item?"
 *   message="This action cannot be undone."
 *   onCancel={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   destructive
 * />
 * ```
 */
export function ConfirmDialog({
  visible,
  onDismiss,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    Haptics.impactAsync(
      destructive
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium
    );
    onConfirm();
    onDismiss?.();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel?.();
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      placement="center"
      dismissOnBackdropPress={false}
    >
      <View style={styles.dialogContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <NeoButton
              title={cancelText}
              onPress={handleCancel}
              variant="secondary"
              size="md"
              fullWidth
            />
          </View>
          <View style={styles.buttonSpacer} />
          <View style={styles.buttonHalf}>
            <NeoButton
              title={confirmText}
              onPress={handleConfirm}
              variant="primary"
              size="md"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// InputDialog - Dialog with text input field
// ============================================================================

export interface InputDialogProps extends Pick<ModalProps, 'visible' | 'onDismiss'> {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
  maxLength?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: React.ReactNode;
}

/**
 * InputDialog - Dialog with text input
 *
 * @example
 * ```tsx
 * <InputDialog
 *   visible={showInput}
 *   title="Enter Your Name"
 *   placeholder="John Doe"
 *   onConfirm={(value) => console.log(value)}
 *   onCancel={() => setShowInput(false)}
 * />
 * ```
 */
export function InputDialog({
  visible,
  onDismiss,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  icon,
}: InputDialogProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(inputValue.trim());
    onDismiss?.();
    setInputValue(defaultValue);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel?.();
    onDismiss?.();
    setInputValue(defaultValue);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      placement="center"
      dismissOnBackdropPress={false}
      avoidKeyboard
    >
      <View style={styles.dialogContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}

        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={neomorphism.input.placeholder}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
        />

        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <NeoButton
              title={cancelText}
              onPress={handleCancel}
              variant="secondary"
              size="md"
              fullWidth
            />
          </View>
          <View style={styles.buttonSpacer} />
          <View style={styles.buttonHalf}>
            <NeoButton
              title={confirmText}
              onPress={handleConfirm}
              variant="primary"
              size="md"
              fullWidth
              disabled={inputValue.trim().length === 0}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// ActionSheet - Bottom sheet with action options
// ============================================================================

export interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ActionSheetProps extends Pick<ModalProps, 'visible' | 'onDismiss'> {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelText?: string;
  onCancel?: () => void;
}

/**
 * ActionSheet - Bottom sheet with action options
 *
 * @example
 * ```tsx
 * <ActionSheet
 *   visible={showSheet}
 *   title="Choose an action"
 *   options={[
 *     { label: 'Edit', onPress: handleEdit },
 *     { label: 'Share', onPress: handleShare },
 *     { label: 'Delete', onPress: handleDelete, destructive: true },
 *   ]}
 *   onCancel={() => setShowSheet(false)}
 * />
 * ```
 */
export function ActionSheet({
  visible,
  onDismiss,
  title,
  message,
  options,
  cancelText = 'Cancel',
  onCancel,
}: ActionSheetProps) {
  const handleOptionPress = (option: ActionSheetOption) => {
    if (option.disabled) return;

    Haptics.impactAsync(
      option.destructive
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium
    );
    option.onPress();
    onDismiss?.();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel?.();
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      placement="bottom"
      dismissOnBackdropPress={true}
    >
      <View style={styles.actionSheetContent}>
        {/* Header */}
        {(title || message) && (
          <View style={styles.actionSheetHeader}>
            {title && <Text style={styles.actionSheetTitle}>{title}</Text>}
            {message && <Text style={styles.actionSheetMessage}>{message}</Text>}
          </View>
        )}

        {/* Options */}
        <ScrollView
          style={styles.actionSheetOptions}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionSheetOption,
                option.disabled && styles.actionSheetOptionDisabled,
                index === options.length - 1 && styles.actionSheetOptionLast,
              ]}
              onPress={() => handleOptionPress(option)}
              disabled={option.disabled}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ disabled: option.disabled }}
            >
              {option.icon && (
                <View style={styles.actionSheetOptionIcon}>{option.icon}</View>
              )}
              <Text
                style={[
                  styles.actionSheetOptionText,
                  option.destructive && styles.actionSheetOptionTextDestructive,
                  option.disabled && styles.actionSheetOptionTextDisabled,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cancel Button */}
        <View style={styles.actionSheetCancel}>
          <NeoButton
            title={cancelText}
            onPress={handleCancel}
            variant="secondary"
            size="md"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Dialog Styles
  dialogContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.fontSize.base * 1.5,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: spacing.md,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonSpacer: {
    width: spacing.md,
  },

  // Input Dialog Styles
  input: {
    width: '100%',
    backgroundColor: neomorphism.input.background,
    borderWidth: 2,
    borderColor: neomorphism.input.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: neomorphism.input.text,
    marginBottom: spacing.md,
  },

  // Action Sheet Styles
  actionSheetContent: {
    maxHeight: '80%',
  },
  actionSheetHeader: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
    marginBottom: spacing.sm,
  },
  actionSheetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  actionSheetMessage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionSheetOptions: {
    maxHeight: 400,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  actionSheetOptionLast: {
    borderBottomWidth: 0,
  },
  actionSheetOptionDisabled: {
    opacity: 0.5,
  },
  actionSheetOptionIcon: {
    marginRight: spacing.md,
  },
  actionSheetOptionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flex: 1,
  },
  actionSheetOptionTextDestructive: {
    color: colors.error.DEFAULT,
  },
  actionSheetOptionTextDisabled: {
    color: colors.text.disabled,
  },
  actionSheetCancel: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
});
