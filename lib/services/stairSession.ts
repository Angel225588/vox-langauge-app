/**
 * Stair Session Service
 *
 * Business logic for loading and orchestrating a stair session.
 * Implements the HYBRID vocabulary strategy:
 *
 * 1. DB-first: Pull from stair content (already stored from path generation)
 * 2. Vox Library: Query for additional scenario-relevant words
 * 3. AI fills gaps: Generate scenario-specific vocabulary not in DB
 * 4. No CEFR gatekeeping: Words serve the scenario, not a rigid level
 *
 * This is the Vocab-to-Conversation Loop:
 * Vocabulary Preview → AI Conversation → Post-analysis → FSRS update
 *
 * @module lib/services/stairSession
 */

import { getStairContent, getStaircaseParams } from '@/lib/db/learningPaths';
import type {
  StairSessionContent,
  SessionVocabItem,
  SessionScenario,
  SessionReadingContent,
  SessionWritingContent,
  SessionListeningContent,
  ListeningLine,
  ListeningQuestion,
  ContentSources,
  FsrsUpdate,
  SessionSummary,
  SessionStepResults,
  KeyPhrase,
} from '@/types/stairSession';
import type { VocabItem, Scenario } from '@/types/learning';

// ============================================================================
// CONTENT LOADING — Hybrid Strategy
// ============================================================================

/**
 * Load complete session content for a stair.
 *
 * Strategy:
 * 1. Load stair's stored content (vocabulary, scenarios) from DB
 * 2. Build scenario with AI persona
 * 3. Transform vocabulary with source tracking
 * 4. Generate reading + writing content via AI (on-demand)
 *
 * @param stepId - The stair step's UUID
 * @param userId - The user's UUID
 * @returns Complete session content ready for the flow
 */
export async function loadSessionContent(
  stepId: string,
  userId: string
): Promise<StairSessionContent> {
  console.log('[StairSession] Loading session content for step:', stepId);

  try {
    // 1. Get stair's stored content
    const stairContent = await getStairContent(stepId);
    if (!stairContent) {
      console.warn('[StairSession] No stair content found, using fallback');
      return buildFallbackSessionContent(stepId);
    }

    // 2. Get staircase params for AI context
    const params = await getStaircaseParams(userId);
    if (!params) {
      console.warn('[StairSession] No staircase params found, using fallback');
      return buildFallbackSessionContent(stepId);
    }

    // 3. Build scenario from stair content
    const rawScenarios = stairContent.scenarios as Scenario[];
    const primaryScenario = rawScenarios[0] || buildFallbackScenario(params);
    const scenario = buildSessionScenario(primaryScenario, params);

    // 4. Transform vocabulary with source tracking
    const stairVocab = (stairContent.vocabulary as VocabItem[]) || [];
    const sessionVocab = transformToSessionVocab(stairVocab, 'stair_content');

    // 5. Generate reading and writing content from scenario + vocabulary
    const reading = await generateReadingContent(scenario, sessionVocab, params);
    const writing = generateWritingContent(scenario, sessionVocab);

    // 6. Generate listening content — scenario story/dialogue
    const listening = generateListeningContentForSession(scenario, sessionVocab, params);

    // 7. Build source tracking
    const sources: ContentSources = {
      vocab_from_library: 0,
      vocab_from_stair: sessionVocab.filter(v => v.source === 'stair_content').length,
      vocab_ai_generated: sessionVocab.filter(v => v.source === 'ai_generated').length,
      reading_source: 'ai_generated',
      writing_source: 'ai_generated',
    };

    console.log('[StairSession] Content loaded:', {
      scenario: scenario.title,
      vocab: sessionVocab.length,
      listening: listening.type,
      sources,
    });

    return {
      scenario,
      vocabulary: sessionVocab,
      listening,
      reading,
      writing,
      sources,
    };
  } catch (error) {
    console.warn('[StairSession] Network/DB error, using fallback content:', error);
    return buildFallbackSessionContent(stepId);
  }
}

