/**
 * Interactive Scenario Test Screen
 *
 * Prototype for dialogue-based learning using DialogueTeleprompterCard:
 * - Practice mode: Listen to entire dialogue (both roles spoken by AI)
 * - Record mode: AI speaks Person A, user speaks Person B
 *
 * DEV TOOL - For testing the interactive scenario feature
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import {
  DialogueScenario,
  ESSENTIAL_SCENARIOS,
  CATEGORY_INFO,
} from '@/lib/scenarios/dialogueScenarios';
import { DialogueTeleprompterCard, DialogueResults } from '@/components/cards/DialogueTeleprompterCard';

const { width } = Dimensions.get('window');

// =============================================================================
// Types
// =============================================================================

type ScreenState = 'list' | 'practice' | 'complete';

// =============================================================================
// Main Component
// =============================================================================

export default function InteractiveScenarioTestScreen() {
  const router = useRouter();
  const [screenState, setScreenState] = useState<ScreenState>('list');
  const [selectedScenario, setSelectedScenario] = useState<DialogueScenario | null>(null);
  const [results, setResults] = useState<DialogueResults | null>(null);

  // Handle scenario selection - go directly to practice
  const handleSelectScenario = useCallback((scenario: DialogueScenario) => {
    setSelectedScenario(scenario);
    setScreenState('practice');
  }, []);

  // Handle practice completion
  const handleFinish = useCallback((practiceResults: DialogueResults) => {
    setResults(practiceResults);
    setScreenState('complete');
  }, []);

  // Go back
  const handleBack = useCallback(() => {
    if (screenState === 'practice' || screenState === 'complete') {
      setScreenState('list');
      setSelectedScenario(null);
      setResults(null);
    } else {
      router.back();
    }
  }, [screenState, router]);

  // Restart scenario
  const handleRestart = useCallback(() => {
    setResults(null);
    setScreenState('practice');
  }, []);

  // If in practice mode, show the DialogueTeleprompterCard full screen
  if (screenState === 'practice' && selectedScenario) {
    return (
      <DialogueTeleprompterCard
        scenario={selectedScenario}
        onFinish={handleFinish}
        onBack={handleBack}
      />
    );
  }

  // If complete, show results
  if (screenState === 'complete' && selectedScenario && results) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <ScenarioCompleteView
          scenario={selectedScenario}
          results={results}
          onRestart={handleRestart}
          onExit={handleBack}
        />
      </SafeAreaView>
    );
  }

  // Default: show scenario list
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
          }}
        >
          Interactive Scenarios
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScenarioListView scenarios={ESSENTIAL_SCENARIOS} onSelect={handleSelectScenario} />
    </SafeAreaView>
  );
}

// =============================================================================
// Scenario List View
// =============================================================================

function ScenarioListView({
  scenarios,
  onSelect,
}: {
  scenarios: DialogueScenario[];
  onSelect: (scenario: DialogueScenario) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Info Banner */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <LinearGradient
          colors={[colors.primary.DEFAULT + '20', colors.secondary.DEFAULT + '10']}
          style={{
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            marginBottom: spacing.xl,
            borderWidth: 1,
            borderColor: colors.primary.DEFAULT + '30',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Ionicons name="sparkles" size={20} color={colors.primary.light} />
            <Text
              style={{
                marginLeft: spacing.sm,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}
            >
              Dialogue Practice
            </Text>
            <View
              style={{
                marginLeft: spacing.sm,
                backgroundColor: colors.warning.DEFAULT,
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
                borderRadius: borderRadius.sm,
              }}
            >
              <Text style={{ fontSize: typography.fontSize.xs, fontWeight: '700', color: '#000' }}>
                PROTOTYPE
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20 }}>
            <Text style={{ color: colors.secondary.DEFAULT }}>Practice</Text> = Listen to both roles{'\n'}
            <Text style={{ color: colors.primary.light }}>Record</Text> = AI speaks one, you speak the other
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Scenario Cards */}
      {scenarios.map((scenario, index) => (
        <Animated.View key={scenario.id} entering={FadeInDown.duration(400).delay(100 + index * 50)}>
          <TouchableOpacity onPress={() => onSelect(scenario)} activeOpacity={0.9}>
            <View
              style={{
                backgroundColor: colors.background.card,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: CATEGORY_INFO[scenario.category].color + '30',
                ...shadows.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {/* Icon */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: borderRadius.lg,
                    backgroundColor: CATEGORY_INFO[scenario.category].color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.md,
                  }}
                >
                  <Ionicons
                    name={scenario.icon as any}
                    size={24}
                    color={CATEGORY_INFO[scenario.category].color}
                  />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                    <Text
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        flex: 1,
                      }}
                    >
                      {scenario.title}
                    </Text>
                    {scenario.isPremium && (
                      <View
                        style={{
                          backgroundColor: colors.warning.DEFAULT + '20',
                          paddingHorizontal: spacing.sm,
                          paddingVertical: 2,
                          borderRadius: borderRadius.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: '700',
                            color: colors.warning.DEFAULT,
                          }}
                        >
                          PRO
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {scenario.description}
                  </Text>

                  {/* Roles preview */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary.DEFAULT, marginRight: 4 }} />
                      <Text style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                        {scenario.roleA}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary.light, marginRight: 4 }} />
                      <Text style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                        {scenario.roleB}
                      </Text>
                    </View>
                  </View>

                  {/* Meta */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="chatbubbles-outline" size={14} color={colors.text.tertiary} />
                      <Text
                        style={{
                          marginLeft: 4,
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                        }}
                      >
                        {scenario.lines.length} lines
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor:
                          scenario.difficulty === 'beginner'
                            ? colors.success.DEFAULT + '20'
                            : scenario.difficulty === 'intermediate'
                              ? colors.warning.DEFAULT + '20'
                              : colors.error.DEFAULT + '20',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 2,
                        borderRadius: borderRadius.sm,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: '600',
                          color:
                            scenario.difficulty === 'beginner'
                              ? colors.success.DEFAULT
                              : scenario.difficulty === 'intermediate'
                                ? colors.warning.DEFAULT
                                : colors.error.DEFAULT,
                          textTransform: 'capitalize',
                        }}
                      >
                        {scenario.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// Scenario Complete View
// =============================================================================

function ScenarioCompleteView({
  scenario,
  results,
  onRestart,
  onExit,
}: {
  scenario: DialogueScenario;
  results: DialogueResults;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
        {/* Success Icon */}
        <LinearGradient
          colors={colors.gradients.success}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.xl,
            ...shadows.glow.success,
          }}
        >
          <Ionicons name="checkmark" size={50} color="#FFF" />
        </LinearGradient>

        <Text
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing.sm,
          }}
        >
          Great Job!
        </Text>

        <Text
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: spacing.xl,
          }}
        >
          You completed "{scenario.title}"
        </Text>

        {/* Stats */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.lg,
            marginBottom: spacing['2xl'],
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.primary.light,
              }}
            >
              {results.totalLines}
            </Text>
            <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
              Lines
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.secondary.DEFAULT,
              }}
            >
              {results.userLines}
            </Text>
            <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
              Your Lines
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.warning.DEFAULT,
              }}
            >
              {Math.floor(results.duration / 60)}:{String(results.duration % 60).padStart(2, '0')}
            </Text>
            <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
              Duration
            </Text>
          </View>
        </View>

        {/* Mode badge */}
        <View
          style={{
            backgroundColor: results.mode === 'record' ? '#EF4444' + '20' : colors.primary.DEFAULT + '20',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
            marginBottom: spacing.xl,
          }}
        >
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: '600',
              color: results.mode === 'record' ? '#EF4444' : colors.primary.light,
            }}
          >
            {results.mode === 'record' ? 'Interactive Mode' : 'Listen Mode'}
          </Text>
        </View>

        {/* Actions */}
        <View style={{ width: '100%', gap: spacing.md }}>
          <TouchableOpacity onPress={onRestart} activeOpacity={0.9}>
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="refresh" size={20} color="#FFF" />
                <Text
                  style={{
                    marginLeft: spacing.sm,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.bold,
                    color: '#FFF',
                  }}
                >
                  Practice Again
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onExit}
            activeOpacity={0.9}
            style={{
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              alignItems: 'center',
              backgroundColor: colors.background.card,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}
            >
              Choose Another Scenario
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
