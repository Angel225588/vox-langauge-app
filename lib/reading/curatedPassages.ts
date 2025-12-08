/**
 * Curated Passages
 *
 * A collection of curated, high-quality passages for offline use.
 * Organized by difficulty and topic for optimal learning.
 */

import { Passage } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface CuratedPassage extends Passage {
  tags: string[];
  popularity: number;
}

// ============================================================================
// CURATED PASSAGES BY DIFFICULTY
// ============================================================================

export const CURATED_PASSAGES: Record<string, CuratedPassage[]> = {
  // ========================================
  // BEGINNER LEVEL (50-100 words)
  // ========================================
  beginner: [
    {
      id: 'curated_beginner_1',
      title: 'Meeting a New Friend',
      text: 'Hello! My name is Emma. I am from Canada. I am learning English because I want to travel around the world.\n\nI like to read books and watch movies. My favorite food is pizza. I have a small dog named Max. He is very friendly.\n\nWhat is your name? Where are you from? I hope we can be friends and practice English together.',
      difficulty: 'beginner',
      category: 'daily_life',
      wordCount: 70,
      estimatedDuration: 23,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['introduction', 'greetings', 'personal_info'],
      popularity: 95,
    },
    {
      id: 'curated_beginner_2',
      title: 'At the Cafe',
      text: 'Sarah walks into a small cafe. She is hungry and wants breakfast.\n\n"Good morning! What would you like?" the server asks.\n\n"I would like a coffee and a sandwich, please," Sarah says.\n\n"Would you like milk in your coffee?"\n\n"Yes, please. Thank you!"\n\nThe server smiles and brings her order. Sarah enjoys her breakfast and reads a book.',
      difficulty: 'beginner',
      category: 'food',
      wordCount: 62,
      estimatedDuration: 21,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['food', 'ordering', 'cafe', 'dialogue'],
      popularity: 92,
    },
    {
      id: 'curated_beginner_3',
      title: 'My Daily Routine',
      text: 'I wake up at seven o\'clock every morning. First, I brush my teeth and take a shower. Then I get dressed and have breakfast. I usually eat toast and drink orange juice.\n\nI leave home at eight o\'clock. I take the bus to work. Work starts at nine o\'clock. I work in an office.\n\nAfter work, I go home and cook dinner. In the evening, I watch TV or read a book. I go to bed at ten o\'clock.',
      difficulty: 'beginner',
      category: 'daily_life',
      wordCount: 88,
      estimatedDuration: 29,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['routine', 'daily_life', 'time'],
      popularity: 88,
    },
    {
      id: 'curated_beginner_4',
      title: 'Shopping for Clothes',
      text: 'Tom needs new clothes for his job. He goes to a clothing store.\n\n"Can I help you?" the clerk asks.\n\n"Yes, I need a shirt and pants for work," Tom says.\n\nThe clerk shows him different options. Tom tries on a blue shirt and black pants. They fit well.\n\n"How much is this?" Tom asks.\n\n"The shirt is twenty dollars and the pants are thirty-five dollars."\n\nTom buys both items. He is happy with his new clothes.',
      difficulty: 'beginner',
      category: 'shopping',
      wordCount: 85,
      estimatedDuration: 28,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['shopping', 'clothes', 'prices', 'dialogue'],
      popularity: 85,
    },
    {
      id: 'curated_beginner_5',
      title: 'The Weather Today',
      text: 'Today is a beautiful day. The sun is shining and the sky is clear. It is warm but not too hot. The temperature is about twenty-five degrees.\n\nYesterday was different. It rained all day. The sky was gray and cloudy. Everyone stayed inside.\n\nTomorrow will be sunny again. The weather forecast says it will be perfect for going to the beach or having a picnic in the park.',
      difficulty: 'beginner',
      category: 'daily_life',
      wordCount: 75,
      estimatedDuration: 25,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['weather', 'description', 'outdoors'],
      popularity: 80,
    },
    {
      id: 'curated_beginner_6',
      title: 'Peter Piper Tongue Twister',
      text: 'Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked. If Peter Piper picked a peck of pickled peppers, where\'s the peck of pickled peppers Peter Piper picked?',
      difficulty: 'beginner',
      category: 'pronunciation',
      wordCount: 40,
      estimatedDuration: 13,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['tongue_twister', 'pronunciation', 'p_sound'],
      popularity: 75,
    },
  ],

  // ========================================
  // INTERMEDIATE LEVEL (100-200 words)
  // ========================================
  intermediate: [
    {
      id: 'curated_intermediate_1',
      title: 'Job Interview Preparation',
      text: 'Maria has an important job interview tomorrow morning. She has been preparing for two weeks. Tonight, she is reviewing her notes one last time.\n\nShe has researched the company thoroughly. She knows their mission statement, recent projects, and company culture. She has also prepared answers to common interview questions like "What are your strengths?" and "Why do you want to work here?"\n\nMaria has chosen a professional outfit: a navy blue suit and comfortable shoes. She plans to arrive fifteen minutes early to show punctuality and reduce stress.\n\nBefore bed, she sets two alarms to ensure she wakes up on time. She feels nervous but confident. Maria has worked hard to get this opportunity, and she is ready to make a great impression tomorrow.',
      difficulty: 'intermediate',
      category: 'work',
      wordCount: 135,
      estimatedDuration: 45,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['job_interview', 'work', 'preparation', 'professional'],
      popularity: 95,
    },
    {
      id: 'curated_intermediate_2',
      title: 'Planning a Weekend Trip',
      text: 'Alex: "Hey, Lisa! Do you have any plans for this weekend?"\n\nLisa: "Not yet. Why do you ask?"\n\nAlex: "I was thinking we could take a trip to the mountains. The weather forecast looks perfect."\n\nLisa: "That sounds great! How long would we go for?"\n\nAlex: "Just two days. We could leave Saturday morning and come back Sunday evening."\n\nLisa: "I love that idea. What should we bring?"\n\nAlex: "Hiking shoes, warm clothes, and snacks. Oh, and don\'t forget your camera! The views are amazing."\n\nLisa: "Perfect! I\'ll check my schedule and let you know by tonight."\n\nAlex: "Sounds good. I\'m excited already!"',
      difficulty: 'intermediate',
      category: 'travel',
      wordCount: 115,
      estimatedDuration: 38,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['travel', 'planning', 'dialogue', 'friends'],
      popularity: 90,
    },
    {
      id: 'curated_intermediate_3',
      title: 'Healthy Eating Habits',
      text: 'Developing healthy eating habits is essential for maintaining good health and energy levels throughout the day. Many people struggle with this because of busy schedules and convenient fast food options.\n\nOne effective strategy is meal planning. By preparing meals in advance, you can ensure you have nutritious options available when you\'re hungry. Include plenty of vegetables, fruits, whole grains, and lean proteins in your diet.\n\nAnother important habit is eating regularly. Skipping meals can lead to overeating later. Try to eat three balanced meals and one or two healthy snacks each day.\n\nStaying hydrated is equally important. Drink water throughout the day instead of sugary beverages. Small changes in your daily routine can lead to significant improvements in your overall health.',
      difficulty: 'intermediate',
      category: 'health',
      wordCount: 135,
      estimatedDuration: 45,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['health', 'nutrition', 'habits', 'lifestyle'],
      popularity: 87,
    },
    {
      id: 'curated_intermediate_4',
      title: 'First Day Living Abroad',
      text: 'When I arrived in my new apartment in Tokyo, I felt a mixture of excitement and anxiety. Everything looked different from what I was used to back home. The street signs were in Japanese, the electrical outlets had a different shape, and even the door locks worked differently.\n\nMy first challenge was finding the nearest grocery store. I tried using a translation app on my phone, but I still felt lost. Eventually, a kind neighbor noticed my confusion and helped me find the store. She even showed me which products were good for beginners.\n\nThat evening, I unpacked my bags and set up my small apartment. Despite feeling overwhelmed, I was proud of myself for taking this leap. I knew the next few months would be challenging, but also incredibly rewarding.',
      difficulty: 'intermediate',
      category: 'travel',
      wordCount: 145,
      estimatedDuration: 48,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['travel', 'living_abroad', 'culture', 'adaptation'],
      popularity: 85,
    },
    {
      id: 'curated_intermediate_5',
      title: 'Learning a Musical Instrument',
      text: 'Learning to play a musical instrument is a rewarding journey that requires patience and dedication. Whether you choose the guitar, piano, violin, or any other instrument, the process follows similar stages.\n\nIn the beginning, progress feels slow. Your fingers don\'t move the way you want them to, and simple songs seem impossibly difficult. Many people give up during this frustrating phase. However, those who persist start to notice improvement after a few weeks of regular practice.\n\nThe key is consistency. Practicing for thirty minutes every day is more effective than practicing for three hours once a week. Set realistic goals and celebrate small victories along the way.\n\nRemember, every professional musician was once a beginner. With time and effort, you too can develop this valuable skill.',
      difficulty: 'intermediate',
      category: 'hobbies',
      wordCount: 138,
      estimatedDuration: 46,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['hobbies', 'music', 'learning', 'persistence'],
      popularity: 82,
    },
    {
      id: 'curated_intermediate_6',
      title: 'She Sells Seashells',
      text: 'She sells seashells by the seashore. The shells she sells are surely seashells. So if she sells shells on the seashore, I\'m sure she sells seashore shells.',
      difficulty: 'intermediate',
      category: 'pronunciation',
      wordCount: 32,
      estimatedDuration: 11,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['tongue_twister', 'pronunciation', 's_sound'],
      popularity: 78,
    },
  ],

  // ========================================
  // ADVANCED LEVEL (200-300 words)
  // ========================================
  advanced: [
    {
      id: 'curated_advanced_1',
      title: 'The Digital Transformation of Education',
      text: 'The educational landscape has undergone a profound transformation in recent years, driven largely by rapid technological advancement and changing societal needs. Traditional classroom models, which remained relatively unchanged for centuries, have been challenged by innovative digital platforms and pedagogical approaches that promise more personalized and effective learning experiences.\n\nThis shift has been both celebrated and criticized. Proponents argue that technology enables unprecedented access to educational resources, allowing students from diverse backgrounds to learn at their own pace and according to their individual learning styles. Adaptive learning algorithms can identify knowledge gaps and provide targeted instruction, potentially revolutionizing how we approach education.\n\nHowever, critics raise valid concerns about the digital divide, questioning whether increased reliance on technology might actually exacerbate existing educational inequalities. Students without reliable internet access or appropriate devices may find themselves at a significant disadvantage. Additionally, some educators worry that excessive screen time and reduced face-to-face interaction could negatively impact social development and critical thinking skills.\n\nAs we navigate this transitional period, it\'s clear that the future of education will likely involve a thoughtful blend of traditional and digital methods. The challenge lies in harnessing technology\'s potential while preserving the human elements that make education truly transformative: mentorship, collaboration, and the cultivation of curiosity.',
      difficulty: 'advanced',
      category: 'education',
      wordCount: 210,
      estimatedDuration: 70,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['education', 'technology', 'society', 'debate'],
      popularity: 92,
    },
    {
      id: 'curated_advanced_2',
      title: 'Negotiating a Business Partnership',
      text: 'Rachel: "Thank you for meeting with me today, Mr. Chen. I\'ve reviewed your proposal thoroughly, and I must say, it\'s quite compelling."\n\nMr. Chen: "I appreciate that, Rachel. We\'ve put considerable thought into how our companies could create synergies. What aspects particularly resonate with you?"\n\nRachel: "Your market analysis is impressive, and I agree there\'s significant potential. However, I have some concerns about the proposed timeline. The six-month launch window seems rather ambitious given the regulatory hurdles we\'ll need to navigate."\n\nMr. Chen: "That\'s a fair point. We were perhaps optimistic in our initial projections. What timeframe would you consider more realistic?"\n\nRachel: "Based on our experience with similar projects, I\'d suggest nine to twelve months. This would allow adequate time for compliance reviews and beta testing."\n\nMr. Chen: "I see your reasoning. If we extend the timeline, we\'d need to revisit the budget allocation. Would your team be willing to increase their initial investment proportionally?"\n\nRachel: "That would depend on the specific figures, but I\'m open to discussing it. Perhaps we should schedule a follow-up meeting with both of our financial teams present?"\n\nMr. Chen: "Excellent idea. I\'ll have my assistant coordinate with yours."',
      difficulty: 'advanced',
      category: 'business',
      wordCount: 215,
      estimatedDuration: 72,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['business', 'negotiation', 'professional', 'dialogue'],
      popularity: 88,
    },
    {
      id: 'curated_advanced_3',
      title: 'The Psychology of Decision Making',
      text: 'Human decision-making is far more complex than the rational choice theory suggests. While we like to believe our decisions are based on careful analysis and logical reasoning, psychological research reveals that cognitive biases and emotional factors play substantial roles in how we make choices.\n\nOne particularly influential concept is "loss aversion," the tendency for people to prefer avoiding losses over acquiring equivalent gains. This bias explains why investors often hold onto losing stocks too long, hoping to break even, while selling winning stocks too quickly to "lock in" gains. The pain of losing money feels approximately twice as intense as the pleasure of gaining the same amount.\n\nAnother fascinating phenomenon is the "paradox of choice." Contrary to intuition, having too many options can actually lead to decision paralysis and decreased satisfaction. Research has shown that consumers presented with twenty-four varieties of jam were less likely to make a purchase than those presented with just six options.\n\nUnderstanding these psychological mechanisms can help us make better decisions. By recognizing our inherent biases, we can implement strategies to counteract them, such as setting predetermined criteria before making important choices or limiting our options to a manageable number. Awareness, it seems, is the first step toward more rational decision-making.',
      difficulty: 'advanced',
      category: 'psychology',
      wordCount: 210,
      estimatedDuration: 70,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['psychology', 'decision_making', 'cognitive_bias', 'science'],
      popularity: 85,
    },
    {
      id: 'curated_advanced_4',
      title: 'Sustainable Urban Development',
      text: 'As global urban populations continue to grow exponentially, the concept of sustainable urban development has evolved from an idealistic vision to an urgent necessity. Cities now consume over seventy percent of the world\'s energy and produce more than seventy percent of global greenhouse gas emissions, making urban sustainability crucial for addressing climate change.\n\nModern sustainable urban planning encompasses multiple dimensions: environmental, economic, and social. Green infrastructure, such as urban forests and permeable pavements, helps manage stormwater while reducing urban heat island effects. Mixed-use development reduces the need for long commutes, decreasing carbon emissions and improving residents\' quality of life.\n\nHowever, implementing these solutions faces significant challenges. Retrofitting existing infrastructure is expensive, and political will often wavers in the face of short-term costs. Additionally, rapid urbanization in developing countries creates pressure to prioritize immediate housing needs over long-term sustainability goals.\n\nSuccessful examples do exist. Copenhagen has invested heavily in cycling infrastructure, resulting in more than sixty percent of residents commuting by bicycle. Singapore has implemented innovative vertical gardens and comprehensive public transportation. These cities demonstrate that with commitment and strategic planning, urban sustainability is achievable.\n\nThe path forward requires collaboration between governments, private sector, and citizens, all working toward shared environmental goals.',
      difficulty: 'advanced',
      category: 'environment',
      wordCount: 210,
      estimatedDuration: 70,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['environment', 'urban_planning', 'sustainability', 'climate'],
      popularity: 83,
    },
    {
      id: 'curated_advanced_5',
      title: 'The Sixth Sick Sheikh',
      text: 'The sixth sick sheikh\'s sixth sheep\'s sick. The sixth sheikh\'s sixth sheep is sick. How much wood would a woodchuck chuck if a woodchuck could chuck wood? A woodchuck would chuck as much wood as a woodchuck could chuck if a woodchuck could chuck wood.',
      difficulty: 'advanced',
      category: 'pronunciation',
      wordCount: 55,
      estimatedDuration: 18,
      sourceType: 'curated',
      createdAt: new Date().toISOString(),
      tags: ['tongue_twister', 'pronunciation', 'difficult'],
      popularity: 75,
    },
  ],
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get passages by difficulty
 *
 * @param difficulty - Difficulty level to filter by
 * @returns Array of curated passages at that difficulty
 *
 * @example
 * ```ts
 * const beginnerPassages = getPassagesByDifficulty('beginner');
 * ```
 */
export function getPassagesByDifficulty(difficulty: string): CuratedPassage[] {
  return CURATED_PASSAGES[difficulty] || [];
}

/**
 * Get all curated passages
 *
 * @returns All curated passages across all difficulties
 */
export function getAllCuratedPassages(): CuratedPassage[] {
  return Object.values(CURATED_PASSAGES).flat();
}

/**
 * Get random passage
 *
 * @param difficulty - Optional difficulty filter
 * @returns Random curated passage
 *
 * @example
 * ```ts
 * const randomPassage = getRandomPassage('intermediate');
 * ```
 */
export function getRandomPassage(difficulty?: string): CuratedPassage {
  const passages = difficulty
    ? getPassagesByDifficulty(difficulty)
    : getAllCuratedPassages();

  if (passages.length === 0) {
    throw new Error('No passages available for the specified difficulty');
  }

  const randomIndex = Math.floor(Math.random() * passages.length);
  return passages[randomIndex];
}

/**
 * Search passages by keyword
 *
 * @param query - Search query (searches title, text, tags, and category)
 * @returns Matching passages
 *
 * @example
 * ```ts
 * const travelPassages = searchPassages('travel');
 * ```
 */
export function searchPassages(query: string): CuratedPassage[] {
  const lowercaseQuery = query.toLowerCase();
  const allPassages = getAllCuratedPassages();

  return allPassages.filter(passage => {
    const titleMatch = passage.title.toLowerCase().includes(lowercaseQuery);
    const textMatch = passage.text.toLowerCase().includes(lowercaseQuery);
    const categoryMatch = passage.category.toLowerCase().includes(lowercaseQuery);
    const tagsMatch = passage.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));

    return titleMatch || textMatch || categoryMatch || tagsMatch;
  });
}

