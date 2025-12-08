/**
 * Empty States - Usage Examples
 *
 * This file demonstrates how to use the empty state components
 * in different scenarios within the Vox Language App.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  EmptyWordBank,
  EmptySearchResults,
  EmptyCategoryWords,
  EmptyDueForReview,
  EmptyState,
} from './EmptyStates';
import { colors, spacing } from '@/constants/designSystem';

/**
 * Example 1: Empty Word Bank
 * Use this when the user hasn't added any words yet
 */
export function EmptyWordBankExample() {
  const handleAddWord = () => {
    console.log('Opening add word modal...');
    // Open AddWordModal here
  };

  return (
    <View style={styles.container}>
      <EmptyWordBank
        onAction={handleAddWord}
        actionLabel="Add Your First Word"
      />
    </View>
  );
}

/**
 * Example 2: Empty Search Results
 * Use this when a search query returns no results
 */
export function EmptySearchResultsExample() {
  const handleClearSearch = () => {
    console.log('Clearing search...');
    // Clear search input and reset results
  };

  return (
    <View style={styles.container}>
      <EmptySearchResults
        onAction={handleClearSearch}
        actionLabel="Clear Search"
      />
    </View>
  );
}

/**
 * Example 3: Empty Category
 * Use this when a category has been selected but has no words
 */
export function EmptyCategoryWordsExample() {
  const handleAddWords = () => {
    console.log('Opening add word to category...');
    // Open AddWordModal with pre-selected category
  };

  return (
    <View style={styles.container}>
      <EmptyCategoryWords
        onAction={handleAddWords}
        actionLabel="Add Words to Category"
      />
    </View>
  );
}

/**
 * Example 4: No Words Due for Review
 * Use this when all words have been reviewed and none are due
 */
export function EmptyDueForReviewExample() {
  const handleBrowseVocabulary = () => {
    console.log('Navigating to vocabulary browser...');
    // Navigate to vocabulary list
  };

  return (
    <View style={styles.container}>
      <EmptyDueForReview
        onAction={handleBrowseVocabulary}
        actionLabel="Browse Vocabulary"
      />
    </View>
  );
}

/**
 * Example 5: Generic Empty State
 * Use this for custom scenarios
 */
export function GenericEmptyStateExample() {
  const handleCustomAction = () => {
    console.log('Custom action triggered...');
  };

  return (
    <View style={styles.container}>
      <EmptyState
        emoji="🌟"
        title="Custom Empty State"
        description="This is a custom empty state that can be used for any scenario"
        onAction={handleCustomAction}
        actionLabel="Custom Action"
        variant="secondary"
      />
    </View>
  );
}

/**
 * Example 6: Conditional Rendering
 * Real-world example showing conditional rendering based on data state
 */
export function ConditionalEmptyStateExample() {
  const [words, setWords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Simulated data states
  const hasWords = words.length > 0;
  const hasSearchResults = isSearching && words.length > 0;
  const noSearchResults = isSearching && words.length === 0;
  const categoryIsEmpty = selectedCategory && words.length === 0;

  const renderContent = () => {
    // No words at all
    if (!hasWords && !isSearching) {
      return (
        <EmptyWordBank
          onAction={() => console.log('Add first word')}
          actionLabel="Add Your First Word"
        />
      );
    }

    // Searching with no results
    if (noSearchResults) {
      return (
        <EmptySearchResults
          onAction={() => {
            setSearchQuery('');
            setIsSearching(false);
          }}
          actionLabel="Clear Search"
        />
      );
    }

    // Category selected but empty
    if (categoryIsEmpty) {
      return (
        <EmptyCategoryWords
          onAction={() => console.log('Add words to category')}
          actionLabel="Add Words"
        />
      );
    }

    // Render word list here
    return null;
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
}

/**
 * Example 7: Empty State with Navigation
 * Shows how to integrate with React Navigation
 */
export function EmptyStateWithNavigationExample() {
  // In a real app, you would use: const navigation = useNavigation();

  const handleNavigateToAddWord = () => {
    // navigation.navigate('AddWord');
    console.log('Navigate to AddWord screen');
  };

  const handleNavigateToCategories = () => {
    // navigation.navigate('Categories');
    console.log('Navigate to Categories screen');
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.exampleSection}>
        <EmptyWordBank onAction={handleNavigateToAddWord} />
      </View>

      <View style={styles.exampleSection}>
        <EmptyState
          emoji="📂"
          title="No Categories"
          description="Create categories to organize your vocabulary effectively"
          onAction={handleNavigateToCategories}
          actionLabel="Manage Categories"
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

/**
 * Example 8: Empty State Without Action Button
 * Sometimes you don't need an action button
 */
export function EmptyStateWithoutActionExample() {
  return (
    <View style={styles.container}>
      <EmptySearchResults />
    </View>
  );
}

/**
 * Example 9: Multiple Empty States in Tabs
 * Shows how to use different empty states in a tabbed interface
 */
export function TabbedEmptyStatesExample() {
  const [activeTab, setActiveTab] = useState<'all' | 'review' | 'mastered'>('all');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <EmptyWordBank
            onAction={() => console.log('Add word')}
            actionLabel="Add Word"
          />
        );
      case 'review':
        return (
          <EmptyDueForReview
            onAction={() => console.log('Browse vocabulary')}
            actionLabel="Browse Vocabulary"
          />
        );
      case 'mastered':
        return (
          <EmptyState
            emoji="🎓"
            title="No Mastered Words Yet"
            description="Keep practicing to master your vocabulary"
            variant="success"
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab buttons would go here */}
      {renderTabContent()}
    </View>
  );
}

/**
 * Example 10: Full Integration Example
 * Complete example showing integration with a vocabulary screen
 */
export function FullIntegrationExample() {
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    // Loading state
    if (loading) {
      return null; // Show loading spinner
    }

    // Empty word bank
    if (words.length === 0) {
      return (
        <EmptyWordBank
          onAction={() => {
            console.log('Opening add word modal');
            // setModalVisible(true);
          }}
          actionLabel="Add Your First Word"
        />
      );
    }

    // No search results
    if (searchQuery && filteredWords.length === 0) {
      return (
        <EmptySearchResults
          onAction={() => setSearchQuery('')}
          actionLabel="Clear Search"
        />
      );
    }

    // Render word list
    return null; // <WordList words={filteredWords} />
  };

  return (
    <View style={styles.container}>
      {/* Search bar would go here */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  exampleSection: {
    height: 500,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
});

// Export all examples for easy testing
export const EmptyStateExamples = {
  EmptyWordBankExample,
  EmptySearchResultsExample,
  EmptyCategoryWordsExample,
  EmptyDueForReviewExample,
  GenericEmptyStateExample,
  ConditionalEmptyStateExample,
  EmptyStateWithNavigationExample,
  EmptyStateWithoutActionExample,
  TabbedEmptyStatesExample,
  FullIntegrationExample,
};
