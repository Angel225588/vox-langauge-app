/**
 * Personalized Feedback System
 *
 * Adapts feedback tone and examples based on user profile:
 * - Beginner: Simple, encouraging (like explaining to a 10 year old)
 * - Intermediate: Balanced, more context
 * - Advanced/Professional: Technical, domain-specific examples
 *
 * Also adapts to user interests (tech, travel, business, etc.)
 */

// ============================================================================
// TYPES
// ============================================================================

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserDomain =
  | 'general'
  | 'technology'
  | 'business'
  | 'travel'
  | 'academic'
  | 'healthcare'
  | 'legal'
  | 'creative';

export interface FeedbackContext {
  level: UserLevel;
  domain: UserDomain;
  nativeLanguage: string;
  targetLanguage: string;
}

export interface FeedbackOptions {
  isCorrect: boolean;
  userAnswer?: string;
  correctAnswer: string;
  explanation?: string;
  grammarPoint?: string;
}

export interface PersonalizedFeedback {
  title: string;           // "Great job!" or "Almost there!"
  message: string;         // Main feedback text
  explanation: string;     // Why this is correct/incorrect
  example?: string;        // Contextual example based on domain
  encouragement: string;   // Motivational message
  learnMorePrompt?: string; // "Tap to learn more about..."
}

// ============================================================================
// TONE TEMPLATES
// ============================================================================

const TONE_TEMPLATES = {
  beginner: {
    correct: {
      titles: ['Awesome!', 'You got it!', 'Perfect!', 'Great job!'],
      encouragements: [
        "You're doing amazing! Keep it up!",
        "See? You're getting better every day!",
        "That's exactly right! You're a natural!",
        "Fantastic! Your brain is learning fast!",
      ],
    },
    incorrect: {
      titles: ['Almost!', 'Good try!', 'So close!', "Let's learn this!"],
      encouragements: [
        "Don't worry! Making mistakes is how we learn!",
        "You're getting closer! Try one more time!",
        "That's okay! Even experts make mistakes!",
        "Keep trying! You'll get it next time!",
      ],
    },
    explanationStyle: 'simple', // Short, simple sentences
  },
  intermediate: {
    correct: {
      titles: ['Correct!', 'Well done!', 'Exactly!', 'Nice work!'],
      encouragements: [
        "You're building strong foundations!",
        "Your understanding is growing!",
        "Excellent application of the concept!",
        "Keep up the great progress!",
      ],
    },
    incorrect: {
      titles: ['Not quite', 'Review this', 'Common mistake', 'Let\'s clarify'],
      encouragements: [
        "This is a tricky one - many learners struggle here.",
        "Understanding this distinction will really help!",
        "Take a moment to review the pattern.",
        "This concept takes practice - you're on the right track!",
      ],
    },
    explanationStyle: 'balanced', // More context, some grammar terms
  },
  advanced: {
    correct: {
      titles: ['Correct', 'Precisely', 'Accurate', 'Excellent'],
      encouragements: [
        "Strong command of the language structure.",
        "Your precision is improving.",
        "Professional-level accuracy.",
        "Nuanced understanding demonstrated.",
      ],
    },
    incorrect: {
      titles: ['Incorrect', 'Review needed', 'Nuance missed', 'Reconsider'],
      encouragements: [
        "This distinction is subtle but important in professional contexts.",
        "Review the specific grammatical rule at play here.",
        "Consider the contextual implications of this choice.",
        "A common error even among advanced speakers - worth mastering.",
      ],
    },
    explanationStyle: 'technical', // Full grammar terminology, detailed
  },
};

// ============================================================================
// DOMAIN-SPECIFIC EXAMPLES
// ============================================================================

const DOMAIN_EXAMPLES: Record<UserDomain, Record<string, string>> = {
  general: {
    past_tense: "Yesterday, I went to the store.",
    present_tense: "I go to the store every day.",
    future_tense: "Tomorrow, I will go to the store.",
  },
  technology: {
    past_tense: "We deployed the update yesterday.",
    present_tense: "The system processes requests automatically.",
    future_tense: "We will implement the new feature next sprint.",
  },
  business: {
    past_tense: "The meeting concluded at 3pm.",
    present_tense: "Revenue grows quarter over quarter.",
    future_tense: "We will present the proposal on Monday.",
  },
  travel: {
    past_tense: "We visited Paris last summer.",
    present_tense: "The flight departs at 8am.",
    future_tense: "I will book the hotel next week.",
  },
  academic: {
    past_tense: "The study examined 500 participants.",
    present_tense: "Research indicates a correlation.",
    future_tense: "Future studies will explore this further.",
  },
  healthcare: {
    past_tense: "The patient recovered quickly.",
    present_tense: "The medication reduces symptoms.",
    future_tense: "We will schedule a follow-up.",
  },
  legal: {
    past_tense: "The court ruled in favor of the defendant.",
    present_tense: "The contract stipulates the terms.",
    future_tense: "The hearing will commence next month.",
  },
  creative: {
    past_tense: "The artist created a masterpiece.",
    present_tense: "Creativity flows through practice.",
    future_tense: "The exhibition will open in spring.",
  },
};

