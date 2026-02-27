/**
 * Preview Stairs Generator
 *
 * Transforms V3 onboarding scenarios into StairForDisplay[] for
 * unauthenticated users. Shows their personalized learning path
 * with only the first lesson unlocked — motivating signup.
 *
 * Stored in AsyncStorage so the home screen can display them
 * without auth or Supabase.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StairForDisplay } from '@/hooks/useLearningPath';

const STORAGE_KEY = 'vox-preview-stairs';

// ─── Scenario → Emoji Mapping ──────────────────────

const SCENARIO_EMOJIS: Record<string, string> = {
  // Healthcare
  'Patient consultations': 'medkit-outline',
  'Explaining procedures & diagnosis': 'clipboard-outline',
  'Emergency communication': 'alert-circle-outline',
  'Medical history intake': 'document-text-outline',
  'Family conversations': 'people-outline',
  'Colleague handoffs & rounds': 'swap-horizontal-outline',
  'Pharmacy interactions': 'flask-outline',
  'Mental health discussions': 'heart-outline',
  'Insurance & billing': 'card-outline',

  // Tech
  'Stand-ups & sprint planning': 'calendar-outline',
  'Code reviews & pair programming': 'code-slash-outline',
  'Demo presentations': 'easel-outline',
  'Cross-team coordination': 'git-network-outline',
  'Technical documentation': 'document-outline',
  'Client calls & requirements': 'call-outline',
  'Onboarding new teammates': 'person-add-outline',
  'Conference talks': 'mic-outline',
  'Job interviews & panels': 'briefcase-outline',

  // Business & Finance
  'Client meetings & pitches': 'business-outline',
  'Negotiating deals & contracts': 'handshake-outline',
  'Board & stakeholder presentations': 'podium-outline',
  'Networking events': 'globe-outline',
  'Email & report writing': 'mail-outline',
  'Phone & video calls': 'videocam-outline',
  'Team leadership & 1-on-1s': 'people-circle-outline',
  'Job interviews': 'briefcase-outline',
  'Conferences & summits': 'business-outline',

  // Legal
  'Client consultations': 'chatbubbles-outline',
  'Court proceedings & hearings': 'hammer-outline',
  'Contract negotiations': 'document-text-outline',
  'Depositions & witness prep': 'recording-outline',
  'Legal writing & briefs': 'create-outline',
  'Immigration cases': 'airplane-outline',
  'Mediation & arbitration': 'hand-left-outline',
  'Cross-border cases': 'globe-outline',
  'Regulatory discussions': 'shield-outline',

  // Sales & Marketing
  'Product demos & pitches': 'rocket-outline',
  'Cold outreach & follow-ups': 'send-outline',
  'Price & contract negotiations': 'pricetags-outline',
  'Trade shows & events': 'storefront-outline',
  'Customer consultations': 'chatbubble-outline',
  'Campaign presentations': 'megaphone-outline',
  'Partner meetings': 'handshake-outline',
  'Complaint resolution': 'chatbubble-ellipses-outline',
  'Market research interviews': 'search-outline',

  // Hospitality & Tourism
  'Guest check-in & concierge': 'bed-outline',
  'Tour guiding': 'map-outline',
  'Menu & cuisine explanations': 'restaurant-outline',
  'Event coordination': 'calendar-outline',
  'VIP & special requests': 'star-outline',
  'Staff coordination': 'people-outline',
  'Emergency situations': 'warning-outline',
  'Local recommendations': 'compass-outline',

  // Education
  'Classroom instruction': 'school-outline',
  'Parent-teacher meetings': 'people-outline',
  'Student counseling': 'heart-outline',
  'Staff meetings': 'chatbubbles-outline',
  'Research collaboration': 'flask-outline',
  'Grant writing': 'document-text-outline',
  'Conference presentations': 'easel-outline',
  'Curriculum discussions': 'book-outline',
  'Administrative processes': 'clipboard-outline',

  // Government & Diplomacy
  'Diplomatic negotiations': 'flag-outline',
  'Press briefings & media': 'newspaper-outline',
  'Policy discussions': 'document-outline',
  'Constituent meetings': 'people-outline',
  'Cross-agency coordination': 'git-network-outline',
  'Protocol & formal events': 'ribbon-outline',
  'Report & speech writing': 'create-outline',
  'International summits': 'earth-outline',
  'Public speaking': 'mic-outline',

  // Creative & Media
  'Client pitches & briefs': 'color-palette-outline',
  'Creative direction meetings': 'bulb-outline',
  'Content planning & strategy': 'analytics-outline',
  'Interviewing & podcasting': 'mic-outline',
  'Script & copywriting': 'pencil-outline',
  'Brand presentations': 'brush-outline',
  'Production coordination': 'film-outline',
  'Partnership negotiations': 'handshake-outline',
  'Critique & review sessions': 'chatbox-outline',

  // Default scenarios
  'Meetings & calls': 'call-outline',
  'Presentations': 'easel-outline',
  'Email & writing': 'mail-outline',
  'Client interactions': 'chatbubble-outline',
  'Team collaboration': 'people-outline',
  'Phone conversations': 'call-outline',
  'Daily life & errands': 'cart-outline',
};

const FALLBACK_EMOJI = 'chatbubble-outline';

// ─── Lesson Suffixes & Descriptions ─────────────────

type LessonTemplate = { suffix: string; descTemplate: string };

const BEGINNER_LESSONS: LessonTemplate[] = [
  { suffix: 'Essentials', descTemplate: 'Learn the core vocabulary and key phrases for {scenario} in {lang}' },
  { suffix: 'In Practice', descTemplate: 'Practice real conversations for {scenario} situations in {lang}' },
  { suffix: 'Fluency', descTemplate: 'Handle complex {scenario} scenarios naturally in {lang}' },
];

const INTERMEDIATE_LESSONS: LessonTemplate[] = [
  { suffix: 'Core Skills', descTemplate: 'Master essential vocabulary and patterns for {scenario} in {lang}' },
  { suffix: 'Advanced', descTemplate: 'Navigate nuanced, complex {scenario} situations in {lang}' },
];

const RECALIBRATION_STAIR: Omit<StairForDisplay, 'id' | 'order'> = {
  title: 'Recalibration & Review',
  emoji: 'refresh-outline',
  description: 'Assess your progress and adjust your learning path',
  status: 'locked',
  vocabulary_count: 0,
  estimated_days: 1,
};

const BEGINNER_LEVELS = new Set(['starting_fresh', 'basics']);
const MAX_STAIRS = 12;

// Filler words to drop when shortening scenario titles
const FILLER_WORDS = new Set([
  'and', '&', 'the', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'with',
]);

/**
 * Generate a short, readable title from a scenario + suffix.
 * Caps at ~25 characters total so it fits on stair cards.
 *
 * Examples:
 * - "Patient consultations" → "Patient Consults: Essentials"
 * - "Explaining procedures & diagnosis" → "Procedures: Practice"
 * - "Stand-ups & sprint planning" → "Sprint Planning: Core"
 * - "My custom very long scenario name" → "Custom Scenario: Essentials"
 */
