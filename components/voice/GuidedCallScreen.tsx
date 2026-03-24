/**
 * Guided Call Screen — Live voice call with embedded objective checklist
 *
 * Layout (from verified design):
 * - Top: Timer + scenario label + end call
 * - Upper: Avatar with glowing ring when speaking
 * - Middle: Collapsible mission checklist (badge "2/4" default)
 * - Lower: Live transcript (user blue, agent dark)
 * - Bottom: Mute / Hang up / Pause controls
 *
 * The checklist updates in real-time as objectives are detected from transcript.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';
import { detectObjectiveCompletion } from '@/lib/voice/guidedPromptBuilder';

interface Phrase {
  text: string;
  translation: string;
}

interface GuidedCallScreenProps {
  scenarioTitle: string;
  characterName: string;
  characterRole: string;
  objectives: string[];
  phrases?: Phrase[];
  // From useElevenLabsConversation
  isConnected: boolean;
  isSpeaking: boolean;
  messages: Array<{ id: string; role: string; content: string; timestamp: number }>;
  sessionDuration: number;
  // Actions
  onEndCall: () => void;
  onMuteToggle?: () => void;
  isMuted?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function GuidedCallScreen({
  scenarioTitle,
  characterName,
  characterRole,
  objectives,
  phrases,
  isConnected,
  isSpeaking,
  messages,
  sessionDuration,
  onEndCall,
  onMuteToggle,
  isMuted = false,
}: GuidedCallScreenProps) {
  const [checklistExpanded, setChecklistExpanded] = useState(false);
  const [phrasesVisible, setPhrasesVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const glowAnim = useRef(new RNAnimated.Value(0)).current;

  // Detect objective completion from transcript
  const completedObjectives = detectObjectiveCompletion(objectives, messages);
  const completedCount = completedObjectives.filter(Boolean).length;

  // Glow animation when agent is speaking
  useEffect(() => {
    RNAnimated.timing(glowAnim, {
      toValue: isSpeaking ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSpeaking]);

  const glowStyle = {
    borderColor: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 54, 255, 0.3)', 'rgba(0, 54, 255, 0.9)'],
    }),
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.6],
    }),
  };

  // Auto-scroll transcript
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  return (
    <LinearGradient
      colors={['#0A0E1A', '#0D1B2A', '#101D30']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Top bar: Timer + Scenario + End */}
        <View style={styles.topBar}>
          <View style={styles.timerBadge}>
            <View style={[styles.liveIndicator, isConnected && styles.liveActive]} />
            <Text style={styles.timerText}>{formatTime(sessionDuration)}</Text>
          </View>
          <Text style={styles.scenarioLabel} numberOfLines={1}>{scenarioTitle}</Text>
          <TouchableOpacity
            style={styles.endCallSmall}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onEndCall();
            }}
          >
            <Ionicons name="close" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <RNAnimated.View style={[styles.avatarRing, glowStyle]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{characterName[0]}</Text>
            </View>
          </RNAnimated.View>
          <Text style={styles.characterName}>{characterName}</Text>
          <Text style={styles.characterRole}>{characterRole}</Text>
        </View>

        {/* Collapsible checklist */}
        <TouchableOpacity
          style={styles.checklistToggle}
          onPress={() => setChecklistExpanded(!checklistExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.checklistBadge}>{completedCount}/{objectives.length}</Text>
          <Text style={styles.checklistLabel}>Objectives</Text>
          <Ionicons
            name={checklistExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>

        {checklistExpanded && (
          <View style={styles.checklistContent}>
            {objectives.map((obj, i) => (
              <View key={i} style={styles.checklistItem}>
                {completedObjectives[i] ? (
                  <Ionicons name="checkmark-circle" size={18} color={colors.secondary.DEFAULT} />
                ) : i === completedCount ? (
                  <Ionicons name="arrow-forward-circle" size={18} color={colors.primary.DEFAULT} />
                ) : (
                  <Ionicons name="ellipse-outline" size={18} color={colors.text.disabled} />
                )}
                <Text style={[
                  styles.checklistText,
                  completedObjectives[i] && styles.checklistDone,
                ]}>
                  {obj}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Phrases drawer toggle */}
        {phrases && phrases.length > 0 && (
          <TouchableOpacity
            style={styles.phrasesToggle}
            onPress={() => setPhrasesVisible(!phrasesVisible)}
          >
            <Ionicons name="book-outline" size={14} color={colors.primary.light} />
            <Text style={styles.phrasesToggleText}>
              {phrasesVisible ? 'Hide phrases' : 'Show phrases'}
            </Text>
          </TouchableOpacity>
        )}

        {phrasesVisible && phrases && (
          <ScrollView style={styles.phrasesDrawer} horizontal showsHorizontalScrollIndicator={false}>
            {phrases.map((p, i) => (
              <View key={i} style={styles.phraseChip}>
                <Text style={styles.phraseChipText}>{p.text}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Transcript */}
        <ScrollView
          ref={scrollRef}
          style={styles.transcript}
          contentContainerStyle={styles.transcriptContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.agentBubble,
              ]}
            >
              <Text style={[
                styles.bubbleText,
                msg.role === 'user' ? styles.userBubbleText : styles.agentBubbleText,
              ]}>
                {msg.content}
              </Text>
            </View>
          ))}
          {messages.length === 0 && isConnected && (
            <Text style={styles.waitingText}>Connecting...</Text>
          )}
        </ScrollView>

        {/* Bottom controls: Mute / Hang up / Pause */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onMuteToggle?.();
            }}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? '#FF4444' : colors.text.primary}
            />
            <Text style={styles.controlLabel}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hangUpButton}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onEndCall();
            }}
          >
            <Ionicons name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="pause" size={24} color={colors.text.primary} />
            <Text style={styles.controlLabel}>Pause</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.disabled,
  },
  liveActive: {
    backgroundColor: colors.secondary.DEFAULT,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.mono.regular,
    color: colors.text.secondary,
  },
  scenarioLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.display.semiBold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  endCallSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0036FF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 8,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontFamily: fonts.display.bold,
    color: colors.primary.DEFAULT,
  },
  characterName: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  characterRole: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
  },

  // Checklist
  checklistToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  checklistBadge: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.mono.regular,
    color: colors.secondary.DEFAULT,
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  checklistLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.medium,
    color: colors.text.tertiary,
  },
  checklistContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checklistText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.secondary,
  },
  checklistDone: {
    color: colors.text.disabled,
    textDecorationLine: 'line-through',
  },

  // Phrases
  phrasesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  phrasesToggleText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.medium,
    color: colors.primary.light,
  },
  phrasesDrawer: {
    maxHeight: 40,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  phraseChip: {
    backgroundColor: 'rgba(0, 54, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  phraseChipText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.medium,
    color: colors.primary.light,
  },

  // Transcript
  transcript: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  transcriptContent: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary.DEFAULT,
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bubbleText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  agentBubbleText: {
    color: colors.text.secondary,
  },
  waitingText: {
    textAlign: 'center',
    color: colors.text.disabled,
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    marginTop: spacing.xl,
  },

  // Bottom controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.lg,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  controlActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  controlLabel: {
    fontSize: 9,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
  },
  hangUpButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
