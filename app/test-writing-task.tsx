/**
 * Writing Task Selection Screen
 *
 * Premium task selection UI with:
 * - Category carousel (horizontal scroll)
 * - AI-recommended tasks based on user goals
 * - Neomorphic task cards with staggered animations
 * - Create custom task option
 * - Recent completed tasks history
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, shadows, animation } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';
import {
  WritingTaskFlow,
  type WritingTask,
  type WritingTaskResult,
  type WritingAnalysis,
  type TaskCategory,
} from '@/components/cards/writing';
import { analyzeWriting as geminiAnalyzeWriting } from '@/lib/writing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Quick start templates for custom task creation
const QUICK_TEMPLATES = [
  { id: 'email', emoji: '📧', label: 'Email', starter: 'I want to write an email to ' },
  { id: 'message', emoji: '💬', label: 'Text', starter: 'I want to text my friend about ' },
  { id: 'work', emoji: '💼', label: 'Work', starter: 'I need to write something for work: ' },
  { id: 'travel', emoji: '✈️', label: 'Travel', starter: 'I want to write about my trip to ' },
  { id: 'story', emoji: '📖', label: 'Story', starter: 'I want to tell a story about ' },
  { id: 'opinion', emoji: '💭', label: 'Opinion', starter: 'I want to share my thoughts on ' },
];

// Task categories with icons
const CATEGORIES: { id: TaskCategory | 'recommended'; label: string; icon: string; emoji: string }[] = [
  { id: 'recommended', label: 'For You', icon: 'sparkles', emoji: '✨' },
  { id: 'daily_routine', label: 'Daily', icon: 'sunny-outline', emoji: '☀️' },
  { id: 'email', label: 'Email', icon: 'mail-outline', emoji: '📧' },
  { id: 'job_interview', label: 'Work', icon: 'briefcase-outline', emoji: '💼' },
  { id: 'message', label: 'Social', icon: 'chatbubbles-outline', emoji: '💬' },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline', emoji: '✈️' },
  { id: 'opinion', label: 'Opinion', icon: 'bulb-outline', emoji: '💡' },
  { id: 'story', label: 'Story', icon: 'book-outline', emoji: '📖' },
];

// AI-recommended tasks (will be generated based on user goals)
const RECOMMENDED_TASKS: WritingTask[] = [
  {
    id: 'rec-1',
    title: 'Describe your morning routine',
    category: 'daily_routine',
    scenario: 'Write about what you typically do from waking up until you start your day. Include times and activities.',
    goal: 'Practice reflexive verbs and time expressions',
    context: 'Focus on daily activities using present tense.',
    recommendations: [
      'Use reflexive verbs: "je me réveille", "je me douche"',
      'Include time expressions: "à 7 heures", "vers midi"',
      'Describe breakfast and getting ready',
    ],
    targetLanguage: 'fr',
    minWords: 50,
    maxWords: 150,
    difficulty: 'beginner',
  },
  {
    id: 'rec-2',
    title: 'Email to a colleague',
    category: 'email',
    scenario: 'Write a polite email to reschedule a meeting with your colleague because you have a conflict.',
    goal: 'Practice formal email structure and polite requests',
    context: 'Keep it professional but friendly.',
    recommendations: [
      'Start with "Cher/Chère [nom]"',
      'Explain the reason briefly',
      'Propose alternative times',
      'End with a polite closing',
    ],
    targetLanguage: 'fr',
    minWords: 40,
    maxWords: 120,
    difficulty: 'intermediate',
  },
  {
    id: 'rec-3',
    title: 'Share your weekend plans',
    category: 'message',
    scenario: 'Text a friend about what you plan to do this weekend. Be casual and enthusiastic!',
    goal: 'Practice informal future tense and conversational expressions',
    context: 'Use casual language as you would with a close friend.',
    recommendations: [
      'Use informal future: "je vais + infinitif"',
      'Include slang or casual expressions',
      'Ask about their plans too',
    ],
    targetLanguage: 'fr',
    minWords: 30,
    maxWords: 100,
    difficulty: 'beginner',
  },
  {
    id: 'rec-4',
    title: 'Your dream vacation',
    category: 'travel',
    scenario: 'Describe your ideal vacation destination and what you would do there.',
    goal: 'Practice conditional tense and descriptive vocabulary',
    context: 'Be creative and descriptive!',
    recommendations: [
      'Use conditional: "je voudrais", "j\'aimerais"',
      'Describe the location in detail',
      'Include activities you would do',
    ],
    targetLanguage: 'fr',
    minWords: 60,
    maxWords: 180,
    difficulty: 'intermediate',
  },
];

// Tasks organized by category
const TASKS_BY_CATEGORY: Record<string, WritingTask[]> = {
  recommended: RECOMMENDED_TASKS,
  daily_routine: [
    {
      id: 'daily-1',
      title: 'Your evening routine',
      category: 'daily_routine',
      scenario: 'Describe what you do after work or school until you go to bed.',
      goal: 'Practice evening vocabulary and sequence words',
      recommendations: ['Use "d\'abord", "ensuite", "puis", "enfin"'],
      targetLanguage: 'fr',
      minWords: 50,
      maxWords: 150,
      difficulty: 'beginner',
    },
    {
      id: 'daily-2',
      title: 'Weekend breakfast',
      category: 'daily_routine',
      scenario: 'Describe your perfect weekend breakfast - what you eat, where, with whom.',
      goal: 'Practice food vocabulary and descriptive language',
      recommendations: ['Include sensory descriptions', 'Mention who you eat with'],
      targetLanguage: 'fr',
      minWords: 40,
      maxWords: 120,
      difficulty: 'beginner',
    },
  ],
  email: [
    {
      id: 'email-1',
      title: 'Request time off',
      category: 'email',
      scenario: 'Write a formal email to your manager requesting a day off for a personal matter.',
      goal: 'Practice formal request structures',
      recommendations: ['Be polite but direct', 'Mention the specific date'],
      targetLanguage: 'fr',
      minWords: 50,
      maxWords: 150,
      difficulty: 'intermediate',
    },
    {
      id: 'email-2',
      title: 'Thank you note',
      category: 'email',
      scenario: 'Write a thank you email after a job interview.',
      goal: 'Practice professional gratitude expressions',
      recommendations: ['Reference specific conversation points', 'Reiterate interest'],
      targetLanguage: 'fr',
      minWords: 60,
      maxWords: 180,
      difficulty: 'advanced',
    },
  ],
  job_interview: [
    {
      id: 'work-1',
      title: 'Introduce yourself',
      category: 'job_interview',
      scenario: 'Prepare a professional self-introduction for a job interview.',
      goal: 'Practice professional self-presentation',
      recommendations: ['Include education and experience', 'Highlight key skills'],
      targetLanguage: 'fr',
      minWords: 80,
      maxWords: 200,
      difficulty: 'intermediate',
    },
  ],
  message: [
    {
      id: 'msg-1',
      title: 'Invite to dinner',
      category: 'message',
      scenario: 'Text a friend to invite them over for dinner this weekend.',
      goal: 'Practice casual invitations and questions',
      recommendations: ['Be friendly and casual', 'Suggest a time'],
      targetLanguage: 'fr',
      minWords: 20,
      maxWords: 80,
      difficulty: 'beginner',
    },
  ],
  travel: [
    {
      id: 'travel-1',
      title: 'Hotel reservation inquiry',
      category: 'travel',
      scenario: 'Write an email to a hotel asking about room availability and amenities.',
      goal: 'Practice polite inquiry and travel vocabulary',
      recommendations: ['Specify dates', 'Ask about breakfast'],
      targetLanguage: 'fr',
      minWords: 50,
      maxWords: 150,
      difficulty: 'intermediate',
    },
  ],
  opinion: [
    {
      id: 'opinion-1',
      title: 'Favorite movie',
      category: 'opinion',
      scenario: 'Describe your favorite movie and explain why you love it.',
      goal: 'Practice expressing opinions and giving reasons',
      recommendations: ['Use opinion phrases: "je pense que", "à mon avis"'],
      targetLanguage: 'fr',
      minWords: 60,
      maxWords: 180,
      difficulty: 'intermediate',
    },
  ],
  story: [
    {
      id: 'story-1',
      title: 'Childhood memory',
      category: 'story',
      scenario: 'Tell a short story about a memorable moment from your childhood.',
      goal: 'Practice past tenses and narrative structure',
      recommendations: ['Use imparfait for setting, passé composé for actions'],
      targetLanguage: 'fr',
      minWords: 80,
      maxWords: 250,
      difficulty: 'advanced',
    },
  ],
};

/**
 * Wrapper for Gemini AI writing analysis
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

// Category Tab Component
function CategoryTab({
  category,
  isSelected,
  onPress,
  index,
}: {
  category: typeof CATEGORIES[0];
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, animation.spring.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.default);
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(300)}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.categoryTab,
          isSelected && styles.categoryTabSelected,
        ]}
      >
        {isSelected ? (
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.categoryTabGradient}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[styles.categoryLabel, styles.categoryLabelSelected]}>
              {category.label}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.categoryTabInner}>
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Task Card Component
function TaskCard({
  task,
  onPress,
  index,
}: {
  task: WritingTask;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, animation.spring.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.default);
  };

  const getCategoryIcon = (category: TaskCategory) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.emoji || '📝';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.success.DEFAULT;
      case 'intermediate': return colors.warning.DEFAULT;
      case 'advanced': return colors.error.DEFAULT;
      default: return colors.text.tertiary;
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 80).duration(400).springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.taskCard}
      >
        {/* Icon */}
        <View style={styles.taskIconContainer}>
          <Text style={styles.taskIcon}>{getCategoryIcon(task.category)}</Text>
        </View>

        {/* Content */}
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskScenario} numberOfLines={2}>
            {task.scenario}
          </Text>

          {/* Meta */}
          <View style={styles.taskMeta}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: `${getDifficultyColor(task.difficulty)}15` },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(task.difficulty) },
                ]}
              >
                {task.difficulty}
              </Text>
            </View>
            <Text style={styles.wordCount}>{task.minWords}+ words</Text>
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.taskArrow}>
          <Text style={styles.taskArrowText}>Start</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary.DEFAULT} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Create Custom Task Button Component
function CreateCustomButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, animation.spring.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.default);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(400).duration(400)}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.createCustomButton}
      >
        <View style={styles.createCustomIcon}>
          <Text style={styles.createCustomEmoji}>✨</Text>
        </View>
        <View style={styles.createCustomContent}>
          <Text style={styles.createCustomTitle}>Create Custom Task</Text>
          <Text style={styles.createCustomSubtitle}>Write about anything you want</Text>
        </View>
        <Ionicons name="add-circle-outline" size={24} color={colors.primary.DEFAULT} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Recent Tasks Modal Component
function RecentTasksModal({
  visible,
  tasks,
  onClose,
}: {
  visible: boolean;
  tasks: WritingTaskResult[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.recentModal, { paddingTop: insets.top }]}
    >
      <TouchableOpacity style={styles.recentModalBackdrop} onPress={onClose} />
      <View style={[styles.recentModalContent, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.recentModalHeader}>
          <Text style={styles.recentModalTitle}>Completed Tasks</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {tasks.length === 0 ? (
          <View style={styles.recentEmptyState}>
            <Text style={styles.recentEmptyIcon}>📝</Text>
            <Text style={styles.recentEmptyText}>No completed tasks yet</Text>
            <Text style={styles.recentEmptySubtext}>
              Your finished writing tasks will appear here
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.recentList}>
            {tasks.map((task, index) => (
              <View key={index} style={styles.recentItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.DEFAULT} />
                <View style={styles.recentItemContent}>
                  <Text style={styles.recentItemTitle}>{task.title}</Text>
                  <Text style={styles.recentItemMeta}>
                    {task.analysis.corrections.length} corrections • {Math.round(task.timeSpentMs / 1000)}s
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Animated.View>
  );
}

export default function WritingTaskSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('recommended');
  const [selectedTask, setSelectedTask] = useState<WritingTask | null>(null);
  const [completedTasks, setCompletedTasks] = useState<WritingTaskResult[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);

  // Custom task form state
  const [customDescription, setCustomDescription] = useState('');
  const MAX_DESCRIPTION_LENGTH = 300;

  // Get tasks for selected category
  const currentTasks = TASKS_BY_CATEGORY[selectedCategory] || [];

  // Filter categories that have tasks
  const availableCategories = CATEGORIES.filter(
    cat => TASKS_BY_CATEGORY[cat.id]?.length > 0
  );

  const handleSelectCategory = useCallback((categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  }, []);

  const handleSelectTask = useCallback((task: WritingTask) => {
    setSelectedTask(task);
  }, []);

  const handleTemplatePress = useCallback((starter: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomDescription(starter);
  }, []);

  const handleCreateCustomTask = useCallback(() => {
    if (!customDescription.trim() || customDescription.trim().length < 10) {
      Alert.alert('Tell me more', 'Please describe what you want to write about (at least 10 characters).');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Generate task from description (AI would enhance this)
    const description = customDescription.trim();

    // Simple title extraction - take first sentence or first 50 chars
    const firstSentence = description.split(/[.!?]/)[0];
    const title = firstSentence.length > 50
      ? firstSentence.substring(0, 47) + '...'
      : firstSentence || 'My Writing Task';

    // Detect category from keywords
    let category: TaskCategory = 'custom';
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('email')) category = 'email';
    else if (lowerDesc.includes('text') || lowerDesc.includes('message')) category = 'message';
    else if (lowerDesc.includes('work') || lowerDesc.includes('boss') || lowerDesc.includes('colleague')) category = 'job_interview';
    else if (lowerDesc.includes('trip') || lowerDesc.includes('travel') || lowerDesc.includes('vacation')) category = 'travel';
    else if (lowerDesc.includes('story') || lowerDesc.includes('tell')) category = 'story';
    else if (lowerDesc.includes('think') || lowerDesc.includes('opinion') || lowerDesc.includes('believe')) category = 'opinion';

    const customTask: WritingTask = {
      id: `custom-${Date.now()}`,
      title: title,
      category: category,
      scenario: description,
      goal: 'Practice writing and get personalized AI feedback',
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
    setCustomDescription('');
  }, [customDescription]);

  const handleBack = useCallback(() => {
    router.push('/(tabs)/practice');
  }, [router]);

  const handleComplete = useCallback((result: WritingTaskResult) => {
    setCompletedTasks(prev => [...prev, result]);
    setSelectedTask(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      '✨ Great work!',
      `"${result.title}" has been saved. You can practice reading it in the teleprompter!`,
      [{ text: 'Awesome!', style: 'default' }]
    );
  }, []);

  const handleExit = useCallback(() => {
    setSelectedTask(null);
  }, []);

  // If a task is selected, show the flow
  if (selectedTask) {
    return (
      <View style={styles.container}>
        <WritingTaskFlow
          task={selectedTask}
          onComplete={handleComplete}
          onExit={handleExit}
          analyzeWriting={analyzeWithGemini}
        />
      </View>
    );
  }

  // Show custom task creation form
  if (showCustomForm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <BackButton onPress={() => setShowCustomForm(false)} />
            <View style={styles.headerSpacer} />
          </Animated.View>

          <ScrollView
            style={styles.formScrollView}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text style={styles.customFormEmoji}>✨</Text>
              <Text style={styles.customFormTitle}>What do you want</Text>
              <Text style={styles.customFormTitle}>to write about?</Text>
            </Animated.View>

            {/* Text Input */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customTextArea}
                  placeholder="I want to write an email asking my landlord to fix the heating because it's been broken for 2 weeks..."
                  placeholderTextColor={colors.text.disabled}
                  value={customDescription}
                  onChangeText={(text) => setCustomDescription(text.slice(0, MAX_DESCRIPTION_LENGTH))}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
                <Text style={styles.characterCount}>
                  {customDescription.length}/{MAX_DESCRIPTION_LENGTH}
                </Text>
              </View>
            </Animated.View>

            {/* Quick Templates */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <Text style={styles.quickStartLabel}>Quick start:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templatesContainer}
              >
                {QUICK_TEMPLATES.map((template, index) => (
                  <Animated.View
                    key={template.id}
                    entering={FadeInRight.delay(250 + index * 50).duration(300)}
                  >
                    <TouchableOpacity
                      onPress={() => handleTemplatePress(template.starter)}
                      style={styles.templateButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.templateEmoji}>{template.emoji}</Text>
                      <Text style={styles.templateLabel}>{template.label}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Encouragement Quote */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(300)}
              style={styles.customQuoteContainer}
            >
              <View style={styles.customQuoteBar} />
              <Text style={styles.customQuoteText}>
                Just describe it - I'll set up the rest!
              </Text>
            </Animated.View>
          </ScrollView>

          {/* Fixed CTA */}
          <View style={[styles.customCtaContainer, { paddingBottom: insets.bottom + spacing.md }]}>
            <LinearGradient
              colors={['transparent', colors.background.primary]}
              style={styles.customCtaGradient}
              pointerEvents="none"
            />
            <TouchableOpacity
              onPress={handleCreateCustomTask}
              activeOpacity={0.9}
              style={[
                styles.customCtaButton,
                customDescription.trim().length < 10 && styles.customCtaButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={customDescription.trim().length >= 10 ? colors.gradients.primary : [colors.background.elevated, colors.background.elevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.customCtaGradientButton}
              >
                <Ionicons
                  name="sparkles"
                  size={20}
                  color={customDescription.trim().length >= 10 ? colors.text.primary : colors.text.disabled}
                />
                <Text
                  style={[
                    styles.customCtaText,
                    customDescription.trim().length < 10 && styles.customCtaTextDisabled,
                  ]}
                >
                  Create My Task
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Main task selection screen
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <BackButton onPress={handleBack} />
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowRecentModal(true);
          }}
          style={styles.recentButton}
        >
          <Ionicons name="time-outline" size={22} color={colors.text.secondary} />
          {completedTasks.length > 0 && (
            <View style={styles.recentBadge}>
              <Text style={styles.recentBadgeText}>{completedTasks.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Category Carousel */}
      <Animated.View entering={FadeIn.duration(400).delay(100)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryCarousel}
          snapToInterval={88}
          decelerationRate="fast"
        >
          {availableCategories.map((category, index) => (
            <CategoryTab
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={() => handleSelectCategory(category.id)}
              index={index}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Task List */}
      <ScrollView
        style={styles.taskList}
        contentContainerStyle={[
          styles.taskListContent,
          { paddingBottom: 120 + insets.bottom }, // Space for fixed button
        ]}
        showsVerticalScrollIndicator={false}
      >
        {currentTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            onPress={() => handleSelectTask(task)}
            index={index}
          />
        ))}
      </ScrollView>

      {/* Fixed Create Custom Task Button */}
      <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <LinearGradient
          colors={['transparent', colors.background.primary]}
          style={styles.fixedButtonGradient}
          pointerEvents="none"
        />
        <CreateCustomButton onPress={() => setShowCustomForm(true)} />
      </View>

      {/* Recent Tasks Modal */}
      <RecentTasksModal
        visible={showRecentModal}
        tasks={completedTasks}
        onClose={() => setShowRecentModal(false)}
      />
    </View>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSpacer: {
    flex: 1,
  },
  recentButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  recentBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  recentBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Category Carousel
  categoryCarousel: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryTab: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  categoryTabSelected: {
    ...shadows.glow.primary,
  },
  categoryTabGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryTabInner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    minWidth: 80,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  categoryLabelSelected: {
    color: colors.text.primary,
  },

  // Task List
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  // Task Card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary.DEFAULT}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  taskIcon: {
    fontSize: 24,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  taskScenario: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.sm,
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
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  wordCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  taskArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
    paddingTop: spacing.xs,
  },
  taskArrowText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.DEFAULT,
  },

  // Fixed Button Container
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
  },
  fixedButtonGradient: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 24,
  },

  // Create Custom Button
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: `${colors.primary.DEFAULT}40`,
    borderStyle: 'dashed',
  },
  createCustomIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.accent.blue}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  createCustomEmoji: {
    fontSize: 24,
  },
  createCustomContent: {
    flex: 1,
  },
  createCustomTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  createCustomSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Custom Form
  formScrollView: {
    flex: 1,
  },
  formContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  customFormEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  customFormTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: typography.fontSize['2xl'] * 1.2,
  },
  customInputContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 160,
  },
  customTextArea: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.6,
    minHeight: 120,
  },
  characterCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  quickStartLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  templatesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  templateButton: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 64,
  },
  templateEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  templateLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  customQuoteContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  customQuoteBar: {
    width: 3,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  customQuoteText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },
  customCtaContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  customCtaGradient: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 24,
  },
  customCtaButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  customCtaButtonDisabled: {
    ...shadows.sm,
  },
  customCtaGradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  customCtaText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  customCtaTextDisabled: {
    color: colors.text.disabled,
  },

  // Recent Tasks Modal
  recentModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  recentModalBackdrop: {
    flex: 1,
  },
  recentModalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing.lg,
    maxHeight: '70%',
  },
  recentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  recentModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  recentList: {
    flex: 1,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  recentItemMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  recentEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  recentEmptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  recentEmptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recentEmptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