function generateShortTitle(scenario: string, suffix: string): string {
  // Drop filler words, keep meaningful words
  const words = scenario
    .split(/[\s,]+/)
    .filter(w => !FILLER_WORDS.has(w.toLowerCase()));

  // Take first 2-3 meaningful words, join them
  const maxWords = words.length <= 3 ? words.length : 2;
  let shortScenario = words.slice(0, maxWords).join(' ');

  // Capitalize first letter of each word
  shortScenario = shortScenario
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Build full title
  const fullTitle = `${shortScenario}: ${suffix}`;

  // If still too long (>30 chars), truncate the scenario part
  if (fullTitle.length > 30) {
    const truncated = shortScenario.substring(0, 30 - suffix.length - 2);
    return `${truncated.trim()}: ${suffix}`;
  }

  return fullTitle;
}

function getLessonTemplates(proficiencyLevel?: string): LessonTemplate[] {
  if (!proficiencyLevel || BEGINNER_LEVELS.has(proficiencyLevel)) {
    return BEGINNER_LESSONS;
  }
  return INTERMEDIATE_LESSONS;
}

function formatDescription(template: string, scenario: string, language: string): string {
  const lang = language.charAt(0).toUpperCase() + language.slice(1);
  return template
    .replace('{scenario}', scenario.toLowerCase())
    .replace('{lang}', lang);
}

