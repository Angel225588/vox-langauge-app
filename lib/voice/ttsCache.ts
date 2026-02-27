/**
 * TTS Audio Cache Service
 *
 * Hybrid caching system for TTS audio:
 * 1. Check local cache (fastest, offline-capable)
 * 2. Check cloud cache (shared across all users)
 * 3. Generate new audio only if not cached
 *
 * Cost savings: Instead of generating "Bonjour" 10,000 times,
 * we generate it once and share across all users.
 *
 * @example
 * ```typescript
 * import { ttsCache } from '@/lib/voice';
 *
 * // Get cached audio or generate new
 * const audioUri = await ttsCache.getAudio('Bonjour', 'fr');
 *
 * // Pre-warm cache with vocabulary
 * await ttsCache.preloadWords(['hola', 'gracias', 'por favor'], 'es');
 * ```
 */

import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { supabase } from '@/lib/db/supabase';
import { SupportedLanguage } from './types';

// =============================================================================
// Types
// =============================================================================

export type ContentType = 'word' | 'phrase' | 'sentence';

export interface CacheEntry {
  cacheKey: string;
  text: string;
  language: SupportedLanguage;
  contentType: ContentType;
  localUri?: string;
  cloudUri?: string;
  storagePath?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CacheStats {
  localEntries: number;
  localSizeBytes: number;
  cloudHits: number;
  cloudMisses: number;
  generationsAvoided: number;
}

interface TTSCacheRow {
  id: string;
  cache_key: string;
  text: string;
  language: string;
  content_type: string;
  storage_path: string;
  duration_ms: number | null;
  file_size_bytes: number | null;
  voice_name: string;
  voice_provider: string;
  speaking_rate: number;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  is_curated: boolean;
  created_by: string | null;
}

// =============================================================================
// Constants
// =============================================================================

const LOCAL_CACHE_DIR = `${FileSystem.cacheDirectory}tts_cache/`;
const CLOUD_BUCKET = 'tts-cache';
const CACHE_EXPIRY_DAYS = 30;
const MAX_LOCAL_CACHE_SIZE_MB = 50; // Max local cache size

// Voice names for cache key generation (must match googleTTS.ts)
const VOICE_NAMES: Record<SupportedLanguage, string> = {
  en: 'en-US-Neural2-F',
  es: 'es-ES-Neural2-A',
  fr: 'fr-FR-Neural2-A',
  de: 'de-DE-Neural2-A',
  it: 'it-IT-Neural2-A',
  pt: 'pt-BR-Neural2-A',
};

// =============================================================================
// Cache Key Generation
// =============================================================================

/**
 * Generate a unique cache key for text
 */
export function generateCacheKey(
  text: string,
  language: SupportedLanguage,
  contentType: ContentType = 'word'
): string {
  const normalizedText = text.toLowerCase().trim();
  return `${language}:${contentType}:${normalizedText}`;
}

/**
 * Determine content type based on text
 */
export function detectContentType(text: string): ContentType {
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount === 1) return 'word';
  if (wordCount <= 5) return 'phrase';
  return 'sentence';
}

// =============================================================================
// TTS Cache Service
// =============================================================================

class TTSCacheService {
  private localCacheIndex: Map<string, CacheEntry> = new Map();
  private isInitialized = false;
  private stats: CacheStats = {
    localEntries: 0,
    localSizeBytes: 0,
    cloudHits: 0,
    cloudMisses: 0,
    generationsAvoided: 0,
  };

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure local cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(LOCAL_CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(LOCAL_CACHE_DIR, { intermediates: true });
      }

      // Load local cache index
      await this.loadLocalCacheIndex();

