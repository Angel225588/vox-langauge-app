/**
 * AI Prompt Generation for Personalized Learning Paths
 *
 * This module contains all prompt generators for creating and adapting
 * personalized language learning paths using AI (Google Gemini).
 *
 * Each prompt is structured to produce JSON output that can be parsed
 * and used to generate learning content dynamically.
 */

import type {
  PathGenerationInput,
  GeneratedPath,
  GeneratedStair,
  VocabItem,
  Scenario,
  UserAIMemory,
  CEFRLevel,
  CalibratorResult,
  LessonProgress,
  Section,
} from '@/types/learning';

// ============================================================================
// PATH TEMPLATES - Base structures for different motivations
// ============================================================================

export const PATH_TEMPLATES = {
  career: {
    focus: ['formal language', 'professional vocabulary', 'business phrases'],
    stairProgression: [
      'Professional Greetings',
      'Self Introduction',
      'Describing Experience',
      'Discussing Skills',
      'Meeting & Presentation Basics',
      'Email & Written Communication',
      'Salary Negotiation',
      'Follow-up Communication',
    ],
  },
  travel: {
    focus: ['survival phrases', 'navigation', 'social interactions'],
    stairProgression: [
      'Basic Greetings',
      'Getting Around',
      'Food & Restaurants',
      'Shopping',
      'Accommodation',
      'Emergencies',
      'Local Culture',
      'Making Friends',
    ],
  },
  relationship: {
    focus: ['casual conversation', 'emotions', 'daily life'],
    stairProgression: [
      'Getting to Know Someone',
      'Daily Conversations',
      'Expressing Feelings',
      'Making Plans',
      'Discussing Interests',
      'Family & Relationships',
      'Deeper Conversations',
      'Future Goals Together',
    ],
  },
  academic: {
    focus: ['grammar', 'reading', 'writing', 'formal register'],
    stairProgression: [
      'Grammar Foundations',
      'Reading Comprehension',
      'Essay Structure',
      'Academic Vocabulary',
      'Note-Taking Skills',
      'Research Discussion',
      'Presentations',
      'Debate & Critical Thinking',
    ],
  },
  heritage: {
    focus: ['family vocabulary', 'cultural expressions', 'traditions'],
    stairProgression: [
      'Family Terms',
      'Home & Daily Life',
      'Cultural Traditions',
      'Storytelling',
      'Regional Expressions',
      'Family History',
      'Connecting Generations',
      'Preserving Heritage',
    ],
  },
} as const;

// ============================================================================
// 1. PATH SKELETON GENERATION PROMPT (Fast - generates structure only)
// ============================================================================

/**
 * Generates a lightweight prompt for creating the path SKELETON only.
 * This is fast and won't hit token limits. Detailed content is loaded on-demand.
 *
 * @param input - The user's onboarding data
 * @param userMemory - Optional existing user AI memory for personalization
 * @returns A prompt string for generating path skeleton
 */
export function generatePathSkeletonPrompt(
  input: PathGenerationInput,
  userMemory?: UserAIMemory
): string {
  const template = PATH_TEMPLATES[input.motivation as keyof typeof PATH_TEMPLATES];
  const hasMemory = !!userMemory;

  return `You are an expert language learning curriculum designer. Create a learning path SKELETON for a ${input.target_language} learner.

USER CONTEXT:
- Native Language: ${input.native_language}
- Target Language: ${input.target_language}
- Motivation: ${input.motivation}${input.motivation_custom ? ` (${input.motivation_custom})` : ''}
- Why Now: ${input.why_now || 'Not specified'}
- Proficiency Level: ${input.proficiency_level}
- Timeline: ${input.timeline}
${input.previous_attempts ? `- Previous Attempts: ${input.previous_attempts}` : ''}

${hasMemory ? `USER PROGRESS:
- Current CEFR Level: ${userMemory.current_level}
- Strengths: ${userMemory.strengths.join(', ')}
- Weaknesses: ${userMemory.weaknesses.join(', ')}
` : ''}

${template ? `SUGGESTED PROGRESSION (adapt as needed):
${template.stairProgression.map((s, i) => `${i + 1}. ${s}`).join('\n')}
` : ''}

Create ONLY the structure - no vocabulary or detailed content yet.

OUTPUT FORMAT (JSON):
{
  "path_title": "Motivating title",
  "path_description": "2-3 sentence description",
  "total_stairs": 8,
  "estimated_completion": "3 months",
  "stairs": [
    {
      "order": 1,
      "title": "Stair title",
      "emoji": "📱",
      "description": "What user will learn (1-2 sentences)",
      "grammar_focus": ["grammar point 1", "grammar point 2"],
      "skills_required": [],
      "skills_unlocked": ["skill 1", "skill 2"],
      "estimated_days": 7
    }
  ]
}

IMPORTANT:
- Create exactly 8 stairs
- Keep descriptions concise
- Skills should flow logically between stairs
- Return ONLY valid JSON`;
}