// ============================================================================
// FEEDBACK GENERATION
// ============================================================================

/**
 * Generate personalized feedback based on user context
 */
export function generatePersonalizedFeedback(
  context: FeedbackContext,
  options: FeedbackOptions
): PersonalizedFeedback {
  const tone = TONE_TEMPLATES[context.level];
  const titles = options.isCorrect ? tone.correct.titles : tone.incorrect.titles;
  const encouragements = options.isCorrect
    ? tone.correct.encouragements
    : tone.incorrect.encouragements;

  // Random selection for variety
  const title = titles[Math.floor(Math.random() * titles.length)];
  const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  // Generate explanation based on level
  const explanation = formatExplanation(
    options.explanation || '',
    context.level,
    options.isCorrect
  );

  // Get domain-specific example if available
  const example = options.grammarPoint
    ? DOMAIN_EXAMPLES[context.domain]?.[options.grammarPoint]
    : undefined;

  // Generate message
  const message = options.isCorrect
    ? `"${options.correctAnswer}" is correct!`
    : `The correct answer is "${options.correctAnswer}".${options.userAnswer ? ` You said "${options.userAnswer}".` : ''}`;

  return {
    title,
    message,
    explanation,
    example,
    encouragement,
    learnMorePrompt: options.grammarPoint
      ? `Tap to learn more about ${formatGrammarPoint(options.grammarPoint)}`
      : undefined,
  };
}

/**
 * Format explanation based on user level
 */
function formatExplanation(
  rawExplanation: string,
  level: UserLevel,
  isCorrect: boolean
): string {
  if (!rawExplanation) {
    return isCorrect
      ? "You've got the concept!"
      : "Review this pattern to understand why.";
  }

  switch (level) {
    case 'beginner':
      // Simplify: shorter sentences, no jargon
      return simplifyExplanation(rawExplanation);
    case 'intermediate':
      // Keep as-is with minor formatting
      return rawExplanation;
    case 'advanced':
      // Add technical details if available
      return rawExplanation;
    default:
      return rawExplanation;
  }
}

/**
 * Simplify explanation for beginners
 */
function simplifyExplanation(text: string): string {
  // Remove complex grammar terms
  const simplifications: Record<string, string> = {
    'conjugation': 'word form',
    'verb tense': 'time word',
    'past participle': 'past form',
    'subjunctive': 'wish/if form',
    'infinitive': 'basic form',
    'gerund': '-ing form',
    'auxiliary verb': 'helper word',
    'preposition': 'connecting word',
  };

  let simplified = text;
  for (const [complex, simple] of Object.entries(simplifications)) {
    simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
  }

  // Shorten if too long
  if (simplified.length > 150) {
    const sentences = simplified.split('. ');
    simplified = sentences.slice(0, 2).join('. ') + '.';
  }

  return simplified;
}

/**
 * Format grammar point for display
 */
function formatGrammarPoint(point: string): string {
  return point
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// ============================================================================
// QUICK FEEDBACK GENERATORS
// ============================================================================

/**
 * Generate quick correct feedback
 */
export function quickCorrectFeedback(level: UserLevel): string {
  const messages = {
    beginner: ['Yay!', 'Awesome!', 'You did it!', 'Super!'],
    intermediate: ['Correct!', 'Well done!', 'Nice!', 'Good!'],
    advanced: ['Correct', 'Precisely', 'Accurate', 'Right'],
  };
  const options = messages[level];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate quick incorrect feedback
 */
export function quickIncorrectFeedback(level: UserLevel): string {
  const messages = {
    beginner: ['Oops!', 'Try again!', 'Almost!', 'Not quite!'],
    intermediate: ['Incorrect', 'Not quite', 'Try again', 'Review this'],
    advanced: ['Incorrect', 'Reconsider', 'Not accurate', 'Review'],
  };
  const options = messages[level];
  return options[Math.floor(Math.random() * options.length)];
}

// ============================================================================
// GEMINI PROMPT HELPERS
// ============================================================================

/**
 * Generate Gemini prompt modifier for personalized feedback
 */
export function getFeedbackPromptModifier(context: FeedbackContext): string {
  const levelInstructions = {
    beginner: `
      - Use simple, short sentences (max 15 words each)
      - Avoid grammar terminology
      - Be very encouraging and positive
      - Use everyday examples
      - Explain like talking to a 10-year-old
    `,
    intermediate: `
      - Use clear explanations with some grammar terms
      - Provide context for why rules exist
      - Balance encouragement with constructive feedback
      - Use varied examples
    `,
    advanced: `
      - Use precise grammar terminology
      - Provide detailed explanations of nuances
      - Reference professional/academic contexts
      - Assume strong foundational knowledge
    `,
  };

  const domainInstruction = context.domain !== 'general'
    ? `Use examples from ${context.domain} domain when possible.`
    : '';

  return `
    Adapt your feedback for a ${context.level} ${context.targetLanguage} learner.
    ${levelInstructions[context.level]}
    ${domainInstruction}
  `.trim();
}
