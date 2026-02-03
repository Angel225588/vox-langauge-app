/**
 * Interactive Dialogue Scenarios
 *
 * Structured conversations for practicing real-world situations.
 * ElevenLabs speaks Person A, user reads/speaks Person B lines.
 *
 * @module lib/scenarios/dialogueScenarios
 */

// =============================================================================
// Types
// =============================================================================

export type ScenarioCategory =
  | 'greetings'
  | 'travel'
  | 'food'
  | 'shopping'
  | 'emergency'
  | 'social'
  | 'work'
  | 'daily';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface DialogueLine {
  /** Speaker identifier */
  speaker: 'A' | 'B';
  /** The actual line to say/read */
  text: string;
  /** Translation hint (shown on tap) */
  translation?: string;
  /** Pronunciation tip */
  pronunciationTip?: string;
  /** Key vocabulary in this line */
  keyVocab?: string[];
}

export interface DialogueScenario {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Brief description */
  description: string;
  /** Category for filtering */
  category: ScenarioCategory;
  /** Difficulty level */
  difficulty: DifficultyLevel;
  /** Target language code */
  targetLanguage: string;
  /** Context setting for the AI */
  context: string;
  /** Role of Person A (AI) */
  roleA: string;
  /** Role of Person B (User) */
  roleB: string;
  /** The dialogue lines */
  lines: DialogueLine[];
  /** Estimated duration in seconds */
  estimatedDuration: number;
  /** Premium only? */
  isPremium: boolean;
  /** Tags for search */
  tags: string[];
  /** Icon name (Ionicons) */
  icon: string;
}

// =============================================================================
// 10 Essential Scenarios Everyone Should Know
// =============================================================================

