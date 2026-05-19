#!/bin/bash
# Devin CLI grader for promptfoo llm-rubric assertions
#
# promptfoo sends graders a JSON chat array: [{role, content}, ...]
# Devin's -p flag doesn't have a --system-prompt equivalent, so we
# concatenate the system instructions and user message into one prompt.

PROMPT="$1"
OPTIONS="$2"

# Parse OPTIONS to get model from config
MODEL=$(echo "$OPTIONS" | jq -r '.config.model // "SWE-1.6"' 2>/dev/null)

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

devin -p --model "$MODEL" -- "$FULL_PROMPT"