/**
 * Get passages by category
 *
 * @param category - Category to filter by
 * @returns Passages in that category
 *
 * @example
 * ```ts
 * const workPassages = getPassagesByCategory('work');
 * ```
 */
export function getPassagesByCategory(category: string): CuratedPassage[] {
  const allPassages = getAllCuratedPassages();
  return allPassages.filter(passage =>
    passage.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get passages by tags
 *
 * @param tags - Tags to filter by
 * @returns Passages containing any of the specified tags
 *
 * @example
 * ```ts
 * const dialoguePassages = getPassagesByTags(['dialogue']);
 * ```
 */
export function getPassagesByTags(tags: string[]): CuratedPassage[] {
  const lowercaseTags = tags.map(tag => tag.toLowerCase());
  const allPassages = getAllCuratedPassages();

  return allPassages.filter(passage =>
    passage.tags.some(tag => lowercaseTags.includes(tag.toLowerCase()))
  );
}

/**
 * Get most popular passages
 *
 * @param limit - Maximum number of passages to return
 * @returns Top passages sorted by popularity
 *
 * @example
 * ```ts
 * const topPassages = getMostPopularPassages(5);
 * ```
 */
export function getMostPopularPassages(limit: number = 10): CuratedPassage[] {
  const allPassages = getAllCuratedPassages();
  return allPassages
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Get passage statistics
 *
 * @returns Statistics about the curated passages collection
 */
export function getPassageStats(): {
  total: number;
  byDifficulty: Record<string, number>;
  byCategory: Record<string, number>;
  averageWordCount: number;
  averageDuration: number;
} {
  const allPassages = getAllCuratedPassages();

  const byDifficulty: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let totalWords = 0;
  let totalDuration = 0;

  allPassages.forEach(passage => {
    byDifficulty[passage.difficulty] = (byDifficulty[passage.difficulty] || 0) + 1;
    byCategory[passage.category] = (byCategory[passage.category] || 0) + 1;
    totalWords += passage.wordCount;
    totalDuration += passage.estimatedDuration;
  });

  return {
    total: allPassages.length,
    byDifficulty,
    byCategory,
    averageWordCount: Math.round(totalWords / allPassages.length),
    averageDuration: Math.round(totalDuration / allPassages.length),
  };
}
