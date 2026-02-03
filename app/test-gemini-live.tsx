/**
 * Gemini Live API Voice Test
 *
 * Full test for voice conversation with Gemini Live API.
 * Tests: WebSocket connection, audio recording, audio streaming, audio playback.
 */

// @ts-nocheck - Test file, expo-file-system types have issues
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { File, Paths } from 'expo-file-system';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';

// ============================================================================
// TYPES
// ============================================================================

type LogEntry = {
  time: string;
  type: 'info' | 'success' | 'error' | 'data' | 'audio';
  message: string;
};

type TestMode = 'text' | 'audio';

// Gemini Live voices
const GEMINI_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'] as const;
type GeminiVoice = typeof GEMINI_VOICES[number];

// ============================================================================
// AUDIO UTILITIES
// ============================================================================

/**
 * Convert audio file to base64 for Gemini
 * Using new expo-file-system API (SDK 54+)
 */
async function audioFileToBase64(uri: string): Promise<string> {
  const file = new File(uri);
  const base64 = await file.base64();
  return base64;
}

/**
 * Create WAV header for raw PCM data
 * Gemini returns audio/pcm at 24kHz, 16-bit, mono
 */
function createWavHeader(dataLength: number, sampleRate: number = 24000): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // "RIFF" chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true); // file size - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // sub-chunk size (16 for PCM)
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, 1, true); // num channels (1 = mono)
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * numChannels * bitsPerSample/8)
  view.setUint16(32, 2, true); // block align (numChannels * bitsPerSample/8)
  view.setUint16(34, 16, true); // bits per sample

  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // data size

  return new Uint8Array(header);
}

/**
 * Decode base64 audio and save to file for playback
 * Adds WAV header to raw PCM data from Gemini
 */
