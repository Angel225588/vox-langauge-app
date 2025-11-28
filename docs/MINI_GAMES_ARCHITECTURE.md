# Mini-Games Architecture & Gemini MCP Integration

**Date:** November 26, 2025
**Status:** Foundation Complete, New Games In Progress
**Purpose:** Document the card-based mini-game system and Gemini AI's role in dynamic lesson composition

---

## Table of Contents

1. [Overview](#overview)
2. [Card System Philosophy](#card-system-philosophy)
3. [Existing Cards Assessment](#existing-cards-assessment)
4. [New Mini-Games Specification](#new-mini-games-specification)
5. [Gemini MCP Integration](#gemini-mcp-integration)
6. [Card Registry System](#card-registry-system)
7. [Lesson Composition Workflow](#lesson-composition-workflow)
8. [3-Month Learning Plan Integration](#3-month-learning-plan-integration)
9. [Testing Strategy](#testing-strategy)
10. [Community Features Roadmap](#community-features-roadmap)

---

## Overview

Vox Language App uses a **card-based mini-game system** where each "card" is a self-contained interactive learning exercise. Cards are:
- **Modular**: Each card is an independent React component
- **Reusable**: Same card types work with different content
- **AI-Composable**: Gemini AI selects and sequences cards dynamically
- **Progress-Tracked**: Each card reports completion, accuracy, and time

**Vision**: Gemini AI acts as a personalized tutor, selecting the right sequence of cards based on:
- User's proficiency level
- Learning goals and motivation
- Recent performance and struggle areas
- Time constraints and intensity preferences

---

## Card System Philosophy

### Core Principles

1. **Reward Effort Over Perfection**
   - Points awarded for every attempt
   - No penalties for mistakes
   - Progress tracking focuses on practice volume

2. **Progressive Difficulty**
   - Cards have easy/medium/hard variations
   - Gemini adjusts difficulty based on performance

3. **Multimodal Learning**
   - Audio (listening, pronunciation)
   - Visual (images, text)
   - Kinesthetic (drag-drop, tapping)
   - Speaking (voice recording)

4. **Immediate Feedback**
   - Visual confirmation (green/red highlights)
   - Haptic feedback
   - Audio cues
   - Explanatory messages

---

## Existing Cards Assessment

### Currently Implemented (6 Cards)

#### 1. **SingleVocabCard** (`components/cards/SingleVocabCard.tsx`)
- **Purpose**: Display vocabulary with image and audio
- **Features**:
  - Large image (70% screen width)
  - Word + phonetic pronunciation (IPA)
  - Optional translation
  - Audio playback (normal + slow speed)
- **Use Cases**: Words, phrases, sentences
- **Status**: ✅ Fully functional
- **Polish Needed**:
  - Integrate Google TTS (currently using expo-speech)
  - Add more animation on card appearance
  - Improve loading states for images

#### 2. **MultipleChoiceCard** (`components/cards/MultipleChoiceCard.tsx`)
- **Purpose**: Select correct word/image from options
- **Features**:
  - Question prompt
  - 3-4 option buttons
  - Visual feedback on selection
  - Points calculation
- **Status**: ✅ Fully functional
- **Polish Needed**:
  - Add explanation after wrong answer
  - Improve button animations
  - Add difficulty variations (2 options for easy, 4 for hard)

#### 3. **AudioToImageCard** (`components/cards/AudioToImageCard.tsx`)
- **Purpose**: Listen to audio → select matching image
- **Features**:
  - Audio playback button
  - Grid of 4 images
  - Tap to select
  - Audio replay option
- **Status**: ✅ Fully functional
- **Polish Needed**:
  - Google TTS integration
  - Add visual waveform during playback
  - Improve image loading performance

#### 4. **TextInputCard** (`components/cards/TextInputCard.tsx`)
- **Purpose**: Type what you hear (dictation)
- **Features**:
  - Audio playback
  - Text input field
  - Spell-checking hints
  - Accuracy calculation
- **Status**: ✅ Fully functional
- **Polish Needed**:
  - Add keyboard shortcuts
  - Improve hint system
  - Show character-by-character diff on mistakes

#### 5. **SpeakingCard** (`components/cards/SpeakingCard.tsx`)
- **Purpose**: Record pronunciation practice
- **Features**:
  - Target word/phrase display
  - Audio playback of target
  - Microphone recording
  - Waveform visualization
- **Status**: ✅ Fully functional (mock recording)
- **Polish Needed**:
  - Integrate real speech recognition (Google Speech-to-Text)
  - Add pronunciation scoring
  - Google TTS for better target audio

#### 6. **ComparisonCard** (`components/cards/ComparisonCard.tsx`)
- **Purpose**: Compare two options (A vs B)
- **Features**:
  - Side-by-side comparison
  - Audio for both options
  - Tap to select preference
  - Use case: "Better to say X than Y"
- **Status**: ✅ Fully functional
- **Polish Needed**:
  - Add explanation of why one is better
  - Google TTS integration
  - More visual differentiation between options

### Common Polish Requirements (All Cards)

- ✅ **Design System**: All cards use consistent dark theme with glassmorphic effects
- ⚠️ **Google TTS**: Replace expo-speech with Google Cloud TTS for better voices
- ✅ **Haptic Feedback**: All interactions have tactile feedback
- ✅ **Animations**: Smooth transitions with Reanimated
- ⚠️ **Error Handling**: Improve network error states
- ⚠️ **Loading States**: Better skeleton screens while loading content

---

## New Mini-Games Specification

### Priority 1: Foundational Exercises

#### 1. **SentenceScrambleCard** (In Development by Gemini)
- **Purpose**: Drag & drop words to form grammatically correct sentences
- **Learning Objective**: Intuitive grammar understanding, word order
- **Features**:
  - Shuffled word tiles
  - Drag-and-drop interaction
  - Grammar hint system
  - Audio playback of correct sentence
  - Visual feedback (tiles snap into place)
- **Difficulty Levels**:
  - Easy: 3-4 words, simple present tense
  - Medium: 5-7 words, compound sentences
  - Hard: 8-10 words, complex grammar
- **Implementation Notes**:
  - Use `react-native-gesture-handler` for drag
  - Validate sentence structure, not just word order
  - Allow multiple correct variations

#### 2. **FillInBlankCard** (In Development by Gemini)
- **Purpose**: Complete dialogue by selecting the correct phrase
- **Learning Objective**: Conversational flow, contextual vocabulary
- **Features**:
  - Dialogue with [BLANK] placeholder
  - 3-4 option buttons
  - Context hints
  - Audio playback of complete dialogue when correct
- **Difficulty Levels**:
  - Easy: Single word blanks, obvious context
  - Medium: Short phrases, requires context understanding
  - Hard: Idiomatic expressions, subtle differences between options
- **Implementation Notes**:
  - Highlight the blank in the dialogue
  - Provide grammatical hints ("verb", "preposition")
  - Show all options' meanings after answer

#### 3. **DescribeImageCard** (In Development by Gemini)
- **Purpose**: Type or speak a description of an image
- **Learning Objective**: Creative vocabulary use, spontaneous speech
- **Features**:
  - Large image display
  - Text input OR voice recording
  - Keyword detection (highlights words user included)
  - AI feedback: "You used 4/5 key words!"
  - Suggested vocabulary prompts
- **Difficulty Levels**:
  - Easy: 5+ words, basic nouns
  - Medium: 10+ words, adjectives and verbs
  - Hard: 20+ words, descriptive sentences
- **Implementation Notes**:
  - Use simple keyword matching initially
  - Future: Gemini AI analysis of description quality
  - Show example descriptions after completion

### Priority 2: Advanced Exercises

#### 4. **StorytellingCard** (In Development by Gemini)
- **Purpose**: Connect 3-5 images into a coherent story
- **Learning Objective**: Conjunctions, narrative flow, complex sentences
- **Features**:
  - Horizontal scrollable image carousel
  - Multi-line text input
  - Conjunction suggestion chips ("and", "but", "so", "because")
  - Word count display
  - Audio recording option
  - AI analysis of story coherence
- **Difficulty Levels**:
  - Easy: 3 images, simple sentences
  - Medium: 4 images, require conjunctions
  - Hard: 5 images, complex narrative with transitions
- **Implementation Notes**:
  - Detect conjunction usage
  - Count sentences (minimum 3)
  - Gemini AI can analyze narrative structure

#### 5. **QuestionGameCard** ("20 Questions" style) (In Development by Gemini)
- **Purpose**: Ask yes/no questions to guess a mystery word
- **Learning Objective**: Question formation, logical thinking
- **Features**:
  - Text input for questions
  - AI responds with "Yes" or "No"
  - Question counter (e.g., "5/10 questions used")
  - History of questions and answers
  - Guess button for final answer
  - Grammar feedback on questions
- **Difficulty Levels**:
  - Easy: 10 questions, common objects
  - Medium: 8 questions, abstract concepts
  - Hard: 6 questions, specific items
- **Implementation Notes**:
  - Use Gemini AI to respond to questions
  - Validate question format (starts with "Is it...", "Does it...", etc.)
  - Provide hints after 5 questions

#### 6. **FluencyReadingCard** (HIGH PRIORITY - Weakness Detection) ⭐ NEW
- **Purpose**: Read text aloud with AI-powered pronunciation analysis
- **Learning Objective**: Improve fluency, identify pronunciation weaknesses, automatic vocabulary reinforcement
- **Core Innovation**: Uses Google Speech-to-Text to compare user's pronunciation with the target text, automatically creating flashcards for mispronounced words/phrases
- **Features**:
  - **Teleprompter Mode**: Static paragraph or scrolling text
  - **Voice Recording**: User reads text aloud
  - **AI Analysis**: Google Speech-to-Text transcribes user's speech
  - **Word-Level Comparison**: Compares transcription with target text
  - **Weakness Detection**: Identifies mispronounced or skipped words
  - **Auto-Flashcard Generation**: Adds problematic words/phrases to weekly review deck
  - **Progress Tracking**: Shows improvement in pronunciation accuracy over time
  - **Visual Feedback**: Highlights correctly vs. incorrectly pronounced words
  - **Retry Option**: Let user re-record specific sentences
- **Difficulty Levels**:
  - Easy: Short sentences (5-8 words), common vocabulary, slow speed
  - Medium: Paragraphs (50-100 words), moderate vocabulary, normal speed
  - Hard: Long passages (150+ words), complex vocabulary, fast speed
- **Fluency Metrics**:
  - Words per minute (WPM)
  - Pronunciation accuracy (% correct)
  - Fluency score (smoothness, pauses)
  - Improvement over time graph
- **Gamification Ideas** (from Gemini brainstorm):
  - **Model Robot Reading/Silly Voices**: Read in different fun voices (robot, mouse, monster) to practice expression
  - **Beat the Timer**: See how many words/phrases can be read correctly before timer runs out
  - **Reader's Theater**: Assign parts to read a script, encourages expressive and repeated reading
  - **Reading Contests (Against Themselves)**: Re-read passage and track last word reached to see improvement
  - **Practice with Punctuation**: Emphasize how punctuation affects reading and expression
- **Implementation Notes**:
  - Integrate Google Cloud Speech-to-Text API for transcription
  - Use word-level alignment to detect exact mispronunciations
  - Create flashcard schema: `{ word, context_sentence, pronunciation_error, user_said, correct_pronunciation }`
  - Store recordings locally for progress comparison
  - Weekly report: "You struggled with these 12 words this week"
  - Auto-add to spaced repetition system with high priority
  - Privacy: Keep recordings on-device unless user opts to share

#### 7. **RealWorldAudioCard** (Future)
- **Purpose**: Understand speech with background noise
- **Learning Objective**: Train ear for natural, fast speech
- **Features**:
  - Audio clip with ambient noise (cafe, street, etc.)
  - Multiple-choice questions about key information
  - Adjustable noise level
  - Transcript reveal option
- **Difficulty Levels**:
  - Easy: Clear audio, slow speed, minimal noise
  - Medium: Normal speed, moderate background noise
  - Hard: Fast speech, heavy noise, accents
- **Implementation Notes**:
  - Pre-record audio clips with controlled noise levels
  - Use real-world scenarios (ordering coffee, asking directions)

### Priority 3: Community-Ready Exercises

#### 8. **RolePlayCard** (In Development by Gemini)
- **Purpose**: Practice conversation with AI or human partner
- **Learning Objective**: Practical dialogue, spontaneous responses
- **Features**:
  - Chat-style interface
  - AI plays a role (waiter, store clerk, interviewer)
  - User types or speaks responses
  - Suggestion chips with helpful phrases
  - Correction mode (AI gently fixes mistakes)
  - Conversation history
  - Summary with phrases practiced
- **Difficulty Levels**:
  - Easy: Simple transactions (ordering food)
  - Medium: Problem-solving (returning item, asking for help)
  - Hard: Professional scenarios (job interview, negotiation)
- **Implementation Notes**:
  - Integrate Gemini AI for realistic responses
  - Detect when user is stuck, offer suggestions
  - Allow human-to-human mode for community practice

#### 9. **CollaborativeStoryCard** (Future)
- **Purpose**: Build a story with a partner (turn-based)
- **Learning Objective**: Creative language, listening, sentence building
- **Features**:
  - Turn-based: one sentence at a time
  - Story starter prompt
  - Previous sentences displayed
  - Save completed stories
  - Share to community
- **Difficulty Levels**:
  - Easy: 6 sentences total (3 per person)
  - Medium: 10 sentences
  - Hard: 16 sentences, must include specific vocabulary
- **Implementation Notes**:
  - Works with AI partner or human
  - AI adapts to user's level
  - Community voting on best stories

---

## Gemini MCP Integration

### What is MCP (Model Context Protocol)?

In this context, **MCP** means **Gemini AI acts as a tool/service** that:
1. Receives context about the user (level, goals, motivation, progress)
2. Receives a "catalog" of available card types
3. Returns a personalized sequence of cards to create a lesson

**Analogy**: Gemini is like a tutor selecting textbook exercises, but instead of pages, it's selecting and sequencing our mini-game cards.

### Architecture

```typescript
// lib/gemini/lesson-composer.ts

interface CardType {
  id: string;                    // e.g., "sentence-scramble"
  name: string;                  // "Sentence Scramble"
  learningObjective: string;     // "Grammar and word order"
  difficulty: ['easy', 'medium', 'hard'];
  timeEstimate: number;          // minutes
  requiresAudio: boolean;
  requiresInternet: boolean;
}

interface UserContext {
  proficiency_level: string;
  learning_goal: string;
  motivation_data: {
    why: string;
    fear: string;
    stakes: string;
    timeline: string;
  };
  recent_performance: {
    accuracy: number;
    weak_areas: string[];        // e.g., ["grammar", "speaking"]
  };
  time_available: number;        // minutes for this session
}

interface CardSelection {
  cardType: string;              // "sentence-scramble"
  difficulty: 'easy' | 'medium' | 'hard';
  content: any;                  // Card-specific content
  reasoning: string;             // Why Gemini chose this card
  sequence_number: number;       // Position in lesson (1, 2, 3...)
}

interface LessonPlan {
  lesson_title: string;
  reasoning: string;             // Overall lesson strategy
  estimated_time: number;
  cards: CardSelection[];
}
```

### Gemini Prompt Structure

```typescript
const prompt = `You are an expert English learning coach. Create a personalized 5-card mini-lesson.

## USER CONTEXT
**Level**: ${proficiency_level}
**Goal**: ${learning_goal}
**Why They Want This**: "${motivation_data.why}"
**Their Biggest Fear**: "${motivation_data.fear}"
**What's At Stake**: "${motivation_data.stakes}"
**Timeline**: ${motivation_data.timeline}

## RECENT PERFORMANCE
**Accuracy**: ${recent_performance.accuracy}%
**Weak Areas**: ${recent_performance.weak_areas.join(', ')}

## AVAILABLE CARD TYPES
${cardCatalog.map(card => `
- **${card.name}** (${card.id})
  - Objective: ${card.learningObjective}
  - Difficulty: ${card.difficulty.join(', ')}
  - Time: ~${card.timeEstimate} min
`).join('\n')}

## YOUR MISSION
Create a 5-card lesson sequence that:
1. **Addresses their fear directly** - If they fear speaking, include speaking practice
2. **Matches their stakes** - High stakes = more intensive practice
3. **Respects their timeline** - Urgent deadline = faster progression
4. **Strengthens weak areas** - Focus on ${weak_areas[0]} and ${weak_areas[1]}
5. **Fits time constraint** - Total time should be ~${time_available} minutes

## OUTPUT FORMAT (JSON)
{
  "lesson_title": "Speaking Confidence Builder",
  "reasoning": "User fears 'freezing up when speaking', so we start with recorded practice (no live pressure) and build confidence gradually.",
  "estimated_time": 15,
  "cards": [
    {
      "cardType": "single-vocab",
      "difficulty": "easy",
      "content": { ... },
      "reasoning": "Warm up with familiar vocabulary to build confidence",
      "sequence_number": 1
    },
    {
      "cardType": "speaking",
      "difficulty": "easy",
      "content": { ... },
      "reasoning": "Practice speaking in safe, recorded environment",
      "sequence_number": 2
    },
    ...
  ]
}
`;
```

### Card Registry System

Each card registers itself with metadata:

```typescript
// lib/registry/card-registry.ts

export const CARD_REGISTRY: Record<string, CardType> = {
  'single-vocab': {
    id: 'single-vocab',
    name: 'Vocabulary Card',
    learningObjective: 'Vocabulary acquisition and pronunciation',
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 1,
    requiresAudio: true,
    requiresInternet: false, // Works offline with expo-speech
  },
  'sentence-scramble': {
    id: 'sentence-scramble',
    name: 'Sentence Scramble',
    learningObjective: 'Grammar and word order',
    difficulty: ['easy', 'medium', 'hard'],
    timeEstimate: 2,
    requiresAudio: true,
    requiresInternet: false,
  },
  // ... all other cards
};

// Auto-generate catalog for Gemini
export function getCardCatalog(): CardType[] {
  return Object.values(CARD_REGISTRY);
}
```

---

## Lesson Composition Workflow

### 1. User Starts a Mini-Lesson

```typescript
// User taps on a "stair" in the homepage
// app/(tabs)/home.tsx

const handleStairTap = async (stairId: string) => {
  router.push(`/mini-lesson/${stairId}`);
};
```

### 2. Fetch User Context

```typescript
// app/mini-lesson/[id].tsx

const userContext = await getUserContext(userId);
// Returns: level, goals, motivation_data, recent_performance
```

### 3. Call Gemini Lesson Composer

```typescript
import { composeLessonWithGemini } from '@/lib/gemini/lesson-composer';

const lessonPlan = await composeLessonWithGemini({
  userContext,
  stairId,
  timeAvailable: 15, // user has 15 minutes
});

// Returns: LessonPlan with 5 cards selected by Gemini
```

### 4. Render Cards Sequentially

```typescript
// app/mini-lesson/[id].tsx

const [currentCardIndex, setCurrentCardIndex] = useState(0);
const currentCard = lessonPlan.cards[currentCardIndex];

// Dynamically render card component
const CardComponent = CARD_COMPONENTS[currentCard.cardType];

return (
  <CardComponent
    {...currentCard.content}
    difficulty={currentCard.difficulty}
    onComplete={handleCardComplete}
  />
);
```

### 5. Track Progress & Update Context

```typescript
const handleCardComplete = async (result: CardResult) => {
  // Save result
  await saveCardResult(userId, currentCard.id, result);

  // Update performance metrics
  await updateUserPerformance(userId, {
    accuracy: result.accuracy,
    weak_areas: result.struggledWith,
  });

  // Move to next card
  setCurrentCardIndex(prev => prev + 1);
};
```

---

## 3-Month Learning Plan Integration

**User provided a structured 3-month intensive plan**:

### Month 1: Foundation (Flashcards + Basic Games)
**Focus**: Grammar & core vocabulary

**Cards to Emphasize**:
- SingleVocabCard (500 words)
- SentenceScrambleCard
- FillInBlankCard
- DescribeImageCard

**Gemini Strategy**:
- Start with easy difficulty
- High repetition of vocab cards
- Gradual introduction of sentence-building

### Month 2: Confidence (Listening & Speaking)
**Focus**: Practical conversations

**Cards to Emphasize**:
- RolePlayCard (AI conversations)
- SpeakingCard (pronunciation)
- AudioToImageCard
- RealWorldAudioCard

**Gemini Strategy**:
- Medium difficulty
- More speaking/listening ratio
- Focus on conversational scenarios

### Month 3: Fluency (Creative & Spontaneous)
**Focus**: Complex speech, opinions, stories

**Cards to Emphasize**:
- StorytellingCard
- QuestionGameCard
- DescribeImageCard (advanced)
- RolePlayCard (complex scenarios)

**Gemini Strategy**:
- Hard difficulty
- Creative exercises
- Opinion formation
- Debate-style interactions

**Gemini's Role**: Automatically pace lessons based on:
- User's `timeline` from motivation_data
- Daily progress vs target
- Performance trends
- Adjust intensity if falling behind or advancing quickly

---

## Testing Strategy

### Unit Tests (Per Card)

```typescript
describe('SentenceScrambleCard', () => {
  it('should shuffle words correctly', () => {
    // Test word randomization
  });

  it('should validate correct sentence order', () => {
    // Test grammar validation
  });

  it('should accept multiple correct variations', () => {
    // Test flexible validation
  });

  it('should provide appropriate feedback', () => {
    // Test UI feedback
  });
});
```

### Integration Tests (Lesson Flow)

```typescript
describe('Mini-Lesson Flow', () => {
  it('should complete a 5-card lesson', async () => {
    // Test full lesson from start to finish
  });

  it('should track progress correctly', async () => {
    // Test XP, time, accuracy tracking
  });

  it('should save results to database', async () => {
    // Test persistence
  });
});
```

### Gemini Integration Tests

```typescript
describe('Gemini Lesson Composer', () => {
  it('should return valid lesson plan for beginner', async () => {
    const plan = await composeLessonWithGemini({ level: 'beginner', ... });
    expect(plan.cards).toHaveLength(5);
    expect(plan.cards[0].difficulty).toBe('easy');
  });

  it('should adapt to user fear of speaking', async () => {
    const plan = await composeLessonWithGemini({
      motivation_data: { fear: 'freezing up when speaking' }
    });
    // Should include speaking cards with easy difficulty
    const speakingCards = plan.cards.filter(c => c.cardType === 'speaking');
    expect(speakingCards.length).toBeGreaterThan(0);
    expect(speakingCards[0].difficulty).toBe('easy');
  });
});
```

---

## Community Features Roadmap

### Mentor Mode (Weeks 1-2 of Community Features)

**Concept**: Pair experienced users with learners

**Card Adaptations**:
- **RolePlayCard**: Support mentor mode
  - Mentor sees learner's response + correction suggestions
  - Learner sees mentor's guidance
- **CollaborativeStoryCard**: Turn-based with feedback
- Points for mentors (incentivize helping)

### Weekend Open Practice (Omegle-Style)

**Concept**: Random pairing for spontaneous practice

**Implementation**:
- Queue system (match by level)
- Use RolePlayCard in peer mode
- Use StorytellingCard for creative practice
- Gamified: earn points for participation, not accuracy

### Community Games

1. **Role-Play Challenge** (mentor-learner)
2. **Sentence Correction Ping-Pong** (grammar practice)
3. **Collaborative Storytelling** (creative fun)
4. **Taboo / Forbidden Word** (descriptive language)
5. **Two Truths and a Lie** (conversation starter)

---

## Implementation Timeline

### Phase 1: New Cards Development (Current - Week 1)
- [x] Assign card creation to Gemini (Task 0 in GEMINI_TASKS.md)
- [ ] Review & polish Gemini-created cards
- [ ] Add to card registry
- [ ] Write unit tests

### Phase 2: Card Registry System (Week 1-2)
- [ ] Create card-registry.ts
- [ ] Register all 12+ card types
- [ ] Add metadata (objectives, time estimates)

### Phase 3: Gemini Lesson Composer (Week 2-3)
- [ ] Create lesson-composer.ts
- [ ] Build Gemini prompt with card catalog
- [ ] Parse Gemini's JSON response
- [ ] Handle errors and fallbacks

### Phase 4: Mini-Lesson Flow (Week 3-4)
- [ ] Update /mini-lesson/[id].tsx
- [ ] Dynamic card rendering
- [ ] Progress tracking
- [ ] XP/star calculation
- [ ] Completion screen

### Phase 5: 3-Month Plan Integration (Week 4-5)
- [ ] Add month-based difficulty scaling
- [ ] Track user's position in plan
- [ ] Gemini adjusts pacing based on timeline
- [ ] Weekly progress reports

### Phase 6: Community Features (Week 6+)
- [ ] Mentor mode implementation
- [ ] Peer matching system
- [ ] Community card variations
- [ ] Leaderboards and badges

---

## Success Metrics

### Card Quality
- ✅ Each card has 3 difficulty levels
- ✅ Consistent design system
- ✅ Smooth animations (60fps)
- ✅ Haptic feedback on interactions
- ⚠️ Audio quality (pending Google TTS)

### Gemini Integration
- [ ] 90%+ of generated lessons are valid
- [ ] Lessons adapt to user fear/motivation
- [ ] Average lesson time within 10% of target
- [ ] User satisfaction > 4/5 stars

### Learning Outcomes
- [ ] Users complete 70%+ of started lessons
- [ ] 30-day retention > 60%
- [ ] Users practice weak areas 2x more after Gemini lessons
- [ ] Speaking fear decreases by 50% after Month 2

---

## Conclusion

The mini-games architecture provides a **flexible, AI-powered learning system** where:
1. Cards are modular, reusable learning exercises
2. Gemini AI acts as a personalized tutor, composing dynamic lessons
3. User motivation and progress drive lesson adaptation
4. Community features create a supportive practice environment

**Next Steps**:
1. Complete new card development (Gemini Task 0)
2. Build card registry and Gemini integration
3. Test with real users
4. Iterate based on learning outcomes

---

**Document Status**: Living document - update as new cards are added or Gemini integration evolves
**Last Updated**: November 26, 2025
**Contributors**: Claude, Gemini (card development), Angel (vision & requirements)
