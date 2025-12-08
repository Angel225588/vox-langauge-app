/**
 * Passage Generator
 *
 * Uses Gemini AI to generate personalized reading passages
 * based on user's learning goals and Word Bank.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Passage } from './types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY not found. Passage generation will fail.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ============================================================================
// TYPES
// ============================================================================

export interface PassageGeneratorOptions {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic?: string;           // Optional topic preference
  targetWords?: string[];   // Words from Word Bank to include
  wordCount?: number;       // Target word count (default: 100-200)
  style?: 'story' | 'dialogue' | 'article' | 'instructions';
}

interface GeminiPassageResponse {
  title: string;
  text: string;
  category: string;
  wordCount: number;
  estimatedDuration: number;
}

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a reading passage using AI
 *
 * @param options - Generation parameters
 * @returns Generated passage
 *
 * @example
 * ```ts
 * const passage = await generatePassage({
 *   difficulty: 'intermediate',
 *   topic: 'travel',
 *   style: 'dialogue',
 *   wordCount: 150
 * });
 * ```
 */
export async function generatePassage(
  options: PassageGeneratorOptions
): Promise<Passage> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = buildGenerationPrompt(options);

    console.log('Generating passage with Gemini AI...', {
      difficulty: options.difficulty,
      topic: options.topic || 'general',
      style: options.style || 'story',
      targetWordCount: options.wordCount || 150,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up response (remove markdown code blocks if present)
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    const geminiResponse: GeminiPassageResponse = JSON.parse(cleanedText);

    // Create passage object
    const passage: Passage = {
      id: generatePassageId(),
      title: geminiResponse.title,
      text: geminiResponse.text,
      difficulty: options.difficulty,
      category: geminiResponse.category || options.topic || 'general',
      wordCount: geminiResponse.wordCount,
      estimatedDuration: geminiResponse.estimatedDuration,
      sourceType: 'ai_generated',
      targetWords: options.targetWords,
      createdAt: new Date().toISOString(),
    };

    console.log('Successfully generated passage:', {
      title: passage.title,
      wordCount: passage.wordCount,
      difficulty: passage.difficulty,
    });

    return passage;

  } catch (error) {
    console.error('Failed to generate passage with Gemini:', error);

    // Fallback to template-based generation
    return generateFallbackPassage(options);
  }
}

/**
 * Generate a passage that includes specific words from Word Bank
 * Great for reinforcing vocabulary learning
 *
 * @param targetWords - Words to include naturally in the passage
 * @param difficulty - Difficulty level
 * @returns Generated passage featuring target words
 *
 * @example
 * ```ts
 * const passage = await generatePassageWithTargetWords(
 *   ['confident', 'interview', 'professional'],
 *   'intermediate'
 * );
 * ```
 */
