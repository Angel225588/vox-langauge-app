# Path Generation Service

**Location:** `/lib/services/pathGeneration.ts`

## Overview

The Path Generation Service is the central orchestrator for creating personalized learning paths in Vox Language App. It coordinates the entire flow from onboarding completion to a fully stored, AI-generated learning path with stairs, vocabulary, and scenarios.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Path Generation Service                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  1. Validate Onboarding Data          │
        │     - Check required fields           │
        │     - Ensure data integrity           │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  2. Transform Data                     │
        │     - Map to PathGenerationInput       │
        │     - Normalize proficiency levels     │
        │     - Standardize timelines            │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  3. Generate Path (AI or Fallback)    │
        │     - Call Gemini AI                   │
        │     - Parse and validate response      │
        │     - Fallback to templates if needed  │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  4. Store in Database                  │
        │     - Create learning_path             │
        │     - Create section (first section)   │
        │     - Create stairs (5-7 stairs)       │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  5. Initialize User AI Memory          │
        │     - Store user profile               │
        │     - Set up personalization           │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  6. Return Result                      │
        │     - Success: { pathId }              │
        │     - Failure: { error }               │
        └───────────────────────────────────────┘
```

## Main Function

### `createPersonalizedPath(userId, onboardingData)`

**Purpose:** Creates a complete personalized learning path from onboarding data.

**Parameters:**
- `userId: string` - The user's unique identifier
- `onboardingData: OnboardingData` - Data collected during onboarding

**Returns:** `Promise<PathCreationResult>`
```typescript
{
  success: boolean;
  pathId?: string;    // Only present if success = true
  error?: string;     // Only present if success = false
}
```

**Example:**
```typescript
const result = await createPersonalizedPath('user_123', onboardingData);

if (result.success) {
  console.log('Path created:', result.pathId);
  router.push('/home');
} else {
  console.error('Error:', result.error);
  Alert.alert('Error', result.error);
}
```

## Data Flow

### Input: OnboardingData

Data structure from `useOnboardingV2` hook:

```typescript
interface OnboardingData {
  native_language: string | null;      // e.g., "English"
  target_language: string | null;      // e.g., "Spanish"
  motivation: string | null;           // e.g., "travel", "career"
  motivation_custom: string | null;    // Custom motivation text
  why_now: string | null;              // Why learning now
  proficiency_level: string | null;    // e.g., "beginner"
  previous_attempts: string | null;    // Past learning experience
  timeline: string | null;             // e.g., "3-6_months"
  commitment_stakes: string | null;    // What's at stake
}
```

### Transform: PathGenerationInput

Standardized format for AI generation:

```typescript
interface PathGenerationInput {
  user_id: string;
  target_language: string;
  native_language: string;
  motivation: string;
  motivation_custom?: string;
  why_now?: string;
  proficiency_level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  timeline: '1_month' | '3_months' | '6_months' | '1_year';
  previous_attempts?: string;
  commitment_stakes: string;
}
```

**Transformations:**
- Proficiency level mapping:
  - `beginner` → `beginner`
  - `elementary` → `elementary`
  - `intermediate` → `intermediate`
  - `upper_intermediate` → `intermediate`
  - `advanced` → `advanced`

- Timeline mapping:
  - `1-3_months` → `1_month`
  - `3-6_months` → `3_months`
  - `6-12_months` → `6_months`
  - `no_deadline` → `1_year`

### Output: GeneratedPath

AI-generated (or template-based) learning path:

```typescript
interface GeneratedPath {
  path_title: string;
  path_description: string;
  total_stairs: number;
  estimated_completion: string;
  stairs: GeneratedStair[];
}