// ============================================================================
// FALLBACK CONTENT — Works offline / when Supabase is unreachable
// ============================================================================

/**
 * Build complete session content from templates when DB is unavailable.
 * This ensures the user can always test/use the session flow.
 */
function buildFallbackSessionContent(stepId: string): StairSessionContent {
  console.log('[StairSession] Building fallback content for step:', stepId);

  const scenario: SessionScenario = {
    title: 'Professional Introduction',
    description: 'Introduce yourself confidently in a professional setting. Make a strong first impression.',
    context: 'You are at a business networking event. You need to introduce yourself to potential clients and partners. Be confident, clear, and memorable.',
    objectives: [
      'Introduce yourself clearly',
      'Describe what you do in simple terms',
      'Ask relevant questions to show interest',
      'Exchange contact information professionally',
    ],
    key_phrases: [
      { phrase: 'Nice to meet you', translation: '', when_to_use: 'First greeting' },
      { phrase: 'I work in...', translation: '', when_to_use: 'Describing your role' },
      { phrase: 'What brings you here?', translation: '', when_to_use: 'Showing interest' },
      { phrase: 'Let me give you my card', translation: '', when_to_use: 'Closing the conversation' },
    ],
    ai_persona: {
      role: 'A marketing director at a tech company',
      personality: 'Friendly, curious, and professional',
      speaking_style: 'Speaks clearly at a moderate pace, asks follow-up questions',
    },
  };

  const vocabulary: SessionVocabItem[] = [
    { word: 'Nice to meet you', translation: 'Encantado/a de conocerte', pronunciation: '/naɪs tuː miːt juː/', example_sentence: 'Nice to meet you, I\'m Sarah.', example_translation: '', part_of_speech: 'phrase', source: 'stair_content', in_personal_vocab: false, added_during_session: false, difficulty: 'easy' },
    { word: 'I work in', translation: 'Trabajo en', pronunciation: '/aɪ wɜːrk ɪn/', example_sentence: 'I work in software development.', example_translation: '', part_of_speech: 'phrase', source: 'stair_content', in_personal_vocab: false, added_during_session: false, difficulty: 'easy' },
    { word: 'What do you do?', translation: '¿A qué te dedicas?', pronunciation: '/wɒt duː juː duː/', example_sentence: 'So, what do you do for a living?', example_translation: '', part_of_speech: 'phrase', source: 'stair_content', in_personal_vocab: false, added_during_session: false, difficulty: 'easy' },
    { word: 'I\'m responsible for', translation: 'Soy responsable de', pronunciation: '/aɪm rɪˈspɒnsɪbl fɔːr/', example_sentence: 'I\'m responsible for the marketing team.', example_translation: '', part_of_speech: 'phrase', source: 'stair_content', in_personal_vocab: false, added_during_session: false, difficulty: 'medium' },
    { word: 'What brings you here?', translation: '¿Qué te trae por aquí?', pronunciation: '/wɒt brɪŋz juː hɪər/', example_sentence: 'What brings you to this event?', example_translation: '', part_of_speech: 'phrase', source: 'stair_content', in_personal_vocab: false, added_during_session: false, difficulty: 'medium' },
    { word: 'Let\'s keep in touch', translation: 'Mantengamos el contacto', pronunciation: '/lɛts kiːp ɪn tʌtʃ/', example_sentence: 'It was great talking to you. Let\'s keep in touch!', example_translation: '', part_of_speech: 'phrase', source: 'stair_content', in_personal_vocab: false, added_during_session: false, difficulty: 'medium' },
  ];

  const listening: SessionListeningContent = {
    title: 'Story: The Elevator Pitch',
    description: 'A professional shares how a simple introduction at a networking event led to their biggest client. Listen and learn the techniques.',
    type: 'story',
    lines: [
      { speaker: 'narrator', speaker_name: 'Narrator', text: 'Let me tell you about Maria, who turned a 30-second introduction into a million-dollar partnership.', translation: '' },
      { speaker: 'narrator', speaker_name: 'Narrator', text: 'She walked into a networking event knowing exactly three phrases: "Nice to meet you", "I work in digital strategy", and "What brings you here?"', translation: '' },
      { speaker: 'narrator', speaker_name: 'Narrator', text: 'That was it. Three phrases. But she said them with confidence, with genuine curiosity, and with a smile.', translation: '' },
      { speaker: 'narrator', speaker_name: 'Narrator', text: 'The person she spoke to was the CEO of a Fortune 500 company. He later said: "Most people talk about themselves. Maria asked about me."', translation: '' },
      { speaker: 'narrator', speaker_name: 'Narrator', text: 'The lesson? You don\'t need a hundred phrases. You need the right ones, delivered with intention. Start with three. Master them. Then add more.', translation: '' },
    ],
    questions: [
      { question: 'How many key phrases did Maria use?', options: ['Three', 'Ten', 'Twenty', 'One'], correct_index: 0 },
      { question: 'Why did the CEO remember Maria?', options: ['She talked a lot', 'She asked about him', 'She had a fancy business card', 'She spoke very fast'], correct_index: 1 },
    ],
    vocabulary_spotlight: ['Nice to meet you', 'I work in', 'What brings you here?'],
    daily_tip: 'Practice saying "Nice to meet you" out loud right now. Say it 3 times. Tomorrow, use it with someone — even in your native language. Build the habit first.',
  };

  const reading: SessionReadingContent = {
    title: 'Reading: First Impressions Matter',
    passage: 'In professional settings, the first 30 seconds of a conversation often determine the entire relationship. Research shows that people form lasting impressions within moments of meeting someone new.\n\nThe most effective professionals follow a simple pattern: greet warmly, introduce yourself clearly, show genuine interest in the other person, and close with a clear next step.\n\n"Nice to meet you" is more than a phrase — it\'s a signal that you\'re approachable and professional. "What do you do?" shows curiosity. "Let\'s keep in touch" converts a conversation into a relationship.',
    questions: [
      { question: 'How quickly do people form lasting impressions?', options: ['Within moments', 'After an hour', 'After several meetings', 'Never'], correct_index: 0 },
      { question: 'What does "Let\'s keep in touch" do?', options: ['Ends the conversation rudely', 'Converts a conversation into a relationship', 'Shows you\'re bored', 'Is considered informal'], correct_index: 1 },
    ],
    tappable_words: [
      { word: 'professional', translation: 'profesional', position_in_text: 0 },
      { word: 'impression', translation: 'impresión', position_in_text: 1 },
      { word: 'approachable', translation: 'accesible', position_in_text: 2 },
      { word: 'curiosity', translation: 'curiosidad', position_in_text: 3 },
    ],
  };

  const writing: SessionWritingContent = {
    instruction: 'Write a short self-introduction you would use at a networking event. Include: who you are, what you do, and one interesting thing about your work. Keep it natural — this is a conversation, not a speech.',
    target_length: 40,
    key_vocabulary: ['Nice to meet you', 'I work in', 'I\'m responsible for', 'What brings you here?'],
    scenario_context: scenario.context,
  };

  return {
    scenario,
    vocabulary,
    listening,
    reading,
    writing,
    sources: {
      vocab_from_library: 0,
      vocab_from_stair: 6,
      vocab_ai_generated: 0,
      reading_source: 'ai_generated',
      writing_source: 'ai_generated',
    },
  };
}

