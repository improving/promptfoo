#!/bin/bash
# GitHub Copilot CLI grader for promptfoo llm-rubric assertions
#
# promptfoo sends graders a JSON chat array: [{role, content}, ...]
# gh copilot doesn't have a --system-prompt equivalent, so we
# concatenate the system instructions and user message into one prompt.

PROMPT="$1"
OPTIONS="$2"

# Parse OPTIONS to get model from config
MODEL=$(echo "$OPTIONS" | jq -r '.config.model // ""' 2>/dev/null)

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

# Combine system and user into one prompt
FULL_PROMPT="$SYSTEM_MSG

$USER_MSG"

# Build command with optional model flag
if [ -n "$MODEL" ]; then
    gh copilot --prompt "$FULL_PROMPT" --model "$MODEL" --allow-all-tools --silent
else
    gh copilot --prompt "$FULL_PROMPT" --allow-all-tools --silent
fi
