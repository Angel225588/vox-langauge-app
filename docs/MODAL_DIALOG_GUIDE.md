# Modal & Dialog Component Library

Comprehensive Modal and Dialog components for the Vox Language App with beautiful animations, haptic feedback, and accessibility support.

## Table of Contents

- [Overview](#overview)
- [Components](#components)
  - [Modal](#modal)
  - [AlertDialog](#alertdialog)
  - [ConfirmDialog](#confirmdialog)
  - [InputDialog](#inputdialog)
  - [ActionSheet](#actionsheet)
- [Design Features](#design-features)
- [Usage Examples](#usage-examples)
- [Props Reference](#props-reference)
- [Best Practices](#best-practices)

## Overview

The Modal/Dialog library provides a set of pre-composed dialog components built on top of a flexible base Modal component. All components feature:

- **Smooth animations** using Reanimated with spring physics
- **Haptic feedback** on all interactions
- **Safe area handling** for notched devices
- **Keyboard avoidance** for input dialogs
- **Accessibility support** with proper ARIA roles
- **Design system integration** with consistent styling

## Components

### Modal

The base Modal component provides the foundation for all dialog types.

#### Features

- Animated overlay with configurable opacity
- Content slides up from bottom or fades in at center
- Optional backdrop dismissal
- Hardware back button support
- Safe area insets handling
- Keyboard avoiding behavior

#### Basic Usage

```tsx
import { Modal } from '@/components/ui';

function MyComponent() {
  const [visible, setVisible] = useState(false);

  return (
    <Modal
      visible={visible}
      onDismiss={() => setVisible(false)}
      placement="center"
      dismissOnBackdropPress={true}
    >
      <View>
        {/* Your custom content */}
      </View>
    </Modal>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | **Required** | Controls modal visibility |
| `onDismiss` | `() => void` | `undefined` | Callback when modal is dismissed |
| `onShow` | `() => void` | `undefined` | Callback when modal is shown |
| `placement` | `'center' \| 'bottom'` | `'center'` | Modal placement on screen |
| `dismissOnBackdropPress` | `boolean` | `true` | Allow dismissing by tapping backdrop |
| `dismissOnHardwareBackPress` | `boolean` | `true` | Allow dismissing with hardware back button |
| `overlayOpacity` | `number` | `0.7` | Backdrop opacity (0-1) |
| `animationType` | `'slide' \| 'fade'` | Auto | Animation type |
| `avoidKeyboard` | `boolean` | `false` | Enable keyboard avoidance |
| `contentStyle` | `ViewStyle` | `undefined` | Custom content container style |

---

### AlertDialog

Simple alert dialog with title, message, and a single action button.

#### When to Use

- Display important information
- Show success/error messages
- Simple confirmations with one action

#### Example

```tsx
import { AlertDialog } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

function MyComponent() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <AlertDialog
      visible={showAlert}
      title="Success!"
      message="Your changes have been saved successfully."
      confirmText="Great"
      onDismiss={() => setShowAlert(false)}
      icon={
        <Ionicons
          name="checkmark-circle"
          size={48}
          color="#10B981"
        />
      }
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | **Required** | Controls visibility |
| `title` | `string` | **Required** | Dialog title |
| `message` | `string` | **Required** | Dialog message |
| `onDismiss` | `() => void` | `undefined` | Dismiss callback |
| `confirmText` | `string` | `'OK'` | Confirm button text |
| `onConfirm` | `() => void` | `undefined` | Confirm callback |
| `icon` | `React.ReactNode` | `undefined` | Optional icon element |

---

### ConfirmDialog

Confirmation dialog with Cancel and Confirm buttons for two-choice decisions.

#### When to Use

- Confirm destructive actions (delete, discard)
- Save/cancel workflows
- Binary decisions requiring user confirmation

#### Example

```tsx
import { ConfirmDialog } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    console.log('Item deleted');
  };

  return (
    <ConfirmDialog
      visible={showConfirm}
      title="Delete Item?"
      message="This action cannot be undone. Are you sure you want to delete this item?"
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={handleDelete}
      onCancel={() => setShowConfirm(false)}
      destructive
      icon={
        <Ionicons
          name="trash-outline"
          size={48}
          color="#EF4444"
        />
      }
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | **Required** | Controls visibility |
| `title` | `string` | **Required** | Dialog title |
| `message` | `string` | **Required** | Dialog message |
| `onConfirm` | `() => void` | **Required** | Confirm callback |
| `onDismiss` | `() => void` | `undefined` | Dismiss callback |
| `onCancel` | `() => void` | `undefined` | Cancel callback |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `destructive` | `boolean` | `false` | Use destructive styling |
| `icon` | `React.ReactNode` | `undefined` | Optional icon element |

---

### InputDialog

Dialog with a text input field for collecting user input.

#### When to Use

- Collect single-line text input
- Rename items
- Add simple data entries
- Any scenario requiring keyboard input

#### Example

```tsx
import { InputDialog } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

function MyComponent() {
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (value: string) => {
    console.log('User entered:', value);
    // Do something with the input
  };

  return (
    <InputDialog
      visible={showInput}
      title="Enter Your Name"
      message="Please provide your full name for your profile."
      placeholder="John Doe"
      defaultValue=""
      confirmText="Submit"
      cancelText="Cancel"
      onConfirm={handleSubmit}
      onCancel={() => setShowInput(false)}
      keyboardType="default"
      autoCapitalize="words"
      maxLength={50}
      icon={
        <Ionicons
          name="person-outline"
          size={48}
          color="#6366F1"
        />
      }
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | **Required** | Controls visibility |
| `title` | `string` | **Required** | Dialog title |
| `onConfirm` | `(value: string) => void` | **Required** | Submit callback with value |
| `message` | `string` | `undefined` | Optional description |
| `placeholder` | `string` | `''` | Input placeholder |
| `defaultValue` | `string` | `''` | Initial input value |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `onDismiss` | `() => void` | `undefined` | Dismiss callback |
| `onCancel` | `() => void` | `undefined` | Cancel callback |
| `maxLength` | `number` | `undefined` | Max input length |
| `keyboardType` | `'default' \| 'numeric' \| 'email-address' \| 'phone-pad'` | `'default'` | Keyboard type |
| `autoCapitalize` | `'none' \| 'sentences' \| 'words' \| 'characters'` | `'sentences'` | Auto-capitalization |
| `icon` | `React.ReactNode` | `undefined` | Optional icon element |

---

### ActionSheet

Bottom sheet with multiple action options for context menus and action lists.

#### When to Use

- Context menus for list items
- Multiple action choices
- Settings or option selection
- File/item operations (edit, share, delete, etc.)

#### Example

```tsx
import { ActionSheet } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

function MyComponent() {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <ActionSheet
      visible={showSheet}
      title="Choose an action"
      message="What would you like to do with this item?"
      options={[
        {
          label: 'Edit',
          onPress: () => console.log('Edit'),
          icon: <Ionicons name="create-outline" size={24} color="#F9FAFB" />,
        },
        {
          label: 'Share',
          onPress: () => console.log('Share'),
          icon: <Ionicons name="share-outline" size={24} color="#F9FAFB" />,
        },
        {
          label: 'Duplicate',
          onPress: () => console.log('Duplicate'),
          icon: <Ionicons name="copy-outline" size={24} color="#F9FAFB" />,
        },
        {
          label: 'Delete',
          onPress: () => console.log('Delete'),
          destructive: true,
          icon: <Ionicons name="trash-outline" size={24} color="#EF4444" />,
        },
        {
          label: 'Disabled Option',
          onPress: () => {},
          disabled: true,
          icon: <Ionicons name="ban-outline" size={24} color="#6B7280" />,
        },
      ]}
      onCancel={() => setShowSheet(false)}
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | **Required** | Controls visibility |
| `options` | `ActionSheetOption[]` | **Required** | Array of action options |
| `title` | `string` | `undefined` | Optional title |
| `message` | `string` | `undefined` | Optional description |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `onDismiss` | `() => void` | `undefined` | Dismiss callback |
| `onCancel` | `() => void` | `undefined` | Cancel callback |

##### ActionSheetOption

```tsx
interface ActionSheetOption {
  label: string;              // Option text
  onPress: () => void;        // Action handler
  destructive?: boolean;      // Use red styling
  icon?: React.ReactNode;     // Optional icon
  disabled?: boolean;         // Disable the option
}
```

---

## Design Features

### Animations

All dialogs use **Reanimated v4** with spring physics for smooth, natural animations:

- **Overlay**: Fades in/out with timing animation
- **Center Placement**: Scales from 0.9 to 1.0 with spring
- **Bottom Placement**: Slides up from bottom with spring

### Haptic Feedback

Different haptic patterns for different actions:

- **Modal Open**: Medium impact
- **Confirm Actions**: Medium impact
- **Destructive Actions**: Heavy impact
- **Cancel/Dismiss**: Light impact

### Safe Area Support

All modals respect device safe areas (notches, rounded corners, home indicators) using `react-native-safe-area-context`.

### Keyboard Handling

InputDialog includes automatic keyboard avoidance on iOS and Android.

### Accessibility

- Proper `accessibilityRole="dialog"` and `accessibilityModal`
- Screen reader friendly labels
- Keyboard navigation support
- Focus management

---

## Usage Examples

### Success Notification

```tsx
<AlertDialog
  visible={showSuccess}
  title="Lesson Complete!"
  message="You've earned 50 XP. Keep up the great work!"
  confirmText="Continue"
  onDismiss={() => setShowSuccess(false)}
  icon={<Ionicons name="trophy" size={48} color="#F59E0B" />}
/>
```

### Delete Confirmation

```tsx
<ConfirmDialog
  visible={showDelete}
  title="Delete Vocabulary Card?"
  message="This card will be permanently removed from your collection."
  confirmText="Delete"
  cancelText="Keep"
  destructive
  onConfirm={handleDelete}
  onCancel={() => setShowDelete(false)}
/>
```

### Rename Item

```tsx
<InputDialog
  visible={showRename}
  title="Rename Deck"
  placeholder="Enter new name"
  defaultValue={currentName}
  onConfirm={(newName) => updateDeckName(newName)}
  onCancel={() => setShowRename(false)}
/>
```

### Context Menu

```tsx
<ActionSheet
  visible={showMenu}
  options={[
    { label: 'View Details', onPress: viewDetails, icon: <Icon name="eye" /> },
    { label: 'Edit', onPress: edit, icon: <Icon name="edit" /> },
    { label: 'Share', onPress: share, icon: <Icon name="share" /> },
    { label: 'Delete', onPress: del, destructive: true, icon: <Icon name="trash" /> },
  ]}
  onCancel={() => setShowMenu(false)}
/>
```

---

## Best Practices

### Do's ✅

- **Use AlertDialog** for simple notifications with one action
- **Use ConfirmDialog** for important two-choice decisions
- **Use InputDialog** when you need text input
- **Use ActionSheet** for multiple action options
- **Add icons** to make dialogs more visually engaging
- **Keep messages concise** and action-oriented
- **Use destructive styling** for delete/remove actions
- **Test with keyboard** on InputDialog

### Don'ts ❌

- **Don't** use dialogs for complex forms (use full screen instead)
- **Don't** show multiple dialogs simultaneously
- **Don't** use long messages that require scrolling in AlertDialog
- **Don't** forget to handle the dismiss/cancel callbacks
- **Don't** overuse destructive styling
- **Don't** add too many options in ActionSheet (max 6-8)

### State Management

```tsx
// Good: Single state per dialog
const [showAlert, setShowAlert] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

// Better: Use reducer for complex dialog flows
const [dialogState, setDialogState] = useReducer(dialogReducer, initialState);
```

### Error Handling

```tsx
const handleSubmit = async (value: string) => {
  try {
    await saveData(value);
    setShowSuccess(true);
  } catch (error) {
    setShowError(true);
  }
};
```

---

## Testing

### Unit Tests

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { AlertDialog } from '@/components/ui';

test('calls onDismiss when button is pressed', () => {
  const onDismiss = jest.fn();
  const { getByText } = render(
    <AlertDialog
      visible={true}
      title="Test"
      message="Test message"
      onDismiss={onDismiss}
    />
  );

  fireEvent.press(getByText('OK'));
  expect(onDismiss).toHaveBeenCalled();
});
```

---

## Migration Guide

### From React Native Alert

```tsx
// Before (React Native Alert)
Alert.alert('Success', 'Your changes have been saved');

// After (AlertDialog)
<AlertDialog
  visible={showAlert}
  title="Success"
  message="Your changes have been saved"
  onDismiss={() => setShowAlert(false)}
/>
```

### From ActionSheet (community)

```tsx
// Before
showActionSheetWithOptions({
  options: ['Edit', 'Delete', 'Cancel'],
  destructiveButtonIndex: 1,
  cancelButtonIndex: 2,
});

// After
<ActionSheet
  visible={showSheet}
  options={[
    { label: 'Edit', onPress: handleEdit },
    { label: 'Delete', onPress: handleDelete, destructive: true },
  ]}
  onCancel={() => setShowSheet(false)}
/>
```

---

## API Reference

See [Props Reference](#props-reference) section above for detailed API documentation.

---

## Contributing

When adding new dialog variants:

1. Extend the base `Modal` component
2. Follow the design system tokens
3. Add haptic feedback on interactions
4. Include accessibility props
5. Add examples to `DialogExamples.tsx`
6. Update this documentation

---

## Related Components

- `Toast` - For non-blocking notifications
- `BottomSheet` - For draggable bottom sheets
- `Popover` - For contextual tooltips

---

## License

Part of the Vox Language App - Proprietary
