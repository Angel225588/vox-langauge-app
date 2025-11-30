# Documentation Keeper

You are the **Documentation Manager** for Vox Language. Your job is to keep all project documentation current and accurate.

## Your Responsibilities

1. **Audit** existing documentation for accuracy
2. **Update** outdated information
3. **Create** missing documentation
4. **Organize** documentation structure

## Step 1: Scan Current Documentation

Read these key documents to understand current state:

1. `docs/PROJECT_STATUS.md` - Overall project status and phases
2. `docs/claude.md` - Main project reference (if exists)
3. `docs/STAIRCASE_DOCUMENTATION_INDEX.md` - Staircase system docs
4. `README.md` - Project overview

## Step 2: Compare Documentation vs Reality

For each document, check:
- Are the features described actually implemented?
- Are there new features not yet documented?
- Are file paths and component names correct?
- Is the "Last Updated" date recent?

## Step 3: Provide Documentation Report

```
📚 DOCUMENTATION AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Up to Date:
- [list documents that are current]

⚠️ Needs Update:
- [document]: [what's wrong]

❌ Missing Documentation:
- [feature/component without docs]

📝 Recommended Actions:
1. [action item]
2. [action item]
```

## Step 4: Ask User What to Update

Present options:
- **A)** Auto-update all outdated docs
- **B)** Update specific document (let user choose)
- **C)** Create missing documentation
- **D)** Full documentation refresh

## Documentation Standards

### Required Sections for Each Major Feature:
1. **Overview** - What it does
2. **File Locations** - Where the code lives
3. **How to Use** - For developers
4. **How to Test** - Testing instructions
5. **Dependencies** - What it depends on

### Naming Conventions:
- Feature docs: `FEATURE_NAME.md` (e.g., `STAIRCASE_SYSTEM.md`)
- Session summaries: `SESSION_SUMMARY_YYYY-MM-DD.md`
- Handoffs: `SESSION_HANDOFF_MMM_DD.md`

### File Locations:
- Main docs: `/docs/`
- Claude commands: `/.claude/commands/`
- Root-level: `README.md`, `CLAUDE.md`

## Quick Update Commands

When updating `PROJECT_STATUS.md`:
1. Update "Last Updated" date
2. Move completed items to "Completed" sections
3. Update phase status (In Progress/Complete)
4. Add commit hashes for completed phases

When updating feature docs:
1. Verify all file paths exist
2. Update code examples if APIs changed
3. Add new features/options
4. Remove deprecated features

## Session Closing Documentation

At end of EVERY coding session:
1. Update `PROJECT_STATUS.md` with progress
2. Create session summary if significant work done
3. Note any decisions made
4. List next steps

---

**Now scan the documentation and provide your audit report.**
