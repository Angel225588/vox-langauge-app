# i18n Agent Task Cards

## Quick Reference for Specialized Agents

---

## Agent A: Infrastructure Agent

### Mission
Set up the foundational i18n system that all other agents depend on.

### Priority: CRITICAL (Phase 1 - Blocks Everything)

### Tasks Checklist

```
[ ] 1. Install dependencies
    Command: npx expo install expo-localization
    Command: npm install --legacy-peer-deps i18next react-i18next

[ ] 2. Create folder structure
    mkdir -p i18n/locales/en i18n/utils i18n/hooks lib/storage

[ ] 3. Create i18n/index.ts
    - Import and configure i18next
    - Define SUPPORTED_LANGUAGES array (10 languages)
    - Export initializeI18n() async function
    - Export SupportedLanguage type
    - Configure namespaces: common, home, practice, settings, errors, rewards

[ ] 4. Create i18n/types.ts
    - TypeScript types for translation keys
    - Export TranslationKeys type

[ ] 5. Create lib/storage/languageStorage.ts
    - saveLanguagePreference(language)
    - getLanguagePreference(): Promise<string | null>
    - clearLanguagePreference()
    - Use AsyncStorage with key '@vox_language_preference'

[ ] 6. Create i18n/utils/formatters.ts
    - formatDate(date, locale)
    - formatTime(date, locale)
    - formatNumber(value, locale)
    - formatPercent(value, locale)
    - formatCurrency(value, locale, currency)
    - formatRelativeTime(date, locale)

[ ] 7. Create i18n/utils/rtl.ts
    - isRTLLanguage(languageCode): boolean
    - isRTL(): boolean (from I18nManager)
    - setRTL(enabled): void
    - allowRTL(allowed): void

[ ] 8. Create i18n/utils/languageDetector.ts
    - getDeviceLanguage(): SupportedLanguage
    - Use expo-localization

[ ] 9. Create i18n/hooks/useLanguage.ts
    - currentLanguage
    - changeLanguage(language)
    - isRTL
    - Handle RTL switch with restart prompt

[ ] 10. Create i18n/hooks/useRTL.ts
    - isRTL state
    - RTL-aware styles helper

[ ] 11. Update app/_layout.tsx
    - Import initializeI18n
    - Add i18nReady state
    - Call initializeI18n in useEffect
    - Block render until ready
```

### Completion Signal
When done, update `docs/i18n-implementation-plan.md`:
```
## Phase 1 Status: COMPLETE
Agent A completed: [DATE]
```

---

## Agent B: Content/Translation Agent

### Mission
Extract all hardcoded strings and create translation files for all supported languages.

### Priority: HIGH (Phase 2-3 - Enables UI Migration)

### Dependencies
- Agent A must complete Phase 1 first

### Tasks Checklist

```
[ ] 1. Audit codebase for hardcoded strings
    Command: grep -r "\"[A-Z]" app/ components/ --include="*.tsx"
    Document all strings found

[ ] 2. Create i18n/locales/en/common.json
    Keys to include:
    - app_name
    - loading
    - buttons.* (continue, cancel, save, back, next, submit, retry)
    - validation.* (required, invalid_email, password_too_short, etc.)

[ ] 3. Create i18n/locales/en/onboarding.json
    Keys for each screen:
    - index.* (welcome screen)
    - languages.* (language selection)
    - login.* / signup.*
    - your_level.*
    - your_why.*
    - your_commitment.*
    - ready.*

[ ] 4. Create i18n/locales/en/home.json
    Keys to include:
    - title ("My Roadmap")
    - stats.* (points, streak)
    - stair_card.* (locked, current, completed, vocabulary_count)
    - quick_practice.*

[ ] 5. Create i18n/locales/en/practice.json
    Keys for each card type:
    - cards.single_vocab.*
    - cards.fill_blank.*
    - cards.speaking.*
    - cards.comparison.*
    - cards.role_play.*
    - cards.sentence_scramble.*
    - cards.teleprompter.*
    - feedback.* (excellent, great, good, needs_practice)
    - completion.*

[ ] 6. Create i18n/locales/en/settings.json
    Keys to include:
    - title
    - language_selection
    - restart_required / restart_message / restart_now
    - account.* / notifications.* / privacy.*

[ ] 7. Create i18n/locales/en/errors.json
    Keys to include:
    - network_error
    - auth_error
    - unknown_error
    - timeout
    - validation errors

[ ] 8. Create i18n/locales/en/rewards.json
    Keys to include:
    - points.* (earned, total)
    - streak.* (current, record)
    - achievements.*
    - leaderboard.*

[ ] 9. Create Spanish (es) translations
    Copy en/ structure to es/
    Translate all values (keep keys identical)

[ ] 10. Create French (fr) translations
    Copy en/ structure to fr/
    Translate all values

[ ] 11. Create Arabic (ar) translations
    Copy en/ structure to ar/
    Translate all values
    Note: RTL language

[ ] 12. Create Hebrew (he) translations
    Copy en/ structure to he/
    Translate all values
    Note: RTL language

[ ] 13. Create remaining languages (Phase 7)
    - German (de)
    - Portuguese (pt)
    - Chinese (zh)
    - Japanese (ja)
    - Korean (ko)
```

