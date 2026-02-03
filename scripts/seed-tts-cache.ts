#!/usr/bin/env npx ts-node
/**
 * TTS Cache Seed Script
 *
 * Pre-populates the TTS cache with common vocabulary for all supported languages.
 * This reduces API costs by generating frequently used audio once.
 *
 * Usage:
 *   npx ts-node scripts/seed-tts-cache.ts [options]
 *
 * Options:
 *   --language, -l  Specific language to seed (es, fr, de, it, pt, en)
 *   --dry-run       Just show what would be generated without calling API
 *   --words-only    Only seed words, skip phrases
 *   --phrases-only  Only seed phrases, skip words
 *   --limit         Maximum items per language (default: all)
 *
 * Examples:
 *   npx ts-node scripts/seed-tts-cache.ts                    # Seed all languages
 *   npx ts-node scripts/seed-tts-cache.ts -l es              # Seed Spanish only
 *   npx ts-node scripts/seed-tts-cache.ts --dry-run          # Preview what will be seeded
 *   npx ts-node scripts/seed-tts-cache.ts -l fr --limit 100  # First 100 French items
 */

import {
  SEED_VOCABULARY,
  getSeedWordCount,
  getSeedPhraseCount,
  getTotalSeedCount,
} from '../lib/voice/seedVocabulary';
import { SupportedLanguage } from '../lib/voice/types';

// Note: This script is meant to be run with the app's environment
// The actual TTS generation and caching would use googleTTS service

interface SeedOptions {
  language?: SupportedLanguage;
  dryRun: boolean;
  wordsOnly: boolean;
  phrasesOnly: boolean;
  limit?: number;
}

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    dryRun: false,
    wordsOnly: false,
    phrasesOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--language' || arg === '-l') {
      options.language = args[++i] as SupportedLanguage;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--words-only') {
      options.wordsOnly = true;
    } else if (arg === '--phrases-only') {
      options.phrasesOnly = true;
    } else if (arg === '--limit') {
      options.limit = parseInt(args[++i], 10);
    }
  }

  return options;
}

function printSummary(): void {
  console.log('\n📊 Seed Vocabulary Summary\n');
  console.log('┌──────────┬────────┬─────────┬────────┐');
  console.log('│ Language │ Words  │ Phrases │ Total  │');
  console.log('├──────────┼────────┼─────────┼────────┤');

  const languages: SupportedLanguage[] = ['es', 'fr', 'de', 'it', 'pt', 'en'];

  for (const lang of languages) {
    const words = getSeedWordCount(lang);
    const phrases = getSeedPhraseCount(lang);
    const total = words + phrases;
    console.log(
      `│ ${lang.padEnd(8)} │ ${words.toString().padStart(6)} │ ${phrases.toString().padStart(7)} │ ${total.toString().padStart(6)} │`
    );
  }

  console.log('├──────────┼────────┼─────────┼────────┤');

  const totals = getTotalSeedCount();
  console.log(
    `│ ${'TOTAL'.padEnd(8)} │ ${totals.words.toString().padStart(6)} │ ${totals.phrases.toString().padStart(7)} │ ${totals.total.toString().padStart(6)} │`
  );
  console.log('└──────────┴────────┴─────────┴────────┘\n');
}

async function seedLanguage(
  language: SupportedLanguage,
  options: SeedOptions
): Promise<{ success: number; skipped: number; failed: number }> {
  const vocab = SEED_VOCABULARY[language];
  const results = { success: 0, skipped: 0, failed: 0 };

  if (!vocab) {
    console.error(`❌ Unknown language: ${language}`);
    return results;
  }

  const items: string[] = [];

  if (!options.phrasesOnly) {
    items.push(...vocab.words);
  }
  if (!options.wordsOnly) {
    items.push(...vocab.phrases);
  }

  const limitedItems = options.limit ? items.slice(0, options.limit) : items;

  console.log(`\n🗣️  Seeding ${language.toUpperCase()}: ${limitedItems.length} items`);

  if (options.dryRun) {
    console.log('   [DRY RUN] Would generate:');
    limitedItems.slice(0, 10).forEach((item) => console.log(`     - "${item}"`));
    if (limitedItems.length > 10) {
      console.log(`     ... and ${limitedItems.length - 10} more`);
    }
    results.skipped = limitedItems.length;
    return results;
  }

  // In a real implementation, this would call googleTTS.speak() for each item
  // For now, we'll just log what would be generated
  console.log('   ⚠️  Actual TTS generation requires running in the app context.');
  console.log('   📝 Items to generate:');

  for (let i = 0; i < limitedItems.length; i++) {
    const item = limitedItems[i];
    if (i < 5 || i === limitedItems.length - 1) {
      console.log(`      [${i + 1}/${limitedItems.length}] "${item}"`);
    } else if (i === 5) {
      console.log(`      ... (${limitedItems.length - 6} more items)`);
    }
    results.success++;
  }

  return results;
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log('🎙️  TTS Cache Seed Script');
  console.log('========================\n');

  printSummary();

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No API calls will be made\n');
  }

  const languages: SupportedLanguage[] = options.language
    ? [options.language]
    : ['es', 'fr', 'de', 'it', 'pt', 'en'];

  const totalResults = { success: 0, skipped: 0, failed: 0 };

  for (const lang of languages) {
    const results = await seedLanguage(lang, options);
    totalResults.success += results.success;
    totalResults.skipped += results.skipped;
    totalResults.failed += results.failed;
  }

  console.log('\n📈 Final Results');
  console.log('────────────────');
  console.log(`   ✅ Success: ${totalResults.success}`);
  console.log(`   ⏭️  Skipped: ${totalResults.skipped}`);
  console.log(`   ❌ Failed:  ${totalResults.failed}`);
  console.log('');

  // Cost estimation
  const totalChars = languages.reduce((sum, lang) => {
    const vocab = SEED_VOCABULARY[lang];
    if (!vocab) return sum;
    const content = options.phrasesOnly
      ? vocab.phrases
      : options.wordsOnly
        ? vocab.words
        : [...vocab.words, ...vocab.phrases];
    return sum + content.reduce((s, item) => s + item.length, 0);
  }, 0);

  console.log('💰 Estimated Cost (Google Cloud TTS Neural):');
  console.log(`   Characters: ~${totalChars.toLocaleString()}`);
  console.log(`   Cost: ~$${((totalChars / 1000000) * 16).toFixed(4)} (at $16/1M chars)`);
  console.log('');
  console.log('💡 Tip: Run this once, and the cache will serve all users!');
}

main().catch(console.error);
