# PreSessionScreen Integration Guide

Quick guide to integrate the PreSessionScreen component into your Vox Language app screens.

## Quick Start

### 1. Import the Component

```typescript
import { PreSessionScreen } from '@/components/reading';
```

### 2. Basic Implementation

```typescript
export default function ReadingPrepScreen() {
  const passage = {
    title: "My Trip to Barcelona",
    difficulty: "intermediate",
    wordCount: 250,
    estimatedDuration: 180
  };

  return (
    <PreSessionScreen
      passage={passage}
      onStart={() => {
        // Navigate to teleprompter
        router.push('/reading/session');
      }}
      onBack={() => {
        // Go back to passage selection
        router.back();
      }}
    />
  );
}
```

## Expo Router Integration

### File: `/app/reading/prepare/[id].tsx`

```typescript
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PreSessionScreen } from '@/components/reading';
import { useReadingPassage } from '@/hooks/useReadingPassage';

export default function ReadingPrepareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { passage, isLoading } = useReadingPassage(id);

  if (isLoading) {
    return <LoadingView />;
  }

  if (!passage) {
    return <ErrorView />;
  }

  return (
    <PreSessionScreen
      passage={{
        title: passage.title,
        difficulty: passage.difficulty,
        wordCount: passage.wordCount,
        estimatedDuration: passage.estimatedDuration,
      }}
      onStart={() => {
        // Navigate to teleprompter with passage ID
        router.push(`/reading/session/${id}`);
      }}
      onBack={() => {
        router.back();
      }}
      sessionNumber={passage.sessionNumber}
    />
  );
}
```

## React Navigation Integration

### Stack Navigator Setup

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PreSessionScreen } from '@/components/reading';

const Stack = createNativeStackNavigator();

function ReadingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PassageList" component={PassageListScreen} />
      <Stack.Screen name="Prepare" component={PrepareScreen} />
      <Stack.Screen name="Session" component={TeleprompterScreen} />
    </Stack.Navigator>
  );
}

// PrepareScreen.tsx
function PrepareScreen({ route, navigation }) {
  const { passage } = route.params;

  return (
    <PreSessionScreen
      passage={passage}
      onStart={() => {
        navigation.navigate('Session', { passageId: passage.id });
      }}
      onBack={() => {
        navigation.goBack();
      }}
    />
  );
}
```

## With State Management (Zustand)

```typescript
import { create } from 'zustand';
import { PreSessionScreen } from '@/components/reading';

// Store
interface ReadingStore {
  currentPassage: Passage | null;
  sessionCount: number;
  startSession: (passageId: string) => void;
}

const useReadingStore = create<ReadingStore>((set) => ({
  currentPassage: null,
  sessionCount: 0,
  startSession: (passageId) => {
    // Logic to start session
    set((state) => ({ sessionCount: state.sessionCount + 1 }));
  },
}));

// Component
export default function PrepareScreen() {
  const { currentPassage, sessionCount, startSession } = useReadingStore();

  if (!currentPassage) return null;

  return (
    <PreSessionScreen
      passage={currentPassage}
      sessionNumber={sessionCount + 1}
      onStart={() => startSession(currentPassage.id)}
      onBack={() => router.back()}
    />
  );
}
```

## With Data Fetching (React Query)

```typescript
import { useQuery } from '@tanstack/react-query';
import { PreSessionScreen } from '@/components/reading';

