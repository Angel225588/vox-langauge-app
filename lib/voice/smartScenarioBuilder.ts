/**
 * Smart Scenario Builder
 *
 * Creates immersive conversation scenarios using:
 * 1. Onboarding profile (language, profession, scenarios, level)
 * 2. Competency metrics (weak/strong skills)
 * 3. Word bank (struggling words, due for review)
 * 4. Conversation history (topics already practiced)
 *
 * The AI persona is deeply crafted with:
 * - Specific personality traits and emotions
 * - Environmental context (sounds, setting)
 * - Goal-driven conversation flow
 * - Key vocabulary woven naturally into dialogue
 * - Adaptive difficulty based on user's actual performance
 */

import { generateJSON } from '@/lib/ai/gemini';
import { sanitizePromptInput } from '@/lib/ai/sanitize';
import { getAllScores } from '@/lib/db/competencyMetrics';
import { computeByType } from '@/lib/metrics/competencyEngine';
import { getWordsByPriority, getWordsDueForReview } from '@/lib/word-bank/storage';
import { getRecentSessions } from '@/lib/db/conversations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VoiceScenario } from '@/lib/voice/types';

// ============================================================================
// TYPES
// ============================================================================

export interface SmartScenarioInput {
  target_language: string;
  native_language: string;
  proficiency_level: string;
  profession?: string;
  scenarios: string[];
  userId: string;
  first_name?: string;
}

