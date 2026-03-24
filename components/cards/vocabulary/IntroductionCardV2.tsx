/**
 * IntroductionCardV2 - Clean Centered Word Card
 *
 * FRONT: Clean dark card with word + phonetic + Play/Slow audio + translate icon
 * BACK (flip): Definition + Examples with audio + translate toggle
 *
 * No background image. Professional, minimal, centered.
 * Flip to see meaning. Translate icon to peek without flipping.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useVocabCard } from './hooks/useVocabCard';
import { calculateSM2 } from '@/lib/spaced-repetition/sm2';
import { ReviewQuality } from '@/types/flashcard';
import type { VocabCardProps } from '@/types/vocabulary';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Map target language names to Speech.speak language codes
const SPEECH_LANG_MAP: Record<string, string> = {
  french: 'fr-FR', spanish: 'es-ES', english: 'en-US',
  german: 'de-DE', italian: 'it-IT', portuguese: 'pt-BR',
  fr: 'fr-FR', es: 'es-ES', en: 'en-US', de: 'de-DE', it: 'it-IT', pt: 'pt-BR',
};

function getSpeechLang(): string {
  // Try to get from onboarding store
  try {
    const { useOnboardingV3 } = require('@/hooks/useOnboardingV3');
    const lang = useOnboardingV3.getState()?.target_language;
    if (lang && SPEECH_LANG_MAP[lang]) return SPEECH_LANG_MAP[lang];
  } catch {}
  return 'fr-FR'; // Default to French
}

function formatInterval(days: number): string {
  if (days === 0) return '< 1 min';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} week${days >= 14 ? 's' : ''}`;
  return `${Math.round(days / 30)} month${days >= 60 ? 's' : ''}`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function IntroductionCardV2({ item, onComplete, onSkip }: VocabCardProps) {
  const insets = useSafeAreaInsets();
  const speechLang = useMemo(() => getSpeechLang(), []);

  // State
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExampleTranslations, setShowExampleTranslations] = useState<boolean[]>([false, false]);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Animation
  const flipProgress = useSharedValue(0);

  // Vocab card hook
  const { trackAudioPlay, complete } = useVocabCard({
    variant: 'introduction',
    onComplete,
  });

  // Calculate preview intervals for buttons
  const intervals = useMemo(() => {
    const againResult = calculateSM2({
      quality: ReviewQuality.FORGOT,
      easeFactor: item.easeFactor || 2.5,
      interval: item.interval || 0,
      repetitions: item.repetitions || 0,
    });
    const gotItResult = calculateSM2({
      quality: ReviewQuality.GOOD,
      easeFactor: item.easeFactor || 2.5,
      interval: item.interval || 0,
      repetitions: item.repetitions || 0,
    });
    return { again: againResult.interval, gotIt: gotItResult.interval };
  }, [item.easeFactor, item.interval, item.repetitions]);

  // Cleanup sound
  useEffect(() => {
    return () => { if (sound) sound.unloadAsync(); };
  }, [sound]);

  // Auto-play on mount
  useEffect(() => {
    const autoPlay = async () => {
      await new Promise(r => setTimeout(r, 500));
      await playWordAudio(false);
    };
    autoPlay();
  }, []);

  // ==========================================================================
  // AUDIO — uses correct language
  // ==========================================================================

  const playWordAudio = useCallback(async (slow = false) => {
    trackAudioPlay();
    setIsPlayingWord(true);
    const rate = slow ? 0.5 : 0.85;

    if (item.audioUrl && !slow) {
      try {
        if (sound) await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: item.audioUrl },
          { shouldPlay: true, rate: 1.0, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) setIsPlayingWord(false);
          }
        );
        setSound(newSound);
      } catch {
        Speech.speak(item.word, { rate, language: speechLang, onDone: () => setIsPlayingWord(false), onError: () => setIsPlayingWord(false) });
      }
    } else {
      Speech.speak(item.word, { rate, language: speechLang, onDone: () => setIsPlayingWord(false), onError: () => setIsPlayingWord(false) });
    }
  }, [item, sound, trackAudioPlay, speechLang]);

  const playExampleAudio = useCallback(async (index: number) => {
    const example = item.examples?.[index];
    if (!example) return;
    trackAudioPlay();
    setIsPlayingExample(index);

    Speech.speak(example.text, {
      rate: 0.85,
      language: speechLang,
      onDone: () => setIsPlayingExample(null),
      onError: () => setIsPlayingExample(null),
    });
  }, [item.examples, trackAudioPlay, speechLang]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    flipProgress.value = withTiming(newFlipped ? 1 : 0, { duration: 350, easing: Easing.out(Easing.cubic) });
    if (newFlipped && item.examples?.[0]) {
      setTimeout(() => playExampleAudio(0), 500);
    }
  }, [isFlipped, flipProgress, item.examples, playExampleAudio]);

  const handlePlayWord = useCallback((slow = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlayingWord) { Speech.stop(); setIsPlayingWord(false); return; }
    playWordAudio(slow);
  }, [isPlayingWord, playWordAudio]);

  const handleToggleTranslation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTranslation(prev => !prev);
  }, []);

  const handleToggleExampleTranslation = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowExampleTranslations(prev => { const n = [...prev]; n[index] = !n[index]; return n; });
  }, []);

  const handleAgain = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    complete(false);
  }, [complete]);

  const handleGotIt = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    complete(true);
  }, [complete]);

  // ==========================================================================
  // ANIMATIONS
  // ==========================================================================

  const frontStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.5], [1, 0]),
    zIndex: flipProgress.value < 0.5 ? 2 : 0,
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0.5, 1], [0, 1]),
    zIndex: flipProgress.value >= 0.5 ? 2 : 0,
  }));

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <View style={S.container}>
      <View style={S.cardArea}>
        {/* ══════════════ FRONT — Clean centered ══════════════ */}
        <Animated.View style={[S.card, frontStyle]}>
          <Pressable onPress={handleFlip} style={S.cardInner}>
            {/* Category badge top-left */}
            <View style={S.topRow}>
              <View style={S.badge}>
                <Text style={S.badgeText}>{item.category || 'VOCABULARY'}</Text>
              </View>
              <Ionicons name="sync-outline" size={16} color="rgba(255,255,255,0.3)" />
            </View>

            {/* Centered content */}
            <View style={S.centerContent}>
              {/* Word */}
              <Text style={S.word}>{item.word}</Text>

              {/* Phonetic */}
              {item.phonetic && (
                <Text style={S.phonetic}>/{item.phonetic}/</Text>
              )}

              {/* Part of speech */}
              {item.partOfSpeech && (
                <Text style={S.pos}>{item.partOfSpeech}</Text>
              )}

              {/* Audio buttons: Play + Slow */}
              <View style={S.audioRow}>
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation(); handlePlayWord(false); }}
                  activeOpacity={0.85}
                  style={S.audioBtn}
                >
                  <LinearGradient colors={colors.gradients.primary} style={S.audioBtnGrad}>
                    <Ionicons name={isPlayingWord ? 'pause' : 'play'} size={24} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation(); handlePlayWord(true); }}
                  activeOpacity={0.85}
                  style={[S.audioBtn, S.audioBtnSlow]}
                >
                  <Text style={{ fontSize: 24 }}>🐢</Text>
                </TouchableOpacity>
              </View>

              {/* Translate button */}
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); handleToggleTranslation(); }}
                style={S.translateBtn}
              >
                <Ionicons
                  name="language"
                  size={18}
                  color={showTranslation ? colors.secondary.DEFAULT : 'rgba(255,255,255,0.6)'}
                />
                {showTranslation ? (
                  <Animated.Text entering={FadeIn.duration(200)} style={S.translationText}>
                    {item.translation}
                  </Animated.Text>
                ) : (
                  <Text style={S.translateHint}>translate</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Flip hint */}
            <Text style={S.flipHint}>tap card to see meaning & examples</Text>
          </Pressable>
        </Animated.View>

        {/* ══════════════ BACK — Definition + Examples ══════════════ */}
        <Animated.View style={[S.card, S.cardBack, backStyle]}>
          <Pressable onPress={handleFlip} style={S.cardInner}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
              {/* Word header on back */}
              <View style={S.backHeader}>
                <Text style={S.backWord}>{item.word}</Text>
                {item.phonetic && <Text style={S.backPhonetic}>/{item.phonetic}/</Text>}
                {item.partOfSpeech && <Text style={S.backPos}>{item.partOfSpeech}</Text>}
              </View>

              {/* Translation — always show on back */}
              <View style={S.section}>
                <Text style={S.sectionLabel}>TRANSLATION</Text>
                <Text style={S.definition}>{item.translation}</Text>
              </View>

              {/* Definition — if different from translation */}
              {item.definition && item.definition !== item.translation && (
                <View style={S.section}>
                  <Text style={S.sectionLabel}>DEFINITION</Text>
                  <Text style={S.definition}>{item.definition}</Text>
                </View>
              )}

              {/* Examples */}
              {item.examples?.slice(0, 2).map((example, idx) => (
                <Animated.View key={idx} entering={FadeInDown.duration(300).delay(idx * 100)} style={S.section}>
                  <View style={S.exampleHeader}>
                    <Text style={S.sectionLabel}>EXAMPLE {idx + 1}</Text>
                    <View style={S.exampleActions}>
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); handleToggleExampleTranslation(idx); }}
                        style={S.smallBtn}
                      >
                        <Ionicons name={showExampleTranslations[idx] ? 'eye' : 'eye-outline'} size={16} color={colors.text.tertiary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); playExampleAudio(idx); }}
                        style={[S.smallBtn, { backgroundColor: colors.primary.DEFAULT }]}
                      >
                        <Ionicons name={isPlayingExample === idx ? 'pause' : 'volume-high'} size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={S.exampleText}>"{example.text}"</Text>
                  {showExampleTranslations[idx] && (
                    <Animated.Text entering={FadeIn.duration(200)} style={S.exampleTrans}>
                      {example.translation}
                    </Animated.Text>
                  )}
                </Animated.View>
              ))}

              <Text style={S.backHint}>tap to flip back</Text>
            </ScrollView>
          </Pressable>
        </Animated.View>
      </View>

      {/* ══════════════ BOTTOM ACTIONS — Fixed ══════════════ */}
      <View style={[S.actions, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity onPress={handleAgain} activeOpacity={0.85} style={S.actionBtn}>
          <LinearGradient colors={colors.gradients.error} style={S.actionGrad}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={S.actionText}>Again</Text>
            <Text style={S.actionInterval}>{formatInterval(intervals.again)}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGotIt} activeOpacity={0.85} style={S.actionBtn}>
          <LinearGradient colors={colors.gradients.success} style={S.actionGrad}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={S.actionText}>Got it</Text>
            <Text style={S.actionInterval}>{formatInterval(intervals.gotIt)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },

  // Card area
  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },

  card: {
    position: 'absolute',
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.65,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardBack: { backgroundColor: colors.background.elevated },
  cardInner: { flex: 1, padding: spacing.lg },

  // Top row
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  badge: { backgroundColor: 'rgba(99,102,241,0.15)', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full },
  badgeText: { color: colors.primary.light, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // Center content — the main attraction
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  word: { color: colors.text.primary, fontSize: 38, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xs },
  phonetic: { color: colors.text.tertiary, fontSize: 16, fontStyle: 'italic', marginBottom: spacing.xs },
  pos: { color: colors.primary.light, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.lg },

  // Audio buttons
  audioRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  audioBtn: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  audioBtnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  audioBtnSlow: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  // Translate button
  translateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  translationText: { color: colors.secondary.DEFAULT, fontSize: 16, fontWeight: '600' },
  translateHint: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

  // Flip hint
  flipHint: { color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center', marginTop: spacing.md },

  // Back card
  backHeader: { alignItems: 'center', marginBottom: spacing.lg, paddingTop: spacing.md },
  backWord: { color: colors.text.primary, fontSize: 28, fontWeight: '800' },
  backPhonetic: { color: colors.text.tertiary, fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  backPos: { color: colors.primary.light, fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginTop: spacing.xs },

  section: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  sectionLabel: { color: colors.text.tertiary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xs },
  definition: { color: colors.text.primary, fontSize: 16, lineHeight: 24, fontWeight: '500' },

  exampleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  exampleActions: { flexDirection: 'row', gap: spacing.sm },
  smallBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  exampleText: { color: colors.text.primary, fontSize: 16, fontStyle: 'italic', lineHeight: 24 },
  exampleTrans: { color: colors.text.tertiary, fontSize: 14, fontStyle: 'italic', marginTop: spacing.sm, paddingLeft: spacing.sm, borderLeftWidth: 2, borderLeftColor: colors.primary.DEFAULT },
  backHint: { color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', marginTop: spacing.lg },

  // Bottom actions — fixed
  actions: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.md },
  actionBtn: { flex: 1, borderRadius: borderRadius.lg, overflow: 'hidden' },
  actionGrad: { alignItems: 'center', paddingVertical: spacing.md },
  actionText: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: '700' },
  actionInterval: { color: 'rgba(255,255,255,0.6)', fontSize: typography.fontSize.xs, marginTop: 2 },
});

export default IntroductionCardV2;