interface GeneratedStair {
  order: number;
  title: string;
  emoji: string;
  description: string;
  vocabulary: VocabItem[];          // 20-30 words
  grammar_points: string[];
  scenarios: Scenario[];            // 2-4 scenarios
  skills_required: string[];
  skills_unlocked: string[];
  estimated_days: number;
}
```

## Helper Functions

### `validateOnboardingData(data: OnboardingData): string | null`

Validates onboarding data before processing.

**Returns:**
- `null` if valid
- Error message string if invalid

**Validation Rules:**
- `native_language` is required
- `target_language` is required
- `motivation` OR `motivation_custom` is required
- `proficiency_level` is required
- `timeline` is required
- `commitment_stakes` is required

### `transformOnboardingToInput(userId, data): PathGenerationInput`

Transforms onboarding data to AI-compatible format.

**What it does:**
- Maps proficiency levels to standardized values
- Maps timelines to standardized values
- Handles optional fields
- Adds user ID

### `generateLearningPath(input): Promise<GeneratedPath>`

Calls Gemini AI to generate the learning path.

**Process:**
1. Import Gemini SDK dynamically
2. Load API key from environment
3. Generate detailed prompt using `generatePathPrompt()`
4. Call Gemini API (model: `gemini-2.0-flash-exp`)
5. Parse JSON response using `extractJSON()`
6. Validate path structure using `validateGeneratedPath()`

**Throws:**
- Error if API key is missing
- Error if AI response is invalid JSON
- Error if path structure is invalid

### `generateFallbackPath(motivation, targetLanguage, proficiencyLevel): GeneratedPath`

Generates a template-based path when AI fails.

**What it does:**
- Selects template based on motivation (career, travel, relationship, etc.)
- Creates 5-7 stairs from template progression
- Generates basic vocabulary for each stair
- Creates default scenarios
- Returns fully structured GeneratedPath

**Templates Available:**
- `career` - Professional language, business phrases
- `travel` - Survival phrases, navigation
- `relationship` - Casual conversation, emotions
- `academic` - Grammar, reading, writing
- `heritage` - Family vocabulary, cultural expressions

### `storePath(userId, generatedPath, input): Promise<string>`

Orchestrates storing the path in the database.

**Currently Stubbed:**
- Logs what would be created
- Returns mock path ID
- Includes TODO comments for actual implementation

**Will Create:**
1. **learning_path** record
   - User association
   - Path metadata (title, description)
   - Languages and motivation
   - Estimated completion

2. **section** record (first section)
   - Associated with path
   - Order: 1
   - Contains 5-7 stairs
   - Status: 'current'

3. **stair** records (5-7 stairs)
   - Associated with section
   - Vocabulary, grammar, scenarios
   - Skills and progression
   - First stair status: 'current'
   - Others status: 'locked'

## Error Handling

The service includes comprehensive error handling:

1. **Validation Errors**
   - Missing required fields
   - Invalid data format
   - Returns `{ success: false, error: "..." }`

2. **AI Generation Errors**
   - API key missing
   - Network failures
   - Invalid AI responses
   - **Falls back to template-based generation**

3. **Database Errors** (when implemented)
   - Connection failures
   - Constraint violations
   - **Logs error and returns failure**

4. **Unexpected Errors**
   - Caught by try/catch
   - Logged with details
   - Returns generic error message

## Integration Points

### With Onboarding Hook

```typescript
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';
import { createPersonalizedPath } from '@/lib/services/pathGeneration';

function OnboardingComplete() {
  const { data } = useOnboardingV2();
  const { user } = useAuth();

  const handleComplete = async () => {
    const result = await createPersonalizedPath(user.id, data);
    // Handle result
  };
}
```

### With React Query

```typescript
import { useMutation } from '@tanstack/react-query';

const createPath = useMutation({
  mutationFn: ({ userId, data }) =>
    createPersonalizedPath(userId, data),
  onSuccess: (result) => {
    if (result.success) {
      router.push('/home');
    }
  },
});
```

### With Database Service (pending)

```typescript
// When lib/db/learningPaths.ts is created:
import { createLearningPath, createSection, createStair } from '@/lib/db/learningPaths';

