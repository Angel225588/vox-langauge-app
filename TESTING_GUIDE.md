# Testing Guide for Vox Language App

## Overview

This app now has a comprehensive testing setup using Jest and React Native Testing Library. Testing is **critical** for maintaining quality as the app grows.

---

## Testing Stack

- **Jest** - Test runner and assertion library
- **React Native Testing Library** - Component testing utilities
- **TypeScript** - Full type safety in tests
- **Coverage Reports** - Track code coverage

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-re-run on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci
```

---

## Test Structure

```
__tests__/
├── lib/                      # Business logic tests
│   ├── staircase-generator.test.ts
│   └── api/                  # API layer tests (TODO)
├── hooks/                    # Custom hooks tests
│   ├── useOnboarding.test.ts
│   ├── useAuth.test.ts       # TODO
│   └── useProgress.test.ts   # TODO
└── components/               # Component tests (TODO)
    ├── cards/
    └── ui/
```

---

## What's Currently Tested

### ✅ AI Staircase Generator (`lib/gemini/staircase-generator.ts`)

Tests cover:
- **Successful Gemini API responses** - Validates JSON parsing and data structure
- **Fallback mechanism** - Ensures app works when Gemini API fails
- **Data validation** - Checks defaults for missing fields
- **Edge cases** - Markdown code blocks, malformed responses
- **Calculation logic** - Total days, vocabulary counts

**Test File**: `__tests__/lib/staircase-generator.test.ts`

**Coverage**: 10 test cases

### ✅ Onboarding State Management (`hooks/useOnboarding.ts`)

Tests cover:
- **Initial state** - Verifies correct default values
- **State updates** - All fields (goal, level, time, scenarios, motivation)
- **State merging** - Partial updates preserve existing data
- **Reset functionality** - Clears all data correctly
- **Complete flow** - Simulates full 5-step onboarding
- **Edge cases** - Empty arrays, null values, custom scenarios

**Test File**: `__tests__/hooks/useOnboarding.test.ts`

**Coverage**: 20+ test cases

---

## What Needs Testing Next (Priority Order)

### 1. **Database Sync Logic** (HIGH PRIORITY)

The most critical untested area. Database sync between SQLite (local) and Supabase (remote) is complex and error-prone.

**Files to test**:
- `lib/db/sync.ts` - Main sync orchestration
- `lib/db/supabase.ts` - Supabase operations
- `lib/api/staircases.ts` - API layer for staircases

**Test scenarios**:
- Successful sync (local → remote)
- Conflict resolution (same data edited offline and online)
- Offline mode (queue operations, sync when online)
- Network failures and retries
- Data integrity after sync

### 2. **Authentication Flow** (HIGH PRIORITY)

Ensure users can sign up, log in, and maintain sessions correctly.

**Files to test**:
- `hooks/useAuth.ts` - Auth state management
- `lib/auth/supabase-auth.ts` - Supabase auth operations

**Test scenarios**:
- Sign up new user
- Log in existing user
- Session persistence
- Sign out
- Token refresh
- Error handling (wrong password, network issues)

### 3. **Progress Tracking** (MEDIUM PRIORITY)

Validate streak calculations, points accumulation, and lesson completion logic.

**Files to test**:
- `hooks/useProgress.ts` - Progress data fetching
- `lib/db/progress.ts` - Progress calculations

**Test scenarios**:
- Streak calculations (consecutive days, breaks)
- Points accumulation (correct amounts per activity)
- Lesson completion updates
- Daily stats aggregation

### 4. **UI Components** (MEDIUM PRIORITY)

Component tests ensure UI elements render correctly and handle interactions.

**Components to test**:
- `components/cards/SpeakingCard.tsx` - Recording, skip button
- `components/cards/MultipleChoiceCard.tsx` - Selection logic
- `components/StreakDisplay.tsx` - Visual rendering
- `components/ProgressCard.tsx` - Data display

**Test scenarios**:
- Renders with correct props
- User interactions (tap, swipe, record)
- Edge cases (empty data, errors)
- Accessibility

### 5. **Lesson Generation** (LOW PRIORITY)

Test Gemini AI lesson content generation.

**Files to test**:
- `lib/gemini/lesson-generator.ts`

**Test scenarios**:
- Generate lessons for different stairs
- Handle API failures gracefully
- Validate lesson structure (cards, vocabulary, etc.)

---

## Writing New Tests

### Example: Testing a Hook

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useMyHook } from '../../hooks/useMyHook';

describe('useMyHook', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => useMyHook());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.updateData('new value');
    });

    expect(result.current.data).toBe('new value');
  });
});
```

### Example: Testing Business Logic

```typescript
import { myFunction } from '../../lib/myModule';

describe('myFunction', () => {
  it('should calculate correctly', () => {
    const result = myFunction(5, 10);
    expect(result).toBe(15);
  });

  it('should handle edge cases', () => {
    expect(myFunction(0, 0)).toBe(0);
    expect(myFunction(-5, 5)).toBe(0);
  });
});
```

### Example: Mocking Supabase

```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}));
```

---

## Coverage Goals

Set realistic coverage targets:

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 50,    // 50% of branches covered
    functions: 50,   // 50% of functions tested
    lines: 50,       // 50% of lines executed
    statements: 50,  // 50% of statements run
  },
}
```

As you add more tests, gradually increase these thresholds:
- **Short term (next 2 weeks)**: 60%
- **Medium term (1 month)**: 70%
- **Long term (3 months)**: 80%+

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Pre-commit Hook (Optional)

Run tests before every commit:

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

---

## Common Testing Patterns

### 1. **Test Isolation**

Each test should be independent:

```typescript
beforeEach(() => {
  // Reset state before each test
  jest.clearAllMocks();
});
```

### 2. **Async Testing**

Use async/await for promises:

```typescript
it('should fetch data', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### 3. **Error Testing**

Test error handling:

```typescript
it('should handle errors', async () => {
  mockAPI.mockRejectedValue(new Error('API Error'));

  await expect(myFunction()).rejects.toThrow('API Error');
});
```

### 4. **Mock Data**

Create realistic test data:

```typescript
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  created_at: '2025-01-01T00:00:00Z',
};
```

---

## Debugging Tests

### View Test Output

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test file
npm test staircase-generator.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should generate"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

---

## Best Practices

1. **Test behavior, not implementation** - Focus on what the function does, not how
2. **Use descriptive test names** - `it('should calculate total when given valid numbers')`
3. **Arrange-Act-Assert pattern** - Setup → Execute → Verify
4. **One assertion per test (when possible)** - Makes failures clearer
5. **Test edge cases** - Empty arrays, null values, network failures
6. **Keep tests fast** - Mock external dependencies (API, database)
7. **Don't test third-party libraries** - Trust Expo, Supabase, etc. work correctly

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing-with-jest/)

---

## Next Steps

1. ✅ **Done**: Jest setup, staircase generator tests, onboarding hook tests
2. **Immediate**: Add database sync tests (highest risk area)
3. **This Week**: Add auth flow tests
4. **This Month**: Reach 60% code coverage
5. **Long Term**: Set up CI/CD pipeline with automated testing

---

**Remember**: Testing isn't about perfection. It's about confidence. Every test you write makes the app more reliable and easier to change.

Good luck! 🚀
