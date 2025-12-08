# Content Management System - Technical Overview

Comprehensive content management system for the Vox language app's teleprompter.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTENT MANAGEMENT SYSTEM                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Curated         │  │  AI Generated    │  │  User Imported   │
│  Passages        │  │  Passages        │  │  Passages        │
│                  │  │                  │  │                  │
│  - Static JSON   │  │  - Gemini 2.0    │  │  - AsyncStorage  │
│  - 17 passages   │  │  - Custom topics │  │  - CRUD ops      │
│  - 3 difficulty  │  │  - 4 styles      │  │  - Validation    │
│  - Offline       │  │  - Fallbacks     │  │  - Export/Import │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   usePassages Hook  │
                    │  Unified Interface  │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ PassageSelector │  │ ImportPassage   │  │  Reading        │
│ Component       │  │ Form            │  │  Session        │
│                 │  │                 │  │                 │
│ - Tab interface │  │ - Text input    │  │ - Teleprompter  │
│ - Search        │  │ - Validation    │  │ - Recording     │
│ - Filters       │  │ - Preview       │  │ - Analysis      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## File Structure

```
vox-language-app/
├── lib/reading/
│   ├── types.ts                    # Core type definitions (Passage, etc.)
│   ├── passageGenerator.ts         # AI passage generation with Gemini
│   ├── curatedPassages.ts          # Static curated passages collection
│   ├── passageStorage.ts           # User passage CRUD operations
│   ├── index.ts                    # Exports all passage functionality
│   └── CONTENT_MANAGEMENT_SYSTEM.md
│
└── components/reading/
    ├── PassageSelector.tsx         # Modal for selecting passages
    ├── ImportPassageForm.tsx       # Form for importing custom text
    ├── usePassages.ts              # React hook for passage management
    ├── index.ts                    # Exports all reading components
    └── PASSAGE_MANAGEMENT_USAGE.md
```

## Data Flow

### 1. Curated Passages

```typescript
// Static data, no API calls
CURATED_PASSAGES (JSON)
    ↓
getPassagesByDifficulty()
    ↓
PassageSelector → User selects
    ↓
createSession() → Start reading practice
```

### 2. AI-Generated Passages

```typescript
User inputs topic/difficulty
    ↓
generatePassage() → Gemini API
    ↓
buildGenerationPrompt() → Smart prompting
    ↓
Parse JSON response
    ↓
Fallback templates (if fails)
    ↓
Return Passage object
    ↓
Optional: saveUserPassage() → Store for reuse
```

### 3. User-Imported Passages

```typescript
User pastes text
    ↓
validatePassage() → Check requirements
    ↓
Calculate stats (word count, duration)
    ↓
saveUserPassage() → AsyncStorage
    ↓
getUserPassages() → Display in library
    ↓
Select for reading practice
```

## Type System

### Core Passage Type

```typescript
interface Passage {
  id: string;
  title: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  wordCount: number;
  estimatedDuration: number; // seconds
  sourceType: 'curated' | 'ai_generated' | 'user_imported';
  targetWords?: string[];
  createdAt: string;
}
```

### Extended Types

```typescript
// Curated passages include metadata
interface CuratedPassage extends Passage {
  tags: string[];
  popularity: number;
}

// User passages always have user_imported source
interface UserPassage extends Passage {
  sourceType: 'user_imported';
}

// AI generation options
interface PassageGeneratorOptions {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic?: string;
  targetWords?: string[];
  wordCount?: number;
  style?: 'story' | 'dialogue' | 'article' | 'instructions';
}
```

## API Reference

### Curated Passages API

```typescript
// Get passages by difficulty
getPassagesByDifficulty(difficulty: string): CuratedPassage[]

// Get all curated passages
getAllCuratedPassages(): CuratedPassage[]

// Get random passage (optionally filtered by difficulty)
getRandomPassage(difficulty?: string): CuratedPassage

// Search across title, text, tags, category
searchPassages(query: string): CuratedPassage[]

// Get passages by category
getPassagesByCategory(category: string): CuratedPassage[]

// Get passages by tags
getPassagesByTags(tags: string[]): CuratedPassage[]

// Get most popular passages
getMostPopularPassages(limit?: number): CuratedPassage[]

// Get statistics about passage collection
getPassageStats(): PassageStats
```

### AI Generation API

```typescript
// Generate single passage with options
generatePassage(options: PassageGeneratorOptions): Promise<Passage>

// Generate passage featuring specific vocabulary words
generatePassageWithTargetWords(
  targetWords: string[],
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<Passage>

// Generate multiple passages (with rate limiting)
generatePassageBatch(
  count: number,
  options: PassageGeneratorOptions
): Promise<Passage[]>

// Get topic suggestions for generation
getTopicSuggestions(): string[]
```

### User Storage API