// ============================================================================
// 2. DETAILED STAIR CONTENT PROMPT (On-demand loading)
// ============================================================================

/**
 * Generates detailed content for a SINGLE stair.
 * Called on-demand when user approaches a new stair.
 *
 * @param stairSkeleton - The skeleton data for this stair
 * @param input - Original path generation input
 * @param userMetrics - Optional user performance metrics for adaptation
 * @returns A prompt for generating detailed stair content
 */
export function generateStairContentPromptOnDemand(
  stairSkeleton: {
    order: number;
    title: string;
    description: string;
    grammar_focus?: string[];
    skills_required?: string[];
    skills_unlocked?: string[];
  },
  input: PathGenerationInput,
  userMetrics?: {
    vocab_mastery_rate?: number;
    common_mistakes?: string[];
    preferred_topics?: string[];
    speaking_confidence?: number;
  }
): string {
  const hasMetrics = !!userMetrics;

  return `Generate detailed learning content for this stair in a ${input.target_language} learning path.

STAIR INFO:
- Order: ${stairSkeleton.order}
- Title: ${stairSkeleton.title}
- Description: ${stairSkeleton.description}
- Grammar Focus: ${stairSkeleton.grammar_focus?.join(', ') || 'General'}
- Skills Required: ${stairSkeleton.skills_required?.join(', ') || 'None'}
- Skills Unlocked: ${stairSkeleton.skills_unlocked?.join(', ') || 'General skills'}

USER CONTEXT:
- Native Language: ${input.native_language}
- Target Language: ${input.target_language}
- Proficiency Level: ${input.proficiency_level}
- Motivation: ${input.motivation}${input.motivation_custom ? ` (${input.motivation_custom})` : ''}

${hasMetrics ? `USER PERFORMANCE (adapt content accordingly):
- Vocabulary Mastery Rate: ${userMetrics.vocab_mastery_rate}%
- Speaking Confidence: ${userMetrics.speaking_confidence}%
- Common Mistakes: ${userMetrics.common_mistakes?.join(', ') || 'None tracked'}
- Preferred Topics: ${userMetrics.preferred_topics?.join(', ') || 'General'}

${userMetrics.vocab_mastery_rate && userMetrics.vocab_mastery_rate < 60 ?
  'NOTE: User struggles with vocabulary - include more repetition and simpler words.' : ''}
${userMetrics.speaking_confidence && userMetrics.speaking_confidence < 50 ?
  'NOTE: User has low speaking confidence - include encouraging scenarios.' : ''}
` : ''}

OUTPUT FORMAT (JSON):
{
  "vocabulary": [
    {
      "word": "word in ${input.target_language}",
      "translation": "translation in ${input.native_language}",
      "pronunciation": "phonetic guide",
      "example_sentence": "Example sentence in ${input.target_language}",
      "example_translation": "Translation in ${input.native_language}",
      "part_of_speech": "noun/verb/adjective/etc",
      "difficulty": "easy/medium/hard"
    }
  ],
  "grammar_points": [
    "Clear explanation of grammar concept 1",
    "Clear explanation of grammar concept 2"
  ],
  "scenarios": [
    {
      "title": "Scenario title",
      "description": "Brief description",
      "context": "Detailed context for role-play",
      "key_phrases": ["phrase1", "phrase2", "phrase3"]
    }
  ]
}

IMPORTANT:
- Include 10-15 vocabulary items (quality over quantity)
- Include 2-3 realistic scenarios
- Make content relevant to user's motivation
- Return ONLY valid JSON`;
}

