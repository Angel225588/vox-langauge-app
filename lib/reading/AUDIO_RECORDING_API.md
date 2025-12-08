# Audio Recording System - Complete API Reference

Production-ready audio recording system for the Vox language learning app's teleprompter feature.

## 📁 Files Created

1. **`audioRecording.ts`** (17KB) - Core audio recording utilities
2. **`useAudioRecording.ts`** (14KB) - React hook for state management
3. **`index.ts`** (Updated) - Exports for the recording system

## ✨ Features

- ✅ Cross-platform support (iOS, Android, Web)
- ✅ Optimized for speech recognition (16kHz, mono, AAC)
- ✅ Pause/resume recording
- ✅ Real-time duration tracking
- ✅ Playback functionality
- ✅ File management (delete, move, copy, info)
- ✅ Base64 conversion for API uploads
- ✅ Comprehensive error handling
- ✅ Automatic resource cleanup
- ✅ Permission management
- ✅ Production-ready with JSDoc comments

## 🎯 Quick Start

### Option 1: React Hook (Recommended)

```tsx
import { useAudioRecording } from '@/lib/reading';

function MyComponent() {
  const {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    formatDuration,
  } = useAudioRecording();

  return (
    <View>
      <Text>{formatDuration(duration)}</Text>
      <Button onPress={startRecording}>Record</Button>
      {isRecording && <Button onPress={stopRecording}>Stop</Button>}
    </View>
  );
}
```

### Option 2: Core Functions

```tsx
import { startRecording, stopRecording } from '@/lib/reading';

async function record() {
  const recording = await startRecording();
  // ... later
  const result = await stopRecording(recording);
  console.log('Saved:', result.uri);
}
```

## 📚 Complete Hook API

### `useAudioRecording()`

Returns an object with the following properties and methods:

#### State Properties
```typescript
{
  isRecording: boolean;        // Recording in progress
  isPaused: boolean;           // Recording paused
  duration: number;            // Current duration (ms)
  recordingUri: string | null; // Last recording URI
  error: string | null;        // Current error message
  hasPermission: boolean;      // Mic permission granted
  isPlaying: boolean;          // Playback active
}
```

#### Control Methods
```typescript
{
  // Recording
  startRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordingResult | null>;
  cancelRecording: () => Promise<void>;

  // Playback
  playRecording: () => Promise<void>;
  stopPlayback: () => Promise<void>;

  // Permissions
  requestPermission: () => Promise<boolean>;

  // Utilities
  formatDuration: (ms: number) => string;
  reset: () => void;
}
```

## 📦 Core Functions API

### Permission Management

```typescript
// Request microphone permission
requestAudioPermissions(): Promise<boolean>

// Check if permission already granted
checkAudioPermissions(): Promise<boolean>
```

### Recording Operations

```typescript
// Start a new recording
startRecording(): Promise<Audio.Recording>

// Pause active recording
pauseRecording(recording: Audio.Recording): Promise<void>

// Resume paused recording
resumeRecording(recording: Audio.Recording): Promise<void>

// Stop and get result
stopRecording(recording: Audio.Recording): Promise<RecordingResult>

// Get current status
getRecordingStatus(recording: Audio.Recording): Promise<Audio.RecordingStatus>
```

### Playback Operations

```typescript
// Play a recording
playRecording(uri: string): Promise<Audio.Sound>

// Stop playback
stopPlayback(sound: Audio.Sound): Promise<void>

// Unload sound (cleanup)
unloadSound(sound: Audio.Sound): Promise<void>
```

### File Management

```typescript
// Delete recording file
deleteRecording(uri: string): Promise<void>

// Get file info (size, exists)
getRecordingInfo(uri: string): Promise<RecordingFileInfo>

// Convert to base64 for API upload
getRecordingBase64(uri: string): Promise<string>

// Move recording to new location
moveRecording(sourceUri: string, destUri: string): Promise<void>

// Copy recording
copyRecording(sourceUri: string, destUri: string): Promise<void>
```

### Utility Functions

```typescript
// Format duration to "M:SS"
formatDuration(durationMs: number): string

// Check if URI is valid
isValidRecordingUri(uri: string): Promise<boolean>

// Get file extension
getRecordingExtension(uri: string): string

// Generate unique filename
generateRecordingFilename(prefix?: string): string
```

## 📘 TypeScript Types

```typescript
interface RecordingResult {
  uri: string;        // File system URI
  duration: number;   // Total duration (ms)
  fileSize: number;   // File size (bytes)
}

interface RecordingFileInfo {
  size: number;    // File size (bytes)
  exists: boolean; // Whether file exists
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri: string | null;
}

interface UseAudioRecordingReturn {
  // See "Complete Hook API" above
}
```

## 🎨 Recording Configuration

Audio settings optimized for Whisper API:

