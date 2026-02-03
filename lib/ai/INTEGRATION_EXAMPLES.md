# AI Memory System - Integration Examples

Real-world examples of integrating the AI Memory system into the Vox Language App.

## 1. Onboarding Flow Integration

### In Onboarding Completion Handler

```typescript
// app/(onboarding)/complete.tsx
import { initializeUserMemory } from '@/lib/ai';
import { useAuth } from '@/lib/hooks/useAuth';

export default function OnboardingComplete() {
  const { user } = useAuth();
  const router = useRouter();

  const handleComplete = async (formData: OnboardingFormData) => {
    try {
      // Save onboarding data to user profile
      await saveUserProfile(user.id, formData);

      // Initialize AI memory
      const memory = await initializeUserMemory({
        user_id: user.id,
        native_language: formData.nativeLanguage,
        target_language: formData.targetLanguage,
        motivation: formData.motivation,
        motivation_custom: formData.motivationCustom,
        proficiency_level: formData.proficiencyLevel,
        commitment_stakes: formData.commitmentStakes,
      });

      console.log('AI Memory initialized:', memory);

      // Navigate to calibration or home
      if (formData.proficiencyLevel === 'beginner') {
        router.push('/(tabs)/home');
      } else {
        router.push('/calibration');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  return (
    <OnboardingForm onSubmit={handleComplete} />
  );
}
```

## 2. Lesson Completion Integration

### In Lesson Results Screen

```typescript
// components/lessons/LessonResults.tsx
import { updateMemoryAfterLesson } from '@/lib/ai';
import { useAuth } from '@/lib/hooks/useAuth';

interface LessonResultsProps {
  lessonId: string;
  lessonType: LessonType;
  cardsGood: number;
  cardsTotal: number;
  vocabLearned: string[];
  timeSpent: number;
  onContinue: () => void;
}

export function LessonResults({
  lessonId,
  lessonType,
  cardsGood,
  cardsTotal,
  vocabLearned,
  timeSpent,
  onContinue,
}: LessonResultsProps) {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const updateMemory = async () => {
      setUpdating(true);
      try {
        await updateMemoryAfterLesson(user.id, {
          lesson_type: lessonType,
          cards_good: cardsGood,
          cards_total: cardsTotal,
          vocab_learned: vocabLearned,
          time_spent: timeSpent,
        });
        console.log('AI Memory updated after lesson');
      } catch (error) {
        console.error('Failed to update AI memory:', error);
      } finally {
        setUpdating(false);
      }
    };

    updateMemory();
  }, []);

  const accuracy = Math.round((cardsGood / cardsTotal) * 100);

  return (
    <View>
      <Text>Lesson Complete!</Text>
      <Text>Accuracy: {accuracy}%</Text>
      <Text>New Words: {vocabLearned.length}</Text>
      <Button onPress={onContinue} disabled={updating}>
        Continue
      </Button>
    </View>
  );
}
```

## 3. Calibration Integration

### In Calibration Flow

```typescript
// components/calibration/CalibrationComplete.tsx
import { updateMemoryAfterCalibrator } from '@/lib/ai';
import { useAuth } from '@/lib/hooks/useAuth';
import type { CalibrationResult } from '@/types/calibration';

interface CalibrationCompleteProps {
  result: CalibrationResult;
  onComplete: () => void;
}

export function CalibrationComplete({ result, onComplete }: CalibrationCompleteProps) {
  const { user } = useAuth();
  const [memory, setMemory] = useState<UserAIMemory | null>(null);

  useEffect(() => {
    const updateMemory = async () => {
      try {
        const updatedMemory = await updateMemoryAfterCalibrator(user.id, result);
        setMemory(updatedMemory);
        console.log('AI Memory updated after calibration');
      } catch (error) {
        console.error('Failed to update AI memory:', error);
      }
    };

    updateMemory();
  }, []);

  if (!memory) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView>
      <Text>Calibration Complete!</Text>
      <Text>Your Level: {memory.current_cefr_level}</Text>

      <Section title="Your Strengths">
        {memory.insights.strengths.map((strength) => (
          <Chip key={strength} label={strength} />
        ))}
      </Section>

      <Section title="Areas to Improve">
        {memory.insights.weaknesses.map((weakness) => (
          <Chip key={weakness} label={weakness} />
        ))}
      </Section>

      <Section title="Recommended Focus">
        {memory.recommendations.focus_areas.map((area) => (
          <ListItem key={area} text={area} />
        ))}
      </Section>

      <Button onPress={onComplete}>Start Learning</Button>
    </ScrollView>
  );
}
```

## 4. AI Lesson Generation

### Using Memory Context in Gemini Prompts

