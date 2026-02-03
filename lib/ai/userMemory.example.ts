/**
 * AI Memory System - Usage Examples
 *
 * Demonstrates how to use the user memory system throughout the app lifecycle.
 */

import {
  initializeUserMemory,
  getUserMemory,
  updateUserMemory,
  updateMemoryAfterLesson,
  updateMemoryAfterCalibrator,
  generateMemorySummary,
  analyzePatterns,
  calculateCEFRLevel,
  type UserAIMemory,
  type LessonResult,
  type LessonProgress,
} from './userMemory';

import type { CalibrationResult } from '../../types/calibration';

// ============================================================================
// Example 1: Initialize Memory After Onboarding
// ============================================================================

async function exampleInitializeMemory() {
  console.log('=== Example 1: Initialize Memory After Onboarding ===\n');

  const memory = await initializeUserMemory({
    user_id: 'user_123',
    native_language: 'Spanish',
    target_language: 'English',
    motivation: 'Job interviews',
    motivation_custom: 'Prepare for tech company interviews in the USA',
    proficiency_level: 'intermediate', // Maps to B1
    commitment_stakes: 'Career advancement',
  });

  console.log('User memory initialized:');
  console.log(`- User ID: ${memory.user_id}`);
  console.log(`- Learning: ${memory.target_language}`);
  console.log(`- Current Level: ${memory.current_cefr_level}`);
  console.log(`- Motivation: ${memory.motivation}`);
  console.log('\n');

  return memory;
}

// ============================================================================
// Example 2: Update Memory After Lesson
// ============================================================================

async function exampleUpdateAfterLesson() {
  console.log('=== Example 2: Update Memory After Lesson ===\n');

  const user_id = 'user_123';

  // Simulate completing a vocabulary lesson
  const lessonResult: LessonResult = {
    lesson_type: 'vocabulary',
    cards_good: 8,
    cards_total: 10,
    vocab_learned: ['interview', 'resume', 'portfolio', 'deadline'],
    time_spent: 420, // 7 minutes in seconds
  };

  await updateMemoryAfterLesson(user_id, lessonResult);

  const memory = await getUserMemory(user_id);
  console.log('Memory updated after lesson:');
  console.log(`- Total Lessons: ${memory?.total_lessons_completed}`);
  console.log(`- Total Vocab: ${memory?.total_vocab_learned}`);
  console.log(`- Current Streak: ${memory?.current_streak} days`);
  console.log(
    `- Recent Observation: ${memory?.ai_observations.observations.slice(-1)[0]}`
  );
  console.log('\n');
}

// ============================================================================
// Example 3: Update Memory After Calibration
// ============================================================================

