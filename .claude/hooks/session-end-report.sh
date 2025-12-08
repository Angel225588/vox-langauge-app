#!/bin/bash
# Session end daily report generator for Vox Language App
# Generates summary when Claude Code session ends

# Parse session info from arguments/stdin
SESSION_ID="${1:-unknown}"
INPUT=$(cat 2>/dev/null || echo "{}")
REASON=$(echo "$INPUT" | jq -r '.reason // "session_end"' 2>/dev/null || echo "session_end")
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""' 2>/dev/null || echo "")

# Get project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Create reports directory
REPORT_DIR="$PROJECT_DIR/docs/daily-reports"
mkdir -p "$REPORT_DIR"

# Today's date
TODAY=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)

# Report filename
REPORT_FILE="$REPORT_DIR/$TODAY.md"

# Check if report exists, create header if not
if [ ! -f "$REPORT_FILE" ]; then
    {
        echo "# Vox Daily Report - $TODAY"
        echo ""
        echo "## Summary"
        echo ""
        echo "| Metric | Value |"
        echo "|--------|-------|"
        echo "| Sessions | 0 |"
        echo "| Commits | $(git log --since='$TODAY 00:00:00' --oneline 2>/dev/null | wc -l | tr -d ' ') |"
        echo ""
        echo "## Sessions"
        echo ""
    } > "$REPORT_FILE"
fi

# Get git stats for this session
RECENT_COMMITS=$(git log --since="2 hours ago" --oneline 2>/dev/null | head -5 || echo "No recent commits")
CHANGED_FILES=$(git diff --stat HEAD~3 2>/dev/null | tail -1 || echo "No changes tracked")

# Append session entry
{
    echo "### Session at $TIME"
    echo ""
    echo "- **Session ID**: \`$SESSION_ID\`"
    echo "- **Exit Reason**: $REASON"
    echo ""
    echo "**Recent Commits**:"
    echo "\`\`\`"
    echo "$RECENT_COMMITS"
    echo "\`\`\`"
    echo ""
    echo "**Files Changed**:"
    echo "\`\`\`"
    echo "$CHANGED_FILES"
    echo "\`\`\`"
    echo ""
    echo "---"
    echo ""
} >> "$REPORT_FILE"

# Update session count in header
SESSION_COUNT=$(grep -c "### Session at" "$REPORT_FILE" 2>/dev/null || echo "1")

# Output summary
echo "DAILY_REPORT: Session logged. Total sessions today: $SESSION_COUNT. Report: $REPORT_FILE"

exit 0