// ============================================================================
// 3. LEGACY FULL PATH PROMPT (kept for backwards compatibility)
// ============================================================================

/**
 * @deprecated Use generatePathSkeletonPrompt + generateStairContentPromptOnDemand instead
 * Generates the main prompt for creating a complete personalized learning path.
 */
export function generatePathPrompt(
  input: PathGenerationInput,
  userMemory?: UserAIMemory
): string {
  const template = PATH_TEMPLATES[input.motivation as keyof typeof PATH_TEMPLATES];
  const hasMemory = !!userMemory;

  return `You are an expert language learning curriculum designer. Create a personalized ${input.target_language} learning path for a user.

USER CONTEXT:
- Native Language: ${input.native_language}
- Target Language: ${input.target_language}
- Motivation: ${input.motivation}${input.motivation_custom ? ` (${input.motivation_custom})` : ''}
- Why Now: ${input.why_now || 'Not specified'}
- Proficiency Level: ${input.proficiency_level}
- Timeline: ${input.timeline}
- Commitment Stakes: ${input.commitment_stakes}
${input.previous_attempts ? `- Previous Attempts: ${input.previous_attempts}` : ''}

${hasMemory ? `EXISTING USER PROGRESS:
- Current CEFR Level: ${userMemory.current_level}
- Total Vocabulary Learned: ${userMemory.total_vocab_learned}
- Vocabulary Mastery Rate: ${userMemory.vocab_mastery_rate}%
- Conversation Confidence: ${userMemory.conversation_confidence}%
- Strengths: ${userMemory.strengths.join(', ')}
- Weaknesses: ${userMemory.weaknesses.join(', ')}
- AI Observations: ${userMemory.ai_observations.join('; ')}
- Recommended Focus: ${userMemory.recommended_focus.join(', ')}
` : ''}

GUIDELINES:
1. Create exactly 8 stairs that build progressively toward the user's goal
2. Each stair should teach skills needed for the next one
3. Focus areas based on motivation: ${template?.focus.join(', ') || 'general proficiency'}
4. Adjust difficulty for proficiency level: ${input.proficiency_level}
5. Consider the timeline (${input.timeline}) for pacing
6. Include vocabulary appropriate for the goal and level
7. Create realistic scenarios the user will encounter
8. Build from simple to complex, ensuring each stair unlocks new abilities

${template ? `SUGGESTED STAIR PROGRESSION (adapt as needed):
${template.stairProgression.map((s, i) => `${i + 1}. ${s}`).join('\n')}
` : ''}

OUTPUT FORMAT:
Return a JSON object with this exact structure:

{
  "path_title": "A motivating title for this learning path",
  "path_description": "2-3 sentence description explaining what the user will achieve",
  "total_stairs": 8,
  "estimated_completion": "Human-readable estimate like '3 months' or '6 weeks'",
  "stairs": [
    {
      "order": 1,
      "title": "Stair title",
      "emoji": "📱",
      "description": "What the user will learn in this stair",
      "vocabulary": [
        {
          "word": "word in target language",
          "translation": "translation in ${input.native_language}",
          "pronunciation": "phonetic guide (optional)",
          "example_sentence": "Example using the word in target language",
          "example_translation": "Translation of example in ${input.native_language}",
          "part_of_speech": "noun/verb/adjective/etc",
          "difficulty": "easy/medium/hard"
        }
      ],
      "grammar_points": ["Grammar concept 1", "Grammar concept 2"],
      "scenarios": [
        {
          "title": "Scenario title",
          "description": "Brief description of the situation",
          "context": "Detailed context for role-play",
          "key_phrases": ["phrase1", "phrase2", "phrase3"]
        }
      ],
      "skills_required": ["Skills from previous stairs"],
      "skills_unlocked": ["New skills this stair teaches"],
      "estimated_days": 7
    }
  ]
}

IMPORTANT:
- Include 10-12 vocabulary items per stair (quality over quantity)
- Ensure vocabulary builds on previous stairs
- Make scenarios realistic and relevant to the user's motivation
- Skills should flow logically (skills_unlocked from stair N become skills_required for stair N+1)
- Return ONLY valid JSON, no additional text or markdown formatting`;
}

