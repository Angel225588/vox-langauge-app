# Audio Recording System - Usage Guide

Complete guide for using the audio recording system in the Vox language learning app's teleprompter feature.

## Table of Contents

- [Quick Start](#quick-start)
- [Using the Hook](#using-the-hook)
- [Using Core Functions](#using-core-functions)
- [Complete Examples](#complete-examples)
- [API Reference](#api-reference)

## Quick Start

### Using the React Hook (Recommended)

```tsx
import { useAudioRecording } from '@/lib/reading';

function RecordingScreen() {
  const {
    isRecording,
    isPaused,
    duration,
    recordingUri,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    playRecording,
    formatDuration,
  } = useAudioRecording();

  return (
    <View>
      <Text>{formatDuration(duration)}</Text>

      {!isRecording ? (
        <Button onPress={startRecording}>Start Recording</Button>
      ) : (
        <>
          <Button onPress={isPaused ? resumeRecording : pauseRecording}>
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button onPress={stopRecording}>Stop</Button>
        </>
      )}

      {recordingUri && (
        <Button onPress={playRecording}>Play Recording</Button>
      )}

      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

## Using the Hook

### Basic Recording Flow

```tsx
import { useAudioRecording } from '@/lib/reading';
import { Alert } from 'react-native';

function TeleprompterScreen() {
  const recording = useAudioRecording();

  const handleStartReading = async () => {
    await recording.startRecording();
  };

  const handleStopReading = async () => {
    const result = await recording.stopRecording();

    if (result) {
      console.log('Recording saved:', result.uri);
      console.log('Duration:', result.duration, 'ms');
      console.log('File size:', result.fileSize, 'bytes');

      // Upload for transcription, analysis, etc.
      await processRecording(result);
    }
  };

  // Handle errors
  useEffect(() => {
    if (recording.error) {
      Alert.alert('Recording Error', recording.error);
    }
  }, [recording.error]);

  return (
    <View>
      <Text>Duration: {recording.formatDuration(recording.duration)}</Text>

      <Button
        onPress={handleStartReading}
        disabled={recording.isRecording}
      >
        Start Reading
      </Button>

      {recording.isRecording && (
        <Button onPress={handleStopReading}>
          Stop Reading
        </Button>
      )}
    </View>
  );
}
```

### Permission Handling

```tsx
function PermissionGate({ children }) {
  const { hasPermission, requestPermission } = useAudioRecording();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone access is needed for recording'
        );
      }
    }
    setChecked(true);
  };

  if (!checked) return <Loading />;
  if (!hasPermission) return <PermissionDenied />;

  return children;
}
```

### Pause/Resume During Reading

```tsx
function TeleprompterControls() {
  const {
    isRecording,
    isPaused,
    duration,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useAudioRecording();

  if (!isRecording) return null;

  return (
    <View>
      <Text>{formatDuration(duration)}</Text>

      <Button onPress={isPaused ? resumeRecording : pauseRecording}>
        {isPaused ? '▶️ Resume' : '⏸️ Pause'}
      </Button>

      <Button onPress={stopRecording}>
        ⏹️ Stop
      </Button>
    </View>
  );
}
```

### Playback Functionality

```tsx
function PlaybackControls({ recordingUri }) {
  const { playRecording, stopPlayback, isPlaying } = useAudioRecording();

  return (
    <View>
      {recordingUri && (
        <Button onPress={isPlaying ? stopPlayback : playRecording}>
          {isPlaying ? '⏹️ Stop' : '▶️ Play'}
        </Button>
      )}
    </View>
  );
}
```

## Using Core Functions

### Direct Function Calls

For more control, you can use the core recording functions directly:

```tsx
import {
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  getRecordingStatus,
} from '@/lib/reading';

async function recordAudio() {
  // Start recording
  const recording = await startRecording();

  // Get status
  const status = await getRecordingStatus(recording);
  console.log('Duration:', status.durationMillis);

  // Pause
  await pauseRecording(recording);

  // Resume
  await resumeRecording(recording);

  // Stop and get result
  const result = await stopRecording(recording);
  return result;
}
```

### Permission Management

```tsx
import { requestAudioPermissions, checkAudioPermissions } from '@/lib/reading';

async function ensurePermission() {
  const hasPermission = await checkAudioPermissions();

  if (!hasPermission) {
    const granted = await requestAudioPermissions();
    return granted;
  }

  return true;
}
```

### File Management

```tsx
import {
  deleteRecording,
  getRecordingInfo,
  getRecordingBase64,
  moveRecording,
} from '@/lib/reading';

async function manageRecordingFile(uri: string) {
  // Get file info
  const info = await getRecordingInfo(uri);
  console.log('Size:', info.size, 'bytes');
  console.log('Exists:', info.exists);

  // Convert to base64 for API upload
  const base64 = await getRecordingBase64(uri);

  // Move to permanent location
  const permanentUri = `${FileSystem.documentDirectory}recordings/final.m4a`;
  await moveRecording(uri, permanentUri);

  // Delete when done
  await deleteRecording(permanentUri);
}
```

### Playback

```tsx
import { playRecording, stopPlayback, unloadSound } from '@/lib/reading';

async function playbackExample(uri: string) {
  // Play the recording
  const sound = await playRecording(uri);

  // Set up completion handler
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      console.log('Playback finished');
    }
  });

  // Stop playback
  await stopPlayback(sound);

  // Clean up
  await unloadSound(sound);
}
```

## Complete Examples

### Full Teleprompter Integration

```tsx
import { useAudioRecording } from '@/lib/reading';
import { useActiveSession } from '@/lib/reading';