// ============================================================================
// SCENARIO BUILDING
// ============================================================================

/**
 * Build a session scenario from raw scenario data and user params.
 */
function buildSessionScenario(
  raw: Scenario,
  params: { target_language: string; motivation: string; proficiency_level: string }
): SessionScenario {
  // Build key phrases with translations
  const keyPhrases: KeyPhrase[] = (raw.key_phrases || []).map((phrase) => {
    if (typeof phrase === 'string') {
      return {
        phrase,
        translation: '', // Will be filled by AI during session
        when_to_use: raw.context || '',
      };
    }
    // Already structured
    return phrase as unknown as KeyPhrase;
  });

  return {
    title: raw.title,
    description: raw.description,
    context: raw.context || raw.description,
    objectives: [
      `Practice ${raw.title.toLowerCase()} vocabulary`,
      'Use key phrases in context',
      'Build conversational confidence',
    ],
    key_phrases: keyPhrases,
    ai_persona: {
      role: getPersonaRole(raw, params.motivation),
      personality: 'Patient, encouraging, and naturally conversational',
      speaking_style: getSpeakingStyle(params.proficiency_level),
    },
  };
}

/**
 * Build a fallback scenario when none exists in the stair content.
 */
function buildFallbackScenario(params: {
  target_language: string;
  motivation: string;
}): Scenario {
  const motivationScenarios: Record<string, Scenario> = {
    career: {
      title: 'Professional Introduction',
      description: 'Introduce yourself in a professional setting',
      context: 'You are at a business networking event and need to introduce yourself to potential clients.',
      key_phrases: ['Nice to meet you', 'I work at...', 'What do you do?', 'Let me tell you about...'],
    },
    travel: {
      title: 'Navigating a New City',
      description: 'Ask for directions and navigate local transportation',
      context: 'You just arrived in a new city and need to find your way to your accommodation.',
      key_phrases: ['Where is...?', 'How do I get to...?', 'Is it far?', 'Thank you for your help'],
    },
    love: {
      title: 'Making a Connection',
      description: 'Have a meaningful first conversation',
      context: 'You are at a social gathering and want to get to know someone interesting.',
      key_phrases: ['Tell me about yourself', 'What do you enjoy?', 'That sounds interesting', 'I feel the same way'],
    },
  };

  return motivationScenarios[params.motivation] || {
    title: 'Everyday Conversation',
    description: 'Practice everyday conversation skills',
    context: 'You are having a casual conversation with a native speaker about daily life.',
    key_phrases: ['How are you?', 'What do you think about...?', 'I would like...', 'Can you help me?'],
  };
}