// ============================================================================
// 2. STAIR CONTENT GENERATION PROMPT
// ============================================================================

/**
 * Generates detailed content for a single stair including expanded vocabulary,
 * grammar explanations, and practice scenarios.
 *
 * @param stair - The generated stair structure
 * @param userMemory - User's AI memory for personalization
 * @param previousStairs - Previously completed stairs for context
 * @returns A prompt for generating detailed stair content
 */
export function generateStairContentPrompt(
  stair: GeneratedStair,
  userMemory: UserAIMemory,
  previousStairs: GeneratedStair[]
): string {
  return `You are creating detailed learning content for a single stair in a ${userMemory.target_language} learning path.

STAIR OVERVIEW:
- Title: ${stair.title}
- Description: ${stair.description}
- Order: ${stair.order}
- Estimated Days: ${stair.estimated_days}

USER CONTEXT:
- Native Language: ${userMemory.native_language}
- Current CEFR Level: ${userMemory.current_level}
- Strengths: ${userMemory.strengths.join(', ')}
- Weaknesses: ${userMemory.weaknesses.join(', ')}
- Preferred Topics: ${userMemory.preferred_topics.join(', ')}

PREVIOUS STAIRS COMPLETED:
${previousStairs.length > 0 ? previousStairs.map(s => `- ${s.title}: ${s.vocabulary.length} words learned`).join('\n') : 'None - this is the first stair'}

VOCABULARY ALREADY LEARNED:
${previousStairs.flatMap(s => s.vocabulary.map(v => v.word)).slice(-20).join(', ') || 'None yet'}

YOUR TASK:
Generate comprehensive content for this stair:

1. VOCABULARY (30-50 items):
   - Build on words from previous stairs
   - Focus on ${stair.description}
   - Appropriate difficulty for CEFR level ${userMemory.current_level}
   - Include diverse parts of speech
   - Provide pronunciation guides
   - Create memorable example sentences

2. GRAMMAR POINTS (3-5 concepts):
   - Explain concepts clearly
   - Show how they're used in the vocabulary
   - Provide simple rules the user can apply
   - Connect to previous grammar learned

3. PRACTICE SCENARIOS (4-6 scenarios):
   - Create realistic situations
   - Use the vocabulary and grammar from this stair
   - Include conversation prompts
   - Provide cultural context where relevant

OUTPUT FORMAT:
Return a JSON object:

{
  "vocabulary": [
    {
      "word": "word",
      "translation": "translation",
      "pronunciation": "phonetic",
      "example_sentence": "sentence in target language",
      "example_translation": "translation in ${userMemory.native_language}",
      "part_of_speech": "noun/verb/adjective/etc",
      "difficulty": "easy/medium/hard"
    }
  ],
  "grammar_points": [
    "Grammar explanation 1",
    "Grammar explanation 2"
  ],
  "scenarios": [
    {
      "title": "Scenario name",
      "description": "Brief description",
      "context": "Detailed setup for practice",
      "key_phrases": ["phrase1", "phrase2", "phrase3"]
    }
  ],
  "mini_lesson_structure": {
    "lesson_1_vocabulary": ["word1", "word2", "word3"],
    "lesson_2_flashcards": ["word1", "word2", "word3"],
    "lesson_3_writing": "Writing prompt using these words",
    "lesson_4_reading": "Short passage topic",
    "lesson_5_conversation": "Scenario title for role-play"
  }
}

Return ONLY valid JSON.`;
}

// ============================================================================
// 3. MINI-LESSON GENERATION PROMPTS
// ============================================================================

/**
 * Generates a vocabulary introduction lesson.
 *
 * @param vocab - Vocabulary items to teach
 * @param context - Context for how these words will be used
 * @returns A prompt for generating the vocabulary lesson
 */
