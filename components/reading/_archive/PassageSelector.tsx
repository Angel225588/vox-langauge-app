/**
 * Passage Selector Component - Premium Redesign
 *
 * Modern, Netflix-inspired content discovery with neomorphic design.
 * Features: Search, filters, featured carousel, category rows, gamification.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Passage } from '@/lib/reading/types';
import { colors, spacing, borderRadius, typography, shadows, neomorphism } from '@/constants/designSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface PassageSelectorProps {
  onSelect: (passage: Passage) => void;
  onClose: () => void;
  initialTab?: 'curated' | 'ai' | 'imported';
  initialDifficulty?: 'beginner' | 'intermediate' | 'advanced';
}

type TabType = 'discover' | 'ai' | 'my-library';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const SMALL_CARD_WIDTH = SCREEN_WIDTH * 0.42;
const FEATURED_CARD_HEIGHT = 220; // Taller featured cards

// Unsplash image URLs for categories (using their free API)
const CATEGORY_IMAGES: Record<string, string> = {
  'social': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  'travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
  'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  'work': 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&q=80',
  'daily life': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
  'culture': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
  'health': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
  'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
};

// Category gradient overlays (for text readability over images)
const CATEGORY_VISUALS: Record<string, { emoji: string; gradient: readonly [string, string] }> = {
  'social': { emoji: '👋', gradient: ['rgba(99, 102, 241, 0.85)', 'rgba(139, 92, 246, 0.9)'] as const },
  'travel': { emoji: '✈️', gradient: ['rgba(6, 182, 212, 0.85)', 'rgba(59, 130, 246, 0.9)'] as const },
  'food': { emoji: '🍳', gradient: ['rgba(245, 158, 11, 0.85)', 'rgba(239, 68, 68, 0.9)'] as const },
  'work': { emoji: '💼', gradient: ['rgba(16, 185, 129, 0.85)', 'rgba(5, 150, 105, 0.9)'] as const },
  'daily life': { emoji: '🏠', gradient: ['rgba(236, 72, 153, 0.85)', 'rgba(244, 114, 182, 0.9)'] as const },
  'culture': { emoji: '🎭', gradient: ['rgba(139, 92, 246, 0.85)', 'rgba(168, 85, 247, 0.9)'] as const },
  'health': { emoji: '🏃', gradient: ['rgba(34, 197, 94, 0.85)', 'rgba(22, 163, 74, 0.9)'] as const },
  'education': { emoji: '📚', gradient: ['rgba(59, 130, 246, 0.85)', 'rgba(29, 78, 216, 0.9)'] as const },
  'technology': { emoji: '💻', gradient: ['rgba(99, 102, 241, 0.85)', 'rgba(79, 70, 229, 0.9)'] as const },
  'nature': { emoji: '🌿', gradient: ['rgba(34, 197, 94, 0.85)', 'rgba(21, 128, 61, 0.9)'] as const },
  'default': { emoji: '📖', gradient: ['rgba(99, 102, 241, 0.85)', 'rgba(139, 92, 246, 0.9)'] as const },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PassageSelector: React.FC<PassageSelectorProps> = ({
  onSelect,
  onClose,
  initialTab = 'curated',
  initialDifficulty = 'beginner',
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const searchInputRef = useRef<TextInput>(null);

  // Handle tab change with haptic feedback
  const handleTabChange = useCallback((tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  // Handle passage selection
  const handlePassageSelect = useCallback((passage: Passage) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelect(passage);
  }, [onSelect]);

  // Handle close
  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  // Toggle search
  const toggleSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  // Toggle filters
  const toggleFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* PREMIUM HEADER */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          {/* Title Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Practice</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>5</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar + Filter Button */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search passages..."
                placeholderTextColor={neomorphism.input.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Button */}
            <TouchableOpacity
              onPress={toggleFilters}
              style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            >
              <Text style={styles.filterIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Filters Panel (collapsible) */}
          {showFilters && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.filtersPanel}>
              <Text style={styles.filterLabel}>Difficulty</Text>
              <View style={styles.difficultyRow}>
                <DifficultyPill
                  label="Beginner"
                  emoji="🌱"
                  active={difficulty === 'beginner'}
                  onPress={() => setDifficulty('beginner')}
                />
                <DifficultyPill
                  label="Intermediate"
                  emoji="🌿"
                  active={difficulty === 'intermediate'}
                  onPress={() => setDifficulty('intermediate')}
                />
                <DifficultyPill
                  label="Advanced"
                  emoji="🌳"
                  active={difficulty === 'advanced'}
                  onPress={() => setDifficulty('advanced')}
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* TAB BAR - Neomorphic Style */}
        <View style={styles.tabBar}>
          <NeoTab
            label="Discover"
            emoji="✨"
            active={activeTab === 'discover'}
            onPress={() => handleTabChange('discover')}
          />
          <NeoTab
            label="AI Generate"
            emoji="🤖"
            active={activeTab === 'ai'}
            onPress={() => handleTabChange('ai')}
          />
          <NeoTab
            label="My Library"
            emoji="📚"
            active={activeTab === 'my-library'}
            onPress={() => handleTabChange('my-library')}
          />
        </View>

        {/* CONTENT */}
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'discover' && (
              <DiscoverTab
                difficulty={difficulty}
                searchQuery={searchQuery}
                onSelect={handlePassageSelect}
              />
            )}

            {activeTab === 'ai' && (
              <AIGenerationTab
                onSelect={handlePassageSelect}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            )}

            {activeTab === 'my-library' && (
              <MyLibraryTab
                difficulty={difficulty}
                searchQuery={searchQuery}
                onSelect={handlePassageSelect}
              />
            )}
          </ScrollView>

          {/* Bottom Fade Gradient - Visual hierarchy to focus attention on top */}
          <LinearGradient
            colors={neomorphism.gradients.fadeBottom}
            style={styles.bottomFade}
            pointerEvents="none"
          />
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// DISCOVER TAB - Netflix-style content discovery
// ============================================================================