function getPersonaRole(scenario: Scenario, motivation: string): string {
  const title = scenario.title.toLowerCase();
  if (title.includes('office') || title.includes('meeting') || title.includes('business'))
    return 'A friendly colleague at a multinational company';
  if (title.includes('restaurant') || title.includes('food'))
    return 'A welcoming local restaurant owner';
  if (title.includes('travel') || title.includes('navigat'))
    return 'A helpful local resident';
  if (title.includes('doctor') || title.includes('medical'))
    return 'A patient and clear-speaking doctor';

  const roleMap: Record<string, string> = {
    career: 'A professional contact at a networking event',
    travel: 'A friendly local guide',
    love: 'Someone you just met at a social gathering',
    education: 'A classmate at university',
  };
  return roleMap[motivation] || 'A friendly native speaker';
}

function getSpeakingStyle(level: string): string {
  const styles: Record<string, string> = {
    A1: 'Speaks slowly and clearly, uses simple vocabulary, repeats key phrases',
    beginner: 'Speaks slowly and clearly, uses simple vocabulary, repeats key phrases',
    A2: 'Speaks at a moderate pace, uses common expressions, offers gentle corrections',
    elementary: 'Speaks at a moderate pace, uses common expressions, offers gentle corrections',
    B1: 'Speaks naturally but clearly, introduces some idiomatic expressions',
    intermediate: 'Speaks naturally but clearly, introduces some idiomatic expressions',
    B2: 'Speaks at natural pace, uses varied vocabulary and complex structures',
    upper_intermediate: 'Speaks at natural pace, uses varied vocabulary and complex structures',
    C1: 'Speaks fluently with nuance, uses advanced vocabulary and cultural references',
    advanced: 'Speaks fluently with nuance, uses advanced vocabulary and cultural references',
  };
  return styles[level] || styles['B1'];
}

