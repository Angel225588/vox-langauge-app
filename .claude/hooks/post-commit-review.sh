#!/bin/bash
# Post-commit code review trigger for Vox Language App
# This script triggers after git commit commands

# Parse the tool input from stdin
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# Check if this is a git commit command
if [[ "$COMMAND" == *"git commit"* ]]; then
    # Get project directory
    PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

    # Get the latest commit info
    LATEST_COMMIT=$(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")
    COMMIT_MSG=$(git -C "$PROJECT_DIR" log -1 --format="%s" 2>/dev/null || echo "unknown")

    # Create review log entry
    REVIEW_LOG="$PROJECT_DIR/.claude/review-log.md"

    {
        echo ""
        echo "## Commit Review Triggered"
        echo "- **Commit**: $LATEST_COMMIT"
        echo "- **Message**: $COMMIT_MSG"
        echo "- **Time**: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "- **Status**: Pending review via /master-review"
        echo ""
    } >> "$REVIEW_LOG"

    # Output instruction for Claude to see
    echo "REVIEW_TRIGGERED: Commit $LATEST_COMMIT ready for review. Run /master-review for full analysis."

    exit 0
fi

exit 0
