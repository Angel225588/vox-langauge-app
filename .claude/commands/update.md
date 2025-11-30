# Quick Status Update

Fast command to update project documentation after a session.

## What This Does

1. Updates `docs/PROJECT_STATUS.md` with today's date
2. Summarizes what was accomplished
3. Updates phase completion status
4. Adds commit references

## Instructions

1. Read `docs/PROJECT_STATUS.md`
2. Check recent git commits: `git log --oneline -10`
3. Ask user: "What did we accomplish this session?"
4. Update the status document accordingly
5. Commit the update

## Update Template

When updating PROJECT_STATUS.md:

```markdown
**Last Updated**: [TODAY'S DATE]
**Current Phase**: [Phase X] [STATUS]

## Recent Updates ([DATE])
- [What was done]
- [What was done]
- Commit: `[hash]`
```

## Quick Questions to Ask

1. "What features were completed?"
2. "Any bugs fixed?"
3. "What's next priority?"
4. "Any blockers to note?"

---

**Start by reading the current PROJECT_STATUS.md and recent commits.**