// ============================================================================
// VOCABULARY TRANSFORMATION — Hybrid Sources
// ============================================================================

/**
 * Transform raw VocabItems into SessionVocabItems with source tracking.
 * This is where the "no CEFR gatekeeping" philosophy lives:
 * words are tagged with their origin but never filtered out by level.
 */
function transformToSessionVocab(
  items: VocabItem[],
  source: 'vox_library' | 'stair_content' | 'ai_generated'
): SessionVocabItem[] {
  return items.map((item) => ({
    ...item,
    source,
    in_personal_vocab: false, // Will be checked against user's word bank
    added_during_session: false,
    original_cefr: item.difficulty === 'easy' ? 'A1' : item.difficulty === 'medium' ? 'B1' : 'B2',
  }));
}

// ============================================================================
// READING CONTENT GENERATION
// ============================================================================

/**
 * Generate a reading passage using the scenario vocabulary.
 *
 * For now, builds a template-based passage. In production, this will
 * call Gemini to generate a contextual passage using the scenario's vocabulary.
 */
async function generateReadingContent(
  scenario: SessionScenario,
  vocabulary: SessionVocabItem[],
  params: { target_language: string; native_language: string; proficiency_level: string }
): Promise<SessionReadingContent> {
  // Extract key vocabulary words for the passage
  const vocabWords = vocabulary.slice(0, 8).map((v) => v.word);

  // TODO: Replace with Gemini API call for AI-generated passage
  // For now, build a structured reading passage
  const passage = buildReadingPassage(scenario, vocabWords, params.target_language);
  const questions = buildComprehensionQuestions(scenario, vocabWords, params.native_language);
  const tappableWords = vocabulary.slice(0, 12).map((v, i) => ({
    word: v.word,
    translation: v.translation,
    pronunciation: v.pronunciation,
    position_in_text: i, // Placeholder — real positions computed from passage
  }));

  return {
    title: `Reading: ${scenario.title}`,
    passage,
    questions,
    tappable_words: tappableWords,
  };
}

function buildReadingPassage(
  scenario: SessionScenario,
  vocabWords: string[],
  targetLanguage: string
): string {
  // Template passage that incorporates scenario context
  // This will be replaced by AI generation
  if (targetLanguage === 'es') {
    return [
      scenario.context,
      '',
      `En esta situación, es importante conocer algunas frases clave.`,
      `Por ejemplo, puedes usar "${vocabWords[0] || 'hola'}" para empezar la conversación.`,
      `También es útil saber decir "${vocabWords[1] || 'gracias'}" y "${vocabWords[2] || 'por favor'}".`,
      '',
      `Cuando necesites más información, puedes preguntar usando "${vocabWords[3] || 'dónde'}".`,
      `Recuerda que la práctica constante te ayudará a mejorar tu comunicación.`,
    ].join('\n');
  }

  if (targetLanguage === 'fr') {
    return [
      scenario.context,
      '',
      `Dans cette situation, il est important de connaître quelques phrases clés.`,
      `Par exemple, vous pouvez utiliser "${vocabWords[0] || 'bonjour'}" pour commencer la conversation.`,
      `Il est aussi utile de savoir dire "${vocabWords[1] || 'merci'}" et "${vocabWords[2] || 's\'il vous plaît'}".`,
      '',
      `Quand vous avez besoin de plus d'informations, vous pouvez demander en utilisant "${vocabWords[3] || 'où'}".`,
      `N'oubliez pas que la pratique constante vous aidera à améliorer votre communication.`,
    ].join('\n');
  }

  // Default English passage
  return [
    scenario.context,
    '',
    `In this situation, it's important to know some key phrases.`,
    `For example, you can use "${vocabWords[0] || 'hello'}" to start the conversation.`,
    `It's also useful to know how to say "${vocabWords[1] || 'thank you'}" and "${vocabWords[2] || 'please'}".`,
    '',
    `When you need more information, you can ask using "${vocabWords[3] || 'where'}".`,
    `Remember that consistent practice will help you improve your communication.`,
  ].join('\n');
}

