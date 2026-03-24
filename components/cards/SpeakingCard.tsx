/**
 * SpeakingCard — Live Pronunciation Practice with Whisper
 *
 * Flow:
 * 1. Show word + phonetic + Play/Slow audio
 * 2. User taps "Speak" → recording starts
 * 3. User taps "Done" → Whisper transcribes → word-by-word comparison
 * 4. Words highlight green (match) or red (miss) → score badge
 * 5. Auto-advance after 2s or tap Continue
 *
 * Uses OpenAI Whisper via lib/reading/speechToText.ts
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
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

// =============================================================================
// WORD COMPARISON
// =============================================================================

function normalize(w: string): string {
  return w.toLowerCase().replace(/[.,!?;:'"«»\-()]/g, '').replace(/'/g, "'").trim();
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
  const matches = tw.map((t, i) => {
    if (sw[i] === t) return true;
    if (sw[i] && t.length > 3 && levenshtein(t, sw[i]) <= 1) return true;
    return sw.some(s => s === t || (t.length > 3 && levenshtein(t, s) <= 1));
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
  const whisperLang = speechLang.split('-')[0];

  const [state, setState] = useState<CardState>('ready');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [result, setResult] = useState<{ matches: boolean[]; score: number; spoken: string } | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    return () => {
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
      Speech.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [recording]);

  useEffect(() => {
    if (state === 'recording') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        ), -1, true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [state]);

  // Request mic permission on mount
  useEffect(() => {
    Audio.requestPermissionsAsync().catch(() => {});
  }, []);

  const handlePlay = useCallback((slow: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.stop();
    const setter = slow ? setIsPlayingSlow : setIsPlaying;
    setter(true);
    Speech.speak(word, {
      language: speechLang,
      rate: slow ? 0.5 : 0.85,
      onDone: () => setter(false),
      onError: () => setter(false),
    });
  }, [word, speechLang]);

  const handleStartRecording = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setState('recording');
    } catch (err) {
      console.error('[SpeakingCard] Record error:', err);
    }
  }, []);

  const finish = useCallback((success: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const handler = onComplete || onNext;
    if (handler) handler({ success, score: result?.score ?? 0 });
  }, [onComplete, onNext, result]);

  const handleStopRecording = useCallback(async () => {
    if (!recording) return;
    setState('analyzing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

      if (!uri) { finish(false); return; }

      const transcription = await transcribeWithHint(uri, word, whisperLang);
      const spoken = transcription.text.trim();
      const comparison = compareWords(word, spoken);

      setResult({ ...comparison, spoken });
      setState('result');

      if (comparison.score >= 0.8) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (comparison.score >= 0.5) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      timerRef.current = setTimeout(() => finish(comparison.score >= 0.5), 2500);
    } catch (err) {
      console.error('[SpeakingCard] Transcription error:', err);
      setResult({ matches: [false], score: 0, spoken: '' });
      setState('result');
      timerRef.current = setTimeout(() => finish(false), 2000);
    }
  }, [recording, word, whisperLang, finish]);

  const handleCantSpeak = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onCantSpeak) onCantSpeak();
    else finish(false);
  }, [onCantSpeak, finish]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const targetWords = word.split(/\s+/);

  // Header text based on state
  const headerText = state === 'recording' ? 'Listening...'
    : state === 'analyzing' ? 'Checking...'
    : state === 'result' ? (result && result.score >= 0.8 ? '🎉 Great job!' : result && result.score >= 0.5 ? 'Almost there!' : 'Let\'s try again')
    : 'Say this out loud';

  return (
    <View style={S.container}>
      {expressionType && (
        <View style={[S.badge, { top: insets.top + spacing.md }]}>
          <Text style={S.badgeText}>{expressionType.toUpperCase()}</Text>
        </View>
      )}

      <View style={[S.content, { paddingTop: insets.top + spacing.xl + spacing.lg }]}>
        <Animated.Text entering={FadeInDown.duration(300)} style={S.header} key={state}>
          {headerText}
        </Animated.Text>

        {/* Word with per-word highlighting */}
        <View style={S.wordRow}>
          {targetWords.map((w, i) => {
            let color = colors.text.primary;
            if (state === 'result' && result) {
              color = result.matches[i] ? '#10B981' : '#EF4444';
            }
            return (
              <Text key={i} style={[S.word, { color }]}>
                {w}{i < targetWords.length - 1 ? ' ' : ''}
              </Text>
            );
          })}
        </View>

        {phonetic && <Text style={S.phonetic}>/{phonetic}/</Text>}

        {translation && (
          <TouchableOpacity
            onPress={() => { setShowTranslation(!showTranslation); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={S.translateBtn}
          >
            <Ionicons name="language" size={16} color={showTranslation ? colors.secondary.DEFAULT : colors.text.tertiary} />
            <Text style={[S.translateText, showTranslation && { color: colors.secondary.DEFAULT }]}>
              {showTranslation ? translation : 'translate'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Audio — only when ready */}
        {state === 'ready' && (
          <Animated.View entering={FadeIn.delay(200)} style={S.audioRow}>
            <TouchableOpacity onPress={() => handlePlay(false)} style={S.playBtn}>
              <LinearGradient colors={colors.gradients.primary} style={S.playBtnInner}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePlay(true)} style={S.slowBtn}>
              <Text style={{ fontSize: 22 }}>🐢</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Analyzing */}
        {state === 'analyzing' && (
          <Animated.View entering={FadeIn} style={S.analyzeBox}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={S.analyzeText}>Checking pronunciation...</Text>
          </Animated.View>
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
                {Math.round(result.score * 100)}% match
              </Text>
            </View>
            {result.spoken.length > 0 && (
              <Text style={S.resultSpoken}>You said: "{result.spoken}"</Text>
            )}
          </Animated.View>
        )}

        <View style={{ flex: 1 }} />
      </View>

      {/* Bottom CTA */}
      <View style={[S.bottom, { paddingBottom: insets.bottom + spacing.md }]}>
        {state === 'ready' && (
          <>
            <TouchableOpacity onPress={handleStartRecording} activeOpacity={0.85}>
              <LinearGradient colors={colors.gradients.primary} style={S.mainBtn}>
                <Ionicons name="mic" size={24} color="#fff" />
                <Text style={S.mainBtnText}>Start Speaking</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCantSpeak} style={S.skipBtn}>
              <Text style={S.skipText}>I can't speak right now</Text>
            </TouchableOpacity>
          </>
        )}
        {state === 'recording' && (
          <Animated.View style={pulseStyle}>
            <TouchableOpacity onPress={handleStopRecording} activeOpacity={0.85}>
              <LinearGradient colors={['#EF4444', '#DC2626']} style={S.mainBtn}>
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={S.mainBtnText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
        {state === 'result' && (
          <TouchableOpacity onPress={() => finish(result?.score ? result.score >= 0.5 : false)} activeOpacity={0.85}>
            <LinearGradient colors={colors.gradients.success} style={S.mainBtn}>
              <Text style={S.mainBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
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
  translateBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: borderRadius.full, marginBottom: spacing.lg },
  translateText: { color: colors.text.tertiary, fontSize: typography.fontSize.sm },
  audioRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  playBtn: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden' },
  playBtnInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  slowBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  analyzeBox: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  analyzeText: { color: colors.text.secondary, fontSize: typography.fontSize.sm },
  resultBox: { alignItems: 'center', marginTop: spacing.lg },
  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
  resultScoreText: { fontSize: typography.fontSize.xl, fontWeight: '700' },
  resultSpoken: { color: colors.text.tertiary, fontSize: typography.fontSize.sm, marginTop: spacing.sm, fontStyle: 'italic', textAlign: 'center' },
  bottom: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  mainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 16, borderRadius: borderRadius.lg },
  mainBtnText: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: spacing.md },
  skipText: { color: colors.text.tertiary, fontSize: typography.fontSize.sm },
});