export default function PrepareScreen({ passageId }) {
  const { data: passage, isLoading } = useQuery({
    queryKey: ['passage', passageId],
    queryFn: () => fetchPassage(passageId),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PreSessionScreen
      passage={{
        title: passage.title,
        difficulty: passage.difficulty,
        wordCount: passage.content.split(' ').length,
        estimatedDuration: calculateDuration(passage.content),
      }}
      onStart={() => {
        // Track analytics
        analytics.track('reading_session_started', {
          passage_id: passageId,
          difficulty: passage.difficulty,
        });

        // Navigate to session
        router.push(`/reading/session/${passageId}`);
      }}
      onBack={() => router.back()}
    />
  );
}
```

## Complete Flow Example

### 1. User selects a passage

```typescript
// app/reading/passages.tsx
export default function PassagesScreen() {
  const passages = usePassages();

  return (
    <View>
      {passages.map((passage) => (
        <TouchableOpacity
          key={passage.id}
          onPress={() => router.push(`/reading/prepare/${passage.id}`)}
        >
          <PassageCard passage={passage} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### 2. PreSession screen appears

```typescript
// app/reading/prepare/[id].tsx
export default function PrepareScreen() {
  const { id } = useLocalSearchParams();
  const passage = usePassage(id);

  return (
    <PreSessionScreen
      passage={passage}
      onStart={() => router.push(`/reading/session/${id}`)}
      onBack={() => router.back()}
    />
  );
}
```

### 3. User starts session

```typescript
// app/reading/session/[id].tsx
export default function SessionScreen() {
  const { id } = useLocalSearchParams();
  const passage = usePassage(id);

  return (
    <TeleprompterView
      passage={passage}
      onComplete={(results) => {
        router.push({
          pathname: '/reading/results',
          params: { results: JSON.stringify(results) },
        });
      }}
    />
  );
}
```

## TypeScript Types

### Create shared types file

```typescript
// types/reading.ts
export interface ReadingPassage {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  wordCount: number;
  estimatedDuration: number;
  category?: string;
  tags?: string[];
}

export interface ReadingSession {
  passageId: string;
  startedAt: Date;
  completedAt?: Date;
  recordingUrl?: string;
  score?: number;
}
```

### Use in component

```typescript
import type { ReadingPassage } from '@/types/reading';
import { PreSessionScreen } from '@/components/reading';

export default function PrepareScreen({ passage }: { passage: ReadingPassage }) {
  return (
    <PreSessionScreen
      passage={{
        title: passage.title,
        difficulty: passage.difficulty,
        wordCount: passage.wordCount,
        estimatedDuration: passage.estimatedDuration,
      }}
      onStart={handleStart}
      onBack={handleBack}
    />
  );
}
```

## Analytics Integration

```typescript
import { analytics } from '@/lib/analytics';

export default function PrepareScreen({ passage }) {
  const handleStart = () => {
    // Track session started
    analytics.track('reading_session_started', {
      passage_id: passage.id,
      passage_title: passage.title,
      difficulty: passage.difficulty,
      word_count: passage.wordCount,
      estimated_duration: passage.estimatedDuration,
      timestamp: new Date().toISOString(),
    });

    // Navigate to session
    router.push(`/reading/session/${passage.id}`);
  };

  const handleBack = () => {
    // Track abandonment
    analytics.track('reading_session_abandoned', {
      passage_id: passage.id,
      timestamp: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <PreSessionScreen
      passage={passage}
      onStart={handleStart}
      onBack={handleBack}
    />
  );
}
```

## Offline Support

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { PreSessionScreen } from '@/components/reading';

export default function PrepareScreen({ passage }) {
  const { isOffline } = useNetworkStatus();

  const handleStart = () => {
    if (isOffline) {
      // Check if passage is downloaded
      const isDownloaded = checkPassageDownloaded(passage.id);

      if (!isDownloaded) {
        alert('This passage is not available offline. Please connect to the internet.');
        return;
      }
    }

    // Proceed to session
    router.push(`/reading/session/${passage.id}`);
  };

  return (
    <PreSessionScreen
      passage={passage}
      onStart={handleStart}
      onBack={() => router.back()}
    />
  );
}
```

## Error Handling

```typescript
export default function PrepareScreen() {
  const { id } = useLocalSearchParams();
  const { data: passage, error, isLoading } = usePassage(id);

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <ErrorView
        message="Failed to load passage"
        onRetry={() => refetch()}
        onBack={() => router.back()}
      />
    );
  }

  if (!passage) {
    return (
      <NotFoundView
        message="Passage not found"
        onBack={() => router.back()}
      />
    );
  }

  return (
    <PreSessionScreen
      passage={passage}
      onStart={() => router.push(`/reading/session/${id}`)}
      onBack={() => router.back()}
    />
  );
}
```

## Session Tracking

```typescript
import { useReadingSessionTracker } from '@/hooks/useReadingSessionTracker';

export default function PrepareScreen({ passage }) {
  const { todaySessionCount, startNewSession } = useReadingSessionTracker();

  return (
    <PreSessionScreen
      passage={passage}
      sessionNumber={todaySessionCount + 1}
      onStart={() => {
        const session = startNewSession(passage.id);
        router.push(`/reading/session/${passage.id}`);
      }}
      onBack={() => router.back()}
    />
  );
}
```

## Testing

### Unit Test Example (Jest + React Native Testing Library)

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { PreSessionScreen } from './PreSessionScreen';

describe('PreSessionScreen', () => {
  const mockPassage = {
    title: 'Test Passage',
    difficulty: 'beginner' as const,
    wordCount: 100,
    estimatedDuration: 90,
  };

  it('renders correctly', () => {
    const { getByText } = render(
      <PreSessionScreen
        passage={mockPassage}
        onStart={jest.fn()}
        onBack={jest.fn()}
      />
    );

    expect(getByText('Ready to Practice?')).toBeTruthy();
    expect(getByText('Test Passage')).toBeTruthy();
  });

  it('calls onStart when start button is pressed', () => {
    const onStartMock = jest.fn();
    const { getByText } = render(
      <PreSessionScreen
        passage={mockPassage}
        onStart={onStartMock}
        onBack={jest.fn()}
      />
    );

    fireEvent.press(getByText('Start with Full Energy →'));
    expect(onStartMock).toHaveBeenCalled();
  });

  it('displays session number when provided', () => {
    const { getByText } = render(
      <PreSessionScreen
        passage={mockPassage}
        sessionNumber={3}
        onStart={jest.fn()}
        onBack={jest.fn()}
      />
    );

    expect(getByText('Session 3 of today')).toBeTruthy();
  });
});
```

## Troubleshooting

### Issue: Component not rendering
**Solution:** Check imports and ensure all dependencies are installed:
```bash
npm install expo-linear-gradient react-native-reanimated
```

### Issue: Animations not working
**Solution:** Make sure Reanimated is configured in `babel.config.js`:
```javascript
plugins: ['react-native-reanimated/plugin']
```

### Issue: Haptics not working
**Solution:** Ensure expo-haptics is installed:
```bash
npx expo install expo-haptics
```

### Issue: Types not found
**Solution:** Check tsconfig paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Best Practices

1. **Always provide all required props** - Don't use optional chaining on required passage fields
2. **Handle loading states** - Show loading UI while fetching passage data
3. **Validate passage data** - Ensure wordCount and estimatedDuration are positive numbers
4. **Track analytics** - Log when users start or abandon sessions
5. **Support offline** - Check if passage is downloaded before allowing offline sessions
6. **Error boundaries** - Wrap component in error boundary for production
7. **Accessibility** - Ensure screen readers can navigate the UI
8. **Test on devices** - Verify animations and haptics work on real devices

## Next Steps

After integrating PreSessionScreen, you'll need:

1. **TeleprompterView** - The actual reading interface
2. **RecordingControls** - Audio recording UI
3. **ResultsCard** - Post-session feedback
4. **Data persistence** - Save session results to database

See `/docs/features/READING_TELEPROMPTER.md` for the complete reading feature specification.
