# Content Management System - Quick Start Guide

Get up and running with the passage management system in 5 minutes.

## Step 1: Set Up Environment

Add your Gemini API key to `.env`:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## Step 2: Basic Usage

### Using the PassageSelector Component

```tsx
import { useState } from 'react';
import { Button } from 'react-native';
import { PassageSelector } from '@/components/reading';

function MyScreen() {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <>
      <Button
        title="Choose Passage"
        onPress={() => setShowSelector(true)}
      />

      {showSelector && (
        <PassageSelector
          onSelect={(passage) => {
            console.log('Selected:', passage.title);
            setShowSelector(false);
            // Start reading session with passage
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
}
```

That's it! You now have access to:
- 17 curated passages
- AI generation
- User import functionality

## Step 3: Get Passages Programmatically

### Get Curated Passages

```tsx
import { getPassagesByDifficulty } from '@/lib/reading';

// Get beginner passages
const beginnerPassages = getPassagesByDifficulty('beginner');
console.log(`Found ${beginnerPassages.length} beginner passages`);

// Use the first one
const passage = beginnerPassages[0];
console.log(passage.title);
console.log(passage.text);
```

### Generate AI Passage

```tsx
import { generatePassage } from '@/lib/reading';

const passage = await generatePassage({
  difficulty: 'intermediate',
  topic: 'travel',
  style: 'dialogue',
  wordCount: 150,
});

console.log('Generated:', passage.title);
```

### Save User Passage

```tsx
import { saveUserPassage } from '@/lib/reading';

const id = await saveUserPassage({
  title: 'My Custom Passage',
  text: 'This is my custom reading text for practice...',
  difficulty: 'intermediate',
  category: 'work',
  wordCount: 150,
  estimatedDuration: 50,
});

console.log('Saved with ID:', id);
```

## Step 4: Use the Hook (Recommended)

The `usePassages` hook provides everything in one place:

```tsx
import { usePassages } from '@/components/reading';

function MyComponent() {
  const {
    curatedPassages,      // All curated passages
    userPassages,         // User's custom passages
    generateAIPassage,    // Generate with AI
    savePassage,          // Save new passage
    isGenerating,         // Loading state
    error,                // Error state
  } = usePassages();

  return (
    <View>
      <Text>Curated: {curatedPassages.length}</Text>
      <Text>Custom: {userPassages.length}</Text>

      <Button
        title="Generate AI Passage"
        onPress={async () => {
          const passage = await generateAIPassage({
            difficulty: 'beginner',
            topic: 'food',
          });
          console.log('Created:', passage.title);
        }}
        disabled={isGenerating}
      />
    </View>
  );
}
```

## Common Patterns

### 1. Random Practice Passage

```tsx
import { getRandomPassage } from '@/lib/reading';

// Get random passage at user's level
const passage = getRandomPassage('intermediate');
// Start reading session
```

### 2. Search Passages

```tsx
import { searchPassages } from '@/lib/reading';

const results = searchPassages('travel');
// Display results
```

### 3. Import User Text

```tsx
import { ImportPassageForm } from '@/components/reading';

<ImportPassageForm
  onImport={async (passage) => {
    // Passage is already validated
    await saveUserPassage(passage);
    // Navigate to reading screen
  }}
  onCancel={() => navigation.goBack()}
/>
```

## Integration with Reading Sessions

Combine with existing reading session system:

```tsx
import { PassageSelector } from '@/components/reading';
import { createSession } from '@/lib/reading';

function ReadingFlow() {
  const [showSelector, setShowSelector] = useState(false);

  const handleSelectPassage = async (passage) => {
    // Create reading session
    const session = await createSession({
      userId: 'user_123',
      sourceType: passage.sourceType,
      text: passage.text,
      title: passage.title,
      difficulty: passage.difficulty,
    });

    // Navigate to teleprompter with session
    navigation.navigate('Teleprompter', { sessionId: session.id });
  };

  return (
    <PassageSelector
      onSelect={handleSelectPassage}
      onClose={() => setShowSelector(false)}
    />
  );
}
```

## Available Passages

### Curated Collection

**Beginner** (6 passages, 50-100 words)
- Meeting a New Friend
- At the Cafe
- My Daily Routine
- Shopping for Clothes
- The Weather Today
- Peter Piper (tongue twister)

**Intermediate** (6 passages, 100-200 words)
- Job Interview Preparation
- Planning a Weekend Trip
- Healthy Eating Habits
- First Day Living Abroad
- Learning a Musical Instrument
- She Sells Seashells (tongue twister)

**Advanced** (5 passages, 200-300 words)
- The Digital Transformation of Education
- Negotiating a Business Partnership
- The Psychology of Decision Making
- Sustainable Urban Development
- The Sixth Sick Sheikh (tongue twister)

### AI Generation Styles

- **story**: Narrative with beginning, middle, end
- **dialogue**: Conversation between 2-3 people
- **article**: Informative, factual content
- **instructions**: Step-by-step format

### Topic Suggestions

Daily Life • Travel & Culture • Food & Cooking • Work & Career • Health & Wellness • Technology • Shopping • Entertainment • Nature & Environment • Education • Family & Relationships • Sports & Hobbies