interface DiscoverTabProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  searchQuery: string;
  onSelect: (passage: Passage) => void;
}

const DiscoverTab: React.FC<DiscoverTabProps> = ({
  difficulty,
  searchQuery,
  onSelect,
}) => {
  const { getPassagesByDifficulty, searchPassages, getAllPassages } = require('@/lib/reading/curatedPassages');

  // Get all passages for different sections
  const allPassages = getAllPassages ? getAllPassages() : getPassagesByDifficulty(difficulty);
  let filteredPassages = searchQuery.trim()
    ? searchPassages(searchQuery)
    : getPassagesByDifficulty(difficulty);

  // Group passages by category
  const passagesByCategory = allPassages.reduce((acc: Record<string, any[]>, passage: any) => {
    const category = passage.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(passage);
    return acc;
  }, {});

  // Get featured passages (high popularity or first few)
  const featuredPassages = allPassages
    .filter((p: any) => p.popularity && p.popularity > 80)
    .slice(0, 5);

  // If searching, show search results
  if (searchQuery.trim()) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Search Results</Text>
        {filteredPassages.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="No passages found"
            subtitle="Try a different search term"
          />
        ) : (
          filteredPassages.map((passage: any) => (
            <PassageListCard
              key={passage.id}
              passage={passage}
              onPress={() => onSelect(passage)}
            />
          ))
        )}
      </View>
    );
  }

  // Limit categories to reduce overwhelm - show only 2-3 most relevant
  const topCategories = Object.entries(passagesByCategory).slice(0, 2);

  return (
    <View>
      {/* Featured Carousel - Primary focus, shown first and prominently */}
      {featuredPassages.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitlePrimary}>Featured Lectures</Text>
          <Text style={styles.sectionSubtitle}>Handpicked for your level</Text>
          <FlatList
            horizontal
            data={featuredPassages.slice(0, 3)} // Limit to 3 for focus
            keyExtractor={(item: any) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            renderItem={({ item, index }) => (
              <FeaturedCard
                passage={item}
                onPress={() => onSelect(item)}
                index={index}
              />
            )}
          />
        </Animated.View>
      )}

      {/* Quick Start - Simplified to just one prominent action */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.quickStartSection}>
        <TouchableOpacity
          style={styles.quickStartButton}
          activeOpacity={0.9}
          onPress={() => {
            const randomPassage = filteredPassages[Math.floor(Math.random() * filteredPassages.length)];
            if (randomPassage) onSelect(randomPassage);
          }}
        >
          <LinearGradient
            colors={neomorphism.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quickStartGradient}
          >
            <View style={styles.quickStartContent}>
              <Text style={styles.quickStartEmoji}>⚡</Text>
              <View>
                <Text style={styles.quickStartTitle}>Quick Practice</Text>
                <Text style={styles.quickStartSubtitle}>Start a random passage</Text>
              </View>
            </View>
            <Text style={styles.quickStartArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Browse by Category - Limited to reduce overwhelm */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Browse by Topic</Text>
        </View>

        {topCategories.map(([category, passages], categoryIndex) => (
          <View key={category} style={styles.categoryRow}>
            <View style={styles.categoryLabelRow}>
              <Text style={styles.categoryLabel}>
                {getCategoryEmoji(category)} {capitalizeFirst(category)}
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={(passages as any[]).slice(0, 4)} // Limit to 4 cards per row
              keyExtractor={(item: any) => `${category}-${item.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              renderItem={({ item, index }) => (
                <SmallPassageCard
                  passage={item}
                  onPress={() => onSelect(item)}
                  index={index}
                />
              )}
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// ============================================================================
// AI GENERATION TAB
// ============================================================================

interface AIGenerationTabProps {
  onSelect: (passage: Passage) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

const AIGenerationTab: React.FC<AIGenerationTabProps> = ({
  onSelect,
  isGenerating,
  setIsGenerating,
}) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [style, setStyle] = useState<'story' | 'dialogue' | 'article' | 'instructions'>('story');
  const [includeWordBank, setIncludeWordBank] = useState(false);

  const { generatePassage } = require('@/lib/reading/passageGenerator');

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    try {
      setIsGenerating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const passage = await generatePassage({
        difficulty,
        topic: topic.trim(),
        style,
        wordCount: 150,
        targetWords: includeWordBank ? [] : undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSelect(passage);
    } catch (error) {
      console.error('Generation failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick topic suggestions
  const topicSuggestions = ['Travel', 'Food', 'Work', 'Family', 'Hobbies', 'Shopping'];

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.aiContainer}>
      {/* Header */}
      <View style={styles.aiHeader}>
        <Text style={styles.aiTitle}>🤖 AI Passage Generator</Text>
        <Text style={styles.aiSubtitle}>Create custom practice content tailored to you</Text>
      </View>

      {/* Topic Input */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>What do you want to practice?</Text>
        <View style={styles.neoInput}>
          <TextInput
            style={styles.neoInputText}
            placeholder="e.g., ordering food at a restaurant..."
            placeholderTextColor={neomorphism.input.placeholder}
            value={topic}
            onChangeText={setTopic}
            editable={!isGenerating}
            multiline
          />
        </View>

        {/* Quick suggestions */}
        <View style={styles.suggestionsRow}>
          {topicSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              onPress={() => setTopic(suggestion)}
              style={styles.suggestionChip}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Difficulty */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Difficulty</Text>
        <View style={styles.optionsRow}>
          <OptionCard
            label="Beginner"
            emoji="🌱"
            description="Simple vocabulary"
            active={difficulty === 'beginner'}
            onPress={() => setDifficulty('beginner')}
            disabled={isGenerating}
          />
          <OptionCard
            label="Intermediate"
            emoji="🌿"
            description="More complex"
            active={difficulty === 'intermediate'}
            onPress={() => setDifficulty('intermediate')}
            disabled={isGenerating}
          />
          <OptionCard
            label="Advanced"
            emoji="🌳"
            description="Native-like"
            active={difficulty === 'advanced'}
            onPress={() => setDifficulty('advanced')}
            disabled={isGenerating}
          />
        </View>
      </View>

      {/* Style */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Content Style</Text>
        <View style={styles.styleGrid}>
          <StyleCard
            label="Story"
            emoji="📖"
            active={style === 'story'}
            onPress={() => setStyle('story')}
            disabled={isGenerating}
          />
          <StyleCard
            label="Dialogue"
            emoji="💬"
            active={style === 'dialogue'}
            onPress={() => setStyle('dialogue')}
            disabled={isGenerating}
          />
          <StyleCard
            label="Article"
            emoji="📰"
            active={style === 'article'}
            onPress={() => setStyle('article')}
            disabled={isGenerating}
          />
          <StyleCard
            label="Instructions"
            emoji="📝"
            active={style === 'instructions'}
            onPress={() => setStyle('instructions')}
            disabled={isGenerating}
          />
        </View>
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        onPress={handleGenerate}
        disabled={isGenerating || !topic.trim()}
        activeOpacity={0.9}
        style={[
          styles.generateButton,
          (isGenerating || !topic.trim()) && styles.generateButtonDisabled,
        ]}
      >
        {isGenerating ? (
          <View style={styles.generatingContent}>
            <ActivityIndicator color={neomorphism.button.primary.textColor} />
            <Text style={styles.generateButtonText}>Creating your passage...</Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>✨ Generate Passage</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// MY LIBRARY TAB
// ============================================================================

interface MyLibraryTabProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  searchQuery: string;
  onSelect: (passage: Passage) => void;
}

const MyLibraryTab: React.FC<MyLibraryTabProps> = ({
  difficulty,
  searchQuery,
  onSelect,
}) => {
  const [passages, setPassages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { getUserPassages, searchUserPassages, getUserPassagesByDifficulty } = require('@/lib/reading/passageStorage');

  React.useEffect(() => {
    loadPassages();
  }, [difficulty, searchQuery]);

  const loadPassages = async () => {
    try {
      setLoading(true);
      let results;

      if (searchQuery.trim()) {
        results = await searchUserPassages(searchQuery);
      } else {
        results = await getUserPassagesByDifficulty(difficulty);
      }

      setPassages(results);
    } catch (error) {
      console.error('Failed to load passages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={neomorphism.accent} />
        <Text style={styles.loadingText}>Loading your library...</Text>
      </View>
    );
  }

  if (passages.length === 0) {
    return (
      <EmptyState
        emoji="📚"
        title="Your library is empty"
        subtitle="Import your own passages or generate with AI"
        actionLabel="+ Import Passage"
        onAction={() => {
          // TODO: Open import modal
        }}
      />
    );
  }

  return (
    <View>
      <View style={styles.libraryHeader}>
        <Text style={styles.libraryCount}>{passages.length} passages</Text>
        <TouchableOpacity style={styles.importButton}>
          <Text style={styles.importButtonText}>+ Import</Text>
        </TouchableOpacity>
      </View>

      {passages.map((passage: any) => (
        <PassageListCard
          key={passage.id}
          passage={passage}
          onPress={() => onSelect(passage)}
        />
      ))}
    </View>
  );
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

// Neomorphic Tab Button
interface NeoTabProps {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}

const NeoTab: React.FC<NeoTabProps> = ({ label, emoji, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.neoTab, active && styles.neoTabActive]}
    activeOpacity={0.8}
  >
    <Text style={styles.neoTabEmoji}>{emoji}</Text>
    <Text style={[styles.neoTabText, active && styles.neoTabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// Difficulty Pill
interface DifficultyPillProps {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}

const DifficultyPill: React.FC<DifficultyPillProps> = ({ label, emoji, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.difficultyPill, active && styles.difficultyPillActive]}
  >
    <Text style={styles.difficultyPillEmoji}>{emoji}</Text>
    <Text style={[styles.difficultyPillText, active && styles.difficultyPillTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// Quick Action Card
interface QuickActionCardProps {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: readonly [string, string];
  onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  subtitle,
  emoji,
  gradient,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} style={styles.quickActionCard} activeOpacity={0.9}>
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.quickActionGradient}
    >
      <Text style={styles.quickActionEmoji}>{emoji}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Featured Card (Large) - Now with Unsplash images
interface FeaturedCardProps {
  passage: Passage & { tags?: string[]; popularity?: number };
  onPress: () => void;
  index: number;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ passage, onPress, index }) => {
  const visual = CATEGORY_VISUALS[passage.category?.toLowerCase()] || CATEGORY_VISUALS.default;
  const imageUrl = CATEGORY_IMAGES[passage.category?.toLowerCase()] || CATEGORY_IMAGES.default;

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <TouchableOpacity onPress={onPress} style={styles.featuredCard} activeOpacity={0.9}>
        {/* Background Image */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        {/* Gradient Overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.4, 1]}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>{passage.title}</Text>
            <Text style={styles.featuredMeta}>
              {passage.wordCount} words • {Math.ceil(passage.estimatedDuration / 60)} min
            </Text>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>{passage.difficulty}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Small Passage Card - With Unsplash image thumbnails
interface SmallPassageCardProps {
  passage: Passage & { tags?: string[]; popularity?: number };
  onPress: () => void;
  index: number;
}

const SmallPassageCard: React.FC<SmallPassageCardProps> = ({ passage, onPress, index }) => {
  const imageUrl = CATEGORY_IMAGES[passage.category?.toLowerCase()] || CATEGORY_IMAGES.default;

  const getDifficultyColor = () => {
    switch (passage.difficulty) {
      case 'beginner': return '#22C55E';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return neomorphism.text.secondary;
    }
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <TouchableOpacity onPress={onPress} style={styles.smallCard} activeOpacity={0.9}>
        {/* Image thumbnail instead of gradient with emoji */}
        <View style={styles.smallCardHeader}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.smallCardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.smallCardImageOverlay}
          />
        </View>
        <View style={styles.smallCardContent}>
          <Text style={styles.smallCardTitle} numberOfLines={2}>{passage.title}</Text>
          <View style={styles.smallCardFooter}>
            <Text style={styles.smallCardMeta}>{Math.ceil(passage.estimatedDuration / 60)} min</Text>
            <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor() }]} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Passage List Card (for search results)
interface PassageListCardProps {
  passage: Passage & { tags?: string[]; popularity?: number };
  onPress: () => void;
}

const PassageListCard: React.FC<PassageListCardProps> = ({ passage, onPress }) => {
  const visual = CATEGORY_VISUALS[passage.category?.toLowerCase()] || CATEGORY_VISUALS.default;

  const getDifficultyColor = () => {
    switch (passage.difficulty) {
      case 'beginner': return '#22C55E';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return neomorphism.text.secondary;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.listCard} activeOpacity={0.9}>
      <LinearGradient
        colors={visual.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.listCardIcon}
      >
        <Text style={styles.listCardEmoji}>{visual.emoji}</Text>
      </LinearGradient>
      <View style={styles.listCardContent}>
        <Text style={styles.listCardTitle} numberOfLines={1}>{passage.title}</Text>
        <Text style={styles.listCardPreview} numberOfLines={2}>{passage.text}</Text>
        <View style={styles.listCardFooter}>
          <Text style={styles.listCardMeta}>
            {passage.wordCount} words • {Math.ceil(passage.estimatedDuration / 60)} min
          </Text>
          <View style={[styles.listCardBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
            <Text style={[styles.listCardBadgeText, { color: getDifficultyColor() }]}>
              {passage.difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Option Card (for AI generation)
interface OptionCardProps {
  label: string;
  emoji: string;
  description: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({
  label,
  emoji,
  description,
  active,
  onPress,
  disabled,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.optionCard,
      active && styles.optionCardActive,
      disabled && styles.optionCardDisabled,
    ]}
    activeOpacity={0.8}
  >
    <Text style={styles.optionEmoji}>{emoji}</Text>
    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
    <Text style={styles.optionDescription}>{description}</Text>
  </TouchableOpacity>
);

// Style Card
interface StyleCardProps {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const StyleCard: React.FC<StyleCardProps> = ({ label, emoji, active, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.styleCard,
      active && styles.styleCardActive,
      disabled && styles.optionCardDisabled,
    ]}
    activeOpacity={0.8}
  >
    <Text style={styles.styleEmoji}>{emoji}</Text>
    <Text style={[styles.styleLabel, active && styles.styleLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

// Empty State
interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyEmoji}>{emoji}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} style={styles.emptyAction}>
        <Text style={styles.emptyActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============================================================================
// HELPERS
// ============================================================================

const getCategoryEmoji = (category: string): string => {
  return CATEGORY_VISUALS[category.toLowerCase()]?.emoji || '📖';
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neomorphism.background,
  },

  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#F59E0B',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: neomorphism.button.pressed.borderColor,
  },
  closeButtonText: {
    fontSize: typography.fontSize.lg,
    color: neomorphism.text.secondary,
  },

  // Search Row
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: neomorphism.input.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: neomorphism.input.border,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: neomorphism.input.text,
  },
  clearButton: {
    fontSize: typography.fontSize.lg,
    color: neomorphism.text.inactive,
    padding: spacing.xs,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: neomorphism.button.secondary.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: neomorphism.button.secondary.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(61, 69, 89, 0.3)',
  },
  filterButtonActive: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    borderColor: neomorphism.button.primary.backgroundColor,
  },
  filterIcon: {
    fontSize: 18,
  },

  // Filters Panel
  filtersPanel: {
    paddingVertical: spacing.sm,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: neomorphism.text.secondary,
    marginBottom: spacing.xs,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficultyPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    borderWidth: 2,
    borderColor: neomorphism.button.pressed.borderColor,
    gap: spacing.xs,
  },
  difficultyPillActive: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    borderColor: neomorphism.button.primary.backgroundColor,
  },
  difficultyPillEmoji: {
    fontSize: 14,
  },
  difficultyPillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: neomorphism.text.inactive,
  },
  difficultyPillTextActive: {
    color: neomorphism.button.primary.textColor,
    fontWeight: typography.fontWeight.bold,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  neoTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    borderWidth: 2,
    borderColor: neomorphism.button.pressed.borderColor,
    gap: spacing.xs,
  },
  neoTabActive: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    borderColor: neomorphism.button.primary.backgroundColor,
    shadowColor: neomorphism.button.primary.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  neoTabEmoji: {
    fontSize: 14,
  },
  neoTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: neomorphism.text.inactive,
  },
  neoTabTextActive: {
    color: neomorphism.button.primary.textColor,
    fontWeight: typography.fontWeight.bold,
  },

  // Content
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['3xl'] + 80, // Extra padding for bottom fade
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    pointerEvents: 'none',
  },

  // Section Titles - Hierarchy for visual clarity
  sectionTitlePrimary: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: neomorphism.text.secondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: spacing.md,
  },
  categoryRow: {
    marginBottom: spacing.md,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingRight: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: neomorphism.text.primary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: neomorphism.accent,
    fontWeight: typography.fontWeight.medium,
  },

  // Quick Start - Simplified single action
  quickStartSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  quickStartButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  quickStartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  quickStartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickStartEmoji: {
    fontSize: 28,
  },
  quickStartTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  quickStartSubtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickStartArrow: {
    fontSize: typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },

  // Legacy Quick Actions (keeping for reference)
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: spacing.md,
    minHeight: 100,
    justifyContent: 'flex-end',
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  quickActionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  quickActionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Carousel
  carouselContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  // Featured Card - Taller with image background
  featuredCard: {
    width: CARD_WIDTH,
    height: FEATURED_CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  featuredContent: {
    marginTop: 'auto',
  },
  featuredTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  featuredMeta: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.sm,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  featuredBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },

  // Small Card - With image thumbnails
  smallCard: {
    width: SMALL_CARD_WIDTH,
    backgroundColor: neomorphism.card.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: neomorphism.card.border,
  },
  smallCardHeader: {
    height: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  smallCardImage: {
    width: '100%',
    height: '100%',
  },
  smallCardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  smallCardContent: {
    padding: spacing.sm,
  },
  smallCardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  smallCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallCardMeta: {
    fontSize: typography.fontSize.xs,
    color: neomorphism.text.secondary,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // List Card
  listCard: {
    flexDirection: 'row',
    backgroundColor: neomorphism.card.background,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: neomorphism.card.border,
  },
  listCardIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  listCardEmoji: {
    fontSize: 24,
  },
  listCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listCardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  listCardPreview: {
    fontSize: typography.fontSize.xs,
    color: neomorphism.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardMeta: {
    fontSize: typography.fontSize.xs,
    color: neomorphism.text.inactive,
  },
  listCardBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  listCardBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },

  // AI Generation
  aiContainer: {
    paddingHorizontal: spacing.md,
  },
  aiHeader: {
    marginBottom: spacing.lg,
  },
  aiTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  aiSubtitle: {
    fontSize: typography.fontSize.sm,
    color: neomorphism.text.secondary,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: neomorphism.text.secondary,
    marginBottom: spacing.sm,
  },
  neoInput: {
    backgroundColor: neomorphism.input.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: neomorphism.input.border,
    padding: spacing.md,
    minHeight: 80,
  },
  neoInputText: {
    fontSize: typography.fontSize.base,
    color: neomorphism.input.text,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: neomorphism.button.pressed.borderColor,
  },
  suggestionText: {
    fontSize: typography.fontSize.xs,
    color: neomorphism.text.secondary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionCard: {
    flex: 1,
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: neomorphism.button.pressed.borderColor,
  },
  optionCardActive: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    borderColor: neomorphism.button.primary.backgroundColor,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  optionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: neomorphism.text.secondary,
    marginBottom: 2,
  },
  optionLabelActive: {
    color: neomorphism.button.primary.textColor,
  },
  optionDescription: {
    fontSize: 10,
    color: neomorphism.text.inactive,
    textAlign: 'center',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  styleCard: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 3) / 4,
    backgroundColor: neomorphism.button.pressed.backgroundColor,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: neomorphism.button.pressed.borderColor,
  },
  styleCardActive: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    borderColor: neomorphism.button.primary.backgroundColor,
  },
  styleEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  styleLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: neomorphism.text.secondary,
  },
  styleLabelActive: {
    color: neomorphism.button.primary.textColor,
  },
  generateButton: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: neomorphism.button.primary.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: neomorphism.button.primary.textColor,
  },
  generatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Library
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  libraryCount: {
    fontSize: typography.fontSize.sm,
    color: neomorphism.text.secondary,
  },
  importButton: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  importButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: neomorphism.button.primary.textColor,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: neomorphism.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyAction: {
    backgroundColor: neomorphism.button.primary.backgroundColor,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  emptyActionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: neomorphism.button.primary.textColor,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: neomorphism.text.secondary,
    marginTop: spacing.md,
  },
});

export default PassageSelector;