async function exampleUpdateAfterCalibration() {
  console.log('=== Example 3: Update Memory After Calibration ===\n');

  const user_id = 'user_123';

  // Mock calibration result
  const calibrationResult: CalibrationResult = {
    declaredLevel: 'intermediate',
    calibratedLevel: 'B1',
    calibrationDate: new Date().toISOString(),
    skills: {
      vocabulary: {
        skill: 'vocabulary',
        estimatedLevel: 'B2',
        confidence: 0.85,
        insights: {
          strengths: ['Common business vocabulary', 'Tech terminology'],
          areasToExplore: ['Idiomatic expressions', 'Phrasal verbs'],
          suggestedFocus: [
            'Practice with authentic business articles',
            'Learn industry-specific jargon',
          ],
        },
      },
      listening: {
        skill: 'listening',
        estimatedLevel: 'B1',
        confidence: 0.75,
        insights: {
          strengths: ['Clear, slow speech'],
          areasToExplore: ['Fast native speech', 'Different accents'],
          suggestedFocus: ['Watch interview videos', 'Listen to podcasts'],
        },
      },
      speaking: {
        skill: 'speaking',
        estimatedLevel: 'A2',
        confidence: 0.7,
        insights: {
          strengths: ['Basic sentence construction'],
          areasToExplore: [
            'Pronunciation of th sound',
            'Complex sentence structures',
          ],
          suggestedFocus: [
            'Practice speaking daily',
            'Record and review pronunciation',
          ],
        },
      },
      writing: {
        skill: 'writing',
        estimatedLevel: 'B1',
        confidence: 0.8,
        insights: {
          strengths: ['Clear written communication'],
          areasToExplore: ['Formal email writing', 'Technical documentation'],
          suggestedFocus: [
            'Practice writing cover letters',
            'Learn business email templates',
          ],
        },
      },
    },
    responses: [],
    recommendations: {
      startingPoint: 'Focus on speaking confidence and pronunciation',
      focusAreas: [
        'Speaking fluency',
        'Listening to native speakers',
        'Technical vocabulary',
      ],
      contentTypes: ['speaking', 'listening', 'vocabulary'],
      estimatedTimeToNextLevel: '2-3 months with daily practice',
    },
    pointsEarned: 70,
    probesCompleted: 4,
    totalTime: 180000, // 3 minutes
  };

  const memory = await updateMemoryAfterCalibrator(user_id, calibrationResult);

  console.log('Memory updated after calibration:');
  console.log(`- Calibrated Level: ${memory.current_cefr_level}`);
  console.log(`- Vocabulary Score: ${memory.skill_scores.vocabulary}/100`);
  console.log(`- Speaking Score: ${memory.skill_scores.speaking}/100`);
  console.log(`- Strengths: ${memory.insights.strengths.join(', ')}`);
  console.log(`- Weaknesses: ${memory.insights.weaknesses.join(', ')}`);
  console.log(
    `- Focus Areas: ${memory.recommendations.focus_areas.join(', ')}`
  );
  console.log('\n');
}

// ============================================================================
// Example 4: Generate Memory Summary for AI Prompts
// ============================================================================

async function exampleGenerateMemorySummary() {
  console.log('=== Example 4: Generate Memory Summary for AI Prompts ===\n');

  const user_id = 'user_123';
  const memory = await getUserMemory(user_id);

  if (!memory) {
    console.log('No memory found for user');
    return;
  }

  const summary = generateMemorySummary(memory);
  console.log('Memory Summary (for AI prompts):');
  console.log('─'.repeat(60));
  console.log(summary);
  console.log('─'.repeat(60));
  console.log('\n');
}

// ============================================================================
// Example 5: Analyze Lesson Patterns
// ============================================================================

async function exampleAnalyzePatterns() {
  console.log('=== Example 5: Analyze Lesson Patterns ===\n');

  // Mock lesson history
  const lessonHistory: LessonProgress[] = [
    {
      lesson_id: 'lesson_1',
      lesson_type: 'vocabulary',
      cards_good: 9,
      cards_total: 10,
      accuracy: 90,
      time_spent: 300,
      vocab_learned: ['word1', 'word2', 'word3'],
      completed_at: '2025-12-10T09:00:00Z',
    },
    {
      lesson_id: 'lesson_2',
      lesson_type: 'speaking',
      cards_good: 5,
      cards_total: 10,
      accuracy: 50,
      time_spent: 600,
      vocab_learned: [],
      completed_at: '2025-12-10T10:00:00Z',
    },
    {
      lesson_id: 'lesson_3',
      lesson_type: 'listening',
      cards_good: 8,
      cards_total: 10,
      accuracy: 80,
      time_spent: 400,
      vocab_learned: [],
      completed_at: '2025-12-11T09:30:00Z',
    },
    {
      lesson_id: 'lesson_4',
      lesson_type: 'vocabulary',
      cards_good: 10,
      cards_total: 10,
      accuracy: 100,
      time_spent: 250,
      vocab_learned: ['word4', 'word5'],
      completed_at: '2025-12-11T14:00:00Z',
    },
  ];

  const patterns = analyzePatterns(lessonHistory);

  console.log('Pattern Analysis:');
  console.log(`- Strengths: ${patterns.strengths.join(', ')}`);
  console.log(`- Weaknesses: ${patterns.weaknesses.join(', ')}`);
  console.log('- Observations:');
  patterns.observations.forEach((obs) => {
    console.log(`  • ${obs}`);
  });
  console.log('\n');
}

// ============================================================================
// Example 6: Calculate CEFR Level from Skill Scores
// ============================================================================

