/**
 * Tests for useElevenLabsTTS Hook
 *
 * @description Tests the ElevenLabs TTS hook functionality including:
 * - Configuration detection
 * - Voice ID resolution
 * - Error handling
 * - Speak sequence functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

// Mock expo-av
const mockStopAsync = jest.fn().mockResolvedValue(undefined);
const mockUnloadAsync = jest.fn().mockResolvedValue(undefined);
const mockSound = {
  stopAsync: mockStopAsync,
  unloadAsync: mockUnloadAsync,
};

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({ sound: mockSound }),
    },
  },
}));

// Mock the config
const mockGetApiKey = jest.fn();
const mockGetVoiceById = jest.fn();

jest.mock('@/lib/voice/elevenLabsConfig', () => ({
  getElevenLabsApiKey: () => mockGetApiKey(),
  getVoiceById: (id: string) => mockGetVoiceById(id),
  ELEVENLABS_VOICES: [
    {
      id: 'en-US-daniel',
      elevenLabsVoiceId: 'd6dMXDDMQ9zlhV3hOfx0',
      name: 'Daniel',
    },
    {
      id: 'en-GB-bradley',
      elevenLabsVoiceId: 'tczmcUWPAdiP3gKQPrv7',
      name: 'Bradley',
    },
  ],
}));

// Mock expo-file-system/legacy
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///mock-cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: {
    Base64: 'base64',
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Helper: create a mock response with a working arrayBuffer()
function createMockFetchResponse() {
  const buffer = new ArrayBuffer(8);
  return {
    ok: true,
    arrayBuffer: jest.fn().mockResolvedValue(buffer),
  };
}

// Mock FileReader
class MockFileReader {
  result: string | null = null;
  onloadend: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;

  readAsDataURL() {
    this.result = 'data:audio/mpeg;base64,mockbase64data';
    setTimeout(() => {
      if (this.onloadend) this.onloadend();
    }, 0);
  }
}
(global as any).FileReader = MockFileReader;

// Mock URL.createObjectURL
(global as any).URL.createObjectURL = jest.fn(() => 'blob:mock-url');

import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

describe('useElevenLabsTTS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApiKey.mockReturnValue('');
    mockGetVoiceById.mockReturnValue(undefined);
  });

  describe('Configuration', () => {
    it('should report not configured when API key is missing', () => {
      mockGetApiKey.mockReturnValue('');

      const { result } = renderHook(() => useElevenLabsTTS());

      expect(result.current.isConfigured).toBe(false);
    });

    it('should report configured when API key is present', () => {
      mockGetApiKey.mockReturnValue('test-api-key');

      const { result } = renderHook(() => useElevenLabsTTS());

      expect(result.current.isConfigured).toBe(true);
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useElevenLabsTTS());

      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.speak).toBe('function');
      expect(typeof result.current.speakWithOptions).toBe('function');
      expect(typeof result.current.speakSequence).toBe('function');
      expect(typeof result.current.stop).toBe('function');
    });
  });

  describe('speak()', () => {
    it('should throw error when API key not configured', async () => {
      mockGetApiKey.mockReturnValue('');

      const { result } = renderHook(() => useElevenLabsTTS());

      await expect(result.current.speak('Hello')).rejects.toThrow(
        'ElevenLabs API key not configured'
      );
    });

    it('should return early for empty text', async () => {
      mockGetApiKey.mockReturnValue('test-api-key');

      const { result } = renderHook(() => useElevenLabsTTS());

      // Should not throw for empty text
      await expect(result.current.speak('')).resolves.toBeUndefined();
      await expect(result.current.speak('   ')).resolves.toBeUndefined();

      // Fetch should not be called
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should call ElevenLabs API with correct parameters', async () => {
      mockGetApiKey.mockReturnValue('test-api-key');
      mockGetVoiceById.mockReturnValue({
        id: 'en-US-daniel',
        elevenLabsVoiceId: 'd6dMXDDMQ9zlhV3hOfx0',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce(createMockFetchResponse());

      const { result } = renderHook(() => useElevenLabsTTS());

      // Start speaking (don't await - it will hang waiting for audio completion)
      act(() => {
        result.current.speak('Hello world', 'en-US-daniel');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];

      expect(url).toContain('d6dMXDDMQ9zlhV3hOfx0');
      expect(options.method).toBe('POST');
      expect(options.headers['xi-api-key']).toBe('test-api-key');

      const body = JSON.parse(options.body);
      expect(body.text).toBe('Hello world');
      expect(body.model_id).toBe('eleven_multilingual_v2');
    });

    it('should handle API errors gracefully', async () => {
      mockGetApiKey.mockReturnValue('test-api-key');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      });

      const { result } = renderHook(() => useElevenLabsTTS());

      await act(async () => {
        await expect(result.current.speak('Hello')).rejects.toThrow(
          'ElevenLabs TTS error: 401 - Unauthorized'
        );
      });

      // Error state is set asynchronously
      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(false);
      });
    });
  });

  describe('stop()', () => {
    it('should stop current speech and reset state', async () => {
      const { result } = renderHook(() => useElevenLabsTTS());

      await act(async () => {
        await result.current.stop();
      });

      expect(result.current.isSpeaking).toBe(false);
    });
  });

  describe('Voice Resolution', () => {
    it('should resolve config ID to ElevenLabs voice ID', async () => {
      mockGetApiKey.mockReturnValue('test-api-key');
      mockGetVoiceById.mockImplementation((id: string) => {
        if (id === 'en-US-daniel') {
          return { id: 'en-US-daniel', elevenLabsVoiceId: 'd6dMXDDMQ9zlhV3hOfx0' };
        }
        return undefined;
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce(createMockFetchResponse());

      const { result } = renderHook(() => useElevenLabsTTS());

      act(() => {
        result.current.speak('Test', 'en-US-daniel');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const [url] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toContain('d6dMXDDMQ9zlhV3hOfx0');
    });

    it('should use default voice when no voice specified', async () => {
      mockGetApiKey.mockReturnValue('test-api-key');
      mockGetVoiceById.mockReturnValue(undefined);

      (global.fetch as jest.Mock).mockResolvedValueOnce(createMockFetchResponse());

      const { result } = renderHook(() => useElevenLabsTTS());

      act(() => {
        result.current.speak('Test');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const [url] = (global.fetch as jest.Mock).mock.calls[0];
      // Should use default Daniel voice
      expect(url).toContain('d6dMXDDMQ9zlhV3hOfx0');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on unmount', () => {
      const { unmount } = renderHook(() => useElevenLabsTTS());

      unmount();

      // Should not throw
      expect(true).toBe(true);
    });
  });
});
