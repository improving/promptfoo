# Promptfoo Configuration

This repository contains promptfoo configuration for evaluating AI CLI tools.

## Important: Default Configuration

**Before committing any changes, always ensure that Devin CLI is set as the default for both:**
1. **Provider**: `node ./devin_provider.js`
2. **Grader**: `node ./devin_grader.js`

This ensures consistent evaluation results and maintains the intended baseline configuration.

## Configuration Files

- `promptfooconfig.yaml` - Main promptfoo configuration
- `prompt-under-test.md` - The prompt being evaluated
- `eval-script.js` - Custom JavaScript evaluation functions

## Provider Scripts

### Node.js (Cross-platform) - Active
- `devin_provider.js` - Devin CLI provider
- `gh_copilot_provider.js` - GitHub Copilot CLI provider
- `claude_code_provider.js` - Claude Code CLI provider

### Bash (Linux/Mac) - Legacy
- `devin_provider.sh` - Devin CLI provider
- `gh_copilot_provider.sh` - GitHub Copilot CLI provider
- `claude_code_provider.sh` - Claude Code CLI provider

### PowerShell (Windows) - Legacy
- `devin_provider.ps1` - Devin CLI provider
- `gh_copilot_provider.ps1` - GitHub Copilot CLI provider
- `claude_code_provider.ps1` - Claude Code CLI provider

## Grader Scripts

### Node.js (Cross-platform) - Active
- `devin_grader.js` - Devin CLI grader for llm-rubric assertions
- `gh_copilot_grader.js` - GitHub Copilot CLI grader for llm-rubric assertions
- `claude_grader.js` - Claude Code CLI grader for llm-rubric assertions

### Bash (Linux/Mac) - Legacy
- `devin_grader.sh` - Devin CLI grader for llm-rubric assertions
- `gh_copilot_grader.sh` - GitHub Copilot CLI grader for llm-rubric assertions
- `claude_grader.sh` - Claude Code CLI grader for llm-rubric assertions

### PowerShell (Windows) - Legacy
- `devin_grader.ps1` - Devin CLI grader for llm-rubric assertions
- `gh_copilot_grader.ps1` - GitHub Copilot CLI grader for llm-rubric assertions
- `claude_grader.ps1` - Claude Code CLI grader for llm-rubric assertions

## Running Evaluations

```bash
npx promptfoo eval
```

## Viewing Results

Results are saved to `results.html` by default. Open this file in a web browser to view the evaluation results.