```typescript
// lib/gemini/lesson-generator.ts
import { getUserMemory, generateMemorySummary } from '@/lib/ai';
import { generateContent } from '@/lib/ai/gemini';

export async function generatePersonalizedLesson(
  userId: string,
  lessonType: LessonType
): Promise<LessonContent> {
  // Get user's AI memory
  const memory = await getUserMemory(userId);

  if (!memory) {
    throw new Error('User memory not found');
  }

  // Generate memory summary for context
  const memorySummary = generateMemorySummary(memory);

  // Create personalized prompt
  const prompt = `
${memorySummary}

Based on the user's profile, learning history, and AI observations above, create a ${lessonType} lesson that:

1. Addresses their weaknesses: ${memory.insights.weaknesses.join(', ')}
2. Builds on their strengths: ${memory.insights.strengths.join(', ')}
3. Aligns with their motivation: ${memory.motivation}
4. Matches their ${memory.current_cefr_level} level
5. Focuses on their recommended areas: ${memory.recommendations.focus_areas.join(', ')}

Generate a 10-card lesson with appropriate difficulty and relevant vocabulary.
Include examples that relate to their preferred topics: ${memory.insights.preferred_topics.join(', ')}.

Return the lesson in JSON format.
`;

  // Generate with Gemini
  const response = await generateContent(prompt);

  return JSON.parse(response);
}
```

## 5. Progress Dashboard

### Displaying User Stats

```typescript
// app/(tabs)/profile.tsx
import { getUserMemory } from '@/lib/ai';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [memory, setMemory] = useState<UserAIMemory | null>(null);

  useEffect(() => {
    const loadMemory = async () => {
      const userMemory = await getUserMemory(user.id);
      setMemory(userMemory);
    };

    loadMemory();
  }, [user.id]);

  if (!memory) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView>
      <ProfileHeader user={user} />

      <StatsSection>
        <StatCard
          icon="🎯"
          label="Current Level"
          value={memory.current_cefr_level}
        />
        <StatCard
          icon="🔥"
          label="Streak"
          value={`${memory.current_streak} days`}
        />
        <StatCard
          icon="📚"
          label="Vocabulary"
          value={`${memory.total_vocab_learned} words`}
        />
        <StatCard
          icon="✅"
          label="Lessons"
          value={memory.total_lessons_completed}
        />
      </StatsSection>

      <SkillsSection>
        <SkillBar
          label="Vocabulary"
          score={memory.skill_scores.vocabulary}
        />
        <SkillBar
          label="Grammar"
          score={memory.skill_scores.grammar}
        />
        <SkillBar
          label="Speaking"
          score={memory.skill_scores.speaking}
        />
        <SkillBar
          label="Listening"
          score={memory.skill_scores.listening}
        />
      </SkillsSection>

      <InsightsSection>
        <InsightCard
          title="Your Strengths"
          items={memory.insights.strengths}
          icon="💪"
        />
        <InsightCard
          title="Areas to Improve"
          items={memory.insights.weaknesses}
          icon="📈"
        />
      </InsightsSection>

      <RecommendationsSection>
        <Text>Next Milestone: {memory.recommendations.next_milestone}</Text>
        <Text>Time to Next Level: {memory.recommendations.estimated_time_to_next_level}</Text>
        <Text>Recommended Practice: {memory.recommendations.practice_frequency}</Text>
      </RecommendationsSection>

      <RecentWins>
        {memory.ai_observations.wins.slice(-3).map((win, index) => (
          <WinCard key={index} text={win} />
        ))}
      </RecentWins>
    </ScrollView>
  );
}
```

## 6. Adaptive Lesson Selection

### Smart Lesson Recommendations

```typescript
// lib/lessons/recommendLessons.ts
import { getUserMemory } from '@/lib/ai';

export async function getRecommendedLessons(
  userId: string,
  count: number = 5
): Promise<LessonRecommendation[]> {
  const memory = await getUserMemory(userId);

  if (!memory) {
    return getDefaultLessons(count);
  }

  const recommendations: LessonRecommendation[] = [];

  // Prioritize weak areas
  for (const weakness of memory.insights.weaknesses) {
    const lessonType = mapWeaknessToLessonType(weakness);
    recommendations.push({
      type: lessonType,
      reason: `Improve your ${weakness}`,
      priority: 'high',
    });
  }

  // Add suggested lesson types from AI
  for (const lessonType of memory.recommendations.suggested_lesson_types) {
    if (!recommendations.some(r => r.type === lessonType)) {
      recommendations.push({
        type: lessonType,
        reason: 'Recommended by AI',
        priority: 'medium',
      });
    }
  }

  // Fill remaining with preferred types
  for (const lessonType of memory.insights.preferred_lesson_types) {
    if (recommendations.length >= count) break;
    if (!recommendations.some(r => r.type === lessonType)) {
      recommendations.push({
        type: lessonType,
        reason: 'Based on your preferences',
        priority: 'low',
      });
    }
  }

  return recommendations.slice(0, count);
}
```

