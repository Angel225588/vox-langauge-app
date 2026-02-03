# VocabProbe Quick Start Guide

## Installation

No additional dependencies needed! The component uses existing project libraries:
- React Native (built-in)
- expo-linear-gradient (already installed)
- react-native-reanimated (already installed)
- @expo/vector-icons (already installed)

## Basic Usage (30 seconds)

```tsx
import { VocabProbe } from '@/components/calibration/probes';

// Create a vocabulary item
const word = {
  id: '1',
  word: 'Hello',
  translation: 'Hola',
  phonetic: '/həˈloʊ/',
  difficulty: 'A1',
  category: 'Greetings',
  partOfSpeech: 'interjection',
};

// Use in your component
function MyScreen() {
  return (
    <VocabProbe
      item={word}
      onComplete={(response) => {
        console.log(response.confidence); // 'high' | 'medium' | 'low'
        // Move to next item
      }}
    />
  );
}
```

## Complete Example (2 minutes)

```tsx
import React, { useState } from 'react';
import { VocabProbe } from '@/components/calibration/probes';

// Sample vocabulary for calibration
const WORDS = [
  {
    id: '1',
    word: 'Hello',
    translation: 'Hola',
    phonetic: '/həˈloʊ/',
    difficulty: 'A1',
    category: 'Greetings',
    partOfSpeech: 'interjection',
  },
  {
    id: '2',
    word: 'Restaurant',
    translation: 'Restaurante',
    phonetic: '/ˈrestərɑːnt/',
    difficulty: 'A2',
    category: 'Places',
    partOfSpeech: 'noun',
  },
  {
    id: '3',
    word: 'Serendipity',
    translation: 'Serendipia',
    phonetic: '/ˌserənˈdɪpəti/',
    difficulty: 'C1',
    category: 'Abstract',
    partOfSpeech: 'noun',
  },
];

function CalibrationScreen() {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const handleComplete = (response) => {
    // Save response
    setResponses(prev => [...prev, {
      ...response,
      probeType: 'vocabulary',
      timestamp: Date.now(),
    }]);

    // Next item or finish
    if (index < WORDS.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      // Send to AI for analysis
      analyzeResponses(responses);
    }
  };

  return (
    <VocabProbe
      item={WORDS[index]}
      onComplete={handleComplete}
      onSkip={() => setIndex(prev => prev + 1)}
      showHints={true}
    />
  );
}
```

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `item` | `VocabProbeItem` | Yes | - | The word to display |
| `onComplete` | `function` | Yes | - | Called when user responds |
| `onSkip` | `function` | No | `undefined` | Called when user skips |
| `showHints` | `boolean` | No | `false` | Show hint text |
| `nativeLanguage` | `string` | No | `undefined` | User's native language |

## Item Structure

```typescript
{
  id: string;              // Unique identifier
  word: string;            // The word to show
  translation: string;     // Native language translation
  phonetic?: string;       // IPA pronunciation (optional)
  difficulty: CEFRLevel;   // A0, A1, A2, B1, B2, C1, C2
  category: string;        // e.g., "Greetings", "Food", "Abstract"
  partOfSpeech: string;    // e.g., "noun", "verb", "adjective"
}
```

## Response Data

```typescript
{
  itemId: string;              // Item.id
  timeSpent: number;           // Total time (ms)
  hesitationTime: number;      // Time before first click (ms)
  confidence: 'low' | 'medium' | 'high';
  difficulty: CEFRLevel;       // From item
}
```

## Common Patterns

### 1. Sequential Flow
```tsx
const [index, setIndex] = useState(0);

<VocabProbe
  item={items[index]}
  onComplete={() => setIndex(prev => prev + 1)}
/>
```

### 2. With Skip
```tsx
<VocabProbe
  item={item}
  onComplete={handleComplete}
  onSkip={handleSkip}  // Show skip button
/>
```

### 3. With Hints
```tsx
<VocabProbe
  item={item}
  onComplete={handleComplete}
  showHints={true}  // Show "Be honest..." message
/>
```

