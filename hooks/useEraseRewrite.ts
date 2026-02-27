/**
 * useEraseRewrite Hook
 *
 * Animates a text transition using an erase→rewrite effect:
 * 1. Current text erases backwards (20ms/char)
 * 2. Brief pause (300ms)
 * 3. New text types forward (30ms/char)
 *
 * Used by CondensedStairCard for staircase refinement animation
 * when AI-generated titles replace skeleton titles.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const ERASE_SPEED_MS = 20;
const REWRITE_SPEED_MS = 30;
const PAUSE_BETWEEN_MS = 300;
const INITIAL_DELAY_MS = 500;

interface UseEraseRewriteResult {
  /** The text to display at the current animation frame */
  displayText: string;
  /** Whether the erase→rewrite animation is currently playing */
  isAnimating: boolean;
}

/**
 * Hook that manages an erase→rewrite text animation.
 *
 * When `newText` transitions from undefined to a string value,
 * the hook erases the current text character by character, pauses,
 * then types the new text character by character.
 *
 * @param currentText - The initial/skeleton text currently shown
 * @param newText - The refined text to animate to (undefined = no animation)
 * @returns displayText (what to render) and isAnimating flag
 *
 * @example
 * ```tsx
 * const { displayText, isAnimating } = useEraseRewrite(
 *   "Patient Consults: Essentials",
 *   refinedTitle // undefined until AI content arrives
 * );
 * return <Text>{displayText}</Text>;
 * ```
 */
export function useEraseRewrite(
  currentText: string,
  newText?: string
): UseEraseRewriteResult {
  const [displayText, setDisplayText] = useState(currentText);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef<'idle' | 'erase' | 'pause' | 'rewrite'>('idle');
  const prevNewTextRef = useRef<string | undefined>(undefined);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Watch for newText going from undefined → string
  useEffect(() => {
    const wasUndefined = prevNewTextRef.current === undefined;
    prevNewTextRef.current = newText;

    // Only trigger when newText first appears and differs from current
    if (!wasUndefined || !newText || newText === currentText) return;

    // Start the animation sequence after a short delay
    const delayTimer = setTimeout(() => {
      startEraseRewrite(currentText, newText);
    }, INITIAL_DELAY_MS);

    return () => clearTimeout(delayTimer);
  }, [newText]);

  // Update display text if currentText changes and we're not animating
  useEffect(() => {
    if (phaseRef.current === 'idle') {
      setDisplayText(currentText);
    }
  }, [currentText]);

  const startEraseRewrite = useCallback((fromText: string, toText: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnimating(true);
    phaseRef.current = 'erase';
    let charCount = fromText.length;

    // Phase 1: Erase (remove chars from end)
    timerRef.current = setInterval(() => {
      charCount--;
      if (charCount <= 0) {
        // Erase complete
        setDisplayText('');
        if (timerRef.current) clearInterval(timerRef.current);

        // Phase 2: Pause
        phaseRef.current = 'pause';
        timerRef.current = setTimeout(() => {
          // Phase 3: Rewrite (add chars from start)
          phaseRef.current = 'rewrite';
          let writeIndex = 0;

          timerRef.current = setInterval(() => {
            writeIndex++;
            setDisplayText(toText.slice(0, writeIndex));

            if (writeIndex >= toText.length) {
              // Animation complete
              if (timerRef.current) clearInterval(timerRef.current);
              timerRef.current = null;
              phaseRef.current = 'idle';
              setIsAnimating(false);
            }
          }, REWRITE_SPEED_MS);
        }, PAUSE_BETWEEN_MS) as unknown as NodeJS.Timeout;
      } else {
        setDisplayText(fromText.slice(0, charCount));
      }
    }, ERASE_SPEED_MS);
  }, []);

  return { displayText, isAnimating };
}

/**
 * Simplified version for description text — crossfade instead of char-by-char.
 * Returns the text to display and a flag indicating if transitioning.
 */
export function useDescriptionCrossfade(
  currentDesc: string,
  newDesc?: string
): { displayText: string; isFading: boolean } {
  const [displayText, setDisplayText] = useState(currentDesc);
  const [isFading, setIsFading] = useState(false);
  const prevRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const wasUndefined = prevRef.current === undefined;
    prevRef.current = newDesc;

    if (!wasUndefined || !newDesc || newDesc === currentDesc) return;

    // Trigger crossfade after delay matching the erase→rewrite timing
    setIsFading(true);
    const timer = setTimeout(() => {
      setDisplayText(newDesc);
      setIsFading(false);
    }, INITIAL_DELAY_MS + 600); // Approximate time for erase phase to finish

    return () => clearTimeout(timer);
  }, [newDesc]);

  // Update if current changes and not fading
  useEffect(() => {
    if (!isFading) {
      setDisplayText(currentDesc);
    }
  }, [currentDesc]);

  return { displayText, isFading };
}