```typescript
{
  sampleRate: 16000,      // Whisper optimal
  numberOfChannels: 1,    // Mono for speech
  bitRate: 128000,        // High quality
  extension: '.m4a',      // AAC compression
  audioEncoder: AAC,      // iOS/Android
}
```

## 💡 Usage Examples

### Basic Recording

```tsx
const { isRecording, startRecording, stopRecording } = useAudioRecording();

const handleRecord = async () => {
  await startRecording();
};

const handleStop = async () => {
  const result = await stopRecording();
  if (result) {
    console.log('URI:', result.uri);
    console.log('Duration:', result.duration);
    console.log('Size:', result.fileSize);
  }
};
```

### With Pause/Resume

```tsx
const { isPaused, pauseRecording, resumeRecording } = useAudioRecording();

<Button onPress={isPaused ? resumeRecording : pauseRecording}>
  {isPaused ? 'Resume' : 'Pause'}
</Button>
```

### With Playback

```tsx
const { recordingUri, playRecording, isPlaying } = useAudioRecording();

{recordingUri && (
  <Button onPress={playRecording}>
    {isPlaying ? 'Playing...' : 'Play Recording'}
  </Button>
)}
```

### Duration Display

```tsx
const { duration, formatDuration } = useAudioRecording();

<Text>{formatDuration(duration)}</Text>
// Output: "0:42", "2:15", etc.
```

### Error Handling

```tsx
const { error } = useAudioRecording();

useEffect(() => {
  if (error) {
    Alert.alert('Recording Error', error);
  }
}, [error]);
```

### Upload to API

```tsx
import { getRecordingBase64 } from '@/lib/reading';

const result = await stopRecording();
if (result) {
  const base64 = await getRecordingBase64(result.uri);

  await fetch('https://api.example.com/transcribe', {
    method: 'POST',
    body: JSON.stringify({ audio: base64 }),
  });
}
```

### Permanent Storage

```tsx
import { moveRecording, generateRecordingFilename } from '@/lib/reading';
import * as FileSystem from 'expo-file-system';

const result = await stopRecording();
if (result) {
  const filename = generateRecordingFilename('session');
  const permanentUri = `${FileSystem.documentDirectory}recordings/${filename}`;

  await moveRecording(result.uri, permanentUri);
}
```

## 🔧 Integration with Reading Session

```tsx
import { useAudioRecording } from '@/lib/reading';
import { useActiveSession } from '@/lib/reading';

function TeleprompterScreen({ passage }) {
  const recording = useAudioRecording();
  const { startSession, updateSession } = useActiveSession();

  const handleStart = async () => {
    // Create session
    await startSession({
      userId: 'user_123',
      sourceType: 'ai_story',
      text: passage,
      difficulty: 'intermediate',
    });

    // Start recording
    await recording.startRecording();
  };

  const handleStop = async () => {
    const result = await recording.stopRecording();

    if (result) {
      // Update session with recording
      await updateSession({
        recordingUri: result.uri,
        recordingDurationMs: result.duration,
      });
    }
  };

  return (
    <View>
      <Text>{passage}</Text>
      <Text>{recording.formatDuration(recording.duration)}</Text>

      {!recording.isRecording ? (
        <Button onPress={handleStart}>Start Reading</Button>
      ) : (
        <Button onPress={handleStop}>Stop Reading</Button>
      )}
    </View>
  );
}
```

## 🎯 Best Practices

1. **Use the hook for React components** - Handles all state management and cleanup
2. **Check permissions first** - Request before recording
3. **Handle errors** - Display user-friendly messages
4. **Clean up resources** - Hook does this automatically
5. **Move to permanent storage** - Recordings start in temp directory
6. **Delete unused recordings** - Free up space
7. **Use formatted duration** - Better UX with "M:SS" format

## 🚀 Production Ready

- ✅ Comprehensive error handling
- ✅ Resource cleanup (no memory leaks)
- ✅ Cross-platform tested
- ✅ TypeScript typed
- ✅ JSDoc comments
- ✅ Follows codebase patterns
- ✅ Permission management
- ✅ Optimized for Whisper API

## 📖 Additional Documentation

See `AUDIO_RECORDING_USAGE.md` for:
- Complete examples
- Troubleshooting guide
- Advanced patterns
- Integration examples
- Full API reference

## 🎓 Examples in Codebase

The audio recording system integrates with:
- `lib/reading/hooks.ts` - Reading session hooks
- `lib/reading/storage.ts` - Session storage
- `lib/reading/types.ts` - Type definitions

Import everything from the main reading module:

```tsx
import {
  // Hook
  useAudioRecording,

  // Core functions
  startRecording,
  stopRecording,
  playRecording,

  // Types
  RecordingResult,
  UseAudioRecordingReturn,
} from '@/lib/reading';
```
