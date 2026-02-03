# Toast System Architecture

## Component Hierarchy

```
App Root (_layout.tsx)
└── ToastProvider
    ├── Your App Content (Stack, Tabs, etc.)
    │   └── Any Component
    │       └── useToast() hook
    │           └── showToast() calls
    └── Toast Component (rendered at provider level)
```

## File Structure

```
vox-language-app/
├── components/
│   └── ui/
│       ├── Toast.tsx                    # 5.8KB - Main component
│       ├── ToastProvider.tsx            # 2.6KB - Context & provider
│       ├── Toast.README.md              # 7.7KB - Full documentation
│       ├── Toast.INTEGRATION.md         # 11KB  - Integration guide
│       ├── Toast.example.tsx            # 6.3KB - Usage examples
│       ├── TOAST_SUMMARY.md             # 3.1KB - Quick reference
│       ├── Toast.ARCHITECTURE.md        # This file
│       └── index.ts                     # Updated with exports
└── __tests__/
    └── components/
        └── ui/
            └── Toast.test.tsx           # 7.4KB - Test suite
```

## Data Flow

```
User Action
    ↓
Component calls showToast()
    ↓
ToastProvider adds to queue
    ↓
Queue processes (FIFO)
    ↓
Toast Component renders
    ↓
Animations execute (slide-in)
    ↓
Haptic feedback triggers
    ↓
Auto-dismiss timer starts
    ↓
User dismisses OR timer expires
    ↓
Animations execute (slide-out)
    ↓
Toast unmounts
    ↓
Next toast in queue renders (if any)
```

## State Management

### ToastProvider State

```tsx
{
  toasts: ToastItem[],        // Queue of pending toasts
  currentToast: ToastItem | null  // Currently displayed toast
}
```

### ToastItem Structure

```tsx
{
  id: string,                 // Unique identifier
  message: string,            // Display text
  variant: ToastVariant,      // 'success' | 'error' | 'warning' | 'info'
  duration?: number,          // Auto-dismiss time (ms)
  action?: {                  // Optional action button
    label: string,
    onPress: () => void
  }
}
```

## Animation Timeline

```
Time (ms)  Event
---------  -----
0          Toast component mounts
0          Haptic feedback triggers
0-300      Slide-in animation (spring)
0-300      Opacity fade-in (timing)
300        Toast fully visible
300-3300   Toast stays visible (duration)
3300       Auto-dismiss triggered
3300-3500  Slide-out animation (spring)
3300-3450  Opacity fade-out (timing)
3500       onDismiss callback
3500       Toast unmounts
3500       Next toast renders (if queued)
```

## Component Lifecycle

### Toast Component

```
Mount
  ↓
useEffect runs
  ↓
├── Trigger haptic feedback
├── Start slide-in animation
├── Start opacity animation
└── Set auto-dismiss timer
  ↓
Render with animations
  ↓
User interaction OR timer expires
  ↓
handleDismiss called
  ↓
├── Start slide-out animation
└── Start opacity fade-out
  ↓
Animation complete
  ↓
onDismiss callback
  ↓
Unmount
```

### ToastProvider

```
Mount
  ↓
Initialize state
  ↓
Listen for showToast calls
  ↓
Add toast to queue
  ↓
useEffect monitors queue & currentToast
  ↓
If no current toast & queue has items
  ↓
├── Pop first item from queue
└── Set as currentToast
  ↓
Render Toast component
  ↓
Toast completes & calls onDismiss
  ↓
Clear currentToast
  ↓
Loop (process next in queue)
```

## Design System Integration

### Colors Used

```tsx
// From constants/designSystem.ts
colors: {
  success: { DEFAULT: '#10B981', light: '#34D399' },
  error: { DEFAULT: '#EF4444', light: '#F87171' },
  warning: { DEFAULT: '#F59E0B', light: '#FBBF24' },
  primary: { DEFAULT: '#6366F1', light: '#818CF8' },
  text: { primary: '#F9FAFB' },
  glow: {
    success: 'rgba(16, 185, 129, 0.5)',
    error: 'rgba(239, 68, 68, 0.5)',
    primary: 'rgba(99, 102, 241, 0.5)'
  }
}
```

### Spacing & Layout

```tsx
spacing: { xs: 4, sm: 8, md: 16 }
borderRadius: { lg: 16 }
typography: { fontSize: { base: 16, sm: 14 } }
animation: {
  duration: { fast: 150, normal: 300 },
  spring: {
    default: { damping: 15, stiffness: 150 },
    stiff: { damping: 20, stiffness: 200 }
  }
}
```

## Dependencies

### React Native Core
- `react-native` - View, Text, TouchableOpacity, StyleSheet

### Expo Modules
- `expo-haptics` - Tactile feedback
- `@expo/vector-icons` - Ionicons for variant icons

### Third-party
- `react-native-reanimated` - Smooth animations
- `react-native-safe-area-context` - Safe area insets

### Internal
- `@/constants/designSystem` - Design tokens

## API Surface

### Public Exports

```tsx
// From components/ui/index.ts
export { Toast } from './Toast';
export type { ToastProps, ToastVariant } from './Toast';
export { ToastProvider, useToast } from './ToastProvider';
```

### Hook API

```tsx
const { showToast } = useToast();

showToast: (
  message: string,
  variant?: ToastVariant,
  options?: ToastOptions
) => void
```

### Type Definitions

```tsx
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastProps {
  message: string;
  variant: ToastVariant;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}
```

## Performance Considerations

### Optimization Strategies

1. **Single Toast Rendering**: Only one toast rendered at a time
2. **Reanimated Worklets**: Animations run on UI thread
3. **Memoization**: Toast component doesn't re-render unnecessarily
4. **Lazy Queue Processing**: Toasts processed only when needed

### Memory Management

- Toasts automatically unmount after dismissal
- Queue cleared as toasts are displayed
- No memory leaks from timers (cleanup in useEffect)
- Shared values properly released

## Testing Strategy

### Unit Tests
- Component rendering with all variants
- Icon mapping correctness
- Dismiss functionality
- Auto-dismiss timing
- Action button interaction

### Integration Tests
- Provider context availability
- Queue management
- Multiple toast handling
- Error boundaries

### Manual Testing Checklist
- [ ] All variants render correctly
- [ ] Animations smooth on both iOS/Android
- [ ] Safe area respected on notched devices
- [ ] Haptic feedback works on supported devices
- [ ] Toast dismisses after duration
- [ ] Manual dismiss works
- [ ] Action buttons trigger correctly
- [ ] Queue processes in order
- [ ] No z-index conflicts with other UI

## Future Enhancement Ideas

### Potential Features
- [ ] Multiple simultaneous toasts (stacked)
- [ ] Bottom position variant
- [ ] Swipe-to-dismiss gesture
- [ ] Progress bar for duration
- [ ] Custom icons/colors
- [ ] Sound effects
- [ ] Persistent toasts across navigation
- [ ] Toast history/log
- [ ] A/B testing for duration/position

### Customization Points
- Animation curves
- Position (top/bottom/center)
- Background opacity
- Blur effect intensity
- Shadow intensity
- Font sizes
- Icon sizes
- Border radius
