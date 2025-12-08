# Articulation Analysis Engine

## Overview

The Articulation Analysis Engine is the core intelligence of the Vox language learning app's reading system. It compares expected text with transcribed speech to provide detailed, encouraging feedback on speech clarity WITHOUT judging accents.

## Philosophy

**We analyze articulation (clarity), NOT accent.**

### What We DON'T Judge
- Regional accents
- Native language influence
- Intonation patterns
- Cultural speech variations

### What We DO Analyze
- Word completion (Did they finish saying each word?)
- Syllable clarity (Are syllables distinct?)
- Pauses and hesitations (Natural flow vs. struggling)
- Word boundaries (Clear separation between words)

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                  Articulation Engine                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Word Matching Algorithm                             │
│     ├─ Exact matching                                   │
│     ├─ Fuzzy matching (Levenshtein distance)            │
│     └─ Status detection (correct/skipped/etc.)          │
│                                                          │
│  2. Hesitation Detection                                │
│     ├─ Long pause detection                             │
│     ├─ Repeated word detection                          │
│     └─ Filler word detection (um, uh, etc.)             │
│                                                          │
│  3. Scoring Engines                                     │
│     ├─ Articulation Score (0-100)                       │
│     ├─ Fluency Score (0-100)                            │
│     └─ Overall Score (weighted combination)             │
│                                                          │
│  4. Problem Word Identification                         │
│     └─ Contextual, actionable suggestions               │
│                                                          │
│  5. Feedback Generation                                 │
│     └─ Encouraging, non-judgmental messaging            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Usage

### Basic Example

```typescript
import { analyzeArticulation, TranscriptionResult } from '@/lib/reading';

// Expected text (what user should read)
const expectedText = "The quick brown fox jumps over the lazy dog";

// Transcription from Whisper API
const transcription: TranscriptionResult = {
  text: "the quick brown fox jumps over the lazy dog",
  words: [
    { word: "the", start: 0.0, end: 0.2, confidence: 0.98 },
    { word: "quick", start: 0.2, end: 0.5, confidence: 0.95 },
    // ... more words
  ],
  segments: [...],
  language: "en",
  duration: 3.5
};

// Analyze articulation
const result = await analyzeArticulation({
  expectedText,
  transcription,
  audioDuration: 3500 // in milliseconds
});

console.log(result.overallScore); // 85
console.log(result.feedback.summary); // "Great progress! You read 95% of words clearly."
console.log(result.problemWords); // Array of words that need practice
```

### With React Hook

```typescript
import { useArticulationAnalysis } from '@/lib/reading';

function ReadingComponent() {
  const { analyze, isAnalyzing, result, error, reset } = useArticulationAnalysis();

  const handleAnalyze = async (text, transcription, duration) => {
    const analysisResult = await analyze(text, transcription, duration);

    if (analysisResult) {
      // Success! Show results
      console.log('Score:', analysisResult.overallScore);
      console.log('Feedback:', analysisResult.feedback);
    } else if (error) {
      // Handle error
      console.error('Analysis failed:', error);
    }
  };

  return (
    <View>
      {isAnalyzing && <ActivityIndicator />}
      {result && (
        <View>
          <Text>Overall Score: {result.overallScore}/100</Text>
          <Text>Articulation: {result.articulationScore}/100</Text>
          <Text>Fluency: {result.fluencyScore}/100</Text>
          <Text>{result.feedback.summary}</Text>
        </View>
      )}
    </View>
  );
}
```

## Scoring System

### Overall Score (0-100)

The overall score is a weighted combination:
- **60%** Articulation Score
- **40%** Fluency Score

### Articulation Score (0-100)

Measures clarity of speech:
- **40%** Correct words percentage
- **30%** Word completion (not skipping words)
- **30%** Word boundaries (clear separation)

### Fluency Score (0-100)

Measures smoothness of speech:
- **40%** Pace consistency
- **30%** Pause appropriateness
- **30%** Hesitation frequency

