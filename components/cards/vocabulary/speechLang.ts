/**
 * Shared speech language utility for vocabulary cards.
 * Gets the target language from onboarding and maps to Speech.speak language code.
 */

const SPEECH_LANG_MAP: Record<string, string> = {
  french: 'fr-FR', spanish: 'es-ES', english: 'en-US',
  german: 'de-DE', italian: 'it-IT', portuguese: 'pt-BR',
  fr: 'fr-FR', es: 'es-ES', en: 'en-US', de: 'de-DE', it: 'it-IT', pt: 'pt-BR',
};

/**
 * Get the Speech.speak language code for the user's target language.
 * Reads from the onboarding V3 store (zustand).
 */
export function getTargetSpeechLang(): string {
  try {
    const { useOnboardingV3 } = require('@/hooks/useOnboardingV3');
    const lang = useOnboardingV3.getState()?.target_language;
    if (lang && SPEECH_LANG_MAP[lang]) return SPEECH_LANG_MAP[lang];
  } catch {}
  return 'fr-FR'; // Default fallback
}
