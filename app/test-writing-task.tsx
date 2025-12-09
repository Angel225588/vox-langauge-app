/**
 * Test Writing Task Screen
 *
 * Demonstrates the full Writing Task / Personal Script Builder flow:
 * 1. Task Brief - See the writing assignment
 * 2. Editor - Write in Notion-style full screen
 * 3. Analysis - AI feedback with corrections
 * 4. Save - Store to notes library
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';
import {
  WritingTaskFlow,
  type WritingTask,
  type WritingTaskResult,
  type WritingAnalysis,
} from '@/components/cards/writing';
import { analyzeWriting as geminiAnalyzeWriting } from '@/lib/writing';

// Sample writing tasks for testing
const SAMPLE_TASKS: WritingTask[] = [
  {
    id: 'task-1',
    title: 'Email to Your Neighbor',
    category: 'email',
    scenario: 'Write an email to your neighbor "Marie" to politely ask for your coffee machine back. You lent it to her 2 weeks ago for a party.',
    goal: 'Practice formal request language and polite expressions in French',
    context: 'You want to be friendly but also make it clear you need it back soon.',
    recommendations: [
      'Start with a friendly greeting',
      'Mention when you lent it',
      'Be polite but clear about wanting it back',
      'Suggest a time to pick it up',
    ],
    targetLanguage: 'fr',
    minWords: 40,
    maxWords: 150,
    difficulty: 'intermediate',
  },
  {
    id: 'task-2',
    title: 'Describe Your Morning Routine',
    category: 'daily_routine',
    scenario: 'Describe what you typically do from waking up until leaving for work or starting your day.',
    goal: 'Practice using reflexive verbs and time expressions',
    context: 'Include at least 5 different activities with approximate times.',
    recommendations: [
      'Use "je me réveille", "je me lève", "je me douche"',
      'Include time expressions: à 7 heures, vers midi',
      'Describe what you eat for breakfast',
      'Mention how you get to work/school',
    ],
    targetLanguage: 'fr',
    minWords: 50,
    maxWords: 200,
    difficulty: 'beginner',
  },
  {
    id: 'task-3',
    title: 'Job Interview Introduction',
    category: 'job_interview',
    scenario: 'Prepare a self-introduction for a job interview at a French company. Include your background, experience, and why you want this position.',
    goal: 'Practice professional French and formal self-presentation',
    context: 'You are applying for a marketing position at a tech startup.',
    recommendations: [
      'Start with "Bonjour, je me présente..."',
      'Mention your education and experience',
      'Explain your motivation for the role',
      'End with what you can contribute',
    ],
    targetLanguage: 'fr',
    minWords: 80,
    maxWords: 250,
    difficulty: 'advanced',
  },
];

/**
 * Wrapper for Gemini AI writing analysis
 * Adapts our analyzeWriting function to the WritingTaskFlow signature
 */
async function analyzeWithGemini(text: string, task: WritingTask): Promise<WritingAnalysis> {
  return geminiAnalyzeWriting({
    text,
    task,
    targetLanguage: task.targetLanguage,
    userLevel: task.difficulty === 'beginner' ? 'beginner'
      : task.difficulty === 'advanced' ? 'advanced'
      : 'intermediate',
  });
}

