# Feature Completion Checklist

Use this checklist before marking any feature as complete.

## Instructions

Go through each item and verify. Output:

```
✅ FEATURE COMPLETION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: [Feature Name]

Functionality:
[✅/❌] Works as expected
[✅/❌] Edge cases handled
[✅/❌] Error states handled
[✅/❌] Loading states shown

Offline:
[✅/❌] Works without internet (if applicable)
[✅/❌] Data syncs when online

UI/UX:
[✅/❌] Follows dark mode design
[✅/❌] Animations smooth (60fps)
[✅/❌] Touch targets ≥44px
[✅/❌] Accessible labels present

Code Quality:
[✅/❌] TypeScript - no any types
[✅/❌] No console.logs left
[✅/❌] Components properly named

Testing:
[✅/❌] Tested on iOS
[✅/❌] Tested manually (happy path)
[✅/❌] Tested error scenarios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to mark complete: [Yes/No]
Missing: [List any failing items]
```

## Quick Checklist (Copy-Paste)

```
## Pre-Complete Checklist for [Feature]

### Functionality
- [ ] Works as expected
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states shown

### Offline (if applicable)
- [ ] Works without internet
- [ ] Syncs when back online

### UI/UX
- [ ] Dark mode design
- [ ] Smooth animations
- [ ] Touch targets ≥44px
- [ ] Accessibility labels

### Code
- [ ] TypeScript clean
- [ ] No debug logs
- [ ] Proper naming

### Testing
- [ ] iOS tested
- [ ] Happy path works
- [ ] Errors handled
```

## Critical Items (Must Pass)

These MUST be true before marking complete:
1. Feature works on iOS
2. Works offline (if applicable)
3. No crashes or errors
4. Follows dark mode colors