## Troubleshooting

### AI Generation Not Working

```tsx
// Check if API key is set
import { generatePassage } from '@/lib/reading';

try {
  const passage = await generatePassage({
    difficulty: 'beginner',
    topic: 'food',
  });
} catch (error) {
  console.error('Generation failed:', error);
  // Will automatically use fallback template
}
```

### User Passages Not Saving

```tsx
import { validatePassage } from '@/lib/reading';

const validation = validatePassage({
  title: 'Test',
  text: 'Your text here...',
  difficulty: 'beginner',
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

## Next Steps

1. **Try the components** - Open PassageSelector to browse passages
2. **Generate AI passage** - Test the AI generation with your API key
3. **Import custom text** - Try the ImportPassageForm
4. **Read the docs** - Check PASSAGE_MANAGEMENT_USAGE.md for detailed examples
5. **See integration** - Look at INTEGRATION_EXAMPLE.tsx for complete flow

## Complete Example

Here's a complete working example:

```tsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { PassageSelector, usePassages } from '@/components/reading';
import { createSession } from '@/lib/reading';

export default function ReadingPracticeScreen() {
  const [showSelector, setShowSelector] = useState(false);
  const { curatedPassages, userPassages } = usePassages();

  const startReadingSession = async (passage) => {
    const session = await createSession({
      userId: 'user_123',
      sourceType: passage.sourceType,
      text: passage.text,
      title: passage.title,
      difficulty: passage.difficulty,
    });

    // Navigate to your teleprompter screen
    console.log('Session started:', session.id);
    setShowSelector(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Reading Practice
      </Text>

      <Text style={{ marginBottom: 10 }}>
        {curatedPassages.length} curated passages
      </Text>
      <Text style={{ marginBottom: 20 }}>
        {userPassages.length} custom passages
      </Text>

      <Button
        title="Select Passage to Read"
        onPress={() => setShowSelector(true)}
      />

      {showSelector && (
        <PassageSelector
          onSelect={startReadingSession}
          onClose={() => setShowSelector(false)}
          initialTab="curated"
          initialDifficulty="beginner"
        />
      )}
    </View>
  );
}
```

## Recording Playback & Library

### Recording Playback Component

After a reading session, users can review their recording with color-coded word highlighting:

```tsx
import { RecordingPlayback } from '@/components/reading';

<RecordingPlayback
  passageText="The text that was read..."
  recordingUri="file://path/to/recording.m4a"
  wordAnalysis={[
    { word: 'The', startTime: 0, endTime: 200, status: 'correct' },
    { word: 'text', startTime: 200, endTime: 500, status: 'hesitation' },
    { word: 'that', startTime: 500, endTime: 700, status: 'mispronounced' },
    // ...more words
  ]}
  onAddToWordBank={(word) => console.log('Add to bank:', word)}
  onClose={() => navigation.goBack()}
/>
```

**Features:**
- Color-coded words: green (correct), yellow (hesitation), orange (mispronounced), red (skipped)
- Timeline visualization showing performance distribution
- Playback controls with speed adjustment (0.5x, 1x, 1.5x)
- Tap any word to seek to that position
- Add problem words to Word Bank directly

### Recordings Library Screen

Navigate to `/recordings` to view all past recording sessions:

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/recordings');
```

**Features:**
- List of all recording sessions with:
  - Title, date, duration, and score
  - Difficulty badge
  - Performance distribution bar
- Filter options: All, With Scores, Recent (7 days)
- Sort options: Date, Score, Duration
- Pull-to-refresh
- Empty state messaging

### Auto-Add Problem Words

The `ReadingResultsCard` automatically adds mispronounced and skipped words to the Word Bank:

```tsx
// Automatic behavior on mount:
// - Mispronounced words → Auto-added to Word Bank
// - Skipped words → Auto-added to Word Bank
// - Hesitations → Suggested (user can add manually)
```

### Audio Playback Hook

For custom playback implementations:

```tsx
import { useAudioPlayback } from '@/lib/reading';

const {
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  currentWordIndex,
  play,
  pause,
  seekToWord,
  setSpeed,
} = useAudioPlayback({
  recordingUri: 'file://path/to/recording.m4a',
  wordTimestamps: [
    { word: 'Hello', startTime: 0, endTime: 500 },
    { word: 'world', startTime: 500, endTime: 1000 },
  ],
});
```

## Resources

- **CONTENT_MANAGEMENT_SYSTEM.md** - Technical architecture
- **PASSAGE_MANAGEMENT_USAGE.md** - Detailed usage guide
- **INTEGRATION_EXAMPLE.tsx** - Complete integration example
- **CONTENT_SYSTEM_SUMMARY.md** - Implementation summary
- **AUDIO_RECORDING_API.md** - Audio recording documentation
- **ARTICULATION_ENGINE.md** - Analysis engine documentation

## Support

If something isn't working:
1. Check the console for errors
2. Verify your API key is set
3. Review the documentation files
4. Check the example implementations
5. Ensure all dependencies are installed

---

You're now ready to use the content management system! Start with the PassageSelector component and explore from there.
