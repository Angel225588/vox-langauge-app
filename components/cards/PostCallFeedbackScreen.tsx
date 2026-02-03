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
import * as Haptics from 'expo-haptics';
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
import { getEncouragement } from '@/components/feedback/types';
import { TranscriptPage } from './TranscriptPage';

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

/**
 * Structured improvement item for "Areas to Improve" section
 */
interface ImprovementItem {
  area: 'Vocabulary' | 'Fluency' | 'Grammar' | 'Confidence';
  observation: string;
  suggestion: string;
  severity: 'minor' | 'moderate' | 'significant';
}

interface AnalysisResult {
  overallScore: number;
  /** Short 1-2 sentence summary (always visible) */
  summary: string;
  stats: StatItem[];
  wordsToPractice: WordToPractice[];
  /** Renamed from tips - positive feedback */
  highlights: string[];
  /** Structured improvement areas */
  improvements: ImprovementItem[];
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
      summary: 'Start speaking to get personalized feedback!',
      stats: [
        { icon: '🎯', value: '50', label: 'Accuracy', color: colors.warning.DEFAULT },
        { icon: '💬', value: '0', label: 'Turns' },
        { icon: '⏱️', value: formatDuration(duration), label: 'Duration' },
        { icon: '📝', value: '0', label: 'Words' },
      ],
      wordsToPractice: [],
      highlights: ['Start speaking to get feedback!'],
      improvements: [],
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

  // Generate structured improvements
  const improvements = generateImprovements(overallScore, avgWordsPerTurn, hesitantCount, exchanges);

  // Generate summary
  const summary = generateSummary(duration, exchanges, overallScore, avgWordsPerTurn);

  return {
    overallScore,
    summary,
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
    improvements,
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

/**
 * Generate a concise summary of the conversation (always visible)
 */
function generateSummary(
  duration: number,
  exchanges: number,
  score: number,
  avgWords: number
): string {
  const minutes = Math.floor(duration / 60);
  const durationText = minutes > 0 ? `${minutes}-minute` : `${duration}-second`;

  // Determine strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (score >= 70) strengths.push('fluency');
  else if (score < 50) weaknesses.push('fluency');

  if (avgWords >= 10) strengths.push('vocabulary');
  else if (avgWords < 5) weaknesses.push('vocabulary');

  if (exchanges >= 5) strengths.push('engagement');
  else if (exchanges < 3) weaknesses.push('conversation flow');

  // Build summary
  if (strengths.length > 0 && weaknesses.length === 0) {
    return `${durationText} conversation. ${strengths.join(' and ')} excellent!`;
  } else if (weaknesses.length > 0 && strengths.length === 0) {
    return `${durationText} practice session. Focus on ${weaknesses.join(' and ')} next time.`;
  } else if (strengths.length > 0 && weaknesses.length > 0) {
    return `${durationText} conversation. ${strengths[0]} good, ${weaknesses[0]} needs work.`;
  }

  return `${durationText} conversation with ${exchanges} exchanges. Keep practicing!`;
}

/**
 * Generate structured improvement items for "Areas to Improve" section
 */
function generateImprovements(
  score: number,
  avgWords: number,
  hesitations: number,
  exchanges: number
): ImprovementItem[] {
  const improvements: ImprovementItem[] = [];

  // Hesitation / Confidence issues
  if (hesitations > 2) {
    improvements.push({
      area: 'Confidence',
      observation: `You used ${hesitations} hesitation words (um, uh, etc.)`,
      suggestion: 'Practice common phrases to build confidence and speak more smoothly',
      severity: hesitations > 4 ? 'significant' : 'moderate',
    });
  }

  // Short responses / Vocabulary issues
  if (avgWords < 8) {
    improvements.push({
      area: 'Vocabulary',
      observation: `Your responses averaged ${Math.round(avgWords)} words`,
      suggestion: 'Try adding details: describe colors, sizes, preferences, or reasons',
      severity: avgWords < 5 ? 'significant' : 'moderate',
    });
  }

  // Few exchanges / Fluency issues
  if (exchanges < 4) {
    improvements.push({
      area: 'Fluency',
      observation: `Conversation had only ${exchanges} exchanges`,
      suggestion: 'Keep the conversation going by asking follow-up questions',
      severity: exchanges < 2 ? 'significant' : 'moderate',
    });
  }

  // Low overall score / Grammar issues (inferred)
  if (score < 60 && improvements.length < 3) {
    improvements.push({
      area: 'Grammar',
      observation: 'Some responses may have had grammar issues',
      suggestion: 'Focus on speaking clearly with simple sentence structures',
      severity: score < 40 ? 'significant' : 'moderate',
    });
  }

  // Code-switching detection (basic check)
  // In production, this would come from speech analysis

  return improvements.slice(0, 4); // Max 4 improvements
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
  const [showTranscript, setShowTranscript] = useState(false);
  // All sections collapsed by default - user expands what they want
  const [expandedSections, setExpandedSections] = useState({
    words: false,
    highlights: false,
    improvements: false,
    tips: false,
  });

  const handleOpenTranscript = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTranscript(true);
  };

  // Analyze conversation
  const analysis = useMemo(() => {
    return analyzeConversation(messages, duration);
  }, [messages, duration]);

  // Get encouragement based on score
  const encouragement = useMemo(() => {
    return getEncouragement(analysis.overallScore);
  }, [analysis.overallScore]);

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

          {/* Encouragement Message */}
          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementEmoji}>{encouragement.emoji}</Text>
            <Text style={styles.encouragementText}>{encouragement.message}</Text>
          </View>