### Translation Guidelines
- Keep {{variables}} unchanged: `{{count}}`, `{{name}}`
- Use pluralization suffixes: `_plural` for plural forms
- Test special characters render correctly
- Consider text expansion (German 30% longer than English)

### Completion Signal
When each language is complete, update status:
```
## Translation Status
- [x] English (en) - COMPLETE
- [x] Spanish (es) - COMPLETE
- [ ] French (fr) - IN PROGRESS
```

---

## Agent C: UI/UX Migration Agent

### Mission
Update all React components to use the i18n translation system.

### Priority: HIGH (Phase 3-4)

### Dependencies
- Agent A must complete i18n config
- Agent B must complete EN translations for target screens

### Migration Pattern

```typescript
// BEFORE
<Text style={styles.title}>My Roadmap</Text>
<Text>{points} points</Text>

// AFTER
import { useTranslation } from 'react-i18next';

function Screen() {
  const { t } = useTranslation('home');

  return (
    <>
      <Text style={styles.title}>{t('title')}</Text>
      <Text>{t('stats.points', { count: points })}</Text>
    </>
  );
}
```

### Tasks Checklist

```
[ ] 1. Migrate onboarding screens
    [ ] app/(auth)/onboarding-v2/index.tsx
    [ ] app/(auth)/onboarding-v2/languages.tsx
    [ ] app/(auth)/onboarding-v2/login.tsx
    [ ] app/(auth)/onboarding-v2/signup.tsx
    [ ] app/(auth)/onboarding-v2/ready.tsx
    [ ] app/(auth)/onboarding-v2/your-commitment.tsx
    [ ] app/(auth)/onboarding-v2/your-level.tsx
    [ ] app/(auth)/onboarding-v2/your-why.tsx

[ ] 2. Migrate tab screens
    [ ] app/(tabs)/home.tsx
    [ ] app/(tabs)/practice.tsx
    [ ] app/(tabs)/profile.tsx

[ ] 3. Migrate practice cards
    [ ] components/cards/ComparisonCard.tsx
    [ ] components/cards/FillInBlankCard.tsx
    [ ] components/cards/ReadingResultsCard.tsx
    [ ] components/cards/RolePlayCard.tsx
    [ ] components/cards/SentenceScrambleCard.tsx
    [ ] components/cards/SpeakingCard.tsx
    [ ] components/cards/TeleprompterCard.tsx
    [ ] components/cards/TextInputCard.tsx
    [ ] components/cards/QuizCard.tsx
    [ ] components/cards/SpeakingResultsCard.tsx

[ ] 4. Migrate vocabulary cards
    [ ] components/cards/vocabulary/AudioQuizCard.tsx
    [ ] components/cards/vocabulary/IntroductionCard.tsx
    [ ] components/cards/vocabulary/ListeningCard.tsx
    [ ] components/cards/vocabulary/SpeakingCard.tsx
    [ ] components/cards/vocabulary/TypingCard.tsx
    [ ] components/cards/vocabulary/VocabularyCardFlow.tsx

[ ] 5. Migrate UI components
    [ ] components/ui/Button (if has text)
    [ ] components/ui/Dialog.tsx
    [ ] components/ui/Modal.tsx
    [ ] components/ui/Toast.tsx
    [ ] components/ui/TeleprompterControls.tsx
    [ ] components/ui/TeleprompterSettings.tsx

[ ] 6. Create LanguageSwitcher component
    File: components/LanguageSwitcher.tsx
    - Display all 10 languages with flags
    - Show native name and English name
    - Highlight current selection
    - Call useLanguage().changeLanguage on select
    - Handle RTL language switch (show restart prompt)

[ ] 7. Integrate LanguageSwitcher
    [ ] Add to Settings screen
    [ ] Add to Profile screen (optional)
    [ ] Add to onboarding language selection
```

