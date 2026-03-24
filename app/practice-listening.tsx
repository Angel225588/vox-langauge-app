/**
 * Listening Practice Screen — 3-Stage Scaffolding Loop
 *
 * Progressive listening exercise that proves comprehension improvement:
 *   Vocab Pre-Screen: Select known words → word bank
 *   Stage 1: Pure audio (waveform) → quiz (before score)
 *   Stage 2: Audio + Spotify-style lyrics with translation toggle
 *   Stage 3: Pure audio (prove it) → quiz (after score) → results comparison
 *
 * Supports two entry modes:
 * - Lesson session: discoveryContent passed via route params
 * - Practice tab: AI-generated via practiceGenerator
 *
 * Audio: ElevenLabs TTS with expo-speech fallback.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { generateListeningContent, type ListeningExercise } from '@/lib/ai/practiceGenerator';
import type { ListeningContent, DialogueLine } from '@/lib/lesson/discoveryGenerator';
import { savePracticeScore } from '@/lib/db/competencyMetrics';
import { storeActivityCompletion } from '@/app/lesson-session';
import { updateStreakData } from '@/lib/db/sqlite';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { getDefaultVoiceForLanguage, getDialogueVoices } from '@/lib/voice/elevenLabsConfig';
import type { SupportedLanguage } from '@/lib/voice/types';

import StageIndicator from '@/components/listening/StageIndicator';
import VocabularyPreScreen from '@/components/listening/VocabularyPreScreen';
import PureAudioStage from '@/components/listening/PureAudioStage';
import LyricsSubtitleDisplay from '@/components/listening/LyricsSubtitleDisplay';
import ComprehensionQuiz from '@/components/listening/ComprehensionQuiz';
import ResultsComparison from '@/components/listening/ResultsComparison';
import { LISTENING } from '@/components/listening/theme';

// ─── Types ───────────────────────────────────────────────

type ListeningStage =
  | 'loading'
  | 'vocab_prescreen'
  | 'stage1_listen'
  | 'stage1_quiz'
  | 'lyrics'
  | 'stage3_listen'
  | 'stage3_quiz'
  | 'results';

/** Normalized content shape used by all stages */
interface NormalizedContent {
  title: string;
  dialogueLines: DialogueLine[];
  vocabulary: { word: string; translation: string; phonetic?: string }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  /** Easier gist questions for Stage 1 */
  beforeQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  /** Harder detail questions for Stage 3 */
  afterQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

// ─── Helpers ─────────────────────────────────────────────

/** Map a ListeningStage to the 1-3 stage number for the indicator */
function stageToNumber(stage: ListeningStage): number {
  switch (stage) {
    case 'stage1_listen':
    case 'stage1_quiz':
      return 1;
    case 'lyrics':
      return 2;
    case 'stage3_listen':
    case 'stage3_quiz':
      return 3;
    default:
      return 1;
  }
}

/** Fisher-Yates shuffle that returns a new array */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Shuffle options for each question while tracking the new correct index */
function shuffleQuestionOptions(
  questions: NormalizedContent['questions'],
): NormalizedContent['questions'] {
  if (!Array.isArray(questions)) return [];
  return questions
    .filter((q) => Array.isArray(q.options) && q.options.length > 0)
    .map((q) => {
      const indices = q.options.map((_, i) => i);
      const shuffled = shuffleArray(indices);
      const newOptions = shuffled.map((i) => q.options[i]);
      const newCorrectIndex = shuffled.indexOf(q.correctIndex);
      return { ...q, options: newOptions, correctIndex: newCorrectIndex };
    });
}

/** Normalize discovery ListeningContent into our common shape. Returns null if data is malformed. */
function normalizeDiscoveryContent(dc: ListeningContent): NormalizedContent | null {
  if (!Array.isArray(dc?.dialogue) || dc.dialogue.length === 0) return null;
  // Accept content if it has ANY type of questions
  const hasQuestions = (Array.isArray(dc?.comprehensionQuestions) && dc.comprehensionQuestions.length > 0)
    || (Array.isArray(dc?.beforeQuestions) && dc.beforeQuestions.length > 0);
  if (!hasQuestions) return null;

  const filterQuestions = (qs?: any[]) =>
    (qs || []).filter((q: any) => q.question && Array.isArray(q.options) && q.options.length > 0);

  return {
    title: dc.title || 'Listening Practice',
    dialogueLines: dc.dialogue.map((d) => ({
      speaker: d.speaker || 'Speaker',
      text: d.text,
      translation: d.translation,
      gender: d.gender,
      mood: d.mood,
    })),
    vocabulary: Array.isArray(dc.vocabulary) ? dc.vocabulary : [],
    // Fallback: use comprehensionQuestions if before/after not provided
    questions: filterQuestions(dc.comprehensionQuestions),
    beforeQuestions: filterQuestions(dc.beforeQuestions),
    afterQuestions: filterQuestions(dc.afterQuestions),
  };
}

/** Normalize practice-tab ListeningExercise into our common shape. Returns null if data is malformed. */
function normalizeExerciseContent(ex: ListeningExercise): NormalizedContent | null {
  if (!Array.isArray(ex?.sentences) || ex.sentences.length === 0) return null;
  if (!Array.isArray(ex?.comprehensionQuestions) || ex.comprehensionQuestions.length === 0) return null;

  return {
    title: ex.title || 'Listening Practice',
    dialogueLines: ex.sentences.map((s, i) => ({
      speaker: `Speaker ${i % 2 === 0 ? 'A' : 'B'}`,
      text: s.text,
      translation: s.translation,
    })),
    vocabulary: Array.isArray(ex.vocabulary) ? ex.vocabulary : [],
    questions: ex.comprehensionQuestions.filter(
      (q) => q.question && Array.isArray(q.options) && q.options.length > 0,
    ),
  };
}

// ═════════════════════════════════════════════════════════
// LIBRARY CONTENT — Template content for library lectures
// ═════════════════════════════════════════════════════════

const LIBRARY_CONTENT: Record<string, NormalizedContent> = {
  'listening-1': {
    title: 'Au Café — A Morning Ritual',
    dialogueLines: [
      // Natural, flowing conversation — feels real, not scripted
      { speaker: 'Narrator', text: 'C\'est un mardi matin à Paris. Le café est presque vide. Un homme entre et s\'assoit au comptoir.', translation: 'It\'s a Tuesday morning in Paris. The cafe is almost empty. A man enters and sits at the counter.', gender: 'male' },
      { speaker: 'Narrator', text: 'Le serveur, Antoine, prépare un expresso. Il lève les yeux.', translation: 'The waiter, Antoine, is making an espresso. He looks up.', gender: 'male' },
      { speaker: 'Antoine', text: 'Bonjour ! Le même que d\'habitude ?', translation: 'Good morning! The usual?', gender: 'male' },
      { speaker: 'Client', text: 'Ah non, pas aujourd\'hui. Je voudrais essayer quelque chose de nouveau.', translation: 'Ah no, not today. I\'d like to try something new.', gender: 'male' },
      { speaker: 'Antoine', text: 'Intéressant ! On a un nouveau mélange colombien. Il est incroyable. Corsé mais doux à la fin.', translation: 'Interesting! We have a new Colombian blend. It\'s incredible. Bold but smooth at the end.', gender: 'male' },
      { speaker: 'Client', text: 'Ça a l\'air parfait. Avec un peu de lait, s\'il vous plaît.', translation: 'That sounds perfect. With a bit of milk, please.', gender: 'male' },
      { speaker: 'Antoine', text: 'Et pour accompagner ? Les croissants sont sortis du four il y a cinq minutes.', translation: 'And to go with it? The croissants came out of the oven five minutes ago.', gender: 'male' },
      { speaker: 'Client', text: 'Comment résister ? Un croissant alors. Merci, Antoine.', translation: 'How can I resist? A croissant then. Thanks, Antoine.', gender: 'male' },
      { speaker: 'Narrator', text: 'Antoine sourit. C\'est pour ça qu\'il aime ce métier. Chaque matin, une nouvelle conversation.', translation: 'Antoine smiles. That\'s why he loves this job. Every morning, a new conversation.', gender: 'male' },
    ],
    vocabulary: [
      { word: 'le même que d\'habitude', translation: 'the usual', phonetic: '/lə mɛm kə dabityd/' },
      { word: 'essayer', translation: 'to try', phonetic: '/eseje/' },
      { word: 'corsé', translation: 'bold (coffee)', phonetic: '/kɔʁse/' },
      { word: 'accompagner', translation: 'to go with / to accompany', phonetic: '/akɔ̃paɲe/' },
      { word: 'sorti du four', translation: 'fresh from the oven', phonetic: '/sɔʁti dy fuʁ/' },
    ],
    // Stage 1: GIST questions — what's the general idea?
    beforeQuestions: [
      { question: 'Where does this story take place?', options: ['A cafe in Paris', 'A restaurant in Lyon', 'A bakery', 'A supermarket'], correctIndex: 0 },
      { question: 'What does the customer want to do differently today?', options: ['Sit outside', 'Try something new', 'Leave quickly', 'Meet a friend'], correctIndex: 1 },
    ],
    // Stage 3: DETAIL questions — did you catch the specifics?
    afterQuestions: [
      { question: 'What type of coffee blend does Antoine recommend?', options: ['Brazilian', 'Ethiopian', 'Colombian', 'Italian'], correctIndex: 2 },
      { question: 'How long ago did the croissants come out of the oven?', options: ['Ten minutes', 'Twenty minutes', 'Five minutes', 'One hour'], correctIndex: 2 },
      { question: 'Why does Antoine love his job?', options: ['The pay is good', 'Every morning brings a new conversation', 'He gets free coffee', 'He works short hours'], correctIndex: 1 },
    ],
    questions: [
      { question: 'What does the customer order?', options: ['The Colombian blend with milk and a croissant', 'An espresso', 'Tea and cake', 'Just water'], correctIndex: 0 },
    ],
  },
  'listening-2': {
    title: 'La Réunion — Under Pressure',
    dialogueLines: [
      { speaker: 'Narrator', text: 'Sophie regarde sa montre. La réunion commence dans deux minutes et le client principal n\'est pas encore arrivé.', translation: 'Sophie checks her watch. The meeting starts in two minutes and the main client hasn\'t arrived yet.', gender: 'female' },
      { speaker: 'Sophie', text: 'Marc, tu as des nouvelles du client ? Il devait être là à neuf heures.', translation: 'Marc, any news from the client? He was supposed to be here at nine.', gender: 'female' },
      { speaker: 'Marc', text: 'Je viens de recevoir un message. Il est coincé dans les embouteillages. Dix minutes de retard.', translation: 'I just got a message. He\'s stuck in traffic. Ten minutes late.', gender: 'male' },
      { speaker: 'Sophie', text: 'D\'accord. Profitons-en pour revoir les chiffres une dernière fois. Le budget a changé hier soir.', translation: 'Alright. Let\'s use the time to review the numbers one last time. The budget changed last night.', gender: 'female' },
      { speaker: 'Marc', text: 'Changé ? Comment ça ? On avait tout validé vendredi !', translation: 'Changed? What do you mean? We validated everything on Friday!', gender: 'male' },
      { speaker: 'Sophie', text: 'Le directeur a réduit l\'enveloppe de quinze pour cent. Il faut adapter notre proposition.', translation: 'The director cut the budget by fifteen percent. We need to adapt our proposal.', gender: 'female' },
      { speaker: 'Marc', text: 'Quinze pour cent... C\'est beaucoup. On supprime quoi ?', translation: 'Fifteen percent... That\'s a lot. What do we cut?', gender: 'male' },
      { speaker: 'Sophie', text: 'La phase de test. On la fait en interne au lieu de sous-traiter. Ça économise le budget sans perdre en qualité.', translation: 'The testing phase. We do it in-house instead of outsourcing. That saves the budget without losing quality.', gender: 'female' },
      { speaker: 'Marc', text: 'Brillant. Je mets à jour la présentation. Sophie, tu gères vraiment bien la pression.', translation: 'Brilliant. I\'ll update the presentation. Sophie, you really handle pressure well.', gender: 'male' },
      { speaker: 'Narrator', text: 'Le client arrive cinq minutes plus tard. La présentation se passe parfaitement. Parfois, les meilleures solutions naissent sous pression.', translation: 'The client arrives five minutes later. The presentation goes perfectly. Sometimes the best solutions are born under pressure.', gender: 'male' },
    ],
    vocabulary: [
      { word: 'les embouteillages', translation: 'traffic jams', phonetic: '/lɛz ɑ̃butɛjaʒ/' },
      { word: 'profitons-en', translation: 'let\'s take advantage of it', phonetic: '/pʁɔfitɔ̃z ɑ̃/' },
      { word: 'l\'enveloppe', translation: 'the budget envelope', phonetic: '/lɑ̃vlɔp/' },
      { word: 'sous-traiter', translation: 'to outsource', phonetic: '/su tʁɛte/' },
      { word: 'mettre à jour', translation: 'to update', phonetic: '/mɛtʁ a ʒuʁ/' },
    ],
    // Stage 1: GIST questions — big picture understanding
    beforeQuestions: [
      { question: 'What is the overall mood of this scene?', options: ['Relaxed and casual', 'Stressful but professional', 'Angry and confrontational', 'Boring and routine'], correctIndex: 1 },
      { question: 'What is the main problem they face?', options: ['The client is late and the budget changed', 'They lost an important document', 'The office is closed', 'Marc forgot the presentation'], correctIndex: 0 },
    ],
    // Stage 3: DETAIL questions — specific information
    afterQuestions: [
      { question: 'By what percentage was the budget cut?', options: ['5%', '10%', '15%', '20%'], correctIndex: 2 },
      { question: 'What solution does Sophie propose?', options: ['Cancel the project', 'Do testing in-house instead of outsourcing', 'Ask for more money', 'Delay the deadline'], correctIndex: 1 },
      { question: 'What does Marc say about Sophie?', options: ['She talks too much', 'She handles pressure well', 'She should relax more', 'She needs more experience'], correctIndex: 1 },
    ],
    questions: [
      { question: 'How does the meeting end?', options: ['It gets cancelled', 'The presentation goes perfectly', 'The client is unhappy', 'They reschedule'], correctIndex: 1 },
    ],
  },
};

function buildLibraryContent(
  lectureId: string,
  title: string,
  category: string,
  langCode: string,
): NormalizedContent | null {
  const template = LIBRARY_CONTENT[lectureId];
  if (template) return template;

  // Generic fallback for unknown lecture IDs
  return null;
}

// ═════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════

/** Map onboarding language name → voice config language code */
const LANG_NAME_TO_CODE: Record<string, SupportedLanguage> = {
  english: 'en',
  french: 'fr',
  spanish: 'es',
};

/** Map language code → expo-speech BCP-47 locale */
const LANG_CODE_TO_SPEECH: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
};

