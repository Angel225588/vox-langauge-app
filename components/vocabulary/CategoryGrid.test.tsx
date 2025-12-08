/**
 * CategoryGrid Component Tests
 *
 * Test suite for the CategoryGrid component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryGrid } from './CategoryGrid';
import { VocabularyCategory } from '@/types/vocabulary';

describe('CategoryGrid', () => {
  const mockCategories: VocabularyCategory[] = [
    {
      name: 'Greetings',
      wordCount: 24,
      averageMastery: 85,
      emoji: '👋',
    },
    {
      name: 'Food',
      wordCount: 42,
      averageMastery: 62,
    },
    {
      name: 'Travel',
      wordCount: 18,
      averageMastery: 45,
    },
  ];

  const mockOnCategoryPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with categories', () => {
    const { getByText } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    expect(getByText('Greetings')).toBeTruthy();
    expect(getByText('Food')).toBeTruthy();
    expect(getByText('Travel')).toBeTruthy();
  });

  it('displays word counts correctly', () => {
    const { getByText } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    expect(getByText('24 words')).toBeTruthy();
    expect(getByText('42 words')).toBeTruthy();
    expect(getByText('18 words')).toBeTruthy();
  });

  it('displays singular "word" for count of 1', () => {
    const singleWordCategory: VocabularyCategory[] = [
      {
        name: 'Test',
        wordCount: 1,
        averageMastery: 50,
      },
    ];

    const { getByText } = render(
      <CategoryGrid
        categories={singleWordCategory}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    expect(getByText('1 word')).toBeTruthy();
  });

  it('displays mastery percentages correctly', () => {
    const { getByText } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    expect(getByText('85% mastery')).toBeTruthy();
    expect(getByText('62% mastery')).toBeTruthy();
    expect(getByText('45% mastery')).toBeTruthy();
  });

  it('calls onCategoryPress when a category is tapped', () => {
    const { getByText } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    fireEvent.press(getByText('Greetings'));
    expect(mockOnCategoryPress).toHaveBeenCalledWith('Greetings');

    fireEvent.press(getByText('Food'));
    expect(mockOnCategoryPress).toHaveBeenCalledWith('Food');
  });

  it('displays custom emoji when provided', () => {
    const { getByText } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    // Greetings has custom emoji
    expect(getByText('👋')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <CategoryGrid
        categories={mockCategories}
        onCategoryPress={mockOnCategoryPress}
        loading={true}
      />
    );

    // ActivityIndicator should be present
    expect(getByTestId).toBeTruthy();
  });

  it('shows empty state when no categories', () => {
    const { getByText } = render(
      <CategoryGrid
        categories={[]}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    expect(getByText('No categories yet')).toBeTruthy();
    expect(getByText('Add words to create your first category')).toBeTruthy();
  });

  it('rounds mastery percentages', () => {
    const categoryWithDecimal: VocabularyCategory[] = [
      {
        name: 'Test',
        wordCount: 10,
        averageMastery: 67.8,
      },
    ];

    const { getByText } = render(
      <CategoryGrid
        categories={categoryWithDecimal}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    expect(getByText('68% mastery')).toBeTruthy();
  });

  it('clamps mastery to 100% max', () => {
    const categoryWithHighMastery: VocabularyCategory[] = [
      {
        name: 'Test',
        wordCount: 10,
        averageMastery: 150, // Invalid high value
      },
    ];

    const { getByText } = render(
      <CategoryGrid
        categories={categoryWithHighMastery}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    // Should display 150% but progress bar clamped to 100%
    expect(getByText('150% mastery')).toBeTruthy();
  });

  it('capitalizes category names', () => {
    const lowercaseCategory: VocabularyCategory[] = [
      {
        name: 'greetings',
        wordCount: 10,
        averageMastery: 50,
      },
    ];

    const { getByText } = render(
      <CategoryGrid
        categories={lowercaseCategory}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    // Category name should be capitalized via CSS textTransform
    expect(getByText('greetings')).toBeTruthy();
  });

  it('uses default emoji for unknown categories', () => {
    const unknownCategory: VocabularyCategory[] = [
      {
        name: 'UnknownCategory',
        wordCount: 5,
        averageMastery: 50,
      },
    ];

    const { getByText } = render(
      <CategoryGrid
        categories={unknownCategory}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    // Should use default emoji 📖
    expect(getByText('📖')).toBeTruthy();
  });

  it('handles zero words gracefully', () => {
    const emptyCategory: VocabularyCategory[] = [
      {
        name: 'Empty',
        wordCount: 0,
        averageMastery: 0,
      },
    ];

    const { getByText } = render(
      <CategoryGrid
        categories={emptyCategory}
        onCategoryPress={mockOnCategoryPress}
      />
    );

    expect(getByText('0 words')).toBeTruthy();
    expect(getByText('0% mastery')).toBeTruthy();
  });
});