function exampleCalculateCEFRLevel() {
  console.log('=== Example 6: Calculate CEFR Level from Skill Scores ===\n');

  const scores = {
    vocabulary: 75,
    grammar: 68,
    speaking: 55,
    listening: 70,
  };

  const cefrLevel = calculateCEFRLevel(scores);

  console.log('Skill Scores:');
  console.log(`- Vocabulary: ${scores.vocabulary}/100`);
  console.log(`- Grammar: ${scores.grammar}/100`);
  console.log(`- Speaking: ${scores.speaking}/100`);
  console.log(`- Listening: ${scores.listening}/100`);
  console.log(`\nCalculated CEFR Level: ${cefrLevel}`);
  console.log('\n');
}

// ============================================================================
// Example 7: Update Custom Memory Fields
// ============================================================================

async function exampleUpdateCustomFields() {
  console.log('=== Example 7: Update Custom Memory Fields ===\n');

  const user_id = 'user_123';

  // Update specific fields
  await updateUserMemory(user_id, {
    insights: {
      strengths: ['vocabulary', 'reading'],
      weaknesses: ['speaking', 'pronunciation'],
      preferred_topics: ['business', 'technology', 'interviews'],
      preferred_lesson_types: ['vocabulary', 'listening'],
      struggle_areas: ['th sound', 'past tense verbs'],
      learning_velocity: 'fast',
    },
    ai_observations: {
      observations: [
        'Struggles with past tense verbs',
        'Quick learner for vocabulary',
        'Needs more speaking practice',
      ],
      patterns: ['Better performance in morning sessions'],
      blockers: ['Pronunciation of th sound'],
      wins: ['Completed 10 lessons in a row', 'Mastered 50 business words'],
      last_updated: new Date().toISOString(),
    },
  });

  const memory = await getUserMemory(user_id);
  console.log('Updated custom fields:');
  console.log(`- Preferred Topics: ${memory?.insights.preferred_topics.join(', ')}`);
  console.log(`- Learning Velocity: ${memory?.insights.learning_velocity}`);
  console.log(`- Latest Win: ${memory?.ai_observations.wins.slice(-1)[0]}`);
  console.log('\n');
}

// ============================================================================
// Example 8: Using Memory Summary in AI Prompt
// ============================================================================

async function exampleAIPromptIntegration() {
  console.log('=== Example 8: Using Memory Summary in AI Prompt ===\n');

  const user_id = 'user_123';
  const memory = await getUserMemory(user_id);

  if (!memory) {
    console.log('No memory found');
    return;
  }

  const memorySummary = generateMemorySummary(memory);

  // Example: Generate personalized lesson content
  const aiPrompt = `
You are creating a personalized English lesson for a language learner.

${memorySummary}

Based on the user's profile and learning history above, create a 10-card vocabulary lesson focused on their motivation (job interviews) and addressing their weaknesses (speaking, pronunciation).

Include:
- 5 business/tech vocabulary words they need for interviews
- 3 pronunciation practice cards (focus on 'th' sound)
- 2 example sentences using past tense verbs

Make it engaging and appropriate for their ${memory.current_cefr_level} level.
`;

  console.log('AI Prompt with Memory Context:');
  console.log('─'.repeat(60));
  console.log(aiPrompt);
  console.log('─'.repeat(60));
  console.log('\n');
}

// ============================================================================
// Run All Examples
// ============================================================================

export async function runAllExamples() {
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('AI MEMORY SYSTEM - USAGE EXAMPLES');
  console.log('═'.repeat(60));
  console.log('\n');

  await exampleInitializeMemory();
  await exampleUpdateAfterLesson();
  await exampleUpdateAfterCalibration();
  await exampleGenerateMemorySummary();
  await exampleAnalyzePatterns();
  exampleCalculateCEFRLevel();
  await exampleUpdateCustomFields();
  await exampleAIPromptIntegration();

  console.log('═'.repeat(60));
  console.log('ALL EXAMPLES COMPLETED');
  console.log('═'.repeat(60));
  console.log('\n');
}

// Uncomment to run examples:
// runAllExamples().catch(console.error);
