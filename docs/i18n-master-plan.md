# Internationalization (i18n) Master Plan
## Vox Language App

**Document Version:** 1.0
**Last Updated:** December 12, 2025
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Library Selection](#library-selection)
3. [Folder Structure](#folder-structure)
4. [Implementation Strategy](#implementation-strategy)
5. [Handling Different Content Types](#handling-different-content-types)
6. [RTL Language Support](#rtl-language-support)
7. [Code Examples](#code-examples)
8. [Migration Phases](#migration-phases)
9. [Testing Strategy](#testing-strategy)
10. [Performance Considerations](#performance-considerations)
11. [Resources](#resources)

---

## Executive Summary

This document outlines the complete internationalization strategy for the Vox Language App. The goal is to support multiple interface languages (English, Spanish, French, Arabic, Hebrew, etc.) while maintaining the app's current functionality and user experience.

**Key Objectives:**
- Support 10+ interface languages by Q2 2026
- Implement RTL (Right-to-Left) support for Arabic and Hebrew
- Maintain performance with minimal bundle size increase
- Provide seamless language switching without app restart (where possible)
- Persist user language preferences across sessions
- Support dynamic content localization (lessons, vocabulary)

---

## Library Selection

### Recommended Stack

After extensive research and analysis of the React Native + Expo ecosystem in 2025, the recommended i18n stack is:

#### Core Libraries

```json
{
  "dependencies": {
    "expo-localization": "^18.0.0",
    "i18next": "^23.7.0",
    "react-i18next": "^14.0.0"
  }
}
```

**Installation:**
```bash
npx expo install expo-localization
npm install --legacy-peer-deps i18next react-i18next
```

### Why This Stack?

#### 1. expo-localization
- **Purpose:** Detects and retrieves device locale settings
- **Pros:**
  - Native Expo integration (no custom native modules)
  - Provides device locale, timezone, currency, calendar format
  - Works seamlessly with Expo's managed workflow
  - 482,639+ weekly downloads (2025)
- **Use Case:** Automatically detect user's device language

#### 2. i18next
- **Purpose:** Core internationalization engine
- **Pros:**
  - Industry standard for i18n (20+ million downloads/month)
  - Powerful interpolation, pluralization, and formatting
  - Language detection and fallback support
  - Namespace support for code splitting
  - Plugin ecosystem (storage, language detection, etc.)
- **Use Case:** Manage translation logic and data

#### 3. react-i18next
- **Purpose:** React bindings for i18next
- **Pros:**
  - Hooks-based API (`useTranslation`)
  - React Suspense support
  - Automatic re-rendering on language change
  - TypeScript support with autocomplete
  - Trans component for JSX in translations
- **Use Case:** Connect i18next to React components

### Alternative Considered: typesafe-i18n

**Pros:**
- Generates TypeScript types for autocomplete
- Smaller bundle size (compile-time vs runtime)
- Type-safe translation keys

**Cons:**
- Requires Hermes engine
- Less ecosystem support
- Smaller community
- Breaking changes more common

**Decision:** Use i18next for stability, larger ecosystem, and better documentation.

### Expo vs react-native-localize

| Feature | expo-localization | react-native-localize |
|---------|------------------|----------------------|
| Expo Support | Native | Requires ejecting |
| Weekly Downloads | 482,639 | 422,426 |
| Managed Workflow | Yes | No |
| Calendar Formats | Basic | Advanced (10+ types) |
| Setup Complexity | Simple | Complex |

**Decision:** Use `expo-localization` since Vox uses Expo's managed workflow.

---

## Folder Structure

### Recommended Directory Organization

```
vox-language-app/
├── i18n/
│   ├── index.ts                    # i18n initialization and config
│   ├── types.ts                    # TypeScript types for translations
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json         # Common UI text
│   │   │   ├── onboarding.json     # Onboarding screens
│   │   │   ├── home.json           # Home/staircase screen
│   │   │   ├── practice.json       # Practice cards
│   │   │   ├── settings.json       # Settings screen
│   │   │   ├── errors.json         # Error messages
│   │   │   └── rewards.json        # Gamification text
│   │   ├── es/
│   │   │   ├── common.json
│   │   │   ├── onboarding.json
│   │   │   ├── home.json
│   │   │   ├── practice.json
│   │   │   ├── settings.json
│   │   │   ├── errors.json
│   │   │   └── rewards.json
│   │   ├── ar/
│   │   │   └── ... (same structure)
│   │   ├── he/
│   │   │   └── ... (same structure)
│   │   └── fr/
│   │       └── ... (same structure)
│   ├── utils/
│   │   ├── formatters.ts           # Date, number, currency formatters
│   │   ├── rtl.ts                  # RTL detection and helpers
│   │   └── languageDetector.ts     # Custom language detection
│   └── hooks/
│       ├── useLanguage.ts          # Language switching hook
│       └── useRTL.ts               # RTL state hook
├── lib/
│   └── storage/
│       └── languageStorage.ts      # Persist language preference
└── components/
    └── LanguageSwitcher.tsx        # Language picker component
```

### Translation File Structure

Each locale folder contains **namespaced** JSON files for better organization and code splitting:

**Example: `i18n/locales/en/common.json`**
```json
{
  "app_name": "Vox Language App",
  "loading": "Loading...",
  "buttons": {
    "continue": "Continue",
    "cancel": "Cancel",
    "save": "Save",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "retry": "Try Again"
  },
  "validation": {
    "required": "This field is required",
    "invalid_email": "Invalid email address",
    "password_too_short": "Password must be at least {{min}} characters",
    "passwords_dont_match": "Passwords don't match"
  }
}
```

**Example: `i18n/locales/en/home.json`**
```json
{
  "title": "My Roadmap",
  "stats": {
    "points": "{{count}} points",
    "streak": "{{count}} day streak",
    "streak_plural": "{{count}} day streak"
  },
  "stair_card": {
    "locked": "Complete previous stair to unlock",
    "current": "Current stair",
    "completed": "Completed",
    "vocabulary_count": "{{count}} word",
    "vocabulary_count_plural": "{{count}} words",
    "estimated_days": "~{{count}} day",
    "estimated_days_plural": "~{{count}} days"
  }
}
```

**Example: `i18n/locales/en/practice.json`**
```json
{
  "cards": {
    "single_vocab": {
      "flip_hint": "Tap to reveal",
      "mark_known": "I know this",
      "mark_learning": "Still learning"
    },
    "fill_blank": {
      "instructions": "Fill in the blank with the correct word",
      "check_answer": "Check Answer",
      "correct": "Correct!",
      "incorrect": "Not quite. Try again."
    },
    "speaking": {
      "instructions": "Speak the sentence clearly",
      "start_recording": "Tap to record",
      "stop_recording": "Tap to stop",
      "analyzing": "Analyzing your pronunciation..."
    }
  },
  "feedback": {
    "excellent": "Excellent!",
    "great": "Great job!",
    "good": "Good!",
    "needs_practice": "Keep practicing!"
  }
}
```

---

## Implementation Strategy

### Phase 1: Setup and Core Infrastructure (Week 1-2)

#### 1.1 Install Dependencies
```bash
npx expo install expo-localization
npm install --legacy-peer-deps i18next react-i18next
```

#### 1.2 Create i18n Configuration
Create `/Users/angelpolanco/Documents/github-apps/vox langauge app/vox-language-app/i18n/index.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { getLanguagePreference, saveLanguagePreference } from '@/lib/storage/languageStorage';

// Import translations
import commonEN from './locales/en/common.json';
import homeEN from './locales/en/home.json';
import practiceEN from './locales/en/practice.json';
import settingsEN from './locales/en/settings.json';
import errorsEN from './locales/en/errors.json';
import rewardsEN from './locales/en/rewards.json';

import commonES from './locales/es/common.json';
import homeES from './locales/es/home.json';
import practiceES from './locales/es/practice.json';
import settingsES from './locales/es/settings.json';
import errorsES from './locales/es/errors.json';
import rewardsES from './locales/es/rewards.json';

// Define resources
const resources = {
  en: {
    common: commonEN,
    home: homeEN,
    practice: practiceEN,
    settings: settingsEN,
    errors: errorsEN,
    rewards: rewardsEN,
  },
  es: {
    common: commonES,
    home: homeES,
    practice: practiceES,
    settings: settingsES,
    errors: errorsES,
    rewards: rewardsES,
  },
  // Add more languages as needed
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

/**
 * Get the best language match from device locale
 */
function getDeviceLanguage(): SupportedLanguage {
  const deviceLocale = Localization.getLocales()[0];
  const languageCode = deviceLocale.languageCode;

  // Check if we support this language
  const supported = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);

  return supported ? (languageCode as SupportedLanguage) : 'en';
}

/**
 * Initialize i18n instance
 */
export async function initializeI18n() {
  // Get saved preference or use device language
  const savedLanguage = await getLanguagePreference();
  const fallbackLanguage = getDeviceLanguage();
  const initialLanguage = savedLanguage || fallbackLanguage;

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',

      // Namespace configuration
      defaultNS: 'common',
      ns: ['common', 'home', 'practice', 'settings', 'errors', 'rewards'],

      // Interpolation settings
      interpolation: {
        escapeValue: false, // React already escapes
        format: (value, format, lng) => {
          if (format === 'uppercase') return value.toUpperCase();
          if (format === 'lowercase') return value.toLowerCase();
          if (value instanceof Date) {
            return new Intl.DateTimeFormat(lng).format(value);
          }
          return value;
        },
      },

      // React settings
      react: {
        useSuspense: false, // Set to true if using Suspense
      },

      // Debugging (disable in production)
      debug: __DEV__,
    });

  // Save the language if not already saved
  if (!savedLanguage) {
    await saveLanguagePreference(initialLanguage);
  }
}

export default i18n;
```

#### 1.3 Create Language Storage
Create `/Users/angelpolanco/Documents/github-apps/vox langauge app/vox-language-app/lib/storage/languageStorage.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedLanguage } from '@/i18n';

const LANGUAGE_STORAGE_KEY = '@vox_language_preference';

/**
 * Save user's language preference
 */
export async function saveLanguagePreference(language: SupportedLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

/**
 * Get user's saved language preference
 */
export async function getLanguagePreference(): Promise<SupportedLanguage | null> {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return language as SupportedLanguage | null;
  } catch (error) {
    console.error('Error getting language preference:', error);
    return null;
  }
}

/**
 * Clear language preference (reset to device default)
 */
export async function clearLanguagePreference(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing language preference:', error);
  }
}
```

#### 1.4 Initialize in Root Layout
Update `app/_layout.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { initializeI18n } from '@/i18n';

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initializeI18n().then(() => {
      setI18nReady(true);
    });
  }, []);

  if (!i18nReady) {
    // Show splash screen or loading indicator
    return null;
  }

  return <Slot />;
}
```

### Phase 2: Create Base Translation Files (Week 2-3)

#### 2.1 Create Initial English Translations
Start with English (en) as the source language:

- `i18n/locales/en/common.json` - Buttons, validation, common UI
- `i18n/locales/en/home.json` - Home screen, staircase
- `i18n/locales/en/practice.json` - All card types
- `i18n/locales/en/settings.json` - Settings screen
- `i18n/locales/en/errors.json` - Error messages
- `i18n/locales/en/rewards.json` - Gamification, achievements

#### 2.2 Extract Hardcoded Strings
Audit all components for hardcoded text:

```bash
# Search for hardcoded strings (example)
grep -r "\"[A-Z]" app/
grep -r "'[A-Z]" components/
```

#### 2.3 Create Translation Keys
Follow naming conventions:
- Use snake_case: `my_roadmap`, `weekly_points`
- Nest logically: `home.stats.points`, `practice.cards.speaking.instructions`
- Keep keys descriptive but concise

### Phase 3: Component Migration (Week 3-5)

#### 3.1 Update Components to Use Translations
Example: Updating `app/(tabs)/home.tsx`:

**Before:**
```typescript
<Text style={styles.title}>My Roadmap</Text>
<Text>{weeklyPoints} points</Text>
<Text>{streak} day streak</Text>
```

**After:**
```typescript
import { useTranslation } from 'react-i18next';

function HomeScreen() {
  const { t } = useTranslation('home');

  return (
    <>
      <Text style={styles.title}>{t('title')}</Text>
      <Text>{t('stats.points', { count: weeklyPoints })}</Text>
      <Text>{t('stats.streak', { count: streak })}</Text>
    </>
  );
}
```

#### 3.2 Migration Priority
1. **Critical paths first:** Onboarding, home, practice cards
2. **Settings screen:** Include language switcher
3. **Error messages:** All error handling
4. **Secondary screens:** Profile, community, etc.

### Phase 4: Language Switcher UI (Week 4)

Create `components/LanguageSwitcher.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import { saveLanguagePreference } from '@/lib/storage/languageStorage';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('settings');

  const handleLanguageChange = async (languageCode: SupportedLanguage) => {
    await i18n.changeLanguage(languageCode);
    await saveLanguagePreference(languageCode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language_selection')}</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {SUPPORTED_LANGUAGES.map((language) => {
          const isActive = i18n.language === language.code;

          return (
            <TouchableOpacity
              key={language.code}
              style={[styles.languageItem, isActive && styles.languageItemActive]}
              onPress={() => handleLanguageChange(language.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, isActive && styles.languageNameActive]}>
                  {language.nativeName}
                </Text>
                <Text style={styles.languageEnglishName}>{language.name}</Text>
              </View>
              {isActive && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.background.elevated,
  },
  flag: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  languageNameActive: {
    color: colors.primary.light,
  },
  languageEnglishName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  checkmark: {
    fontSize: 24,
    color: colors.primary.DEFAULT,
  },
});
```

### Phase 5: RTL Support (Week 5-6)

See [RTL Language Support](#rtl-language-support) section below.

### Phase 6: Testing and QA (Week 6-7)

- Test all supported languages
- Verify RTL layouts
- Test language switching
- Check text overflow issues
- Validate pluralization rules
- Test date/number formatting

### Phase 7: Additional Languages (Ongoing)

Add translations progressively:
1. Spanish (es) - Week 8
2. French (fr) - Week 9
3. German (de) - Week 10
4. Arabic (ar) - Week 11 (with RTL testing)
5. Hebrew (he) - Week 12 (with RTL testing)
6. Chinese (zh), Japanese (ja), Korean (ko) - Q2 2026

---

## Handling Different Content Types

### 1. Static UI Text

**Use Case:** Buttons, labels, navigation, instructions

**Implementation:**
```typescript
const { t } = useTranslation('common');

<Button title={t('buttons.continue')} />
```

**Translation File:**
```json
{
  "buttons": {
    "continue": "Continue",
    "cancel": "Cancel"
  }
}
```

### 2. Dynamic Content with Variables (Interpolation)

**Use Case:** User names, counts, dynamic values

**Implementation:**
```typescript
const { t } = useTranslation('home');

<Text>{t('stats.points', { count: 1250 })}</Text>
<Text>{t('welcome_message', { name: userName })}</Text>
```

**Translation File:**
```json
{
  "stats": {
    "points": "{{count}} points"
  },
  "welcome_message": "Welcome back, {{name}}!"
}
```

### 3. Pluralization

**Use Case:** 1 word vs 2 words, 1 day vs 3 days

**Implementation:**
```typescript
const { t } = useTranslation('home');

<Text>{t('stair_card.vocabulary_count', { count: 25 })}</Text>
<Text>{t('stair_card.estimated_days', { count: 1 })}</Text>
```

**Translation File:**
```json
{
  "stair_card": {
    "vocabulary_count": "{{count}} word",
    "vocabulary_count_plural": "{{count}} words",
    "estimated_days": "~{{count}} day",
    "estimated_days_plural": "~{{count}} days"
  }
}
```

i18next automatically chooses the correct form based on `count`.

### 4. Date and Time Formatting

**Use Case:** Display dates in user's locale format

**Implementation:**
```typescript
import { useTranslation } from 'react-i18next';

function formatDate(date: Date) {
  const { i18n } = useTranslation();
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function formatTime(date: Date) {
  const { i18n } = useTranslation();
  return new Intl.DateTimeFormat(i18n.language, {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}
```

**Usage:**
```typescript
<Text>{formatDate(new Date())}</Text>
// English: "December 12, 2025"
// Spanish: "12 de diciembre de 2025"
// Arabic: "١٢ ديسمبر ٢٠٢٥"
```

### 5. Number Formatting

**Use Case:** Large numbers, percentages, currencies

**Implementation:**
```typescript
import { useTranslation } from 'react-i18next';

function formatNumber(value: number) {
  const { i18n } = useTranslation();
  return new Intl.NumberFormat(i18n.language).format(value);
}

function formatPercent(value: number) {
  const { i18n } = useTranslation();
  return new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    minimumFractionDigits: 0,
  }).format(value);
}
```

**Usage:**
```typescript
<Text>{formatNumber(1234567)}</Text>
// English: "1,234,567"
// Spanish: "1.234.567"
// Arabic: "١٬٢٣٤٬٥٦٧"

<Text>{formatPercent(0.85)}</Text>
// English: "85%"
// Arabic: "٨٥٪"
```

### 6. Dynamic Content from Database (Lessons, Vocabulary)

**Challenge:** User-generated or AI-generated content needs translation

**Approaches:**

#### Option A: Store Multiple Language Versions
```sql
-- Supabase schema
CREATE TABLE vocabulary_items (
  id UUID PRIMARY KEY,
  word_en TEXT,
  word_es TEXT,
  word_fr TEXT,
  definition_en TEXT,
  definition_es TEXT,
  definition_fr TEXT,
  -- ...
);
```

**Pros:** Fast, no API calls
**Cons:** Database bloat, hard to maintain

#### Option B: Translation API (On-Demand)
Use Google Translate API or DeepL for dynamic content:

```typescript
async function translateDynamicContent(text: string, targetLang: string) {
  // Cache translations locally
  const cached = await getCachedTranslation(text, targetLang);
  if (cached) return cached;

  // Call translation API
  const translated = await translateAPI(text, targetLang);

  // Cache for future use
  await cacheTranslation(text, targetLang, translated);

  return translated;
}
```

**Pros:** Scalable, supports all languages
**Cons:** API costs, requires internet

#### Option C: Hybrid Approach (Recommended)
- **Static content:** Pre-translate and store in database
- **AI-generated content:** Translate on-demand with caching
- **User content:** Allow users to see original language or request translation

### 7. Rich Text with JSX

**Use Case:** Text with links, bold, italic

**Implementation:**
```typescript
import { Trans } from 'react-i18next';

<Trans
  i18nKey="settings.privacy_policy"
  components={{
    bold: <Text style={{ fontWeight: 'bold' }} />,
    link: <Text style={{ color: colors.primary.DEFAULT }} onPress={openPrivacy} />,
  }}
/>
```

**Translation File:**
```json
{
  "privacy_policy": "By continuing, you agree to our <link>Privacy Policy</link> and <bold>Terms of Service</bold>."
}
```

---

## RTL Language Support

### Overview

RTL (Right-to-Left) languages like Arabic (العربية) and Hebrew (עברית) require special handling:

1. **Layout direction:** Entire UI mirrors (right becomes left)
2. **Text alignment:** Text aligns to the right
3. **Icons:** Directional icons must flip
4. **Navigation:** Back button moves to the right

### Implementation

#### 1. Detect RTL Languages

Create `i18n/utils/rtl.ts`:

```typescript
import { I18nManager } from 'react-native';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import type { SupportedLanguage } from '@/i18n';

/**
 * Check if a language is RTL
 */
export function isRTLLanguage(languageCode: SupportedLanguage): boolean {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  return language?.rtl === true;
}

/**
 * Get current RTL status from I18nManager
 */
export function isRTL(): boolean {
  return I18nManager.isRTL;
}

/**
 * Enable or disable RTL mode
 * WARNING: Requires app restart to take effect
 */
export function setRTL(enabled: boolean): void {
  if (I18nManager.isRTL !== enabled) {
    I18nManager.forceRTL(enabled);
    // App restart required - notify user
  }
}

/**
 * Allow RTL for all languages (for testing)
 */
export function allowRTL(allowed: boolean): void {
  I18nManager.allowRTL(allowed);
}
```

#### 2. Enable RTL in App Config

Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "forcesRTL": false
    },
    "ios": {
      "infoPlist": {
        "CFBundleAllowMixedLocalizations": true
      }
    }
  }
}
```

#### 3. Handle Language Change with RTL

Update `components/LanguageSwitcher.tsx`:

```typescript
import { Alert, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { isRTLLanguage, setRTL } from '@/i18n/utils/rtl';

async function handleLanguageChange(languageCode: SupportedLanguage) {
  const wasRTL = isRTL();
  const willBeRTL = isRTLLanguage(languageCode);

  // Change language
  await i18n.changeLanguage(languageCode);
  await saveLanguagePreference(languageCode);

  // Check if RTL direction changed
  if (wasRTL !== willBeRTL) {
    setRTL(willBeRTL);

    // Alert user about required restart
    Alert.alert(
      t('settings.restart_required'),
      t('settings.restart_message'),
      [
        { text: t('common.buttons.cancel'), style: 'cancel' },
        {
          text: t('settings.restart_now'),
          onPress: async () => {
            if (Platform.OS !== 'web') {
              await Updates.reloadAsync();
            }
          },
        },
      ]
    );
  }
}
```

#### 4. Use Start/End Instead of Left/Right

**Bad (hardcoded direction):**
```typescript
const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    marginRight: 24,
  },
});
```

**Good (RTL-compatible):**
```typescript
const styles = StyleSheet.create({
  container: {
    paddingStart: 16,
    marginEnd: 24,
  },
});
```

React Native automatically flips `start/end` in RTL mode.

#### 5. Flip Directional Icons

For icons like arrows, chevrons:

```typescript
import { I18nManager } from 'react-native';

function BackIcon() {
  const isRTL = I18nManager.isRTL;

  return (
    <Icon
      name={isRTL ? 'chevron-right' : 'chevron-left'}
      size={24}
    />
  );
}
```

#### 6. Test RTL Layout

**Enable RTL for Testing (iOS Simulator):**
1. Settings > General > Language & Region
2. Change language to Arabic or Hebrew

**Enable RTL for Testing (Android Emulator):**
1. Settings > System > Languages & input > Languages
2. Add Arabic or Hebrew
3. Move it to the top

**Force RTL in Dev:**
```typescript
// In app/_layout.tsx (for testing only)
if (__DEV__) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}
```

#### 7. Common RTL Pitfalls

| Issue | Solution |
|-------|----------|
| Text not aligning right | Use `textAlign: I18nManager.isRTL ? 'right' : 'left'` |
| Flex direction wrong | Use `flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'` |
| Images/icons not flipping | Use `transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }]` |
| Hardcoded left/right | Replace with `start/end` or conditional logic |

---

## Code Examples

### Example 1: Setting Up i18next with Expo

**File: `i18n/index.ts`**

See [Phase 1: Setup and Core Infrastructure](#phase-1-setup-and-core-infrastructure-week-1-2) above.

### Example 2: Creating Translation Files

**File: `i18n/locales/en/practice.json`**

```json
{
  "session": {
    "title": "Practice Session",
    "cards_remaining": "{{count}} card remaining",
    "cards_remaining_plural": "{{count}} cards remaining",
    "time_spent": "Time: {{minutes}}m {{seconds}}s",
    "exit_confirm": "Are you sure you want to exit? Your progress will be saved."
  },
  "cards": {
    "single_vocab": {
      "flip_hint": "Tap to reveal translation",
      "mark_known": "I know this word",
      "mark_learning": "Still learning",
      "next": "Next word"
    },
    "fill_blank": {
      "instructions": "Fill in the blank with the correct word",
      "placeholder": "Type your answer...",
      "check_answer": "Check Answer",
      "show_hint": "Show Hint",
      "hint": "Hint: {{hint}}",
      "correct": "Perfect! That's correct.",
      "incorrect": "Not quite. The correct answer is: {{answer}}"
    },
    "speaking": {
      "title": "Pronunciation Practice",
      "instructions": "Read the sentence aloud clearly",
      "target_sentence": "Target sentence:",
      "start_recording": "Tap to Start Recording",
      "recording": "Recording... Tap to stop",
      "analyzing": "Analyzing your pronunciation...",
      "play_recording": "Listen to your recording",
      "retry": "Try Again",
      "score": "Pronunciation Score: {{score}}%"
    },
    "storytelling": {
      "title": "Tell Your Story",
      "prompt": "Prompt:",
      "start_recording": "Start Recording",
      "stop_recording": "Stop Recording",
      "duration": "{{minutes}}:{{seconds}}",
      "min_duration": "Minimum {{seconds}} seconds",
      "max_duration": "Maximum {{minutes}} minutes"
    }
  },
  "feedback": {
    "excellent": "Excellent! 🎉",
    "great": "Great job! 👏",
    "good": "Good work! 👍",
    "needs_practice": "Keep practicing! 💪",
    "try_again": "Give it another try"
  },
  "completion": {
    "title": "Session Complete!",
    "message": "You've completed this practice session.",
    "stats": {
      "cards_completed": "Cards completed: {{count}}",
      "accuracy": "Accuracy: {{percent}}%",
      "time_spent": "Time spent: {{minutes}} minutes",
      "points_earned": "Points earned: +{{points}}"
    },
    "continue": "Continue Learning"
  }
}
```

### Example 3: Using Translations in Components

**Before (Hardcoded):**

```typescript
// components/cards/SpeakingCard.tsx (BEFORE)
export function SpeakingCard({ sentence }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pronunciation Practice</Text>
      <Text style={styles.instructions}>
        Read the sentence aloud clearly
      </Text>
      <Text style={styles.sentence}>{sentence}</Text>
      <Button title="Tap to Start Recording" onPress={startRecording} />
      {isAnalyzing && <Text>Analyzing your pronunciation...</Text>}
    </View>
  );
}
```

**After (i18n):**

```typescript
// components/cards/SpeakingCard.tsx (AFTER)
import { useTranslation } from 'react-i18next';

export function SpeakingCard({ sentence }: Props) {
  const { t } = useTranslation('practice');

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('cards.speaking.title')}</Text>
      <Text style={styles.instructions}>
        {t('cards.speaking.instructions')}
      </Text>
      <Text style={styles.label}>{t('cards.speaking.target_sentence')}</Text>
      <Text style={styles.sentence}>{sentence}</Text>
      <Button
        title={isRecording
          ? t('cards.speaking.recording')
          : t('cards.speaking.start_recording')
        }
        onPress={isRecording ? stopRecording : startRecording}
      />
      {isAnalyzing && (
        <Text>{t('cards.speaking.analyzing')}</Text>
      )}
    </View>
  );
}
```

### Example 4: Language Switcher Component

See [Phase 4: Language Switcher UI](#phase-4-language-switcher-ui-week-4) above for full implementation.

### Example 5: Persisting Language Preference

**Using AsyncStorage:**

```typescript
// lib/storage/languageStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@vox_language';

export async function saveLanguage(lang: string): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export async function getLanguage(): Promise<string | null> {
  return await AsyncStorage.getItem(LANGUAGE_KEY);
}
```

**Initialize on App Start:**

```typescript
// app/_layout.tsx
import { useEffect, useState } from 'react';
import { initializeI18n } from '@/i18n';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await initializeI18n();
      setReady(true);
    }
    prepare();
  }, []);

  if (!ready) return null;

  return <Slot />;
}
```

### Example 6: Custom Hook for Language Switching

**Create `i18n/hooks/useLanguage.ts`:**

```typescript
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import type { SupportedLanguage } from '@/i18n';
import { saveLanguagePreference } from '@/lib/storage/languageStorage';
import { isRTLLanguage, setRTL, isRTL } from '@/i18n/utils/rtl';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export function useLanguage() {
  const { i18n, t } = useTranslation();

  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    const currentIsRTL = isRTL();
    const newIsRTL = isRTLLanguage(language);

    // Change language in i18next
    await i18n.changeLanguage(language);

    // Save preference
    await saveLanguagePreference(language);

    // Handle RTL change if needed
    if (currentIsRTL !== newIsRTL) {
      setRTL(newIsRTL);

      // Prompt user to restart app
      Alert.alert(
        t('settings.restart_required'),
        t('settings.restart_for_rtl'),
        [
          { text: t('common.buttons.cancel'), style: 'cancel' },
          {
            text: t('settings.restart_now'),
            onPress: async () => {
              await Updates.reloadAsync();
            },
          },
        ]
      );
    }
  }, [i18n, t]);

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
    isRTL: isRTL(),
  };
}
```

**Usage:**

```typescript
import { useLanguage } from '@/i18n/hooks/useLanguage';

function SettingsScreen() {
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();

  return (
    <View>
      <Text>Current Language: {currentLanguage}</Text>
      <Button
        title="Switch to Spanish"
        onPress={() => changeLanguage('es')}
      />
      <Text>RTL Mode: {isRTL ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### Example 7: Formatting Dates and Numbers

**Create `i18n/utils/formatters.ts`:**

```typescript
/**
 * Format a date according to user's locale
 */
export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a time according to user's locale
 */
export function formatTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

/**
 * Format a number according to user's locale
 */
export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a percentage according to user's locale
 */
export function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format currency according to user's locale
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date, locale: string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffDay > 0) return rtf.format(-diffDay, 'day');
  if (diffHour > 0) return rtf.format(-diffHour, 'hour');
  if (diffMin > 0) return rtf.format(-diffMin, 'minute');
  return rtf.format(-diffSec, 'second');
}
```

**Usage:**

```typescript
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber, formatRelativeTime } from '@/i18n/utils/formatters';

function StatsScreen() {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const lastPractice = new Date('2025-12-10T14:30:00');
  const points = 12567;

  return (
    <View>
      <Text>Points: {formatNumber(points, locale)}</Text>
      <Text>Last practice: {formatRelativeTime(lastPractice, locale)}</Text>
      <Text>Date: {formatDate(new Date(), locale)}</Text>
    </View>
  );
}
```

---

## Migration Phases

### Phase 1: Foundation (Week 1-2) ✓
- Install dependencies
- Set up i18n configuration
- Create folder structure
- Initialize in root layout
- Create language storage utility

**Deliverables:**
- Working i18n setup
- English translations for common UI elements
- Language persistence working

### Phase 2: Core Screens (Week 3-4)
- Migrate home screen (staircase)
- Migrate onboarding screens
- Migrate settings screen
- Add language switcher component

**Deliverables:**
- Home, onboarding, settings fully translated
- Language switcher functional
- Spanish translations added

### Phase 3: Practice Cards (Week 4-5)
- Migrate all card types:
  - SingleVocabCard
  - FillInBlankCard
  - SpeakingCard
  - QuestionGameCard
  - StorytellingCard
  - RolePlayCard
  - SentenceScrambleCard
  - etc.

**Deliverables:**
- All card types support i18n
- Practice flow fully translated
- French translations added

### Phase 4: RTL Support (Week 5-6)
- Implement RTL detection
- Update styles to use start/end
- Test with Arabic and Hebrew
- Add directional icon handling
- App restart flow for RTL switching

**Deliverables:**
- Arabic translations added
- Hebrew translations added
- RTL layouts working correctly

### Phase 5: Polish & Optimization (Week 6-7)
- Fix text overflow issues
- Optimize bundle size (lazy load translations)
- Add missing translations
- QA across all languages
- Performance testing

**Deliverables:**
- All known issues fixed
- Performance metrics meet targets
- QA sign-off

### Phase 6: Additional Languages (Week 8+)
- Add remaining languages progressively
- German (Week 8)
- Portuguese (Week 9)
- Chinese (Week 10)
- Japanese (Week 11)
- Korean (Week 12)

**Deliverables:**
- 10+ languages supported
- Translation process documented
- Continuous translation pipeline established

---

## Testing Strategy

### 1. Unit Tests

**Test translation key existence:**

```typescript
// __tests__/i18n/translations.test.ts
import i18n from '@/i18n';
import commonEN from '@/i18n/locales/en/common.json';

describe('i18n Translations', () => {
  it('should have all common translations in English', () => {
    expect(commonEN.buttons.continue).toBeDefined();
    expect(commonEN.buttons.cancel).toBeDefined();
    expect(commonEN.app_name).toBeDefined();
  });

  it('should translate common.buttons.continue', () => {
    i18n.changeLanguage('en');
    expect(i18n.t('common:buttons.continue')).toBe('Continue');
  });

  it('should handle pluralization correctly', () => {
    i18n.changeLanguage('en');
    expect(i18n.t('home:stair_card.vocabulary_count', { count: 1 })).toBe('1 word');
    expect(i18n.t('home:stair_card.vocabulary_count', { count: 5 })).toBe('5 words');
  });
});
```

### 2. Component Tests

**Test components render translations:**

```typescript
// __tests__/components/LanguageSwitcher.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('should render all supported languages', () => {
    const { getByText } = render(<LanguageSwitcher />);

    expect(getByText('English')).toBeTruthy();
    expect(getByText('Español')).toBeTruthy();
    expect(getByText('Français')).toBeTruthy();
  });

  it('should change language when tapped', async () => {
    const { getByText } = render(<LanguageSwitcher />);

    const spanishOption = getByText('Español');
    fireEvent.press(spanishOption);

    // Verify language changed (check i18n.language)
    // ...
  });
});
```

### 3. RTL Testing

**Test RTL layout changes:**

```typescript
// __tests__/utils/rtl.test.ts
import { I18nManager } from 'react-native';
import { isRTLLanguage, setRTL } from '@/i18n/utils/rtl';

