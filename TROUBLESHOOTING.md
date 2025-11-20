# Troubleshooting Guide - Vox Language App

**Last Updated**: 2025-11-20

---

## 🚨 Common Issues & Solutions

### 1. Expo Android/iOS Not Working

#### Issue: App won't start on Android/iOS
**Symptoms**:
- `npx expo start --android` or `--ios` fails
- Metro bundler errors
- Build errors

**Solutions**:

**A. Clear cache and restart**:
```bash
# Stop all Expo processes
pkill -f "expo start"

# Clear Metro bundler cache
npx expo start --clear

# Or clear all caches
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

**B. Check dependencies**:
```bash
# Run diagnostics
npx expo-doctor

# Fix dependency issues
npx expo install --fix

# If that fails, use legacy peer deps
npm install --legacy-peer-deps
```

**C. Android-specific issues**:
```bash
# Make sure Android SDK is installed
# Check ANDROID_HOME environment variable
echo $ANDROID_HOME

# Should point to something like: /Users/yourname/Library/Android/sdk

# If not set, add to your ~/.zshrc or ~/.bashrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Then reload:
source ~/.zshrc
```

**D. iOS-specific issues** (macOS only):
```bash
# Install CocoaPods if not installed
sudo gem install cocoapods

# Navigate to ios folder and install pods
cd ios
pod install
cd ..

# Try running again
npx expo start --ios
```

**E. Port already in use**:
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use a different port
npx expo start --port 8082
```

---

### 2. Environment Variables Not Loading

#### Issue: `.env` file not being read
**Symptoms**:
- Supabase connection fails
- Environment variables are undefined

**Solutions**:

**A. Check .env file location**:
```bash
# Should be in project root
ls -la .env

# Verify contents (don't share these!)
cat .env
```

**B. Verify variable names**:
All Expo env variables must start with `EXPO_PUBLIC_`:
```bash
# ✅ Correct
EXPO_PUBLIC_SUPABASE_URL=...

# ❌ Wrong (won't be exposed to client)
SUPABASE_URL=...
```

**C. Restart development server**:
```bash
# Stop server
pkill -f "expo start"

# Start with clear cache
npx expo start --clear
```

**D. Check if variables are loaded**:
Add this to your app:
```typescript
console.log('ENV CHECK:', {
  supabase: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
  gemini: !!process.env.EXPO_PUBLIC_GEMINI_API_KEY,
});
```

---

### 3. Database/SQLite Issues

#### Issue: Database not initializing
**Symptoms**:
- "Database not found" errors
- Flashcards not loading
- SQL errors in console

**Solutions**:

**A. Check database initialization**:
The database should initialize automatically in `app/_layout.tsx`. Check the console logs for:
```
🚀 Initializing Vox Language App...
📦 Initializing database...
✅ Flashcard database initialized
```

**B. Manually reset database**:
```typescript
// In your app code or a script
import * as SQLite from 'expo-sqlite';

// Delete existing database
await SQLite.deleteDatabaseAsync('vox_language.db');

// Then restart app to recreate
```

**C. Check SQLite permissions**:
Make sure `expo-sqlite` is properly installed:
```bash
npx expo install expo-sqlite
```

**D. Verify sample data loaded**:
```
📚 Loading vocabulary...
✅ Inserted 50 sample flashcards
```

---

### 4. TypeScript Errors

#### Issue: Type errors in IDE or build
**Symptoms**:
- Red squiggly lines in VSCode
- Build fails with type errors
- Import errors

**Solutions**:

**A. Restart TypeScript server** (VSCode):
- Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
- Type "TypeScript: Restart TS Server"
- Select and run

**B. Check tsconfig.json paths**:
Make sure `@/` alias is configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**C. Rebuild types**:
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall
npm install
```

---

### 5. NativeWind/Tailwind Not Working

#### Issue: Styles not applying
**Symptoms**:
- `className` prop doesn't work
- Styles look unstyled
- Warning about NativeWind

**Solutions**:

**A. Check tailwind.config.js**:
```javascript
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  // ... rest of config
};
```

**B. Import global CSS**:
Make sure `app/_layout.tsx` imports:
```typescript
import '../global.css';
```

**C. Restart with clear cache**:
```bash
npx expo start --clear
```

---

### 6. Reanimated Animation Issues

#### Issue: Animations not smooth or not working
**Symptoms**:
- Animations are laggy
- Errors about Reanimated
- Animations don't run

**Solutions**:

**A. Check Reanimated plugin** in `babel.config.js`:
```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'], // Must be last!
};
```

**B. Clear cache and restart**:
```bash
npx expo start --clear
```

**C. Use useSharedValue for better performance**:
```typescript
// ✅ Good - smooth 60fps
const scale = useSharedValue(1);

// ❌ Bad - causes re-renders
const [scale, setScale] = useState(1);
```

---

### 7. Audio Not Playing (expo-av)

#### Issue: Audio files don't play
**Symptoms**:
- No sound
- Errors about audio permissions
- "Failed to load audio" errors

**Solutions**:

**A. Request permissions**:
```typescript
import { Audio } from 'expo-av';

// At the start of your component
await Audio.requestPermissionsAsync();
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});
```

**B. Check audio file format**:
Supported formats: MP3, M4A, WAV, AAC
```typescript
// ✅ Good
const sound = await Audio.Sound.createAsync(
  { uri: 'https://example.com/audio.mp3' }
);

// Load and play
await sound.sound.playAsync();
```

**C. Unload audio when done**:
```typescript
await sound.sound.unloadAsync();
```

---

## 📱 Device-Specific Issues

### iOS Simulator
- **Issue**: App crashes on launch
  - Solution: Reset simulator - Device → Erase All Content and Settings

### Android Emulator
- **Issue**: Slow or laggy
  - Solution: Increase RAM in AVD Manager (8GB recommended)
  - Enable hardware acceleration in BIOS

### Physical Devices
- **Issue**: Can't connect to dev server
  - Solution: Make sure phone and computer are on same WiFi
  - Use tunnel mode: `npx expo start --tunnel`

---

## 🆘 Getting Help

1. **Check console logs**: Most errors have helpful messages
2. **Search Expo docs**: https://docs.expo.dev
3. **Check this project's docs**: `/docs` folder
4. **Ask Claude or Gemini**: Reference this file and the error message

---

## 🔧 Maintenance Commands

```bash
# Clear all caches
rm -rf node_modules .expo dist
npm install
npx expo start --clear

# Update dependencies
npx expo install --fix

# Check project health
npx expo-doctor

# View logs
npx expo start --clear --dev-client

# Build for production
npx expo prebuild
npx expo run:ios
npx expo run:android
```

---

**Remember**: When in doubt, clear cache and restart! 90% of issues are solved this way.
