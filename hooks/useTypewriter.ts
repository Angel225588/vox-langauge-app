import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Options for the useTypewriter hook
 */
export interface TypewriterOptions {
  /** Milliseconds per character (default: 30) */
  speed?: number;
  /** Initial delay before starting animation in ms (default: 0) */
  delay?: number;
  /** Callback when typing animation completes */
  onComplete?: () => void;
  /** Whether to animate (default: true). If false, shows full text immediately */
  enabled?: boolean;
}

/**
 * Return type for the useTypewriter hook
 */
export interface TypewriterResult {
  /** The current visible text */
  displayText: string;
  /** Whether the animation is still typing */
  isTyping: boolean;
  /** Whether the animation has completed */
  isComplete: boolean;
  /** Restart the animation from the beginning */
  reset: () => void;
  /** Skip to show the full text immediately */
  skip: () => void;
}

/**
 * A hook that creates a typewriter text animation effect.
 * Reveals text character by character with configurable speed.
 *
 * @param text - The full text to animate
 * @param options - Configuration options
 * @returns TypewriterResult with display text and control functions
 *
 * @example
 * ```tsx
 * const { displayText, isTyping } = useTypewriter("Hello world!", { speed: 50 });
 * return <Text>{displayText}{isTyping && '|'}</Text>;
 * ```
 */
export function useTypewriter(
  text: string,
  options: TypewriterOptions = {}
): TypewriterResult {
  const { speed = 30, delay = 0, onComplete, enabled = true } = options;

  const [displayText, setDisplayText] = useState(enabled ? '' : text);
  const [isTyping, setIsTyping] = useState(enabled && text.length > 0);
  const [isComplete, setIsComplete] = useState(!enabled || text.length === 0);

  // Refs to track current state without causing re-renders
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSkippedRef = useRef(false);
  const textRef = useRef(text);
  const onCompleteRef = useRef(onComplete);

  // Keep refs up to date
  onCompleteRef.current = onComplete;

  // Cleanup function
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  // Type the next character
  const typeNextChar = useCallback(() => {
    if (isSkippedRef.current) return;

    const currentText = textRef.current;
    const nextIndex = currentIndexRef.current + 1;

    if (nextIndex <= currentText.length) {
      currentIndexRef.current = nextIndex;
      setDisplayText(currentText.slice(0, nextIndex));

      if (nextIndex < currentText.length) {
        // Schedule next character
        timeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        // Typing complete
        setIsTyping(false);
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    }
  }, [speed]);

  // Start the typing animation
  const startTyping = useCallback(() => {
    if (!enabled || text.length === 0) {
      setDisplayText(text);
      setIsTyping(false);
      setIsComplete(true);
      return;
    }

    isSkippedRef.current = false;
    currentIndexRef.current = 0;
    textRef.current = text;
    setDisplayText('');
    setIsTyping(true);
    setIsComplete(false);

    if (delay > 0) {
      delayTimeoutRef.current = setTimeout(typeNextChar, delay);
    } else {
      typeNextChar();
    }
  }, [text, enabled, delay, typeNextChar]);

  // Reset the animation
  const reset = useCallback(() => {
    clearTimeouts();
    startTyping();
  }, [clearTimeouts, startTyping]);

  // Skip to show full text immediately
  const skip = useCallback(() => {
    clearTimeouts();
    isSkippedRef.current = true;
    currentIndexRef.current = textRef.current.length;
    setDisplayText(textRef.current);
    setIsTyping(false);
    setIsComplete(true);
    onCompleteRef.current?.();
  }, [clearTimeouts]);

  // Handle text changes
  useEffect(() => {
    // If text changed, restart the animation
    if (text !== textRef.current) {
      clearTimeouts();
      textRef.current = text;

      if (!enabled) {
        // If not enabled, show full text immediately
        setDisplayText(text);
        setIsTyping(false);
        setIsComplete(true);
      } else if (text.length === 0) {
        // Empty text
        setDisplayText('');
        setIsTyping(false);
        setIsComplete(true);
      } else {
        // Start new animation
        isSkippedRef.current = false;
        currentIndexRef.current = 0;
        setDisplayText('');
        setIsTyping(true);
        setIsComplete(false);

        if (delay > 0) {
          delayTimeoutRef.current = setTimeout(typeNextChar, delay);
        } else {
          typeNextChar();
        }
      }
    }
  }, [text, enabled, delay, typeNextChar, clearTimeouts]);

  // Handle enabled changes
  useEffect(() => {
    if (!enabled) {
      // Show full text immediately when disabled
      clearTimeouts();
      isSkippedRef.current = true;
      setDisplayText(text);
      setIsTyping(false);
      setIsComplete(true);
    }
  }, [enabled, text, clearTimeouts]);

  // Initial start
  useEffect(() => {
    startTyping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    displayText,
    isTyping,
    isComplete,
    reset,
    skip,
  };
}

export default useTypewriter;