export default function TestWritingTaskScreen() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<WritingTask | null>(null);
  const [completedTasks, setCompletedTasks] = useState<WritingTaskResult[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Custom task form state
  const [customTitle, setCustomTitle] = useState('');
  const [customScenario, setCustomScenario] = useState('');
  const [customGoal, setCustomGoal] = useState('');

  const handleSelectTask = useCallback((task: WritingTask) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTask(task);
  }, []);

  const handleCreateCustomTask = useCallback(() => {
    if (!customTitle.trim() || !customScenario.trim()) {
      Alert.alert('Missing Information', 'Please fill in at least a title and scenario.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const customTask: WritingTask = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      category: 'custom',
      scenario: customScenario.trim(),
      goal: customGoal.trim() || 'Practice writing and get AI feedback',
      context: 'Custom writing task created by you',
      recommendations: [
        'Write naturally and express your thoughts',
        'Try to use vocabulary you\'ve been learning',
        'Don\'t worry about perfection - that\'s what feedback is for!',
      ],
      targetLanguage: 'fr',
      minWords: 20,
      maxWords: 500,
      difficulty: 'intermediate',
    };

    setSelectedTask(customTask);
    setShowCustomForm(false);
    // Reset form
    setCustomTitle('');
    setCustomScenario('');
    setCustomGoal('');
  }, [customTitle, customScenario, customGoal]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleComplete = useCallback((result: WritingTaskResult) => {
    setCompletedTasks(prev => [...prev, result]);
    setSelectedTask(null);

    Alert.alert(
      'Note Saved!',
      `"${result.title}" has been saved to your notes library. Time spent: ${Math.round(result.timeSpentMs / 1000)}s`,
      [{ text: 'Great!', style: 'default' }]
    );
  }, []);

  const handleExit = useCallback(() => {
    setSelectedTask(null);
  }, []);

  // If a task is selected, show the flow
  if (selectedTask) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.flowContainer}>
          <WritingTaskFlow
            task={selectedTask}
            onComplete={handleComplete}
            onExit={handleExit}
            analyzeWriting={analyzeWithGemini}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show custom task creation form
  if (showCustomForm) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <BackButton onPress={() => setShowCustomForm(false)} />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Create Task</Text>
              <Text style={styles.headerSubtitle}>Your own writing scenario</Text>
            </View>
          </Animated.View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Task Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Email to my boss"
                  placeholderTextColor={colors.text.disabled}
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  maxLength={100}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Scenario / What to Write *</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Describe what you want to write about. e.g., Write an email asking your boss for a day off next Friday because you have a doctor's appointment."
                  placeholderTextColor={colors.text.disabled}
                  value={customScenario}
                  onChangeText={setCustomScenario}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Learning Goal (optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Practice formal request phrases"
                  placeholderTextColor={colors.text.disabled}
                  value={customGoal}
                  onChangeText={setCustomGoal}
                  maxLength={200}
                />
              </View>

              <TouchableOpacity
                onPress={handleCreateCustomTask}
                activeOpacity={0.9}
                style={styles.createButton}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createButtonGradient}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                  <Text style={styles.createButtonText}>Start Writing</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Otherwise, show task selection
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <BackButton onPress={handleBack} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Writing Tasks</Text>
          <Text style={styles.headerSubtitle}>Personal Script Builder</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.introSection}>
          <View style={styles.introIcon}>
            <Ionicons name="pencil" size={32} color={colors.primary.DEFAULT} />
          </View>
          <Text style={styles.introTitle}>Practice Writing</Text>
          <Text style={styles.introText}>
            Choose a task below or create your own. AI will analyze your text and provide feedback on grammar, vocabulary, and style.
          </Text>
        </Animated.View>

        {/* Create Your Own Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowCustomForm(true);
            }}
            activeOpacity={0.9}
            style={styles.createOwnButton}
          >
            <LinearGradient
              colors={colors.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createOwnButtonGradient}
            >
              <View style={styles.createOwnIcon}>
                <Ionicons name="add" size={24} color="white" />
              </View>
              <View style={styles.createOwnContent}>
                <Text style={styles.createOwnTitle}>Create Your Own</Text>
                <Text style={styles.createOwnSubtitle}>Write about anything you want</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Task Cards */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Suggested Tasks</Text>
          {SAMPLE_TASKS.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => handleSelectTask(task)}
              activeOpacity={0.8}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskIconContainer}>
                  <Ionicons
                    name={
                      task.category === 'email'
                        ? 'mail-outline'
                        : task.category === 'daily_routine'
                        ? 'sunny-outline'
                        : 'briefcase-outline'
                    }
                    size={20}
                    color={colors.primary.DEFAULT}
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <View style={[
                      styles.difficultyBadge,
                      task.difficulty === 'beginner' && styles.beginnerBadge,
                      task.difficulty === 'intermediate' && styles.intermediateBadge,
                      task.difficulty === 'advanced' && styles.advancedBadge,
                    ]}>
                      <Text style={[
                        styles.difficultyText,
                        task.difficulty === 'beginner' && styles.beginnerText,
                        task.difficulty === 'intermediate' && styles.intermediateText,
                        task.difficulty === 'advanced' && styles.advancedText,
                      ]}>
                        {task.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.wordCount}>{task.minWords}+ words</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>
              <Text style={styles.taskScenario} numberOfLines={2}>
                {task.scenario}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.sectionTitle}>Completed ({completedTasks.length})</Text>
            {completedTasks.map((result, index) => (
              <View key={index} style={styles.completedCard}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.DEFAULT} />
                <View style={styles.completedInfo}>
                  <Text style={styles.completedTitle}>{result.title}</Text>
                  <Text style={styles.completedMeta}>
                    {result.analysis.corrections.length} corrections • {Math.round(result.timeSpentMs / 1000)}s
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flowContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  introSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary.DEFAULT}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  introText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
  },
  tasksSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  taskIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary.DEFAULT}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  beginnerBadge: {
    backgroundColor: `${colors.success.DEFAULT}15`,
  },
  intermediateBadge: {
    backgroundColor: `${colors.warning.DEFAULT}15`,
  },
  advancedBadge: {
    backgroundColor: `${colors.error.DEFAULT}15`,
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  beginnerText: {
    color: colors.success.DEFAULT,
  },
  intermediateText: {
    color: colors.warning.DEFAULT,
  },
  advancedText: {
    color: colors.error.DEFAULT,
  },
  wordCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  taskScenario: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  completedSection: {
    marginTop: spacing.lg,
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  completedMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Create Your Own Button
  createOwnButton: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  createOwnButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  createOwnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createOwnContent: {
    flex: 1,
  },
  createOwnTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  createOwnSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },

  // Custom Task Form
  formSection: {
    marginBottom: spacing.xl,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  formTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  createButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.lg,
    ...shadows.md,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  createButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
