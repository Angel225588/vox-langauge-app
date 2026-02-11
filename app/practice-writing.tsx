/**
 * Writing Practice Screen
 *
 * AI-generated writing prompt based on user's stair scenarios.
 * Shows prompt → text input → AI feedback on submission.
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { generateWritingContent, type WritingPrompt } from '@/lib/ai/practiceGenerator';
import { generateWithGemini } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { savePracticeScore } from '@/lib/db/competencyMetrics';

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

  const [phase, setPhase] = useState<Phase>('loading');
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [userText, setUserText] = useState('');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadContent();
  }, [user?.id]);

  const loadContent = useCallback(async () => {
    if (!user?.id) return;
    setPhase('loading');
    setError(null);
    setUserText('');
    setFeedback(null);
    try {
      const content = await generateWritingContent(user.id);
      if (!content) {
        setError('Could not generate writing prompt. Check your learning path.');
        return;
      }
      setPrompt(content);
      setPhase('prompt');
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    }
  }, [user?.id]);

  const handleStartWriting = () => setPhase('writing');

  const handleSubmit = useCallback(async () => {
    if (!prompt || !userText.trim() || submitting) return;
    setSubmitting(true);
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
      let resultScore = 70;
      // Extract JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as WritingFeedback;
        setFeedback(parsed);
        resultScore = parsed.score || 70;
      } else {
        setFeedback({
          score: 70,
          summary: 'Your writing shows effort. Keep practicing!',
          strengths: ['You attempted the writing task', 'Good effort with vocabulary'],
          improvements: ['Try using more key phrases', 'Review grammar patterns'],
        });
      }
      setPhase('feedback');
      // Save score to competency metrics
      if (user?.id) {
        savePracticeScore(user.id, 'writing', {
          articulation: resultScore,
          communication: resultScore,
          fluency: Math.round(resultScore * 0.85),
          scenario: Math.round(resultScore * 0.8),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('[Writing] Feedback generation failed:', err);
      setFeedback({
        score: 65,
        summary: 'Could not generate detailed feedback. Keep writing!',
        strengths: ['You completed the writing exercise'],
        improvements: ['Practice with more writing prompts'],
      });
      setPhase('feedback');
      if (user?.id) {
        savePracticeScore(user.id, 'writing', {
          articulation: 65, communication: 65, fluency: 55, scenario: 52,
        }).catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  }, [prompt, userText, submitting]);

  const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;

  // ═══ LOADING ═══
  if (phase === 'loading') {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />
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
        <Header onBack={() => router.back()} />
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
      <Header onBack={() => router.back()} />
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
              onPress={() => router.back()}
              style={[s.ctaBtn, { backgroundColor: C.card }]}
            >
              <Text style={[s.ctaText, { color: C.sub }]}>Back to Practice</Text>
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
