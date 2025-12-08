# AddWordModal & AddWordForm - Visual Reference

## Modal Structure

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  <- Dark backdrop
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │     (rgba(0,0,0,0.7))
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░░░░                                       ░░░░   │
│  ░░░░  ┌──────────────────────────────┐  ░░░░     │
│  ░░░░  │         ═══════              │  ░░░░     │  <- Drag handle
│  ░░░░  │                              │  ░░░░     │
│  ░░░░  │  Add New Word            [X] │  ░░░░     │  <- Header
│  ░░░░  ├──────────────────────────────┤  ░░░░     │
│  ░░░░  │                              │  ░░░░     │
│  ░░░░  │  [Form Content - scrollable] │  ░░░░     │  <- Form area
│  ░░░░  │                              │  ░░░░     │
│  ░░░░  │                              │  ░░░░     │
│  ░░░░  ├──────────────────────────────┤  ░░░░     │
│  ░░░░  │ [Cancel]  [Add Word ▶▶▶▶▶▶] │  ░░░░     │  <- Actions
│  ░░░░  └──────────────────────────────┘  ░░░░     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────────────────┘
```

## Form Layout (AddWordForm)

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  ⚠️ Translation is required                       │  <- Error (if present)
│                                                   │
│  Word *                                           │  <- Required field
│  ┌─────────────────────────────────────────────┐ │
│  │ bonjour                                     │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Translation *                                    │  <- Required field
│  ┌─────────────────────────────────────────────┐ │
│  │ hello                                       │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Category                                         │  <- Optional
│  ┌─────────────────────────────────────────────┐ │
│  │ greetings                                   │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  CEFR Level                                       │  <- Horizontal selector
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │ A1 │ │ A2 │ │ B1 │ │ B2 │ │ C1 │ │ C2 │     │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘     │
│    ↑ Selected (filled with primary color)       │
│                                                   │
│  Part of Speech                                   │  <- Selector buttons
│  ┌──────┐ ┌──────┐ ┌───────────┐ ┌────────┐    │
│  │ Noun │ │ Verb │ │ Adjective │ │ Adverb │    │
│  └──────┘ └──────┘ └───────────┘ └────────┘    │
│  ┌────────┐ ┌───────┐                           │
│  │ Phrase │ │ Other │                           │
│  └────────┘ └───────┘                           │
│               ↑ Selected (filled)                │
│                                                   │
│  Example Sentence                                 │  <- Multiline
│  ┌─────────────────────────────────────────────┐ │
│  │ Bonjour, comment ça va?                     │ │
│  │                                             │ │
│  │                                             │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
└───────────────────────────────────────────────────┘
│                                                   │
├───────────────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────────────────┐   │
│  │  Cancel    │  │  Add Word ▶▶▶▶▶▶▶▶▶▶▶  │   │  <- Actions
│  └────────────┘  └──────────────────────────┘   │
│   (gray bg)       (gradient bg + glow)          │
└───────────────────────────────────────────────────┘
```

## Color Coding

### Input States

**Normal State:**
```
┌────────────────────────────┐
│ Enter word...              │  <- Background: #1A1F3A (card)
└────────────────────────────┘     Border: #374151 (light)
                                   Text: #F9FAFB (primary)
```

**Active/Focused:**
```
┌────────────────────────────┐
│ bonjour▊                   │  <- Border: slightly lighter
└────────────────────────────┘     Placeholder: #9CA3AF (tertiary)
```

### Button States

**CEFR Level - Unselected:**
```
┌────┐
│ A1 │  <- Background: #1A1F3A (card)
└────┘     Border: #374151 (light)
           Text: #D1D5DB (secondary)
```

**CEFR Level - Selected:**
```
┌────┐
│ A1 │  <- Background: #6366F1 (primary)
└────┘     Border: #6366F1 (primary)
           Text: #F9FAFB (primary, bold)
```

**Submit Button (Gradient):**
```
┌──────────────────────────┐
│  Add Word                │  <- Gradient: #6366F1 → #8B5CF6
└──────────────────────────┘     Text: #F9FAFB (bold)
                                 Glow: rgba(99,102,241,0.5)
```

**Submit Button (Loading):**
```
┌──────────────────────────┐
│         ⌛               │  <- ActivityIndicator spinning
└──────────────────────────┘     Same gradient background
```

