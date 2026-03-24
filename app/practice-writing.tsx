/**
 * Writing Practice Screen
 *
 * AI-generated writing prompt based on user's stair scenarios.
 * Shows prompt → text input → AI feedback on submission.
 *
 * Supports two entry modes:
 * - Lesson session: discoveryContent passed via route params
 * - Practice tab: AI-generated via practiceGenerator
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { generateWritingContent, type WritingPrompt } from '@/lib/ai/practiceGenerator';
import type { WritingContent } from '@/lib/lesson/discoveryGenerator';
import { generateWithGemini } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { savePracticeScore } from '@/lib/db/competencyMetrics';
import { storeActivityCompletion } from '@/app/lesson-session';
import { updateStreakData } from '@/lib/db/sqlite';
import { analyzeWriting } from '@/lib/writing';
import type { WritingTask, TaskCategory } from '@/components/cards/writing/types';
import { useOnboardingV3 } from '@/hooks/useOnboardingV3';
import { saveWritingHistoryEntry } from '@/lib/db/writingHistory';

// ─── Palette ───
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  text: '#EEF0F6',
  sub: '#7E8BA4',
  gold: '#F59E0B',
  green: '#10B981',
  red: '#EF4444',
  blue: '#1A6DFF',
};

type Phase = 'loading' | 'prompt' | 'writing' | 'feedback';

interface WritingFeedback {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  correctedText?: string;
}

export default function PracticeWritingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    returnToSession?: string;
    activityId?: string;
    discoveryContent?: string;
    planId?: string;
    stairStepId?: string;
    scenarioId?: string;
    scenarioTitle?: string;
    scenarioPrompt?: string;
    scenarioKeyPhrases?: string;
    scenarioWordTarget?: string;
    scenarioCategory?: string;
  }>();
  const isSessionActivity = params.returnToSession === 'true';

  const [phase, setPhase] = useState<Phase>('loading');
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [userText, setUserText] = useState('');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadContent = useCallback(async () => {
    setPhase('loading');
    setError(null);
    setUserText('');
    setFeedback(null);

    try {
      // Library scenario: use passed data directly (no AI needed)
      if (params.scenarioPrompt) {
        const normalized: WritingPrompt = {
          title: params.scenarioTitle || 'Writing Practice',
          scenario: params.scenarioCategory || 'Practice',
          prompt: params.scenarioPrompt,
          keyPhrases: (params.scenarioKeyPhrases || '').split('|||').filter(Boolean),
          wordCountTarget: parseInt(params.scenarioWordTarget || '60', 10),
          exampleOpener: '',
          rubric: [],
        };
        setPrompt(normalized);
        setPhase('prompt');
        return;
      }

      // Try discovery content from route params first (lesson session mode)
      if (params.discoveryContent) {
        const parsed: WritingContent = JSON.parse(params.discoveryContent);
        // Normalize discovery WritingContent → WritingPrompt shape
        const normalized: WritingPrompt = {
          title: parsed.title,
          scenario: parsed.scenario,
          prompt: parsed.prompt,
          keyPhrases: parsed.keyPhrases || [],
          wordCountTarget: parsed.wordCountTarget || 80,
          exampleOpener: parsed.exampleOpener || '',
          rubric: [],
        };
        if (normalized.prompt && normalized.keyPhrases.length > 0) {
          setPrompt(normalized);
          setPhase('prompt');
          return;
        }
      }

      // Fall back to AI generation (practice tab mode)
      if (!user?.id) {
        setError('Sign in to generate writing exercises.');
        return;
      }

      const targetLang = useOnboardingV3.getState().target_language;
      const content = await generateWritingContent(user.id, undefined, targetLang || undefined);
      if (!content) {
        setError('Could not generate writing prompt. Check your learning path.');
        return;
      }
      setPrompt(content);
      setPhase('prompt');
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    }
  }, [params.discoveryContent, user?.id]);

  // Initial load
  useEffect(() => {
    loadContent();
  }, []);

  const handleStartWriting = () => setPhase('writing');

  const handleSubmit = useCallback(async () => {
    if (!prompt || !userText.trim() || submitting) return;
    setSubmitting(true);
    try {
      // ── Build WritingTask from current prompt for the analyzer ──
      const onboardingState = useOnboardingV3.getState();
      const targetLanguage = onboardingState.target_language || 'en';
      const rawLevel = onboardingState.proficiency_level || 'starting_fresh';
      // Map onboarding proficiency to analyzer's 3-tier scale
      const userLevel: 'beginner' | 'intermediate' | 'advanced' =
        rawLevel === 'starting_fresh' || rawLevel === 'basics'
          ? 'beginner'
          : rawLevel === 'conversational'
            ? 'intermediate'
            : 'advanced';

      // Determine a reasonable task category from the prompt content
      const categoryMap: Record<string, TaskCategory> = {
        email: 'email', message: 'message', travel: 'travel',
        interview: 'job_interview', story: 'story', opinion: 'opinion',
        introduction: 'self_introduction', routine: 'daily_routine',
      };
      let taskCategory: TaskCategory = 'custom';
      const lowerScenario = (prompt.scenario || '').toLowerCase();
      for (const [keyword, cat] of Object.entries(categoryMap)) {
        if (lowerScenario.includes(keyword)) { taskCategory = cat; break; }
      }

      const writingTask: WritingTask = {
        id: `practice-${Date.now()}`,
        title: prompt.title,
        category: taskCategory,
        scenario: prompt.scenario,
        goal: prompt.prompt,
        recommendations: prompt.keyPhrases,
        targetLanguage,
        minWords: 5,
        maxWords: prompt.wordCountTarget * 2,
        difficulty: userLevel,
      };

      // ── Call the dedicated writing analyzer ──
      const analysis = await analyzeWriting({
        text: userText,
        task: writingTask,
        targetLanguage,
        userLevel,
      });

      // ── Map WritingAnalysis → WritingFeedback for the UI ──
      const overallScore = Math.round(
        (analysis.grammarScore + analysis.vocabularyScore + analysis.clarityScore) / 3
      );

      // Build a corrected text string: prefer analyzer's correctedText,
      // fall back to assembling from corrections array
      const correctedText = analysis.correctedText || undefined;

      setFeedback({
        score: overallScore,
        summary: analysis.overallFeedback,
        strengths: analysis.strengths,
        improvements: analysis.areasToImprove,
        correctedText,
      });

      setPhase('feedback');

      // ── Save KPIs with accurate per-dimension mapping ──
      if (user?.id) {
        savePracticeScore(user.id, 'writing', {
          articulation: analysis.grammarScore,     // writing accuracy = articulation proxy
          communication: analysis.vocabularyScore, // word choice = communication proxy
          fluency: analysis.clarityScore,          // clear writing = fluency proxy
          scenario: overallScore,                  // overall = scenario competency
        }).catch(() => {});
      }
      // Persist points: 15 base + score bonus (writing is harder)
      if (user?.id) {
        const writePoints = 15 + Math.round(overallScore / 10);
        updateStreakData(user.id, writePoints).catch(() => {});
      }
      // Signal lesson-session if we're inside a lesson
      if (isSessionActivity && params.activityId) {
        storeActivityCompletion(params.activityId, overallScore).catch(() => {});
      }

      // Persist writing session for later review
      saveWritingHistoryEntry({
        id: `writing_${Date.now()}`,
        timestamp: Date.now(),
        prompt: { title: prompt.title, scenario: prompt.scenario, prompt: prompt.prompt },
        userText,
        feedback: {
          score: overallScore,
          summary: analysis.overallFeedback,
          strengths: analysis.strengths,
          improvements: analysis.areasToImprove,
          correctedText,
        },
        stairStepId: params.stairStepId,
      }).catch(() => {});
    } catch (err) {
      console.error('[Writing] Analyzer failed, using inline fallback:', err);
      // ── Fallback: use generic Gemini prompt if analyzer fails ──
      let fallbackScore = 65;
      let fallbackFeedback: WritingFeedback = {
        score: 65,
        summary: 'Could not generate detailed feedback. Keep writing!',
        strengths: ['You completed the writing exercise'],
        improvements: ['Practice with more writing prompts'],
      };
      try {
        const feedbackPrompt = `You are a language tutor evaluating a student's writing.

## Writing Prompt Given:
${sanitizePromptInput(prompt.prompt)}

## Key Phrases to Use:
${prompt.keyPhrases.join(', ')}

## Student's Writing:
${sanitizePromptInput(userText)}

## Evaluate:
- Score from 0-100
- 2-3 strengths
- 2-3 specific improvements
- Provide a corrected version if there are errors

Respond in JSON:
{
  "score": 75,
  "summary": "Brief overall assessment",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "correctedText": "Corrected version of their text..."
}`;
        const raw = await generateWithGemini(feedbackPrompt);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as WritingFeedback;
          fallbackFeedback = parsed;
          fallbackScore = parsed.score || 65;
        } else {
          fallbackFeedback = {
            score: 65,
            summary: 'Your writing shows effort. Keep practicing!',
            strengths: ['You attempted the writing task', 'Good effort with vocabulary'],
            improvements: ['Try using more key phrases', 'Review grammar patterns'],
          };
        }
      } catch {
        // fallbackFeedback already set to default above
      }
      setFeedback(fallbackFeedback);
      setPhase('feedback');
      if (user?.id) {
        savePracticeScore(user.id, 'writing', {
          articulation: fallbackScore, communication: fallbackScore,
          fluency: Math.round(fallbackScore * 0.85), scenario: Math.round(fallbackScore * 0.8),
        }).catch(() => {});
      }
      if (user?.id) {
        const writePoints = 15 + Math.round(fallbackScore / 10);
        updateStreakData(user.id, writePoints).catch(() => {});
      }
      if (isSessionActivity && params.activityId) {
        storeActivityCompletion(params.activityId, fallbackScore).catch(() => {});
      }

      // Persist writing session for later review (fallback path)
      saveWritingHistoryEntry({
        id: `writing_${Date.now()}`,
        timestamp: Date.now(),
        prompt: { title: prompt.title, scenario: prompt.scenario, prompt: prompt.prompt },
        userText,
        feedback: {
          score: fallbackFeedback.score,
          summary: fallbackFeedback.summary,
          strengths: fallbackFeedback.strengths,
          improvements: fallbackFeedback.improvements,
          correctedText: fallbackFeedback.correctedText,
        },
        stairStepId: params.stairStepId,
      }).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  }, [prompt, userText, submitting]);

  /** Confirm before exiting when inside a lesson session */
  const handleBack = useCallback(() => {
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
  }, [isSessionActivity, router]);

  // Return to lesson session or practice tab
  const handleDone = useCallback(async () => {
    // Mark scenario as completed in library
    if (params.scenarioId) {
      try {
        const raw = await AsyncStorage.getItem('vox_writing_library_completed');
        const completed = raw ? JSON.parse(raw) : [];
        if (!completed.includes(params.scenarioId)) {
          completed.push(params.scenarioId);
          await AsyncStorage.setItem('vox_writing_library_completed', JSON.stringify(completed));
        }
      } catch {}
    }

    if (isSessionActivity) {
      router.replace('/lesson-session');
    } else {
      // Navigate to feedback detail with real scores
      router.push({
        pathname: '/feedback-detail',
        params: {
          scores: JSON.stringify({
            articulation: feedback?.score || 0,
            fluency: feedback?.score ? Math.round(feedback.score * 0.9) : 0,
            communication: feedback?.score || 0,
            scenario: feedback?.score || 0,
            wordsLearned: userText.trim().split(/\s+/).filter(Boolean).length,
            pointsEarned: feedback?.score ? 15 + Math.round(feedback.score / 10) : 0,
            timeSpent: 0,
            cefrLevel: feedback?.score && feedback.score >= 80 ? 'B2' : feedback?.score && feedback.score >= 60 ? 'B1' : 'A2',
          }),
          stairTitle: prompt?.title || 'Writing Practice',
          stairId: params.scenarioId || 'writing',
          isDiscovery: 'false',
          scenario: prompt?.title || 'Writing Practice',
        },
      });
    }
  }, [isSessionActivity, router, feedback, userText, prompt, params.scenarioId]);

  const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;

  // ═══ LOADING ═══
  if (phase === 'loading') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={handleBack} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={s.loadingText}>Generating your writing prompt...</Text>
          {error && <Text style={[s.loadingText, { color: C.red, marginTop: 12 }]}>{error}</Text>}
          {error && (
            <TouchableOpacity style={s.retryBtn} onPress={loadContent}>
              <Text style={s.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!prompt) return null;

  // ═══ PROMPT PHASE ═══
  if (phase === 'prompt') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={handleBack} />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={s.title}>{prompt.title}</Text>

            <View style={s.scenarioCard}>
              <Text style={s.scenarioLabel}>SCENARIO</Text>
              <Text style={s.scenarioText}>{prompt.scenario}</Text>
            </View>

            <View style={s.promptCard}>
              <Text style={s.promptLabel}>YOUR TASK</Text>
              <Text style={s.promptText}>{prompt.prompt}</Text>
              <Text style={s.targetCount}>Target: ~{prompt.wordCountTarget} words</Text>
            </View>

            {/* Key phrases */}
            <View style={s.phrasesSection}>
              <Text style={s.phrasesLabel}>Try to use these phrases:</Text>
              {prompt.keyPhrases.map((phrase, i) => (
                <View key={i} style={s.phraseRow}>
                  <View style={s.phraseNum}>
                    <Text style={s.phraseNumText}>{i + 1}</Text>
                  </View>
                  <Text style={s.phraseText}>{phrase}</Text>
                </View>
              ))}
            </View>

            {/* Example opener */}
            {prompt.exampleOpener && (
              <View style={s.openerCard}>
                <Text style={s.openerLabel}>Example opening:</Text>
                <Text style={s.openerText}>"{prompt.exampleOpener}"</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={s.bottomBar}>
          <TouchableOpacity onPress={handleStartWriting} activeOpacity={0.8}>
            <LinearGradient colors={[C.gold, '#D97706']} style={s.ctaBtn}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={s.ctaText}>Start Writing</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ═══ WRITING PHASE ═══
  if (phase === 'writing') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => setPhase('prompt')} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={60}
        >
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={s.miniPrompt}>{prompt.prompt}</Text>

              {/* Key phrases reminder */}
              <View style={s.phraseReminder}>
                {prompt.keyPhrases.map((p, i) => (
                  <Text key={i} style={s.phraseReminderText}>{p}</Text>
                ))}
              </View>

              {/* Text input */}
              <TextInput
                style={s.textInput}
                value={userText}
                onChangeText={setUserText}
                placeholder="Start writing here..."
                placeholderTextColor={C.sub + '60'}
                multiline
                textAlignVertical="top"
                autoFocus
              />

              <View style={s.wordCountRow}>
                <Text style={[
                  s.wordCountText,
                  wordCount >= prompt.wordCountTarget && { color: C.green },
                ]}>
                  {wordCount} / {prompt.wordCountTarget} words
                </Text>
              </View>
            </Animated.View>
          </ScrollView>

          <View style={s.bottomBar}>
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={wordCount < 5 || submitting}
            >
              <LinearGradient
                colors={wordCount >= 5 ? [C.gold, '#D97706'] : ['#333', '#222']}
                style={s.ctaBtn}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={s.ctaText}>Submit for Feedback</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ═══ FEEDBACK PHASE ═══
  return (
    <SafeAreaView style={s.container}>
      <Header onBack={handleBack} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)}>
          {/* Score */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={[s.scoreCircle, {
              borderColor: (feedback?.score || 0) >= 80 ? C.green
                : (feedback?.score || 0) >= 50 ? C.gold : C.red,
            }]}>
              <Text style={[s.scoreNum, {
                color: (feedback?.score || 0) >= 80 ? C.green
                  : (feedback?.score || 0) >= 50 ? C.gold : C.red,
              }]}>
                {feedback?.score || 0}
              </Text>
            </View>
            <Text style={s.scoreSummary}>{feedback?.summary}</Text>
          </View>

          {/* Strengths */}
          {feedback?.strengths && feedback.strengths.length > 0 && (
            <View style={s.feedbackSection}>
              <Text style={[s.feedbackLabel, { color: C.green }]}>Strengths</Text>
              {feedback.strengths.map((s2, i) => (
                <View key={i} style={s.feedbackRow}>
                  <Ionicons name="checkmark-circle" size={16} color={C.green} />
                  <Text style={s.feedbackText}>{s2}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Improvements */}
          {feedback?.improvements && feedback.improvements.length > 0 && (
            <View style={s.feedbackSection}>
              <Text style={[s.feedbackLabel, { color: C.gold }]}>To Improve</Text>
              {feedback.improvements.map((imp, i) => (
                <View key={i} style={s.feedbackRow}>
                  <Ionicons name="trending-up" size={16} color={C.gold} />
                  <Text style={s.feedbackText}>{imp}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Corrected text */}
          {feedback?.correctedText && (
            <View style={[s.scenarioCard, { marginTop: 16 }]}>
              <Text style={s.scenarioLabel}>CORRECTED VERSION</Text>
              <Text style={[s.scenarioText, { lineHeight: 24 }]}>{feedback.correctedText}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={{ gap: 12, marginTop: 24 }}>
            <TouchableOpacity onPress={loadContent} activeOpacity={0.8}>
              <LinearGradient colors={[C.gold, '#D97706']} style={s.ctaBtn}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={s.ctaText}>New Writing Task</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDone}
              style={[s.ctaBtn, { backgroundColor: C.card }]}
            >
              <Text style={[s.ctaText, { color: C.sub }]}>
                {isSessionActivity ? 'Continue Lesson' : 'Back to Practice'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── HEADER ───
function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={C.text} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Writing Practice</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

// ─── STYLES ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },

  loadingText: { color: C.sub, fontSize: 14, marginTop: 16 },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 10, backgroundColor: C.card,
  },
  retryText: { color: C.gold, fontWeight: '600', fontSize: 14 },

  title: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 16 },

  scenarioCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 12,
  },
  scenarioLabel: {
    fontSize: 9, fontWeight: '700', color: C.sub,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
  },
  scenarioText: { fontSize: 15, color: C.text, lineHeight: 22 },

  promptCard: {
    backgroundColor: C.gold + '10', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.gold + '25', marginBottom: 16,
  },
  promptLabel: {
    fontSize: 9, fontWeight: '700', color: C.gold,
    letterSpacing: 0.8, marginBottom: 6,
  },
  promptText: { fontSize: 16, fontWeight: '600', color: C.text, lineHeight: 24 },
  targetCount: { fontSize: 12, color: C.sub, marginTop: 8 },

  phrasesSection: { marginBottom: 16 },
  phrasesLabel: { fontSize: 13, fontWeight: '600', color: C.sub, marginBottom: 10 },
  phraseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  phraseNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.gold + '20', alignItems: 'center', justifyContent: 'center',
  },
  phraseNumText: { fontSize: 11, fontWeight: '700', color: C.gold },
  phraseText: { fontSize: 14, color: C.text, flex: 1 },

  openerCard: {
    backgroundColor: C.blue + '10', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: C.blue + '20',
  },
  openerLabel: { fontSize: 11, fontWeight: '600', color: C.sub, marginBottom: 4 },
  openerText: { fontSize: 14, fontStyle: 'italic', color: C.text },

  bottomBar: { padding: 20, paddingBottom: 10 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 16,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  miniPrompt: { fontSize: 14, color: C.sub, marginBottom: 12 },
  phraseReminder: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16,
  },
  phraseReminderText: {
    fontSize: 11, color: C.gold, backgroundColor: C.gold + '12',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },

  textInput: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, color: C.text,
    fontSize: 16, lineHeight: 24, minHeight: 200, maxHeight: 400,
  },
  wordCountRow: { alignItems: 'flex-end', marginTop: 8 },
  wordCountText: { fontSize: 12, fontWeight: '600', color: C.sub },

  scoreCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'transparent', borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontSize: 28, fontWeight: '900' },
  scoreSummary: { fontSize: 14, color: C.text, marginTop: 12, textAlign: 'center' },

  feedbackSection: { marginBottom: 16 },
  feedbackLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  feedbackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  feedbackText: { fontSize: 14, color: C.text, flex: 1, lineHeight: 20 },
});