## Word Matching Algorithm

### Process

1. **Exact Matching**: First try exact matches (case-insensitive, punctuation-removed)
2. **Fuzzy Matching**: Use Levenshtein distance for close matches
3. **Skip Detection**: Identify words that were skipped
4. **Repeat Detection**: Catch repeated words
5. **Mispronunciation**: Significant deviations from expected

### Fuzzy Matching

We use Levenshtein distance with a threshold of 2 to handle:
- Contractions: "I'm" vs "I am"
- Common speech patterns
- Minor pronunciation differences (NOT errors)

Example:
```typescript
"hello" vs "helo" → Distance: 1 → MATCH ✓
"hello" vs "yellow" → Distance: 3 → NO MATCH ✗
```

## Hesitation Detection

### Types of Hesitations

1. **Long Pauses**
   - Detected when pause > 1.5x average pause duration
   - Minimum threshold: 500ms

2. **Repeated Words**
   - Same word spoken twice in a row
   - Example: "the the cat"

3. **Filler Words**
   - Common fillers: um, uh, er, ah, hmm, like, you know, so, well, actually
   - Language-agnostic set (expandable)

## Problem Words

Each problem word includes:

```typescript
interface ProblemWord {
  word: string;              // The problematic word
  issueType: IssueType;      // skipped | hesitated | mispronounced | repeated
  timestamp: number;         // When it occurred (ms)
  context: string;           // Surrounding sentence
  suggestion: string;        // How to improve
  addedToWordBank: boolean;  // Integration with Word Bank
}
```

### Example Problem Words

```typescript
[
  {
    word: "cathedral",
    issueType: "hesitated",
    timestamp: 2500,
    context: "We visited the beautiful cathedral in town",
    suggestion: "Build confidence with 'cathedral' by saying it several times clearly.",
    addedToWordBank: false
  },
  {
    word: "beautiful",
    issueType: "skipped",
    timestamp: 2100,
    context: "We visited the beautiful cathedral in town",
    suggestion: "Try practicing 'beautiful' slowly before reading the full passage.",
    addedToWordBank: false
  }
]
```

## Feedback Generation

### Components

1. **Summary**: Overall performance summary
2. **Strengths**: What they did well (always at least one!)
3. **Improvements**: Areas to focus on
4. **Encouragement**: Positive, motivating message
5. **Next Steps**: Specific, actionable suggestions

### Example Feedback

```typescript
{
  summary: "Great progress! You read 95% of words clearly.",
  strengths: [
    "Clear word pronunciation",
    "Smooth, natural flow",
    "High word completion rate"
  ],
  improvements: [
    "Try to maintain a steady, consistent pace"
  ],
  encouragement: "You're making great progress! Every practice session makes you stronger. Keep it up!",
  nextSteps: [
    "Practice these words: cathedral, beautiful",
    "Try reading the same passage multiple times to build fluency"
  ]
}
```

## Integration with Speech-to-Text

### Using Whisper API

```typescript
import { transcribeAudio, analyzeArticulation } from '@/lib/reading';

// 1. Record audio
const recordingUri = "file:///path/to/recording.m4a";

// 2. Transcribe with Whisper
const transcription = await transcribeAudio(recordingUri, {
  language: 'en',
  prompt: expectedText, // Hint for better accuracy
});

// 3. Analyze articulation
const analysis = await analyzeArticulation({
  expectedText,
  transcription,
  audioDuration: recordingDuration
});
```

### Mock Transcription (Testing)

```typescript
import { mockTranscribe } from '@/lib/reading';

// For testing without API key
const mockResult = await mockTranscribe(
  "Hello world, how are you?",
  2.5 // duration in seconds
);

// Mock includes realistic errors (10% chance per word)
// - Skipped words
// - Hesitations
// - Minor misspellings
```

## Helper Functions

### normalizeText(text: string)

Normalizes text for comparison:
- Lowercase
- Removes punctuation
- Trims whitespace