          <Text style={styles.scenarioTitle}>{scenarioTitle}</Text>
          <Text style={styles.scenarioMeta}>
            {characterName ? `with ${characterName} • ` : ''}
            {formatDuration(duration)}
          </Text>

          {/* Summary - Always visible */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          entering={FadeInUp.delay(2400).duration(400)}
          style={styles.statsSection}
        >
          <StatsGrid stats={analysis.stats} delay={2600} stagger={80} />
        </Animated.View>

        {/* View Transcript Button */}
        {messages.length > 0 && (
          <Animated.View entering={FadeInUp.delay(2600).duration(400)}>
            <TouchableOpacity
              style={styles.transcriptButton}
              onPress={handleOpenTranscript}
              activeOpacity={0.8}
            >
              <View style={styles.transcriptButtonContent}>
                <View style={styles.transcriptIcon}>
                  <Ionicons name="document-text-outline" size={22} color={colors.primary.DEFAULT} />
                </View>
                <View style={styles.transcriptButtonText}>
                  <Text style={styles.transcriptButtonTitle}>View Full Transcript</Text>
                  <Text style={styles.transcriptButtonSubtitle}>
                    {messages.length} messages • {Math.min(messages.filter(m => m.role === 'user').length, messages.filter(m => m.role === 'assistant').length)} turns
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>
            </TouchableOpacity>
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

        {/* What Went Well Section (renamed from Highlights) */}
        <Animated.View entering={FadeInUp.delay(3000).duration(400)}>
          <FeedbackSection
            icon="✨"
            title="What Went Well"
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

        {/* Areas to Improve Section */}
        {analysis.improvements.length > 0 && (
          <Animated.View entering={FadeInUp.delay(3200).duration(400)}>
            <FeedbackSection
              icon="📈"
              title="Areas to Improve"
              badge={analysis.improvements.length}
              badgeColor={colors.warning.DEFAULT}
              expanded={expandedSections.improvements}
              onToggle={() => toggleSection('improvements')}
            >
              <View style={styles.improvementsSection}>
                {analysis.improvements.map((item, index) => (
                  <View key={index} style={styles.improvementItem}>
                    <View style={styles.improvementHeader}>
                      <View style={[
                        styles.severityDot,
                        item.severity === 'significant' && styles.severitySignificant,
                        item.severity === 'moderate' && styles.severityModerate,
                        item.severity === 'minor' && styles.severityMinor,
                      ]} />
                      <Text style={styles.improvementArea}>{item.area}</Text>
                    </View>
                    <Text style={styles.improvementObservation}>{item.observation}</Text>
                    <Text style={styles.improvementSuggestion}>💡 {item.suggestion}</Text>
                  </View>
                ))}
              </View>
            </FeedbackSection>
          </Animated.View>
        )}

        {/* Tips Section - kept for additional tips */}
        {analysis.tips.length > 0 && (
          <Animated.View entering={FadeInUp.delay(3400).duration(400)}>
            <FeedbackSection
              icon="💡"
              title="Quick Tips"
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
        )}
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
            <Ionicons name="arrow-forward" size={20} color={colors.text.primary} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Transcript Modal */}
      <TranscriptPage
        visible={showTranscript}
        messages={messages}
        scenarioTitle={scenarioTitle}
        characterName={characterName}
        duration={duration}
        onClose={() => setShowTranscript(false)}
      />
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
  summaryContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.DEFAULT,
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  encouragementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  encouragementEmoji: {
    fontSize: 24,
  },
  encouragementText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    flexShrink: 1,
  },

  // Stats Section
  statsSection: {
    marginBottom: spacing.lg,
  },

  // Transcript Button
  transcriptButton: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border?.light || 'rgba(255,255,255,0.1)',
  },
  transcriptButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  transcriptIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.DEFAULT + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptButtonText: {
    flex: 1,
  },
  transcriptButtonTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  transcriptButtonSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
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

  // Improvements Section
  improvementsSection: {
    gap: spacing.md,
  },
  improvementItem: {
    backgroundColor: colors.background.secondary || 'rgba(255, 193, 7, 0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning.DEFAULT,
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severitySignificant: {
    backgroundColor: colors.error?.DEFAULT || '#EF4444',
  },
  severityModerate: {
    backgroundColor: colors.warning.DEFAULT,
  },
  severityMinor: {
    backgroundColor: colors.primary.DEFAULT,
  },
  improvementArea: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.warning.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  improvementObservation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  improvementSuggestion: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontStyle: 'italic',
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
