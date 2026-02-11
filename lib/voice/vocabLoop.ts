/**
 * Vocabulary ↔ Conversation Loop
 *
 * The core innovation: Flashcards (FSRS) → Pre-call vocab review → AI Conversation
 *                       ↑                                              ↓
 *                       └──── Post-call analysis feeds back ←──────────┘
 *
 * PRE-CALL:  Get scenario-relevant words from word bank for review
 * POST-CALL: Feed used/missed words back to FSRS (Good/Again)
 *
 * No competitor has this closed loop.
 */

import { getWords, findWordByText, addOrReinforceWord, recordReview } from '@/lib/word-bank/storage';
import type { BankWord, WordFilter } from '@/lib/word-bank/types';

// =============================================================================
// Pre-Call: Get Relevant Vocab for Scenario
// =============================================================================

/**
 * Get vocabulary words relevant to a scenario for pre-call review.
 *
 * Strategy:
 * 1. Words matching the scenario category (e.g., 'food' for cafe_ordering)
 * 2. Words due for review (FSRS scheduled)
 * 3. Low-mastery words that need practice
 * 4. Limit to 3-5 words (manageable before a call)
 */
export async function getPreCallVocab(
  scenario: string,
  targetLanguage: string,
  limit: number = 5
): Promise<BankWord[]> {
  const category = scenarioToCategory(scenario);

  // 1. Try category-matched words first
  const categoryWords = await getWords({
    category,
    needsReview: true,
    limit: limit,
  } as WordFilter);

  if (categoryWords.length >= limit) {
    return categoryWords.slice(0, limit);
  }

  // 2. Fill remaining slots with any due-for-review words
  const dueWords = await getWords({
    needsReview: true,
    limit: limit * 2,
  } as WordFilter);

  // Combine and deduplicate
  const seen = new Set(categoryWords.map((w) => w.id));
  const combined = [...categoryWords];

  for (const word of dueWords) {
    if (!seen.has(word.id) && combined.length < limit) {
      seen.add(word.id);
      combined.push(word);
    }
  }

  // 3. If still not enough, grab low-mastery words
  if (combined.length < limit) {
    const weakWords = await getWords({
      maxPriority: 10,
      limit: limit * 2,
    } as WordFilter);

    for (const word of weakWords) {
      if (!seen.has(word.id) && combined.length < limit) {
        seen.add(word.id);
        combined.push(word);
      }
    }
  }

  return combined.slice(0, limit);
}

// =============================================================================
// Post-Call: Feed Results Back to FSRS
// =============================================================================

/**
 * Process post-call vocabulary results and update FSRS state.
 *
 * - Words the user used correctly → FSRS quality 4 (correct with hesitation)
 * - Words the user missed/struggled with → FSRS quality 1 (incorrect but recognized)
 * - New vocabulary from conversation → add to word bank with source 'ai_conversation'
 */
export async function processPostCallVocab(input: {
  vocabUsed: string[];
  vocabMissed: string[];
  newVocabulary: string[];
  targetLanguage: string;
  scenario: string;
}): Promise<{
  wordsReinforced: number;
  wordsWeakened: number;
  wordsAdded: number;
}> {
  let wordsReinforced = 0;
  let wordsWeakened = 0;
  let wordsAdded = 0;

  // 1. Words used correctly → record as quality 4 (correct with some hesitation)
  for (const wordText of input.vocabUsed) {
    const existing = await findWordByText(wordText);
    if (existing) {
      await recordReview(existing.id, 4); // SM-2 quality 4 = correct with hesitation
      wordsReinforced++;
    }
  }

  // 2. Words missed → record as quality 1 (incorrect but recognized)
  for (const wordText of input.vocabMissed) {
    const existing = await findWordByText(wordText);
    if (existing) {
      await recordReview(existing.id, 1, 'usage'); // SM-2 quality 1 = wrong but recognized
      wordsWeakened++;
    }
  }

  // 3. New vocabulary from conversation → add to word bank
  for (const wordText of input.newVocabulary) {
    const existing = await findWordByText(wordText);
    if (!existing) {
      await addOrReinforceWord({
        word: wordText,
        translation: '', // Will be filled by user or AI later
        source: 'ai_conversation',
        category: scenarioToCategory(input.scenario),
        milestoneTags: [input.scenario],
        exampleSentences: [],
      });
      wordsAdded++;
    }
  }

  console.log(
    `[VocabLoop] Post-call results: ${wordsReinforced} reinforced, ${wordsWeakened} weakened, ${wordsAdded} new`
  );

  return { wordsReinforced, wordsWeakened, wordsAdded };
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Map scenario IDs to word bank categories.
 */
function scenarioToCategory(scenario: string): string {
  const mapping: Record<string, string> = {
    cafe_ordering: 'food',
    restaurant: 'food',
    shopping: 'shopping',
    directions: 'travel',
    hotel_checkin: 'travel',
    airport: 'travel',
    job_interview: 'work',
    meeting: 'work',
    office: 'work',
    doctor: 'health',
    emergency: 'health',
    pharmacy: 'health',
    casual_chat: 'social',
    party: 'social',
    dating: 'social',
    banking: 'daily',
    housing: 'daily',
    phone_call: 'daily',
  };

  return mapping[scenario] || 'general';
}
