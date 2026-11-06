# Promptfoo Configuration

This repository contains promptfoo configuration for evaluating AI CLI tools.

## Important: Default Configuration

**Before committing any changes, always ensure that Devin CLI is set as the default:**
- **Provider**: `file://devinProvider.js`
- **Grader**: `file://devinProvider.js`

This ensures consistent evaluation results and maintains the intended baseline configuration.

## Configuration Files

- `promptfooconfig.yaml` - Main promptfoo configuration
- `prompt-under-test.md` - The prompt being evaluated
- `eval-script.js` - Custom JavaScript evaluation functions

## Provider Files

Providers are loaded with `file://` so prompts reach the code through the JS API, not the command line. This avoids Windows `ENAMETOOLONG` errors on long grader prompts.

- `devinProvider.js` - Devin CLI (provider + grader)
- `copilotProvider.js` - GitHub Copilot CLI (provider + grader)
- `claudeProvider.js` - Claude Code CLI (provider + grader)

### Other Scripts (exec, not yet converted)
Combined scripts that auto-detect mode based on prompt format:
- **Grader mode**: Prompt is JSON array `[{role, content}, ...]`
- **Provider mode**: Prompt is plain text

- `agy.js` - Google Antigravity (AGY) CLI (provider + grader)
- `kiro.js` - Kiro CLI (provider + grader)
- `ollama.js` - Local Ollama instance (provider + grader)

## Running Evaluations

```bash
npx promptfoo eval --no-cache
```

> Always use `--no-cache` — promptfoo cannot detect changes inside external script files or `prompt-under-test.md`, so cached results may be stale.

## Viewing Results

Results are saved to `results.html` by default. Open this file in a web browser to view the evaluation results.