### Verification Commands
```bash
# Find remaining hardcoded strings
grep -r "\"[A-Z][a-z]" app/ components/ --include="*.tsx" | grep -v "import\|export\|const\|type"

# Verify useTranslation usage
grep -r "useTranslation" app/ components/ --include="*.tsx" | wc -l
```

### Completion Signal
Each migrated file should have:
- `import { useTranslation } from 'react-i18next';`
- `const { t } = useTranslation('namespace');`
- Zero hardcoded user-facing strings

---

## Agent D: RTL Support Agent

### Mission
Ensure the app displays correctly in Right-to-Left languages (Arabic, Hebrew).

### Priority: MEDIUM (Phase 5)

### Dependencies
- Agent C must complete component migration
- Agent B must complete ar/he translations

### Tasks Checklist

```
[ ] 1. Update app.json for RTL
    Add to ios.infoPlist:
    "CFBundleAllowMixedLocalizations": true

[ ] 2. Audit styles for left/right
    Command: grep -r "Left\|Right" components/ app/ --include="*.tsx"

    Replace:
    - paddingLeft → paddingStart
    - paddingRight → paddingEnd
    - marginLeft → marginStart
    - marginRight → marginEnd
    - left → start
    - right → end
    - borderLeftWidth → borderStartWidth
    - borderRightWidth → borderEndWidth

[ ] 3. Fix flexDirection for RTL
    Components that need conditional flex:

    // If content should mirror in RTL:
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'

[ ] 4. Handle directional icons
    Create utility or update Icon component:

    function DirectionalIcon({ name, ...props }) {
      const isRTL = I18nManager.isRTL;
      const rtlIcons = ['chevron-left', 'arrow-left', 'arrow-right'];

      if (rtlIcons.includes(name)) {
        return <Icon
          name={name}
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          {...props}
        />;
      }
      return <Icon name={name} {...props} />;
    }

[ ] 5. Update navigation icons
    [ ] Back button in headers
    [ ] Tab bar icons (if directional)
    [ ] Swipe gestures (if any)

[ ] 6. Fix text alignment
    For components that need explicit alignment:
    textAlign: I18nManager.isRTL ? 'right' : 'left'

[ ] 7. Test RTL layouts
    [ ] Onboarding flow in Arabic
    [ ] Home screen in Arabic
    [ ] Practice cards in Arabic
    [ ] Settings with LanguageSwitcher
    [ ] All modals and dialogs

[ ] 8. Handle RTL switch restart
    Verify useLanguage hook:
    - Shows alert when switching to/from RTL
    - Calls I18nManager.forceRTL()
    - Triggers Updates.reloadAsync()

[ ] 9. Document RTL edge cases
    Create: docs/RTL_ISSUES.md
    - List any components that need special handling
    - Document workarounds
```

### Testing Commands
```bash
# Enable RTL for testing (add to _layout.tsx temporarily)
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

# Then restart app
npx expo start -c
```

