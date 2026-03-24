/**
 * SpeakingCard — Pronunciation Practice with Auto-Stop
 *
 * Flow:
 * 1. Show word + phonetic + Play/Slow audio
 * 2. "Start Speaking" → mic opens, recording starts
 * 3. Auto-stops after 3s of silence (or user taps "Done")
 * 4. Whisper transcribes → word-by-word comparison
 * 5. Words highlight green/red → score badge
 * 6. "Try Again" or "Next" buttons
 *
 * Uses OpenAI Whisper (proven, fast for short phrases).
 * Stop button is FIXED at bottom, NO animation/bounce.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { transcribeWithHint } from '@/lib/reading/speechToText';
import { getTargetSpeechLang } from '@/components/cards/vocabulary/speechLang';

// =============================================================================
// TYPES
// =============================================================================

interface SpeakingCardProps {
  word?: string;
  translation?: string;
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
  expressionType?: string;
  onComplete?: (answer?: any) => void;
  onNext?: (answer?: any) => void;
  onCantSpeak?: () => void;
  language?: string;
}

type CardState = 'ready' | 'recording' | 'analyzing' | 'result';

// Auto-stop after this many ms of recording (safety cap)
const MAX_RECORD_MS = 8000;

// =============================================================================
// HELPERS
// =============================================================================

function normalize(w: string): string {
  return w.toLowerCase().replace(/[.,!?;:'"«»\-()[\]]/g, '').replace(/'/g, "'").trim();
}

function levenshtein(a: string, b: string): number {
  const m: number[][] = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
  return m[b.length][a.length];
}

function compareWords(target: string, spoken: string): { matches: boolean[]; score: number } {
  const tw = target.split(/\s+/).map(normalize).filter(w => w.length > 0);
  const sw = spoken.split(/\s+/).map(normalize).filter(w => w.length > 0);
  if (sw.length === 0) return { matches: tw.map(() => false), score: 0 };
  const matches = tw.map((t, i) => {
    if (sw[i] === t) return true;
    if (sw[i] && t.length > 2 && levenshtein(t, sw[i]) <= 1) return true;
    return sw.some(s => s === t || (t.length > 2 && levenshtein(t, s) <= 1));
  });
  return { matches, score: matches.filter(Boolean).length / Math.max(tw.length, 1) };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SpeakingCard({
  word = '',
  translation,
  phonetic,
  expressionType,
  onComplete,
  onNext,
  onCantSpeak,
  language,
}: SpeakingCardProps) {
  const insets = useSafeAreaInsets();
  const speechLang = language || getTargetSpeechLang();
  const whisperLang = speechLang.split('-')[0]; // 'fr-FR' → 'fr'

  const [state, setState] = useState<CardState>('ready');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [result, setResult] = useState<{ matches: boolean[]; score: number; spoken: string } | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const autoStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  // Request mic permission
  useEffect(() => { Audio.requestPermissionsAsync().catch(() => {}); }, []);

  // ── Play audio ──
  const handlePlay = useCallback((slow: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.stop();
    const setter = slow ? setIsPlayingSlow : setIsPlaying;
    setter(true);
    Speech.speak(word, {
      language: speechLang, rate: slow ? 0.5 : 0.85,
      onDone: () => setter(false), onError: () => setter(false),
    });
  }, [word, speechLang]);

  // ── Process recording (shared by auto-stop and manual stop) ──
  const processRecording = useCallback(async (rec: Audio.Recording) => {
    setState('analyzing');

    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;
      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

      if (!uri) {
        setResult({ matches: word.split(/\s+/).map(() => false), score: 0, spoken: '' });
        setState('result');
        return;
      }

      // Whisper transcription with hint for better accuracy
      const transcription = await transcribeWithHint(uri, word, whisperLang);
      const spoken = transcription.text.trim();
      const comparison = compareWords(word, spoken);

      setResult({ ...comparison, spoken });
      setState('result');

      if (comparison.score >= 0.8) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (comparison.score >= 0.5) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    } catch (err) {
      console.error('[SpeakingCard] Error:', err);
      setResult({ matches: word.split(/\s+/).map(() => false), score: 0, spoken: '' });
      setState('result');
    }
  }, [word, whisperLang]);

  // ── Start recording with auto-stop ──
  const handleStartRecording = useCallback(async () => {
    Speech.stop();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      recordingRef.current = rec;
      setState('recording');

      // Auto-stop after MAX_RECORD_MS — user doesn't need to tap stop
      autoStopTimer.current = setTimeout(() => {
        if (recordingRef.current) {
          processRecording(recordingRef.current);
        }
      }, MAX_RECORD_MS);
    } catch (err) {
      console.error('[SpeakingCard] Record error:', err);
    }
  }, [processRecording]);

  // ── Manual stop ──
  const handleStopRecording = useCallback(() => {
    if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
    if (recordingRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      processRecording(recordingRef.current);
    }
  }, [processRecording]);

  // ── Complete / advance ──
  const handleFinish = useCallback((success: boolean) => {
    Speech.stop();
    const handler = onComplete || onNext;
    if (handler) handler({ success, score: result?.score ?? 0 });
  }, [onComplete, onNext, result]);

  // ── Retry ──
  const handleRetry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResult(null);
    setState('ready');
  }, []);

  // ── Can't speak ──
  const handleCantSpeak = useCallback(() => {
    Speech.stop();
    if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
    if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(() => {});
    recordingRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onCantSpeak) onCantSpeak();
    else handleFinish(false);
  }, [onCantSpeak, handleFinish]);

  const targetWords = word.split(/\s+/);

  const headerText = state === 'recording' ? '🎤 Listening...'
    : state === 'analyzing' ? 'Checking...'
    : state === 'result' ? (result && result.score >= 0.8 ? '🎉 Great job!' : result && result.score >= 0.5 ? '💪 Almost!' : 'Try again')
    : 'Say this out loud';

  return (
    <View style={S.container}>
      {/* Badge */}
      {expressionType && (
        <View style={[S.badge, { top: insets.top + spacing.md }]}>
          <Text style={S.badgeText}>{expressionType.toUpperCase()}</Text>
        </View>
      )}

      {/* Content */}
      <View style={[S.content, { paddingTop: insets.top + spacing.xl + spacing.lg }]}>
        <Text style={S.header}>{headerText}</Text>

        {/* Word with per-word highlighting */}
        <View style={S.wordRow}>
          {targetWords.map((w, i) => {
            let color = colors.text.primary;
            if (state === 'result' && result) {
              color = result.matches[i] ? '#10B981' : '#EF4444';
            }
            return <Text key={i} style={[S.word, { color }]}>{w}{i < targetWords.length - 1 ? ' ' : ''}</Text>;
          })}
        </View>

        {phonetic && <Text style={S.phonetic}>/{phonetic}/</Text>}

        {/* Translate — shows text directly */}
        {translation && (
          <TouchableOpacity
            onPress={() => { setShowTranslation(v => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={S.translateBtn}
          >
            <Ionicons name="language" size={16} color={showTranslation ? colors.secondary.DEFAULT : colors.text.tertiary} />
            {showTranslation ? (
              <Text style={S.translationVisible}>{translation}</Text>
            ) : (
              <Text style={S.translateHint}>translate</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Audio — ready state only */}
        {state === 'ready' && (
          <View style={S.audioRow}>
            <TouchableOpacity onPress={() => handlePlay(false)} style={S.playBtn}>
              <LinearGradient colors={colors.gradients.primary} style={S.playInner}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePlay(true)} style={S.slowBtn}>
              <Text style={{ fontSize: 22 }}>🐢</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recording indicator */}
        {state === 'recording' && (
          <View style={S.recordingIndicator}>
            <View style={S.recordingDot} />
            <Text style={S.recordingText}>Speak now...</Text>
          </View>
        )}

        {/* Analyzing */}
        {state === 'analyzing' && (
          <View style={S.analyzeBox}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        )}

        {/* Result */}
        {state === 'result' && result && (
          <Animated.View entering={FadeIn.duration(300)} style={S.resultBox}>
            <View style={[S.resultBadge, {
              backgroundColor: result.score >= 0.8 ? 'rgba(16,185,129,0.15)' : result.score >= 0.5 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
            }]}>
              <Ionicons
                name={result.score >= 0.8 ? 'checkmark-circle' : result.score >= 0.5 ? 'alert-circle' : 'close-circle'}
                size={28}
                color={result.score >= 0.8 ? '#10B981' : result.score >= 0.5 ? '#F59E0B' : '#EF4444'}
              />
              <Text style={[S.resultScoreText, {
                color: result.score >= 0.8 ? '#10B981' : result.score >= 0.5 ? '#F59E0B' : '#EF4444',
              }]}>
                {Math.round(result.score * 100)}%
              </Text>
            </View>
            {result.spoken.length > 0 && (
              <Text style={S.resultSpoken}>You said: "{result.spoken}"</Text>
            )}
          </Animated.View>
        )}

        <View style={{ flex: 1 }} />
      </View>

      {/* ══════════ BOTTOM — FIXED, NO ANIMATION ══════════ */}
      <View style={[S.bottom, { paddingBottom: insets.bottom + spacing.md }]}>
        {state === 'ready' && (
          <>
            <TouchableOpacity onPress={handleStartRecording} activeOpacity={0.85}>
              <LinearGradient colors={colors.gradients.primary} style={S.mainBtn}>
                <Ionicons name="mic" size={22} color="#fff" />
                <Text style={S.mainBtnText}>Start Speaking</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCantSpeak} style={S.skipBtn}>
              <Text style={S.skipText}>I can't speak right now</Text>
            </TouchableOpacity>
          </>
        )}

        {state === 'recording' && (
          <TouchableOpacity onPress={handleStopRecording} activeOpacity={0.85}>
            <LinearGradient colors={['#EF4444', '#DC2626']} style={S.mainBtn}>
              <Ionicons name="stop-circle" size={22} color="#fff" />
              <Text style={S.mainBtnText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {state === 'analyzing' && (
          <View style={[S.mainBtn, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
            <Text style={[S.mainBtnText, { color: colors.text.secondary }]}>Checking...</Text>
          </View>
        )}

        {state === 'result' && (
          <View style={S.resultActions}>
            <TouchableOpacity onPress={handleRetry} activeOpacity={0.85} style={{ flex: 1 }}>
              <View style={S.retryBtn}>
                <Ionicons name="refresh" size={18} color={colors.primary.DEFAULT} />
                <Text style={S.retryBtnText}>Retry</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFinish(result?.score ? result.score >= 0.5 : false)} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient colors={colors.gradients.success} style={S.mainBtn}>
                <Text style={S.mainBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  badge: { position: 'absolute', right: spacing.lg, backgroundColor: colors.background.card, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 10 },
  badgeText: { color: colors.primary.light, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.lg },
  header: { fontSize: typography.fontSize.lg, fontWeight: '600', color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl },
  wordRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: spacing.sm },
  word: { fontSize: 32, fontWeight: '800' },
  phonetic: { fontSize: typography.fontSize.base, color: colors.text.tertiary, fontStyle: 'italic', marginBottom: spacing.md },
  translateBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: borderRadius.full, marginBottom: spacing.lg },
  translationVisible: { color: colors.secondary.DEFAULT, fontSize: 16, fontWeight: '600' },
  translateHint: { color: colors.text.tertiary, fontSize: typography.fontSize.sm },
  audioRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  playBtn: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden' },
  playInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  slowBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444' },
  recordingText: { color: colors.text.secondary, fontSize: typography.fontSize.base },
  analyzeBox: { marginTop: spacing.xl },
  resultBox: { alignItems: 'center', marginTop: spacing.lg },
  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
  resultScoreText: { fontSize: 28, fontWeight: '800' },
  resultSpoken: { color: colors.text.tertiary, fontSize: typography.fontSize.sm, marginTop: spacing.sm, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: spacing.lg },
  // Bottom — FIXED, NO ANIMATION
  bottom: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' },
  mainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 16, borderRadius: borderRadius.lg },
  mainBtnText: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { color: colors.text.tertiary, fontSize: typography.fontSize.sm },
  resultActions: { flexDirection: 'row', gap: spacing.md },
  retryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 16, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.primary.DEFAULT },
  retryBtnText: { color: colors.primary.DEFAULT, fontSize: typography.fontSize.base, fontWeight: '700' },
});
