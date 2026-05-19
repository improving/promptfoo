#!/bin/bash
# Claude Code CLI grader for promptfoo llm-rubric assertions
#
# promptfoo sends graders a JSON chat array: [{role, content}, ...]
# This script parses that array, routes the system message via --system-prompt
# (which replaces Claude Code's default prompt, stripping project context),
# and passes the user message as the actual prompt.

PROMPT="$1"

# Parse the JSON chat message array that promptfoo sends to graders
if SYSTEM_MSG=$(echo "$PROMPT" | jq -r '.[] | select(.role == "system") | .content' 2>/dev/null) && \
   USER_MSG=$(echo "$PROMPT" | jq -r '.[] | select(.role == "user") | .content' 2>/dev/null); then
    # Successfully parsed both messages
    :
else
    # Fallback: treat the whole thing as a user message
    SYSTEM_MSG="You are an evaluator. Respond with only valid JSON: {\"pass\": bool, \"score\": 0.0-1.0, \"reason\": \"string\"}"
    USER_MSG="$PROMPT"
fi

# --system-prompt replaces Claude Code's default system prompt entirely,
# so the promptfoo rubric grading instructions are used verbatim.
claude -p "$USER_MSG" --system-prompt "$SYSTEM_MSG" --model haiku 2>&1
