#!/bin/bash
# Claude Code CLI provider for promptfoo with model selection

PROMPT="$1"
OPTIONS="$2"
CONTEXT="$3"

# Parse OPTIONS to get model from config
MODEL=$(echo "$OPTIONS" | jq -r '.config.model // "haiku"' 2>/dev/null)

# Build command with optional model flag
if [ -n "$MODEL" ]; then
  claude -p "$PROMPT" --model "$MODEL"
else
  claude -p "$PROMPT"
fi