export function generateVocabularyLessonPrompt(
  vocab: VocabItem[],
  context: string
): string {
  return `Create an engaging vocabulary lesson introducing these words in the context of: ${context}

VOCABULARY TO TEACH:
${vocab.map(v => `- ${v.word} (${v.translation}) - ${v.part_of_speech}`).join('\n')}

LESSON GOALS:
1. Introduce each word clearly with pronunciation
2. Show how words relate to each other
3. Provide memorable examples
4. Create a cohesive narrative using these words

OUTPUT FORMAT (JSON):
{
  "lesson_title": "Catchy title for the lesson",
  "introduction": "1-2 sentences about why these words matter",
  "word_cards": [
    {
      "word": "${vocab[0]?.word || 'word'}",
      "translation": "${vocab[0]?.translation || 'translation'}",
      "pronunciation": "phonetic guide",
      "audio_hint": "tips for pronunciation",
      "example_sentence": "Example in context",
      "example_translation": "Translation",
      "memory_tip": "Mnemonic or association to remember"
    }
  ],
  "practice_sentences": [
    {
      "sentence": "Sentence using multiple new words",
      "translation": "Translation",
      "words_used": ["word1", "word2"]
    }
  ]
}

Return ONLY valid JSON.`;
}

/**
 * Generates a flashcard lesson for spaced repetition.
 *
 * @param vocab - Vocabulary items for flashcards
 * @returns A prompt for generating the flashcard lesson
 */
export function generateFlashcardsLessonPrompt(vocab: VocabItem[]): string {
  return `Create a flashcard review session for these vocabulary items.

VOCABULARY:
${vocab.map(v => `- ${v.word}: ${v.translation}`).join('\n')}

Create flashcards that test:
1. Recognition (target language → native language)
2. Production (native language → target language)
3. Usage (fill in the blank with context)
4. Listening (audio recognition)

OUTPUT FORMAT (JSON):
{
  "flashcards": [
    {
      "front": "Word or phrase in target language OR translation",
      "back": "The answer",
      "hint": "Optional hint if difficult",
      "card_type": "recognition/production/usage/listening",
      "audio_url": null
    }
  ]
}

Return ONLY valid JSON with 20-30 flashcards.`;
}

/**
 * Generates a writing practice lesson.
 *
 * @param topic - The topic for writing practice
 * @param vocab - Target vocabulary to use
 * @param level - User's CEFR level
 * @returns A prompt for generating the writing lesson
 */
export function generateWritingLessonPrompt(
  topic: string,
  vocab: VocabItem[],
  level: CEFRLevel
): string {
  const wordCountMap: Record<string, string> = {
    A1: '3-5 sentences',
    A2: '5-8 sentences',
    B1: '8-12 sentences (1-2 paragraphs)',
    B2: '12-15 sentences (2-3 paragraphs)',
    C1: '15-20 sentences (3-4 paragraphs)',
    C2: '20+ sentences (4-5 paragraphs)',
  };

  return `Create a writing practice lesson about: ${topic}

TARGET VOCABULARY TO USE:
${vocab.slice(0, 10).map(v => `- ${v.word} (${v.translation})`).join('\n')}

CEFR LEVEL: ${level}
TARGET LENGTH: ${wordCountMap[level]}

LESSON REQUIREMENTS:
1. Clear writing prompt
2. Optional sentence starters
3. Example response
4. Checklist of required vocabulary/grammar

OUTPUT FORMAT (JSON):
{
  "title": "Writing lesson title",
  "prompt": "What the user should write about",
  "instructions": "Step-by-step guidance",
  "sentence_starters": [
    "Optional starter 1",
    "Optional starter 2"
  ],
  "required_vocabulary": ["${vocab[0]?.word || 'word1'}", "${vocab[1]?.word || 'word2'}"],
  "grammar_focus": ["Grammar point to practice"],
  "example_response": "A model response showing good usage",
  "evaluation_criteria": [
    "Uses at least 5 target vocabulary words",
    "Demonstrates grammar point",
    "Stays on topic"
  ]
}

Return ONLY valid JSON.`;
}

/**
 * Generates a reading comprehension lesson.
 *
 * @param topic - The topic for the reading passage
 * @param vocab - Vocabulary that should appear in the passage
 * @param level - User's CEFR level
 * @returns A prompt for generating the reading lesson
 */