describe('RTL Utilities', () => {
  it('should detect RTL languages correctly', () => {
    expect(isRTLLanguage('ar')).toBe(true);
    expect(isRTLLanguage('he')).toBe(true);
    expect(isRTLLanguage('en')).toBe(false);
    expect(isRTLLanguage('es')).toBe(false);
  });

  it('should update I18nManager when setRTL is called', () => {
    setRTL(true);
    // Note: Requires app restart in real usage
  });
});
```

### 4. Manual Testing Checklist

For each language:

- [ ] All screens display translations correctly
- [ ] No text overflow or truncation
- [ ] Buttons and labels are readable
- [ ] Pluralization works correctly
- [ ] Date/time formats are locale-appropriate
- [ ] Number formats use correct separators
- [ ] Language switcher shows current language
- [ ] Language preference persists across app restarts

For RTL languages (Arabic, Hebrew):

- [ ] Layout mirrors correctly (right to left)
- [ ] Text aligns to the right
- [ ] Back button appears on the right
- [ ] Icons flip appropriately
- [ ] Lists scroll from right to left
- [ ] Forms layout correctly
- [ ] Navigation transitions work smoothly

### 5. Automated Visual Regression Testing

Use tools like:
- **Detox** - E2E testing for React Native
- **Appium** - Cross-platform mobile testing
- **Maestro** - Mobile UI testing

Example Detox test:

```typescript
// e2e/language-switching.e2e.ts
describe('Language Switching', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should switch to Spanish and display Spanish text', async () => {
    // Navigate to settings
    await element(by.id('settings-tab')).tap();

    // Open language switcher
    await element(by.id('language-button')).tap();

    // Select Spanish
    await element(by.id('language-es')).tap();

    // Verify Spanish text appears
    await expect(element(by.text('Mi Hoja de Ruta'))).toBeVisible();
  });
});
```

---

## Performance Considerations

### 1. Bundle Size Optimization

**Problem:** Including all translations increases bundle size.

**Solution:** Lazy load translation files per language.

```typescript
// i18n/index.ts (Optimized)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Only load English initially
const resources = {
  en: {
    common: require('./locales/en/common.json'),
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
});

