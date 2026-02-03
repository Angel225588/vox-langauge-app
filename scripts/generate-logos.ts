/**
 * Vox Logo Generator Script
 *
 * Generates logo concepts using Gemini 2.5 Flash Image API
 *
 * Usage:
 *   npx ts-node scripts/generate-logos.ts
 *
 * Requirements:
 *   - EXPO_PUBLIC_GEMINI_API_KEY environment variable set
 *   - @google/generative-ai package installed
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'branding');
const MODEL_NAME = 'gemini-2.5-flash-image';

// ============================================================================
// LOGO PROMPTS
// ============================================================================

const LOGO_PROMPTS = {
  // Logo 1: Round Table / Conversation Circle (User's Request)
  conversationCircle: {
    name: 'vox-logo-conversation-circle',
    prompt: `Create a minimalist logo icon for a language learning app called "Vox".

Design: A perfect circle representing a round table viewed from above. Around the circle, place exactly 5 small circular dots evenly spaced, representing people gathered for conversation. Inside the circle, include 3 curved concentric sound wave arcs emanating from the center, representing voice and communication. One of the 5 dots should be slightly larger than the others, suggesting the active speaker.

Style:
- Flat vector design, no gradients
- Clean geometric shapes
- Minimalist and modern
- Suitable for app icon at any size
- Professional and premium feel

Colors:
- Circle outline and sound waves: Deep indigo #6366F1
- People dots: White #F9FAFB
- Background: Transparent (PNG)
- Optional accent dot: Teal #06D6A0

Mood: Inclusive, community-focused, conversational, welcoming

Technical: Square canvas, centered composition, 1024x1024 pixels, clean edges suitable for scaling down to 48px`,
  },

  // Logo 2: Vox Crystal (Main Brand Logo)
  crystal: {
    name: 'vox-logo-crystal',
    prompt: `Create a sophisticated logo icon for a language learning app called "Vox".

Design: A hexagonal crystal shape with softened/rounded corners, like a precious gem. Inside the hexagon, place 3 elegant curved lines that emanate outward from the center, representing sound waves or a voice visualization. The sound waves should be white or lighter than the hexagon fill. Add a subtle sparkle or shine in the upper right corner of the crystal.

Style:
- Geometric but approachable
- Gradient fill on the hexagon
- Clean, premium, modern
- Minimal detail for scalability
- Suggests value and achievement

Colors:
- Hexagon: Gradient from indigo #6366F1 to purple #8B5CF6
- Sound waves inside: White #FFFFFF at 80% opacity
- Sparkle: Pure white
- Background: Transparent or deep dark blue #0A0E1A

Mood: Valuable, earned, premium, voice-focused

Technical: 1024x1024 square canvas, centered, high-contrast edges, suitable for app icon`,
  },

  // Logo 3: V-Wave (Minimal Letter Logo)
  vWave: {
    name: 'vox-logo-v-wave',
    prompt: `Create a minimalist typographic logo for "Vox".

Design: The letter "V" transformed into a visual representation of sound. The left stroke of the V is a clean straight diagonal line. The right stroke curves elegantly into a sound wave pattern with 2-3 gentle undulations. The overall shape still clearly reads as the letter V.

Style:
- Ultra minimalist
- Single continuous stroke
- Modern and tech-forward
- Works in single color
- Highly scalable from favicon to billboard

Colors:
- Gradient from indigo #6366F1 to purple #8B5CF6 along the wave
- Background: Transparent

Mood: Modern, progressive, simple, voice-focused

Technical: 1024x1024, the V should occupy about 70% of the canvas height, centered, vector-clean edges`,
  },

  // Logo 4: Speech Bubble Echo (Bonus)
  speechBubble: {
    name: 'vox-logo-speech-bubble',
    prompt: `Create a contemporary logo for "Vox" language learning app.

Design: A modern rounded speech bubble shape, slightly tilted (5-10 degrees) for dynamism. Inside the bubble, draw 2-3 concentric echo rings representing sound emanating outward. The bubble has a small tail in the bottom-left corner. Optional: tiny circular particles around the outer ring suggesting sound particles.

Style:
- Friendly yet professional
- Filled speech bubble with gradient
- Echo rings in lighter shade or white
- App-native design language
- Instantly recognizable

Colors:
- Bubble fill: Gradient indigo to purple (#6366F1 → #8B5CF6)
- Echo rings: White at varying opacity (100%, 60%, 30%)
- Background: Transparent

Mood: Communicative, friendly, modern, approachable

Technical: 1024x1024, centered, suitable for small sizes`,
  },

  // App Icon - Dark Background
  appIconDark: {
    name: 'vox-app-icon-dark',
    prompt: `Create an app icon for "Vox" language learning app.

Design: A hexagonal crystal with sound waves inside, centered on a square canvas.
Background: Deep space blue-black #0A0E1A
Icon: Indigo #6366F1 to purple #8B5CF6 gradient hexagon with rounded corners
Sound waves: 3 white curved lines emanating from center
Add a subtle outer glow around the crystal in indigo

iOS app icon style, 1024x1024, with the icon taking up about 70% of the space.
Premium, modern, language learning app aesthetic.`,
  },

  // Wordmark
  wordmark: {
    name: 'vox-wordmark',
    prompt: `Create a typographic wordmark for "Vox".

The word "vox" in lowercase, using a bold geometric sans-serif font similar to Poppins Bold. The letters should have slightly rounded terminals for approachability. Letter spacing slightly increased for premium feel.

Colors: Gradient from indigo #6366F1 to purple #8B5CF6 applied horizontally across the word.
Background: Dark background #0A0E1A

Clean, modern, professional, suitable for app header and branding.
Wide format canvas with text centered.`,
  },
};

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

async function generateLogo(
  client: GoogleGenerativeAI,
  prompt: string,
  filename: string
): Promise<boolean> {
  console.log(`\n📸 Generating: ${filename}...`);

  try {
    const model = client.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        // @ts-ignore - responseModalities is a valid option for image generation
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const response = result.response;
    const candidate = response.candidates?.[0];

    if (!candidate?.content?.parts) {
      console.error(`   ❌ No content in response for ${filename}`);
      return false;
    }

    let imageFound = false;

    for (const part of candidate.content.parts) {
      // Check for inline image data
      if ('inlineData' in part && part.inlineData) {
        const imageData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        const extension = mimeType.includes('jpeg') ? 'jpg' : 'png';

        const buffer = Buffer.from(imageData, 'base64');
        const filepath = path.join(OUTPUT_DIR, `${filename}.${extension}`);

        fs.writeFileSync(filepath, buffer);
        console.log(`   ✅ Saved: ${filepath}`);
        imageFound = true;
      }

      // Log any text response
      if ('text' in part && part.text) {
        console.log(`   📝 AI Note: ${part.text.substring(0, 100)}...`);
      }
    }

    if (!imageFound) {
      console.log(`   ⚠️  No image in response. Text-only response received.`);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error(`   ❌ Error generating ${filename}:`, error.message);
    return false;
  }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

async function main() {
  console.log('🎨 Vox Logo Generator');
  console.log('='.repeat(50));

  // Check API key
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('\n❌ Error: EXPO_PUBLIC_GEMINI_API_KEY not set');
    console.log('Please set your Gemini API key in .env file');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`\n📁 Created output directory: ${OUTPUT_DIR}`);
  }

  // Initialize client
  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`\n🤖 Using model: ${MODEL_NAME}`);

  // Generate each logo
  const results: { name: string; success: boolean }[] = [];

  for (const [key, config] of Object.entries(LOGO_PROMPTS)) {
    const success = await generateLogo(genAI, config.prompt, config.name);
    results.push({ name: config.name, success });

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Generation Summary:');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  if (successful.length > 0) {
    console.log('\n✅ Successfully generated:');
    successful.forEach(r => console.log(`   • ${r.name}`));
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed to generate:');
    failed.forEach(r => console.log(`   • ${r.name}`));
    console.log('\n💡 Tip: For failed logos, try using Google AI Studio directly:');
    console.log('   https://aistudio.google.com');
  }

  console.log(`\n📁 Output directory: ${OUTPUT_DIR}`);
  console.log('\n🎉 Done!');
}

// Run
main().catch(console.error);
