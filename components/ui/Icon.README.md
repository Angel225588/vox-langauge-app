# Icon System Documentation

A centralized icon system for the Vox Language App that provides consistent styling and easy access to common icons.

## Components

### `Icon`
Base icon component with design system integration.

### `IconButton`
Touchable icon component with haptic feedback and animations.

---

## Icon Component

### Basic Usage

```tsx
import { Icon } from '@/components/ui';

// Simple icon
<Icon name="checkmark" />

// With size and color
<Icon name="heart" size="lg" color="error" />

// Custom size (in pixels)
<Icon name="star" size={28} color="warning" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `CommonIconName \| IoniconsName` | Required | Icon name from Ionicons or common icons map |
| `size` | `IconSize \| number` | `'md'` | Size variant or custom pixel size |
| `color` | `IconColor \| string` | `'text-primary'` | Color variant or custom hex/rgba color |
| `style` | `any` | - | Custom style override |

### Size Variants

| Variant | Size (px) | Use Case |
|---------|-----------|----------|
| `sm` | 16 | Small inline icons, badges |
| `md` | 20 | Standard UI icons, list items |
| `lg` | 24 | Prominent icons, headers |
| `xl` | 32 | Hero icons, feature highlights |

### Color Variants

All design system colors are available:

- **Semantic**: `primary`, `secondary`, `success`, `error`, `warning`
- **Variants**: `primary-light`, `primary-dark`, etc.
- **Accent**: `accent`, `accent-purple`, `accent-pink`, `accent-orange`, `accent-cyan`
- **Text**: `text-primary`, `text-secondary`, `text-tertiary`, `text-disabled`
- **Other**: `white`

### Common Icons

The system includes pre-mapped common icons for easy access:

#### Actions
`checkmark`, `checkmark-circle`, `checkmark-done`, `close`, `close-circle`, `add`, `add-circle`, `remove`, `remove-circle`

#### Media Controls
`play`, `play-circle`, `pause`, `pause-circle`, `stop`, `stop-circle`

#### Audio
`mic`, `mic-outline`, `mic-off`, `volume`, `volume-high`, `volume-medium`, `volume-low`, `volume-mute`, `volume-off`

#### Favorites
`heart`, `heart-outline`, `bookmark`, `bookmark-outline`, `star`, `star-outline`

#### Navigation
`chevron-back`, `chevron-forward`, `chevron-up`, `chevron-down`, `arrow-back`, `arrow-forward`, `arrow-up`, `arrow-down`

#### Settings & Info
`settings`, `settings-outline`, `help`, `help-outline`, `info`, `info-outline`, `warning`, `warning-outline`, `alert`, `alert-outline`

#### App Sections
`home`, `home-outline`, `search`, `search-outline`, `person`, `person-outline`, `menu`, `menu-outline`

#### Learning Specific
`book`, `book-outline`, `library`, `library-outline`, `trophy`, `trophy-outline`, `flame`, `flame-outline`

#### Editing
`create`, `create-outline`, `trash`, `trash-outline`, `copy`, `copy-outline`

#### Other
`eye`, `eye-outline`, `eye-off`, `eye-off-outline`, `time`, `time-outline`, `calendar`, `calendar-outline`

---

## IconButton Component

### Basic Usage

```tsx
import { IconButton } from '@/components/ui';

// Simple button
<IconButton name="settings" onPress={handleSettings} />

// Filled button with custom background
<IconButton
  name="play"
  variant="filled"
  backgroundColor="primary"
  onPress={handlePlay}
/>

// Outlined button
<IconButton
  name="checkmark"
  variant="outlined"
  borderColor="success"
  color="success"
  onPress={handleConfirm}
/>
```

### Props

Extends `Icon` props with additional button-specific props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `() => void` | Required | Press handler |
| `variant` | `'default' \| 'filled' \| 'outlined' \| 'ghost'` | `'default'` | Button style variant |
| `shape` | `'circle' \| 'square' \| 'rounded'` | `'circle'` | Button shape |
| `backgroundColor` | `string` | - | Background color (for filled variant) |
| `borderColor` | `string` | - | Border color (for outlined variant) |
| `disabled` | `boolean` | `false` | Disabled state |
| `accessibilityLabel` | `string` | - | Accessibility label |
| `accessibilityHint` | `string` | - | Accessibility hint |
| `haptics` | `boolean` | `true` | Enable haptic feedback |
| `hapticStyle` | `'light' \| 'medium' \| 'heavy'` | `'light'` | Haptic feedback intensity |
| `style` | `ViewStyle` | - | Custom container style |

### Variants

#### Default
Semi-transparent background with subtle border.
```tsx
<IconButton name="settings" onPress={handlePress} />
```

#### Filled
Solid background color, ideal for primary actions.
```tsx
<IconButton
  name="play"
  variant="filled"
  backgroundColor="primary"
  onPress={handlePress}
/>
```

#### Outlined
Transparent background with visible border.
```tsx
<IconButton
  name="close"
  variant="outlined"
  borderColor="error"
  color="error"
  onPress={handlePress}
/>
```

#### Ghost
No background or border, just the icon.
```tsx
<IconButton
  name="info"
  variant="ghost"
  color="primary"
  onPress={handlePress}