async function base64ToAudioFile(base64Data: string, filename: string): Promise<string> {
  // Paths.cache is a Directory, use it to construct the file path
  const file = new File(Paths.cache, filename);

  // Convert base64 to Uint8Array
  const binaryString = atob(base64Data);
  const pcmBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  // Create WAV header for the PCM data (24kHz sample rate from Gemini)
  const wavHeader = createWavHeader(pcmBytes.length, 24000);

  // Combine header and PCM data
  const wavFile = new Uint8Array(wavHeader.length + pcmBytes.length);
  wavFile.set(wavHeader, 0);
  wavFile.set(pcmBytes, wavHeader.length);

  // Create file if it doesn't exist
  if (!file.exists) {
    file.create();
  }

  // Write WAV file
  file.write(wavFile);
  return file.uri;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestGeminiLive() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [textInput, setTextInput] = useState('Hola, ¿cómo estás?');
  const [testMode, setTestMode] = useState<TestMode>('text');
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoice>('Kore');

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const audioChunksRef = useRef<string[]>([]);

  // ============================================================================
  // LOGGING
  // ============================================================================

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLogs(prev => [...prev, { time, type, message }]);
    // Auto-scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  // ============================================================================
  // AUDIO PERMISSIONS
  // ============================================================================

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setAudioPermission(status === 'granted');
        if (status !== 'granted') {
          addLog('error', 'Microphone permission denied');
        } else {
          addLog('success', '✅ Microphone permission granted');
        }

        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (err) {
        addLog('error', `Permission error: ${err}`);
      }
    };

    checkPermissions();

    return () => {
      // Cleanup
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [addLog]);

  // ============================================================================
  // API KEY
  // ============================================================================

  const getApiKey = (): string | undefined => {
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  };

  // ============================================================================
  // WEBSOCKET CONNECTION
  // ============================================================================

  const connect = async () => {
    const apiKey = getApiKey();

    if (!apiKey) {
      addLog('error', '❌ No API key found! Set EXPO_PUBLIC_GEMINI_API_KEY in .env');
      return;
    }

    addLog('info', `API Key: ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`);
    setIsConnecting(true);
    audioChunksRef.current = [];

    try {
      // WebSocket URL for Gemini Live API
      // Using v1alpha for gemini-2.0-flash-exp (live model)
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

      addLog('info', 'Creating WebSocket connection...');

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog('success', '✅ WebSocket CONNECTED');
        setIsConnected(true);
        setIsConnecting(false);

        // Send setup message based on mode
        const setupMessage = {
          setup: {
            model: 'models/gemini-2.0-flash-exp',
            generationConfig: {
              responseModalities: testMode === 'audio' ? ['AUDIO'] : ['TEXT'],
              ...(testMode === 'audio' && {
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: selectedVoice,
                    },
                  },
                },
              }),
            },
            systemInstruction: {
              parts: [{
                text: `You are a friendly Spanish language tutor named ${selectedVoice}.
                       Keep responses short (1-2 sentences).
                       Help the user practice speaking Spanish.
                       Be encouraging and patient.
                       If the user speaks in Spanish, respond in Spanish.
                       If they seem stuck, offer gentle hints.`
              }],
            },
          },
        };

        addLog('info', `📤 Setup (mode: ${testMode}, voice: ${selectedVoice})`);
        addLog('data', JSON.stringify(setupMessage, null, 2).substring(0, 300) + '...');
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        try {
          let data;

          // Handle binary (ArrayBuffer) or text data
          if (event.data instanceof ArrayBuffer) {
            // Decode ArrayBuffer to string
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(event.data);
            data = JSON.parse(text);
            addLog('data', `📩 Binary decoded: ${text.substring(0, 100)}...`);
          } else if (event.data instanceof Blob) {
            // Handle Blob data
            const text = await event.data.text();
            data = JSON.parse(text);
            addLog('data', `📩 Blob decoded: ${text.substring(0, 100)}...`);
          } else {
            // Already a string
            data = JSON.parse(event.data);
          }

          // Check for setup complete
          if (data.setupComplete) {
            addLog('success', '✅ Setup complete! Ready for conversation.');
            return;
          }

          // Check for server content (AI response)
          if (data.serverContent) {
            const { modelTurn, turnComplete } = data.serverContent;

            if (modelTurn?.parts) {
              for (const part of modelTurn.parts) {
                // Text response
                if (part.text) {
                  addLog('success', `🤖 AI: ${part.text}`);
                }

                // Audio response
                if (part.inlineData?.mimeType?.startsWith('audio/')) {
                  const audioData = part.inlineData.data;
                  const mimeType = part.inlineData.mimeType;
                  addLog('audio', `🔊 Audio chunk received: ${audioData.length} chars (${mimeType})`);
                  audioChunksRef.current.push(audioData);
                }
              }
            }

            if (turnComplete) {
              addLog('info', '✅ Turn complete');

              // If we received audio, try to play it
              if (audioChunksRef.current.length > 0) {
                addLog('info', `📻 Playing ${audioChunksRef.current.length} audio chunk(s)...`);
                await playAudioResponse();
              }
            }
          }

          // Check for errors
          if (data.error) {
            addLog('error', `❌ API Error: ${JSON.stringify(data.error)}`);
          }

        } catch (e) {
          // Log the raw data type for debugging
          const dataType = event.data?.constructor?.name || typeof event.data;
          addLog('data', `📩 Parse error (${dataType}): ${e}`);
        }
      };

      ws.onerror = (event) => {
        addLog('error', `❌ WebSocket error`);
        console.error('WebSocket error:', event);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        // Close codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
        const closeReasons: Record<number, string> = {
          1000: 'Normal closure',
          1001: 'Going away',
          1002: 'Protocol error',
          1003: 'Unsupported data',
          1006: 'Abnormal closure',
          1007: 'Invalid data',
          1008: 'Policy violation',
          1009: 'Message too big',
          1011: 'Server error',
        };
        const reasonText = closeReasons[event.code] || 'Unknown';
        addLog('info', `🔌 WebSocket closed - Code: ${event.code} (${reasonText})`);
        if (event.reason) {
          addLog('error', `   Server reason: ${event.reason}`);
        }
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;
      };

    } catch (error) {
      addLog('error', `❌ Connection error: ${error}`);
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      addLog('info', 'Closing WebSocket...');
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  // ============================================================================
  // SEND MESSAGES
  // ============================================================================

  const sendTextMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog('error', 'WebSocket not connected');
      return;
    }

    audioChunksRef.current = [];

    const message = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text: textInput }],
        }],
        turnComplete: true,
      },
    };

    addLog('info', `📤 You: "${textInput}"`);
    wsRef.current.send(JSON.stringify(message));
  };

  // ============================================================================
  // AUDIO RECORDING
  // ============================================================================

  const startRecording = async () => {
    if (!audioPermission) {
      Alert.alert('Permission Required', 'Microphone permission is needed for voice recording.');
      return;
    }

    try {
      addLog('info', '🎙️ Starting recording...');

      // Create recording with settings optimized for Gemini
      // Gemini expects: PCM 16-bit, 16kHz or 24kHz, mono
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 256000,
        },
      });

      recordingRef.current = recording;
      setIsRecording(true);
      addLog('success', '🎙️ Recording started');

    } catch (err) {
      addLog('error', `❌ Recording error: ${err}`);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) {
      return;
    }

    try {
      addLog('info', '⏹️ Stopping recording...');
      await recordingRef.current.stopAndUnloadAsync();

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (!uri) {
        addLog('error', 'No recording URI');
        return;
      }

      addLog('success', `✅ Recording saved: ${uri.split('/').pop()}`);

      // Send to Gemini
      await sendAudioToGemini(uri);

    } catch (err) {
      addLog('error', `❌ Stop recording error: ${err}`);
      setIsRecording(false);
    }
  };

  const sendAudioToGemini = async (uri: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog('error', 'WebSocket not connected');
      return;
    }

    try {
      addLog('info', '📤 Converting audio to base64...');
      const base64Audio = await audioFileToBase64(uri);
      addLog('info', `📤 Audio size: ${base64Audio.length} chars`);

      // WAV files have a 44-byte header that we need to skip for raw PCM
      // The base64 of 44 bytes is ~60 chars, but let's be safe and skip more
      // Actually, let's try sending as audio/wav first since that's what we recorded
      const audioData = base64Audio;

      audioChunksRef.current = [];

      // Try sending as clientContent with audio (like text but with audio)
      // This format might work better than realtimeInput
      const audioMessage = {
        clientContent: {
          turns: [{
            role: 'user',
            parts: [{
              inlineData: {
                mimeType: 'audio/wav',
                data: audioData,
              }
            }],
          }],
          turnComplete: true,
        },
      };

      addLog('info', '📤 Sending audio to Gemini (clientContent format)...');
      addLog('data', `Format: audio/wav, turnComplete: true`);
      wsRef.current.send(JSON.stringify(audioMessage));
      addLog('success', '✅ Audio sent!');

    } catch (err) {
      addLog('error', `❌ Send audio error: ${err}`);
    }
  };

  // ============================================================================
  // AUDIO PLAYBACK
  // ============================================================================

  const playAudioResponse = async () => {
    if (audioChunksRef.current.length === 0) {
      addLog('info', 'No audio to play');
      return;
    }

    try {
      setIsPlaying(true);

      // Combine all audio chunks
      const combinedAudio = audioChunksRef.current.join('');
      addLog('info', `📊 Total audio data: ${combinedAudio.length} chars from ${audioChunksRef.current.length} chunks`);

      // Save to WAV file (base64ToAudioFile adds WAV header)
      const filename = `gemini_response_${Date.now()}.wav`;
      const fileUri = await base64ToAudioFile(combinedAudio, filename);
      addLog('info', `📁 Audio file saved: ${filename}`);

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          addLog('success', '🔊 Playback finished!');
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });

      addLog('success', '🔊 Playing AI voice response...');

      // Clear chunks for next response
      audioChunksRef.current = [];

    } catch (err) {
      addLog('error', `❌ Playback error: ${err}`);
      setIsPlaying(false);
    }
  };

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleMode = () => {
    if (isConnected) {
      addLog('info', 'Disconnect first to change mode');
      return;
    }
    setTestMode(prev => prev === 'text' ? 'audio' : 'text');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gemini Live Test</Text>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
        <Text style={styles.statusText}>
          {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, testMode === 'text' && styles.modeActive]}
            onPress={() => !isConnected && setTestMode('text')}
            disabled={isConnected}
          >
            <Text style={[styles.modeText, testMode === 'text' && styles.modeTextActive]}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, testMode === 'audio' && styles.modeActive]}
            onPress={() => !isConnected && setTestMode('audio')}
            disabled={isConnected}
          >
            <Text style={[styles.modeText, testMode === 'audio' && styles.modeTextActive]}>Audio</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Selector (when audio mode) */}
      {testMode === 'audio' && !isConnected && (
        <View style={styles.voiceSelector}>
          <Text style={styles.voiceLabel}>Voice:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {GEMINI_VOICES.map((voice) => (
              <TouchableOpacity
                key={voice}
                style={[styles.voiceChip, selectedVoice === voice && styles.voiceChipActive]}
                onPress={() => setSelectedVoice(voice)}
              >
                <Text style={[styles.voiceChipText, selectedVoice === voice && styles.voiceChipTextActive]}>
                  {voice}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Connection Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isConnected && styles.buttonDisabled]}
          onPress={connect}
          disabled={isConnected || isConnecting}
        >
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonRed, !isConnected && styles.buttonDisabled]}
          onPress={disconnect}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonGray]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Text Input (text mode) */}
      {isConnected && testMode === 'text' && (
        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.tertiary}
          />
          <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={sendTextMessage}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Audio Controls (audio mode) */}
      {isConnected && testMode === 'audio' && (
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              !audioPermission && styles.buttonDisabled,
            ]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={!audioPermission}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? '🎙️ Recording...' : '🎤 Hold to Speak'}
            </Text>
          </TouchableOpacity>

          {isPlaying && (
            <Text style={styles.playingText}>🔊 Playing response...</Text>
          )}
        </View>
      )}

      {/* Logs */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.logsContainer}
        contentContainerStyle={styles.logsContent}
      >
        {logs.length === 0 && (
          <Text style={styles.placeholder}>
            Logs will appear here...{'\n\n'}
            1. Select mode (Text or Audio){'\n'}
            2. Select voice (for Audio mode){'\n'}
            3. Click Connect{'\n'}
            4. Send messages or record audio
          </Text>
        )}
        {logs.map((log, index) => (
          <View key={index} style={styles.logEntry}>
            <Text style={styles.logTime}>{log.time}</Text>
            <Text style={[
              styles.logMessage,
              log.type === 'success' && styles.logSuccess,
              log.type === 'error' && styles.logError,
              log.type === 'data' && styles.logData,
              log.type === 'audio' && styles.logAudio,
            ]}>
              {log.message}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    marginRight: spacing.md,
  },
  backText: {
    color: colors.primary.DEFAULT,
    fontSize: typography.fontSize.base,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  connected: {
    backgroundColor: colors.success.DEFAULT,
  },
  disconnected: {
    backgroundColor: colors.error.DEFAULT,
  },
  statusText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    flex: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: 2,
  },
  modeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  modeActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  modeText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  modeTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  voiceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.sm,
  },
  voiceLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  voiceChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  voiceChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  voiceChipText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  voiceChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonRed: {
    backgroundColor: colors.error.DEFAULT,
  },
  buttonGray: {
    backgroundColor: colors.text.tertiary,
  },
  buttonGreen: {
    backgroundColor: colors.success.DEFAULT,
    flex: 0,
    paddingHorizontal: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: typography.fontSize.sm,
  },
  inputSection: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.sm,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  audioControls: {
    padding: spacing.md,
    paddingTop: 0,
    alignItems: 'center',
  },
  recordButton: {
    width: '100%',
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: colors.error.DEFAULT,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: typography.fontSize.lg,
  },
  playingText: {
    color: colors.success.DEFAULT,
    marginTop: spacing.sm,
    fontSize: typography.fontSize.base,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  logsContent: {
    padding: spacing.md,
  },
  placeholder: {
    color: colors.text.tertiary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  logEntry: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  logTime: {
    color: '#484f58',
    fontSize: 11,
    fontFamily: 'monospace',
    marginRight: spacing.sm,
    minWidth: 60,
  },
  logMessage: {
    flex: 1,
    color: '#c9d1d9',
    fontSize: 12,
    fontFamily: 'monospace',
    flexWrap: 'wrap',
  },
  logSuccess: {
    color: colors.success.DEFAULT,
  },
  logError: {
    color: colors.error.DEFAULT,
  },
  logData: {
    color: '#58a6ff',
  },
  logAudio: {
    color: '#f778ba',
  },
});
