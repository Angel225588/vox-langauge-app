/**
 * Character Avatar Generation Script
 *
 * Uses Google's Gemini/Imagen API to generate hyper-realistic
 * character avatars for Vox Language conversation partners.
 *
 * Requirements:
 * - Node.js 20+
 * - GEMINI_API_KEY environment variable
 *
 * Usage:
 *   npx ts-node scripts/generateAvatars.ts
 *
 * Output:
 *   assets/avatars/{language}-{gender}-{name}.png
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// =============================================================================
// Types
// =============================================================================

interface CharacterConfig {
  language: string;
  gender: 'male' | 'female';
  name: string;
  ethnicity: string;
  ageRange: string;
  features: string[];
}

// =============================================================================
// Character Definitions
// =============================================================================

const LANGUAGE_CHARACTERS: CharacterConfig[] = [
  // Spanish
  {
    language: 'Spanish',
    gender: 'female',
    name: 'Sofia',
    ethnicity: 'Spanish/Mediterranean',
    ageRange: '28-35',
    features: [
      'olive skin',
      'dark brown wavy hair',
      'warm brown eyes',
      'subtle smile lines',
    ],
  },
  {
    language: 'Spanish',
    gender: 'male',
    name: 'Carlos',
    ethnicity: 'Spanish/Latin American',
    ageRange: '30-40',
    features: [
      'light tan skin',
      'short dark hair',
      'dark eyes',
      'light stubble',
      'friendly expression',
    ],
  },
  // French
  {
    language: 'French',
    gender: 'female',
    name: 'Amelie',
    ethnicity: 'French/European',
    ageRange: '25-32',
    features: [
      'fair skin with natural freckles',
      'auburn hair',
      'green eyes',
      'elegant bone structure',
    ],
  },
  {
    language: 'French',
    gender: 'male',
    name: 'Pierre',
    ethnicity: 'French/European',
    ageRange: '35-45',
    features: [
      'fair skin',
      'salt-and-pepper hair',
      'blue-grey eyes',
      'distinguished appearance',
    ],
  },
  // German
  {
    language: 'German',
    gender: 'female',
    name: 'Anna',
    ethnicity: 'German/Central European',
    ageRange: '28-35',
    features: [
      'fair skin',
      'blonde hair',
      'blue eyes',
      'natural complexion',
      'warm smile',
    ],
  },
  {
    language: 'German',
    gender: 'male',
    name: 'Markus',
    ethnicity: 'German/Central European',
    ageRange: '32-42',
    features: [
      'light skin',
      'brown hair',
      'hazel eyes',
      'visible skin texture',
      'approachable expression',
    ],
  },
  // Italian
  {
    language: 'Italian',
    gender: 'female',
    name: 'Giulia',
    ethnicity: 'Italian/Mediterranean',
    ageRange: '26-34',
    features: [
      'warm olive skin',
      'dark curly hair',
      'expressive brown eyes',
      'natural beauty marks',
    ],
  },
  {
    language: 'Italian',
    gender: 'male',
    name: 'Marco',
    ethnicity: 'Italian/Mediterranean',
    ageRange: '30-40',
    features: [
      'olive complexion',
      'dark wavy hair',
      'brown eyes',
      'charming smile',
      'slight stubble',
    ],
  },
  // Portuguese
  {
    language: 'Portuguese',
    gender: 'female',
    name: 'Lucia',
    ethnicity: 'Portuguese/Brazilian',
    ageRange: '25-33',
    features: [
      'warm tan skin',
      'dark brown hair',
      'deep brown eyes',
      'radiant smile',
      'visible dimples',
    ],
  },
  {
    language: 'Portuguese',
    gender: 'male',
    name: 'Rafael',
    ethnicity: 'Portuguese/Brazilian',
    ageRange: '28-38',
    features: [
      'golden tan skin',
      'black curly hair',
      'dark eyes',
      'friendly demeanor',
      'natural skin texture',
    ],
  },
];

// =============================================================================
// Prompt Builder
// =============================================================================

function buildPrompt(character: CharacterConfig): string {
  const featuresStr = character.features.join(', ');

  return `Professional headshot portrait photograph of a ${character.ageRange} year old ${character.gender} ${character.ethnicity} person named ${character.name}.

Physical features: ${featuresStr}.

Photography specifications:
- Professional studio lighting with soft key light
- Neutral grey or cream background
- Shot with 85mm portrait lens, shallow depth of field
- High resolution, sharp focus on eyes
- Natural color grading, not over-processed

Skin quality requirements:
- Visible skin pores and natural texture
- No artificial smoothing or plastic appearance
- Natural skin imperfections (subtle freckles, fine lines appropriate for age)
- Realistic sheen on highlights

Expression: Warm, approachable, friendly - like a supportive language tutor.

Style: Photorealistic, indistinguishable from real photography, professional headshot quality.`;
}

// =============================================================================
// Image Generation (Placeholder - requires @google/genai package)
// =============================================================================

async function generateImage(
  prompt: string,
  outputPath: string
): Promise<boolean> {
  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY environment variable not set');
    console.log('\nTo set up:');
    console.log('1. Go to https://aistudio.google.com/');
    console.log('2. Create a project and generate an API key');
    console.log('3. Set environment variable: export GEMINI_API_KEY=your_key_here');
    return false;
  }

  try {
    // Dynamic import to avoid errors if package not installed
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    console.log('  Generating image with Gemini 3 Pro...');

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Highest quality for photorealistic avatars
      contents: prompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '3:4', // Portrait orientation
          imageSize: '2K', // 2048px resolution
        },
      },
    });

    // Extract image data from response
    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      console.error('  ❌ No image data in response');
      return false;
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        fs.writeFileSync(outputPath, buffer);
        console.log(`  ✅ Saved: ${outputPath}`);
        return true;
      }
    }

    console.error('  ❌ No inline image data found');
    return false;
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes("Cannot find module '@google/genai'")) {
      console.error('\n❌ @google/genai package not installed');
      console.log('\nTo install:');
      console.log('  npm install @google/genai');
      console.log('\nThen run this script again.');
    } else {
      console.error(`  ❌ Error: ${err.message}`);
    }
    return false;
  }
}

// =============================================================================
// Main Generation Function
// =============================================================================

async function generateAllAvatars(): Promise<void> {
  console.log('🎨 Vox Language - Character Avatar Generator\n');
  console.log('━'.repeat(50));

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'assets', 'avatars');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}\n`);
  }

  let successCount = 0;
  let failCount = 0;

  for (const character of LANGUAGE_CHARACTERS) {
    const filename = `${character.language.toLowerCase()}-${character.gender}-${character.name.toLowerCase()}.png`;
    const filepath = path.join(outputDir, filename);

    console.log(
      `\n👤 ${character.name} (${character.language} ${character.gender})`
    );

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log('  ⏭️  Already exists, skipping');
      successCount++;
      continue;
    }

    const prompt = buildPrompt(character);
    const success = await generateImage(prompt, filepath);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limiting - wait between requests
    if (LANGUAGE_CHARACTERS.indexOf(character) < LANGUAGE_CHARACTERS.length - 1) {
      console.log('  ⏳ Waiting 3s before next request...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log(`\n✨ Avatar generation complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  if (successCount > 0) {
    console.log(`\n📂 Avatars saved to: ${outputDir}`);
  }
}

// =============================================================================
// Export Character Data for App Use
// =============================================================================

export function getCharacterData() {
  return LANGUAGE_CHARACTERS.map((char) => ({
    id: `${char.language.toLowerCase()}-${char.gender}`,
    name: char.name,
    language: char.language.toLowerCase(),
    gender: char.gender,
    avatarPath: `assets/avatars/${char.language.toLowerCase()}-${char.gender}-${char.name.toLowerCase()}.png`,
  }));
}

// =============================================================================
// Run if executed directly
// =============================================================================

// Check if running directly (not imported)
const isMainModule = require.main === module;

if (isMainModule) {
  generateAllAvatars().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