function buildComprehensionQuestions(
  scenario: SessionScenario,
  vocabWords: string[],
  nativeLanguage: string
): Array<{ question: string; options: string[]; correct_index: number }> {
  // Generate 3 comprehension questions based on the scenario
  return [
    {
      question: `What is the main situation described in this passage?`,
      options: [
        scenario.description,
        'A formal business presentation',
        'A medical emergency',
        'A classroom lecture',
      ],
      correct_index: 0,
    },
    {
      question: `Which phrase would you use to start this conversation?`,
      options: [
        vocabWords[2] || 'please',
        vocabWords[0] || 'hello',
        vocabWords[3] || 'where',
        'None of the above',
      ],
      correct_index: 1,
    },
    {
      question: `What does the passage recommend for improvement?`,
      options: [
        'Reading more books',
        'Watching movies',
        'Consistent practice',
        'Traveling abroad',
      ],
      correct_index: 2,
    },
  ];
}

// ============================================================================
// LISTENING CONTENT GENERATION
// ============================================================================

/**
 * Generate scenario-relevant listening content.
 *
 * Creates a compelling story or dialogue that:
 * - Uses vocabulary the user just reviewed
 * - Shows a real-world success scenario (motivation)
 * - Gives daily-life tips for using the language
 *
 * Template-based for now. Will be replaced by Gemini AI generation.
 */
function generateListeningContentForSession(
  scenario: SessionScenario,
  vocabulary: SessionVocabItem[],
  params: { target_language: string; native_language: string; proficiency_level: string }
): SessionListeningContent {
  const vocabWords = vocabulary.slice(0, 6).map(v => v.word);
  const isDialogue = scenario.ai_persona.role.includes('colleague') ||
    scenario.ai_persona.role.includes('contact') ||
    scenario.title.toLowerCase().includes('meeting') ||
    scenario.title.toLowerCase().includes('interview');

  if (isDialogue) {
    return buildDialogueListening(scenario, vocabWords, params);
  }
  return buildStoryListening(scenario, vocabWords, params);
}

/**
 * Build a storytelling-style listening (single narrator).
 * The "sell the pen" model — a compelling success story.
 */
function buildStoryListening(
  scenario: SessionScenario,
  vocabWords: string[],
  params: { target_language: string; native_language: string; proficiency_level: string }
): SessionListeningContent {
  // Template stories — will be replaced by Gemini
  const storyLines: ListeningLine[] = [
    {
      speaker: 'narrator',
      speaker_name: 'Narrator',
      text: `Let me tell you a story about someone who mastered exactly this situation.`,
      translation: '',
    },
    {
      speaker: 'narrator',
      speaker_name: 'Narrator',
      text: scenario.context,
      translation: '',
    },
    {
      speaker: 'narrator',
      speaker_name: 'Narrator',
      text: `The key was knowing the right phrases. Words like "${vocabWords[0] || 'hello'}" and "${vocabWords[1] || 'thank you'}" made all the difference.`,
      translation: '',
    },
    {
      speaker: 'narrator',
      speaker_name: 'Narrator',
      text: `When they used "${vocabWords[2] || 'please'}" at the right moment, everything changed. The conversation became natural.`,
      translation: '',
    },
    {
      speaker: 'narrator',
      speaker_name: 'Narrator',
      text: `The secret? Practice these phrases in your daily routine. When you wake up, when you eat, when you commute. Make the language part of your life.`,
      translation: '',
    },
  ];

  const questions: ListeningQuestion[] = [
    {
      question: 'What was the key to success in this story?',
      options: [
        'Knowing the right phrases for the situation',
        'Speaking as fast as possible',
        'Memorizing the dictionary',
        'Avoiding conversation',
      ],
      correct_index: 0,
    },
    {
      question: 'When should you practice these phrases?',
      options: [
        'Only during lessons',
        'In your daily routine — waking up, eating, commuting',
        'Once a week',
        'Only before important meetings',
      ],
      correct_index: 1,
    },
  ];

  return {
    title: `Story: ${scenario.title}`,
    description: `A real-world success story about ${scenario.title.toLowerCase()}. Listen and learn how others mastered this situation.`,
    type: 'story',
    lines: storyLines,
    questions,
    vocabulary_spotlight: vocabWords.slice(0, 4),
    daily_tip: `Try using "${vocabWords[0] || 'the key phrase'}" in a real situation today. Even thinking the phrase in your head counts as practice.`,
  };
}