export async function generatePassageWithTargetWords(
  targetWords: string[],
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<Passage> {
  return generatePassage({
    difficulty,
    targetWords,
    wordCount: 150,
    style: 'story',
    topic: inferTopicFromWords(targetWords),
  });
}

/**
 * Generate multiple passages for a study session
 *
 * @param count - Number of passages to generate
 * @param options - Generation parameters
 * @returns Array of generated passages
 *
 * @example
 * ```ts
 * const passages = await generatePassageBatch(3, {
 *   difficulty: 'beginner',
 *   topic: 'daily life',
 *   style: 'dialogue'
 * });
 * ```
 */
export async function generatePassageBatch(
  count: number,
  options: PassageGeneratorOptions
): Promise<Passage[]> {
  const passages: Passage[] = [];

  // Generate passages sequentially to avoid rate limiting
  for (let i = 0; i < count; i++) {
    try {
      const passage = await generatePassage(options);
      passages.push(passage);

      // Small delay between requests
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to generate passage ${i + 1}:`, error);
    }
  }

  return passages;
}

// ============================================================================
// TOPIC SUGGESTIONS
// ============================================================================

const TOPIC_CATEGORIES = [
  'Daily Life',
  'Travel & Culture',
  'Food & Cooking',
  'Work & Career',
  'Health & Wellness',
  'Technology',
  'Shopping',
  'Entertainment',
  'Nature & Environment',
  'Education',
  'Family & Relationships',
  'Sports & Hobbies',
];

/**
 * Get topic suggestions based on user's history
 *
 * @returns Array of suggested topics
 */
export function getTopicSuggestions(): string[] {
  // TODO: In future, personalize based on user history
  // For now, return all categories
  return TOPIC_CATEGORIES;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build the Gemini prompt for passage generation
 */
function buildGenerationPrompt(options: PassageGeneratorOptions): string {
  const {
    difficulty,
    topic = 'general',
    targetWords = [],
    wordCount = 150,
    style = 'story',
  } = options;

  const difficultyGuide = getDifficultyGuide(difficulty);
  const styleGuide = getStyleGuide(style);
  const targetWordsSection = targetWords.length > 0
    ? `\n\nIMPORTANT: Naturally include these vocabulary words in the passage:\n${targetWords.map(w => `- ${w}`).join('\n')}`
    : '';

  return `You are an expert English language teacher creating reading practice passages.

Generate a ${style} passage about "${topic}" for ${difficulty} level learners.

**Requirements:**
- Target word count: ${wordCount} words (±20 words is acceptable)
- Difficulty: ${difficulty}
${difficultyGuide}
- Style: ${style}
${styleGuide}
- Topic: ${topic}
- Make it engaging and educational
- Use natural, conversational English
- Avoid controversial or sensitive topics
- Include clear context for vocabulary${targetWordsSection}

Return ONLY valid JSON in this exact format (no markdown, no explanations):

{
  "title": "Engaging Title Here",
  "text": "The complete passage text here...",
  "category": "${topic}",
  "wordCount": ${wordCount},
  "estimatedDuration": 45
}

The text should be a single string with proper paragraph breaks using \\n\\n.
The estimatedDuration is in seconds (assume ~3 words per second for reading).

Generate the passage now:`;
}

/**
 * Get difficulty-specific guidelines for Gemini
 */
function getDifficultyGuide(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return `  - Use simple, common vocabulary
  - Short sentences (8-12 words average)
  - Present tense preferred
  - Clear, direct language`;

    case 'intermediate':
      return `  - Mix of simple and intermediate vocabulary
  - Varied sentence length (10-15 words average)
  - Mix of verb tenses
  - Some idiomatic expressions`;

    case 'advanced':
      return `  - Rich, sophisticated vocabulary
  - Complex sentence structures
  - Various verb tenses and conditionals
  - Idiomatic expressions and nuanced language`;

    default:
      return '';
  }
}

/**
 * Get style-specific guidelines for Gemini
 */
function getStyleGuide(style: string): string {
  switch (style) {
    case 'story':
      return `  - Narrative structure with beginning, middle, end
  - Descriptive language
  - Character development
  - Engaging plot`;

    case 'dialogue':
      return `  - Conversation between 2-3 people
  - Natural speech patterns
  - Speaker labels (e.g., "Sarah: Hello!")
  - Realistic exchanges`;

    case 'article':
      return `  - Informative, factual tone
  - Clear main points
  - Structured paragraphs
  - Educational content`;

    case 'instructions':
      return `  - Clear, step-by-step format
  - Imperative mood
  - Sequential organization
  - Practical, actionable content`;

    default:
      return '';
  }
}

/**
 * Infer topic from target words
 */
function inferTopicFromWords(words: string[]): string {
  // Simple keyword matching to suggest topics
  const wordString = words.join(' ').toLowerCase();

  if (wordString.includes('food') || wordString.includes('cook') || wordString.includes('restaurant')) {
    return 'food';
  }
  if (wordString.includes('travel') || wordString.includes('airport') || wordString.includes('hotel')) {
    return 'travel';
  }
  if (wordString.includes('work') || wordString.includes('job') || wordString.includes('office')) {
    return 'work';
  }
  if (wordString.includes('shop') || wordString.includes('buy') || wordString.includes('store')) {
    return 'shopping';
  }

  return 'general';
}

/**
 * Generate unique passage ID
 */
function generatePassageId(): string {
  return `passage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Estimate reading duration in seconds
 * Assumes average reading speed of ~3 words per second
 */
function estimateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 3);
}

// ============================================================================
// FALLBACK GENERATION
// ============================================================================

/**
 * Fallback passage generator (when Gemini fails)
 */
function generateFallbackPassage(options: PassageGeneratorOptions): Passage {
  console.log('Using fallback passage generator');

  const templates = getFallbackTemplates(options.difficulty);
  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    id: generatePassageId(),
    title: template.title,
    text: template.text,
    difficulty: options.difficulty,
    category: options.topic || 'general',
    wordCount: countWords(template.text),
    estimatedDuration: estimateReadingTime(countWords(template.text)),
    sourceType: 'ai_generated',
    targetWords: options.targetWords,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get fallback passage templates by difficulty
 */
function getFallbackTemplates(difficulty: string): Array<{ title: string; text: string }> {
  switch (difficulty) {
    case 'beginner':
      return [
        {
          title: 'A Day at the Park',
          text: 'Today is a beautiful day. The sun is shining and the sky is blue. I go to the park with my friend Sarah. We see many people there. Some people are walking their dogs. Other people are playing games.\n\nWe sit on a bench under a big tree. We eat sandwiches and talk about our week. Sarah tells me about her new job. She is very happy.\n\nAfter lunch, we walk around the lake. The water is calm and peaceful. We see ducks swimming. It is a perfect day.',
        },
        {
          title: 'Shopping for Groceries',
          text: 'Every Saturday, I go to the supermarket. I make a list before I go. Today I need bread, milk, eggs, and fruit.\n\nThe supermarket is busy today. Many people are shopping. I get a cart and start walking through the aisles. I find the bread in the bakery section. It smells fresh and delicious.\n\nNext, I go to the dairy section for milk and eggs. Then I pick some apples and bananas. I pay at the checkout and go home. Shopping is finished for this week.',
        },
      ];

    case 'intermediate':
      return [
        {
          title: 'Starting a New Job',
          text: 'Maria walked into the office building, feeling both excited and nervous. It was her first day at her new job as a marketing coordinator. She had spent weeks preparing for this moment, researching the company and practicing her introduction.\n\nThe receptionist greeted her warmly and called her manager, Tom. He gave her a quick tour of the office, introducing her to her new colleagues. Everyone seemed friendly and welcoming, which helped calm her nerves.\n\nBy lunchtime, Maria was already working on her first project. Though she had a lot to learn, she felt confident that she had made the right decision. This was the fresh start she had been looking for.',
        },
      ];

    case 'advanced':
      return [
        {
          title: 'The Evolution of Remote Work',
          text: 'The landscape of professional work has undergone a dramatic transformation in recent years, with remote work evolving from a rare perk to a mainstream reality. This shift, accelerated by global events, has fundamentally altered our understanding of productivity, collaboration, and work-life balance.\n\nTraditional office environments once served as the undisputed epicenter of professional life, where face-to-face interactions and physical presence were considered essential for success. However, technological advancements and changing attitudes have challenged these long-held assumptions, demonstrating that meaningful work can occur anywhere with reliable internet connectivity.\n\nAs organizations continue to navigate this new paradigm, they face both opportunities and challenges in maintaining company culture, fostering innovation, and supporting employee wellbeing across distributed teams.',
        },
      ];

    default:
      return getFallbackTemplates('beginner');
  }
}
