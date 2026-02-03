# Calibration Probes

Calibration probes are interactive components used to assess a user's language proficiency across different skills. These are **not tests** but calibration tools that earn points for completion, not accuracy.

## VocabProbe

A vocabulary recognition probe that shows words and lets users indicate their familiarity level.

### Features

- **Three confidence levels**: "I know this" / "Not sure" / "Don't know"
- **Behavior tracking**: Measures time spent and hesitation time (time before first interaction)
- **Translation reveal**: Shows translation after response for learning
- **Premium animations**: Smooth entrance and interaction animations using Reanimated
- **Haptic feedback**: Tactile responses for all interactions
- **Depth and glow effects**: Premium visual design matching app aesthetic
- **Skip option**: Allow users to skip difficult items

### Usage

```tsx
import { VocabProbe } from '@/components/calibration/probes';
import type { VocabProbeItem } from '@/types/calibration';

const item: VocabProbeItem = {
  id: 'vocab-1',
  word: 'Serendipity',
  translation: 'Serendipia',
  phonetic: '/ˌserənˈdɪpəti/',
  difficulty: 'C1',
  category: 'Abstract',
  partOfSpeech: 'noun',
};

function MyCalibration() {
  const handleComplete = (response) => {
    console.log('Response:', response);
    // response includes:
    // - itemId: string
    // - timeSpent: number (ms)
    // - hesitationTime: number (ms before first action)
    // - confidence: 'low' | 'medium' | 'high'
    // - difficulty: CEFRLevel
  };

  return (
    <VocabProbe
      item={item}
      onComplete={handleComplete}
      onSkip={() => console.log('Skipped')}
      showHints={true}
      nativeLanguage="Spanish"
    />
  );
}
```

### Props

```typescript
interface CalibrationProbeProps<VocabProbeItem> {
  // The vocabulary item to display
  item: VocabProbeItem;

  // Called when user selects a confidence level
  // Receives all response data except probeType and timestamp
  onComplete: (response: Omit<ProbeResponse, 'probeType' | 'timestamp'>) => void;

  // Optional skip handler
  onSkip?: () => void;

  // Whether to show hint text (default: false)
  showHints?: boolean;

  // User's native language for context (e.g., "Spanish")
  nativeLanguage?: string;
}
```

### Item Structure

```typescript
interface VocabProbeItem {
  id: string;                // Unique identifier
  word: string;              // The word to display
  translation: string;       // Translation in native language
  phonetic?: string;         // IPA phonetic pronunciation
  difficulty: CEFRLevel;     // A0, A1, A2, B1, B2, C1, C2
  category: string;          // e.g., "Greetings", "Abstract", "Places"
  partOfSpeech: string;      // e.g., "noun", "verb", "adjective"
}
```

### Response Data

The component tracks comprehensive behavioral data for AI analysis:

```typescript
{
  itemId: string;              // Item identifier
  timeSpent: number;           // Total time on item (ms)
  hesitationTime: number;      // Time before first button press (ms)
  confidence: 'low' | 'medium' | 'high';  // User's self-assessment
  difficulty: CEFRLevel;       // Item difficulty level
}
```

### Design System Integration

The component uses:
- **Colors**: Primary gradient (`#6366F1` to `#8B5CF6`), success/warning/error gradients
- **Spacing**: `md: 16px`, `lg: 24px`, `xl: 32px`
- **Border Radius**: `lg: 16px`, `xl: 24px`
- **Shadows**: Depth shadows with glow effects
- **Typography**: Responsive font sizes from `sm: 14px` to `4xl: 36px`

### Animations

1. **Card entrance**: FadeInDown with spring physics
2. **Word fade-in**: Opacity animation with spring
3. **Button press**: Scale animation (0.95 → 1.0)
4. **Translation reveal**: FadeInDown on response

### Haptic Feedback

- **Light**: On button press-in
- **Medium**: On button press completion
- **Light**: On skip

### Best Practices

1. **Honest responses**: The hint text encourages honesty for better personalization
2. **No penalties**: Users earn points for completion, not accuracy
3. **Progressive difficulty**: Mix difficulty levels to calibrate accurately
4. **Quick flow**: Keep probe duration under 3 minutes total
5. **Translation timing**: 1.5s delay shows translation before completing

### Example Flow

```tsx
import { VocabProbe } from '@/components/calibration/probes';

const VOCAB_ITEMS = [
  { id: '1', word: 'Hello', translation: 'Hola', ... },
  { id: '2', word: 'Restaurant', translation: 'Restaurante', ... },
  { id: '3', word: 'Ephemeral', translation: 'Efímero', ... },
];

function CalibrationFlow() {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const handleComplete = (response) => {
    setResponses(prev => [...prev, {
      ...response,
      probeType: 'vocabulary',
      timestamp: Date.now(),
    }]);

    if (index < VOCAB_ITEMS.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      // Send to AI for analysis
      analyzeResponses(responses);
    }
  };

  return (
    <VocabProbe
      item={VOCAB_ITEMS[index]}
      onComplete={handleComplete}
      showHints={true}
    />
  );
}
```

## Future Probes

- **ListeningProbe**: Audio comprehension with multiple choice
- **SpeakingProbe**: Pronunciation and fluency recording
- **WritingProbe**: Text production and composition (B1+ only)

## AI Analysis Points

The AI uses this data to:
1. Estimate vocabulary size and depth
2. Detect hesitation patterns (confidence vs. actual knowledge)
3. Identify comfort zones and challenge areas
4. Personalize content difficulty and pacing
5. Generate targeted learning recommendations
