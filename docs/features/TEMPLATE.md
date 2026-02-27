# Feature Spec: [Feature Name]

> **Status**: Draft | In Review | Approved | In Progress | Complete
> **Author**: [Name]
> **Date**: [YYYY-MM-DD]
> **Spec file**: `docs/features/[feature-slug].md`

---

## Layer 1 — Feature Brief

Answer these five questions first. If the feature doesn't survive this layer, stop here.

### 1. What is it?
_One sentence. If you can't say it in one sentence, it's too vague._

> [Answer]

### 2. Who gets the gift?
_Which specific user, in what moment of their journey?_

> [Answer]

### 3. What's the gift?
_What can they do now that they couldn't before? What pain disappears?_

> [Answer]

### 4. Feature Gate Check
_Which criteria does it pass? (must pass at least one)_

- [ ] Helps the user articulate better
- [ ] Prepares them for a real-world scenario
- [ ] Measures or improves communication ability
- [ ] Respects their time and intelligence

> [Explain which and why]

### 5. What happens if we don't build it?
_If "nothing much" — reconsider._

> [Answer]

**Brief verdict**: PROCEED / KILL / NEEDS MORE THINKING

---

## Layer 2 — Full Spec

_Only fill this out if Layer 1 verdict is PROCEED._

### Identity

| Field | Value |
|-------|-------|
| **Name** | [Feature name] |
| **One-liner** | [What it does in one sentence] |
| **Category** | Core Learning / UX / Infrastructure / Analytics / Integration |
| **Phase** | [Which roadmap phase] |

### Purpose

**Problem statement**: What's broken or missing today?

> [Answer]

**User story**: As a [type of user], I want to [action] so that [outcome].

> [Answer]

**Success metric**: How do we measure this worked?

> [Answer — be specific: "X increases by Y%" or "users can do Z"]

### User Experience

**Entry point**: How does the user discover/access this feature?

> [Answer]

**Step-by-step flow**:
1. User does [action]
2. Screen shows [what]
3. User interacts by [how]
4. Result is [outcome]

**Edge cases**:
- What if [scenario]? → [handling]
- What if [scenario]? → [handling]

### Design

**Visual description**: What does the user see? Describe screens, components, states.

> [Answer]

**Design system alignment**:
- Colors: [which tokens]
- Components: [existing components to reuse]
- Animations: [if any]
- New components needed: [list or "none"]

**Mockup reference**: [Figma link, sketch, or ASCII mockup — if available]

### Technical Approach

**Files to create**:
- `path/to/new-file.ts` — [purpose]

**Files to modify**:
- `path/to/existing-file.ts` — [what changes]

**Dependencies**:
- New packages: [list or "none"]
- API calls: [endpoints, Gemini prompts, Supabase queries]
- Data model changes: [new tables, columns, AsyncStorage keys]

**Architecture notes**:

> [How does this fit into the existing system? What patterns to follow?]

### Risks & Guardrails

**Privacy**: Does this collect, store, or transmit new data?
> [Answer — if yes, detail what and get explicit approval]

**Performance**: Could this slow anything down?
> [Answer]

**Breaking changes**: Does this change existing behavior?
> [Answer]

**Scope traps**: What could cause this to grow beyond the spec?
> [Answer — name the temptations and set boundaries]

### Definition of Done

_All boxes must be checked before the feature is considered complete._

- [ ] Core functionality works as described in User Experience
- [ ] Design matches spec (tokens, components, animations)
- [ ] Edge cases handled
- [ ] Tests written and passing
- [ ] No new TypeScript errors (`npx tsc --noEmit`)
- [ ] Privacy check passed (no new data collection without consent)
- [ ] Feature Gate criteria confirmed in practice
- [ ] Spec added to NotebookLM as source
- [ ] [Custom criterion]
- [ ] [Custom criterion]

---

_Template version: 1.0 — Last updated: 2026-02-27_
