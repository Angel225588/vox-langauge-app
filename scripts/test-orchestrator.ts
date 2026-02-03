#!/usr/bin/env npx ts-node

/**
 * Test Script for Claude + Gemini AI Orchestration
 *
 * Tests the full orchestration flow:
 * 1. Claude generates staircase structure
 * 2. Gemini generates content for each stair
 * 3. Progress events emitted throughout
 *
 * Usage:
 *   npx ts-node scripts/test-orchestrator.ts
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY in .env (for Claude)
 *   - EXPO_PUBLIC_GEMINI_API_KEY in .env (for Gemini)
 */

import 'dotenv/config';

// Check environment
console.log('\n🔧 Environment Check:');
console.log('  ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  EXPO_PUBLIC_GEMINI_API_KEY:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? '✅ Set' : '❌ Missing');

// Import after dotenv loads
import {
  AIOrchestrator,
  isOrchestrationAvailable,
  type OrchestrationProgress,
} from '../lib/ai/orchestrator';
import type { PathGenerationInput, GeneratedStair, VocabItem } from '../types/learning';

// Mock user profile for testing
const TEST_USER_PROFILE: PathGenerationInput = {
  user_id: 'test-user-123',
  target_language: 'Spanish',
  native_language: 'English',
  motivation: 'travel',
  motivation_custom: 'Planning a trip to Spain and Mexico',
  why_now: 'Trip in 3 months',
  proficiency_level: 'beginner',
  timeline: '3_months',
  previous_attempts: 'Tried Duolingo but lost motivation',
  commitment_stakes: 'personal',
};

async function runTest() {
  console.log('\n📊 AI Orchestration Status:');
  const status = isOrchestrationAvailable();
  console.log('  Claude available:', status.claude ? '✅' : '❌');
  console.log('  Gemini available:', status.gemini ? '✅' : '❌');
  console.log('  Full orchestration:', status.full ? '✅' : '❌');

  if (!status.gemini) {
    console.error('\n❌ Gemini API key is required. Set EXPO_PUBLIC_GEMINI_API_KEY in .env');
    process.exit(1);
  }

  console.log('\n🚀 Starting Orchestration Test...');
  console.log('  User Profile:', JSON.stringify(TEST_USER_PROFILE, null, 2));

  const startTime = Date.now();
  let lastProgress: OrchestrationProgress | null = null;
  const progressHistory: OrchestrationProgress[] = [];

  const orchestrator = new AIOrchestrator({
    onProgress: (progress: OrchestrationProgress) => {
      progressHistory.push(progress);
      lastProgress = progress;

      // Visual progress indicator
      const bar = '█'.repeat(Math.floor(progress.progress / 5)) + '░'.repeat(20 - Math.floor(progress.progress / 5));
      console.log(`  [${bar}] ${progress.progress}% - ${progress.message}`);
    },
    onEarlyRevealReady: (stairs) => {
      console.log(`\n🎉 Early reveal ready! ${stairs.length} stairs available for display.`);
    },
  });

  try {
    const result = await orchestrator.generateLearningPath(TEST_USER_PROFILE);
    const duration = Date.now() - startTime;

    if (result.success && result.path) {
      console.log('\n✅ Orchestration Successful!');
      console.log('\n📚 Generated Learning Path:');
      console.log('  Title:', result.path.path_title);
      console.log('  Description:', result.path.path_description);
      console.log('  Total Stairs:', result.path.total_stairs);
      console.log('  Estimated Completion:', result.path.estimated_completion);

      console.log('\n🪜 Stairs Summary:');
      result.path.stairs.forEach((stair: GeneratedStair, index: number) => {
        const vocabCount = stair.vocabulary?.length ?? 0;
        const scenarioCount = stair.scenarios?.length ?? 0;
        const contentStatus = stair.content_loaded ? '✅' : '⏳';
        console.log(`  ${index + 1}. ${stair.emoji} ${stair.title}`);
        console.log(`     - Vocab: ${vocabCount} items, Scenarios: ${scenarioCount}, Content: ${contentStatus}`);
      });

      if (result.metrics) {
        console.log('\n⏱️ Performance Metrics:');
        console.log(`  Total Duration: ${result.metrics.totalDurationMs}ms`);
        console.log(`  Planning (Claude): ${result.metrics.planningDurationMs}ms`);
        console.log(`  Content (Gemini): ${result.metrics.contentGenerationDurationMs}ms`);
      }

      // Cost estimate
      const claudeCost = status.claude ? 0.015 : 0; // Rough estimate for planning
      const geminiCost = result.path.stairs.length * 0.001; // Rough estimate per stair
      console.log('\n💰 Estimated Cost:');
      console.log(`  Claude: ~$${claudeCost.toFixed(4)}`);
      console.log(`  Gemini: ~$${geminiCost.toFixed(4)}`);
      console.log(`  Total: ~$${(claudeCost + geminiCost).toFixed(4)}`);

      // Sample vocabulary
      const firstStairWithContent = result.path.stairs.find((s: GeneratedStair) => s.vocabulary?.length > 0);
      if (firstStairWithContent && firstStairWithContent.vocabulary.length > 0) {
        console.log('\n📝 Sample Vocabulary (from first stair):');
        firstStairWithContent.vocabulary.slice(0, 3).forEach((vocab: VocabItem) => {
          console.log(`  - ${vocab.word} (${vocab.translation})`);
          console.log(`    "${vocab.example_sentence}"`);
        });
      }

    } else {
      console.log('\n❌ Orchestration Failed!');
      console.log('  Error:', result.error);
    }

    console.log(`\n⏱️ Total Test Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);

  } catch (error) {
    console.error('\n💥 Unexpected Error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runTest().catch(console.error);
