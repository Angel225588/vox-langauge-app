/**
 * Example Usage of AI Prompt Generation System
 *
 * This file demonstrates how to use the prompt generators with the Gemini API
 * to create personalized learning content.
 */

import type {
  PathGenerationInput,
  GeneratedPath,
  UserAIMemory,
  CEFRLevel,
} from '@/types/learning';

import {
  generatePathPrompt,
  generateStairContentPrompt,
  generateVocabularyLessonPrompt,
  generateFlashcardsLessonPrompt,
  generateWritingLessonPrompt,
  generateReadingLessonPrompt,
  generateConversationLessonPrompt,
  generateCalibratorPrompt,
  generateAdaptedPathPrompt,
  extractJSON,
  validateGeneratedPath,
  PATH_TEMPLATES,
} from './pathGeneration';

// ============================================================================
// EXAMPLE 1: Generate Initial Learning Path
// ============================================================================

/**
 * Example: User completes onboarding and we generate their personalized path
 */
export async function exampleGenerateInitialPath() {
  // User's onboarding data
  const onboardingData: PathGenerationInput = {
    user_id: 'user-123',
    target_language: 'Spanish',
    native_language: 'English',
    motivation: 'travel',
    motivation_custom: 'Backpacking through South America',
    why_now: 'Trip planned for summer 2025',
    proficiency_level: 'beginner',
    timeline: '3_months',
    previous_attempts: 'Tried Duolingo for 2 weeks, got bored',
    commitment_stakes: 'Already booked flights to Barcelona - need to survive!',
  };

  // Generate the prompt
  const prompt = generatePathPrompt(onboardingData);

  console.log('=== PROMPT ===');
  console.log(prompt);
  console.log('\n');

  // In real usage, send to Gemini API:
  // const geminiResponse = await geminiClient.generateText(prompt);
  // const generatedPath = extractJSON<GeneratedPath>(geminiResponse);
  // validateGeneratedPath(generatedPath);

  // Mock response for demonstration
  const mockGeminiResponse = `{
    "path_title": "Spanish for South American Adventure",
    "path_description": "Master essential Spanish for traveling, making friends, and navigating daily situations across South America. You'll go from zero to confident traveler in 3 months.",
    "total_stairs": 6,
    "estimated_completion": "12 weeks",
    "stairs": [
      {
        "order": 1,
        "title": "Survival Spanish",
        "emoji": "🌱",
        "description": "Essential greetings, introductions, and basic phrases to get by",
        "vocabulary": [],
        "grammar_points": ["Subject pronouns", "Ser vs Estar basics"],
        "scenarios": [],
        "skills_required": [],
        "skills_unlocked": ["Basic greetings", "Self introduction"],
        "estimated_days": 7
      }
    ]
  }`;

  const generatedPath = extractJSON<GeneratedPath>(mockGeminiResponse);

  console.log('=== GENERATED PATH ===');
  console.log(JSON.stringify(generatedPath, null, 2));
  console.log('\n');

  return generatedPath;
}

// ============================================================================
// EXAMPLE 2: Generate Detailed Stair Content
// ============================================================================

/**
 * Example: User starts a stair, we generate detailed content
 */