export function generateReadingLessonPrompt(
  topic: string,
  vocab: VocabItem[],
  level: CEFRLevel
): string {
  return `Create a reading comprehension lesson about: ${topic}

CEFR LEVEL: ${level}
VOCABULARY TO INCLUDE:
${vocab.slice(0, 15).map(v => `- ${v.word} (${v.translation})`).join('\n')}

REQUIREMENTS:
1. Write a passage appropriate for ${level} level
2. Naturally incorporate the target vocabulary
3. Make it engaging and culturally relevant
4. Include 5-7 comprehension questions
5. Mix question types: multiple choice, true/false, short answer

OUTPUT FORMAT (JSON):
{
  "title": "Reading title",
  "passage": "The full reading passage in target language",
  "passage_translation": "Full translation (for reference)",
  "vocabulary_in_passage": [
    {
      "word": "${vocab[0]?.word || 'word'}",
      "translation": "${vocab[0]?.translation || 'translation'}",
      "sentence_from_passage": "The sentence where it appears"
    }
  ],
  "comprehension_questions": [
    {
      "question": "Question text",
      "type": "multiple_choice/true_false/short_answer",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correct_answer": "Correct answer or index",
      "explanation": "Why this is the correct answer"
    }
  ],
  "discussion_prompts": [
    "Question for deeper thinking",
    "Personal connection question"
  ]
}

Return ONLY valid JSON.`;
}

/**
 * Generates a conversation practice lesson.
 *
 * @param scenario - The scenario for conversation practice
 * @param userMemory - User's AI memory for personalization
 * @returns A prompt for generating the conversation lesson
 */
export function generateConversationLessonPrompt(
  scenario: Scenario,
  userMemory: UserAIMemory
): string {
  return `Create an AI conversation practice lesson for this scenario:

SCENARIO:
- Title: ${scenario.title}
- Description: ${scenario.description}
- Context: ${scenario.context}
- Key Phrases: ${scenario.key_phrases.join(', ')}

USER CONTEXT:
- Target Language: ${userMemory.target_language}
- Native Language: ${userMemory.native_language}
- CEFR Level: ${userMemory.current_level}
- Conversation Confidence: ${userMemory.conversation_confidence}%

LESSON REQUIREMENTS:
1. Define the AI's persona/role
2. Set clear objectives for the conversation
3. Provide example opening lines
4. List key phrases the user should practice
5. Define success criteria (minimum messages, objectives to hit)

OUTPUT FORMAT (JSON):
{
  "title": "${scenario.title}",
  "scenario_setup": "Detailed setup for the user to read before starting",
  "ai_persona": {
    "role": "Who the AI is playing (e.g., restaurant server, friend, colleague)",
    "personality": "Brief personality description",
    "background": "Relevant background info",
    "speaking_style": "How formal/casual they speak"
  },
  "user_role": "Who the user is in this scenario",
  "objectives": [
    "Specific goal 1",
    "Specific goal 2",
    "Specific goal 3"
  ],
  "key_phrases_to_practice": [
    {
      "phrase": "${scenario.key_phrases[0] || 'phrase'}",
      "translation": "Translation",
      "when_to_use": "Context for using this phrase"
    }
  ],
  "example_opening": "How the AI might start the conversation",
  "min_messages": 8,
  "success_criteria": [
    "User practices at least 3 key phrases",
    "User stays in character",
    "User completes the scenario objective"
  ],
  "difficulty_adjustments": {
    "easier": "If struggling, AI can...",
    "harder": "If excelling, AI can..."
  }
}

Return ONLY valid JSON.`;
}

// ============================================================================
// 4. CALIBRATOR GENERATION PROMPT
// ============================================================================

/**
 * Generates a calibration test after completing a section.
 *
 * This is NOT a traditional test - it's a calibration tool to assess
 * the user's progress and adapt the learning path.
 *
 * @param completedSection - The section just completed
 * @param userMemory - User's current AI memory
 * @param lessonHistory - Recent lesson progress data
 * @returns A prompt for generating the calibrator
 */
