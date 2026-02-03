# Toast Notification System

A centralized, animated toast/snackbar notification system for the Vox Language App.

## Features

- **Animated Notifications**: Smooth slide-in/out animations using React Native Reanimated
- **Multiple Variants**: Success, error, warning, and info variants with appropriate colors and icons
- **Auto-Dismiss**: Configurable duration with automatic dismissal
- **Action Buttons**: Optional action button for user interaction (e.g., Undo, Retry)
- **Queue Management**: Automatically queues multiple toasts and displays one at a time
- **Haptic Feedback**: Provides appropriate haptic feedback based on variant
- **Safe Area Aware**: Respects device safe areas and notches
- **Design System Integration**: Uses consistent colors, spacing, and typography from the design system

## Installation

The Toast system is already installed and available in the project. All dependencies are included in `package.json`.

## Setup

### 1. Wrap Your App with ToastProvider

Add the `ToastProvider` at the root level of your app:

```tsx
// app/_layout.tsx
import { ToastProvider } from '@/components/ui';

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* ... other screens */}
      </Stack>
    </ToastProvider>
  );
}
```

### 2. Use the `useToast` Hook

In any component within the `ToastProvider`, use the `useToast` hook:

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { showToast } = useToast();

  const handleSave = () => {
    // ... save logic
    showToast('Changes saved successfully!', 'success');
  };

  return (
    <Button onPress={handleSave}>Save</Button>
  );
}
```

## API Reference

### `showToast(message, variant, options)`

Shows a toast notification with the specified configuration.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | `string` | Required | The text to display in the toast |
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Visual style and icon |
| `options` | `ToastOptions` | `{}` | Additional configuration options |

#### ToastOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `3000` | Auto-dismiss duration in milliseconds (0 = no auto-dismiss) |
| `action` | `{ label: string, onPress: () => void }` | `undefined` | Optional action button |

### Variants

Each variant has a unique appearance and haptic feedback:

| Variant | Color | Icon | Haptic |
|---------|-------|------|--------|
| `success` | Green (#10B981) | Checkmark Circle | Success |
| `error` | Red (#EF4444) | Close Circle | Error |
| `warning` | Amber (#F59E0B) | Warning Triangle | Warning |
| `info` | Indigo (#6366F1) | Information Circle | Light |

## Usage Examples

### Basic Toast

```tsx
const { showToast } = useToast();

showToast('Operation completed!', 'success');
showToast('Something went wrong', 'error');
showToast('Please review this action', 'warning');
showToast('New lesson available', 'info');
```

### Custom Duration

```tsx
const { showToast } = useToast();

// Quick notification (1 second)
showToast('Copied!', 'success', { duration: 1000 });

// Long notification (5 seconds)
showToast('Read this carefully', 'warning', { duration: 5000 });

// No auto-dismiss
showToast('Connection lost', 'error', { duration: 0 });
```

### With Action Button

```tsx
const { showToast } = useToast();

const handleDelete = () => {
  // Delete logic here
  showToast('Lesson deleted', 'success', {
    duration: 5000,
    action: {
      label: 'Undo',
      onPress: () => {
        // Undo logic here
        console.log('Undoing delete...');
      }
    }
  });
};
```

### Real-World Examples

#### Save Progress with Error Handling

```tsx
const handleSaveProgress = async () => {
  try {
    await saveToDatabase(progress);
    showToast('Progress saved successfully!', 'success');
  } catch (error) {
    showToast('Failed to save progress', 'error', {
      duration: 5000,
      action: {
        label: 'Retry',
        onPress: handleSaveProgress
      }
    });
  }
};
```

#### Offline Mode Notification

```tsx
useEffect(() => {
  const handleConnectionChange = (isConnected: boolean) => {
    if (!isConnected) {
      showToast(
        'You are offline. Some features may be limited.',
        'warning',
        { duration: 5000 }
      );
    }
  };

  // Subscribe to network changes
  const subscription = NetInfo.addEventListener(handleConnectionChange);
  return () => subscription();
}, []);
```

#### Lesson Completion

```tsx
const handleLessonComplete = (xpEarned: number) => {
  showToast(`Lesson completed! +${xpEarned} XP`, 'success', {
    duration: 4000
  });
};
```

#### Streak Notification

```tsx
const handleStreakMaintained = (days: number) => {
  showToast(`${days}-day streak maintained!`, 'success', {
    duration: 4000
  });
};
```

## Design Specifications

### Colors

Variants use colors from the design system (`constants/designSystem.ts`):

- Success: `colors.success.DEFAULT` (#10B981)
- Error: `colors.error.DEFAULT` (#EF4444)
- Warning: `colors.warning.DEFAULT` (#F59E0B)
- Info: `colors.primary.DEFAULT` (#6366F1)

### Spacing & Layout

- Border radius: `borderRadius.lg` (16px)
- Padding: `spacing.md` (16px)
- Position: Top of screen with safe area inset + `spacing.md`
- Icon size: 24px
- Text size: `typography.fontSize.base` (16px)

### Animation

- Slide-in: Spring animation with `animation.spring.default` config
- Slide-out: Spring animation with `animation.spring.stiff` config
- Opacity: Timing animation with `animation.duration.normal` (300ms)

### Shadows

Uses design system shadow configuration:
- Shadow color: Variant-specific glow color
- Shadow radius: 16px
- Shadow opacity: 0.4
- Shadow offset: (0, 8)

## Queue Behavior

The toast system automatically manages a queue:

1. **Single Display**: Only one toast is shown at a time
2. **FIFO Order**: Toasts are shown in the order they were called
3. **Auto-Progress**: When a toast dismisses, the next one in the queue appears
4. **No Duplicates**: Multiple calls to `showToast` create separate queue entries

## Accessibility

- **Haptic Feedback**: Provides tactile feedback for users with hearing impairments
- **High Contrast**: Uses vibrant colors that meet WCAG contrast ratios
- **Clear Icons**: Icon reinforces the message variant
- **Touch Targets**: Dismiss button has proper hit slop for easy interaction

## Testing

See `__tests__/components/ui/Toast.test.tsx` for comprehensive test examples.

Run tests:
```bash
npm test Toast.test
```

## Troubleshooting

### Toast not showing

1. Ensure `ToastProvider` is wrapping your component tree
2. Check that you're using `useToast` hook inside a component within the provider
3. Verify no other components are blocking the toast (z-index issues)

### Multiple toasts showing at once

This should not happen due to queue management. If it does:
1. Check if you have multiple `ToastProvider` instances
2. Ensure you're using the same provider context

### Animation not smooth

1. Ensure React Native Reanimated is properly configured
2. Check device performance
3. Verify no other heavy animations are running simultaneously

## Related Components

- `ResultAnimation`: Full-screen success/error animations
- `AnswerFeedbackOverlay`: Bottom sheet with feedback
- `GlassCard`: Frosted glass effect card

## Future Enhancements

Potential improvements for future iterations:

- [ ] Multiple simultaneous toasts (stacked)
- [ ] Position variants (top, bottom, center)
- [ ] Custom icons and colors
- [ ] Swipe to dismiss gesture
- [ ] Progress bar for duration visualization
- [ ] Sound effects option
- [ ] Persistent toasts that survive navigation
