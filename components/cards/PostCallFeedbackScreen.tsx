/**
 * Post-Call Feedback Screen - Premium Redesign
 *
 * Comprehensive feedback screen with real metrics after voice practice.
 * Serves as the template for all practice feedback screens.
 *
 * Features:
 * - Animated score ring with color-coded performance
 * - 4-stat grid with session metrics
 * - Words to practice section with word bank integration
 * - Highlights section showing best moments
 * - Improvement tips section
 * - Practice again / Continue actions
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography } from '@/constants/designSystem';
import { ConversationMessage } from '@/lib/voice';
import { LottieSuccess } from '@/components/animations';
import {
  ScoreRing,
  StatsGrid,
  FeedbackSection,
  WordsToPractice,
  getScoreColor,
} from '@/components/feedback';
import type { StatItem, WordToPractice } from '@/components/feedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// Types
// =============================================================================

export interface PostCallFeedbackScreenProps {
  /** Conversation duration in seconds */
  duration: number;
  /** All conversation messages */
  messages: ConversationMessage[];
  /** Scenario title for display */
  scenarioTitle: string;
  /** Character name (optional) */
  characterName?: string;
  /** Callback to practice again */
  onPracticeAgain: () => void;
  /** Callback when done */
  onDone: () => void;
  /** Optional callback to practice weak words */
  onPracticeWords?: (words: WordToPractice[]) => void;
}

interface AnalysisResult {
  overallScore: number;
  stats: StatItem[];
  wordsToPractice: WordToPractice[];
  highlights: string[];
  tips: string[];
}

// =============================================================================
// Analysis Engine
// =============================================================================

