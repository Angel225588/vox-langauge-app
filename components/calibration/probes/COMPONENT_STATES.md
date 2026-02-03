# VocabProbe Component States

## Visual State Flow

### 1. Initial State (Default)
```
┌─────────────────────────────────────┐
│  Category Badge: [Greetings · noun] │
│                                     │
│           "Hello"                   │
│         /həˈloʊ/                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✓  I know this              │   │ <- Green gradient on select
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ?  Not sure                 │   │ <- Amber gradient on select
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✕  Don't know               │   │ <- Red gradient on select
│  └─────────────────────────────┘   │
│                                     │
│  ℹ Be honest - this helps us...    │
└─────────────────────────────────────┘
           [ Skip ]

       ○  ━  ○    <- Progress dots
```

**Behavior:**
- Card fades in from bottom (FadeInDown)
- Word opacity animates 0 → 1
- Card scales 0.95 → 1.0
- All buttons are in default state (dark gradient)

### 2. Button Hover/Press State
```
┌─────────────────────────────────────┐
│  Category Badge: [Greetings · noun] │
│                                     │
│           "Hello"                   │
│         /həˈloʊ/                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✓  I know this              │   │ <- Scale: 0.95 (pressed)
│  └─────────────────────────────┘   │    Opacity: 0.8
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ?  Not sure                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✕  Don't know               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ℹ Be honest - this helps us...    │
└─────────────────────────────────────┘
```

**Behavior:**
- Light haptic on press-in
- Button scales down to 0.95
- Opacity reduces to 0.8
- Spring animation

### 3. After Selection (Translation Reveal)
```
┌─────────────────────────────────────┐
│  Category Badge: [Greetings · noun] │
│                                     │
│           "Hello"                   │
│         /həˈloʊ/                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✓  Hola                     │   │ <- Translation shown
│  └─────────────────────────────┘   │    Green background glow
│                                     │
│  (Buttons hidden)                   │
│                                     │
└─────────────────────────────────────┘

(Skip button hidden)

       ○  ━  ○    <- Progress dots
```

**Behavior:**
- Selected button fades out
- Translation section fades in from bottom (FadeInDown)
- Checkmark icon appears
- Green glow effect
- 1500ms delay before calling onComplete
- Medium haptic on selection

### 4. Skip State
```
(Same as Initial State but transitions immediately)
```

**Behavior:**
- Light haptic on skip
- Immediate transition to next item
- No translation reveal
- No response recorded

## Component Measurements

### Card Dimensions
- Width: `SCREEN_WIDTH - 48px` (spacing.lg * 2)
- Padding: `32px` (spacing.xl)
- Border radius: `24px` (borderRadius.xl)

### Typography
- Word: `36px` bold (fontSize.4xl)
- Phonetic: `18px` normal italic (fontSize.lg)
- Category: `14px` medium uppercase (fontSize.sm)
- Translation: `20px` medium (fontSize.xl)
- Button text: `18px` semibold (fontSize.lg)
- Hint: `14px` italic (fontSize.sm)

### Button Dimensions
- Height: ~56px (padding: 24px vertical + text)
- Full width
- Gap between buttons: `16px` (spacing.md)
- Icon size: `28px`

### Colors by State

#### Default Button
- Background: Dark gradient (`#222845` → `#1A1F3A`)
- Text: Light gray (`#D1D5DB`)
- Icon: Light gray

#### Selected "I know this"
- Background: Green gradient (`#10B981` → `#34D399`)
- Text: White (`#FFFFFF`)
- Icon: White
- Glow: Green (`rgba(16, 185, 129, 0.5)`)

#### Selected "Not sure"
- Background: Amber gradient (`#F59E0B` → `#FBBF24`)
- Text: White
- Icon: White
- Glow: Amber

#### Selected "Don't know"
- Background: Red gradient (`#EF4444` → `#F87171`)
- Text: White
- Icon: White
- Glow: Red

#### Translation Section
- Background: Green tint (`rgba(16, 185, 129, 0.1)`)
- Border: Green (`rgba(16, 185, 129, 0.3)`)
- Text: Light green (`#34D399`)
- Icon: Green (`#10B981`)

## Animation Timeline

```
0ms    - Component mounts
         ├─ Card scale: 0.95 → 1.0 (spring)
         └─ Word opacity: 0 → 1 (spring)

~300ms - Animations complete, interactive

User presses button:
├─ 0ms   - Light haptic (onPressIn)
├─ 50ms  - Scale: 1 → 0.95 (spring)
├─ 100ms - Button released
├─ 150ms - Scale: 0.95 → 1 (spring)
└─ 200ms - Medium haptic

Translation reveal:
├─ 0ms   - Buttons fade out
├─ 0ms   - Translation fades in from bottom (300ms)
├─ 300ms - Translation visible
└─ 1500ms - onComplete called
```

## Haptic Feedback Pattern

1. **Light**: Button press-in (every button)
2. **Medium**: Button press complete (selection made)
3. **Light**: Skip button press

## Progress Dots

- Inactive dot: `8px` circle, white 20% opacity
- Active dot: `24px` pill, primary color (`#6366F1`)
- Active dot has glow effect
- Gap: `8px` (spacing.sm)

## Accessibility Features

- Minimum touch target: 56px height (buttons)
- High contrast ratios:
  - Word on background: 19:1
  - Button text on gradient: 4.5:1+
- Haptic feedback for all interactions
- Clear visual state changes
- No reliance on color alone (icons + text)

## Responsive Behavior

- Card width adjusts to screen size
- Maintains 24px horizontal margins
- Vertical centering in viewport
- Minimum safe area padding

## Error States

Currently not implemented (calibration probes have no "wrong" answers):
- All responses are valid
- No error feedback needed
- No validation required

## Loading States

Not applicable (component is stateless for initial render):
- Item data passed as prop
- No async operations
- Instant interaction
