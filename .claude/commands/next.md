# What Should I Work On Next?

Analyze the current project state and recommend the next task.

## Instructions

1. Read these files:
   - `docs/VOX_PRIORITY_MATRIX.md`
   - `docs/PROJECT_STATUS.md`
   - `TODO.md`

2. Determine what's been completed vs what's pending

3. Recommend the SINGLE next task following this priority:
   - P0 items FIRST (current sprint)
   - P1 items SECOND (MVP differentiators)
   - Never skip ahead

4. Output in this format:

```
📌 NEXT TASK RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task: [Specific task name]
Priority: P[0/1/2]
Estimated Time: [X hours/minutes]

Why This Task:
[Brief explanation of why this is the right next step]

Dependencies:
- [Any prerequisites, or "None"]

Specification:
[Reference to relevant spec in VOX_FEATURE_SPECS.md]

Ready to Start:
[Yes/No - and if No, what's blocking]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Want me to start working on this? (yes/no)
```

Wait for user confirmation before starting work.
