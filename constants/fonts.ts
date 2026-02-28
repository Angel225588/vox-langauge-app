/**
 * Vox Language App — Font System
 *
 * Humanist + Warm pairing:
 *   Display: DM Sans (geometric humanist, confident, modern)
 *   Body:    Source Sans 3 (Adobe, designed for readability at all sizes)
 *   Mono:    DM Mono (monospace sibling of DM Sans, phonetics/technical)
 *
 * IMPORTANT — React Native rule:
 * When using a custom `fontFamily`, do NOT also set `fontWeight`.
 * The weight is embedded in the font file name (e.g. DMSans_700Bold).
 */

export const fonts = {
  // Display — DM Sans (headlines, brand, large text)
  display: {
    regular:   'DMSans_400Regular',
    medium:    'DMSans_500Medium',
    semibold:  'DMSans_600SemiBold',
    bold:      'DMSans_700Bold',
    extrabold: 'DMSans_800ExtraBold',
  },

  // Body — Source Sans 3 (UI text, descriptions, paragraphs)
  body: {
    regular:  'SourceSans3_400Regular',
    medium:   'SourceSans3_500Medium',
    semibold: 'SourceSans3_600SemiBold',
    bold:     'SourceSans3_700Bold',
  },

  // Mono — DM Mono (phonetics, code, technical)
  mono: {
    regular: 'DMMono_400Regular',
    medium:  'DMMono_500Medium',
  },
} as const;