/**
 * Build a dialogue-style listening (two speakers).
 * Shows a realistic conversation for the scenario.
 */
function buildDialogueListening(
  scenario: SessionScenario,
  vocabWords: string[],
  params: { target_language: string; native_language: string; proficiency_level: string }
): SessionListeningContent {
  const speakerA = scenario.ai_persona.role.split(' ').pop() || 'Alex';
  const speakerB = 'You (example)';

  const dialogueLines: ListeningLine[] = [
    {
      speaker: 'A',
      speaker_name: speakerA,
      text: `${vocabWords[0] || 'Hello'}! I've been looking forward to this.`,
      translation: '',
    },
    {
      speaker: 'B',
      speaker_name: speakerB,
      text: `${vocabWords[1] || 'Thank you'}. I've prepared some thoughts about ${scenario.title.toLowerCase()}.`,
      translation: '',
    },
    {
      speaker: 'A',
      speaker_name: speakerA,
      text: `Great. What's your approach? I'm curious to hear your perspective.`,
      translation: '',
    },
    {
      speaker: 'B',
      speaker_name: speakerB,
      text: `Well, I think the most important thing is ${vocabWords[2] || 'being clear'}. And knowing when to use "${vocabWords[3] || 'the right phrase'}".`,
      translation: '',
    },
    {
      speaker: 'A',
      speaker_name: speakerA,
      text: `That's exactly right. Most people overcomplicate it. Keep it simple and direct.`,
      translation: '',
    },
    {
      speaker: 'B',
      speaker_name: speakerB,
      text: `${vocabWords[4] || 'I agree'}. Simple and confident wins every time.`,
      translation: '',
    },
  ];

  const questions: ListeningQuestion[] = [
    {
      question: 'What approach did the speakers recommend?',
      options: [
        'Simple and direct communication',
        'Using complex vocabulary',
        'Avoiding difficult topics',
        'Speaking very formally',
      ],
      correct_index: 0,
    },
    {
      question: 'What quality helps most in this situation?',
      options: [
        'Speed',
        'Confidence and clarity',
        'Memorizing scripts',
        'Avoiding eye contact',
      ],
      correct_index: 1,
    },
  ];

  return {
    title: `Dialogue: ${scenario.title}`,
    description: `Listen to how two people handle ${scenario.title.toLowerCase()}. Notice the phrases and tone they use.`,
    type: 'dialogue',
    lines: dialogueLines,
    questions,
    vocabulary_spotlight: vocabWords.slice(0, 4),
    daily_tip: `Next time you're in a similar situation, start with "${vocabWords[0] || 'the greeting'}". First impressions set the tone.`,
  };
}

// ============================================================================
// WRITING CONTENT GENERATION
// ============================================================================

/**
 * Generate a writing task based on the scenario.
 */