### Completion Signal
- All paddingLeft/Right replaced with start/end
- Directional icons flip correctly
- Arabic layout mirrors properly
- RTL switch triggers restart flow

---

## Agent E: QA & Testing Agent

### Mission
Validate the i18n implementation through automated and manual testing.

### Priority: HIGH (Phase 6)

### Dependencies
- All other agents must complete their phases

### Tasks Checklist

```
[ ] 1. Create unit tests
    File: __tests__/i18n/translations.test.ts

    Tests:
    - All English keys exist
    - All namespaces load correctly
    - Pluralization works (count: 1 vs count: 5)
    - Interpolation works ({{name}}, {{count}})
    - Missing keys fallback to English

[ ] 2. Create RTL tests
    File: __tests__/i18n/rtl.test.ts

    Tests:
    - isRTLLanguage('ar') returns true
    - isRTLLanguage('en') returns false
    - setRTL updates I18nManager

[ ] 3. Create formatter tests
    File: __tests__/i18n/formatters.test.ts

    Tests:
    - formatDate in en, es, ar
    - formatNumber in en (1,234) vs de (1.234)
    - formatRelativeTime

[ ] 4. Create component tests
    File: __tests__/i18n/components/LanguageSwitcher.test.tsx

    Tests:
    - Renders all 10 languages
    - Shows checkmark on current language
    - Calls changeLanguage on press
    - Shows restart alert for RTL

[ ] 5. Manual testing checklist
    For EACH language (en, es, fr, de, ar, he):

    [ ] Onboarding screens display correctly
    [ ] Home screen displays correctly
    [ ] Practice cards display correctly
    [ ] Settings displays correctly
    [ ] No text overflow or truncation
    [ ] Pluralization correct
    [ ] Date/time formats correct
    [ ] Language switch works
    [ ] Preference persists after restart

[ ] 6. RTL-specific testing
    [ ] Arabic: Layout mirrors (right-to-left)
    [ ] Arabic: Back button on right side
    [ ] Arabic: Text aligns right
    [ ] Arabic: Icons flip correctly
    [ ] Hebrew: Same checks as Arabic

[ ] 7. Performance testing
    Measure:
    - Bundle size per language (target: <50KB each)
    - Language switch time (target: <200ms)
    - Initial load time impact (target: <100ms increase)

    Commands:
    npx expo export --platform ios
    du -h dist/

[ ] 8. E2E tests (optional)
    File: e2e/i18n.e2e.ts (Detox or Maestro)

    Test flow:
    1. Open app (English)
    2. Navigate to Settings
    3. Open Language Switcher
    4. Select Spanish
    5. Verify home screen shows Spanish text
    6. Restart app
    7. Verify Spanish persists

[ ] 9. Bug documentation
    Create: docs/I18N_BUGS.md
    - List all bugs found
    - Assign severity (Critical/High/Medium/Low)
    - Track fix status
```

### Test Commands
```bash
# Run all i18n tests
npm test -- --testPathPattern=i18n

# Run with coverage
npm test -- --coverage --testPathPattern=i18n

# Verify no console errors
npx expo start 2>&1 | grep -i "error\|warning"
```

### Completion Signal
- All unit tests pass
- All manual checklist items verified
- Performance budgets met
- Bug list created and triaged

---

## Summary: Agent Coordination Timeline

```
Week 1-2:  Agent A (Infrastructure) - CRITICAL PATH
           └── All other agents blocked

Week 2-3:  Agent B (EN translations) + Agent A (finalize)
           └── Creates translation files for migration

Week 3-4:  Agent B (ES/FR) || Agent C (Migration starts)
           └── Parallel work begins

Week 4-5:  Agent C (Complete migration) + Agent B (AR/HE)
           └── UI fully i18n enabled

Week 5-6:  Agent D (RTL Support)
           └── Arabic/Hebrew layouts

Week 6-7:  Agent E (QA & Testing)
           └── Full validation

Week 8+:   Agent B (Additional languages)
           └── de, pt, zh, ja, ko
```

---

**Document Status:** Ready for Agent Assignment
**Last Updated:** December 16, 2025
