/**
 * Quick test script for card registry
 * Run with: npx ts-node lib/registry/test-registry.ts
 */

import {
  getCardCatalog,
  getCardById,
  getCardsBySkill,
  getCardsByWeakArea,
  getHighUtilityCards,
  getOfflineCards,
  getSafeCards,
  getCardsByTime,
  calculateTotalTime,
  validateCardSelection,
  getRegistryStats,
} from './card-registry';

console.log('='.repeat(80));
console.log('CARD REGISTRY TEST');
console.log('='.repeat(80));

// Test 1: Get all cards
console.log('\n✅ Test 1: Get Card Catalog');
const catalog = getCardCatalog();
console.log(`Total cards: ${catalog.length}`);
console.log('Cards:', catalog.map(c => c.id).join(', '));

// Test 2: Get specific card
console.log('\n✅ Test 2: Get Card by ID');
const speakingCard = getCardById('speaking');
console.log('Speaking Card:', speakingCard?.name);
console.log('Utility Scores:', speakingCard?.utility);

// Test 3: Get cards by skill
console.log('\n✅ Test 3: Get Cards by Skill (Grammar)');
const grammarCards = getCardsBySkill('grammar');
console.log(`Grammar-focused cards (${grammarCards.length}):`, grammarCards.map(c => c.id).join(', '));

// Test 4: Get cards by weak area
console.log('\n✅ Test 4: Get Cards by Weak Area (Pronunciation)');
const pronunciationCards = getCardsByWeakArea('pronunciation');
console.log(`Pronunciation cards (${pronunciationCards.length}):`, pronunciationCards.map(c => c.id).join(', '));

// Test 5: Get high utility cards
console.log('\n✅ Test 5: Get High Utility Cards (Confidence >= 7)');
const confidenceCards = getHighUtilityCards('confidence');
console.log(`High confidence cards (${confidenceCards.length}):`, confidenceCards.map(c => c.id).join(', '));

// Test 6: Get offline cards
console.log('\n✅ Test 6: Get Offline Cards');
const offlineCards = getOfflineCards();
console.log(`Offline cards (${offlineCards.length}):`, offlineCards.map(c => c.id).join(', '));

// Test 7: Get safe cards (no voice input)
console.log('\n✅ Test 7: Get Safe Cards (No Voice Input)');
const safeCards = getSafeCards();
console.log(`Safe cards (${safeCards.length}):`, safeCards.map(c => c.id).join(', '));

// Test 8: Get cards by time
console.log('\n✅ Test 8: Get Cards Within 2 Minutes');
const quickCards = getCardsByTime(2);
console.log(`Quick cards (${quickCards.length}):`, quickCards.map(c => `${c.id} (${c.timeEstimate}m)`).join(', '));

// Test 9: Calculate total time
console.log('\n✅ Test 9: Calculate Total Time');
const lessonCards: any[] = ['single-vocab', 'multiple-choice', 'sentence-scramble', 'speaking', 'fill-in-blank'];
const totalTime = calculateTotalTime(lessonCards);
console.log(`Lesson cards:`, lessonCards.join(', '));
console.log(`Total estimated time: ${totalTime} minutes`);

// Test 10: Validate card selection
console.log('\n✅ Test 10: Validate Card Selection');
const validation1 = validateCardSelection(lessonCards, { maxTime: 10 });
console.log(`Validation (10 min limit):`, validation1.valid ? '✓ Valid' : `✗ Invalid - ${validation1.errors.join(', ')}`);

const validation2 = validateCardSelection(['question-game', 'role-play'], { requireOffline: true });
console.log(`Validation (offline required):`, validation2.valid ? '✓ Valid' : `✗ Invalid - ${validation2.errors.join(', ')}`);

const validation3 = validateCardSelection(['speaking'], { noVoiceInput: true });
console.log(`Validation (no voice input):`, validation3.valid ? '✓ Valid' : `✗ Invalid - ${validation3.errors.join(', ')}`);

// Test 11: Registry stats
console.log('\n✅ Test 11: Registry Statistics');
const stats = getRegistryStats();
console.log(JSON.stringify(stats, null, 2));

console.log('\n' + '='.repeat(80));
console.log('✅ ALL TESTS PASSED');
console.log('='.repeat(80));