function analyzeConversation(
  messages: ConversationMessage[],
  duration: number
): AnalysisResult {
  const userMessages = messages.filter((m) => m.role === 'user');
  const aiMessages = messages.filter((m) => m.role === 'assistant');

  // Default result for empty conversations
  if (userMessages.length === 0) {
    return {
      overallScore: 50,
      stats: [
        { icon: '🎯', value: '50', label: 'Accuracy', color: colors.warning.DEFAULT },
        { icon: '💬', value: '0', label: 'Turns' },
        { icon: '⏱️', value: formatDuration(duration), label: 'Duration' },
        { icon: '📝', value: '0', label: 'Words' },
      ],
      wordsToPractice: [],
      highlights: ['Start speaking to get feedback!'],
      tips: ['Try responding to the AI to practice your conversation skills.'],
    };
  }

  // Calculate metrics
  const totalWords = userMessages.reduce(
    (sum, m) => sum + m.content.split(/\s+/).filter((w) => w.length > 0).length,
    0
  );
  const avgWordsPerTurn = totalWords / userMessages.length;
  const exchanges = Math.min(userMessages.length, aiMessages.length);

  // Fluency score (word count and turn length)
  const wordScore = Math.min(avgWordsPerTurn / 12, 1) * 40;
  const turnScore = Math.min(exchanges / 8, 1) * 30;

  // Confidence score (lack of hesitation markers)
  const hesitantCount = userMessages.filter((m) =>
    /\b(um|uh|hmm|err|i don't know|no sé|este|pues)\b/i.test(m.content)
  ).length;
  const hesitationPenalty = (hesitantCount / userMessages.length) * 20;
  const confidenceBonus = 30 - hesitationPenalty;

  // Overall score
  const overallScore = Math.round(
    Math.min(100, Math.max(0, wordScore + turnScore + confidenceBonus))
  );

  // Generate words to practice (simulated - in production this comes from speech analysis)
  const wordsToPractice = generateWordsToPractice(userMessages);

  // Generate highlights
  const highlights = generateHighlights(userMessages, exchanges);

  // Generate tips
  const tips = generateTips(overallScore, avgWordsPerTurn, hesitantCount, exchanges);

  return {
    overallScore,
    stats: [
      {
        icon: '🎯',
        value: overallScore.toString(),
        label: 'Accuracy',
        color: getScoreColor(overallScore),
      },
      { icon: '💬', value: exchanges.toString(), label: 'Turns' },
      { icon: '⏱️', value: formatDuration(duration), label: 'Duration' },
      { icon: '📝', value: totalWords.toString(), label: 'Words' },
    ],
    wordsToPractice,
    highlights,
    tips,
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function generateWordsToPractice(messages: ConversationMessage[]): WordToPractice[] {
  // In production, this would come from real speech recognition analysis
  // For now, we simulate by detecting common difficult words
  const difficultPatterns = [
    { pattern: /restaurante/gi, word: 'restaurante', issue: 'Try softer R sound', phonetic: 'res-tau-RAN-te' },
    { pattern: /gracias/gi, word: 'gracias', issue: 'Emphasize the S', phonetic: 'GRA-sias' },
    { pattern: /por favor/gi, word: 'por favor', issue: 'Connect the words smoothly', phonetic: 'por-fa-VOR' },
    { pattern: /buenos días/gi, word: 'buenos días', issue: 'Watch the accent on días', phonetic: 'BWE-nos DEE-as' },
    { pattern: /¿cómo estás\?/gi, word: 'cómo estás', issue: 'Rising intonation on estás', phonetic: 'KO-mo es-TAS' },
  ];

  const allText = messages.map((m) => m.content).join(' ');
  const foundWords: WordToPractice[] = [];

  difficultPatterns.forEach((item) => {
    if (item.pattern.test(allText)) {
      foundWords.push({
        word: item.word,
        issue: item.issue,
        severity: Math.random() > 0.5 ? 'moderate' : 'minor',
        phonetic: item.phonetic,
      });
    }
  });

  // Limit to 4 words max
  return foundWords.slice(0, 4);
}

function generateHighlights(
  messages: ConversationMessage[],
  exchanges: number
): string[] {
  const highlights: string[] = [];

  if (exchanges >= 5) {
    highlights.push('Great conversation flow! You kept the dialogue going naturally.');
  }

  const longResponses = messages.filter((m) => m.content.split(' ').length > 10);
  if (longResponses.length > 0) {
    highlights.push('Excellent use of longer, more detailed responses.');
  }

  const questions = messages.filter((m) => m.content.includes('?'));
  if (questions.length > 0) {
    highlights.push('Good job asking questions to keep the conversation interactive!');
  }

  if (highlights.length === 0) {
    highlights.push('You completed the practice session - keep it up!');
  }

  return highlights.slice(0, 3);
}

function generateTips(
  score: number,
  avgWords: number,
  hesitations: number,
  exchanges: number
): string[] {
  const tips: string[] = [];

  if (avgWords < 8) {
    tips.push('Try giving longer responses to practice more vocabulary.');
  }

  if (hesitations > 2) {
    tips.push('Practice common phrases to reduce hesitation words like "um" or "uh".');
  }

  if (exchanges < 4) {
    tips.push('Aim for at least 4-5 exchanges to get meaningful practice.');
  }

  if (score < 60) {
    tips.push('Focus on speaking clearly, even if you speak more slowly.');
  }

  if (tips.length === 0) {
    tips.push('Keep practicing to maintain your excellent progress!');
  }

  return tips.slice(0, 3);
}

// =============================================================================
// Main Component
// =============================================================================

export const PostCallFeedbackScreen: React.FC<PostCallFeedbackScreenProps> = ({
  duration,
  messages,
  scenarioTitle,
  characterName,
  onPracticeAgain,
  onDone,
  onPracticeWords,
}) => {
  const insets = useSafeAreaInsets();
  const [showSuccess, setShowSuccess] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    transcript: false, // Collapsed by default for cleaner initial view
    words: true,
    highlights: true,
    tips: true,
  });

  // Analyze conversation
  const analysis = useMemo(() => {
    return analyzeConversation(messages, duration);
  }, [messages, duration]);

  // Hide celebration after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddToWordBank = (words: WordToPractice[]) => {
    if (onPracticeWords) {
      onPracticeWords(words);
    }
    // TODO: Actually add to word bank via database
    console.log('[Feedback] Adding to word bank:', words);
  };

  return (
    <View style={styles.container}>
      {/* Success Animation Overlay */}
      {showSuccess && (
        <Animated.View entering={FadeIn} style={styles.successOverlay}>
          <LottieSuccess message="Great Practice!" />
        </Animated.View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInDown.delay(2000).duration(500)}
          style={styles.heroSection}
        >
          <ScoreRing
            score={analysis.overallScore}
            size={150}
            strokeWidth={12}
            delay={2200}
          />

          <Text style={styles.scenarioTitle}>{scenarioTitle}</Text>
          <Text style={styles.scenarioMeta}>
            {characterName ? `with ${characterName} • ` : ''}
            {formatDuration(duration)}
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          entering={FadeInUp.delay(2400).duration(400)}
          style={styles.statsSection}
        >
          <StatsGrid stats={analysis.stats} delay={2600} stagger={80} />
        </Animated.View>

        {/* Full Transcript Section - Detailed View */}
        {messages.length > 0 && (
          <Animated.View entering={FadeInUp.delay(2600).duration(400)}>
            <FeedbackSection
              icon="📜"
              title="Full Transcript"
              badge={messages.length}
              badgeColor={colors.primary.DEFAULT}
              expanded={expandedSections.transcript}
              onToggle={() => toggleSection('transcript')}
            >
              <View style={styles.transcriptContainer}>
                {messages.map((message, index) => (
                  <View
                    key={message.id || index}
                    style={[
                      styles.messageBubble,
                      message.role === 'user'
                        ? styles.userMessage
                        : styles.aiMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageRole,
                        message.role === 'user'
                          ? styles.userRole
                          : styles.aiRole,
                      ]}
                    >
                      {message.role === 'user' ? '👤 You' : '🤖 AI'}
                    </Text>
                    <Text style={styles.messageContent}>{message.content}</Text>
                  </View>
                ))}
              </View>
            </FeedbackSection>
          </Animated.View>
        )}

        {/* Words to Practice Section */}
        {analysis.wordsToPractice.length > 0 && (
          <Animated.View entering={FadeInUp.delay(2800).duration(400)}>
            <FeedbackSection
              icon="🎯"
              title="Words to Practice"
              badge={analysis.wordsToPractice.length}
              badgeColor={colors.warning.DEFAULT}
              expanded={expandedSections.words}
              onToggle={() => toggleSection('words')}
            >
              <WordsToPractice
                words={analysis.wordsToPractice}
                onAddToWordBank={handleAddToWordBank}
              />
            </FeedbackSection>
          </Animated.View>
        )}

        {/* Highlights Section */}
        <Animated.View entering={FadeInUp.delay(3000).duration(400)}>
          <FeedbackSection
            icon="⭐"
            title="Highlights"
            expanded={expandedSections.highlights}
            onToggle={() => toggleSection('highlights')}
          >
            <View style={styles.listSection}>
              {analysis.highlights.map((highlight, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.listItemText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </FeedbackSection>
        </Animated.View>

        {/* Tips Section */}
        <Animated.View entering={FadeInUp.delay(3200).duration(400)}>
          <FeedbackSection
            icon="💡"
            title="Tips for Next Time"
            expanded={expandedSections.tips}
            onToggle={() => toggleSection('tips')}
          >
            <View style={styles.listSection}>
              {analysis.tips.map((tip, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={[styles.bulletPoint, styles.tipBullet]} />
                  <Text style={styles.listItemText}>{tip}</Text>
                </View>
              ))}
            </View>
          </FeedbackSection>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions - Fixed */}
      <Animated.View
        entering={FadeInUp.delay(3400).duration(400)}
        style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onPracticeAgain}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color={colors.text.secondary} />
          <Text style={styles.secondaryButtonText}>Practice Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onDone}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  scenarioMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  // Stats Section
  statsSection: {
    marginBottom: spacing.lg,
  },

  // Transcript Section
  transcriptContainer: {
    gap: spacing.md,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: '95%',
  },
  userMessage: {
    backgroundColor: colors.primary.DEFAULT + '20',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: colors.background.elevated,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageRole: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userRole: {
    color: colors.primary.DEFAULT,
  },
  aiRole: {
    color: colors.text.tertiary,
  },
  messageContent: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // List Sections (Highlights & Tips)
  listSection: {
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary.DEFAULT,
    marginTop: 6,
  },
  tipBullet: {
    backgroundColor: colors.primary.DEFAULT,
  },
  listItemText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.background.card,
    gap: spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border?.light || 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  primaryButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PostCallFeedbackScreen;
