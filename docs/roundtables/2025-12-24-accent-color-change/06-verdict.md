---
date: 2025-12-24
topic: Accent Color Change
decision: APPROVED
confidence: HIGH
unanimous: yes (with conditions)
---

# Final Verdict: Accent Color Change

## Decision
**APPROVED** - Change primary accent from purple (#6366F1) to electric blue (#0036FF)

## Rationale

### Why This Decision
1. **Feature Alignment**: Voice conversation is our highest-priority differentiator (9.5/10). Blue reinforces the communication narrative.
2. **Market Positioning**: Differentiates from Duolingo's purple-adjacent palette; aligns with established voice/communication app aesthetics.
3. **Technical Feasibility**: Design system architecture (95% token-based) makes this a low-risk, high-impact change.
4. **Timing**: Pre-launch is the optimal time to establish brand identity.

### Expert Consensus
| Expert | Position | Confidence |
|--------|----------|------------|
| Technical Architect | SUPPORT | High |
| UX/Design Strategist | SUPPORT | High |
| Product/Business Analyst | SUPPORT | Medium-High |
| Devil's Advocate | CONDITIONAL SUPPORT | Medium |

**Unanimous support with condition**: Complete palette must be defined.

## Approved Color Palette

```typescript
// New Blue Design System
export const colors = {
  primary: {
    DEFAULT: '#0036FF',     // Deep electric blue
    light: '#3D6BFF',       // Hover/active states
    dark: '#0029CC',        // Pressed states
  },

  gradients: {
    primary: ['#0036FF', '#00A3FF'] as const,  // Deep to bright blue
  },

  glow: {
    primary: 'rgba(0, 54, 255, 0.5)',  // Blue glow for shadows/effects
  },

  // UNCHANGED - Keep teal for success/secondary
  secondary: {
    DEFAULT: '#06D6A0',     // Teal (unchanged)
    light: '#4ECDC4',
    dark: '#04B384',
  },
};

// Neomorphism updates
export const neomorphism = {
  accent: '#0036FF',
  accentLight: '#3D6BFF',
  accentGlow: 'rgba(0, 54, 255, 0.5)',
};
```

## Implementation Path

### Phase 1: Update Design System (Immediate)
1. Edit `constants/designSystem.ts` with new blue palette
2. Update all primary color references
3. Update all gradient definitions
4. Update all glow/shadow rgba values

### Phase 2: Visual Verification
1. Test particle sphere animation with blue glow
2. Verify teal secondary still harmonizes
3. Check button states (normal, hover, pressed, disabled)
4. Verify text contrast meets WCAG AA

### Phase 3: Cleanup
1. Search for any hardcoded purple values outside design system
2. Update any component-specific overrides
3. Take new screenshots for documentation (later)

## Risks to Monitor

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missed hardcoded colors | Medium | Grep for old hex values after change |
| Teal clash | Low | Visual review; adjust teal if needed |
| Text contrast issues | Low | WCAG contrast checker validation |
| Glow too intense | Low | Adjust alpha values if needed |

## Success Criteria

- [ ] All UI elements render with new blue
- [ ] Particle sphere animation looks cohesive
- [ ] No visual glitches or color conflicts
- [ ] Teal secondary still works visually
- [ ] Text remains readable on all blue backgrounds

## Quote for Voice (Host Summary)
> "The council has spoken. After rigorous debate, all four experts support transitioning from purple to blue. The Technical Architect confirmed it's a clean two-hour implementation. The UX Strategist validated the visual direction. The Product Analyst aligned it with our market strategy. Even the Devil's Advocate conceded after challenging every assumption. The decision is unanimous: go blue. The voice call feature is our crown jewel - our visual identity should announce that loud and clear."

---

**Decision Status**: FINAL
**Next Action**: Update `constants/designSystem.ts` with approved palette
