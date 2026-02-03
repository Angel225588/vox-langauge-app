# Notes System Feature Specification

## Overview
Allow users to save and review notes during their learning journey. The Notes System provides learners with the ability to capture insights, practice writing, and receive AI-powered corrections to improve their language skills.

## User Stories
- As a learner, I want to save notes while practicing so I can remember important concepts
- As a learner, I want to see my original notes vs AI corrections so I can learn from my mistakes
- As a learner, I want to access my notes from the Library so I can review them later
- As a learner, I want to filter notes by category so I can focus on specific topics
- As a learner, I want to export my notes so I can use them for external study

## Data Model

```typescript
interface UserNote {
  id: string;
  userId: string;
  originalText: string;
  correctedText?: string;
  corrections?: GrammarCorrection[];
  lessonId?: string;
  wordId?: string;
  category: 'vocabulary' | 'grammar' | 'writing' | 'general';
  createdAt: string;
  updatedAt: string;
  targetLanguage: string;
  nativeLanguage?: string;
  tags?: string[];
  isFavorite?: boolean;
}

interface GrammarCorrection {
  type: 'spelling' | 'grammar' | 'word-choice' | 'punctuation' | 'style';
  original: string;
  corrected: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
  severity: 'error' | 'warning' | 'suggestion';
}
```

## UI Components

### 1. NoteEditor
**Purpose**: Create and edit notes with real-time AI assistance

**Props**:
```typescript
interface NoteEditorProps {
  noteId?: string; // For editing existing notes
  lessonId?: string;
  wordId?: string;
  category?: UserNote['category'];
  onSave: (note: Partial<UserNote>) => void;
  onCancel: () => void;
}
```

**Features**:
- Rich text input with target language keyboard support
- Auto-save draft functionality
- Category selector
- Tag input for custom organization
- "Get AI Feedback" button for on-demand corrections
- Word/character count display
- Favorite toggle

**File Location**: `components/notes/NoteEditor.tsx`

---

### 2. NoteCard
**Purpose**: Display a single note with toggle between original and corrected versions

**Props**:
```typescript
interface NoteCardProps {
  note: UserNote;
  onEdit: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  defaultView?: 'original' | 'corrected';
}
```

**Features**:
- Toggle switch between original and corrected text
- Inline correction highlights (color-coded by severity)
- Tap on correction to see explanation
- Category badge
- Timestamp and lesson context (if applicable)
- Action menu (edit, delete, share, favorite)
- Expand/collapse for long notes

**File Location**: `components/notes/NoteCard.tsx`

---

### 3. NotesLibrary
**Purpose**: Browse, search, and manage all user notes

**Props**:
```typescript
interface NotesLibraryProps {
  userId: string;
  initialCategory?: UserNote['category'];
}
```

**Features**:
- Category filter tabs (All, Vocabulary, Grammar, Writing, General)
- Search bar (searches both original and corrected text)
- Sort options (Recent, Oldest, Most Corrections, Favorites)
- Empty state with "Create First Note" CTA
- Pull-to-refresh
- Infinite scroll/pagination
- Bulk actions (delete, export)
- Statistics card (total notes, avg corrections, etc.)

**File Location**: `components/notes/NotesLibrary.tsx`

---

### 4. NoteCorrectionView
**Purpose**: Detailed view of AI corrections with explanations

**Props**:
```typescript
interface NoteCorrectionViewProps {
  note: UserNote;
  onApplyCorrection: (correctionId: string) => void;
  onDismissCorrection: (correctionId: string) => void;
}
```

**Features**:
- Side-by-side comparison of original vs corrected
- List of all corrections grouped by type
- Tap correction to highlight in text
- Accept/dismiss individual corrections
- "Learn More" links to grammar resources
- Progress bar showing corrections addressed

**File Location**: `components/notes/NoteCorrectionView.tsx`

## Library Integration

### Navigation
- Notes accessible from Library tab
- Deep linking to specific notes: `vox://library/notes/{noteId}`
- Quick access from lesson context menus

### Library Tab Structure
```
Library Tab
├── Overview (stats, recent activity)
├── Vocabulary
├── Notes ← New section
│   ├── All Notes
│   ├── By Category
│   ├── Favorites
│   └── Search
├── Progress
└── Settings
```

### Features
1. **Filter by Category**: Quick filter chips for each category
2. **Toggle View**:
   - Default shows original text
   - Toggle to show corrected version
   - "Compare" mode shows side-by-side
3. **Export Functionality**:
   - Export as PDF (formatted for printing)
   - Export as plain text
   - Export to Anki flashcards (for corrections)
   - Share via system share sheet
4. **Statistics Dashboard**:
   - Total notes created
   - Most improved error types
   - Accuracy trend over time
   - Most active categories

## Database Schema (Supabase)

```sql
-- Notes table
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  corrected_text TEXT,
  corrections JSONB,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  word_id UUID REFERENCES vocabulary_words(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('vocabulary', 'grammar', 'writing', 'general')),
  target_language TEXT NOT NULL,
  native_language TEXT,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_category ON user_notes(category);
CREATE INDEX idx_user_notes_created_at ON user_notes(created_at DESC);
CREATE INDEX idx_user_notes_is_favorite ON user_notes(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_user_notes_tags ON user_notes USING GIN(tags);

-- Full text search index
CREATE INDEX idx_user_notes_search ON user_notes USING GIN(
  to_tsvector('english', original_text || ' ' || COALESCE(corrected_text, ''))
);

-- Row Level Security
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON user_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes" ON user_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON user_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON user_notes
  FOR DELETE USING (auth.uid() = user_id);
```

## API Integration

### Gemini AI Integration
Use existing `lib/ai/gemini.ts` client for grammar corrections.

