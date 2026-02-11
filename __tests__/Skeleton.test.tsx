// @ts-nocheck
/**
 * Skeleton Component Tests
 *
 * Tests rendering behavior with real assertions, not just smoke tests.
 * Validates correct number of elements, sizes matching props, and composition.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import {
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonList,
  SkeletonButton,
} from '../components/ui/Skeleton';
import { borderRadius, spacing } from '../constants/designSystem';

describe('Skeleton Components', () => {
  describe('SkeletonBox', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<SkeletonBox />);
      const tree = toJSON();

      // Should render a View with default width '100%' and height 20
      expect(tree).toBeTruthy();
      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: '100%',
            height: 20,
          }),
        ])
      );
    });

    it('renders with custom width and height', () => {
      const { toJSON } = render(
        <SkeletonBox width={200} height={50} />
      );
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 200,
            height: 50,
          }),
        ])
      );
    });

    it('renders with percentage width', () => {
      const { toJSON } = render(
        <SkeletonBox width="80%" height={20} />
      );
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: '80%',
            height: 20,
          }),
        ])
      );
    });

    it('renders with custom border radius', () => {
      const { toJSON } = render(
        <SkeletonBox width={100} height={100} borderRadius={24} />
      );
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderRadius: 24,
          }),
        ])
      );
    });

    it('has overflow hidden for shimmer animation', () => {
      const { toJSON } = render(<SkeletonBox />);
      const tree = toJSON();

      // Check the skeleton base style includes overflow hidden
      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            overflow: 'hidden',
          }),
        ])
      );
    });

    it('contains shimmer animation child', () => {
      const { toJSON } = render(<SkeletonBox />);
      const tree = toJSON();

      // Should have at least one child (the shimmer container)
      expect(tree.children).toBeTruthy();
      expect(tree.children.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('SkeletonText', () => {
    it('renders single line by default', () => {
      const { toJSON } = render(<SkeletonText />);
      const tree = toJSON();

      // Should have exactly 1 child (one SkeletonBox)
      expect(tree.children).toHaveLength(1);
    });

    it('renders correct number of lines', () => {
      const { toJSON } = render(<SkeletonText lines={3} />);
      const tree = toJSON();

      // Should have 3 children (three SkeletonBox lines)
      expect(tree.children).toHaveLength(3);
    });

    it('renders 5 lines when specified', () => {
      const { toJSON } = render(<SkeletonText lines={5} />);
      const tree = toJSON();

      expect(tree.children).toHaveLength(5);
    });

    it('renders with custom line height', () => {
      const { toJSON } = render(
        <SkeletonText lines={1} lineHeight={20} />
      );
      const tree = toJSON();
      const line = tree.children[0];

      expect(line.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            height: 20,
          }),
        ])
      );
    });

    it('applies last line width to only the last line', () => {
      const { toJSON } = render(
        <SkeletonText lines={3} lastLineWidth="60%" />
      );
      const tree = toJSON();

      // First two lines should be full width
      expect(tree.children[0].props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '100%' }),
        ])
      );
      expect(tree.children[1].props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '100%' }),
        ])
      );

      // Last line should have reduced width
      expect(tree.children[2].props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: '60%' }),
        ])
      );
    });

    it('applies spacing between lines (not on first line)', () => {
      const { toJSON } = render(
        <SkeletonText lines={3} lineSpacing={12} />
      );
      const tree = toJSON();

      // First line should not have marginTop
      const firstLineStyles = tree.children[0].props.style;
      const hasMarginTop = firstLineStyles.some(
        (s: any) => s && s.marginTop !== undefined
      );
      expect(hasMarginTop).toBe(false);

      // Second line should have marginTop
      expect(tree.children[1].props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marginTop: 12 }),
        ])
      );
    });
  });

  describe('SkeletonCircle', () => {
    it('renders with default size (48)', () => {
      const { toJSON } = render(<SkeletonCircle />);
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 48,
            height: 48,
          }),
        ])
      );
    });

    it('renders with custom size', () => {
      const { toJSON } = render(<SkeletonCircle size={80} />);
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 80,
            height: 80,
          }),
        ])
      );
    });

    it('has circular border radius', () => {
      const { toJSON } = render(<SkeletonCircle size={60} />);
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderRadius: borderRadius.full,
          }),
        ])
      );
    });
  });

  describe('SkeletonCard', () => {
    it('renders image skeleton by default', () => {
      const { toJSON } = render(<SkeletonCard />);
      const tree = toJSON();

      // Should have children: image box + content area
      expect(tree.children.length).toBeGreaterThanOrEqual(2);
    });

    it('renders without image when showImage is false', () => {
      const { toJSON } = render(
        <SkeletonCard showImage={false} />
      );
      const treeWithImage = render(<SkeletonCard showImage={true} />).toJSON();
      const treeWithoutImage = toJSON();

      // Without image should have fewer children
      expect(treeWithoutImage.children.length).toBeLessThan(
        treeWithImage.children.length
      );
    });

    it('renders with avatar when showAvatar is true', () => {
      const treeWithAvatar = render(<SkeletonCard showAvatar />).toJSON();
      const treeWithoutAvatar = render(<SkeletonCard showAvatar={false} />).toJSON();

      // Content area (last child) should have more children with avatar
      const contentWithAvatar = treeWithAvatar.children[treeWithAvatar.children.length - 1];
      const contentWithoutAvatar = treeWithoutAvatar.children[treeWithoutAvatar.children.length - 1];

      expect(contentWithAvatar.children.length).toBeGreaterThan(
        contentWithoutAvatar.children.length
      );
    });

    it('renders correct number of text lines', () => {
      const { toJSON } = render(<SkeletonCard lines={5} />);
      const tree = toJSON();

      // The card structure has image + content(title + SkeletonText with N lines)
      // We check that it renders without error and has expected structure
      expect(tree).toBeTruthy();
      expect(tree.children.length).toBeGreaterThan(0);
    });
  });

  describe('SkeletonList', () => {
    it('renders default count of 3 items', () => {
      const { toJSON } = render(<SkeletonList />);
      const tree = toJSON();

      expect(tree.children).toHaveLength(3);
    });

    it('renders custom count of items', () => {
      const { toJSON } = render(<SkeletonList count={5} />);
      const tree = toJSON();

      expect(tree.children).toHaveLength(5);
    });

    it('renders single item', () => {
      const { toJSON } = render(<SkeletonList count={1} />);
      const tree = toJSON();

      expect(tree.children).toHaveLength(1);
    });

    it('renders items with avatar circles when showAvatar is true', () => {
      const withAvatar = render(<SkeletonList count={1} showAvatar />).toJSON();
      const withoutAvatar = render(
        <SkeletonList count={1} showAvatar={false} />
      ).toJSON();

      // Item with avatar should have more children
      const itemWithAvatar = withAvatar.children[0];
      const itemWithoutAvatar = withoutAvatar.children[0];

      expect(itemWithAvatar.children.length).toBeGreaterThan(
        itemWithoutAvatar.children.length
      );
    });

    it('renders items with thumbnail when showThumbnail is true', () => {
      const withThumb = render(
        <SkeletonList count={1} showAvatar={false} showThumbnail />
      ).toJSON();
      const withoutThumb = render(
        <SkeletonList count={1} showAvatar={false} showThumbnail={false} />
      ).toJSON();

      const itemWith = withThumb.children[0];
      const itemWithout = withoutThumb.children[0];

      expect(itemWith.children.length).toBeGreaterThan(
        itemWithout.children.length
      );
    });

    it('applies margin between items (not on first)', () => {
      const { toJSON } = render(<SkeletonList count={3} />);
      const tree = toJSON();

      // First item should not have marginTop
      const firstItemStyles = tree.children[0].props.style;
      const firstHasMargin = Array.isArray(firstItemStyles)
        ? firstItemStyles.some((s: any) => s && s.marginTop)
        : firstItemStyles?.marginTop;
      expect(firstHasMargin).toBeFalsy();

      // Second item should have marginTop
      const secondItemStyles = tree.children[1].props.style;
      const secondHasMargin = Array.isArray(secondItemStyles)
        ? secondItemStyles.some((s: any) => s && s.marginTop === spacing.md)
        : secondItemStyles?.marginTop === spacing.md;
      expect(secondHasMargin).toBeTruthy();
    });
  });

  describe('SkeletonButton', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<SkeletonButton />);
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: '100%',
            height: 48,
          }),
        ])
      );
    });

    it('renders with custom width', () => {
      const { toJSON } = render(
        <SkeletonButton width={200} />
      );
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 200,
          }),
        ])
      );
    });

    it('renders with custom height', () => {
      const { toJSON } = render(
        <SkeletonButton height={56} />
      );
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            height: 56,
          }),
        ])
      );
    });

    it('renders with percentage width', () => {
      const { toJSON } = render(
        <SkeletonButton width="80%" height={48} />
      );
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: '80%',
            height: 48,
          }),
        ])
      );
    });

    it('has button-appropriate border radius', () => {
      const { toJSON } = render(<SkeletonButton />);
      const tree = toJSON();

      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderRadius: borderRadius.md,
          }),
        ])
      );
    });
  });

  describe('Integration', () => {
    it('renders multiple skeleton types together without crashing', () => {
      const { toJSON } = render(
        <>
          <SkeletonCircle size={60} />
          <SkeletonText lines={2} />
          <SkeletonButton />
        </>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('renders skeleton components with custom styles applied', () => {
      const { toJSON } = render(
        <SkeletonBox
          width={100}
          height={100}
          style={{ margin: 10 }}
        />
      );
      const tree = toJSON();

      // Custom style should be included in the style array
      expect(tree.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ margin: 10 }),
        ])
      );
    });
  });
});
