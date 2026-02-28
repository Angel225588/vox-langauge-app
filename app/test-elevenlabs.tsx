/**
 * ElevenLabs Integration Test Screen
 *
 * Test screen to verify ElevenLabs Conversational AI integration.
 * Navigate to: /test-elevenlabs
 *
 * Features:
 * - Voice selector to test each configured voice
 * - Toggle voice override on/off
 * - Real-time connection status
 * - Conversation transcript
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { useElevenLabsConversation } from '@/hooks/useElevenLabsConversation';
import {
  getElevenLabsApiKey,
  getElevenLabsAgentId,
  ELEVENLABS_VOICES,
  isVoiceConfigured,
  SLOW_SPEECH_SPEEDS,
  type SlowSpeechSpeed,
} from '@/lib/voice/elevenLabsConfig';
import type { ElevenLabsVoiceConfig } from '@/lib/voice/elevenLabsTypes';

export default function TestElevenLabsScreen() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<{
    apiKey: boolean;
    agentId: boolean;
    voicesConfigured: number;
  } | null>(null);

  // Voice selection state
  const [selectedVoice, setSelectedVoice] = useState<ElevenLabsVoiceConfig | null>(null);
  const [enableVoiceOverride, setEnableVoiceOverride] = useState(false);
  const [slowSpeechMode, setSlowSpeechMode] = useState<SlowSpeechSpeed>('normal');
  const [testLog, setTestLog] = useState<string[]>([]);

  // Add to test log
  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  // Test configuration on mount
  useEffect(() => {
    const apiKey = getElevenLabsApiKey();
    const agentId = getElevenLabsAgentId();
    const configuredVoices = ELEVENLABS_VOICES.filter(isVoiceConfigured).length;

    setTestResults({
      apiKey: !!apiKey && apiKey.length > 10,
      agentId: !!agentId && agentId.length > 5,
      voicesConfigured: configuredVoices,
    });

    // Default to first configured voice
    const firstConfigured = ELEVENLABS_VOICES.find(isVoiceConfigured);
    if (firstConfigured) {
      setSelectedVoice(firstConfigured);
    }

    log('Test screen initialized');
  }, []);

  // Use the ElevenLabs conversation hook
  // When voice override is enabled, we also enable prompt and language overrides
  // This allows the system to:
  // 1. Use the correct voice (TTS override)
  // 2. Use the correct language in the prompt (prompt override)
  // 3. Set the agent language for STT (language override)
  const {
    status,
    isConnected,
    isConnecting,
    isSpeaking,
    messages,
    sessionDuration,
    turnCount,
    error,
    startSession,
    endSession,
    resetError,
  } = useElevenLabsConversation({
    voice: enableVoiceOverride ? selectedVoice ?? undefined : undefined,
    scenario: 'casual_chat',
    userProficiency: 'intermediate',
    slowSpeechMode: enableVoiceOverride ? slowSpeechMode : 'normal',
    disableOverrides: !enableVoiceOverride,
    overrideOptions: {
      // Enable prompt override to use our system prompt with language instructions
      enablePrompt: enableVoiceOverride,
      // Enable first message to start in the correct language
      enableFirstMessage: enableVoiceOverride,
      // Enable language override for speech-to-text language
      enableLanguage: enableVoiceOverride,
      // Enable voice override for text-to-speech voice
      enableVoice: enableVoiceOverride,
    },
    onSessionEnd: (session) => {
      log(`Session ended: ${session.duration}s, ${session.turnCount} turns`);
    },
    onError: (err) => {
      log(`ERROR: ${err.message}`);
    },
  });

  const handleStartTest = async () => {
    try {
      resetError();
      if (enableVoiceOverride && selectedVoice) {
        const langName = selectedVoice.language === 'en' ? 'English' :
                         selectedVoice.language === 'es' ? 'Spanish' :
                         selectedVoice.language === 'fr' ? 'French' : selectedVoice.language;
        log(`Starting with FULL overrides:`);
        log(`  Voice: ${selectedVoice.name} (${selectedVoice.elevenLabsVoiceId})`);
        log(`  Language: ${langName} (prompt + STT + first message)`);
        if (slowSpeechMode !== 'normal') {
          log(`  Speed: ${slowSpeechMode} (${SLOW_SPEECH_SPEEDS[slowSpeechMode]}x)`);
        }
      } else {
        log('Starting with agent default settings (no override)');
      }
      await startSession();
      log('Session started successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log(`Failed to start: ${message}`);
    }
  };

  const handleEndTest = async () => {
    log('Ending session...');
    await endSession();
  };

  // Group voices by language
  const voicesByLanguage = ELEVENLABS_VOICES.filter(isVoiceConfigured).reduce((acc, voice) => {
    const lang = voice.language;
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, ElevenLabsVoiceConfig[]>);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ElevenLabs Test</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Configuration Status */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration Status</Text>

          {testResults ? (
            <View style={styles.statusGrid}>
              <StatusItem
                label="API Key"
                status={testResults.apiKey}
                detail={testResults.apiKey ? 'Configured' : 'Missing'}
              />
              <StatusItem
                label="Agent ID"
                status={testResults.agentId}
                detail={testResults.agentId ? 'Configured' : 'Missing'}
              />
              <StatusItem
                label="Voices"
                status={testResults.voicesConfigured > 0}
                detail={`${testResults.voicesConfigured}/${ELEVENLABS_VOICES.length} configured`}
              />
            </View>
          ) : (
            <ActivityIndicator color={colors.primary.DEFAULT} />
          )}
        </Animated.View>

        {/* Voice Selection */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Override Test</Text>

          {/* Toggle Voice Override */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Enable Voice Override</Text>
              <Text style={styles.toggleHint}>
                Must be enabled in ElevenLabs dashboard Security tab
              </Text>
            </View>
            <Switch
              value={enableVoiceOverride}
              onValueChange={(value) => {
                setEnableVoiceOverride(value);
                log(value ? 'Voice override ENABLED' : 'Voice override DISABLED');
              }}
              trackColor={{ false: colors.background.elevated, true: colors.primary.DEFAULT + '50' }}
              thumbColor={enableVoiceOverride ? colors.primary.DEFAULT : colors.text.tertiary}
            />
          </View>

          {/* Voice Selector */}
          {enableVoiceOverride && (
            <View style={styles.voiceSelector}>
              <Text style={styles.voiceSelectorLabel}>Select Voice to Test:</Text>
              {Object.entries(voicesByLanguage).map(([lang, voices]) => (
                <View key={lang} style={styles.languageGroup}>
                  <Text style={styles.languageLabel}>
                    {lang === 'en' ? '🇺🇸 English' : lang === 'es' ? '🇲🇽 Spanish' : '🇫🇷 French'}
                  </Text>
                  <View style={styles.voiceGrid}>
                    {voices.map((voice) => (
                      <TouchableOpacity
                        key={voice.id}
                        style={[
                          styles.voiceChip,
                          selectedVoice?.id === voice.id && styles.voiceChipSelected,
                        ]}
                        onPress={() => {
                          setSelectedVoice(voice);
                          log(`Selected: ${voice.name} (${voice.id})`);
                        }}
                      >
                        <Text style={styles.voiceChipFlag}>{voice.flag}</Text>
                        <View style={styles.voiceChipInfo}>
                          <Text style={[
                            styles.voiceChipName,
                            selectedVoice?.id === voice.id && styles.voiceChipNameSelected,
                          ]}>
                            {voice.name}
                          </Text>
                          <Text style={styles.voiceChipId}>
                            {voice.elevenLabsVoiceId.substring(0, 8)}...
                          </Text>
                        </View>
                        {selectedVoice?.id === voice.id && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary.DEFAULT} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Slow Speech Mode Selector */}
          {enableVoiceOverride && (
            <View style={styles.slowSpeechSelector}>
              <Text style={styles.voiceSelectorLabel}>Speech Speed:</Text>
              <View style={styles.speedButtonRow}>
                {(Object.keys(SLOW_SPEECH_SPEEDS) as SlowSpeechSpeed[]).map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.speedButton,
                      slowSpeechMode === speed && styles.speedButtonSelected,
                    ]}
                    onPress={() => {
                      setSlowSpeechMode(speed);
                      log(`Speed: ${speed} (${SLOW_SPEECH_SPEEDS[speed]}x)`);
                    }}
                  >
                    <Text style={[
                      styles.speedButtonText,
                      slowSpeechMode === speed && styles.speedButtonTextSelected,
                    ]}>
                      {speed === 'verySlow' ? '0.5x' :
                       speed === 'slow' ? '0.65x' :
                       speed === 'moderate' ? '0.8x' : '1.0x'}
                    </Text>
                    <Text style={styles.speedButtonLabel}>
                      {speed === 'verySlow' ? 'Very Slow' :
                       speed === 'slow' ? 'Slow' :
                       speed === 'moderate' ? 'Moderate' : 'Normal'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Current Selection */}
          {enableVoiceOverride && selectedVoice && (
            <View style={styles.currentSelection}>
              <Text style={styles.currentSelectionLabel}>Will use:</Text>
              <Text style={styles.currentSelectionValue}>
                {selectedVoice.flag} {selectedVoice.name} - {selectedVoice.description}
              </Text>
              <Text style={styles.currentSelectionId}>
                ID: {selectedVoice.elevenLabsVoiceId}
                {slowSpeechMode !== 'normal' && ` | Speed: ${SLOW_SPEECH_SPEEDS[slowSpeechMode]}x`}
              </Text>
            </View>
          )}

          {!enableVoiceOverride && (
            <View style={styles.disabledNote}>
              <Ionicons name="information-circle" size={20} color={colors.text.tertiary} />
              <Text style={styles.disabledNoteText}>
                Voice override disabled. Will use agent's default voice.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Connection Test */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Test</Text>

          <View style={styles.connectionStatus}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={[styles.statusBadge, getStatusStyle(status)]}>
                <Text style={styles.statusBadgeText}>{status}</Text>
              </View>
            </View>

            {isConnected && (
              <>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Duration:</Text>
                  <Text style={styles.statusValue}>{formatDuration(sessionDuration)}</Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Turns:</Text>
                  <Text style={styles.statusValue}>{turnCount}</Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>AI Speaking:</Text>
                  <Text style={styles.statusValue}>{isSpeaking ? 'Yes' : 'No'}</Text>
                </View>
              </>
            )}
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="warning" size={20} color={colors.error.DEFAULT} />
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {!isConnected ? (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleStartTest}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="play" size={20} color="white" />
                    <Text style={styles.buttonText}>Start Test Call</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleEndTest}
              >
                <Ionicons name="stop" size={20} color="white" />
                <Text style={styles.buttonText}>End Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Messages */}
        {messages.length > 0 && (
          <Animated.View entering={FadeIn} style={styles.section}>
            <Text style={styles.sectionTitle}>Conversation ({messages.length})</Text>
            <View style={styles.messagesContainer}>
              {messages.map((msg, index) => (
                <View
                  key={msg.id || index}
                  style={[
                    styles.messageItem,
                    msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
                  ]}
                >
                  <Text style={styles.messageRole}>
                    {msg.role === 'user' ? 'You' : 'AI Tutor'}
                  </Text>
                  <Text style={styles.messageContent}>{msg.content}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Test Log */}
        <Animated.View entering={FadeInDown.delay(280)} style={styles.section}>
          <View style={styles.logHeader}>
            <Text style={styles.sectionTitle}>Test Log</Text>
            <TouchableOpacity onPress={() => setTestLog([])}>
              <Text style={styles.clearLog}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logContainer}>
            {testLog.length === 0 ? (
              <Text style={styles.logEmpty}>No logs yet</Text>
            ) : (
              testLog.map((entry, index) => (
                <Text key={index} style={styles.logEntry}>{entry}</Text>
              ))
            )}
          </View>
        </Animated.View>

        {/* Instructions */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Voice & Language Override Test</Text>
          <View style={styles.instructionsList}>
            <InstructionItem number={1} text="Ensure ALL overrides are enabled in your ElevenLabs agent's Security tab (Prompt, Voice, Language, First Message)" />
            <InstructionItem number={2} text="Toggle 'Enable Voice Override' ON above" />
            <InstructionItem number={3} text="Select a voice - the language auto-switches based on voice (Spanish voice = Spanish conversation)" />
            <InstructionItem number={4} text="Press 'Start Test Call' - log shows override details" />
            <InstructionItem number={5} text="AI should greet you in the voice's language (e.g., Spanish voice says '¡Hola!')" />
            <InstructionItem number={6} text="If error 1006 occurs, check that overrides are enabled in dashboard" />
          </View>
        </Animated.View>

        {/* Environment Info */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Environment</Text>
          <View style={styles.envInfo}>
            <Text style={styles.envText}>
              API Key: {getElevenLabsApiKey() ? `${getElevenLabsApiKey().substring(0, 8)}...` : 'Not set'}
            </Text>
            <Text style={styles.envText}>
              Agent ID: {getElevenLabsAgentId() ? `${getElevenLabsAgentId().substring(0, 12)}...` : 'Not set'}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Status Item Component
function StatusItem({ label, status, detail }: { label: string; status: boolean; detail: string }) {
  return (
    <View style={styles.statusItem}>
      <View style={styles.statusItemHeader}>
        <Ionicons
          name={status ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={status ? colors.success.DEFAULT : colors.error.DEFAULT}
        />
        <Text style={styles.statusItemLabel}>{label}</Text>
      </View>
      <Text style={styles.statusItemDetail}>{detail}</Text>
    </View>
  );
}

// Instruction Item Component
function InstructionItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.instructionItem}>
      <View style={styles.instructionNumber}>
        <Text style={styles.instructionNumberText}>{number}</Text>
      </View>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

// Get status badge style
function getStatusStyle(status: string) {
  switch (status) {
    case 'connected':
      return { backgroundColor: colors.success.DEFAULT + '20', borderColor: colors.success.DEFAULT };
    case 'connecting':
    case 'disconnecting':
      return { backgroundColor: colors.warning.DEFAULT + '20', borderColor: colors.warning.DEFAULT };
    case 'disconnected':
    default:
      return { backgroundColor: colors.text.tertiary + '20', borderColor: colors.text.tertiary };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  // Voice Override Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginBottom: spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  toggleHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Voice Selector
  voiceSelector: {
    gap: spacing.md,
  },
  voiceSelectorLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  languageGroup: {
    gap: spacing.sm,
  },
  languageLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  voiceGrid: {
    gap: spacing.sm,
  },
  voiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.sm,
  },
  voiceChipSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT + '15',
  },
  voiceChipFlag: {
    fontSize: 24,
  },
  voiceChipInfo: {
    flex: 1,
  },
  voiceChipName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  voiceChipNameSelected: {
    color: colors.primary.DEFAULT,
  },
  voiceChipId: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  currentSelection: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.success.DEFAULT + '15',
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success.DEFAULT,
  },
  currentSelectionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.success.DEFAULT,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  currentSelectionValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  currentSelectionId: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
    marginTop: spacing.xs,
  },
  // Slow Speech Selector
  slowSpeechSelector: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  speedButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  speedButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  speedButtonSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT + '15',
  },
  speedButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  speedButtonTextSelected: {
    color: colors.primary.DEFAULT,
  },
  speedButtonLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  disabledNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
  },
  disabledNoteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  // Test Log
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  clearLog: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.medium,
  },
  logContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    maxHeight: 150,
  },
  logEmpty: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  logEntry: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  statusGrid: {
    gap: spacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  statusItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusItemLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  statusItemDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  connectionStatus: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statusValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error.DEFAULT + '15',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error.DEFAULT,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  primaryButton: {
    backgroundColor: colors.primary.DEFAULT,
  },
  dangerButton: {
    backgroundColor: colors.error.DEFAULT,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: 'white',
  },
  messagesContainer: {
    gap: spacing.sm,
  },
  messageItem: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  userMessage: {
    backgroundColor: colors.primary.DEFAULT + '20',
    marginLeft: spacing.xl,
  },
  assistantMessage: {
    backgroundColor: colors.background.elevated,
    marginRight: spacing.xl,
  },
  messageRole: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  messageContent: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  instructionsList: {
    gap: spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.DEFAULT,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  envInfo: {
    gap: spacing.xs,
  },
  envText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
});
