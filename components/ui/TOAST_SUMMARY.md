# Toast System - Quick Reference

## What Was Created

1. **Toast.tsx** - Main toast component with animations
2. **ToastProvider.tsx** - Context provider for global toast management
3. **Toast.README.md** - Complete documentation
4. **Toast.INTEGRATION.md** - Step-by-step integration guide
5. **Toast.example.tsx** - Usage examples
6. **Toast.test.tsx** - Comprehensive tests
7. Updated **index.ts** - Exports for easy importing

## Quick Start

### 1. Add to App Root (app/_layout.tsx)

```tsx
import { ToastProvider } from '@/components/ui';

export default function RootLayout() {
  return (
    <ToastProvider>
      {/* Your app content */}
    </ToastProvider>
  );
}
```

### 2. Use in Components

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { showToast } = useToast();

  showToast('Message here', 'success');
  // variants: 'success' | 'error' | 'warning' | 'info'
}
```

## API

```tsx
showToast(message, variant, options)
```

**Parameters:**
- `message: string` - Text to display
- `variant: 'success' | 'error' | 'warning' | 'info'` - Visual style (default: 'info')
- `options?: { duration?: number; action?: { label: string; onPress: () => void } }`

**Examples:**

```tsx
// Basic
showToast('Saved!', 'success');

// Custom duration
showToast('Quick message', 'info', { duration: 1000 });

// With action
showToast('Deleted', 'success', {
  duration: 5000,
  action: { label: 'Undo', onPress: handleUndo }
});
```

## Features

- Animated slide-in/out with spring physics
- Auto-dismiss (configurable)
- Queue management (one at a time)
- Haptic feedback per variant
- Safe area aware
- Design system integrated
- Optional action buttons

## Variants

| Variant | Color | Icon | Use For |
|---------|-------|------|---------|
| success | Green | Checkmark | Completed actions, achievements |
| error | Red | X Circle | Failed operations, errors |
| warning | Amber | Warning | Important notices, cautions |
| info | Indigo | Info | General information, tips |

## Common Patterns

```tsx
// Save with error handling
try {
  await save();
  showToast('Saved!', 'success');
} catch (error) {
  showToast('Failed to save', 'error', {
    action: { label: 'Retry', onPress: save }
  });
}

// Network status
if (!isConnected) {
  showToast('You are offline', 'warning', { duration: 5000 });
}

// Achievement
showToast('5-day streak!', 'success', { duration: 4000 });
```

## Files Location

```
components/ui/
├── Toast.tsx                    # Main component
├── ToastProvider.tsx            # Provider & hook
├── Toast.README.md              # Full documentation
├── Toast.INTEGRATION.md         # Integration guide
├── Toast.example.tsx            # Examples
└── __tests__/Toast.test.tsx     # Tests
```

## Next Steps

1. ✅ Files created
2. ⏳ Add ToastProvider to app/_layout.tsx
3. ⏳ Replace existing Alert.alert() calls
4. ⏳ Test on real devices
5. ⏳ Customize if needed

## Dependencies (Already Installed)

- react-native-reanimated
- expo-haptics
- react-native-safe-area-context
- @expo/vector-icons

All set! No additional installations needed.