      this.isInitialized = true;
      console.log(`[TTSCache] Initialized with ${this.localCacheIndex.size} local entries`);
    } catch (error) {
      console.error('[TTSCache] Initialization error:', error);
    }
  }

  /**
   * Load local cache index from filesystem
   */
  private async loadLocalCacheIndex(): Promise<void> {
    try {
      const indexPath = `${LOCAL_CACHE_DIR}index.json`;
      const indexInfo = await FileSystem.getInfoAsync(indexPath);

      if (indexInfo.exists) {
        const content = await FileSystem.readAsStringAsync(indexPath);
        const entries: CacheEntry[] = JSON.parse(content);

        // Validate entries still exist
        for (const entry of entries) {
          if (entry.localUri) {
            const fileInfo = await FileSystem.getInfoAsync(entry.localUri);
            if (fileInfo.exists) {
              this.localCacheIndex.set(entry.cacheKey, entry);
            }
          }
        }
      }

      this.stats.localEntries = this.localCacheIndex.size;
    } catch (error) {
      console.warn('[TTSCache] Error loading local cache index:', error);
      this.localCacheIndex.clear();
    }
  }

  /**
   * Save local cache index to filesystem
   */
  private async saveLocalCacheIndex(): Promise<void> {
    try {
      const indexPath = `${LOCAL_CACHE_DIR}index.json`;
      const entries = Array.from(this.localCacheIndex.values());
      await FileSystem.writeAsStringAsync(indexPath, JSON.stringify(entries));
    } catch (error) {
      console.warn('[TTSCache] Error saving local cache index:', error);
    }
  }

  /**
   * Get audio URI for text (from cache or generates new)
   *
   * Flow:
   * 1. Check local cache
   * 2. Check cloud cache (Supabase)
   * 3. Return null if not cached (caller should generate)
   *
   * @returns Local URI if cached, null if needs generation
   */
  async getCachedAudio(
    text: string,
    language: SupportedLanguage
  ): Promise<string | null> {
    await this.initialize();

    const contentType = detectContentType(text);
    const cacheKey = generateCacheKey(text, language, contentType);

    // Step 1: Check local cache
    const localEntry = this.localCacheIndex.get(cacheKey);
    if (localEntry?.localUri) {
      const fileInfo = await FileSystem.getInfoAsync(localEntry.localUri);
      if (fileInfo.exists) {
        this.stats.generationsAvoided++;
        console.log(`[TTSCache] Local hit: ${cacheKey}`);
        return localEntry.localUri;
      }
    }

    // Step 2: Check cloud cache
    try {
      const cloudUri = await this.checkCloudCache(cacheKey);
      if (cloudUri) {
        // Download to local cache
        const localUri = await this.downloadToLocalCache(cacheKey, cloudUri);
        if (localUri) {
          this.stats.cloudHits++;
          this.stats.generationsAvoided++;
          console.log(`[TTSCache] Cloud hit: ${cacheKey}`);
          return localUri;
        }
      }
      this.stats.cloudMisses++;
    } catch (error) {
      console.warn('[TTSCache] Cloud cache check failed:', error);
    }

    // Not cached - caller should generate
    console.log(`[TTSCache] Cache miss: ${cacheKey}`);
    return null;
  }

  /**
   * Check if audio exists in cloud cache
   */
  private async checkCloudCache(cacheKey: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('tts_cache')
        .select('storage_path')
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data?.storage_path) {
        return null;
      }

      // Increment usage count (fire and forget)
      supabase.rpc('increment_tts_usage', { p_cache_key: cacheKey }).then(() => {}, () => {});

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(CLOUD_BUCKET)
        .getPublicUrl(data.storage_path);

      return urlData?.publicUrl || null;
    } catch (error) {
      console.warn('[TTSCache] Cloud cache check error:', error);
      return null;
    }
  }

  /**
   * Download cloud audio to local cache
   */
  private async downloadToLocalCache(
    cacheKey: string,
    cloudUri: string
  ): Promise<string | null> {
    try {
      const localPath = `${LOCAL_CACHE_DIR}${this.sanitizeFilename(cacheKey)}.mp3`;

      const downloadResult = await FileSystem.downloadAsync(cloudUri, localPath);

      if (downloadResult.status === 200) {
        // Update local cache index
        const entry: CacheEntry = {
          cacheKey,
          text: cacheKey.split(':').slice(2).join(':'),
          language: cacheKey.split(':')[0] as SupportedLanguage,
          contentType: cacheKey.split(':')[1] as ContentType,
          localUri: localPath,
          cloudUri,
          createdAt: new Date().toISOString(),
        };

        this.localCacheIndex.set(cacheKey, entry);
        await this.saveLocalCacheIndex();

        return localPath;
      }

      return null;
    } catch (error) {
      console.warn('[TTSCache] Download error:', error);
      return null;
    }
  }

  /**
   * Save generated audio to both local and cloud cache
   *
   * @param audioBase64 - Base64 encoded audio data
   * @param text - Original text
   * @param language - Language code
   */
  async saveToCache(
    audioBase64: string,
    text: string,
    language: SupportedLanguage
  ): Promise<string | null> {
    await this.initialize();

    const contentType = detectContentType(text);
    const cacheKey = generateCacheKey(text, language, contentType);

    try {
      // Save to local cache
      const localPath = `${LOCAL_CACHE_DIR}${this.sanitizeFilename(cacheKey)}.mp3`;
      await FileSystem.writeAsStringAsync(localPath, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Update local index
      const entry: CacheEntry = {
        cacheKey,
        text,
        language,
        contentType,
        localUri: localPath,
        createdAt: new Date().toISOString(),
      };
      this.localCacheIndex.set(cacheKey, entry);
      await this.saveLocalCacheIndex();

      // Save to cloud cache (async, don't block)
      this.saveToCloudCache(audioBase64, text, language, cacheKey).catch((err) =>
        console.warn('[TTSCache] Cloud save failed:', err)
      );

      return localPath;
    } catch (error) {
      console.error('[TTSCache] Save error:', error);
      return null;
    }
  }

  /**
   * Save audio to cloud cache (Supabase)
   */
  private async saveToCloudCache(
    audioBase64: string,
    text: string,
    language: SupportedLanguage,
    cacheKey: string
  ): Promise<void> {
    const contentType = detectContentType(text);
    const storagePath = `${language}/${contentType}s/${this.sanitizeFilename(cacheKey)}.mp3`;

    // Convert base64 to blob
    const byteCharacters = atob(audioBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(CLOUD_BUCKET)
      .upload(storagePath, blob, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Create cache entry in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_EXPIRY_DAYS);

    const { error: dbError } = await supabase.from('tts_cache').upsert(
      {
        cache_key: cacheKey,
        text,
        language,
        content_type: contentType,
        storage_path: storagePath,
        voice_name: VOICE_NAMES[language],
        voice_provider: 'google',
        speaking_rate: 1.0,
        expires_at: expiresAt.toISOString(),
        is_curated: false,
      },
      {
        onConflict: 'cache_key',
      }
    );

    if (dbError) {
      console.warn('[TTSCache] DB save warning:', dbError);
    }
  }

  /**
   * Preload multiple words into cache
   */
  async preloadWords(
    words: string[],
    language: SupportedLanguage,
    generateFn: (text: string, lang: SupportedLanguage) => Promise<string | null>
  ): Promise<{ cached: number; generated: number; failed: number }> {
    const results = { cached: 0, generated: 0, failed: 0 };

    for (const word of words) {
      try {
        const cached = await this.getCachedAudio(word, language);
        if (cached) {
          results.cached++;
        } else {
          // Generate and cache
          const audioBase64 = await generateFn(word, language);
          if (audioBase64) {
            await this.saveToCache(audioBase64, word, language);
            results.generated++;
          } else {
            results.failed++;
          }
        }
      } catch (error) {
        console.warn(`[TTSCache] Preload failed for "${word}":`, error);
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Clear local cache
   */
  async clearLocalCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(LOCAL_CACHE_DIR, { idempotent: true });
      await FileSystem.makeDirectoryAsync(LOCAL_CACHE_DIR, { intermediates: true });
      this.localCacheIndex.clear();
      this.stats.localEntries = 0;
      this.stats.localSizeBytes = 0;
      console.log('[TTSCache] Local cache cleared');
    } catch (error) {
      console.error('[TTSCache] Clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Check if text is cached (without downloading)
   */
  async isCached(text: string, language: SupportedLanguage): Promise<boolean> {
    await this.initialize();

    const cacheKey = generateCacheKey(text, language, detectContentType(text));

    // Check local
    if (this.localCacheIndex.has(cacheKey)) {
      return true;
    }

    // Check cloud
    try {
      const { data } = await supabase
        .from('tts_cache')
        .select('id')
        .eq('cache_key', cacheKey)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize string for use as filename
   */
  private sanitizeFilename(text: string): string {
    return text
      .replace(/[^a-z0-9_:-]/gi, '_')
      .replace(/_+/g, '_')
      .substring(0, 100);
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const ttsCache = new TTSCacheService();

// Convenience exports
export const getCachedAudio = ttsCache.getCachedAudio.bind(ttsCache);
export const saveToCache = ttsCache.saveToCache.bind(ttsCache);
export const preloadWords = ttsCache.preloadWords.bind(ttsCache);
export const clearTTSCache = ttsCache.clearLocalCache.bind(ttsCache);
export const getTTSCacheStats = ttsCache.getStats.bind(ttsCache);
