// @ts-nocheck — Usage guide / reference file, not imported in production
/**
 * Skeleton Usage Guide
 *
 * Real-world examples of how to integrate skeleton loaders into your components.
 * Copy and adapt these patterns for your loading states.
 */

import React from 'react';
import { View } from 'react-native';
import {
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonList,
  SkeletonButton,
} from './Skeleton';

/**
 * Pattern 1: Simple Loading State with Conditional Rendering
 *
 * The most common pattern - show skeleton while loading, then show content.
 */
interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Simulate API call
    fetchUser(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  // Show skeleton while loading
  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SkeletonCircle size={64} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <SkeletonBox width="70%" height={20} />
            <SkeletonBox width="50%" height={16} style={{ marginTop: 8 }} />
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <SkeletonText lines={3} />
        </View>
      </View>
    );
  }

  // Show actual content
  return (
    <View style={{ padding: 16 }}>
      {/* ... actual user profile content ... */}
    </View>
  );
}

/**
 * Pattern 2: Using Pre-composed Components
 *
 * Fastest way to add loading states - use the pre-built skeleton components.
 */
export function LessonCard({ lessonId }: { lessonId: string }) {
  const { data, isLoading } = useLessonData(lessonId);

  if (isLoading) {
    return <SkeletonCard showImage imageHeight={180} lines={2} />;
  }

  return (
    <View>
      {/* ... actual lesson card ... */}
    </View>
  );
}

/**
 * Pattern 3: List with Loading State
 *
 * Show skeleton items while loading a list.
 */
export function LessonsList() {
  const { data, isLoading } = useLessons();

  if (isLoading) {
    return <SkeletonList count={5} showAvatar={false} showThumbnail />;
  }

  return (
    <View>
      {data.map((lesson) => (
        <LessonItem key={lesson.id} lesson={lesson} />
      ))}
    </View>
  );
}

/**
 * Pattern 4: Partial Loading (Loading Individual Sections)
 *
 * Show skeletons for specific sections while others remain visible.
 */
export function Dashboard() {
  const { stats, isLoadingStats } = useStats();
  const { lessons, isLoadingLessons } = useLessons();

  return (
    <View style={{ padding: 16 }}>
      {/* Header - always visible */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Dashboard</Text>
      </View>

      {/* Stats section - can load independently */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Your Stats
        </Text>
        {isLoadingStats ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <SkeletonBox width={100} height={80} borderRadius={12} />
            <SkeletonBox width={100} height={80} borderRadius={12} />
            <SkeletonBox width={100} height={80} borderRadius={12} />
          </View>
        ) : (
          <StatsGrid stats={stats} />
        )}
      </View>

      {/* Lessons section - loads independently */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Recent Lessons
        </Text>
        {isLoadingLessons ? (
          <SkeletonList count={3} showThumbnail />
        ) : (
          <LessonsList lessons={lessons} />
        )}
      </View>
    </View>
  );
}

/**
 * Pattern 5: Skeleton Matching Exact Layout
 *
 * Create a custom skeleton that exactly matches your component's layout.
 */
export function VocabularyCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: '#1A1F3A',
        borderRadius: 16,
        padding: 24,
        margin: 16,
      }}
    >
      {/* Card image area */}
      <SkeletonBox width="100%" height={200} borderRadius={12} />

      {/* Word and pronunciation */}
      <View style={{ marginTop: 24 }}>
        <SkeletonBox width="60%" height={32} style={{ marginBottom: 12 }} />
        <SkeletonBox width="40%" height={18} />
      </View>

      {/* Definition */}
      <View style={{ marginTop: 24 }}>
        <SkeletonBox width={100} height={16} style={{ marginBottom: 8 }} />
        <SkeletonText lines={2} />
      </View>

      {/* Examples */}
      <View style={{ marginTop: 20 }}>
        <SkeletonBox width={100} height={16} style={{ marginBottom: 8 }} />
        <SkeletonText lines={1} />
      </View>

      {/* Action buttons */}
      <View
        style={{
          flexDirection: 'row',
          marginTop: 32,
          justifyContent: 'space-between',
        }}
      >
        <SkeletonButton width="48%" height={48} />
        <SkeletonButton width="48%" height={48} />
      </View>
    </View>
  );
}

/**
 * Pattern 6: Progressive Loading
 *
 * Show basic structure immediately, then load details.
 */
