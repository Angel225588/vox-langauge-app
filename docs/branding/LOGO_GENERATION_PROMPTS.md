# Vox Logo Generation Prompts

**Purpose**: These prompts are optimized for generating high-quality logo concepts using Gemini 2.5 Flash Image (Nano Banana) API.

**Model**: `gemini-2.5-flash-image`

---

## How to Generate Logos

### Using Google AI Studio (Easiest)

1. Go to https://aistudio.google.com
2. Select "Gemini 2.5 Flash Image" model
3. Paste any prompt below
4. Click Generate
5. Download the generated image

### Using the API (JavaScript/TypeScript)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);

async function generateLogo(prompt: string, filename: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  for (const part of result.response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync(`./assets/branding/${filename}.png`, buffer);
      console.log(`Saved: ${filename}.png`);
    }
  }
}
```

---

## Logo 1: "The Conversation Circle" (Round Table)

### Prompt (Copy This Exactly)

```
Create a minimalist logo icon for a language learning app called "Vox".

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

Technical: Square canvas, centered composition, 1024x1024 pixels, clean edges suitable for scaling down to 48px
```

### Alternative Prompt (Gradient Version)

```
Create a modern logo icon for "Vox" language learning app.

Design: A circular shape representing a meeting table viewed from above. Position 5 small glowing dots around the perimeter like people in a discussion. In the center, draw 3 elegant curved lines representing sound waves. The dots should have a subtle glow effect, and one should be highlighted as the "speaker".

Style:
- Modern app icon aesthetic
- Soft gradients from indigo (#6366F1) to purple (#8B5CF6)
- Neomorphic glow effects
- Dark background (#0A0E1A)
- Premium, polished look

Technical: 1024x1024, square format, professional quality
```

---

## Logo 2: "Vox Crystal" (Main Brand Logo)

### Prompt (Copy This Exactly)

```
Create a sophisticated logo icon for a language learning app called "Vox".

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

Technical: 1024x1024 square canvas, centered, high-contrast edges, suitable for app icon
```

### Alternative Prompt (3D Style)

```
Design a 3D-style gem logo for "Vox" language app.

A hexagonal crystal floating with a gentle glow around it. The gem is transparent with an indigo-to-purple gradient. Inside the crystal, you can see 3 white sound wave curves as if frozen inside the gem. The crystal has subtle facets and catches light from above. A soft purple glow surrounds the crystal.

Dark space background (#0A0E1A). Premium, magical quality. The crystal represents voice as something precious and valuable.

1024x1024, square format, centered.
```

---

## Logo 3: "V-Wave" (Minimal Letter Logo)

### Prompt (Copy This Exactly)

```
Create a minimalist typographic logo for "Vox".

Design: The letter "V" transformed into a visual representation of sound. The left stroke of the V is a clean straight diagonal line. The right stroke curves elegantly into a sound wave pattern with 2-3 gentle undulations. The overall shape still clearly reads as the letter V.

Style:
- Ultra minimalist
- Single continuous stroke
- Modern and tech-forward
- Works in single color
- Highly scalable from favicon to billboard

Colors:
- Option 1: Solid indigo #6366F1
- Option 2: Gradient from indigo #6366F1 to purple #8B5CF6 along the wave
- Background: Transparent

Mood: Modern, progressive, simple, voice-focused

Technical: 1024x1024, the V should occupy about 70% of the canvas height, centered, vector-clean edges
```

### Alternative Prompt (With Motion)

```
Design a dynamic letter logo for "Vox" language app.

The letter V where the right leg transforms into flowing sound waves, suggesting voice and speech in motion. The left leg is solid and grounding. Where the two legs meet at the bottom, there's a subtle glow point. The sound wave trails off to the right with decreasing amplitude.

Indigo (#6366F1) to purple (#8B5CF6) gradient. White or transparent background. Minimal, modern, would work as app icon or wordmark.

1024x1024, centered, clean vector style.
```

---

## Logo 4: "Speech Bubble Echo" (Bonus Concept)

### Prompt

```
Create a contemporary logo for "Vox" language learning app.

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
- Particles: Teal accents #06D6A0
- Background: Transparent

Mood: Communicative, friendly, modern, approachable

Technical: 1024x1024, centered, suitable for small sizes
```

---

## Wordmark Prompts

### "Vox" Wordmark - Bold

```
Create a typographic wordmark for "Vox".

The word "vox" in lowercase, using a bold geometric sans-serif font similar to Poppins or Montserrat Bold. The letters should have slightly rounded terminals for approachability. The 'o' could optionally have a small sound wave detail inside or a subtle glow. Letter spacing slightly increased (+5%) for premium feel.

Colors: Gradient from indigo #6366F1 to purple #8B5CF6 applied horizontally across the word.

Clean, modern, professional, suitable for app header. Dark background (#0A0E1A) preferred.

Wide format canvas, text centered.
```

### "Vox" Wordmark - With Icon

```
Create a logo lockup combining icon and wordmark for "Vox".

Left side: A hexagonal crystal shape with sound waves inside (indigo/purple gradient).
Right side: The word "vox" in lowercase Poppins Bold.

The icon and text should be proportionally balanced. Small gap between icon and text. Both elements aligned vertically centered.

Colors: Crystal in indigo-purple gradient, text in white or light gray.
Background: Dark navy #0A0E1A

Wide format, premium app branding style.
```

---

## App Icon Variations

### Dark Background Version

```
Create an app icon for "Vox" language learning app.

Design: A hexagonal crystal with sound waves inside, centered on a square canvas.
Background: Deep space blue-black #0A0E1A
Icon: Indigo #6366F1 to purple #8B5CF6 gradient hexagon
Sound waves: White
Add a subtle outer glow around the crystal

iOS app icon style, 1024x1024, with the icon taking up about 70% of the space.
```

### Light Background Version

```
Create a light-mode app icon for "Vox".

Design: Hexagonal crystal with 3 sound wave curves inside.
Background: White or very light gray #F9FAFB
Icon: Filled with indigo-to-purple gradient
Sound waves: Darker purple or kept as negative space

Clean, modern, suitable for light mode UI. 1024x1024.
```

---

## Color Reference

| Color Name | Hex | Use |
|------------|-----|-----|
| Vox Indigo | #6366F1 | Primary brand color |
| Vox Purple | #8B5CF6 | Gradient end/accent |
| Deep Space | #0A0E1A | Dark backgrounds |
| Teal | #06D6A0 | Success/accent |
| White | #F9FAFB | Text/light elements |

---

## Tips for Best Results

1. **Run each prompt 3-5 times** - AI generation varies, pick the best result
2. **Use Google AI Studio** - More control over parameters than API
3. **Request PNG format** - For transparent backgrounds
4. **Upscale if needed** - Use tools like Upscale.media for higher resolution
5. **Iterate** - Adjust prompts based on initial results

---

## Expected Output

After generating, you should have:

- [ ] `vox-logo-conversation-circle.png` - Round table design
- [ ] `vox-logo-crystal.png` - Hexagon crystal (main logo)
- [ ] `vox-logo-v-wave.png` - Minimal V with sound wave
- [ ] `vox-logo-speech-bubble.png` - Speech bubble echo
- [ ] `vox-wordmark.png` - Text logo
- [ ] `vox-app-icon-dark.png` - App icon on dark
- [ ] `vox-app-icon-light.png` - App icon on light

---

**Sources**:
- [Gemini Image Generation API Documentation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Google Developers Blog - Gemini 2.5 Flash Image](https://developers.googleblog.com/en/introducing-gemini-2-5-flash-image/)