function generateWritingContent(
  scenario: SessionScenario,
  vocabulary: SessionVocabItem[]
): SessionWritingContent {
  const keyVocab = vocabulary.slice(0, 6).map((v) => v.word);

  return {
    instruction: `Write a short message or response related to the scenario: "${scenario.title}". Use at least 3 of the vocabulary words you practiced. Imagine you are actually in this situation and need to communicate your intentions clearly.`,
    starter: undefined,
    target_length: 50, // ~50 words for beginners, scales with level
    key_vocabulary: keyVocab,
    scenario_context: scenario.context,
  };
}

// ============================================================================
// SESSION COMPLETION — FSRS Integration
// ============================================================================

/**
 * Calculate session summary and FSRS updates from step results.
 *
 * The Vocab-to-Conversation Loop:
 * - Words reviewed and known → FSRS "good"
 * - Words reviewed but struggled → FSRS "again"
 * - Words used correctly in conversation → FSRS "easy"
 * - Words missed in conversation → FSRS "hard"
 * - Words tapped in reading → FSRS "hard" (needs more exposure)
 * - Words used in writing → FSRS "good"
 */
export function calculateSessionSummary(
  results: SessionStepResults,
  vocabulary: SessionVocabItem[],
  wordsAdded: string[],
  startedAt: number
): SessionSummary {
  const totalTime = Math.floor((Date.now() - startedAt) / 1000);

  // Calculate per-step scores
  const vocabScore = results.vocabulary
    ? Math.round((results.vocabulary.words_known / Math.max(results.vocabulary.words_reviewed, 1)) * 100)
    : 0;

  const listeningScore = results.listening?.comprehension_score ?? 0;

  const conversationScore = results.conversation?.fluency_score ?? 0;

  const readingScore = results.reading?.comprehension_score ?? 0;

  const writingScore = results.writing
    ? Math.round((results.writing.key_vocab_used / Math.max(results.writing.key_vocab_total, 1)) * 100)
    : 0;

  // Overall score: weighted average (conversation is king)
  const overall = Math.round(
    vocabScore * 0.10 +
    listeningScore * 0.15 +
    conversationScore * 0.35 +
    readingScore * 0.20 +
    writingScore * 0.20
  );

  // Build FSRS updates from conversation data
  const fsrsUpdates: FsrsUpdate[] = [];

  // Vocabulary review results
  if (results.vocabulary) {
    // Words they knew go to "good"
    vocabulary.slice(0, results.vocabulary.words_known).forEach((v) => {
      fsrsUpdates.push({ word: v.word, quality: 'good', source: 'vocabulary_review' });
    });
    // Words they struggled with go to "again"
    vocabulary.slice(results.vocabulary.words_known, results.vocabulary.words_reviewed).forEach((v) => {
      fsrsUpdates.push({ word: v.word, quality: 'again', source: 'vocabulary_review' });
    });
  }

  // Conversation results
  if (results.conversation) {
    results.conversation.words_used_correctly.forEach((word) => {
      fsrsUpdates.push({ word, quality: 'easy', source: 'conversation_used' });
    });
    results.conversation.new_words_encountered.forEach((word) => {
      fsrsUpdates.push({ word, quality: 'hard', source: 'conversation_missed' });
    });
  }

  // Reading tapped words
  if (results.reading && results.reading.words_tapped > 0) {
    // Words they tapped need more practice
    vocabulary.slice(0, results.reading.words_tapped).forEach((v) => {
      if (!fsrsUpdates.some((u) => u.word === v.word)) {
        fsrsUpdates.push({ word: v.word, quality: 'hard', source: 'reading_tapped' });
      }
    });
  }

  return {
    overall_score: overall,
    total_time_seconds: totalTime,
    vocab_reviewed: results.vocabulary?.words_reviewed ?? 0,
    vocab_added: wordsAdded.length,
    listening_score: listeningScore,
    conversation_score: conversationScore,
    reading_score: readingScore,
    writing_score: writingScore,
    steps: results,
    fsrs_updates: fsrsUpdates,
  };
}