// The storePath function will use these to:
const pathId = await createLearningPath({ ... });
const sectionId = await createSection({ path_id: pathId, ... });
await createStair({ section_id: sectionId, ... });
```

## Next Steps

### TODO: Database Implementation

Create `/lib/db/learningPaths.ts` with these functions:

```typescript
export async function createLearningPath(data: {
  user_id: string;
  title: string;
  description: string;
  target_language: string;
  native_language: string;
  motivation: string;
  estimated_completion: string;
  total_stairs: number;
}): Promise<string>

export async function createSection(data: {
  path_id: string;
  order: number;
  title: string;
  description: string;
  stairs_count: number;
}): Promise<string>

export async function createStair(data: {
  section_id: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  vocabulary: VocabItem[];
  grammar_points: string[];
  scenarios: Scenario[];
  skills_required: string[];
  skills_unlocked: string[];
  estimated_days: number;
}): Promise<string>
```

### TODO: Update storePath Function

Replace stub implementation with actual database calls:

```typescript
async function storePath(...) {
  const pathId = await createLearningPath({ ... });
  const sectionId = await createSection({ ... });

  for (const stair of generatedPath.stairs) {
    await createStair({ ... });
  }

  return pathId;
}
```

## Testing

### Manual Testing Checklist

- [ ] Valid onboarding data creates path successfully
- [ ] Missing required fields returns validation error
- [ ] AI generation succeeds with valid input
- [ ] Fallback template works when AI fails
- [ ] User AI memory is initialized
- [ ] Correct data transformations (proficiency, timeline)
- [ ] Error messages are user-friendly

### Test Cases

```typescript
// Test 1: Valid data
const validData = {
  native_language: 'English',
  target_language: 'Spanish',
  motivation: 'travel',
  motivation_custom: null,
  why_now: 'Trip next year',
  proficiency_level: 'beginner',
  previous_attempts: null,
  timeline: '3-6_months',
  commitment_stakes: 'I want to travel confidently',
};
// Should return: { success: true, pathId: "..." }

// Test 2: Missing required field
const invalidData = { ...validData, native_language: null };
// Should return: { success: false, error: "Native language is required" }

// Test 3: Custom motivation
const customData = { ...validData, motivation: null, motivation_custom: 'Reading manga' };
// Should work and use custom motivation in AI prompt
```

## Logging

All major operations are logged with the `[PathGeneration]` prefix:

```typescript
console.log('[PathGeneration] Starting path creation for user:', userId);
console.log('[PathGeneration] Onboarding data:', data);
console.log('[PathGeneration] Calling Gemini AI...');
console.log('[PathGeneration] AI generated path:', title);
console.log('[PathGeneration] Storing path in database...');
console.log('[PathGeneration] Path stored successfully:', pathId);
console.error('[PathGeneration] Validation failed:', error);
```

Use these logs for debugging during development.

## Performance

**Expected Performance:**
- Validation: < 1ms
- Data transformation: < 1ms
- AI generation: 2-5 seconds
- Database storage: 100-500ms (when implemented)
- **Total time: 2-6 seconds**

**Optimization Opportunities:**
- Cache common path templates
- Parallel database writes for stairs
- Background AI memory initialization

## Security

**Environment Variables:**
- `EXPO_PUBLIC_GEMINI_API_KEY` must be set
- Never expose API key in client code
- Consider backend proxy for production

**Data Validation:**
- All inputs validated before processing
- SQL injection prevention (when using database)
- Sanitize user input in prompts

## See Also

- `/lib/ai/prompts/pathGeneration.ts` - AI prompt generation
- `/lib/ai/gemini.ts` - Gemini API client
- `/lib/ai/userMemory.ts` - User AI memory system
- `/hooks/useOnboardingV2.ts` - Onboarding data hook
- `/types/learning.ts` - Type definitions
- `pathGeneration.example.ts` - Usage examples

---

**Created:** 2025-12-13
**Status:** Active Development
**Dependencies:** Gemini AI, User Memory System, Database Service (pending)