// Lazy load other languages
export async function loadLanguage(lang: string) {
  if (!i18n.hasResourceBundle(lang, 'common')) {
    const translations = await import(`./locales/${lang}/common.json`);
    i18n.addResourceBundle(lang, 'common', translations);
  }
}

export default i18n;
```

**Usage:**

```typescript
import { loadLanguage } from '@/i18n';

async function changeToSpanish() {
  await loadLanguage('es');
  await i18n.changeLanguage('es');
}
```

### 2. Translation Caching

**Problem:** Fetching translations from server is slow.

**Solution:** Cache translations in AsyncStorage.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getCachedTranslations(lang: string) {
  const key = `@translations_${lang}`;
  const cached = await AsyncStorage.getItem(key);
  return cached ? JSON.parse(cached) : null;
}

async function cacheTranslations(lang: string, data: object) {
  const key = `@translations_${lang}`;
  await AsyncStorage.setItem(key, JSON.stringify(data));
}
```

### 3. Avoid Re-renders

**Problem:** Language change causes entire app to re-render.

**Solution:** Use React.memo and useMemo.

```typescript
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const HomeScreen = React.memo(() => {
  const { t } = useTranslation('home');

  const title = useMemo(() => t('title'), [t]);

  return <Text>{title}</Text>;
});
```

