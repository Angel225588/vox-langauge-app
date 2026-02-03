# ComparisonCard Component

A redesigned card component for comparing related words, verb tenses, homophones, and regional differences.

## Features

### Core Features
- **Flexible Grid Layout**: Supports 2-4 comparison items in a responsive grid
- **Multiple Use Cases**: Verb tenses, homophones, formal/informal, and regional differences
- **Interactive Examples**: Reveal/hide examples with audio playback
- **Spaced Repetition**: Built-in quality ratings (Need Practice, Got it, Easy)
- **Audio Support**: Play audio for words and example sentences
- **Haptic Feedback**: Tactile feedback for all interactions

### Visual Design
- Gradient labels with customizable colors
- Dark card backgrounds with depth
- Fixed bottom buttons for spaced repetition
- Scrollable content area for long examples
- Audio play/pause indicators

## Props Interface

```typescript
interface ComparisonItem {
  label: string;              // "Present", "Past", "Formal", etc.
  word: string;               // The word or phrase
  phonetic?: string;          // IPA pronunciation
  examples?: ExampleSentence[]; // Example sentences with translations
  tagColor?: readonly string[]; // Custom gradient colors for label
}

interface ComparisonCardProps {
  title?: string;             // Card title (e.g., "Verb Tenses: To Go")
  items: ComparisonItem[];    // 2-4 items to compare
  type: 'verb-tense' | 'homophone' | 'formal-informal' | 'regional';
  onComplete: (quality: 'forgot' | 'remembered' | 'easy') => void;
  showExamples?: boolean;     // Start with examples revealed
  language?: string;          // TTS language code (default: 'en-US')
}
```

## Usage Examples

### Verb Tenses (4 items)
```tsx
<ComparisonCard
  title="Verb Tenses: To Go"
  type="verb-tense"
  items={[
    {
      label: 'Present',
      word: 'go',
      phonetic: '/ɡoʊ/',
      examples: [
        {
          text: 'I go to school every day.',
          translation: 'Voy a la escuela todos los días.',
        },
      ],
    },
    {
      label: 'Past',
      word: 'went',
      phonetic: '/wɛnt/',
      examples: [
        {
          text: 'Yesterday, I went to the movies.',
          translation: 'Ayer, fui al cine.',
        },
      ],
    },
    // ... more tenses
  ]}
  onComplete={(quality) => console.log('Rating:', quality)}
/>
```

### Homophones (3 items)
```tsx
<ComparisonCard
  title="Homophones: There, Their, They're"
  type="homophone"
  items={[
    {
      label: 'Location',
      word: 'there',
      phonetic: '/ðɛr/',
      examples: [
        {
          text: 'Put the book over there.',
          translation: 'Pon el libro allí.',
        },
      ],
    },
    // ... more homophones
  ]}
  onComplete={(quality) => console.log('Rating:', quality)}
/>
```

### Formal vs Informal (2 items)
```tsx
<ComparisonCard
  title="Greetings: Formal vs Informal"
  type="formal-informal"
  items={[
    {
      label: 'Formal',
      word: 'Good morning',
      tagColor: colors.gradients.primary,
    },
    {
      label: 'Informal',
      word: "What's up?",
      tagColor: colors.gradients.secondary,
    },
  ]}
  onComplete={(quality) => console.log('Rating:', quality)}
/>
```

### Regional Differences (2 items)
```tsx
<ComparisonCard
  title="Regional: Apartment"
  type="regional"
  items={[
    {
      label: 'American',
      word: 'apartment',
      phonetic: '/əˈpɑːrtmənt/',
    },
    {
      label: 'British',
      word: 'flat',
      phonetic: '/flæt/',
    },
  ]}
  onComplete={(quality) => console.log('Rating:', quality)}
/>
```

## Layout Behavior

- **2 items**: 2 columns, equal width
- **3 items**: Flexible wrap, ~48% width each (2 on top, 1 on bottom)
- **4 items**: 2x2 grid, equal width

## User Interactions

### Reveal Examples Button
- Toggles visibility of example sentences
- Only shown if at least one item has examples
- Icon changes: eye (hidden) / eye-off (revealed)

### Audio Playback
- Main word: Play button on each card
- Examples: Play-circle button next to each example
- Visual feedback: Icon changes to pause while playing

### Spaced Repetition Buttons
- **Need Practice** (Red): User struggled - show again soon
- **Got it** (Green): User remembered - standard interval
- **Easy** (Blue): User found it easy - longer interval

## Design System Integration

### Colors
- Uses design system gradients
- Default tag colors rotate through primary, secondary, accent, warning
- Custom colors supported via `tagColor` prop

### Typography
- Title: 2xl, bold
- Word: 2xl, bold
- Phonetic: sm, italic
- Example text: sm, medium
- Example translation: xs, normal

### Spacing
- Card padding: lg (24px)
- Grid gap: md (16px)
- Internal spacing: responsive to content

## Accessibility

- Haptic feedback for all interactions
- High contrast text on dark backgrounds
- Clear visual hierarchy
- Audio support for auditory learners

## Future Enhancements

- [ ] Replace expo-speech with Google Cloud TTS
- [ ] Add slow/normal playback speed toggle
- [ ] Highlight target word in example sentences
- [ ] Animation when revealing examples
- [ ] Support for more than 4 items with horizontal scroll
- [ ] Offline audio caching

## Files

- `ComparisonCard.tsx` - Main component
- `ComparisonCard.example.tsx` - Usage examples
- `ComparisonCard.README.md` - This documentation
