#!/bin/bash
# Devin CLI provider for promptfoo with model selection

PROMPT="$1"
OPTIONS="$2"
CONTEXT="$3"

# Parse OPTIONS to get model from config
MODEL=$(echo "$OPTIONS" | jq -r '.config.model // "SWE-1.6"' 2>/dev/null)

# Call devin cli with single-turn mode and specified model
# Use -- before prompt to properly separate it from flags
devin -p --model "$MODEL" -- "$PROMPT"