function TeleprompterScreen({ passage }: { passage: string }) {
  const recording = useAudioRecording();
  const { activeSession, startSession, updateSession } = useActiveSession();

  const handleStartReading = async () => {
    // Create reading session
    const session = await startSession({
      userId: 'user_123',
      sourceType: 'ai_story',
      text: passage,
      difficulty: 'intermediate',
    });

    // Start recording
    await recording.startRecording();
  };

  const handleStopReading = async () => {
    // Stop recording
    const result = await recording.stopRecording();

    if (result && activeSession) {
      // Update session with recording
      await updateSession({
        recordingUri: result.uri,
        recordingDurationMs: result.duration,
      });

      // Process recording (transcribe, analyze, etc.)
      await processRecording(activeSession.id, result);
    }
  };

  return (
    <ScrollView>
      {/* Teleprompter text */}
      <Text style={styles.passage}>{passage}</Text>

      {/* Recording controls */}
      <View style={styles.controls}>
        <Text style={styles.timer}>
          {recording.formatDuration(recording.duration)}
        </Text>

        {!recording.isRecording ? (
          <Button onPress={handleStartReading}>
            Start Reading
          </Button>
        ) : (
          <>
            <Button onPress={recording.isPaused ? recording.resumeRecording : recording.pauseRecording}>
              {recording.isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button onPress={handleStopReading}>
              Finish Reading
            </Button>
          </>
        )}
      </View>

      {/* Playback */}
      {recording.recordingUri && !recording.isRecording && (
        <Button onPress={recording.playRecording}>
          {recording.isPlaying ? 'Stop Playback' : 'Listen to Recording'}
        </Button>
      )}

      {/* Error display */}
      {recording.error && (
        <Text style={styles.error}>{recording.error}</Text>
      )}
    </ScrollView>
  );
}
```

### Upload to Whisper API

```tsx
import { getRecordingBase64 } from '@/lib/reading';

async function transcribeRecording(recordingUri: string) {
  try {
    // Convert to base64
    const audioBase64 = await getRecordingBase64(recordingUri);

    // Upload to Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: audioBase64,
        model: 'whisper-1',
        language: 'es', // Spanish
      }),
    });

    const data = await response.json();
    return data.text; // Transcribed text
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
}
```

### Recording with Progress Indicator

```tsx
function RecordingWithProgress() {
  const recording = useAudioRecording();
  const [progress, setProgress] = useState(0);
  const maxDuration = 120000; // 2 minutes max

  useEffect(() => {
    if (recording.isRecording && !recording.isPaused) {
      setProgress((recording.duration / maxDuration) * 100);

      // Auto-stop at max duration
      if (recording.duration >= maxDuration) {
        recording.stopRecording();
      }
    }
  }, [recording.duration, recording.isRecording, recording.isPaused]);

  return (
    <View>
      {recording.isRecording && (
        <View>
          <ProgressBar progress={progress} />
          <Text>
            {recording.formatDuration(recording.duration)} /
            {recording.formatDuration(maxDuration)}
          </Text>
        </View>
      )}
    </View>
  );
}
```

## API Reference

### useAudioRecording Hook

#### State
- `isRecording: boolean` - Whether recording is active
- `isPaused: boolean` - Whether recording is paused
- `duration: number` - Current duration in milliseconds
- `recordingUri: string | null` - URI of completed recording
- `error: string | null` - Current error message
- `hasPermission: boolean` - Whether microphone permission is granted
- `isPlaying: boolean` - Whether playback is active

#### Methods
- `startRecording(): Promise<void>` - Start recording
- `pauseRecording(): Promise<void>` - Pause recording
- `resumeRecording(): Promise<void>` - Resume recording
- `stopRecording(): Promise<RecordingResult | null>` - Stop and get result
- `cancelRecording(): Promise<void>` - Cancel without saving
- `playRecording(): Promise<void>` - Play last recording
- `stopPlayback(): Promise<void>` - Stop playback
- `requestPermission(): Promise<boolean>` - Request permission
- `formatDuration(ms: number): string` - Format milliseconds to "M:SS"
- `reset(): void` - Reset all state

### Core Functions

#### Recording
- `startRecording(): Promise<Recording>`
- `pauseRecording(recording): Promise<void>`
- `resumeRecording(recording): Promise<void>`
- `stopRecording(recording): Promise<RecordingResult>`
- `getRecordingStatus(recording): Promise<RecordingStatus>`

#### Permissions
- `requestAudioPermissions(): Promise<boolean>`
- `checkAudioPermissions(): Promise<boolean>`

#### Playback
- `playRecording(uri): Promise<Sound>`
- `stopPlayback(sound): Promise<void>`
- `unloadSound(sound): Promise<void>`

#### File Management
- `deleteRecording(uri): Promise<void>`
- `getRecordingInfo(uri): Promise<RecordingFileInfo>`
- `getRecordingBase64(uri): Promise<string>`
- `moveRecording(sourceUri, destUri): Promise<void>`
- `copyRecording(sourceUri, destUri): Promise<void>`

#### Utilities
- `formatDuration(ms): string`
- `isValidRecordingUri(uri): Promise<boolean>`
- `getRecordingExtension(uri): string`
- `generateRecordingFilename(prefix?): string`

### Types

```typescript
interface RecordingResult {
  uri: string;
  duration: number;
  fileSize: number;
}

