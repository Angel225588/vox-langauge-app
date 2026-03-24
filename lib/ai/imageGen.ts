/**
 * Nano Banana Image Generation — Vox Language App
 *
 * Uses Google's Nano Banana 2 (gemini-3.1-flash-image-preview) to generate
 * screen mockups, illustrations, and visual assets.
 *
 * Same API key as text generation (EXPO_PUBLIC_GEMINI_API_KEY).
 *
 * USAGE:
 *   import { generateImage, generateScreenMockup } from '@/lib/ai/imageGen';
 *
 *   // Basic image generation
 *   const base64 = await generateImage('A French café scene, professional illustration');
 *
 *   // Screen mockup with Vox branding
 *   const mockup = await generateScreenMockup({
 *     screenName: 'Vocabulary Practice',
 *     description: 'Flashcard screen with French vocabulary, dark theme',
 *     elements: ['card stack', 'progress bar', 'audio button'],
 *   });
 *
 * NOTE: This module is foundation-only. The design pipeline that consumes
 * it will be built when we shift from features → polish phase.
 */

import { GoogleGenAI } from '@google/genai';

// ─── Configuration ───────────────────────────────────

const IMAGE_MODELS = {
  fast: 'gemini-3.1-flash-image-preview',    // Nano Banana 2 — speed + quality
  pro: 'gemini-3-pro-image-preview',          // Nano Banana Pro — best quality
} as const;

type ImageModel = keyof typeof IMAGE_MODELS;

interface ImageConfig {
  model?: ImageModel;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  imageSize?: '512' | '1K' | '2K' | '4K';
}

interface ScreenMockupInput {
  screenName: string;
  description: string;
  elements?: string[];
  userFlow?: string;
  targetLanguage?: string;
}

interface GeneratedImage {
  base64: string;
  mimeType: string;
  prompt: string;
  model: string;
  generatedAt: string;
}

// ─── Vox Brand Context (injected into all prompts) ───

const VOX_BRAND_CONTEXT = `
BRAND: Vox Language — premium professional language learning app.
THEME: Dark neomorphic UI.
COLORS: Background #0A0E1A (deep space blue-black), Cards #1A1F3A,
  Primary #0036FF (electric blue), Secondary #06D6A0 (teal),
  Text #F9FAFB (almost white), Subtle text #D1D5DB.
STYLE: Clean, minimal, professional. No childish elements.
  Think: premium fintech app meets language learning.
  Rounded corners (12-24px), subtle shadows, glass morphism accents.
AUDIENCE: Doctors, lawyers, executives learning languages for work.
`;

// ─── Client ──────────────────────────────────────────

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (client) return client;

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      '[ImageGen] EXPO_PUBLIC_GEMINI_API_KEY is missing. Cannot generate images.',
    );
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

// ─── Core Image Generation ───────────────────────────

/**
 * Generate an image from a text prompt using Nano Banana.
 * Returns base64-encoded image data.
 */
export async function generateImage(
  prompt: string,
  config: ImageConfig = {},
): Promise<GeneratedImage | null> {
  const ai = getClient();
  const modelId = IMAGE_MODELS[config.model || 'fast'];

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: config.aspectRatio || '9:16',
          imageSize: config.imageSize || '2K',
        },
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      console.error('[ImageGen] No parts in response');
      return null;
    }

    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart?.inlineData) {
      console.error('[ImageGen] No image data in response');
      return null;
    }

    return {
      base64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
      prompt,
      model: modelId,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[ImageGen] Generation failed:', error);
    return null;
  }
}

// ─── Screen Mockup Generator ─────────────────────────

/**
 * Generate a mobile app screen mockup with Vox branding baked in.
 * Used by the design pipeline to create screen designs for review.
 */
export async function generateScreenMockup(
  input: ScreenMockupInput,
  config: ImageConfig = {},
): Promise<GeneratedImage | null> {
  const elements = input.elements?.length
    ? `Key UI elements: ${input.elements.join(', ')}.`
    : '';

  const flow = input.userFlow
    ? `User flow context: ${input.userFlow}.`
    : '';

  const lang = input.targetLanguage
    ? `Show content in ${input.targetLanguage} (this is the language being learned).`
    : '';

  const prompt = `
Design a mobile app screen mockup for "${input.screenName}".

${VOX_BRAND_CONTEXT}

SCREEN DESCRIPTION: ${input.description}
${elements}
${flow}
${lang}

REQUIREMENTS:
- Mobile phone aspect ratio (9:16)
- Show realistic UI with actual text content (not lorem ipsum)
- Include status bar, navigation elements
- Follow the dark theme with electric blue accents
- Professional and polished — this is a premium paid app
- Show the screen as it would appear on an iPhone
`.trim();

  return generateImage(prompt, {
    aspectRatio: '9:16',
    imageSize: '2K',
    ...config,
  });
}

// ─── Illustration Generator ──────────────────────────

/**
 * Generate a thematic illustration for lessons, cards, or scenarios.
 * Lighter than a full screen mockup — used for content visuals.
 */
export async function generateIllustration(
  subject: string,
  style: 'professional' | 'cultural' | 'scenario' = 'professional',
  config: ImageConfig = {},
): Promise<GeneratedImage | null> {
  const styleGuide = {
    professional: 'Clean, minimal illustration suitable for a premium app. Muted dark tones with blue accents.',
    cultural: 'Culturally rich illustration with authentic visual elements. Warm and inviting.',
    scenario: 'Realistic scene depicting the described professional scenario. Photorealistic with slight artistic style.',
  };

  const prompt = `
${styleGuide[style]}

Subject: ${subject}

Style constraints:
- Dark background (#0A0E1A to #1A1F3A gradient)
- Professional and respectful — no stereotypes or caricatures
- Suitable for a language learning app used by doctors, lawyers, executives
- High quality, detailed, premium feel
`.trim();

  return generateImage(prompt, {
    aspectRatio: '1:1',
    imageSize: '1K',
    ...config,
  });
}