export async function exampleGenerateStairContent() {
  // User's AI memory
  const userMemory: UserAIMemory = {
    id: 'memory-123',
    user_id: 'user-123',
    native_language: 'English',
    target_language: 'Spanish',
    original_motivation: 'Backpacking through South America',
    original_stakes: 'Already booked flights',
    current_level: 'A1' as CEFRLevel,
    strengths: ['pronunciation', 'enthusiasm'],
    weaknesses: ['grammar', 'conjugation'],
    preferred_topics: ['travel', 'food', 'adventure'],
    total_vocab_learned: 0,
    vocab_mastery_rate: 0,
    conversation_confidence: 20,
    ai_observations: ['Shows high motivation', 'Struggles with verb forms'],
    recommended_focus: ['Basic grammar patterns', 'Common travel phrases'],
    calibrations_completed: 0,
    sections_completed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // First stair from the path
  const stair = {
    order: 1,
    title: 'Survival Spanish',
    emoji: '🌱',
    description: 'Essential greetings, introductions, and basic phrases to get by',
    vocabulary: [
      {
        word: 'hola',
        translation: 'hello',
        pronunciation: 'OH-lah',
        example_sentence: 'Hola, ¿cómo estás?',
        example_translation: 'Hello, how are you?',
        part_of_speech: 'interjection',
        difficulty: 'easy' as const,
      },
    ],
    grammar_points: ['Subject pronouns', 'Ser vs Estar basics'],
    scenarios: [
      {
        title: 'Meeting someone at a hostel',
        description: 'Introduce yourself to fellow travelers',
        context: 'You just arrived at a hostel in Buenos Aires',
        key_phrases: ['Me llamo...', '¿De dónde eres?', 'Encantado/a'],
      },
    ],
    skills_required: [],
    skills_unlocked: ['Basic greetings', 'Self introduction'],
    estimated_days: 7,
  };

  // Generate detailed content prompt
  const prompt = generateStairContentPrompt(stair, userMemory, []);

  console.log('=== STAIR CONTENT PROMPT ===');
  console.log(prompt);
  console.log('\n');

  return prompt;
}

// ============================================================================
// EXAMPLE 3: Generate Vocabulary Lesson
// ============================================================================

/**
 * Example: Generate first mini-lesson (vocabulary introduction)
 */
export async function exampleGenerateVocabularyLesson() {
  const vocabularyItems = [
    {
      word: 'hola',
      translation: 'hello',
      pronunciation: 'OH-lah',
      example_sentence: 'Hola, ¿cómo estás?',
      example_translation: 'Hello, how are you?',
      part_of_speech: 'interjection',
      difficulty: 'easy' as const,
    },
    {
      word: 'adiós',
      translation: 'goodbye',
      pronunciation: 'ah-DYOHS',
      example_sentence: 'Adiós, hasta luego.',
      example_translation: 'Goodbye, see you later.',
      part_of_speech: 'interjection',
      difficulty: 'easy' as const,
    },
    {
      word: 'gracias',
      translation: 'thank you',
      pronunciation: 'GRAH-syahs',
      example_sentence: 'Gracias por tu ayuda.',
      example_translation: 'Thank you for your help.',
      part_of_speech: 'interjection',
      difficulty: 'easy' as const,
    },
  ];

  const context = 'Basic greetings and polite expressions for daily interactions';

  const prompt = generateVocabularyLessonPrompt(vocabularyItems, context);

  console.log('=== VOCABULARY LESSON PROMPT ===');
  console.log(prompt);
  console.log('\n');

  return prompt;
}

// ============================================================================
// EXAMPLE 4: Generate Conversation Lesson
// ============================================================================

/**
 * Example: Generate AI conversation practice
 */
export async function exampleGenerateConversationLesson() {
  const scenario = {
    title: 'Ordering at a café',
    description: 'Practice ordering food and drinks at a local café',
    context: 'You are at a café in Madrid and want to order breakfast',
    key_phrases: [
      'Quisiera...',
      'Un café con leche, por favor',
      '¿Cuánto cuesta?',
      'La cuenta, por favor',
    ],
  };

  const userMemory: UserAIMemory = {
    id: 'memory-123',
    user_id: 'user-123',
    native_language: 'English',
    target_language: 'Spanish',
    original_motivation: 'Travel',
    original_stakes: 'Trip to Spain',
    current_level: 'A1' as CEFRLevel,
    strengths: ['vocabulary recall'],
    weaknesses: ['speaking confidence'],
    preferred_topics: ['food', 'travel'],
    total_vocab_learned: 50,
    vocab_mastery_rate: 75,
    conversation_confidence: 40,
    ai_observations: ['Hesitates when speaking', 'Good comprehension'],
    recommended_focus: ['Speaking practice', 'Real-world scenarios'],
    calibrations_completed: 0,
    sections_completed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const prompt = generateConversationLessonPrompt(scenario, userMemory);

  console.log('=== CONVERSATION LESSON PROMPT ===');
  console.log(prompt);
  console.log('\n');

  return prompt;
}

// ============================================================================
// EXAMPLE 5: Generate Calibrator
// ============================================================================

/**
 * Example: Generate calibration after completing a section
 */
export async function exampleGenerateCalibrator() {
  const completedSection = {
    id: 'section-1',
    path_id: 'path-123',
    section_number: 1,
    title: 'Foundation Skills',
    description: 'Basic greetings and introductions',
    status: 'completed' as const,
    stairs_count: 5,
    created_at: new Date().toISOString(),
  };

  const userMemory: UserAIMemory = {
    id: 'memory-123',
    user_id: 'user-123',
    native_language: 'English',
    target_language: 'Spanish',
    original_motivation: 'Travel',
    original_stakes: 'Trip planned',
    current_level: 'A1' as CEFRLevel,
    strengths: ['vocabulary', 'pronunciation'],
    weaknesses: ['grammar', 'verb conjugation'],
    preferred_topics: ['travel', 'food'],
    total_vocab_learned: 150,
    vocab_mastery_rate: 78,
    conversation_confidence: 55,
    ai_observations: ['Consistent practice', 'Improving confidence'],
    recommended_focus: ['Grammar fundamentals', 'Speaking practice'],
    calibrations_completed: 0,
    sections_completed: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const lessonHistory = [
    {
      id: 'progress-1',
      user_id: 'user-123',
      mini_lesson_id: 'lesson-1',
      cards_total: 20,
      cards_completed: 20,
      cards_good: 16,
      cards_again: 4,
      messages_sent: 0,
      score: 80,
      time_spent_seconds: 600,
      status: 'completed' as const,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
    {
      id: 'progress-2',
      user_id: 'user-123',
      mini_lesson_id: 'lesson-2',
      cards_total: 25,
      cards_completed: 25,
      cards_good: 22,
      cards_again: 3,
      messages_sent: 0,
      score: 88,
      time_spent_seconds: 720,
      status: 'completed' as const,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
  ];

  const prompt = generateCalibratorPrompt(
    completedSection,
    userMemory,
    lessonHistory
  );

  console.log('=== CALIBRATOR PROMPT ===');
  console.log(prompt);
  console.log('\n');

  return prompt;
}

// ============================================================================
// EXAMPLE 6: Access PATH_TEMPLATES
// ============================================================================

/**
 * Example: Using PATH_TEMPLATES for motivation-based content
 */
export function exampleUsePathTemplates() {
  console.log('=== PATH TEMPLATES ===\n');

  // Access travel template
  const travelTemplate = PATH_TEMPLATES.travel;
  console.log('Travel Template:');
  console.log('Focus areas:', travelTemplate.focus);
  console.log('Stair progression:', travelTemplate.stairProgression);
  console.log('\n');

  // Access career template
  const careerTemplate = PATH_TEMPLATES.career;
  console.log('Career Template:');
  console.log('Focus areas:', careerTemplate.focus);
  console.log('Stair progression:', careerTemplate.stairProgression);
  console.log('\n');

  // Get all available motivations
  const motivations = Object.keys(PATH_TEMPLATES);
  console.log('Available motivations:', motivations);
  console.log('\n');

  return PATH_TEMPLATES;
}

// ============================================================================
// EXAMPLE 7: Complete Integration Flow
// ============================================================================

/**
 * Example: Complete flow from onboarding to first lesson
 */
export async function exampleCompleteFlow() {
  console.log('=== COMPLETE INTEGRATION FLOW ===\n');

  // Step 1: User completes onboarding
  console.log('Step 1: User completes onboarding');
  const onboardingData: PathGenerationInput = {
    user_id: 'user-456',
    target_language: 'French',
    native_language: 'English',
    motivation: 'relationship',
    motivation_custom: 'Want to talk with my French partner\'s family',
    why_now: 'Meeting them next month',
    proficiency_level: 'beginner',
    timeline: '1_month',
    commitment_stakes: 'Don\'t want to embarrass myself',
  };
  console.log('Onboarding data:', onboardingData);
  console.log('\n');

  // Step 2: Generate learning path
  console.log('Step 2: Generate learning path');
  const pathPrompt = generatePathPrompt(onboardingData);
  console.log('Prompt generated (length:', pathPrompt.length, 'chars)');
  // const geminiResponse = await geminiClient.generateText(pathPrompt);
  // const generatedPath = extractJSON<GeneratedPath>(geminiResponse);
  console.log('\n');

  // Step 3: Validate and store
  console.log('Step 3: Validate and store path');
  // validateGeneratedPath(generatedPath);
  // await db.createLearningPath(userId, generatedPath);
  console.log('Path validated and stored');
  console.log('\n');

  // Step 4: User starts first stair
  console.log('Step 4: User starts first stair');
  // Generate vocabulary lesson for first mini-lesson
  const vocabItems = [
    {
      word: 'bonjour',
      translation: 'hello',
      pronunciation: 'bon-ZHOOR',
      example_sentence: 'Bonjour, comment allez-vous?',
      example_translation: 'Hello, how are you?',
      part_of_speech: 'interjection',
      difficulty: 'easy' as const,
    },
  ];
  const vocabPrompt = generateVocabularyLessonPrompt(
    vocabItems,
    'Meeting your partner\'s family for the first time'
  );
  console.log('Vocabulary lesson prompt generated');
  console.log('\n');

  // Step 5: User completes lessons
  console.log('Step 5: User completes lessons and section');
  console.log('(Track progress in lesson_progress table)');
  console.log('\n');

  // Step 6: Generate calibrator
  console.log('Step 6: Generate calibrator after section completion');
  // const calibratorPrompt = generateCalibratorPrompt(...);
  console.log('Calibrator ready');
  console.log('\n');

  console.log('=== FLOW COMPLETE ===');
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

// Uncomment to run examples:
// exampleGenerateInitialPath();
// exampleGenerateStairContent();
// exampleGenerateVocabularyLesson();
// exampleGenerateConversationLesson();
// exampleGenerateCalibrator();
// exampleUsePathTemplates();
// exampleCompleteFlow();
