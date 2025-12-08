/**
 * Story Library Screen
 *
 * Premium, minimalist library for selecting reading passages/lectures.
 * Design inspired by Claude, Perplexity, Revolut - clean, spacious, premium feel.
 *
 * Flow: Library → About Lecture → Teleprompter
 *
 * Features:
 * - Horizontal featured carousel with beautiful image cards (swipe left/right)
 * - Pagination dots for carousel
 * - Vertical scrolling list for all stories
 * - Category filtering
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';
import { BackButton } from '@/components/ui/BackButton';
import { CompletedBadge, CompletedOverlay } from '@/components/ui/CompletedBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const FEATURED_CARD_HEIGHT = 180;

// Story/Lecture data with images
interface Story {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  wordCount: number;
  imageUrl: string;
  featured?: boolean;
  completed?: boolean;
}

// Featured stories for the carousel
const FEATURED_STORIES: Story[] = [
  {
    id: '1',
    title: 'A Morning in Paris',
    subtitle: 'Experience the charm of French cafés',
    category: 'Travel',
    difficulty: 'beginner',
    duration: '3 min',
    wordCount: 120,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    featured: true,
  },
  {
    id: '5',
    title: 'The Tech Startup',
    subtitle: 'Business and technology vocabulary',
    category: 'Work',
    difficulty: 'advanced',
    duration: '7 min',
    wordCount: 280,
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    featured: true,
  },
  {
    id: '6',
    title: 'Weekend Adventures',
    subtitle: 'Describing hobbies and activities',
    category: 'Daily Life',
    difficulty: 'intermediate',
    duration: '4 min',
    wordCount: 160,
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    featured: true,
  },
];

// All stories
const STORIES: Story[] = [
  {
    id: '2',
    title: 'The Job Interview',
    subtitle: 'Master professional conversations',
    category: 'Work',
    difficulty: 'intermediate',
    duration: '5 min',
    wordCount: 200,
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
  },
  {
    id: '3',
    title: 'Ordering at a Restaurant',
    subtitle: 'Essential dining vocabulary',
    category: 'Food',
    difficulty: 'beginner',
    duration: '4 min',
    wordCount: 150,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    completed: true, // Demo: Mark as completed
  },
  {
    id: '4',
    title: 'Meeting New Friends',
    subtitle: 'Social introductions and small talk',
    category: 'Social',
    difficulty: 'beginner',
    duration: '3 min',
    wordCount: 130,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  },
  {
    id: '7',
    title: 'At the Doctor',
    subtitle: 'Medical vocabulary and expressions',
    category: 'Health',
    difficulty: 'intermediate',
    duration: '5 min',
    wordCount: 180,
    imageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80',
  },
  {
    id: '8',
    title: 'Shopping Day',
    subtitle: 'Retail vocabulary and bargaining',
    category: 'Daily Life',
    difficulty: 'beginner',
    duration: '4 min',
    wordCount: 140,
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  },
];

const CATEGORIES = ['All', 'Travel', 'Work', 'Food', 'Social', 'Daily Life', 'Health'];

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  const handleBack = () => {
    router.back();
  };

  const handleStoryPress = useCallback((story: Story) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/about-lecture',
      params: {
        id: story.id,
        title: story.title,
        subtitle: story.subtitle,
        category: story.category,
        difficulty: story.difficulty,
        duration: story.duration,
        wordCount: story.wordCount.toString(),
        imageUrl: story.imageUrl,
      },
    });
  }, [router]);

  const handleCategoryPress = useCallback((category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  }, []);

  const handleCarouselScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (FEATURED_CARD_WIDTH + spacing.md));
    if (index !== activeCarouselIndex && index >= 0 && index < FEATURED_STORIES.length) {
      setActiveCarouselIndex(index);
    }
  }, [activeCarouselIndex]);

  const filteredStories = selectedCategory === 'All'
    ? STORIES
    : STORIES.filter(story => story.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.success.DEFAULT;
      case 'intermediate': return colors.warning.DEFAULT;
      case 'advanced': return colors.accent.orange;
      default: return colors.text.tertiary;
    }
  };

  // Render featured card for carousel
  const renderFeaturedCard = useCallback(({ item, index }: { item: Story; index: number }) => (
    <TouchableOpacity
      onPress={() => handleStoryPress(item)}
      activeOpacity={0.9}
      style={styles.featuredCard}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.featuredImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.5, 1]}
        style={styles.featuredGradient}
      >
        <View style={styles.featuredContent}>
          <View style={styles.featuredBadgeRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '30' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                {item.difficulty}
              </Text>
            </View>
            <Text style={styles.featuredDuration}>{item.duration}</Text>
          </View>
          <Text style={styles.featuredTitle}>{item.title}</Text>
          <Text style={styles.featuredSubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [handleStoryPress, getDifficultyColor]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen gradient background */}
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary, '#1A1F3A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <BackButton onPress={handleBack} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.titleSection}>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.subtitle}>Choose a story to practice</Text>
        </Animated.View>

        {/* Featured Carousel Section */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.carouselSection}>
          <Text style={styles.sectionLabel}>Recommended</Text>

          <FlatList
            ref={carouselRef}
            data={FEATURED_STORIES}
            renderItem={renderFeaturedCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={FEATURED_CARD_WIDTH + spacing.md}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
          />

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {FEATURED_STORIES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeCarouselIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategoryPress(category)}
                style={[
                  styles.categoryPill,
                  selectedCategory === category && styles.categoryPillActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Stories List */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.storiesSection}>
          <Text style={styles.sectionLabel}>
            {selectedCategory === 'All' ? 'All Stories' : selectedCategory}
          </Text>

          {filteredStories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No stories in this category yet</Text>
            </View>
          ) : (
            filteredStories.map((story, index) => (
              <Animated.View
                key={story.id}
                entering={FadeInRight.delay(300 + index * 50).duration(300)}
              >
                <TouchableOpacity
                  onPress={() => handleStoryPress(story)}
                  activeOpacity={0.9}
                  style={[styles.storyCard, story.completed && styles.storyCardCompleted]}
                >
                  <Image
                    source={{ uri: story.imageUrl }}
                    style={styles.storyImage}
                    resizeMode="cover"
                  />
                  <View style={styles.storyContent}>
                    <View style={styles.storyHeader}>
                      <Text style={styles.storyCategory}>{story.category}</Text>
                      {story.completed ? (
                        <CompletedBadge size="small" showLabel />
                      ) : (
                        <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(story.difficulty) }]} />
                      )}
                    </View>
                    <Text style={styles.storyTitle} numberOfLines={1}>{story.title}</Text>
                    <Text style={styles.storySubtitle} numberOfLines={1}>{story.subtitle}</Text>
                    <View style={styles.storyFooter}>
                      <Text style={styles.storyMeta}>{story.duration} • {story.wordCount} words</Text>
                    </View>
                  </View>
                  <View style={styles.storyArrow}>
                    <Text style={styles.arrowText}>›</Text>
                  </View>
                  {story.completed && <CompletedOverlay />}
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Bottom Spacer */}
        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Title Section
  titleSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },

  // Carousel Section
  carouselSection: {
    marginBottom: spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: spacing.lg,
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    height: FEATURED_CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginRight: spacing.md,
    backgroundColor: colors.background.card,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  featuredContent: {},
  featuredBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  featuredDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  featuredTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  featuredSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  paginationDotActive: {
    backgroundColor: colors.primary.DEFAULT,
    width: 24,
  },

  // Section Labels
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  categoryTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  // Stories Section
  storiesSection: {
    marginBottom: spacing.lg,
  },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    position: 'relative',
  },
  storyCardCompleted: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(255, 215, 0, 0.03)',
  },
  storyImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.background.card,
  },
  storyContent: {
    flex: 1,
    padding: spacing.md,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  storyCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  storyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  storySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  storyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
  storyArrow: {
    paddingHorizontal: spacing.md,
  },
  arrowText: {
    fontSize: 24,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.light,
  },

  // Empty State
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
});