export function generateCalibratorPrompt(
  completedSection: Section,
  userMemory: UserAIMemory,
  lessonHistory: LessonProgress[]
): string {
  const avgScore = lessonHistory.length > 0
    ? lessonHistory.reduce((sum, l) => sum + l.score, 0) / lessonHistory.length
    : 0;

  return `Create a calibration assessment for a user who just completed section: ${completedSection.title}

USER PROGRESS:
- Current CEFR Level: ${userMemory.current_level}
- Section Just Completed: ${completedSection.title}
- Lessons in Section: ${completedSection.stairs_count}
- Average Score in Section: ${Math.round(avgScore)}%
- Total Vocabulary Learned: ${userMemory.total_vocab_learned}
- Known Strengths: ${userMemory.strengths.join(', ')}
- Known Weaknesses: ${userMemory.weaknesses.join(', ')}

RECENT LESSON PERFORMANCE:
${lessonHistory.slice(-5).map(l =>
  `- Lesson: Score ${l.score}%, ${l.cards_good} good / ${l.cards_again} again, ${Math.round(l.time_spent_seconds / 60)} min`
).join('\n')}

CALIBRATION GOALS:
1. Assess listening comprehension at current level
2. Test speaking/pronunciation ability
3. Evaluate reading comprehension
4. Identify areas for next section focus
5. Build confidence (points for completion, not accuracy)

IMPORTANT:
- This is a calibration tool, NOT a test
- Users earn points for participation
- No penalties for errors
- Results guide personalized path adaptation

OUTPUT FORMAT (JSON):
{
  "calibrator_title": "Title for this calibration",
  "introduction": "Encouraging message about the purpose (not a test!)",
  "estimated_time_minutes": 5,
  "listening_tasks": [
    {
      "audio_text": "What will be spoken in ${userMemory.target_language}",
      "question": "What did you hear?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_index": 0,
      "difficulty": "${userMemory.current_level}",
      "context": "e.g., 'conversation at restaurant'"
    }
  ],
  "speaking_tasks": [
    {
      "prompt": "What to say/describe in ${userMemory.target_language}",
      "prompt_translation": "Translation in ${userMemory.native_language}",
      "target_duration_seconds": 30,
      "difficulty": "${userMemory.current_level}",
      "context": "e.g., 'describe your weekend'",
      "hints": ["word1", "word2"]
    }
  ],
  "comprehension_tasks": [
    {
      "passage": "Short passage in ${userMemory.target_language}",
      "questions": [
        {
          "question": "Question about the passage",
          "options": ["A", "B", "C"],
          "correct_index": 0
        }
      ]
    }
  ],
  "points_available": 100
}

Create 3-4 tasks per category. Return ONLY valid JSON.`;
}

// ============================================================================
// 5. ADAPTATION PROMPT
// ============================================================================

/**
 * Generates an adapted learning path based on calibrator results.
 *
 * This prompt helps the AI adjust the next section based on what the
 * user excelled at or struggled with in the calibration.
 *
 * @param originalPath - The original generated path
 * @param calibratorResult - Results from the calibration test
 * @param userMemory - Updated user AI memory
 * @returns A prompt for generating the adapted path
 */
