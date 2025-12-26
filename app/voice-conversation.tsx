/**
 * Voice Conversation Screen
 *
 * Select a scenario and start a real-time voice conversation
 * with an AI tutor. Premium, minimalist design.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Constants from 'expo-constants';

import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { VoiceCallScreen, PostCallFeedbackScreen } from '@/components/cards';
import { PreSessionScreen } from '@/components/reading';
import {
  getScenariosForLanguage,
  getScenariosByDifficulty,
  VoiceScenario,
  getCharacter,
  ConversationMessage,
  AccentType,
  getAccentsForLanguage,
  getDefaultAccent,
} from '@/lib/voice';

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

// Scenario icon mapping - related icons for each scenario type
const SCENARIO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'cafe-order': 'cafe-outline',
  'restaurant': 'restaurant-outline',
  'directions': 'navigate-outline',
  'shopping': 'bag-outline',
  'hotel': 'bed-outline',
  'airport': 'airplane-outline',
  'doctor': 'medical-outline',
  'interview': 'briefcase-outline',
  'phone-call': 'call-outline',
  'meeting': 'people-outline',
  'dating': 'heart-outline',
  'emergency': 'alert-circle-outline',
  'default': 'chatbubbles-outline',
};

// Helper to get scenario icon
const getScenarioIcon = (scenario: VoiceScenario): keyof typeof Ionicons.glyphMap => {
  // Check if scenario ID matches any known icon
  const iconKey = Object.keys(SCENARIO_ICONS).find(key =>
    scenario.id.toLowerCase().includes(key) ||
    scenario.category?.toLowerCase().includes(key)
  );
  return iconKey ? SCENARIO_ICONS[iconKey] : SCENARIO_ICONS.default;
};

// Flow states: selection → goal → call → feedback
type FlowState = 'selection' | 'goal' | 'call' | 'feedback';

export default function VoiceConversationScreen() {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<VoiceScenario | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [flowState, setFlowState] = useState<FlowState>('selection');
  const [selectedAccent, setSelectedAccent] = useState<AccentType>(getDefaultAccent('es'));
  const [showAccentSelector, setShowAccentSelector] = useState(false);
  const [lastConversation, setLastConversation] = useState<{
    messages: ConversationMessage[];
    duration: number;
  } | null>(null);

  // Get available accents for the current language
  const availableAccents = getAccentsForLanguage('es');

  // Get scenarios for Spanish (default language)
  const allScenarios = getScenariosForLanguage('es');
  const filteredScenarios = difficultyFilter === 'all'
    ? allScenarios
    : getScenariosByDifficulty('es', difficultyFilter);

  // Check if API key is configured
  const hasApiKey = !!(
    Constants.expoConfig?.extra?.geminiApiKey ||
    process.env.EXPO_PUBLIC_GEMINI_API_KEY
  );

  const handleScenarioSelect = (scenario: VoiceScenario) => {
    if (!hasApiKey) {
      Alert.alert(
        'API Key Required',
        'Please add your Gemini API key to continue.\n\nAdd EXPO_PUBLIC_GEMINI_API_KEY to your .env file.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedScenario(scenario);
    setFlowState('goal'); // Go to goal page first
  };

  const handleStartCall = () => {
    setFlowState('call');
  };

  const handleGoalBack = () => {
    setFlowState('selection');
    setSelectedScenario(null);
  };

  const handleConversationComplete = (success: boolean, messages: ConversationMessage[]) => {
    console.log('[VoiceConversation] handleConversationComplete called:', { success, messageCount: messages.length });

    // Calculate approximate duration (rough estimate based on messages)
    const estimatedDuration = messages.length > 0
      ? Math.max(60, messages.length * 10) // At least 1 min, ~10s per message
      : 0;

    // Show feedback screen for successful conversations with messages
    if (success && messages.length >= 2) {
      setLastConversation({
        messages,
        duration: estimatedDuration,
      });
      setFlowState('feedback');
    } else {
      // Just show alert for short/failed conversations
      setFlowState('selection');
      setSelectedScenario(null);
      Alert.alert(
        'Conversation ended',
        messages.length > 0
          ? `You exchanged ${Math.floor(messages.length / 2)} turns.`
          : 'Try again to practice more!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleFeedbackDone = () => {
    setFlowState('selection');
    setLastConversation(null);
    setSelectedScenario(null);
  };

  const handlePracticeAgain = () => {
    // Keep selectedScenario to restart with same scenario
    setLastConversation(null);
    setFlowState('call');
  };

  const handleBack = () => {
    if (flowState === 'call') {
      Alert.alert(
        'End Conversation?',
        'Are you sure you want to leave the conversation?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              setFlowState('selection');
              setSelectedScenario(null);
            },
          },
        ]
      );
    } else if (flowState === 'goal') {
      handleGoalBack();
    } else if (flowState === 'feedback') {
      handleFeedbackDone();
    } else {
      router.back();
    }
  };

  // Show feedback screen after conversation
  if (flowState === 'feedback' && lastConversation && selectedScenario) {
    const character = selectedScenario.characterId
      ? getCharacter(selectedScenario.characterId)
      : null;

    return (
      <PostCallFeedbackScreen
        duration={lastConversation.duration}
        messages={lastConversation.messages}
        scenarioTitle={selectedScenario.title}
        characterName={character?.name}
        onPracticeAgain={handlePracticeAgain}
        onDone={handleFeedbackDone}
      />
    );
  }

  // Show goal page (pre-call briefing)
  if (flowState === 'goal' && selectedScenario) {
    // Get expectations based on scenario
    const expectations = [
      { icon: '🎯', text: `Practice ${selectedScenario.difficulty} level conversation` },
      { icon: '🗣️', text: 'Speak naturally with an AI tutor' },
      { icon: '✨', text: 'Get real-time feedback on your responses' },
    ];

    return (
      <PreSessionScreen
        title={selectedScenario.title}
        subtitle={selectedScenario.description}
        category={selectedScenario.category}
        difficulty={selectedScenario.difficulty as 'beginner' | 'intermediate' | 'advanced'}
        icon="call-outline"
        metaValue1="~5 min"
        metaLabel1="duration"
        expectations={expectations}
        primaryButtonText="Start Call"
        onPrimaryPress={handleStartCall}
        onBack={handleGoalBack}
      />
    );
  }

  // Show conversation view (active call)
  if (flowState === 'call' && selectedScenario) {
    return (
      <VoiceCallScreen
        scenario={selectedScenario}
        accent={selectedAccent}
        onComplete={handleConversationComplete}
        onBack={handleBack}
      />
    );
  }

  // Show scenario selection
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Voice Practice</Text>
          <Text style={styles.subtitle}>Real conversations with AI</Text>
        </View>
        {/* Call icon indicator */}
        <View style={styles.callIndicator}>
          <Ionicons name="call" size={18} color={colors.primary.DEFAULT} />
        </View>
      </View>

      {/* Accent Selector - Premium Style */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.accentContainer}>
        <TouchableOpacity
          style={styles.accentButton}
          onPress={() => setShowAccentSelector(!showAccentSelector)}
          activeOpacity={0.7}
        >
          <View style={styles.accentButtonLeft}>
            <Text style={styles.accentFlag}>
              {availableAccents.find(a => a.id === selectedAccent)?.flag || '🌍'}
            </Text>
            <View>
              <Text style={styles.accentLabel}>Accent</Text>
              <Text style={styles.accentButtonText}>
                {availableAccents.find(a => a.id === selectedAccent)?.name || 'Select'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={showAccentSelector ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Accent Dropdown */}
        {showAccentSelector && (
          <Animated.View entering={FadeInUp.duration(200)} style={styles.accentDropdown}>
            {availableAccents.map((accent, index) => (
              <Pressable
                key={accent.id}
                style={({ pressed }) => [
                  styles.accentOption,
                  selectedAccent === accent.id && styles.accentOptionActive,
                  pressed && styles.accentOptionPressed,
                  index === availableAccents.length - 1 && styles.accentOptionLast,
                ]}
                onPress={() => {
                  setSelectedAccent(accent.id);
                  setShowAccentSelector(false);
                }}
              >
                <Text style={styles.accentFlag}>{accent.flag}</Text>
                <Text style={[
                  styles.accentOptionText,
                  selectedAccent === accent.id && styles.accentOptionTextActive,
                ]}>
                  {accent.name}
                </Text>
                {selectedAccent === accent.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary.DEFAULT} />
                )}
              </Pressable>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      {/* Difficulty Filter - Pill Style */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['all', 'beginner', 'intermediate', 'advanced'] as DifficultyFilter[]).map(
            (difficulty) => (
              <Pressable
                key={difficulty}
                style={({ pressed }) => [
                  styles.filterChip,
                  difficultyFilter === difficulty && styles.filterChipActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setDifficultyFilter(difficulty)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    difficultyFilter === difficulty && styles.filterChipTextActive,
                  ]}
                >
                  {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>
      </View>

      {/* Scenarios List - Premium Dark Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredScenarios.map((scenario, index) => {
          const scenarioIcon = getScenarioIcon(scenario);
          const difficultyColor =
            scenario.difficulty === 'beginner'
              ? colors.success.DEFAULT
              : scenario.difficulty === 'intermediate'
              ? colors.warning.DEFAULT
              : colors.error.DEFAULT;

          return (
            <Animated.View
              key={scenario.id}
              entering={FadeInDown.duration(300).delay(index * 80)}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.scenarioCard,
                  pressed && styles.scenarioCardPressed,
                ]}
                onPress={() => handleScenarioSelect(scenario)}
              >
                {/* Icon Container with subtle glow */}
                <View style={[styles.iconContainer, { borderColor: difficultyColor + '40' }]}>
                  <Ionicons name={scenarioIcon} size={28} color={colors.text.primary} />
                </View>

                {/* Scenario Info */}
                <View style={styles.scenarioInfo}>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                  <Text style={styles.scenarioDescription} numberOfLines={2}>
                    {scenario.description}
                  </Text>

                  {/* Difficulty indicator */}
                  <View style={styles.difficultyRow}>
                    <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
                    <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                      {scenario.difficulty}
                    </Text>
                  </View>
                </View>

                {/* Call arrow */}
                <View style={styles.callArrow}>
                  <Ionicons name="call" size={20} color={colors.primary.DEFAULT} />
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  callIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Accent Selector - Premium Style
  accentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  accentButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accentFlag: {
    fontSize: 24,
  },
  accentLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accentButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  accentDropdown: {
    marginTop: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  accentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  accentOptionLast: {
    borderBottomWidth: 0,
  },
  accentOptionActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  accentOptionPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  accentOptionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  accentOptionTextActive: {
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.semibold,
  },

  // Difficulty Filter
  filterContainer: {
    paddingVertical: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
  },

  // Scenarios List
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  // Scenario Card - Premium Dark Style
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  scenarioCardPressed: {
    backgroundColor: colors.background.elevated,
    transform: [{ scale: 0.98 }],
  },

  // Icon Container
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // Scenario Info
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },

  // Difficulty Indicator
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },

  // Call Arrow
  callArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
