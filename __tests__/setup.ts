// Workaround for React 18 + jest-expo compatibility issue
// Create a proper mock for NativeModules before jest-expo tries to access it
const mockNativeModules = {
  ImageLoader: {
    prefetchImage: jest.fn(),
    getSize: jest.fn((uri, success) => process.nextTick(() => success(320, 240))),
  },
  ImageViewManager: {
    prefetchImage: jest.fn(),
    getSize: jest.fn((uri, success) => process.nextTick(() => success(320, 240))),
  },
  Linking: {},
  LinkingManager: {},
};

jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => mockNativeModules, { virtual: true });
jest.mock('react-native/Libraries/ReactNative/AppRegistry', () => ({
  registerComponent: jest.fn(),
  registerConfig: jest.fn(),
  registerRunnable: jest.fn(),
  getRegistry: jest.fn(),
  setComponentProviderInstrumentationHook: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
    NotificationFeedbackType: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
    },
}));

jest.mock('expo-speech', () => ({
    speak: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
}));

jest.mock('expo-av', () => ({
    Audio: {
        Sound: {
            createAsync: jest.fn(() => Promise.resolve({ sound: {}, status: {} })),
        },
        setAudioModeAsync: jest.fn(),
        requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
        RecordingOptionsPresets: {
            HIGH_QUALITY: {},
        },
        Recording: jest.fn(() => ({
            prepareToRecordAsync: jest.fn(),
            startAsync: jest.fn(),
            stopAndUnloadAsync: jest.fn(),
            getURI: jest.fn(() => 'mock-uri'),
        })),
    },
}));

jest.mock('expo-blur', () => ({
    BlurView: 'BlurView',
}));

jest.mock('expo-router', () => ({
    Stack: {
        Screen: 'Screen',
    },
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    Link: 'Link',
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        auth: {
            signIn: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        })),
    })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
    MMKV: jest.fn(() => ({
        set: jest.fn(),
        getString: jest.fn(),
        getNumber: jest.fn(),
        getBoolean: jest.fn(),
        delete: jest.fn(),
        clearAll: jest.fn(),
    })),
}));

// Global test timeout
jest.setTimeout(10000);