## 7. Daily Reminder Personalization

### Context-Aware Notifications

```typescript
// lib/notifications/dailyReminder.ts
import { getUserMemory } from '@/lib/ai';

export async function generateDailyReminderMessage(
  userId: string
): Promise<string> {
  const memory = await getUserMemory(userId);

  if (!memory) {
    return "Time to practice! Let's learn something new today.";
  }

  const { current_streak, insights, recommendations } = memory;

  // Streak-based messages
  if (current_streak >= 7) {
    return `Amazing ${current_streak}-day streak! Keep it going! 🔥`;
  }

  if (current_streak === 0) {
    return `Ready to start a new streak? Let's practice ${insights.weaknesses[0]} today!`;
  }

  // Weakness-focused messages
  if (insights.weaknesses.length > 0) {
    const weakness = insights.weaknesses[0];
    return `Quick practice with ${weakness}? Just ${recommendations.practice_frequency} today!`;
  }

  // Default motivational message
  return `Your ${memory.motivation} goal is waiting! Let's practice! 🎯`;
}
```

## 8. Weekly Progress Report

### Generate AI-Powered Summary

```typescript
// lib/reports/weeklyProgress.ts
import { getUserMemory, analyzePatterns } from '@/lib/ai';

export async function generateWeeklyReport(
  userId: string,
  lessonHistory: LessonProgress[]
): Promise<WeeklyReport> {
  const memory = await getUserMemory(userId);
  const patterns = analyzePatterns(lessonHistory);

  if (!memory) {
    throw new Error('User memory not found');
  }

  const weekLessons = lessonHistory.length;
  const weekVocab = lessonHistory.reduce(
    (sum, l) => sum + l.vocab_learned.length,
    0
  );
  const weekTime = lessonHistory.reduce(
    (sum, l) => sum + l.time_spent,
    0
  );

  return {
    period: 'This Week',
    lessons_completed: weekLessons,
    vocab_learned: weekVocab,
    time_spent: weekTime,
    current_level: memory.current_cefr_level,
    current_streak: memory.current_streak,
    strengths: patterns.strengths,
    areas_to_improve: patterns.weaknesses,
    ai_insights: patterns.observations.slice(0, 3),
    next_milestone: memory.recommendations.next_milestone,
    motivational_message: generateMotivationalMessage(memory, patterns),
  };
}

function generateMotivationalMessage(
  memory: UserAIMemory,
  patterns: { strengths: string[]; weaknesses: string[]; observations: string[] }
): string {
  if (patterns.strengths.length > 0) {
    return `Great progress in ${patterns.strengths.join(' and ')}! Keep up the momentum!`;
  }

  return `You're ${memory.insights.learning_velocity === 'fast' ? 'moving fast' : 'making steady progress'}! Stay consistent!`;
}
```

## Best Practices

1. **Always check for null**: `getUserMemory` can return null if memory doesn't exist
2. **Update asynchronously**: Don't block UI on memory updates
3. **Handle errors gracefully**: Memory updates shouldn't break the app flow
4. **Use memory context in AI prompts**: Include `generateMemorySummary()` for personalization
5. **Batch updates when possible**: Update multiple fields at once with `updateUserMemory`
6. **Respect user privacy**: Memory data should only be used for personalization
7. **Monitor performance**: Memory operations should be fast (consider caching)

## Testing Integration

```typescript
// __tests__/integration/aiMemory.test.tsx
import { render, waitFor } from '@testing-library/react-native';
import { initializeUserMemory, getUserMemory } from '@/lib/ai';

describe('AI Memory Integration', () => {
  it('should initialize memory and load in profile screen', async () => {
    const userId = 'test_user';

    await initializeUserMemory({
      user_id: userId,
      native_language: 'Spanish',
      target_language: 'English',
      motivation: 'Test',
      proficiency_level: 'intermediate',
      commitment_stakes: 'Test',
    });

    const { getByText } = render(<ProfileScreen userId={userId} />);

    await waitFor(() => {
      expect(getByText('B1')).toBeTruthy();
    });
  });
});
```

## Next Steps

1. Implement Supabase database integration
2. Add real-time sync across devices
3. Create analytics dashboard for memory insights
4. Build ML models for pattern recognition
5. Add export/import functionality for user data
