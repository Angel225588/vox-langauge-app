/**
 * Voice System Test Page
 *
 * Comprehensive test for all voice conversation modes:
 * 1. Hybrid Mode - Whisper + Gemini Text + TTS (cheapest)
 * 2. Gemini Live - Real-time bidirectional audio (most expensive)
 * 3. Mock Mode - No API calls, for testing UI
 *
 * Features tested:
 * - Audio recording
 * - Speech-to-text (Whisper)
 * - AI conversation (Gemini)
 * - Text-to-speech (expo-speech)
 * - Push-to-talk interaction
 * - Cost comparison
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { useHybridConversation, type HybridConversationState } from '@/hooks/useHybridConversation';
import { isWhisperAvailable, getWhisperProviderInfo } from '@/lib/reading/speechToText';
import * as Speech from 'expo-speech';

type TestMode = 'hybrid' | 'mock';

interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error' | 'user' | 'ai';
  message: string;
}

export default function TestVoiceSystem() {
  const router = useRouter();
  const [mode, setMode] = useState<TestMode>('hybrid');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [textInput, setTextInput] = useState('');
  const [apiStatus, setApiStatus] = useState<{
    whisper: { available: boolean; provider: string };
    gemini: boolean;
    tts: boolean;
  } | null>(null);

  // Log helper
  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-50), { time, type, message }]);
  }, []);

  // Use the hybrid conversation hook
  const conversation = useHybridConversation({
    language: 'es',
    mockMode: mode === 'mock',
    autoInit: false,
    onUserTranscript: (text) => addLog('user', `You: ${text}`),
    onAiResponse: (text) => addLog('ai', `AI: ${text}`),
    onError: (err) => addLog('error', `Error: ${err.message}`),
    onStateChange: (state) => addLog('info', `State: ${state}`),
  });

  // Check API availability
  const checkApis = async () => {
    addLog('info', 'Checking API availability...');

    // Whisper
    const whisperAvail = await isWhisperAvailable();
    const whisperInfo = getWhisperProviderInfo();
    addLog(whisperAvail ? 'success' : 'error', `Whisper: ${whisperInfo.provider} (${whisperAvail ? 'available' : 'not configured'})`);

    // Gemini
    const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    const geminiAvail = !!geminiKey;
    addLog(geminiAvail ? 'success' : 'error', `Gemini: ${geminiAvail ? 'API key found' : 'not configured'}`);

    // TTS
    const voices = await Speech.getAvailableVoicesAsync();
    const ttsAvail = voices.length > 0;
    addLog(ttsAvail ? 'success' : 'error', `TTS: ${voices.length} voices available`);

    setApiStatus({
      whisper: { available: whisperAvail, provider: whisperInfo.provider },
      gemini: geminiAvail,
      tts: ttsAvail,
    });
  };

  // Initialize conversation
  const initConversation = async () => {
    addLog('info', `Initializing ${mode} mode...`);
    try {
      const status = await conversation.initialize();
      addLog('success', `Initialized! Mode: ${status.mode}`);
      addLog('info', `Whisper: ${status.whisperProvider}`);
      addLog('info', `Turn count: ${status.turnCount}`);
    } catch (err) {
      addLog('error', `Init failed: ${(err as Error).message}`);
    }
  };

  // Test TTS
  const testTts = async () => {
    addLog('info', 'Testing TTS...');
    try {
      await Speech.speak('Hola, esto es una prueba de síntesis de voz.', {
        language: 'es-ES',
        rate: 0.9,
        onDone: () => addLog('success', 'TTS completed'),
        onError: () => addLog('error', 'TTS failed'),
      });
    } catch (err) {
      addLog('error', `TTS error: ${(err as Error).message}`);
    }
  };

  // Handle push-to-talk
  const handlePttStart = async () => {
    if (conversation.state !== 'ready') {
      addLog('error', `Cannot record in state: ${conversation.state}`);
      return;
    }
    addLog('info', 'Recording started...');
    await conversation.startRecording();
  };

  const handlePttEnd = async () => {
    if (conversation.state !== 'recording') {
      return;
    }
    addLog('info', 'Recording stopped, processing...');
    const result = await conversation.stopRecording();
    if (result) {
      addLog('success', `Processed in ${result.processingTimeMs}ms`);
    }
  };

  // Send text
  const handleSendText = async () => {
    if (!textInput.trim()) return;
    const text = textInput.trim();
    setTextInput('');
    addLog('info', `Sending text: "${text}"`);
    const result = await conversation.sendText(text);
    if (result) {
      addLog('success', `Response in ${result.processingTimeMs}ms`);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    setApiStatus(null);
  };

  // Get state color
  const getStateColor = (state: HybridConversationState): string => {
    switch (state) {
      case 'ready': return '#10B981';
      case 'recording': return '#EF4444';
      case 'transcribing':
      case 'thinking': return '#F59E0B';
      case 'speaking': return '#3B82F6';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Voice System Test</Text>
          <Text style={styles.subtitle}>Test all conversation modes</Text>
        </View>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'hybrid' && styles.modeButtonActive]}
          onPress={() => setMode('hybrid')}
        >
          <Text style={[styles.modeButtonText, mode === 'hybrid' && styles.modeButtonTextActive]}>
            Hybrid (Cheap)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'mock' && styles.modeButtonActive]}
          onPress={() => setMode('mock')}
        >
          <Text style={[styles.modeButtonText, mode === 'mock' && styles.modeButtonTextActive]}>
            Mock (Free)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: getStateColor(conversation.state) }]} />
        <Text style={styles.statusText}>{conversation.state.toUpperCase()}</Text>
        <Text style={styles.modeLabel}>{conversation.mode}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={checkApis}>
          <Text style={styles.actionButtonText}>Check APIs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={initConversation}>
          <Text style={styles.actionButtonText}>Initialize</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={testTts}>
          <Text style={styles.actionButtonText}>Test TTS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.actionButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* API Status */}
      {apiStatus && (
        <Animated.View entering={FadeIn} style={styles.apiStatusCard}>
          <View style={styles.apiStatusRow}>
            <Text style={styles.apiStatusLabel}>Whisper:</Text>
            <Text style={[styles.apiStatusValue, { color: apiStatus.whisper.available ? '#10B981' : '#EF4444' }]}>
              {apiStatus.whisper.provider} {apiStatus.whisper.available ? '✓' : '✗'}
            </Text>
          </View>
          <View style={styles.apiStatusRow}>
            <Text style={styles.apiStatusLabel}>Gemini:</Text>
            <Text style={[styles.apiStatusValue, { color: apiStatus.gemini ? '#10B981' : '#EF4444' }]}>
              {apiStatus.gemini ? 'Ready ✓' : 'Not configured ✗'}
            </Text>
          </View>
          <View style={styles.apiStatusRow}>
            <Text style={styles.apiStatusLabel}>TTS:</Text>
            <Text style={[styles.apiStatusValue, { color: apiStatus.tts ? '#10B981' : '#EF4444' }]}>
              {apiStatus.tts ? 'Ready ✓' : 'Not available ✗'}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Messages */}
      {conversation.messages.length > 0 && (
        <View style={styles.messagesContainer}>
          <Text style={styles.sectionTitle}>Conversation</Text>
          {conversation.messages.map((msg, i) => (
            <Animated.View
              key={msg.id}
              entering={FadeInDown.duration(200)}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Text Input */}
      <View style={styles.textInputRow}>
        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={setTextInput}
          placeholder="Type to chat..."
          placeholderTextColor="#6B7280"
          onSubmitEditing={handleSendText}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !textInput.trim() && styles.sendButtonDisabled]}
          onPress={handleSendText}
          disabled={!textInput.trim() || conversation.state !== 'ready'}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Push-to-Talk Button */}
      <View style={styles.pttContainer}>
        <TouchableOpacity
          style={[
            styles.pttButton,
            conversation.isRecording && styles.pttButtonRecording,
            !conversation.canRecord && styles.pttButtonDisabled,
          ]}
          onPressIn={handlePttStart}
          onPressOut={handlePttEnd}
          disabled={!conversation.canRecord && !conversation.isRecording}
        >
          <Ionicons
            name={conversation.isRecording ? 'mic' : 'mic-outline'}
            size={32}
            color="#FFFFFF"
          />
          <Text style={styles.pttButtonText}>
            {conversation.isRecording ? 'Release to send' : 'Hold to speak'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logs */}
      <View style={styles.logsContainer}>
        <Text style={styles.sectionTitle}>Logs</Text>
        <ScrollView style={styles.logsScroll} contentContainerStyle={styles.logsContent}>
          {logs.length === 0 && (
            <Text style={styles.placeholder}>Press "Check APIs" to start...</Text>
          )}
          {logs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <Text style={styles.logTime}>{log.time}</Text>
              <Text style={[
                styles.logMessage,
                log.type === 'success' && styles.logSuccess,
                log.type === 'error' && styles.logError,
                log.type === 'user' && styles.logUser,
                log.type === 'ai' && styles.logAi,
              ]}>
                {log.message}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Cost Info */}
      <View style={styles.costInfo}>
        <Text style={styles.costTitle}>Cost Comparison (per 1000 conversations)</Text>
        <Text style={styles.costText}>
          • Hybrid: ~$0.50 (Whisper: $0.36 + Gemini: $0.10 + TTS: Free)
        </Text>
        <Text style={styles.costText}>
          • Gemini Live: ~$15.00 (Real-time audio streaming)
        </Text>
        <Text style={styles.costText}>
          • Mock: $0.00 (No API calls)
        </Text>
      </View>
    </SafeAreaView>
  );
}

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
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  modeSelector: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  modeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.card,
    gap: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: 'auto',
  },
  actionRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  clearButton: {
    backgroundColor: '#6B7280',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  apiStatusCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  apiStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  apiStatusLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  apiStatusValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  messagesContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    maxHeight: 150,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageBubble: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: colors.primary.DEFAULT,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: colors.background.card,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  messageText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
  },
  textInputRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sendButton: {
    backgroundColor: colors.primary.DEFAULT,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  pttContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  pttButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pttButtonRecording: {
    backgroundColor: '#EF4444',
  },
  pttButtonDisabled: {
    opacity: 0.5,
  },
  pttButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    margin: spacing.md,
    backgroundColor: '#1a1a2e',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  logsScroll: {
    flex: 1,
  },
  logsContent: {
    padding: spacing.sm,
  },
  placeholder: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  logEntry: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  logTime: {
    color: '#6B7280',
    fontSize: 10,
    fontFamily: 'monospace',
    marginRight: spacing.sm,
    minWidth: 60,
  },
  logMessage: {
    flex: 1,
    color: '#CCCCCC',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  logSuccess: {
    color: '#10B981',
  },
  logError: {
    color: '#EF4444',
  },
  logUser: {
    color: '#3B82F6',
  },
  logAi: {
    color: '#A78BFA',
  },
  costInfo: {
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  costTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  costText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
});