### 4. Measure Performance

**Track bundle size:**

```bash
# Build production bundle
npx expo export --platform ios

# Check bundle size
du -h dist/
```

**Track translation loading time:**

```typescript
import { performance } from 'perf_hooks';

async function loadTranslationsWithMetrics(lang: string) {
  const start = performance.now();
  await loadLanguage(lang);
  const end = performance.now();

  console.log(`Loaded ${lang} in ${end - start}ms`);
}
```

**Set Performance Budgets:**

- Translation file size: < 50KB per language
- Language switching time: < 200ms
- Initial load time increase: < 100ms

---

## Resources

### Official Documentation

- [Expo Localization Docs](https://docs.expo.dev/guides/localization/)
- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [React Native I18nManager](https://reactnative.dev/docs/next/i18nmanager)

### Tutorials and Guides

- [Phrase: React Native Localization Guide](https://phrase.com/blog/posts/react-native-i18n-with-expo-and-i18next-part-1/)
- [Medium: Internationalizing React Native with i18next](https://medium.com/@vandetho/an-easy-to-internationalize-your-mobile-app-using-expo-router-and-i18next-react-4b13a408b52c)
- [GeekyAnts: Implementing RTL in React Native Expo](https://geekyants.com/blog/implementing-rtl-right-to-left-in-react-native-expo---a-step-by-step-guide)
- [DEV: i18n in React Native with Expo](https://dev.to/lucasferreiralimax/i18n-in-react-native-with-expo-2j0j)
- [AutoLocalise: Best Practices for React Native Localization](https://www.autolocalise.com/blog/react-native-expo-localization-best-practice)

### Tools and Libraries

- **i18next** - Core i18n framework
- **react-i18next** - React bindings
- **expo-localization** - Device locale detection
- **Intl API** - Built-in formatting (dates, numbers, currencies)
- **i18n Ally (VS Code Extension)** - Translation management in VS Code

### Translation Services

- **DeepL** - High-quality machine translation
- **Google Translate API** - Widely used translation API
- **Lokalise** - Translation management platform
- **Crowdin** - Collaborative translation platform
- **Phrase** - Localization platform for developers

### Testing Tools

- **Detox** - E2E testing for React Native
- **Maestro** - Mobile UI testing framework
- **Appium** - Cross-platform mobile testing

---

## Appendix A: Translation Workflow

### For Developers

1. **Add new feature with English text**
2. **Extract strings to translation files**
   - Add keys to `i18n/locales/en/*.json`
   - Use `useTranslation` hook in components
3. **Test with English**
4. **Submit for translation**
   - Export English JSON to translation service
   - OR use AI translation (DeepL, Google Translate)
5. **Import translated files**
   - Add translations to respective locale folders
6. **Test with all languages**
7. **Commit and push**

### For Translators

1. **Receive English JSON file**
2. **Translate all values (keep keys unchanged)**
3. **Maintain placeholders** (e.g., `{{count}}`, `{{name}}`)
4. **Return translated JSON**
5. **Developer imports and tests**

### Automation Options

**Option 1: GitHub Actions + DeepL**

```yaml
# .github/workflows/translate.yml
name: Auto Translate

on:
  push:
    paths:
      - 'i18n/locales/en/**'

jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Translate to Spanish
        run: |
          # Use DeepL API to translate en -> es
          # ...
      - name: Commit translations
        run: |
          git add i18n/locales/es/
          git commit -m "Auto-translate to Spanish"
          git push
```

**Option 2: Pre-commit Hook**

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check if English translations changed
if git diff --cached --name-only | grep "i18n/locales/en/"; then
  echo "English translations changed. Remember to update other languages!"
  # Optional: Auto-translate using script
fi
```

---

## Appendix B: Common i18n Patterns

### Pattern 1: Conditional Text

```typescript
const { t } = useTranslation('home');

const message = isCompleted
  ? t('stair.completed')
  : t('stair.in_progress');
```

### Pattern 2: Lists with Interpolation

```typescript
const { t } = useTranslation('settings');

const features = [
  t('features.offline_mode'),
  t('features.speech_recognition'),
  t('features.personalized_lessons'),
];

return (
  <FlatList
    data={features}
    renderItem={({ item }) => <Text>{item}</Text>}
  />
);
```

### Pattern 3: Error Messages

```typescript
const { t } = useTranslation('errors');

try {
  await saveData();
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    showError(t('network_error'));
  } else if (error.code === 'AUTH_ERROR') {
    showError(t('auth_error'));
  } else {
    showError(t('unknown_error'));
  }
}
```

### Pattern 4: Forms with Validation

```typescript
const { t } = useTranslation('common');

const schema = yup.object({
  email: yup
    .string()
    .email(t('validation.invalid_email'))
    .required(t('validation.required')),
  password: yup
    .string()
    .min(8, t('validation.password_too_short', { min: 8 }))
    .required(t('validation.required')),
});
```

---

## Appendix C: TypeScript Support

### Generate Types from Translations

**Install i18next-parser:**

```bash
npm install --save-dev i18next-parser
```

**Create config:**

```javascript
// i18next-parser.config.js
module.exports = {
  locales: ['en', 'es', 'fr', 'ar', 'he'],
  output: 'i18n/locales/$LOCALE/$NAMESPACE.json',
  input: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
};
```

**Generate types:**

```typescript
// i18n/types.ts
import en from './locales/en/common.json';

export type TranslationKeys = keyof typeof en;
```

**Use with TypeScript:**

```typescript
import { useTranslation } from 'react-i18next';
import type { TranslationKeys } from '@/i18n/types';

function MyComponent() {
  const { t } = useTranslation('common');

  // TypeScript autocomplete for keys!
  const text = t('buttons.continue');

  return <Text>{text}</Text>;
}
```

---

## Conclusion

This i18n master plan provides a complete roadmap for internationalizing the Vox Language App. By following this phased approach, the app will support 10+ languages, including RTL languages, while maintaining excellent performance and user experience.

**Key Takeaways:**

1. **Use i18next + react-i18next + expo-localization** for the most robust, well-supported solution
2. **Organize translations by namespace** (common, home, practice, etc.) for better code splitting
3. **Implement RTL support early** for Arabic and Hebrew users
4. **Persist language preferences** using AsyncStorage
5. **Test thoroughly** across all languages and devices
6. **Optimize bundle size** with lazy loading
7. **Follow migration phases** to avoid overwhelming scope

**Next Steps:**

1. Review and approve this plan
2. Begin Phase 1 (Foundation) implementation
3. Create initial English translation files
4. Set up language switching UI
5. Migrate one screen as a proof-of-concept
6. Iterate and refine based on learnings

---

**Document Status:** Ready for Review
**Last Updated:** December 12, 2025
**Version:** 1.0
