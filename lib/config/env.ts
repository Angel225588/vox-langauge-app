/**
 * Environment Configuration
 *
 * Validates and exports environment variables with proper type safety.
 * Throws helpful errors if required variables are missing.
 */

/**
 * Get environment variable with validation
 */
function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env file and ensure ${key} is set.`
    );
  }

  return value || '';
}

/**
 * Environment configuration
 */
export const ENV = {
  // Supabase
  SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),

  // Gemini AI (optional for now)
  GEMINI_API_KEY: getEnvVar('EXPO_PUBLIC_GEMINI_API_KEY', false),

  // OpenAI (optional - for speech-to-text with Whisper)
  OPENAI_API_KEY: getEnvVar('EXPO_PUBLIC_OPENAI_API_KEY', false),

  // Helpers
  get isSupabaseConfigured() {
    return !!(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
  },

  get isGeminiConfigured() {
    return !!this.GEMINI_API_KEY;
  },

  get isOpenAIConfigured() {
    return !!this.OPENAI_API_KEY;
  },
} as const;

/**
 * Validate environment on app start
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ENV.SUPABASE_URL) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is not set');
  }

  if (!ENV.SUPABASE_ANON_KEY) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
  }

  // Validate URL format
  if (ENV.SUPABASE_URL && !ENV.SUPABASE_URL.startsWith('https://')) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL must start with https://');
  }

  // Gemini is optional, so just warn if not set
  if (!ENV.GEMINI_API_KEY) {
    console.warn('⚠️  EXPO_PUBLIC_GEMINI_API_KEY is not set. AI features will be disabled.');
  }

  // OpenAI is optional, so just warn if not set
  if (!ENV.OPENAI_API_KEY) {
    console.warn('⚠️  EXPO_PUBLIC_OPENAI_API_KEY is not set. Speech-to-text features will be disabled.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log environment status (safe - doesn't log secrets)
 */
export function logEnvironmentStatus(): void {
  console.log('🔧 Environment Configuration:');
  console.log('  Supabase URL:', ENV.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  Supabase Key:', ENV.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('  Gemini API:', ENV.GEMINI_API_KEY ? '✅ Set' : '⚠️  Not set (optional)');
  console.log('  OpenAI API:', ENV.OPENAI_API_KEY ? '✅ Set' : '⚠️  Not set (optional)');
}
