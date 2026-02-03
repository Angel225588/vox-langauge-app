#!/usr/bin/env node

/**
 * Simple Test Script for Claude API Connection
 *
 * Tests that the Claude API is configured and working correctly.
 *
 * Usage:
 *   node scripts/test-claude-api.js
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY in .env
 */

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk').default;

async function testClaudeConnection() {
  console.log('\n🔧 Environment Check:');
  console.log('  ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('  EXPO_PUBLIC_GEMINI_API_KEY:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? '✅ Set' : '❌ Missing');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY is required. Set it in .env');
    process.exit(1);
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log('\n🚀 Testing Claude Opus 4.5 Connection...');

  const testProfile = {
    nativeLanguage: 'English',
    targetLanguage: 'Spanish',
    currentLevel: 'A1',
    learningGoals: ['travel', 'conversation'],
    interests: ['food', 'culture'],
    dailyTimeMinutes: 15,
    motivation: 'travel',
    timeline: '3_months',
  };

  const prompt = `You are an expert language learning curriculum designer. Create a brief learning path outline for:
- Native Language: ${testProfile.nativeLanguage}
- Target Language: ${testProfile.targetLanguage}
- Current Level: ${testProfile.currentLevel}
- Goals: ${testProfile.learningGoals.join(', ')}
- Daily Time: ${testProfile.dailyTimeMinutes} minutes

Create 3 themed learning units (stairs) with titles and brief descriptions.
Respond with JSON only:
{
  "stairs": [
    {"position": 1, "theme": "...", "description": "..."},
    {"position": 2, "theme": "...", "description": "..."},
    {"position": 3, "theme": "...", "description": "..."}
  ]
}`;

  try {
    const startTime = Date.now();

    const message = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const duration = Date.now() - startTime;
    const textBlock = message.content.find(block => block.type === 'text');
    const response = textBlock?.text || 'No text response';

    console.log('\n✅ Claude API Connected Successfully!');
    console.log(`\n⏱️ Response Time: ${duration}ms`);
    console.log(`\n📊 Usage:`);
    console.log(`  Input tokens: ${message.usage.input_tokens}`);
    console.log(`  Output tokens: ${message.usage.output_tokens}`);

    // Calculate cost estimate
    const inputCost = (message.usage.input_tokens / 1000000) * 15; // $15/M input
    const outputCost = (message.usage.output_tokens / 1000000) * 75; // $75/M output
    const totalCost = inputCost + outputCost;
    console.log(`  Estimated cost: $${totalCost.toFixed(4)}`);

    // Try to parse JSON from response
    console.log('\n📝 Response Preview:');
    try {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : response.trim();
      const parsed = JSON.parse(jsonString);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log(response.substring(0, 500));
    }

    console.log('\n✅ Test Complete!');

  } catch (error) {
    console.error('\n❌ Claude API Error:');
    console.error('  Message:', error.message);
    if (error.status) {
      console.error('  Status:', error.status);
    }
    if (error.error?.type) {
      console.error('  Type:', error.error.type);
    }
    process.exit(1);
  }
}

testClaudeConnection().catch(console.error);
