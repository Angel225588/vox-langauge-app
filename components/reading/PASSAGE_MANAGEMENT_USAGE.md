# Passage Management System - Usage Guide

Complete content management system for the Vox language app's teleprompter with AI generation, curated passages, and user import functionality.

## Overview

The passage management system provides three types of reading content:

1. **Curated Passages** - High-quality, offline passages organized by difficulty
2. **AI-Generated Passages** - Custom passages created by Gemini AI
3. **User-Imported Passages** - Custom text imported by users

## Quick Start

### 1. Using the PassageSelector Component

The `PassageSelector` is a full-screen modal that allows users to browse and select reading content.

```tsx
import { PassageSelector } from '@/components/reading';
import { Passage } from '@/lib/reading/types';

function ReadingScreen() {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);

  const handleSelect = (passage: Passage) => {
    setSelectedPassage(passage);
    setShowSelector(false);
    // Start reading session with this passage
  };

  return (
    <>
      <Button onPress={() => setShowSelector(true)}>
        Select Passage
      </Button>

      {showSelector && (
        <PassageSelector
          onSelect={handleSelect}
          onClose={() => setShowSelector(false)}
          initialTab="curated" // or "ai" or "imported"
          initialDifficulty="intermediate"
        />
      )}
    </>
  );
}
```

### 2. Using the ImportPassageForm Component

Allow users to import their own text for reading practice.

```tsx
import { ImportPassageForm } from '@/components/reading';
import { saveUserPassage } from '@/lib/reading';

function ImportScreen() {
  const [showForm, setShowForm] = useState(false);

  const handleImport = async (passage: Passage) => {
    try {
      await saveUserPassage(passage);
      setShowForm(false);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <>
      <Button onPress={() => setShowForm(true)}>
        Import Custom Text
      </Button>

      {showForm && (
        <ImportPassageForm
          onImport={handleImport}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}
```

### 3. Using the usePassages Hook

Centralized hook for all passage operations.

```tsx
import { usePassages } from '@/components/reading';

function PassageLibrary() {
  const {
    // Curated passages
    curatedPassages,
    getCuratedByDifficulty,
    searchCuratedPassages,
    getRandomCuratedPassage,

    // User passages
    userPassages,
    savePassage,
    deletePassage,
    searchUserPassagesByQuery,

    // AI generation
    generateAIPassage,
    isGenerating,

    // Loading states
    loading,
    error,
  } = usePassages();

  // Get intermediate passages
  const intermediatePassages = getCuratedByDifficulty('intermediate');

  // Generate AI passage
  const handleGenerate = async () => {
    const passage = await generateAIPassage({
      difficulty: 'intermediate',
      topic: 'travel',
      style: 'dialogue',
      wordCount: 150,
    });
    console.log('Generated:', passage.title);
  };

  return (
    <View>
      <Text>Curated: {curatedPassages.length}</Text>
      <Text>User Passages: {userPassages.length}</Text>
      <Button onPress={handleGenerate} disabled={isGenerating}>
        Generate AI Passage
      </Button>
    </View>
  );
}
```

## API Reference

### Curated Passages

```tsx
import {
  getPassagesByDifficulty,
  getAllCuratedPassages,
  getRandomPassage,
  searchPassages,
  getPassagesByCategory,
  getMostPopularPassages,
} from '@/lib/reading';

// Get beginner passages
const beginnerPassages = getPassagesByDifficulty('beginner');

// Get all passages
const allPassages = getAllCuratedPassages();

// Search passages
const travelPassages = searchPassages('travel');

// Get random passage for practice
const randomPassage = getRandomPassage('intermediate');

// Get by category
const workPassages = getPassagesByCategory('work');

// Get most popular
const topPassages = getMostPopularPassages(5);
```

### AI Passage Generation

```tsx
import {
  generatePassage,
  generatePassageWithTargetWords,
  generatePassageBatch,
  getTopicSuggestions,
} from '@/lib/reading';

// Generate single passage
const passage = await generatePassage({
  difficulty: 'intermediate',
  topic: 'job interview',
  style: 'dialogue',
  wordCount: 150,
});

// Generate with target words from Word Bank
const vocabPassage = await generatePassageWithTargetWords(
  ['confident', 'professional', 'experience'],
  'intermediate'
);

// Generate multiple passages
const batch = await generatePassageBatch(3, {
  difficulty: 'beginner',
  topic: 'daily life',
  style: 'story',
});

// Get topic suggestions
const topics = getTopicSuggestions();
// ['Daily Life', 'Travel & Culture', 'Food & Cooking', ...]
```

### User-Imported Passages