export default function PracticeListeningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const v3Store = useOnboardingV3();
  const params = useLocalSearchParams<{
    returnToSession?: string;
    activityId?: string;
    discoveryContent?: string;
    lectureId?: string;
    lectureTitle?: string;
    lectureDifficulty?: string;
    lectureCategory?: string;
  }>();
  const isSessionActivity = params.returnToSession === 'true';

  // ─── Target language → voice config ──────────────────
  const targetLangCode = LANG_NAME_TO_CODE[v3Store.target_language || ''] || 'fr';
  const speechLocale = LANG_CODE_TO_SPEECH[targetLangCode] || 'fr-FR';
  const voiceConfig = getDefaultVoiceForLanguage(targetLangCode);
  // Multi-speaker: get all available voices for this language (up to 5)
  const dialogueVoices = getDialogueVoices(targetLangCode, 5);

  // ─── State ──────────────────────────────────────────
  const [stage, setStage] = useState<ListeningStage>('loading');
  const [content, setContent] = useState<NormalizedContent | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<NormalizedContent['questions'] | null>(null);
  const [beforeScore, setBeforeScore] = useState(0);
  const [afterScore, setAfterScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [wordsLearned, setWordsLearned] = useState(0);
  const startTimeRef = useRef(Date.now());

  // ─── Audio ──────────────────────────────────────────
  const tts = useElevenLabsTTS();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechStopRef = useRef(false);

  // Lyrics tracking
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // ─── Speak dialogue line-by-line (enables lyrics tracking) ──
  const speakDialogue = useCallback(
    async (slow: boolean = false) => {
      if (!content || isSpeaking) return;

      setIsSpeaking(true);
      speechStopRef.current = false;
      setCurrentLineIndex(0);

      const totalLines = content.dialogueLines.length;
      const avgLineTime = slow ? 4 : 2.5;
      const estimatedDuration = totalLines * avgLineTime;
      setAudioDuration(estimatedDuration);
      setAudioCurrentTime(0);
      setAudioProgress(0);

      // Build speaker → voice map
      // Narrator uses default voice. Characters get distinct voices.
      const speakerVoiceMap = new Map<string, string>();
      const usedVoiceIds = new Set<string>();
      const uniqueSpeakers = [...new Set(content.dialogueLines.map(l => l.speaker))];

      // Default narrator voice (always available)
      const narratorVoiceId = voiceConfig?.elevenLabsVoiceId || '';

      for (const speakerName of uniqueSpeakers) {
        // Narrator always uses the default voice
        if (speakerName.toLowerCase() === 'narrator' || speakerName.toLowerCase() === 'narrateur') {
          speakerVoiceMap.set(speakerName, narratorVoiceId);
          continue;
        }

        // For characters: try to match gender
        const speakerLine = content.dialogueLines.find(l => l.speaker === speakerName);
        const speakerGender = speakerLine?.gender;

        let bestVoice = dialogueVoices.find(
          v => v.gender === speakerGender && !usedVoiceIds.has(v.elevenLabsVoiceId),
        );
        if (!bestVoice) {
          bestVoice = dialogueVoices.find(v => !usedVoiceIds.has(v.elevenLabsVoiceId));
        }
        if (!bestVoice && dialogueVoices.length > 0) {
          bestVoice = dialogueVoices[0];
        }

        if (bestVoice) {
          speakerVoiceMap.set(speakerName, bestVoice.elevenLabsVoiceId);
          usedVoiceIds.add(bestVoice.elevenLabsVoiceId);
        } else {
          // Fallback to narrator voice
          speakerVoiceMap.set(speakerName, narratorVoiceId);
        }
      }

      // Speak each line with the correct speaker's voice
      for (let i = 0; i < content.dialogueLines.length; i++) {
        if (speechStopRef.current) break;
        setCurrentLineIndex(i);
        setAudioCurrentTime(i * avgLineTime);
        setAudioProgress((i + 0.5) / totalLines);

        const line = content.dialogueLines[i];
        const lineVoiceId = speakerVoiceMap.get(line.speaker) || voiceConfig?.elevenLabsVoiceId;
        let spoken = false;

        // Try ElevenLabs with the speaker's specific voice
        if (tts.isConfigured && lineVoiceId) {
          try {
            await tts.speak(line.text, lineVoiceId, slow ? 0.75 : undefined);
            spoken = true;
          } catch {
            // ElevenLabs failed — fall through to expo-speech
          }
        }

        // Fallback: expo-speech with correct language locale
        if (!spoken && !speechStopRef.current) {
          await new Promise<void>((resolve) => {
            Speech.speak(line.text, {
              language: speechLocale,
              rate: slow ? 0.6 : 0.85,
              onDone: resolve,
              onError: () => resolve(),
            });
          });
        }

        if (!speechStopRef.current) {
          await new Promise((resolve) => setTimeout(resolve, slow ? 500 : 200));
        }
      }

      if (!speechStopRef.current) {
        setAudioProgress(1);
        setAudioCurrentTime(estimatedDuration);
      }

      if (!speechStopRef.current) {
        setIsSpeaking(false);
      }
    },
    [content, isSpeaking, tts, dialogueVoices, voiceConfig, speechLocale],
  );

  const stopSpeaking = useCallback(async () => {
    speechStopRef.current = true;
    setIsSpeaking(false);
    try {
      await tts.stop();
      Speech.stop();
    } catch {
      // Ignore
    }
  }, [tts]);

  // ─── Content Loading ───────────────────────────────
  const loadContent = useCallback(async () => {
    setStage('loading');
    setError(null);
    setBeforeScore(0);
    setAfterScore(0);
    setShuffledQuestions(null);
    setWordsLearned(0);
    setCurrentLineIndex(0);
    setAudioProgress(0);
    startTimeRef.current = Date.now();

    try {
      // Try discovery content from route params first
      if (params.discoveryContent) {
        try {
          const parsed: ListeningContent = JSON.parse(params.discoveryContent);
          const normalized = normalizeDiscoveryContent(parsed);
          const hasAnyQuestions = normalized && normalized.dialogueLines.length > 0 &&
            ((normalized.questions?.length ?? 0) > 0 ||
             (normalized.beforeQuestions?.length ?? 0) > 0 ||
             (normalized.afterQuestions?.length ?? 0) > 0);
          if (hasAnyQuestions) {
            setContent(normalized);
            setStage(normalized.vocabulary.length > 0 ? 'vocab_prescreen' : 'stage1_listen');
            return;
          }
          console.warn('[PracticeListening] Discovery content malformed, falling back');
        } catch (parseErr) {
          console.warn('[PracticeListening] Discovery content parse failed:', parseErr);
        }
      }

      // Library lecture: build template content from lecture data
      if (params.lectureId) {
        const templateContent = buildLibraryContent(
          params.lectureId,
          params.lectureTitle || 'Listening Practice',
          params.lectureCategory || 'general',
          targetLangCode,
        );
        if (templateContent) {
          setContent(templateContent);
          setStage(templateContent.vocabulary.length > 0 ? 'vocab_prescreen' : 'stage1_listen');
          return;
        }
      }

      // Fall back to AI generation (practice tab mode)
      const userId = user?.id || 'anonymous';
      const exercise = await generateListeningContent(userId, undefined, v3Store.target_language || undefined);
      if (!exercise) {
        setError('Could not generate listening exercise. Check your learning path.');
        return;
      }
      const normalized = normalizeExerciseContent(exercise);
      if (!normalized || normalized.dialogueLines.length === 0 || normalized.questions.length === 0) {
        setError('Generated exercise was incomplete. Try again.');
        return;
      }
      setContent(normalized);
      setStage(normalized.vocabulary.length > 0 ? 'vocab_prescreen' : 'stage1_listen');
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    }
  }, [params.discoveryContent, user?.id]);

  // Initial load
  useEffect(() => {
    loadContent();
    return () => {
      Speech.stop();
    };
  }, []);

  // ─── Stage Transitions ─────────────────────────────

  const handleVocabComplete = useCallback(
    (knownWords: string[]) => {
      const totalVocab = content?.vocabulary.length || 0;
      setWordsLearned(totalVocab - knownWords.length);
      setStage('stage1_listen');
    },
    [content],
  );

  const handleStage1QuizComplete = useCallback(
    (score: number) => {
      setBeforeScore(score);
      if (content) {
        // Shuffle afterQuestions for Stage 3 (fall back to general questions)
        const stage3Questions = content.afterQuestions?.length
          ? content.afterQuestions
          : content.questions;
        setShuffledQuestions(shuffleQuestionOptions(stage3Questions));
      }
      setStage('lyrics');
    },
    [content],
  );

  const handleStage3QuizComplete = useCallback(
    (score: number) => {
      setAfterScore(score);
      setStage('results');
    },
    [],
  );

  // ─── Score Persistence ─────────────────────────────
  // Use afterQuestions count for scoring (that's what Stage 3 quiz uses)
  const totalQuestions = content?.afterQuestions?.length
    || content?.questions?.length
    || 0;
  const pointsRef = useRef(0);

  useEffect(() => {
    if (stage !== 'results' || totalQuestions === 0) return;

    const pct = Math.round((afterScore / totalQuestions) * 100);
    const practicePoints = 10 + Math.round(pct / 10);
    pointsRef.current = practicePoints;

    const userId = user?.id;
    if (userId) {
      savePracticeScore(userId, 'listening', {
        communication: pct,
        fluency: pct,
        articulation: 0,
        scenario: 0,
      }).catch(() => {});

      updateStreakData(userId, practicePoints).catch(() => {});

      if (isSessionActivity && params.activityId) {
        storeActivityCompletion(params.activityId, pct).catch(() => {});
      }
    }
  }, [stage, afterScore, totalQuestions, user?.id, isSessionActivity, params.activityId]);

  // ─── Navigation ────────────────────────────────────

  /** Confirm before exiting when inside a lesson session */
  const handleBack = useCallback(() => {
    stopSpeaking();
    if (isSessionActivity) {
      Alert.alert(
        'Leave exercise?',
        'Your progress on this activity will be lost.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ],
      );
    } else {
      router.back();
    }
  }, [isSessionActivity, router, stopSpeaking]);

  const handleDone = useCallback(async () => {
    stopSpeaking();

    // Mark lecture as completed in library
    const lectureId = params.lectureId;
    if (lectureId) {
      try {
        const raw = await AsyncStorage.getItem('vox_listening_library_completed');
        const completed = raw ? JSON.parse(raw) : [];
        if (!completed.includes(lectureId)) {
          completed.push(lectureId);
          await AsyncStorage.setItem('vox_listening_library_completed', JSON.stringify(completed));
        }
      } catch {}
    }

    // Save to competency metrics
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const accuracy = totalQuestions > 0 ? Math.round((afterScore / totalQuestions) * 100) : 0;
    try {
      if (user?.id) {
        await savePracticeScore(user.id, 'listening', {
          articulation: accuracy,
          fluency: accuracy,
          communication: Math.round(accuracy * 0.9),
        }, { source: 'listening_practice', lectureId: params.lectureId });
      }
      await updateStreakData(user?.id || 'anonymous', pointsRef.current);
    } catch {}

    if (isSessionActivity) {
      router.replace('/lesson-session');
    } else {
      // Navigate to feedback detail
      router.push({
        pathname: '/feedback-detail',
        params: {
          scores: JSON.stringify({
            articulation: accuracy,
            fluency: accuracy,
            communication: Math.round(accuracy * 0.9),
            scenario: accuracy,
            wordsLearned: wordsLearned,
            pointsEarned: pointsRef.current,
            timeSpent,
            cefrLevel: 'B1',
          }),
          stairTitle: content?.title || 'Listening Practice',
          stairId: params.lectureId || 'listening',
          isDiscovery: 'false',
          scenario: content?.title || 'Listening Practice',
        },
      });
    }
  }, [isSessionActivity, router, stopSpeaking, afterScore, totalQuestions, wordsLearned, content, user, params.lectureId]);

  const handleNewExercise = useCallback(() => {
    stopSpeaking();
    loadContent();
  }, [stopSpeaking, loadContent]);

  // ═══ RENDER ════════════════════════════════════════

  // ─── LOADING ──────────────────────────────────────
  if (stage === 'loading') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={handleBack} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={LISTENING.teal} />
          <Text style={s.loadingText}>Generating listening exercise...</Text>
          {error && (
            <>
              <Text style={[s.loadingText, { color: LISTENING.red, marginTop: 12 }]}>
                {error}
              </Text>
              <TouchableOpacity style={s.retryBtn} onPress={loadContent}>
                <Text style={s.retryText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!content) return null;

  // ─── VOCAB PRE-SCREEN ─────────────────────────────
  if (stage === 'vocab_prescreen') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={handleBack} />
        <View style={s.stageBody}>
          <VocabularyPreScreen
            vocabulary={content.vocabulary}
            onComplete={handleVocabComplete}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── QUIZ STAGES ─────────────────────────────────
  if (stage === 'stage1_quiz') {
    // Stage 1: easier gist questions (beforeQuestions) or fallback to general questions
    const stage1Questions = content.beforeQuestions?.length
      ? content.beforeQuestions
      : content.questions;
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={handleBack} />
        <StageIndicator currentStage={1} totalStages={3} />
        <ComprehensionQuiz
          questions={stage1Questions}
          isRevealMode={false}
          onComplete={handleStage1QuizComplete}
        />
      </SafeAreaView>
    );
  }

  if (stage === 'stage3_quiz') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={handleBack} />
        <StageIndicator currentStage={3} totalStages={3} />
        <ComprehensionQuiz
          questions={shuffledQuestions || content.questions}
          isRevealMode={true}
          onComplete={handleStage3QuizComplete}
        />
      </SafeAreaView>
    );
  }

  // ─── RESULTS ──────────────────────────────────────
  if (stage === 'results') {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={handleBack} />
        <ResultsComparison
          beforeScore={beforeScore}
          afterScore={afterScore}
          totalQuestions={totalQuestions}
          points={pointsRef.current}
          wordsLearned={wordsLearned}
          timeSpent={timeSpent}
          lessonTitle={content.title}
          onNewExercise={handleNewExercise}
          onContinue={handleDone}
          continueLabel={isSessionActivity ? 'Continue Lesson' : 'Back to Practice'}
        />
      </SafeAreaView>
    );
  }

  // ─── LISTEN / LYRICS STAGES ─────────────────────
  const currentStageNum = stageToNumber(stage);
  const isListenStage = stage === 'stage1_listen' || stage === 'stage3_listen';
  const isLyricsStage = stage === 'lyrics';

  const actionLabel = isListenStage ? 'Answer Questions' : 'Next Stage';

  const handleAction = () => {
    stopSpeaking();
    switch (stage) {
      case 'stage1_listen':
        setStage('stage1_quiz');
        break;
      case 'lyrics':
        setStage('stage3_listen');
        break;
      case 'stage3_listen':
        setStage('stage3_quiz');
        break;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <Header onBack={handleBack} />

      {/* Stage indicator */}
      <StageIndicator currentStage={currentStageNum} totalStages={3} />

      {/* Main content area */}
      <View style={s.mainContent}>
        {isListenStage && (
          <PureAudioStage
            isSpeaking={isSpeaking}
            variant={stage === 'stage1_listen' ? 'listen' : 'prove'}
          />
        )}

        {isLyricsStage && (
          <LyricsSubtitleDisplay
            dialogueLines={content.dialogueLines.map((line) => ({
              speaker: line.speaker,
              text: line.text,
              translation: line.translation,
            }))}
            currentLineIndex={currentLineIndex}
            audioProgress={audioProgress}
            audioDuration={audioDuration}
            audioCurrentTime={audioCurrentTime}
          />
        )}
      </View>

      {/* Audio controls — glass bar */}
      <View style={s.audioBar}>
        <TouchableOpacity
          style={s.playBtnWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (isSpeaking) { stopSpeaking(); } else { speakDialogue(false); }
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={LISTENING.tealGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.playBtn}
          >
            <Ionicons
              name={isSpeaking ? 'stop' : 'play'}
              size={20}
              color="#FFFFFF"
            />
            <Text style={s.playBtnText}>
              {isSpeaking ? 'Stop' : 'Play Dialogue'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.slowBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (isSpeaking) { stopSpeaking(); } else { speakDialogue(true); }
          }}
          activeOpacity={0.8}
        >
          <Text style={s.slowBtnEmoji}>🐢</Text>
          <Text style={s.slowBtnText}>Slow</Text>
        </TouchableOpacity>
      </View>

      {/* Action CTA */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleAction();
          }}
          activeOpacity={0.8}
          style={s.ctaButton}
        >
          <Text style={s.ctaText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={LISTENING.teal} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── HEADER ─────────────────────────────────────────────

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={LISTENING.textPrimary} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Listening Practice</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LISTENING.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LISTENING.textPrimary,
  },
  loadingText: {
    color: LISTENING.textTertiary,
    fontSize: 14,
    marginTop: 16,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: LISTENING.glassBg,
  },
  retryText: {
    fontWeight: '600',
    fontSize: 14,
    color: LISTENING.teal,
  },

  // Stage body (vocab prescreen wrapper)
  stageBody: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Main content area (PureAudioStage or LyricsSubtitleDisplay)
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Audio controls — glass bar
  audioBar: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 214, 160, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(6, 214, 160, 0.12)',
  },
  playBtnWrap: {
    flex: 1,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  playBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  slowBtn: {
    width: 64,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  slowBtnEmoji: {
    fontSize: 18,
  },
  slowBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: LISTENING.textTertiary,
  },

  // Bottom CTA — glass outline (distinct from play button)
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 214, 160, 0.25)',
  },
  ctaText: {
    color: LISTENING.teal,
    fontSize: 16,
    fontWeight: '700',
  },
});