export function ArticleReader({ articleId }: { articleId: string }) {
  const [articleMeta, setArticleMeta] = React.useState(null);
  const [articleContent, setArticleContent] = React.useState(null);
  const [loadingMeta, setLoadingMeta] = React.useState(true);
  const [loadingContent, setLoadingContent] = React.useState(true);

  React.useEffect(() => {
    // Load metadata first (fast)
    fetchArticleMeta(articleId).then((meta) => {
      setArticleMeta(meta);
      setLoadingMeta(false);
    });

    // Load content second (slower)
    fetchArticleContent(articleId).then((content) => {
      setArticleContent(content);
      setLoadingContent(false);
    });
  }, [articleId]);

  return (
    <View style={{ padding: 16 }}>
      {/* Metadata loads first */}
      {loadingMeta ? (
        <View>
          <SkeletonBox width="80%" height={28} style={{ marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonCircle size={32} />
            <View style={{ marginLeft: 12 }}>
              <SkeletonBox width={120} height={14} />
            </View>
          </View>
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            {articleMeta.title}
          </Text>
          <Text style={{ fontSize: 14, color: '#999' }}>{articleMeta.author}</Text>
        </View>
      )}

      {/* Content loads second */}
      <View style={{ marginTop: 24 }}>
        {loadingContent ? (
          <View>
            <SkeletonText lines={10} lineSpacing={16} lineHeight={18} />
          </View>
        ) : (
          <Text>{articleContent.text}</Text>
        )}
      </View>
    </View>
  );
}

/**
 * Pattern 7: Infinite Scroll Loading
 *
 * Show skeleton at the bottom while loading more items.
 */
export function InfiniteScrollList() {
  const [items, setItems] = React.useState([]);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const loadMore = () => {
    setLoadingMore(true);
    fetchMoreItems().then((newItems) => {
      setItems([...items, ...newItems]);
      setLoadingMore(false);
    });
  };

  return (
    <ScrollView onEndReached={loadMore}>
      {items.map((item) => (
        <ListItem key={item.id} item={item} />
      ))}

      {/* Show skeleton while loading more */}
      {loadingMore && (
        <View style={{ padding: 16 }}>
          <SkeletonList count={3} />
        </View>
      )}
    </ScrollView>
  );
}

/**
 * Pattern 8: Error State with Retry
 *
 * Handle loading, error, and success states.
 */
export function DataComponent({ id }: { id: string }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(() => {
    setLoading(true);
    setError(null);

    fetchData(id)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Show skeleton while loading
  if (loading) {
    return <SkeletonCard />;
  }

  // Show error with retry button
  if (error) {
    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#EF4444', marginBottom: 16 }}>
          Failed to load data
        </Text>
        <Button onPress={loadData}>Retry</Button>
      </View>
    );
  }

  // Show actual data
  return <DataDisplay data={data} />;
}

/**
 * Pattern 9: Optimistic Updates with Skeleton Fallback
 *
 * Show immediate feedback, fall back to skeleton if needed.
 */
export function OptimisticList() {
  const [items, setItems] = React.useState([]);
  const [pendingItems, setPendingItems] = React.useState([]);

  const addItem = async (newItem: any) => {
    // Add to pending immediately (optimistic)
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...newItem, id: tempId, pending: true };
    setPendingItems([...pendingItems, optimisticItem]);

    try {
      // Save to server
      const savedItem = await saveItem(newItem);

      // Replace optimistic item with real one
      setPendingItems(pendingItems.filter((item) => item.id !== tempId));
      setItems([...items, savedItem]);
    } catch (error) {
      // Remove optimistic item on error
      setPendingItems(pendingItems.filter((item) => item.id !== tempId));
      // Show error message
    }
  };

  return (
    <View>
      {items.map((item) => (
        <ListItem key={item.id} item={item} />
      ))}

      {/* Show pending items as skeletons */}
      {pendingItems.map((item) => (
        <View key={item.id} style={{ opacity: 0.6 }}>
          <SkeletonBox width="100%" height={80} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

/**
 * Helper: Custom Hook for Loading States
 *
 * Reusable hook that returns skeleton component for loading state.
 */
function useLoadingState<T>(
  fetchFn: () => Promise<T>,
  SkeletonComponent: React.ComponentType
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchFn().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  return {
    data,
    loading,
    Component: loading ? SkeletonComponent : null,
  };
}

// Usage:
export function ExampleWithHook() {
  const { data, Component } = useLoadingState(
    () => fetchLessonData(),
    () => <SkeletonCard />
  );

  return Component || <LessonDisplay data={data} />;
}

// Dummy functions for examples
function fetchUser(userId: string): Promise<any> {
  return Promise.resolve({});
}
function useLessonData(lessonId: string) {
  return { data: null, isLoading: true };
}
function useLessons() {
  return { data: [], isLoading: true };
}
function useStats() {
  return { stats: null, isLoadingStats: true };
}
function fetchArticleMeta(articleId: string): Promise<any> {
  return Promise.resolve({});
}
function fetchArticleContent(articleId: string): Promise<any> {
  return Promise.resolve({});
}
function fetchMoreItems(): Promise<any[]> {
  return Promise.resolve([]);
}
function fetchData(id: string): Promise<any> {
  return Promise.resolve({});
}
function saveItem(item: any): Promise<any> {
  return Promise.resolve({});
}
function fetchLessonData(): Promise<any> {
  return Promise.resolve({});
}

// Dummy components
function LessonItem({ lesson }: any) {
  return null;
}
function StatsGrid({ stats }: any) {
  return null;
}
function LessonsList({ lessons }: any) {
  return null;
}
function DataDisplay({ data }: any) {
  return null;
}
function Button({ children, onPress }: any) {
  return null;
}
function ListItem({ item }: any) {
  return null;
}
function LessonDisplay({ data }: any) {
  return null;
}
function Text({ children, style }: any) {
  return null;
}
function ScrollView({ children, onEndReached }: any) {
  return null;
}