```typescript
normalizeText("Hello, World!") // "hello world"
```

### levenshteinDistance(a: string, b: string)

Calculates edit distance between strings:

```typescript
levenshteinDistance("kitten", "sitting") // 3
levenshteinDistance("hello", "helo") // 1
```

### getSentenceContext(text: string, wordIndex: number)

Gets the sentence containing a word:

```typescript
getSentenceContext("Hello world. How are you?", 2)
// "How are you?"
```

### generateSuggestion(word: string, issueType: string)

Generates improvement suggestion:

```typescript
generateSuggestion("cathedral", "hesitated")
// "Build confidence with 'cathedral' by saying it several times clearly."
```

## Performance Considerations

### Efficiency

- **O(n*m)** word matching complexity (n=expected words, m=transcribed words)
- Optimized fuzzy matching (early exits)
- Single-pass hesitation detection
- Minimal memory overhead

### Typical Processing Time

- **100 words**: ~50-100ms
- **500 words**: ~200-400ms
- **1000 words**: ~400-800ms

## Testing

### Unit Test Example

```typescript
import { analyzeArticulation, mockTranscribe } from '@/lib/reading';

describe('Articulation Analysis', () => {
  it('should analyze perfect reading', async () => {
    const expectedText = "Hello world";
    const transcription = {
      text: "hello world",
      words: [
        { word: "hello", start: 0, end: 0.5, confidence: 0.98 },
        { word: "world", start: 0.5, end: 1.0, confidence: 0.97 }
      ],
      segments: [],
      language: "en",
      duration: 1.0
    };

    const result = await analyzeArticulation({
      expectedText,
      transcription,
      audioDuration: 1000
    });

    expect(result.overallScore).toBeGreaterThan(90);
    expect(result.accuracy).toBe(100);
    expect(result.problemWords).toHaveLength(0);
  });

  it('should detect skipped words', async () => {
    const expectedText = "The quick brown fox";
    const transcription = {
      text: "the brown fox",
      words: [
        { word: "the", start: 0, end: 0.3, confidence: 0.98 },
        { word: "brown", start: 0.3, end: 0.7, confidence: 0.96 },
        { word: "fox", start: 0.7, end: 1.0, confidence: 0.97 }
      ],
      segments: [],
      language: "en",
      duration: 1.0
    };

    const result = await analyzeArticulation({
      expectedText,
      transcription,
      audioDuration: 1000
    });

    expect(result.problemWords).toHaveLength(1);
    expect(result.problemWords[0].word).toBe("quick");
    expect(result.problemWords[0].issueType).toBe("skipped");
  });
});
```

## Future Enhancements

### Planned Features

1. **Multi-language Support**
   - Language-specific filler words
   - Language-specific fuzzy matching rules

2. **Advanced Metrics**
   - Speaking rate (words per minute)
   - Pause distribution analysis
   - Stress pattern detection

3. **Personalized Feedback**
   - User history analysis
   - Progress tracking
   - Adaptive difficulty

4. **Enhanced Problem Detection**
   - Syllable-level analysis
   - Phoneme matching
   - Accent variation handling

## API Reference

### Main Function

```typescript
function analyzeArticulation(input: AnalysisInput): Promise<AnalysisResult>
```

#### Input

```typescript
interface AnalysisInput {
  expectedText: string;          // What they should read
  transcription: TranscriptionResult;  // Whisper result
  audioDuration: number;         // Duration in ms
}
```

#### Output

```typescript
interface AnalysisResult {
  articulationScore: number;     // 0-100
  fluencyScore: number;          // 0-100
  overallScore: number;          // 0-100
  analysis: ArticulationAnalysis;
  problemWords: ProblemWord[];
  feedback: ReadingFeedback;
  wordsExpected: number;
  wordsSpoken: number;
  accuracy: number;              // 0-100
}
```

## License

Part of the Vox Language Learning App.

## Contact

For questions or issues, please contact the Vox development team.