export function generateAdaptedPathPrompt(
  originalPath: GeneratedPath,
  calibratorResult: CalibratorResult,
  userMemory: UserAIMemory
): string {
  return `Adapt the next section of a learning path based on calibration results.

ORIGINAL LEARNING PATH:
- Title: ${originalPath.path_title}
- Description: ${originalPath.path_description}
- Total Stairs: ${originalPath.total_stairs}

CALIBRATION RESULTS:
- Listening Score: ${calibratorResult.listening_score}%
- Speaking Score: ${calibratorResult.speaking_score}%
- Comprehension Score: ${calibratorResult.comprehension_score}%
- Overall Score: ${calibratorResult.overall_score}%

IDENTIFIED STRENGTHS:
${calibratorResult.strengths_identified.map(s => `- ${s}`).join('\n')}

IDENTIFIED WEAKNESSES:
${calibratorResult.weaknesses_identified.map(w => `- ${w}`).join('\n')}

AI RECOMMENDATIONS:
${calibratorResult.recommendations.map(r => `- ${r}`).join('\n')}

UPDATED USER PROFILE:
- Current Level: ${userMemory.current_level}
- Total Vocabulary: ${userMemory.total_vocab_learned}
- Mastery Rate: ${userMemory.vocab_mastery_rate}%
- Conversation Confidence: ${userMemory.conversation_confidence}%
- Strengths: ${userMemory.strengths.join(', ')}
- Weaknesses: ${userMemory.weaknesses.join(', ')}
- Recommended Focus: ${userMemory.recommended_focus.join(', ')}

YOUR TASK:
Create the NEXT SECTION (5-7 stairs) that:
1. Builds on identified strengths
2. Addresses weaknesses with supportive content
3. Adjusts difficulty based on calibration scores
4. Maintains motivation while challenging appropriately
5. Focuses on recommended areas

If calibration scores are:
- 80%+: Increase difficulty, introduce advanced concepts
- 60-79%: Maintain current difficulty, reinforce weak areas
- Below 60%: Simplify, add more practice, break into smaller steps

OUTPUT FORMAT (JSON):
{
  "section_title": "Title for next section",
  "section_description": "What this section will achieve",
  "adaptation_notes": "Brief explanation of how this adapts to calibration results",
  "stairs": [
    {
      "order": 1,
      "title": "Stair title",
      "emoji": "📱",
      "description": "What user will learn",
      "vocabulary": [...], // Same format as main path generation
      "grammar_points": [...],
      "scenarios": [...],
      "skills_required": [...],
      "skills_unlocked": [...],
      "estimated_days": 7
    }
  ]
}

Return ONLY valid JSON.`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts JSON from AI response that might contain markdown or extra text.
 *
 * @param response - The raw AI response
 * @returns Parsed JSON object
 */
export function extractJSON<T = any>(response: string): T {
  // Log the raw response length for debugging
  console.log('[extractJSON] Raw response length:', response.length);

  // If response is too short, it's likely truncated
  if (response.length < 100) {
    console.error('[extractJSON] Response appears truncated. Raw:', response);
    throw new Error('AI response appears truncated (too short)');
  }

  // Remove markdown code blocks if present
  let cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  // Try to find JSON object boundaries
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    console.error('[extractJSON] Could not find valid JSON boundaries');
    console.error('[extractJSON] First 500 chars:', cleaned.substring(0, 500));
    console.error('[extractJSON] Last 500 chars:', cleaned.substring(cleaned.length - 500));
    throw new Error('Could not find valid JSON in AI response');
  }

  // Extract just the JSON portion
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    console.error('[extractJSON] Cleaned JSON length:', cleaned.length);
    console.error('[extractJSON] First 300 chars:', cleaned.substring(0, 300));
    console.error('[extractJSON] Last 300 chars:', cleaned.substring(cleaned.length - 300));
    throw new Error('Invalid JSON response from AI');
  }
}

/**
 * Validates that a generated path has the required structure.
 * Supports both full paths and skeleton paths (where only stair 1 has content).
 *
 * @param path - The path object to validate
 * @param requireFullContent - If true, requires all stairs to have content (default: false)
 * @returns True if valid, throws error if invalid
 */
export function validateGeneratedPath(path: any, requireFullContent = false): path is GeneratedPath {
  if (!path.path_title || !path.path_description) {
    throw new Error('Path missing title or description');
  }

  // Database constraint requires total_stairs BETWEEN 8 AND 12
  if (!Array.isArray(path.stairs) || path.stairs.length < 8) {
    throw new Error('Path must have at least 8 stairs (database constraint requires 8-12)');
  }

  for (const stair of path.stairs) {
    if (!stair.title || !stair.description || !stair.emoji) {
      throw new Error(`Stair ${stair.order} missing required fields`);
    }

    // For skeleton paths, only first stair needs full content
    const needsContent = requireFullContent || stair.order === 1;

    if (needsContent) {
      if (!Array.isArray(stair.vocabulary) || stair.vocabulary.length < 5) {
        throw new Error(`Stair ${stair.order} must have at least 5 vocabulary items`);
      }

      if (!Array.isArray(stair.scenarios) || stair.scenarios.length < 2) {
        throw new Error(`Stair ${stair.order} must have at least 2 scenarios`);
      }
    }
  }

  return true;
}

/**
 * Gets the appropriate emoji for a lesson type.
 *
 * @param type - The lesson type
 * @returns An emoji representing that lesson type
 */
export function getLessonTypeEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    vocabulary: '📚',
    flashcards: '🎴',
    writing: '✍️',
    reading: '📖',
    conversation: '💬',
  };

  return emojiMap[type] || '📝';
}