### 4. Collect All Responses
```tsx
const [responses, setResponses] = useState([]);

const handleComplete = (response) => {
  setResponses(prev => [...prev, {
    ...response,
    probeType: 'vocabulary',
    timestamp: Date.now(),
  }]);
};
```

## Tips for Creating Vocabulary Items

### 1. Mix Difficulty Levels
```tsx
const items = [
  { difficulty: 'A1', word: 'Hello', ... },     // Easy
  { difficulty: 'B1', word: 'Schedule', ... },  // Medium
  { difficulty: 'C1', word: 'Ephemeral', ... }, // Hard
];
```

### 2. Include Phonetics
```tsx
// Use IPA format for clarity
phonetic: '/həˈloʊ/'  // Good
phonetic: 'huh-LOH'   // Avoid (not standard)
```

### 3. Choose Relevant Categories
```tsx
category: 'Greetings'   // Good (specific)
category: 'Words'       // Avoid (too generic)
```

### 4. Accurate Part of Speech
```tsx
partOfSpeech: 'noun'          // Standard
partOfSpeech: 'phrasal verb'  // Also valid
```

## Integration with Calibration System

```tsx
import { VocabProbe } from '@/components/calibration/probes';
import type { CalibrationState } from '@/types/calibration';

function CalibrationFlow() {
  const [state, setState] = useState<CalibrationState>({
    status: 'in-progress',
    currentProbeType: 'vocabulary',
    responses: [],
    // ... other state
  });

  const handleVocabComplete = (response) => {
    setState(prev => ({
      ...prev,
      responses: [...prev.responses, {
        ...response,
        probeType: 'vocabulary',
        timestamp: Date.now(),
      }],
      points: prev.points + 10, // PROBE_POINTS.vocabulary
    }));

    // Move to next probe or complete
    if (allVocabDone) {
      setState(prev => ({
        ...prev,
        currentProbeType: 'listening',
      }));
    }
  };

  if (state.currentProbeType === 'vocabulary') {
    return (
      <VocabProbe
        item={currentVocabItem}
        onComplete={handleVocabComplete}
        showHints={true}
      />
    );
  }

  // ... other probe types
}
```

## Customization

### Change Translation Delay
Edit line 97 in `VocabProbe.tsx`:
```tsx
setTimeout(() => {
  // ...
}, 1500);  // Change this value (ms)
```

### Change Progress Dots
Edit the Progress Dots section in JSX (lines 210-214):
```tsx
<View style={styles.progressDots}>
  <View style={styles.progressDot} />
  <View style={[styles.progressDot, styles.progressDotActive]} />
  <View style={styles.progressDot} />
  {/* Add more dots */}
</View>
```

### Change Button Labels
Edit ResponseButton calls (lines 151-177):
```tsx
<ResponseButton
  label="I know this"  // Change this
  // ...
/>
```

## Troubleshooting

### Component not showing
- Check that item prop is valid
- Ensure parent container has flex: 1
- Verify design system imports are correct

### Animations not working
- Ensure react-native-reanimated is installed
- Check that Reanimated plugin is in babel.config.js

### Haptics not working
- Haptics only work on physical devices
- Simulators/emulators don't support haptic feedback

### TypeScript errors
- Ensure @/types/calibration is defined
- Check that VocabProbeItem interface matches

## Performance

- Component is optimized for 60fps animations
- Minimal re-renders (useCallback in buttons)
- Lazy translation reveal (only after selection)
- No heavy computations in render

## Next Steps

1. Create a vocabulary item generator
2. Build a calibration flow controller
3. Integrate with AI analysis endpoint
4. Add analytics tracking
5. Test with different screen sizes

## Support

For issues or questions:
- Check `/components/calibration/probes/README.md`
- See `/components/calibration/probes/IMPLEMENTATION.md`
- View example: `/components/calibration/probes/VocabProbe.example.tsx`