/>
```

### Shapes

| Shape | Description | Use Case |
|-------|-------------|----------|
| `circle` | Fully rounded (default) | Modern, soft feel |
| `rounded` | Rounded corners | Balanced, versatile |
| `square` | Sharp corners | Technical, precise |

### Accessibility

Always provide accessibility labels:

```tsx
<IconButton
  name="play"
  onPress={handlePlay}
  accessibilityLabel="Play lesson audio"
  accessibilityHint="Plays the audio for this lesson"
/>
```

### Minimum Touch Target

IconButton automatically ensures a **minimum 44x44px touch target** as per iOS Human Interface Guidelines, making buttons easier to tap.

---

## Real-World Examples

### Header Navigation

```tsx
<View style={styles.header}>
  <IconButton
    name="chevron-back"
    onPress={() => router.back()}
    variant="ghost"
    accessibilityLabel="Go back"
  />
  <Text style={styles.title}>Lesson Title</Text>
  <IconButton
    name="settings"
    onPress={handleSettings}
    variant="ghost"
    accessibilityLabel="Open settings"
  />
</View>
```

### Audio Player Controls

```tsx
<View style={styles.controls}>
  <IconButton
    name="play-circle"
    size="xl"
    variant="filled"
    backgroundColor="primary"
    onPress={handlePlay}
    accessibilityLabel="Play audio"
  />
  <IconButton
    name="heart-outline"
    variant="ghost"
    color="text-secondary"
    onPress={handleFavorite}
    accessibilityLabel="Add to favorites"
  />
</View>
```

### Status Indicators

```tsx
<View style={styles.statusRow}>
  <View style={styles.statusItem}>
    <Icon name="checkmark-circle" size="md" color="success" />
    <Text style={styles.statusText}>Completed</Text>
  </View>
  <View style={styles.statusItem}>
    <Icon name="flame" size="md" color="warning" />
    <Text style={styles.statusText}>5 day streak</Text>
  </View>
</View>
```

### Quiz Answer Feedback

```tsx
{isCorrect ? (
  <Icon name="checkmark-circle" size="lg" color="success" />
) : (
  <Icon name="close-circle" size="lg" color="error" />
)}
```

### Recording Button

```tsx
<IconButton
  name={isRecording ? "stop-circle" : "mic"}
  variant="filled"
  backgroundColor={isRecording ? "error" : "primary"}
  onPress={toggleRecording}
  hapticStyle="medium"
  accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
/>
```

---

## Migration Guide

### Before (using @expo/vector-icons directly)

```tsx
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/designSystem';

<Ionicons name="checkmark" size={24} color={colors.success.DEFAULT} />
```

### After (using Icon component)

```tsx
import { Icon } from '@/components/ui';

<Icon name="checkmark" size="lg" color="success" />
```

### Benefits
- Consistent sizing across the app
- Type-safe icon names
- Automatic design system integration
- Easier to refactor and maintain
- Better IDE autocomplete

---

## Design System Integration

The Icon system is fully integrated with the design system:

- **Colors**: All color variants map to `constants/designSystem.ts`
- **Spacing**: IconButton respects minimum touch targets
- **Typography**: Sizes align with the design system scale
- **Haptics**: Uses expo-haptics for consistent feedback

---

## TypeScript Support

Full TypeScript support with autocompletion:

```tsx
import { Icon, IconButton, type IconProps, type IconButtonProps } from '@/components/ui';

// IconProps includes all common icon names
const iconName: IconProps['name'] = 'checkmark'; // ✅

// Size and color are type-safe
<Icon name="heart" size="lg" color="success" /> // ✅
<Icon name="heart" size="xxl" color="invalid" /> // ❌ Type error
```

---

## Best Practices

1. **Use semantic colors**: Prefer `color="success"` over custom hex values
2. **Consistent sizing**: Use size variants instead of arbitrary pixel values
3. **Accessibility**: Always provide `accessibilityLabel` for IconButton
4. **Haptics**: Keep haptics enabled for better UX (disable only if needed)
5. **Common icons**: Use predefined common icons when available
6. **Outlined variants**: Great for secondary actions
7. **Ghost variants**: Best for navigation and non-critical actions

---

## Testing

The Icon system is designed to be easily testable:

```tsx
import { render } from '@testing-library/react-native';
import { Icon, IconButton } from '@/components/ui';

// Test Icon rendering
test('renders icon with correct props', () => {
  const { getByTestId } = render(
    <Icon name="checkmark" size="lg" color="success" />
  );
  // Add assertions
});

// Test IconButton press
test('calls onPress when button is pressed', () => {
  const onPress = jest.fn();
  const { getByA11yLabel } = render(
    <IconButton
      name="settings"
      onPress={onPress}
      accessibilityLabel="Settings button"
    />
  );
  // Simulate press and assert
});
```

---

## Performance

- Icons are rendered using native components (Ionicons)
- IconButton animations use `react-native-reanimated` for 60fps performance
- No unnecessary re-renders (properly memoized)
- Lightweight bundle size (uses existing @expo/vector-icons)

---

## Support

For issues or questions about the Icon system, refer to:
- `/components/ui/Icon.tsx` - Main Icon component
- `/components/ui/IconButton.tsx` - IconButton component
- `/components/ui/Icon.examples.tsx` - Usage examples