```typescript
// Save user passage
saveUserPassage(
  passage: Omit<UserPassage, 'id' | 'sourceType' | 'createdAt'>
): Promise<string>

// Get all user passages (sorted by most recent)
getUserPassages(): Promise<UserPassage[]>

// Get specific passage by ID
getUserPassage(id: string): Promise<UserPassage | undefined>

// Delete user passage
deleteUserPassage(id: string): Promise<boolean>

// Update user passage
updateUserPassage(
  id: string,
  updates: Partial<UserPassage>
): Promise<UserPassage | undefined>

// Search user passages
searchUserPassages(query: string): Promise<UserPassage[]>

// Get by difficulty
getUserPassagesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<UserPassage[]>

// Get by category
getUserPassagesByCategory(category: string): Promise<UserPassage[]>

// Get statistics
getUserPassageStats(): Promise<UserPassageStats>

// Validate passage data
validatePassage(passage: Partial<UserPassage>): ValidationResult

// Clear all user passages
clearUserPassages(): Promise<boolean>

// Export to JSON (backup)
exportUserPassages(): Promise<string>

// Import from JSON (restore)
importUserPassages(jsonData: string, merge?: boolean): Promise<number>
```

### React Hook API

```typescript
// Unified hook for all passage operations
function usePassages(): UsePassagesReturn {
  // Curated passages
  curatedPassages: CuratedPassage[];
  getCuratedByDifficulty: (difficulty: string) => CuratedPassage[];
  getCuratedByCategory: (category: string) => CuratedPassage[];
  searchCuratedPassages: (query: string) => CuratedPassage[];
  getRandomCuratedPassage: (difficulty?: string) => CuratedPassage | null;
  getPopularPassages: (limit?: number) => CuratedPassage[];

  // User passages
  userPassages: UserPassage[];
  savePassage: (passage) => Promise<string>;
  getPassage: (id: string) => Promise<UserPassage | undefined>;
  deletePassage: (id: string) => Promise<boolean>;
  updatePassage: (id: string, updates) => Promise<UserPassage | undefined>;
  searchUserPassagesByQuery: (query: string) => Promise<UserPassage[]>;
  getUserPassagesByDifficultyLevel: (difficulty: string) => Promise<UserPassage[]>;
  getUserPassagesByCategoryName: (category: string) => Promise<UserPassage[]>;
  clearAllUserPassages: () => Promise<boolean>;
  getUserStats: () => Promise<any>;

  // AI generation
  generateAIPassage: (options) => Promise<Passage>;
  generateWithWords: (words: string[], difficulty: string) => Promise<Passage>;
  generateBatch: (count: number, options) => Promise<Passage[]>;
  topicSuggestions: string[];
  isGenerating: boolean;

  // Combined operations
  getAllPassages: () => Passage[];
  getPassagesByDifficulty: (difficulty: string) => Passage[];
  searchAllPassages: (query: string) => Promise<Passage[]>;

  // Loading states
  loading: boolean;
  error: string | null;
  refreshUserPassages: () => Promise<void>;
}
```

## Component API

### PassageSelector Component

```typescript
interface PassageSelectorProps {
  onSelect: (passage: Passage) => void;
  onClose: () => void;
  initialTab?: 'curated' | 'ai' | 'imported';
  initialDifficulty?: 'beginner' | 'intermediate' | 'advanced';
}

<PassageSelector
  onSelect={(passage) => startReadingSession(passage)}
  onClose={() => setShowSelector(false)}
  initialTab="curated"
  initialDifficulty="intermediate"
/>
```

Features:
- Three tabs: Curated, AI Generated, My Passages
- Difficulty filter chips
- Search functionality
- AI generation form with options
- Passage cards with preview
- Loading states and error handling
- Haptic feedback
- Glassmorphism design

### ImportPassageForm Component

```typescript
interface ImportPassageFormProps {
  onImport: (passage: Passage) => void;
  onCancel: () => void;
  initialValues?: Partial<Passage>;
}

<ImportPassageForm
  onImport={(passage) => savePassage(passage)}
  onCancel={() => setShowForm(false)}
/>
```

Features:
- Title and text inputs
- Difficulty selector
- Category/topic tag
- Real-time stats (word count, char count, reading time)
- Validation with error display
- Preview mode
- Responsive keyboard handling

## Storage Implementation

### AsyncStorage Schema

```typescript
// Key: @vox_user_passages
// Value: JSON array of UserPassage objects

[
  {
    "id": "user_passage_1234567890_abc123",
    "title": "My Custom Passage",
    "text": "The full text content...",
    "difficulty": "intermediate",
    "category": "work",
    "wordCount": 150,
    "estimatedDuration": 50,
    "sourceType": "user_imported",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  ...
]
```

### Storage Operations Performance

- **Read**: O(1) - Single AsyncStorage.getItem()
- **Write**: O(n) - Read all, modify, write all
- **Search**: O(n) - Linear search through passages
- **Delete**: O(n) - Filter and write all