export const ESSENTIAL_SCENARIOS: DialogueScenario[] = [
  // 1. MEETING SOMEONE
  {
    id: 'greeting-first-meeting',
    title: 'Nice to Meet You',
    description: 'First-time introduction basics',
    category: 'greetings',
    difficulty: 'beginner',
    targetLanguage: 'en',
    context: 'Meeting someone new at a social event or workplace',
    roleA: 'New acquaintance',
    roleB: 'You',
    icon: 'hand-left',
    estimatedDuration: 45,
    isPremium: false,
    tags: ['introduction', 'greeting', 'essential', 'beginner'],
    lines: [
      {
        speaker: 'A',
        text: "Hi! I don't think we've met. I'm Sarah.",
        translation: 'Greeting with introduction',
        keyVocab: ["I don't think", "we've met"],
      },
      {
        speaker: 'B',
        text: "Nice to meet you, Sarah. I'm [your name].",
        translation: 'Polite response with your name',
        pronunciationTip: 'Stress "nice" and "meet"',
        keyVocab: ['Nice to meet you'],
      },
      {
        speaker: 'A',
        text: 'Nice to meet you too! What do you do?',
        keyVocab: ['What do you do'],
      },
      {
        speaker: 'B',
        text: "I work in [your field]. How about you?",
        pronunciationTip: '"How about you" flows as one phrase',
        keyVocab: ['I work in', 'How about you'],
      },
      {
        speaker: 'A',
        text: "I'm a software developer. It was great meeting you!",
        keyVocab: ['It was great meeting you'],
      },
      {
        speaker: 'B',
        text: 'You too! Hope to see you around.',
        pronunciationTip: '"Hope to" sounds like "hope-ta"',
        keyVocab: ['Hope to see you around'],
      },
    ],
  },

  // 2. ORDERING FOOD
  {
    id: 'restaurant-ordering',
    title: 'At the Restaurant',
    description: 'Order food like a local',
    category: 'food',
    difficulty: 'beginner',
    targetLanguage: 'en',
    context: 'Ordering at a casual restaurant',
    roleA: 'Server',
    roleB: 'Customer (You)',
    icon: 'restaurant',
    estimatedDuration: 60,
    isPremium: false,
    tags: ['restaurant', 'food', 'ordering', 'essential'],
    lines: [
      {
        speaker: 'A',
        text: 'Good evening! Table for how many?',
        keyVocab: ['Table for'],
      },
      {
        speaker: 'B',
        text: 'Just for two, please.',
        pronunciationTip: '"Just" with soft J sound',
        keyVocab: ['Just for', 'please'],
      },
      {
        speaker: 'A',
        text: 'Right this way. Here are your menus. Can I get you something to drink?',
        keyVocab: ['Right this way', 'Can I get you'],
      },
      {
        speaker: 'B',
        text: "I'll have water, please. And could we have a few minutes to decide?",
        pronunciationTip: '"Could we" sounds like "could-we"',
        keyVocab: ["I'll have", 'could we have', 'a few minutes'],
      },
      {
        speaker: 'A',
        text: 'Of course! Take your time. Ready to order?',
        keyVocab: ['Take your time', 'Ready to order'],
      },
      {
        speaker: 'B',
        text: "Yes, I'd like the grilled salmon, please.",
        pronunciationTip: '"I\'d like" is very polite',
        keyVocab: ["I'd like"],
      },
      {
        speaker: 'A',
        text: 'Excellent choice. Anything else?',
        keyVocab: ['Anything else'],
      },
      {
        speaker: 'B',
        text: "That's all for now, thank you.",
        keyVocab: ["That's all for now"],
      },
    ],
  },

  // 3. ASKING FOR DIRECTIONS
  {
    id: 'asking-directions',
    title: 'Getting Around',
    description: 'Ask and understand directions',
    category: 'travel',
    difficulty: 'beginner',
    targetLanguage: 'en',
    context: 'Lost in a new city, asking a local for help',
    roleA: 'Helpful local',
    roleB: 'Traveler (You)',
    icon: 'navigate',
    estimatedDuration: 50,
    isPremium: false,
    tags: ['directions', 'travel', 'navigation', 'essential'],
    lines: [
      {
        speaker: 'B',
        text: "Excuse me, could you help me? I'm looking for the train station.",
        pronunciationTip: '"Excuse me" - stress on "cuse"',
        keyVocab: ['Excuse me', 'could you help', "I'm looking for"],
      },
      {
        speaker: 'A',
        text: "Sure! It's about a 10-minute walk. Go straight down this street.",
        keyVocab: ['Go straight', 'down this street'],
      },
      {
        speaker: 'B',
        text: 'Go straight. Got it. Then what?',
        pronunciationTip: '"Got it" - casual confirmation',
        keyVocab: ['Got it', 'Then what'],
      },
      {
        speaker: 'A',
        text: "Turn left at the traffic light, and you'll see it on your right.",
        keyVocab: ['Turn left', 'at the traffic light', 'on your right'],
      },
      {
        speaker: 'B',
        text: 'Left at the light, then on my right. Thank you so much!',
        pronunciationTip: 'Repeat to confirm understanding',
        keyVocab: ['Thank you so much'],
      },
      {
        speaker: 'A',
        text: "You're welcome! Have a good day!",
        keyVocab: ["You're welcome"],
      },
    ],
  },

  // 4. SMALL TALK / WEATHER
  {
    id: 'small-talk-weather',
    title: 'Weather Chat',
    description: 'Master the art of small talk',
    category: 'social',
    difficulty: 'beginner',
    targetLanguage: 'en',
    context: 'Casual conversation with a neighbor or colleague',
    roleA: 'Neighbor/Colleague',
    roleB: 'You',
    icon: 'partly-sunny',
    estimatedDuration: 40,
    isPremium: false,
    tags: ['small talk', 'weather', 'casual', 'social'],
    lines: [
      {
        speaker: 'A',
        text: 'Beautiful day today, isn\'t it?',
        keyVocab: ["isn't it"],
      },
      {
        speaker: 'B',
        text: "It really is! Perfect weather for being outside.",
        pronunciationTip: '"It really is" shows agreement',
        keyVocab: ['It really is', 'Perfect weather for'],
      },
      {
        speaker: 'A',
        text: "I heard it might rain this weekend though.",
        keyVocab: ['I heard', 'it might'],
      },
      {
        speaker: 'B',
        text: "Oh no, I hope not. I was planning to go hiking.",
        pronunciationTip: '"I hope not" - common phrase',
        keyVocab: ['I hope not', 'I was planning to'],
      },
      {
        speaker: 'A',
        text: 'Fingers crossed! Well, enjoy the sunshine while it lasts.',
        keyVocab: ['Fingers crossed', 'while it lasts'],
      },
      {
        speaker: 'B',
        text: 'You too! Have a great day.',
        keyVocab: ['You too'],
      },
    ],
  },

  // 5. SHOPPING
  {
    id: 'shopping-clothes',
    title: 'Shopping for Clothes',
    description: 'Navigate retail conversations',
    category: 'shopping',
    difficulty: 'intermediate',
    targetLanguage: 'en',
    context: 'Shopping at a clothing store',
    roleA: 'Store clerk',
    roleB: 'Shopper (You)',
    icon: 'shirt',
    estimatedDuration: 55,
    isPremium: false,
    tags: ['shopping', 'clothes', 'retail', 'essential'],
    lines: [
      {
        speaker: 'A',
        text: 'Hi there! Can I help you find anything?',
        keyVocab: ['Can I help you find'],
      },
      {
        speaker: 'B',
        text: "Yes, I'm looking for a jacket. Something casual.",
        pronunciationTip: '"Something casual" - describe what you want',
        keyVocab: ["I'm looking for", 'Something casual'],
      },
      {
        speaker: 'A',
        text: 'What size are you?',
        keyVocab: ['What size'],
      },
      {
        speaker: 'B',
        text: "I'm usually a medium, but could I try both medium and large?",
        pronunciationTip: '"Could I try" is polite request',
        keyVocab: ["I'm usually a", 'could I try'],
      },
      {
        speaker: 'A',
        text: 'Of course! The fitting rooms are in the back.',
        keyVocab: ['fitting rooms'],
      },
      {
        speaker: 'B',
        text: 'This one fits well. How much is it?',
        pronunciationTip: '"fits well" - present tense',
        keyVocab: ['fits well', 'How much is it'],
      },
      {
        speaker: 'A',
        text: "It's $59.99. Would you like to try anything else?",
        keyVocab: ['Would you like to'],
      },
      {
        speaker: 'B',
        text: "No, I'll take this one. Can I pay by card?",
        pronunciationTip: '"I\'ll take this" = buying decision',
        keyVocab: ["I'll take", 'pay by card'],
      },
    ],
  },

  // 6. PHONE CALL
  {
    id: 'phone-call-appointment',
    title: 'Making an Appointment',
    description: 'Schedule appointments by phone',
    category: 'daily',
    difficulty: 'intermediate',
    targetLanguage: 'en',
    context: 'Calling to make a doctor/dentist appointment',
    roleA: 'Receptionist',
    roleB: 'Caller (You)',
    icon: 'call',
    estimatedDuration: 50,
    isPremium: true,
    tags: ['phone', 'appointment', 'medical', 'essential'],
    lines: [
      {
        speaker: 'A',
        text: "Good morning, Dr. Smith's office. How can I help you?",
        keyVocab: ['How can I help you'],
      },
      {
        speaker: 'B',
        text: "Hi, I'd like to make an appointment for a check-up.",
        pronunciationTip: '"I\'d like to make" - polite request',
        keyVocab: ["I'd like to make an appointment", 'check-up'],
      },
      {
        speaker: 'A',
        text: 'Sure. Are you a new patient or existing?',
        keyVocab: ['new patient', 'existing'],
      },
      {
        speaker: 'B',
        text: "I'm an existing patient. My name is [your name].",
        keyVocab: ['existing patient'],
      },
      {
        speaker: 'A',
        text: 'When would you like to come in? We have availability Thursday or Friday.',
        keyVocab: ['When would you like to', 'We have availability'],
      },
      {
        speaker: 'B',
        text: 'Thursday works for me. What times are available?',
        pronunciationTip: '"works for me" - casual agreement',
        keyVocab: ['works for me', 'What times are available'],
      },
      {
        speaker: 'A',
        text: 'We have 2pm or 4pm.',
        keyVocab: ['We have'],
      },
      {
        speaker: 'B',
        text: "2pm is perfect. Thank you!",
        keyVocab: ['is perfect'],
      },
    ],
  },

  // 7. EMERGENCY PHRASES
  {
    id: 'emergency-help',
    title: 'Emergency Situations',
    description: 'Critical phrases for emergencies',
    category: 'emergency',
    difficulty: 'beginner',
    targetLanguage: 'en',
    context: 'Various emergency situations',
    roleA: 'Helper/Emergency responder',
    roleB: 'Person needing help (You)',
    icon: 'warning',
    estimatedDuration: 45,
    isPremium: false,
    tags: ['emergency', 'help', 'essential', 'safety'],
    lines: [
      {
        speaker: 'B',
        text: 'Help! I need help, please!',
        pronunciationTip: 'Speak clearly and loudly',
        keyVocab: ['Help', 'I need help'],
      },
      {
        speaker: 'A',
        text: "What's wrong? Are you okay?",
        keyVocab: ["What's wrong", 'Are you okay'],
      },
      {
        speaker: 'B',
        text: "I've lost my passport. Can you help me find the police station?",
        pronunciationTip: '"I\'ve lost" for recent loss',
        keyVocab: ["I've lost", 'police station'],
      },
      {
        speaker: 'A',
        text: "Don't worry. It's two blocks that way.",
        keyVocab: ["Don't worry", 'two blocks'],
      },
      {
        speaker: 'B',
        text: 'Thank you. Do you know if they speak English there?',
        pronunciationTip: '"Do you know if" - indirect question',
        keyVocab: ['Do you know if'],
      },
      {
        speaker: 'A',
        text: "Yes, they should. Good luck!",
        keyVocab: ['they should'],
      },
    ],
  },

  // 8. JOB INTERVIEW BASICS
  {
    id: 'job-interview-intro',
    title: 'Job Interview Start',
    description: 'Make a great first impression',
    category: 'work',
    difficulty: 'intermediate',
    targetLanguage: 'en',
    context: 'Beginning of a job interview',
    roleA: 'Interviewer',
    roleB: 'Job candidate (You)',
    icon: 'briefcase',
    estimatedDuration: 60,
    isPremium: true,
    tags: ['job', 'interview', 'work', 'professional'],
    lines: [
      {
        speaker: 'A',
        text: 'Thanks for coming in today. Please, have a seat.',
        keyVocab: ['Thanks for coming in', 'have a seat'],
      },
      {
        speaker: 'B',
        text: "Thank you for having me. I'm excited to be here.",
        pronunciationTip: '"Thank you for having me" - formal',
        keyVocab: ['Thank you for having me', "I'm excited to"],
      },
      {
        speaker: 'A',
        text: 'So, tell me a little about yourself.',
        keyVocab: ['Tell me about yourself'],
      },
      {
        speaker: 'B',
        text: "I have five years of experience in marketing, and I'm passionate about digital strategy.",
        pronunciationTip: 'Speak confidently, moderate pace',
        keyVocab: ['I have experience in', "I'm passionate about"],
      },
      {
        speaker: 'A',
        text: 'Why are you interested in this position?',
        keyVocab: ['Why are you interested in'],
      },
      {
        speaker: 'B',
        text: "I admire your company's innovation, and I believe my skills would be a great fit.",
        pronunciationTip: '"I believe" shows confidence',
        keyVocab: ['I admire', 'I believe', 'would be a great fit'],
      },
      {
        speaker: 'A',
        text: 'Do you have any questions for us?',
        keyVocab: ['Do you have any questions'],
      },
      {
        speaker: 'B',
        text: 'Yes, what does a typical day look like in this role?',
        pronunciationTip: 'Always have questions prepared',
        keyVocab: ['What does... look like'],
      },
    ],
  },

  // 9. MAKING PLANS
  {
    id: 'making-plans-friends',
    title: 'Making Plans',
    description: 'Arrange to meet up with someone',
    category: 'social',
    difficulty: 'intermediate',
    targetLanguage: 'en',
    context: 'Coordinating plans with a friend',
    roleA: 'Friend',
    roleB: 'You',
    icon: 'calendar',
    estimatedDuration: 50,
    isPremium: false,
    tags: ['plans', 'social', 'friends', 'scheduling'],
    lines: [
      {
        speaker: 'A',
        text: 'Hey! Are you free this weekend?',
        keyVocab: ['Are you free'],
      },
      {
        speaker: 'B',
        text: "I think so! What did you have in mind?",
        pronunciationTip: '"What did you have in mind" - asking for ideas',
        keyVocab: ['I think so', 'What did you have in mind'],
      },
      {
        speaker: 'A',
        text: 'How about we grab coffee on Saturday?',
        keyVocab: ['How about', 'grab coffee'],
      },
      {
        speaker: 'B',
        text: 'Sounds great! What time works for you?',
        pronunciationTip: '"Sounds great" - enthusiastic agreement',
        keyVocab: ['Sounds great', 'What time works for you'],
      },
      {
        speaker: 'A',
        text: "How about 3pm? There's a new café downtown.",
        keyVocab: ['How about', "There's a new"],
      },
      {
        speaker: 'B',
        text: "Perfect! Text me the address. Can't wait!",
        pronunciationTip: '"Can\'t wait" shows excitement',
        keyVocab: ['Text me', "Can't wait"],
      },
    ],
  },

  // 10. EXPRESSING OPINIONS
  {
    id: 'expressing-opinions',
    title: 'Sharing Your Opinion',
    description: 'Politely agree or disagree',
    category: 'social',
    difficulty: 'advanced',
    targetLanguage: 'en',
    context: 'Casual discussion about a topic',
    roleA: 'Conversation partner',
    roleB: 'You',
    icon: 'chatbubbles',
    estimatedDuration: 55,
    isPremium: true,
    tags: ['opinions', 'discussion', 'advanced', 'social'],
    lines: [
      {
        speaker: 'A',
        text: 'What do you think about remote work?',
        keyVocab: ['What do you think about'],
      },
      {
        speaker: 'B',
        text: 'Personally, I think it has both pros and cons.',
        pronunciationTip: '"Personally" softens your opinion',
        keyVocab: ['Personally', 'I think', 'pros and cons'],
      },
      {
        speaker: 'A',
        text: 'I prefer working from home. The flexibility is great.',
        keyVocab: ['I prefer', 'The flexibility'],
      },
      {
        speaker: 'B',
        text: "I see your point, but I also miss the social interaction.",
        pronunciationTip: '"I see your point, but" - polite disagreement',
        keyVocab: ['I see your point', 'but', 'I also miss'],
      },
      {
        speaker: 'A',
        text: "That's true. It can get lonely.",
        keyVocab: ["That's true"],
      },
      {
        speaker: 'B',
        text: 'Maybe a hybrid approach is the best of both worlds.',
        pronunciationTip: '"Maybe" suggests compromise',
        keyVocab: ['Maybe', 'the best of both worlds'],
      },
      {
        speaker: 'A',
        text: "I hadn't thought of it that way. Good point!",
        keyVocab: ["I hadn't thought of it that way"],
      },
      {
        speaker: 'B',
        text: "It's definitely something to consider.",
        keyVocab: ['something to consider'],
      },
    ],
  },
];

