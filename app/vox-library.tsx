/**
 * Vox Library Screen
 *
 * Premium scenario decks organized by category.
 * Powered by seed data from lib/data/voxLibrarySeed.ts.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { VOX_SCENARIO_SEED, type VoxScenarioSeed } from '@/lib/data/voxLibrarySeed';
import type { ContextType } from '@/types/voxLibrary';
import { BackButton } from '@/components/ui/BackButton';

// =============================================================================
// Category Config
// =============================================================================

type CategoryConfig = {
  id: ContextType;
  label: string;
  icon: string;
  gradient: [string, string];
  description: string;
};

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'business',
    label: 'Business',
    icon: 'briefcase-outline',
    gradient: [colors.primary.DEFAULT, '#4F46E5'],
    description: 'Pitching, negotiating, leading meetings',
  },
  {
    id: 'professional',
    label: 'Professional',
    icon: 'people-outline',
    gradient: ['#059669', '#10B981'],
    description: 'Client calls, interviews, presentations',
  },
  {
    id: 'daily_life',
    label: 'Daily Life',
    icon: 'home-outline',
    gradient: ['#D97706', '#F59E0B'],
    description: 'Medical, banking, housing, errands',
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: 'airplane-outline',
    gradient: ['#7C3AED', '#A78BFA'],
    description: 'Airports, hotels, restaurants, directions',
  },
  {
    id: 'social',
    label: 'Social',
    icon: 'chatbubbles-outline',
    gradient: ['#DC2626', '#F87171'],
    description: 'Making friends, small talk, debates',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: 'alert-circle-outline',
    gradient: ['#B91C1C', '#EF4444'],
    description: 'Police, hospital, urgent situations',
  },
];

// =============================================================================
// Helpers
// =============================================================================

function getDifficultyColor(weight: number): string {
  if (weight <= 0.9) return colors.success.DEFAULT;
  if (weight <= 1.2) return colors.primary.DEFAULT;
  return colors.warning.DEFAULT;
}

function getDifficultyLabel(weight: number): string {
  if (weight <= 0.9) return 'Beginner';
  if (weight <= 1.2) return 'Intermediate';
  return 'Advanced';
}

function getCEFRBadge(levels: string[]): string {
  return levels.join(' · ');
}

// =============================================================================
// Component
// =============================================================================

export default function VoxLibraryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ContextType | null>(null);

  // Group scenarios by category
  const scenariosByCategory = useMemo(() => {
    const map: Record<string, VoxScenarioSeed[]> = {};
    for (const s of VOX_SCENARIO_SEED) {
      if (!map[s.context_type]) map[s.context_type] = [];
      map[s.context_type].push(s);
    }
    return map;
  }, []);

  const activeScenarios = selectedCategory
    ? scenariosByCategory[selectedCategory] || []
    : [];

  const handleScenarioPress = (scenario: VoxScenarioSeed) => {
    const voiceScenario = {
      id: scenario.id || scenario.title.toLowerCase().replace(/\s+/g, '-'),
      title: scenario.title,
      description: scenario.description || scenario.title,
      context: scenario.description || '',
      aiRole: scenario.ai_persona?.role || 'Conversation Partner',
      userRole: 'Learner',
      objectives: scenario.objectives || ['Practice speaking', 'Use key vocabulary', 'Maintain the conversation'],
      language: scenario.language || 'english',
      difficulty: scenario.difficulty || 'intermediate',
      category: scenario.category || 'general',
      suggestedPhrases: scenario.key_phrases || [],
      keyVocabulary: scenario.key_vocabulary || [],
      suggestedDuration: 300,
    };
    router.push({
      pathname: '/voice-practice/[scenarioId]' as any,
      params: { scenarioId: voiceScenario.id, scenarioData: JSON.stringify(voiceScenario) },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Vox Library</Text>
            <Text style={styles.headerSubtitle}>
              {VOX_SCENARIO_SEED.length} professional scenarios
            </Text>
          </View>
        </View>

        {selectedCategory ? (
          // Scenario list view
          <View style={{ flex: 1 }}>
            {/* Category header */}
            <TouchableOpacity
              style={styles.categoryBackRow}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
              <Text style={styles.categoryBackText}>All Categories</Text>
            </TouchableOpacity>

            <FlatList
              data={activeScenarios}
              keyExtractor={(item) => item.slug}
              contentContainerStyle={styles.scenarioList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.duration(300).delay(index * 60)}>
                  <TouchableOpacity
                    style={styles.scenarioCard}
                    onPress={() => handleScenarioPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.scenarioHeader}>
                      <Text style={styles.scenarioTitle}>{item.title}</Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty_weight) + '20' }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty_weight) }]}>
                          {getDifficultyLabel(item.difficulty_weight)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.scenarioDesc} numberOfLines={2}>
                      {item.description}
                    </Text>

                    {/* Meta row */}
                    <View style={styles.scenarioMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                        <Text style={styles.metaText}>{item.estimated_minutes} min</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="school-outline" size={14} color={colors.text.tertiary} />
                        <Text style={styles.metaText}>{getCEFRBadge(item.cefr_levels)}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="chatbubble-outline" size={14} color={colors.text.tertiary} />
                        <Text style={styles.metaText}>{item.key_phrases.length} phrases</Text>
                      </View>
                    </View>

                    {/* Key phrases preview */}
                    {item.key_phrases.length > 0 && (
                      <View style={styles.phrasePreview}>
                        <Text style={styles.phraseLabel}>Key phrase:</Text>
                        <Text style={styles.phraseText} numberOfLines={1}>
                          "{item.key_phrases[0].phrase}"
                        </Text>
                      </View>
                    )}

                    {/* Objectives */}
                    <View style={styles.objectivesRow}>
                      {item.objectives.slice(0, 2).map((obj, i) => (
                        <View key={i} style={styles.objectiveChip}>
                          <Ionicons name="checkmark-circle-outline" size={12} color={colors.success.DEFAULT} />
                          <Text style={styles.objectiveText} numberOfLines={1}>{obj}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          </View>
        ) : (
          // Category grid view
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.categoryGrid}
            showsVerticalScrollIndicator={false}
          >
            {CATEGORIES.map((cat, index) => {
              const count = scenariosByCategory[cat.id]?.length || 0;
              return (
                <Animated.View
                  key={cat.id}
                  entering={FadeInDown.duration(300).delay(index * 80)}
                >
                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={cat.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.categoryGradient}
                    >
                      <View style={styles.categoryIconContainer}>
                        <Ionicons name={cat.icon as any} size={28} color="white" />
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryLabel}>{cat.label}</Text>
                        <Text style={styles.categoryDesc}>{cat.description}</Text>
                        <Text style={styles.categoryCount}>{count} scenarios</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {/* Stats footer */}
            <View style={styles.statsFooter}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{VOX_SCENARIO_SEED.length}</Text>
                <Text style={styles.statLabel}>Scenarios</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{CATEGORIES.length}</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>2</Text>
                <Text style={styles.statLabel}>Languages</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerText: {
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Category grid
  categoryGrid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  categoryCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: 'white',
  },
  categoryDesc: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  categoryCount: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: typography.fontWeight.medium,
    marginTop: 4,
  },

  // Category back row
  categoryBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  categoryBackText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },

  // Scenario list
  scenarioList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  scenarioCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scenarioTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  scenarioDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  scenarioMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  phrasePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay.light5,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  phraseLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  phraseText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
    fontStyle: 'italic',
    flex: 1,
  },
  objectivesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  objectiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.overlay.light5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  objectiveText: {
    fontSize: 10,
    color: colors.text.secondary,
    maxWidth: 160,
  },

  // Stats footer
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.overlay.light10,
  },
});