interface RecordingFileInfo {
  size: number;
  exists: boolean;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri: string | null;
}
```

## Best Practices

1. **Always check permissions before recording**
   ```tsx
   const { hasPermission, requestPermission } = useAudioRecording();

   if (!hasPermission) {
     await requestPermission();
   }
   ```

2. **Clean up resources**
   - The hook automatically cleans up on unmount
   - When using core functions, always unload sounds and stop recordings

3. **Handle errors gracefully**
   ```tsx
   useEffect(() => {
     if (recording.error) {
       Alert.alert('Error', recording.error);
     }
   }, [recording.error]);
   ```

4. **Use formatted duration for display**
   ```tsx
   <Text>{recording.formatDuration(recording.duration)}</Text>
   ```

5. **Move recordings to permanent storage**
   ```tsx
   const permanentUri = `${FileSystem.documentDirectory}recordings/${sessionId}.m4a`;
   await moveRecording(tempUri, permanentUri);
   ```

6. **Delete temporary recordings**
   ```tsx
   if (shouldDiscard) {
     await recording.cancelRecording();
   }
   ```

## Troubleshooting

### Permission Denied
- Check Info.plist (iOS) has microphone usage description
- Check AndroidManifest.xml has RECORD_AUDIO permission
- Request permission before starting recording

### Recording Not Working
- Ensure audio mode is set correctly
- Check device volume/mute switch
- Verify file system permissions

### Playback Issues
- Unload previous sounds before playing new ones
- Check audio interruptions (phone calls, etc.)
- Verify URI is valid and file exists

### Large File Sizes
- Recordings are compressed with AAC at 128kbps
- 1 minute ≈ 1MB file size
- Consider deleting old recordings regularly
