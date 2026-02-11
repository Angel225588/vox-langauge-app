/**
 * AI Prompt Input Sanitization
 *
 * Sanitizes user inputs before they are interpolated into AI prompts
 * to prevent prompt injection attacks and ensure safe operation.
 */

/** Default maximum length for sanitized inputs */
const DEFAULT_MAX_LENGTH = 500;

/**
 * Patterns that indicate prompt injection attempts.
 * These are case-insensitive substrings commonly used to hijack AI prompts.
 */
const INJECTION_PATTERNS = [
  'ignore previous',
  'ignore above',
  'ignore all previous',
  'disregard previous',
  'disregard above',
  'disregard all',
  'forget previous',
  'forget your instructions',
  'system prompt',
  'system message',
  'you are now',
  'act as',
  'pretend you are',
  'new instructions',
  'override instructions',
  'ignore instructions',
  'reveal your prompt',
  'show your prompt',
  'print your instructions',
  'output your system',
  'repeat the above',
  'translate the above',
  '{{',
  '}}',
  '<|',
  '|>',
  '[INST]',
  '[/INST]',
  '<<SYS>>',
  '<</SYS>>',
];

/**
 * Sanitizes a user input string before it is interpolated into an AI prompt.
 *
 * - Strips control characters and unicode escape sequences
 * - Removes prompt injection patterns
 * - Limits string length
 * - Trims whitespace
 *
 * @param input - The raw user input string
 * @param maxLength - Maximum allowed character length (default 500)
 * @returns Sanitized string safe for prompt interpolation
 */
export function sanitizePromptInput(
  input: string | undefined | null,
  maxLength: number = DEFAULT_MAX_LENGTH
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // 1. Remove control characters (C0 and C1 blocks, except newline and tab)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // 2. Remove unicode escape sequences (e.g., \u0041, \x41)
  sanitized = sanitized.replace(/\\u[0-9a-fA-F]{4}/g, '');
  sanitized = sanitized.replace(/\\x[0-9a-fA-F]{2}/g, '');

  // 3. Remove zero-width and invisible unicode characters
  sanitized = sanitized.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g, '');

  // 4. Remove prompt injection patterns (case-insensitive)
  const lowerSanitized = sanitized.toLowerCase();
  for (const pattern of INJECTION_PATTERNS) {
    if (lowerSanitized.includes(pattern.toLowerCase())) {
      // Replace the pattern with empty string (case-insensitive)
      sanitized = sanitized.replace(
        new RegExp(escapeRegExp(pattern), 'gi'),
        ''
      );
    }
  }

  // 5. Collapse multiple whitespace/newlines into single spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  // 6. Trim whitespace
  sanitized = sanitized.trim();

  // 7. Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Escapes special regex characters in a string for use in RegExp constructor.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
