/**
 * WritingTaskFlow - Complete Writing Task Orchestrator
 *
 * Manages the full flow:
 * 1. Task Brief (intro with goal/tips)
 * 2. Writing Editor (Notion-style)
 * 3. Analysis View (AI feedback)
 * 4. Save to Notes
 *
 * Each step transitions smoothly with animations
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { TaskBriefCard } from './TaskBriefCard';
import { WritingEditor } from './WritingEditor';
import { WritingAnalysisView } from './WritingAnalysisView';
import type {
  WritingTask,
  WritingAnalysis,
  WritingTaskResult,
  GrammarCorrection,
} from './types';

type FlowStep = 'brief' | 'writing' | 'analyzing' | 'analysis';

interface WritingTaskFlowProps {
  task: WritingTask;
  onComplete: (result: WritingTaskResult) => void;
  onExit?: () => void;
  // Optional: Real AI analysis function
  analyzeWriting?: (text: string, task: WritingTask) => Promise<WritingAnalysis>;
}

// Mock AI analysis for demo purposes
function mockAnalyzeWriting(text: string, task: WritingTask): Promise<WritingAnalysis> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple mock corrections based on common patterns
      const corrections: GrammarCorrection[] = [];
      let correctedText = text;

      // Check for missing accents (French example)
      if (text.includes('cafe') && !text.includes('café')) {
        corrections.push({
          id: 'corr-1',
          type: 'spelling',
          original: 'cafe',
          corrected: 'café',
          explanation: 'In French, "café" requires an accent aigu (é) on the e.',
          rule: 'French accents',
          position: { start: text.indexOf('cafe'), end: text.indexOf('cafe') + 4 },
        });
        correctedText = correctedText.replace('cafe', 'café');
      }

      // Check for "je va" instead of "je vais"
      if (text.toLowerCase().includes('je va ') || text.toLowerCase().includes('je va.')) {
        const index = text.toLowerCase().indexOf('je va');
        corrections.push({
          id: 'corr-2',
          type: 'grammar',
          original: 'je va',
          corrected: 'je vais',
          explanation: 'The verb "aller" conjugates to "vais" with "je". This is an irregular verb conjugation.',
          rule: 'Verb conjugation - aller',
          position: { start: index, end: index + 5 },
        });
        correctedText = correctedText.replace(/je va/gi, 'je vais');
      }

      // Check for missing period at end
      const trimmedText = text.trim();
      if (trimmedText.length > 0 && !trimmedText.endsWith('.') && !trimmedText.endsWith('!') && !trimmedText.endsWith('?')) {
        corrections.push({
          id: 'corr-3',
          type: 'punctuation',
          original: trimmedText.slice(-10),
          corrected: trimmedText.slice(-10) + '.',
          explanation: 'Sentences should end with proper punctuation.',
          rule: 'End punctuation',
          position: { start: text.length - 1, end: text.length },
        });
        correctedText = correctedText.trim() + '.';
      }

      // Check for "mon famille" (gender error)
      if (text.toLowerCase().includes('mon famille')) {
        const index = text.toLowerCase().indexOf('mon famille');
        corrections.push({
          id: 'corr-4',
          type: 'grammar',
          original: 'mon famille',
          corrected: 'ma famille',
          explanation: '"Famille" is feminine in French, so it requires "ma" (my - feminine) instead of "mon" (my - masculine).',
          rule: 'Possessive adjective agreement',
          position: { start: index, end: index + 11 },
        });
        correctedText = correctedText.replace(/mon famille/gi, 'ma famille');
      }

      // Generic feedback
      const wordCount = text.trim().split(/\s+/).length;
      const hasCorrections = corrections.length > 0;

      resolve({
        corrections,
        correctedText,
        overallFeedback: hasCorrections
          ? `Good effort! I found ${corrections.length} area${corrections.length > 1 ? 's' : ''} to improve. Review the corrections below to strengthen your writing.`
          : 'Excellent work! Your writing looks great. Keep practicing to build fluency.',
        strengths: [
          wordCount > 30 ? 'Good text length and detail' : 'Clear and concise writing',
          'Appropriate vocabulary for the task',
          'Good sentence structure',
        ],
        areasToImprove: hasCorrections
          ? ['Review the grammar corrections', 'Practice verb conjugations']
          : ['Continue expanding vocabulary', 'Try more complex sentence structures'],
        grammarScore: Math.max(60, 100 - corrections.filter(c => c.type === 'grammar').length * 15),
        vocabularyScore: Math.min(100, 70 + Math.floor(wordCount / 5)),
        clarityScore: Math.max(65, 95 - corrections.length * 5),
      });
    }, 2000); // Simulate API delay
  });
}

export function WritingTaskFlow({
  task,
  onComplete,
  onExit,
  analyzeWriting = mockAnalyzeWriting,
}: WritingTaskFlowProps) {
  const haptics = useHaptics();

  const [step, setStep] = useState<FlowStep>('brief');
  const [writingTitle, setWritingTitle] = useState('');
  const [writingContent, setWritingContent] = useState('');
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Handle starting the writing
  const handleStartWriting = useCallback(() => {
    haptics.medium();
    setStartTime(Date.now());
    setStep('writing');
  }, [haptics]);

  // Handle completing the writing
  const handleCompleteWriting = useCallback(async (title: string, content: string) => {
    haptics.medium();
    setWritingTitle(title);
    setWritingContent(content);
    setStep('analyzing');

    try {
      const result = await analyzeWriting(content, task);
      setAnalysis(result);
      haptics.success();
      setStep('analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
      haptics.error();
      // Fallback to a basic analysis
      setAnalysis({
        corrections: [],
        correctedText: content,
        overallFeedback: 'Analysis complete. Your writing has been saved.',
        strengths: ['Good effort!'],
        areasToImprove: [],
        grammarScore: 80,
        vocabularyScore: 80,
        clarityScore: 80,
      });
      setStep('analysis');
    }
  }, [task, analyzeWriting, haptics]);

  // Handle saving to notes
  const handleSaveToNotes = useCallback(() => {
    if (!analysis) return;

    const result: WritingTaskResult = {
      taskId: task.id,
      originalText: writingContent,
      correctedText: analysis.correctedText,
      title: writingTitle,
      label: task.category,
      analysis,
      completedAt: new Date().toISOString(),
      timeSpentMs: Date.now() - startTime,
    };

    haptics.success();
    onComplete(result);
  }, [task, writingTitle, writingContent, analysis, startTime, haptics, onComplete]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    haptics.light();
    switch (step) {
      case 'writing':
        setStep('brief');
        break;
      case 'analysis':
        setStep('writing');
        break;
      default:
        onExit?.();
    }
  }, [step, haptics, onExit]);

  return (
    <View style={styles.container}>
      {step === 'brief' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.stepContainer}
        >
          <TaskBriefCard
            task={task}
            onStart={handleStartWriting}
            onBack={onExit}
          />
        </Animated.View>
      )}

      {step === 'writing' && (
        <Animated.View
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.stepContainer}
        >
          <WritingEditor
            task={task}
            initialTitle={writingTitle}
            initialContent={writingContent}
            onComplete={handleCompleteWriting}
            onBack={handleBack}
          />
        </Animated.View>
      )}

      {step === 'analyzing' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.analyzingContainer}
        >
          <View style={styles.analyzingContent}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.analyzingTitle}>Analyzing your writing...</Text>
            <Text style={styles.analyzingSubtitle}>
              Checking grammar, vocabulary, and style
            </Text>
          </View>
        </Animated.View>
      )}

      {step === 'analysis' && analysis && (
        <Animated.View
          entering={SlideInRight.duration(300)}
          style={styles.stepContainer}
        >
          <WritingAnalysisView
            task={task}
            originalText={writingContent}
            title={writingTitle}
            analysis={analysis}
            onSaveToNotes={handleSaveToNotes}
            onBack={handleBack}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  analyzingTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  analyzingSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