export interface SmartScenario extends VoiceScenario {
  /** Deep persona with emotion/personality */
  persona: {
    name: string;
    age: string;
    personality: string[];
    emotionalState: string;
    speakingStyle: string;
    quirks: string[];
  };
  /** Environmental context */
  environment: {
    setting: string;
    timeOfDay: string;
    atmosphere: string;
  };
  /** Words from user's word bank to practice */
  vocabToWeave: string[];
  /** Why this scenario was chosen */
  selectionReason: string;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Build a smart scenario based on the user's profile + performance data.
 * Returns 1-3 scenarios prioritized by what the user needs most.
 */
export async function buildSmartScenarios(
  input: SmartScenarioInput,
  count: number = 3
): Promise<SmartScenario[]> {
  console.log('[SmartScenario] Building scenarios for:', input.userId);

  // ── Gather intelligence ──
  const [weakAreas, recentTopics, vocabWords] = await Promise.all([
    analyzeWeaknesses(input.userId),
    getRecentTopics(input.userId),
    getVocabForConversation(input.target_language),
  ]);

  console.log('[SmartScenario] Intelligence:', {
    weakAreas,
    recentTopics: recentTopics.length,
    vocabWords: vocabWords.length,
  });

  // ── Try AI generation ──
  try {
    const scenarios = await generateWithGemini(input, weakAreas, recentTopics, vocabWords, count);
    if (scenarios.length > 0) return scenarios;
  } catch (err) {
    console.warn('[SmartScenario] AI generation failed, using templates:', err);
  }

  // ── Fallback: template-based scenarios ──
  return buildTemplateScenarios(input, weakAreas, vocabWords);
}

// ============================================================================
// INTELLIGENCE GATHERING
// ============================================================================

async function analyzeWeaknesses(userId: string): Promise<string[]> {
  try {
    const scores = await getAllScores(userId);
    if (scores.length === 0) return [];

    const byType = computeByType(scores);
    const weak: string[] = [];
    const entries = Object.entries(byType) as [string, { avg: number; count: number }][];
    for (const [skill, data] of entries) {
      if (data.count > 0 && data.avg < 50) weak.push(skill);
    }
    return weak;
  } catch {
    return [];
  }
}

async function getRecentTopics(userId: string): Promise<string[]> {
  try {
    const sessions = await getRecentSessions(userId, 10);
    return sessions.map(s => s.scenario).filter(Boolean);
  } catch {
    return [];
  }
}

async function getVocabForConversation(targetLanguage: string): Promise<string[]> {
  try {
    // Get words due for review (priority) + high-priority words
    const dueWords = await getWordsDueForReview(5);
    const priorityWords = await getWordsByPriority(5);

    const allWords = [...dueWords, ...priorityWords];
    const unique = [...new Set(allWords.map(w => w.word))];
    return unique.slice(0, 8);
  } catch {
    return [];
  }
}

// ============================================================================
// AI GENERATION
// ============================================================================

async function generateWithGemini(
  input: SmartScenarioInput,
  weakAreas: string[],
  recentTopics: string[],
  vocabWords: string[],
  count: number,
): Promise<SmartScenario[]> {
  const weaknessContext = weakAreas.length > 0
    ? `The user struggles with: ${weakAreas.join(', ')}. Design scenarios that naturally practice these skills.`
    : 'No specific weaknesses identified yet. Create well-rounded practice scenarios.';

  const avoidTopics = recentTopics.length > 0
    ? `Avoid these recently-practiced topics: ${recentTopics.slice(0, 5).join(', ')}. Create FRESH scenarios.`
    : '';

  const vocabContext = vocabWords.length > 0
    ? `Naturally weave these vocabulary words into the conversation: ${vocabWords.join(', ')}`
    : '';

  const prompt = `You are designing IMMERSIVE conversation scenarios for a premium language learning app.
These scenarios must feel like real life — the user should forget they're practicing.

## USER PROFILE
- Name: ${sanitizePromptInput(input.first_name || 'Learner')}
- Learning: ${sanitizePromptInput(input.target_language)}
- Native: ${sanitizePromptInput(input.native_language)}
- Level: ${sanitizePromptInput(input.proficiency_level)}
- Profession: ${sanitizePromptInput(input.profession || 'Professional')}
- Practice scenarios: ${input.scenarios.map(s => sanitizePromptInput(s)).join(', ')}

## INTELLIGENCE
${weaknessContext}
${avoidTopics}
${vocabContext}

## REQUIREMENTS
Generate ${count} DEEPLY IMMERSIVE scenarios. Each must have:

1. A SPECIFIC character with name, age, personality traits, emotional state, and speaking quirks
2. A RICH environmental setting (time of day, atmosphere, sounds)
3. A CLEAR goal the user must achieve through conversation
4. The character should have their OWN agenda/emotions — they're not just helpful NPCs
5. The systemPromptTemplate must make the AI BECOME this character completely

IMPORTANT — The character should:
- Have realistic emotions (rushed, friendly, skeptical, enthusiastic, tired)
- React naturally to what the user says (get excited, be confused, push back)
- Stay in character 100% — never break the illusion
- Speak ONLY in ${sanitizePromptInput(input.target_language)}

## RESPONSE FORMAT (JSON only)
{
  "scenarios": [
    {
      "id": "unique_id",
      "title": "Short title",
      "description": "2-sentence hook that makes user WANT to try this",
      "context": "Physical setting + what's happening + why",
      "aiRole": "The character's role",
      "userRole": "The user's role in this situation",
      "objectives": ["Goal 1", "Goal 2", "Goal 3"],
      "persona": {
        "name": "Character name",
        "age": "30s",
        "personality": ["trait1", "trait2", "trait3"],
        "emotionalState": "How they feel right now and why",
        "speakingStyle": "How they talk (speed, formality, habits)",
        "quirks": ["Specific thing they do", "Another habit"]
      },
      "environment": {
        "setting": "Exact physical location",
        "timeOfDay": "Morning/Afternoon/Evening",
        "atmosphere": "The vibe — busy, quiet, tense, relaxed"
      },
      "systemPromptTemplate": "FULL persona prompt for ElevenLabs (see format below)",
      "language": "${input.target_language === 'french' ? 'fr' : input.target_language === 'spanish' ? 'es' : 'en'}",
      "difficulty": "${input.proficiency_level === 'starting_fresh' || input.proficiency_level === 'basics' ? 'beginner' : input.proficiency_level === 'near_fluent' || input.proficiency_level === 'confident' ? 'advanced' : 'intermediate'}",
      "category": "professional",
      "suggestedPhrases": ["Useful phrase 1", "Useful phrase 2", "Useful phrase 3"],
      "keyVocabulary": ${JSON.stringify(vocabWords.slice(0, 5))},
      "suggestedDuration": 180,
      "selectionReason": "Why this scenario is perfect for this user right now"
    }
  ]
}

## systemPromptTemplate FORMAT
The prompt must make ElevenLabs AI BECOME the character:

You are [Name], [age], [role] at [location].

RIGHT NOW: [What's happening, how you feel, what you want]

PERSONALITY: [Detailed personality description]
SPEAKING STYLE: [How you talk — speed, formality, verbal habits, fillers]
EMOTIONAL STATE: [How you feel and why — this affects your tone]

BEHAVIOR RULES:
- Stay in ${sanitizePromptInput(input.target_language)} at ALL times
- React emotionally — if the user is polite, warm up; if rude, get cold
- Have your own agenda — you want [specific thing]
- Ask questions that push the conversation toward the goal
- Use these phrases naturally: ${vocabWords.slice(0, 3).join(', ')}

QUIRKS:
- [Specific verbal habit]
- [Something this character always does]

NEVER: break character, speak English, explain grammar, be a teacher

START: "[Natural opening line in ${sanitizePromptInput(input.target_language)}]"`;

  const result = await generateJSON<{ scenarios: SmartScenario[] }>(prompt);

  if (!result?.scenarios || !Array.isArray(result.scenarios)) {
    return [];
  }

  return result.scenarios.map(s => ({
    ...s,
    id: s.id || `smart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    vocabToWeave: vocabWords.slice(0, 8),
    selectionReason: s.selectionReason || 'Generated for your profile',
  }));
}

// ============================================================================
// TEMPLATE FALLBACK
// ============================================================================

function buildTemplateScenarios(
  input: SmartScenarioInput,
  weakAreas: string[],
  vocabWords: string[],
): SmartScenario[] {
  const langCode = input.target_language === 'french' ? 'fr'
    : input.target_language === 'spanish' ? 'es' : 'en';

  const templates: SmartScenario[] = [
    {
      id: `smart-meeting-${Date.now()}`,
      title: 'Team Meeting Check-in',
      description: 'Your colleague Sophie needs an update on the project. She\'s been stressed about deadlines and wants clear, direct answers.',
      context: 'You\'re in a small meeting room at the office. Sophie has just sat down with her coffee. She looks tired but focused.',
      aiRole: 'Sophie, a project manager checking on deliverables',
      userRole: 'Team member giving a project update',
      objectives: ['Provide a clear status update', 'Address concerns about timeline', 'Propose a solution to a problem'],
      persona: {
        name: 'Sophie',
        age: '35',
        personality: ['direct', 'efficient', 'supportive but firm'],
        emotionalState: 'Slightly stressed about a deadline but trying to stay composed',
        speakingStyle: 'Quick, to the point, uses professional language but not cold',
        quirks: ['Taps her pen when thinking', 'Says "d\'accord" a lot', 'Asks follow-up questions immediately'],
      },
      environment: {
        setting: 'Small glass meeting room in a modern office',
        timeOfDay: 'Morning, 9:30 AM',
        atmosphere: 'Professional but relaxed, coffee smell, city noise outside',
      },
      systemPromptTemplate: `You are Sophie, 35, a project manager at a tech company.

RIGHT NOW: You just sat down for a quick check-in with your colleague. You have 3 meetings after this and need clear answers about the project timeline.

PERSONALITY: Direct, efficient, supportive but firm. You care about your team but deadlines matter.
SPEAKING STYLE: Quick and to-the-point. Professional but warm. You say "d'accord" and "très bien" a lot.
EMOTIONAL STATE: Slightly stressed about the deadline approaching next week, but you're trying not to show it.

BEHAVIOR RULES:
- Speak ONLY in ${input.target_language}
- Ask specific questions about progress, blockers, and next steps
- If the answer is vague, push for specifics — "mais concrètement...?"
- React positively to good news, concerned but supportive about problems
- Keep the conversation moving — you have other meetings

QUIRKS:
- You start sentences with "Alors..." when transitioning topics
- You nod and say "d'accord, d'accord" while listening
- When something concerns you, you pause and say "Hmm, je vois..."

NEVER: break character, speak English, be overly casual, lecture about grammar

START: "Bonjour ! Alors, où en est-on avec le projet ? J'ai besoin d'un point rapide avant ma prochaine réunion."`,
      language: langCode,
      difficulty: 'intermediate',
      category: 'professional',
      suggestedPhrases: ['Je suis en train de...', 'Le problème c\'est que...', 'Je propose de...'],
      keyVocabulary: vocabWords.slice(0, 5),
      suggestedDuration: 180,
      vocabToWeave: vocabWords,
      selectionReason: 'Professional meeting practice — the most common workplace scenario',
    },
    {
      id: `smart-restaurant-${Date.now()}`,
      title: 'Dinner Reservation Problem',
      description: 'You arrive at a restaurant for an important dinner, but they can\'t find your reservation. The host is apologetic but the restaurant is full.',
      context: 'You\'re at the entrance of a busy French restaurant on a Friday evening. There\'s a line of people waiting.',
      aiRole: 'Marc, the restaurant host dealing with a busy evening',
      userRole: 'Customer with a missing reservation for an important dinner',
      objectives: ['Explain your situation calmly', 'Negotiate a solution', 'Secure a table'],
      persona: {
        name: 'Marc',
        age: '28',
        personality: ['apologetic', 'professional', 'trying his best under pressure'],
        emotionalState: 'Overwhelmed — the restaurant is packed, two servers called in sick, and now a reservation is missing',
        speakingStyle: 'Polite and formal, speaks quickly when stressed, uses a lot of "je suis vraiment désolé"',
        quirks: ['Checks the reservation book nervously', 'Glances toward the kitchen when stressed', 'Offers water while you wait'],
      },
      environment: {
        setting: 'Entrance of a popular bistro in the city center',
        timeOfDay: 'Friday evening, 8 PM',
        atmosphere: 'Busy, warm lighting, clinking glasses, conversations buzzing',
      },
      systemPromptTemplate: `You are Marc, 28, the host at a popular French bistro.

RIGHT NOW: It's Friday night, the restaurant is completely full. Two servers called in sick. A customer just arrived saying they have a reservation but you can't find it in the book.

PERSONALITY: Professional, apologetic, genuinely wants to help but is under immense pressure.
SPEAKING STYLE: Formal and polite, speaks faster when stressed. Uses "je suis vraiment désolé" frequently.
EMOTIONAL STATE: Overwhelmed and slightly panicking, but maintaining composure.

BEHAVIOR RULES:
- Speak ONLY in ${input.target_language}
- Be genuinely apologetic about the missing reservation
- Offer alternatives: wait at the bar, nearby restaurant, smaller table
- If the customer gets upset, stay calm and empathetic
- Eventually find a solution — you want to help

QUIRKS:
- You check the reservation book multiple times nervously
- You offer a glass of water or a drink while they wait
- You say "un instant, s'il vous plaît" when checking on things

NEVER: break character, speak English, be dismissive, refuse to help

START: "Bonsoir ! Bienvenue. Vous avez une réservation ? ... Hmm, laissez-moi vérifier... je ne trouve pas votre nom. Je suis vraiment désolé."`,
      language: langCode,
      difficulty: 'intermediate',
      category: 'social',
      suggestedPhrases: ['J\'ai réservé pour...', 'Serait-il possible de...', 'Je comprends, mais...'],
      keyVocabulary: vocabWords.slice(0, 5),
      suggestedDuration: 180,
      vocabToWeave: vocabWords,
      selectionReason: 'Problem-solving in a real situation — builds confidence for unexpected challenges',
    },
  ];

  return templates.slice(0, 3);
}