Optimized for:
- Small to medium collections (< 100 passages)
- Offline-first operation
- Simple CRUD without complex queries

## AI Generation Details

### Gemini Prompt Engineering

The system uses carefully crafted prompts that include:

1. **Role definition**: "You are an expert English language teacher"
2. **Difficulty-specific guidelines**: Vocabulary and sentence structure rules
3. **Style-specific guidelines**: Format and tone requirements
4. **Target words integration**: Natural inclusion of vocabulary
5. **Structured output**: JSON format specification
6. **Content restrictions**: Avoid controversial topics

### Fallback System

If Gemini API fails:
1. Catch error gracefully
2. Log error for debugging
3. Use pre-built template passages
4. Return valid Passage object
5. User never sees API error

Templates available for each difficulty level with realistic content.

## Validation Rules

### Passage Validation

```typescript
validatePassage(passage) {
  errors: string[]

  // Title required
  if (!title || title.trim().length === 0)
    errors.push('Title is required')

  // Text required
  if (!text || text.trim().length === 0)
    errors.push('Text content is required')

  // Minimum word count
  if (wordCount < 20)
    errors.push('Passage must be at least 20 words long')

  // Maximum word count
  if (wordCount > 1000)
    errors.push('Passage must be less than 1000 words')

  // Valid difficulty
  if (!['beginner', 'intermediate', 'advanced'].includes(difficulty))
    errors.push('Invalid difficulty level')

  return { valid: errors.length === 0, errors }
}
```

## Performance Considerations

### Curated Passages
- ✅ Static data, instant access
- ✅ No network calls
- ✅ Works offline
- ✅ Small memory footprint (~50KB)

### AI Generation
- ⚠️ Network dependent
- ⚠️ Requires API key
- ⚠️ ~2-5 second latency
- ✅ Has fallback system
- ✅ Rate limiting built-in

### User Storage
- ✅ Fast reads (AsyncStorage)
- ✅ Works offline
- ⚠️ Linear search performance
- ⚠️ Limited to device storage
- ✅ Export/import for backup

## Security Considerations

1. **API Key**: Store in environment variables, never commit
2. **User Input**: Validate all inputs before storage
3. **Storage Limits**: Validate total storage size
4. **XSS Protection**: Sanitize user text if rendered as HTML
5. **Rate Limiting**: Prevent API abuse with delays

## Testing Strategy

### Unit Tests
- Validation functions
- Helper utilities (word count, duration calculation)
- Storage operations (mock AsyncStorage)
- Search and filter functions

### Integration Tests
- Complete passage flow
- AI generation with mocked API
- Storage persistence
- Component interactions

### E2E Tests
- User selects curated passage
- User generates AI passage
- User imports custom text
- User edits and deletes passages

## Future Enhancements

### Short Term
- [ ] Word Bank integration for vocabulary targeting
- [ ] Passage history tracking
- [ ] Favorite passages feature
- [ ] Usage analytics

### Medium Term
- [ ] Multi-language support
- [ ] Audio narration for passages
- [ ] Passage sharing between users
- [ ] Difficulty analysis algorithm

### Long Term
- [ ] Community passage library
- [ ] Machine learning for personalization
- [ ] Advanced search with filters
- [ ] Passage recommendations

## Monitoring & Analytics

Track these metrics:
- Passage selection frequency by type
- AI generation success rate
- User passage creation rate
- Search query patterns
- Popular topics and categories
- Error rates and types

## Troubleshooting Guide

### Common Issues

**AI Generation Fails**
- Check EXPO_PUBLIC_GEMINI_API_KEY is set
- Verify network connectivity
- Check API quota/rate limits
- Review error logs
- Fallback system should activate automatically

**User Passages Not Saving**
- Check AsyncStorage permissions
- Verify validation passes
- Check available device storage
- Review error messages in logs

**Components Not Rendering**
- Verify all dependencies installed
- Check import paths
- Ensure design system constants exist
- Review TypeScript compilation errors

**Search Not Working**
- Check query string format
- Verify passages exist
- Review search function implementation
- Check console for errors

## Best Practices

1. **Always validate** user input before storage
2. **Handle errors gracefully** with user-friendly messages
3. **Provide loading states** for async operations
4. **Use haptic feedback** for better UX
5. **Cache frequently accessed** data
6. **Implement retry logic** for network operations
7. **Test with empty states** and edge cases
8. **Document all public APIs** with JSDoc
9. **Use TypeScript strictly** for type safety
10. **Follow React best practices** (hooks, memoization)

## Conclusion

This content management system provides a robust, user-friendly solution for managing reading content in the Vox language app. It balances three complementary sources (curated, AI-generated, user-imported) with a unified interface, offline-first approach, and comprehensive error handling.