// =============================================================================
// Helpers
// =============================================================================

/**
 * Get scenarios filtered by category
 */
export function getScenariosByCategory(category: ScenarioCategory): DialogueScenario[] {
  return ESSENTIAL_SCENARIOS.filter(s => s.category === category);
}

/**
 * Get scenarios filtered by difficulty
 */
export function getScenariosByDifficulty(difficulty: DifficultyLevel): DialogueScenario[] {
  return ESSENTIAL_SCENARIOS.filter(s => s.difficulty === difficulty);
}

/**
 * Get free scenarios only
 */
export function getFreeScenarios(): DialogueScenario[] {
  return ESSENTIAL_SCENARIOS.filter(s => !s.isPremium);
}

/**
 * Get a scenario by ID
 */
export function getScenarioById(id: string): DialogueScenario | undefined {
  return ESSENTIAL_SCENARIOS.find(s => s.id === id);
}

/**
 * Get category display info
 */
export const CATEGORY_INFO: Record<ScenarioCategory, { label: string; icon: string; color: string }> = {
  greetings: { label: 'Greetings', icon: 'hand-left', color: '#6366F1' },
  travel: { label: 'Travel', icon: 'airplane', color: '#06D6A0' },
  food: { label: 'Food & Dining', icon: 'restaurant', color: '#F59E0B' },
  shopping: { label: 'Shopping', icon: 'cart', color: '#EC4899' },
  emergency: { label: 'Emergency', icon: 'warning', color: '#EF4444' },
  social: { label: 'Social', icon: 'people', color: '#8B5CF6' },
  work: { label: 'Work', icon: 'briefcase', color: '#3B82F6' },
  daily: { label: 'Daily Life', icon: 'home', color: '#10B981' },
};