**Cancel Button:**
```
┌──────────────────────────┐
│       Cancel             │  <- Background: #222845 (elevated)
└──────────────────────────┘     Border: #374151 (light)
                                 Text: #D1D5DB (secondary)
```

### Error State

```
┌──────────────────────────────────────┐
│ ⚠️ Word is required                  │  <- Background: rgba(239,68,68,0.1)
└──────────────────────────────────────┘     Border: #EF4444 (error)
                                             Text: #EF4444 (error)
```

## Animation Timeline

### Opening Modal
```
Time: 0ms
┌─────────────────┐
│                 │
│                 │
│                 │
└─────────────────┘
      (offscreen below)

Time: 200ms
┌─────────────────┐
│  ░░░░░░░░░░░░░  │  <- Backdrop fades in
│  ░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░  │
└─────────────────┘
      (modal still below)

Time: 400ms
┌─────────────────┐
│  ░░░░░░░░░░░░░  │
│  ░░░┌─────┐░░░  │  <- Modal slides up with spring
│  ░░░│Modal│░░░  │
└─────┴─────┴─────┘
```

### Closing Modal
```
Time: 0ms
┌─────────────────┐
│  ░░░░░░░░░░░░░  │
│  ░░░┌─────┐░░░  │
│  ░░░│Modal│░░░  │
└─────┴─────┴─────┘

Time: 300ms
┌─────────────────┐
│  (fading out)   │  <- Backdrop + modal slide down
│                 │
│                 │
└─────────────────┘
```

## Responsive Behavior

### Keyboard Visible
```
┌───────────────────────┐
│  ┌─────────────────┐  │
│  │ Add New Word [X]│  │  <- Header stays visible
│  ├─────────────────┤  │
│  │                 │  │
│  │ [Word input]    │  │  <- Scrollable content
│  │ [Translation]   │  │     shifts up
│  │ ...             │  │
│  ├─────────────────┤  │
│  │[Cancel][Submit] │  │  <- Actions stay at bottom
│  └─────────────────┘  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  <- Keyboard
└───────────────────────┘
```

### Small Screen (< 400px height)
```
Modal adjusts to 90% of screen height with scroll
```

## Interaction Flow

```
1. User taps "Add Word" button
   ↓
2. Modal slides up (400ms spring animation)
   ↓
3. User fills required fields (word, translation)
   ↓
4. [Optional] User selects CEFR level
   └→ Light haptic feedback on tap
   ↓
5. [Optional] User selects part of speech
   └→ Light haptic feedback on tap
   ↓
6. User taps "Add Word"
   ↓
   ┌─────────────────────────┐
   │ 6a. Fields empty?       │
   │     → Show error        │
   │     → Error haptic      │
   └─────────────────────────┘
   │
   ┌─────────────────────────┐
   │ 6b. Valid input?        │
   │     → Show loading      │
   │     → Save to DB        │
   │     → Success haptic    │
   │     → Close modal       │
   └─────────────────────────┘
```

## Platform Differences

### iOS
- Native shadow with blur
- Smooth spring animations
- Haptic feedback works perfectly

### Android
- Elevation-based shadows
- Same spring animations
- Haptic feedback via Vibration API

## Accessibility

### Voice Over / TalkBack
```
"Word, text field, required"
"Translation, text field, required"
"Category, text field"
"CEFR Level selector"
"A1, button, selected"
"Part of Speech selector"
"Other, button, selected"
"Example Sentence, text field, multiline"
"Cancel, button"
"Add Word, button"
```

## Size Reference

### Component Dimensions
- Modal max width: 100% of screen
- Modal max height: 90% of screen
- Header height: ~80px
- Footer height: ~72px
- Input height: 48px
- CEFR button: 50px x 40px
- Submit button height: 48px
- Border radius (modal): 32px
- Border radius (inputs): 12px

### Spacing
- Container padding: 32px
- Field vertical gap: 24px
- Label to input: 8px
- CEFR button gap: 8px
- Action button gap: 16px

## Typography Scale

```
Title:            24px, Bold,      #F9FAFB
Labels:           16px, Medium,    #D1D5DB
Required (*):     16px, Medium,    #EF4444
Input text:       16px, Regular,   #F9FAFB
Input placeholder:16px, Regular,   #9CA3AF
Error message:    14px, Regular,   #EF4444
Button text:      16px, Bold,      #F9FAFB
CEFR text:        16px, Medium,    #D1D5DB (unselected)
CEFR text:        16px, Bold,      #F9FAFB (selected)
```
