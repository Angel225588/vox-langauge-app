/**
 * Generate Voice Practice Flow Mockups using Nano Banana
 *
 * Run: npx tsx scripts/generate-call-flow-mockups.ts
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing EXPO_PUBLIC_GEMINI_API_KEY in environment');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL = 'gemini-3.1-flash-image-preview'; // Nano Banana 2
const OUTPUT_DIR = path.join(__dirname, '..', 'mockups', 'screens', 'voice-practice');

const BRAND = `
BRAND: Vox Language — premium professional language learning app.
THEME: Dark neomorphic UI, mobile phone screen (9:16 ratio).
COLORS: Background gradient from #0A0E1A (deep navy) to #0D1B2A (dark blue).
  Primary accent: #0036FF (electric blue). Secondary: #06D6A0 (teal/green).
  Cards: #1A1F3A with subtle glass morphism. Text: #F9FAFB (white), #D1D5DB (gray).
STYLE: Clean, minimal, professional. Premium fintech aesthetic.
  Rounded corners (16-24px), subtle shadows, glass accents.
  NO childish elements. Think: a tool for doctors and executives.
FONT: Sans-serif, clean weights. Status bar at top.
`;

const SCREENS = [
  {
    name: '01-scenario-selection',
    prompt: `${BRAND}
Design a mobile screen: "Voice Practice — Scenario Selection"

LAYOUT:
- Header: "Practice Conversations" with a subtle mic icon
- Subtitle: "Choose a scenario to practice" in gray
- Grid of scenario cards (2 columns), each card has:
  - An icon/emoji on the left
  - Scenario name: "Tour Guiding", "Menu & Cuisine", "Guest Check-in", "Complaint Resolution"
  - Difficulty badge (Beginner/Intermediate)
  - Some cards have a green checkmark overlay (completed)
  - "Tour Guiding" card is highlighted with blue border (selected)
- Bottom: Tab bar with Home, Practice (active, blue), Profile icons

Show realistic French hospitality scenarios. Professional dark theme.`,
  },
  {
    name: '02-mission-briefing',
    prompt: `${BRAND}
Design a mobile screen: "Mission Briefing" before a voice practice call.

LAYOUT:
- Top: Back arrow + "Mission Briefing" title
- Hero section with gradient card containing:
  - "YOUR MISSION" label in small caps, electric blue
  - Mission title: "Guide a Tourist Through the Louvre" in bold white
  - Role badge: "You are: Tour Guide" with person icon
  - Who you'll talk to: "Sophie — American Tourist" with small avatar circle
- Goal block (dark card):
  - "OBJECTIVES" header
  - Checklist items (unchecked):
    □ Greet the tourist warmly in French
    □ Describe 3 artworks in simple terms
    □ Handle questions about directions
    □ Recommend the gift shop
- Bottom section: Two CTAs side by side:
  - "See Key Phrases" button (outlined, secondary)
  - "Start Call" button (solid blue, primary, with phone icon)

Professional, focused, no clutter. The user should feel prepared.`,
  },
  {
    name: '03-vocabulary-preview',
    prompt: `${BRAND}
Design a mobile screen: "Key Phrases" vocabulary preview before a voice call.

LAYOUT:
- Top: Back arrow + "Key Phrases" + "Tour Guiding" subtitle
- Section: "PHRASES YOU'LL NEED" in small caps
- List of 6-8 phrase cards, each with:
  - French phrase in bold: "Bienvenue au Louvre"
  - English translation below in gray: "Welcome to the Louvre"
  - Small audio play button on the right (circle with play icon)
  - Subtle divider between phrases
- Phrases include: greetings, artwork descriptions, directions, recommendations
- Bottom: Large "Start the Call" button (solid blue gradient, full width)
  - Below it: "You can review these during the call" in small gray text

Clean, scannable, professional. Each phrase should be easy to read quickly.`,
  },
  {
    name: '04-live-call',
    prompt: `${BRAND}
Design a mobile screen: "Live Voice Call" — active AI conversation.

LAYOUT:
- Full screen gradient background: dark navy (#0A0E1A) at top fading to slightly lighter blue (#0D1B2A) at bottom
- Top bar: Timer "02:34" + "Tour Guiding" label + small end call button (red circle)
- Center: Large circular avatar (Sophie — the tourist) with:
  - Glowing blue border (agent is speaking)
  - Name "Sophie" below the avatar
  - Role "American Tourist" in small gray text
- Mini todo checklist (floating, semi-transparent, top-right):
  - ✓ Greet the tourist (green check, done)
  - ✓ Describe artwork (green check, done)
  - ○ Handle directions (current, white)
  - ○ Recommend gift shop (gray, upcoming)
- Bottom half: Live transcript area (scrollable):
  - User messages aligned right (blue bubble): "Le tableau date du seizième siècle"
  - Agent messages aligned left (dark card): "Oh interesting! Can you tell me more about it?"
  - Most recent message at bottom
- Bottom: Pulsing blue microphone button (large, centered) showing user is speaking

Immersive, focused, no distracting elements. The transcript and todo are the key information.`,
  },
  {
    name: '05-results',
    prompt: `${BRAND}
Design a mobile screen: "Call Results" — post-call feedback summary.

LAYOUT:
- Top: "Session Complete" with a subtle checkmark icon
- Score section: Large circular ring showing overall score "78/100" in center
  - Ring color: gradient blue to teal
  - Below: "Good performance" label
- 4 KPI mini cards in a 2x2 grid:
  - Articulation: 82 (with small bar)
  - Fluency: 71 (with small bar)
  - Communication: 85 (with small bar)
  - Scenario: 74 (with small bar)
- Points earned card (glass):
  - "+45 points" in large teal text
  - "Tour Guiding scenario completed"
- Mission checklist recap:
  - ✓ Greet the tourist (completed)
  - ✓ Describe artworks (completed)
  - ✓ Handle directions (completed)
  - ✗ Recommend gift shop (missed — in orange)
- Quick feedback: "Strong greeting and descriptions. Try to mention the gift shop next time."
- Bottom CTAs:
  - "See Detailed Feedback" (outlined)
  - "Done" (solid blue)

Professional results screen. Data-driven, not gamified.`,
  },
  {
    name: '06-completion',
    prompt: `${BRAND}
Design a mobile screen: "Scenario Completed" — celebration/completion screen.

LAYOUT:
- Full screen dark gradient background
- Center: Large confetti burst effect (subtle, professional — gold and blue particles)
- Below confetti: Large checkmark in a circle (gradient blue)
- Title: "Tour Guiding Complete!" in bold white
- Subtitle: "You've mastered this scenario" in gray
- Stats row: "4/4 objectives" | "+45 pts" | "2:34 call"
- CTA: "Continue Practicing" large blue button
- Below: "Back to scenarios" link in gray

Celebratory but PROFESSIONAL. Think achievement unlocked in a premium app, not a kids game.
Confetti should be subtle gold/blue particles, not cartoon style.`,
  },
];

async function generateMockup(screen: { name: string; prompt: string }) {
  console.log(`Generating: ${screen.name}...`);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: screen.prompt,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      console.error(`  No parts in response for ${screen.name}`);
      return false;
    }

    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart?.inlineData) {
      console.error(`  No image data for ${screen.name}`);
      return false;
    }

    // Save image
    const imgPath = path.join(OUTPUT_DIR, `${screen.name}.png`);
    fs.writeFileSync(imgPath, Buffer.from(imagePart.inlineData.data, 'base64'));

    // Save metadata
    const metaPath = path.join(OUTPUT_DIR, `${screen.name}.json`);
    fs.writeFileSync(metaPath, JSON.stringify({
      name: screen.name,
      prompt: screen.prompt,
      model: MODEL,
      generatedAt: new Date().toISOString(),
    }, null, 2));

    console.log(`  ✓ Saved: ${imgPath}`);
    return true;
  } catch (error: any) {
    console.error(`  ✗ Failed: ${screen.name} — ${error.message}`);
    return false;
  }
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\nGenerating ${SCREENS.length} Voice Practice Flow mockups...\n`);

  let success = 0;
  for (const screen of SCREENS) {
    const ok = await generateMockup(screen);
    if (ok) success++;
    // Small delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nDone: ${success}/${SCREENS.length} mockups generated`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
