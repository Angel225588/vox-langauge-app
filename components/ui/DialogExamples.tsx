/**
 * Dialog Component Examples
 *
 * This file demonstrates how to use the Modal and Dialog components
 * in the Vox Language App.
 *
 * To use these in your screens/components:
 * 1. Import the dialog components you need
 * 2. Create state for visibility
 * 3. Trigger dialogs based on user actions
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AlertDialog, ConfirmDialog, InputDialog, ActionSheet } from './Dialog';
import { NeoButton } from './neomorphic/NeoButton';
import { colors, spacing } from '@/constants/designSystem';
import { Ionicons } from '@expo/vector-icons';

export function DialogExamples() {
  // State for each dialog type
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDestructiveConfirm, setShowDestructiveConfirm] = useState(false);

  // Handlers
  const handleInputSubmit = (value: string) => {
    console.log('Input submitted:', value);
    // Do something with the input value
  };

  const handleDelete = () => {
    console.log('Item deleted');
    // Perform delete action
  };

  const handleEdit = () => {
    console.log('Edit pressed');
    // Navigate to edit screen
  };

  const handleShare = () => {
    console.log('Share pressed');
    // Share functionality
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        {/* Alert Dialog Example */}
        <NeoButton
          title="Show Alert Dialog"
          onPress={() => setShowAlert(true)}
          variant="secondary"
          size="md"
          fullWidth
        />

        {/* Success Alert with Icon */}
        <View style={styles.buttonSpacing} />
        <NeoButton
          title="Show Success Alert"
          onPress={() => setShowSuccessAlert(true)}
          variant="primary"
          size="md"
          fullWidth
        />

        {/* Confirm Dialog Example */}
        <View style={styles.buttonSpacing} />
        <NeoButton
          title="Show Confirm Dialog"
          onPress={() => setShowConfirm(true)}
          variant="secondary"
          size="md"
          fullWidth
        />

        {/* Destructive Confirm Example */}
        <View style={styles.buttonSpacing} />
        <NeoButton
          title="Show Destructive Confirm"
          onPress={() => setShowDestructiveConfirm(true)}
          variant="secondary"
          size="md"
          fullWidth
        />

        {/* Input Dialog Example */}
        <View style={styles.buttonSpacing} />
        <NeoButton
          title="Show Input Dialog"
          onPress={() => setShowInput(true)}
          variant="secondary"
          size="md"
          fullWidth
        />

        {/* Action Sheet Example */}
        <View style={styles.buttonSpacing} />
        <NeoButton
          title="Show Action Sheet"
          onPress={() => setShowActionSheet(true)}
          variant="secondary"
          size="md"
          fullWidth
        />
      </View>

      {/* Alert Dialog */}
      <AlertDialog
        visible={showAlert}
        title="Information"
        message="This is a simple alert dialog. It shows important information to the user."
        onDismiss={() => setShowAlert(false)}
      />

      {/* Success Alert with Icon */}
      <AlertDialog
        visible={showSuccessAlert}
        title="Success!"
        message="Your changes have been saved successfully."
        confirmText="Great"
        onDismiss={() => setShowSuccessAlert(false)}
        icon={
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={colors.success.DEFAULT}
          />
        }
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={showConfirm}
        title="Save Changes?"
        message="Do you want to save your changes before leaving?"
        confirmText="Save"
        cancelText="Discard"
        onConfirm={() => console.log('Changes saved')}
        onCancel={() => setShowConfirm(false)}
        icon={
          <Ionicons
            name="save-outline"
            size={48}
            color={colors.primary.DEFAULT}
          />
        }
      />

      {/* Destructive Confirm Dialog */}
      <ConfirmDialog
        visible={showDestructiveConfirm}
        title="Delete Item?"
        message="This action cannot be undone. Are you sure you want to delete this item?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDestructiveConfirm(false)}
        destructive
        icon={
          <Ionicons
            name="trash-outline"
            size={48}
            color={colors.error.DEFAULT}
          />
        }
      />

      {/* Input Dialog */}
      <InputDialog
        visible={showInput}
        title="Enter Your Name"
        message="Please provide your full name for your profile."
        placeholder="John Doe"
        onConfirm={handleInputSubmit}
        onCancel={() => setShowInput(false)}
        icon={
          <Ionicons
            name="person-outline"
            size={48}
            color={colors.primary.DEFAULT}
          />
        }
      />

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        title="Choose an action"
        message="What would you like to do with this item?"
        options={[
          {
            label: 'Edit',
            onPress: handleEdit,
            icon: (
              <Ionicons
                name="create-outline"
                size={24}
                color={colors.text.primary}
              />
            ),
          },
          {
            label: 'Share',
            onPress: handleShare,
            icon: (
              <Ionicons
                name="share-outline"
                size={24}
                color={colors.text.primary}
              />
            ),
          },
          {
            label: 'Duplicate',
            onPress: () => console.log('Duplicate'),
            icon: (
              <Ionicons
                name="copy-outline"
                size={24}
                color={colors.text.primary}
              />
            ),
          },
          {
            label: 'Archive',
            onPress: () => console.log('Archive'),
            icon: (
              <Ionicons
                name="archive-outline"
                size={24}
                color={colors.text.primary}
              />
            ),
          },
          {
            label: 'Delete',
            onPress: handleDelete,
            destructive: true,
            icon: (
              <Ionicons
                name="trash-outline"
                size={24}
                color={colors.error.DEFAULT}
              />
            ),
          },
          {
            label: 'Disabled Option',
            onPress: () => {},
            disabled: true,
            icon: (
              <Ionicons
                name="ban-outline"
                size={24}
                color={colors.text.disabled}
              />
            ),
          },
        ]}
        onCancel={() => setShowActionSheet(false)}
      />
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
    marginBottom: spacing.lg,
  },
  buttonSpacing: {
    height: spacing.md,
  },
});
