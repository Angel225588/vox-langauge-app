# Modal & Dialog Components

Quick reference guide for the Modal/Dialog component library.

## Quick Start

```tsx
import { AlertDialog, ConfirmDialog, InputDialog, ActionSheet } from '@/components/ui';
```

## Components

### 1. AlertDialog
Simple one-button alert.

```tsx
<AlertDialog
  visible={show}
  title="Success"
  message="Your changes have been saved."
  onDismiss={() => setShow(false)}
/>
```

### 2. ConfirmDialog
Two-button confirmation.

```tsx
<ConfirmDialog
  visible={show}
  title="Delete Item?"
  message="This cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setShow(false)}
  destructive
/>
```

### 3. InputDialog
Dialog with text input.

```tsx
<InputDialog
  visible={show}
  title="Enter Name"
  placeholder="John Doe"
  onConfirm={(value) => console.log(value)}
  onCancel={() => setShow(false)}
/>
```

### 4. ActionSheet
Bottom sheet with multiple options.

```tsx
<ActionSheet
  visible={show}
  options={[
    { label: 'Edit', onPress: handleEdit },
    { label: 'Delete', onPress: handleDelete, destructive: true },
  ]}
  onCancel={() => setShow(false)}
/>
```

## Features

- Spring animations with Reanimated
- Haptic feedback on all interactions
- Safe area support
- Keyboard avoidance (InputDialog)
- Design system integration
- Accessible (screen reader friendly)

## Example Usage

See `DialogExamples.tsx` for complete working examples.

## Full Documentation

For comprehensive documentation, see `/docs/MODAL_DIALOG_GUIDE.md`.

## Common Patterns

### Success Notification
```tsx
const [showSuccess, setShowSuccess] = useState(false);

// After successful action
setShowSuccess(true);

<AlertDialog
  visible={showSuccess}
  title="Success!"
  message="Operation completed successfully."
  onDismiss={() => setShowSuccess(false)}
/>
```

### Delete Confirmation
```tsx
const [showDelete, setShowDelete] = useState(false);

<ConfirmDialog
  visible={showDelete}
  title="Delete?"
  message="This cannot be undone."
  confirmText="Delete"
  destructive
  onConfirm={async () => {
    await deleteItem();
    setShowDelete(false);
  }}
  onCancel={() => setShowDelete(false)}
/>
```

### Text Input
```tsx
const [showInput, setShowInput] = useState(false);

<InputDialog
  visible={showInput}
  title="Enter Value"
  placeholder="Type here..."
  onConfirm={(value) => {
    saveValue(value);
    setShowInput(false);
  }}
  onCancel={() => setShowInput(false)}
/>
```

### Context Menu
```tsx
const [showMenu, setShowMenu] = useState(false);

<ActionSheet
  visible={showMenu}
  title="Choose Action"
  options={[
    { label: 'View', onPress: () => navigate('details') },
    { label: 'Edit', onPress: () => navigate('edit') },
    { label: 'Delete', onPress: handleDelete, destructive: true },
  ]}
  onCancel={() => setShowMenu(false)}
/>
```

## Tips

1. **Use destructive prop** for delete/remove actions
2. **Add icons** to make dialogs more engaging
3. **Keep messages short** - 1-2 sentences max
4. **Test keyboard behavior** on InputDialog
5. **Limit ActionSheet options** to 6-8 items

## Related

- `Toast` - Non-blocking notifications
- `Modal` - Base modal component (for custom dialogs)
