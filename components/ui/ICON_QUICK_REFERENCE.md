# Icon System - Quick Reference

## Import

```tsx
import { Icon, IconButton } from '@/components/ui';
```

## Icon Component

### Syntax
```tsx
<Icon name="icon-name" size="variant" color="variant" />
```

### Sizes
- `sm` → 16px
- `md` → 20px (default)
- `lg` → 24px
- `xl` → 32px

### Colors
`primary` | `secondary` | `success` | `error` | `warning` | `accent` | `text-primary` | `text-secondary` | `text-tertiary` | `text-disabled` | `white`

### Common Examples
```tsx
<Icon name="checkmark" size="lg" color="success" />
<Icon name="heart" size="md" color="error" />
<Icon name="play" size="xl" color="primary" />
<Icon name="star" size="sm" color="warning" />
```

---

## IconButton Component

### Syntax
```tsx
<IconButton
  name="icon-name"
  onPress={handler}
  variant="variant"
  accessibilityLabel="Description"
/>
```

### Variants
- `default` → Semi-transparent with border
- `filled` → Solid background
- `outlined` → Transparent with border
- `ghost` → No background/border

### Shapes
- `circle` → Fully rounded (default)
- `rounded` → Rounded corners
- `square` → Sharp corners

### Common Examples

#### Default
```tsx
<IconButton name="settings" onPress={handlePress} />
```

#### Filled
```tsx
<IconButton
  name="play"
  variant="filled"
  backgroundColor="primary"
  onPress={handlePlay}
  accessibilityLabel="Play"
/>
```

#### Outlined
```tsx
<IconButton
  name="checkmark"
  variant="outlined"
  borderColor="success"
  color="success"
  onPress={handleConfirm}
  accessibilityLabel="Confirm"
/>
```

#### Ghost
```tsx
<IconButton
  name="info"
  variant="ghost"
  color="primary"
  onPress={handleInfo}
  accessibilityLabel="Information"
/>
```

---

## Most Used Icons

### Actions
`checkmark` `close` `add` `remove` `trash` `create`

### Media
`play` `pause` `stop` `mic` `volume-high` `volume-mute`

### Navigation
`chevron-back` `chevron-forward` `chevron-up` `chevron-down`

### Favorites
`heart` `heart-outline` `bookmark` `bookmark-outline` `star` `star-outline`

### Settings
`settings` `help` `info` `warning` `alert`

### App
`home` `search` `person` `menu`

### Learning
`book` `library` `trophy` `flame`

---

## Real-World Patterns

### Header
```tsx
<IconButton name="chevron-back" onPress={() => router.back()} variant="ghost" />
```

### Play/Pause
```tsx
<IconButton
  name={isPlaying ? "pause-circle" : "play-circle"}
  size="xl"
  variant="filled"
  backgroundColor="primary"
  onPress={togglePlay}
/>
```

### Recording
```tsx
<IconButton
  name={isRecording ? "stop-circle" : "mic"}
  variant="filled"
  backgroundColor={isRecording ? "error" : "primary"}
  onPress={toggleRecording}
  hapticStyle="medium"
/>
```

### Status
```tsx
<Icon name="checkmark-circle" size="md" color="success" />
```

---

## Props Quick Lookup

### Icon Props
| Prop | Type | Default |
|------|------|---------|
| name | string | required |
| size | sm/md/lg/xl/number | md |
| color | string | text-primary |
| style | any | - |

### IconButton Props
| Prop | Type | Default |
|------|------|---------|
| name | string | required |
| onPress | function | required |
| variant | default/filled/outlined/ghost | default |
| shape | circle/rounded/square | circle |
| backgroundColor | string | - |
| borderColor | string | - |
| disabled | boolean | false |
| accessibilityLabel | string | - |
| haptics | boolean | true |
| hapticStyle | light/medium/heavy | light |

---

## Accessibility

Always add labels:
```tsx
<IconButton
  name="play"
  onPress={handlePlay}
  accessibilityLabel="Play lesson audio"
  accessibilityHint="Plays the audio for this lesson"
/>
```

---

## Files

- **Components**: `components/ui/Icon.tsx`, `components/ui/IconButton.tsx`
- **Docs**: `components/ui/Icon.README.md`
- **Examples**: `components/ui/Icon.examples.tsx`
- **Demo**: `app/(tabs)/icon-demo.tsx`

---

## Testing

Navigate to `/icon-demo` to test all variants interactively.