// ─── Vocab & Days Estimates ─────────────────────────

function estimateVocab(index: number): number {
  // First stair is smaller (approachable), later stairs grow
  const base = 20 + (index * 5);
  return Math.min(base, 50);
}

function estimateDays(index: number): number {
  return index === 0 ? 2 : 3 + Math.floor(index / 2);
}

// ─── Generator ──────────────────────────────────────

export interface PreviewStairsInput {
  scenarios: string[];
  target_language: string;
  profession?: string;
  proficiency_level?: string;
}

/**
 * Generate preview stairs from onboarding data.
 *
 * Each scenario is expanded into 2-3 progressive lessons:
 * - Beginners (starting_fresh, basics): 3 lessons per scenario
 * - Intermediate+ (conversational, confident, near_fluent): 2 lessons per scenario
 *
 * A recalibration stair is appended at the end.
 * Total capped at 12 (DB constraint).
 * First stair = 'current' (accessible), rest = 'locked'.
 */
export function generatePreviewStairs(input: PreviewStairsInput): StairForDisplay[] {
  const { scenarios, target_language, proficiency_level } = input;

  if (scenarios.length === 0) return [];

  const templates = getLessonTemplates(proficiency_level || undefined);
  const lang = target_language || 'the language';
  const stairs: StairForDisplay[] = [];
  let order = 0;

  for (const scenario of scenarios) {
    const icon = SCENARIO_EMOJIS[scenario] || FALLBACK_EMOJI;

    for (const lesson of templates) {
      if (order >= MAX_STAIRS - 1) break; // Reserve 1 slot for recalibration

      order++;
      stairs.push({
        id: `preview-${order}`,
        order,
        title: generateShortTitle(scenario, lesson.suffix),
        emoji: icon,
        description: formatDescription(lesson.descTemplate, scenario, lang),
        status: order === 1 ? 'current' as const : 'locked' as const,
        vocabulary_count: estimateVocab(order - 1),
        estimated_days: estimateDays(order - 1),
      });
    }

    if (order >= MAX_STAIRS - 1) break;
  }

  // Always append recalibration stair
  order++;
  stairs.push({
    ...RECALIBRATION_STAIR,
    id: `preview-${order}`,
    order,
  });

  return stairs;
}

// ─── Storage ────────────────────────────────────────

/** Save preview stairs to AsyncStorage */
export async function storePreviewStairs(stairs: StairForDisplay[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stairs));
  } catch (err) {
    console.warn('[PreviewStairs] Failed to store:', err);
  }
}

/** Load preview stairs from AsyncStorage */
export async function loadPreviewStairs(): Promise<StairForDisplay[] | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as StairForDisplay[];
  } catch (err) {
    console.warn('[PreviewStairs] Failed to load:', err);
    return null;
  }
}

/** Clear preview stairs (after real path is generated) */
export async function clearPreviewStairs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[PreviewStairs] Failed to clear:', err);
  }
}

/**
 * Advance stair progression after a lesson is completed.
 * Marks the completed stair as 'completed' and unlocks the next one.
 *
 * Works for both preview stairs (AsyncStorage) and will be extended
 * for Supabase stairs when authenticated.
 *
 * @param completedStairId - The ID of the stair that was just completed
 * @returns true if progression was successful
 */
export async function advanceStairProgression(completedStairId: string): Promise<boolean> {
  try {
    const stairs = await loadPreviewStairs();
    if (!stairs || stairs.length === 0) return false;

    const completedIndex = stairs.findIndex(s => s.id === completedStairId);
    if (completedIndex === -1) return false;

    // Mark completed stair
    stairs[completedIndex] = { ...stairs[completedIndex], status: 'completed' };

    // Unlock next stair (if exists and is locked)
    if (completedIndex + 1 < stairs.length && stairs[completedIndex + 1].status === 'locked') {
      stairs[completedIndex + 1] = { ...stairs[completedIndex + 1], status: 'current' };
    }

    await storePreviewStairs(stairs);
    return true;
  } catch (err) {
    console.warn('[PreviewStairs] Failed to advance progression:', err);
    return false;
  }
}