```tsx
import {
  saveUserPassage,
  getUserPassages,
  deleteUserPassage,
  updateUserPassage,
  searchUserPassages,
  validatePassage,
} from '@/lib/reading';

// Save user passage
const id = await saveUserPassage({
  title: 'My Custom Passage',
  text: 'This is my custom reading text...',
  difficulty: 'intermediate',
  category: 'work',
  wordCount: 150,
  estimatedDuration: 50,
});

// Get all user passages
const myPassages = await getUserPassages();

// Search user passages
const results = await searchUserPassages('interview');

// Update passage
await updateUserPassage(id, {
  title: 'Updated Title',
  difficulty: 'advanced',
});

// Delete passage
await deleteUserPassage(id);

// Validate before saving
const validation = validatePassage({
  title: 'Test',
  text: 'Short text',
  difficulty: 'beginner',
});
if (!validation.valid) {
  console.error(validation.errors);
}
```

## Features

### Curated Passages Collection

- **17 high-quality passages** organized by difficulty
- **Beginner** (50-100 words): 6 passages
- **Intermediate** (100-200 words): 6 passages
- **Advanced** (200-300 words): 5 passages

Topics include:
- Daily conversations
- Job interviews
- Travel scenarios
- Health & wellness
- Business negotiations
- Academic discussions
- Tongue twisters for pronunciation

### AI Generation

Powered by Gemini 2.0 Flash:
- **Smart prompting** based on difficulty level
- **Natural vocabulary** inclusion from Word Bank
- **Multiple styles**: story, dialogue, article, instructions
- **Fallback templates** if AI fails
- **Error handling** with user-friendly messages

### User Import

- **Validation** (min 20 words, max 1000 words)
- **Auto-calculation** of word count and reading time
- **Preview mode** before importing
- **AsyncStorage** for offline access
- **Export/Import** for backup and sharing
- **Search and filter** capabilities

## Integration Example

Complete reading practice flow:

```tsx
import { useState } from 'react';
import { PassageSelector, ImportPassageForm, usePassages } from '@/components/reading';
import { createSession } from '@/lib/reading';

function ReadingPracticeFlow() {
  const [step, setStep] = useState<'select' | 'import' | 'practice'>('select');
  const [passage, setPassage] = useState<Passage | null>(null);
  const { savePassage } = usePassages();

  const handleSelectPassage = (selectedPassage: Passage) => {
    setPassage(selectedPassage);
    setStep('practice');
    startReadingSession(selectedPassage);
  };

  const handleImportPassage = async (importedPassage: Passage) => {
    await savePassage(importedPassage);
    setPassage(importedPassage);
    setStep('practice');
    startReadingSession(importedPassage);
  };

  const startReadingSession = async (passage: Passage) => {
    const session = await createSession({
      userId: 'user_123',
      sourceType: passage.sourceType,
      text: passage.text,
      title: passage.title,
      difficulty: passage.difficulty,
    });

    // Navigate to teleprompter screen with session
  };

  return (
    <>
      {step === 'select' && (
        <PassageSelector
          onSelect={handleSelectPassage}
          onClose={() => setStep('select')}
        />
      )}

      {step === 'import' && (
        <ImportPassageForm
          onImport={handleImportPassage}
          onCancel={() => setStep('select')}
        />
      )}

      {step === 'practice' && passage && (
        <TeleprompterScreen passage={passage} />
      )}
    </>
  );
}
```

## Design System Integration

All components use the Vox design system:
- **Glassmorphism** effects on cards
- **Gradient buttons** with haptic feedback
- **Consistent spacing** and typography
- **Dark theme** optimized colors
- **Smooth animations** and transitions

## Error Handling

All operations include comprehensive error handling:

```tsx
const { generateAIPassage, error } = usePassages();

try {
  const passage = await generateAIPassage({
    difficulty: 'intermediate',
    topic: 'travel',
  });
} catch (err) {
  // Error state is automatically set
  if (error) {
    console.error('Generation failed:', error);
    // Show error toast
  }
}
```

## Performance Considerations

- **Curated passages** are static (no API calls)
- **User passages** stored in AsyncStorage (fast, offline)
- **AI generation** includes loading states and rate limiting
- **Batch operations** include delays between requests
- **Search** is client-side for instant results

## Future Enhancements

Potential additions:
- Word Bank integration for vocabulary targeting
- Passage difficulty analysis
- Reading history tracking
- Favorite passages
- Passage sharing between users
- Audio narration for passages
- Multi-language support

## Troubleshooting

### AI Generation Fails

If Gemini API fails:
1. Check `EXPO_PUBLIC_GEMINI_API_KEY` is set
2. Fallback templates are automatically used
3. Check network connection
4. Review API quota/limits

### User Passages Not Saving

1. Check AsyncStorage permissions
2. Verify validation passes
3. Check device storage space
4. Review error messages

### Components Not Rendering

1. Ensure all dependencies installed: `expo-linear-gradient`, `expo-haptics`
2. Check import paths are correct
3. Verify design system constants exist
4. Review console for TypeScript errors

## Support

For questions or issues:
1. Check this documentation
2. Review component source code
3. Check the example implementations
4. Test with provided mock data