**New function**:
```typescript
// lib/ai/gemini.ts
export async function correctNote(
  text: string,
  targetLanguage: string,
  userLevel: string
): Promise<{ correctedText: string; corrections: GrammarCorrection[] }> {
  const prompt = `
You are a language tutor helping a ${userLevel} learner of ${targetLanguage}.
Review the following text and provide corrections:

Original text:
${text}

Provide:
1. Corrected version of the full text
2. Detailed list of corrections with explanations

Format as JSON.
`;

  // Implementation using Gemini API
}
```

### Supabase Operations

**File Location**: `lib/db/notes.ts`

```typescript
export async function createNote(note: Partial<UserNote>): Promise<UserNote>;
export async function updateNote(noteId: string, updates: Partial<UserNote>): Promise<UserNote>;
export async function deleteNote(noteId: string): Promise<void>;
export async function getNoteById(noteId: string): Promise<UserNote | null>;
export async function getUserNotes(
  userId: string,
  filters?: { category?: string; tags?: string[]; isFavorite?: boolean }
): Promise<UserNote[]>;
export async function searchNotes(userId: string, query: string): Promise<UserNote[]>;
```

## Implementation Priority

### Phase 1: Basic Note Saving (Sprint 1)
**Goal**: Users can create and save simple notes

- [ ] Create database schema and migrations
- [ ] Implement `lib/db/notes.ts` CRUD operations
- [ ] Build `NoteEditor` component (without AI)
- [ ] Build basic `NoteCard` component
- [ ] Add "Add Note" button to lesson screens
- [ ] Store notes locally and sync to Supabase

**Success Criteria**:
- Users can create, edit, and delete notes
- Notes persist across app sessions
- Notes are associated with lessons/vocabulary when applicable

---

### Phase 2: AI Correction Integration (Sprint 2)
**Goal**: Provide AI-powered grammar feedback

- [ ] Implement `correctNote()` function using Gemini API
- [ ] Add "Get Feedback" button to NoteEditor
- [ ] Build `NoteCorrectionView` component
- [ ] Add correction toggle to `NoteCard`
- [ ] Implement inline correction highlights
- [ ] Store corrections in database

**Success Criteria**:
- Users can request AI corrections on their notes
- Corrections are clearly displayed with explanations
- Users can toggle between original and corrected versions
- Correction accuracy is >85% based on user feedback

---

### Phase 3: Library View with Filtering (Sprint 3)
**Goal**: Full-featured notes library for review and organization

- [ ] Build `NotesLibrary` component
- [ ] Implement category filtering
- [ ] Add search functionality
- [ ] Build statistics dashboard
- [ ] Add export functionality (PDF, text)
- [ ] Implement favorites and tags
- [ ] Add bulk actions

**Success Criteria**:
- Users can browse all notes in Library tab
- Search returns relevant results in <500ms
- Users can export notes in multiple formats
- Statistics provide meaningful insights

---

### Phase 4: Advanced Features (Future)
**Nice-to-have enhancements**:

- [ ] Spaced repetition for reviewing corrections
- [ ] Voice-to-text note creation
- [ ] Collaborative notes (share with tutors/friends)
- [ ] Note templates for common scenarios
- [ ] Integration with external note apps (Notion, Evernote)
- [ ] Offline mode with conflict resolution
- [ ] AI-generated practice exercises from notes

## Testing Requirements

### Unit Tests
- `lib/db/notes.ts`: All CRUD operations
- `lib/ai/gemini.ts`: `correctNote()` function
- Note parsing and validation logic

### Component Tests
- `NoteEditor`: Save, cancel, auto-save
- `NoteCard`: Toggle views, correction display
- `NotesLibrary`: Filtering, search, sorting

### Integration Tests
- End-to-end note creation flow
- AI correction request and display
- Library navigation and search
- Export functionality

### Performance Tests
- Library loads <500ms with 100+ notes
- Search returns results <500ms
- AI correction response <3s

## User Experience Considerations

### Accessibility
- Full screen reader support
- High contrast mode for corrections
- Keyboard navigation support
- Text size adjustments

### Localization
- All UI strings translatable
- RTL language support
- Date/time formatting per locale

### Error Handling
- Offline mode: queue AI requests, save locally
- Failed corrections: retry mechanism with user feedback
- Network errors: graceful degradation
- Validation errors: clear inline messages

### Onboarding
- First note: guided tutorial
- Empty state CTAs with examples
- Tooltip on AI correction feature
- Sample notes for new users

## Analytics & Metrics

Track the following events:
- `note_created` (category, has_lesson_context)
- `note_edited`
- `note_deleted`
- `ai_correction_requested`
- `ai_correction_applied`
- `note_exported` (format)
- `note_searched` (query_length, results_count)
- `note_favorited`

Key metrics:
- Daily/weekly active note users
- Average notes per user
- AI correction usage rate
- Export feature adoption
- Search usage and success rate

## Open Questions

1. **Character limits**: Should we limit note length? (Suggest 5000 chars)
2. **AI rate limiting**: How many AI corrections per day for free users?
3. **Storage quotas**: Limit on total notes per user?
4. **Privacy**: Can users mark notes as private (not used for AI training)?
5. **Collaboration**: Future support for shared notes with tutors?

## Dependencies

- Existing Gemini AI integration (`lib/ai/gemini.ts`)
- Supabase database and auth
- User profile data (language level, target language)
- Design system components (from `components/ui/`)

## References

- Design System: `/constants/designSystem.ts`
- AI Integration: `/lib/ai/gemini.ts`
- Database Utilities: `/lib/db/`
- Similar feature: Vocabulary cards (`components/cards/vocabulary/`)
