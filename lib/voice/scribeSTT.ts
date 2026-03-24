/**
 * ElevenLabs Scribe v2 Speech-to-Text
 *
 * Fast pronunciation checking using ElevenLabs STT API.
 * Optimized for short phrases (1-10 words) — returns in ~1s.
 *
 * Endpoint: POST https://api.elevenlabs.io/v1/speech-to-text
 * Model: scribe_v2
 */

import * as FileSystem from 'expo-file-system/legacy';
import { getElevenLabsApiKey } from '@/lib/voice/elevenLabsConfig';

const ELEVENLABS_STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

export interface ScribeResult {
  text: string;
  language_code: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    type: 'word' | 'spacing' | 'audio_event';
  }>;
}

/**
 * Transcribe a short audio clip using ElevenLabs Scribe v2.
 * Optimized for pronunciation practice — fast, accurate, language-aware.
 *
 * @param audioUri - Local file URI from expo-av recording
 * @param languageCode - ISO language code (e.g., 'fr', 'en', 'es')
 * @returns Transcription result with text and word-level data
 */
export async function transcribeWithScribe(
  audioUri: string,
  languageCode: string = 'fr',
): Promise<ScribeResult> {
  const apiKey = getElevenLabsApiKey();

  if (!apiKey) {
    console.warn('[Scribe] No ElevenLabs API key — falling back to empty result');
    return { text: '', language_code: languageCode };
  }

  try {
    // Read audio file as base64
    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob for FormData
    const audioBlob = base64ToBlob(base64Audio, 'audio/m4a');

    // Build FormData
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model_id', 'scribe_v2');
    formData.append('language_code', languageCode);

    const response = await fetch(ELEVENLABS_STT_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Scribe] API error:', response.status, errorText);
      return { text: '', language_code: languageCode };
    }

    const data = await response.json();

    return {
      text: data.text || '',
      language_code: data.language_code || languageCode,
      words: data.words,
    };
  } catch (err) {
    console.error('[Scribe] Transcription error:', err);
    return { text: '', language_code: languageCode };
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
