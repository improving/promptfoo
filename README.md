# Promptfoo EDD Demonstration

Evaluation Driven Development (EDD) demonstration using promptfoo with multiple CLI providers and evaluation methodologies.

## Overview

This project demonstrates how to use promptfoo for systematic prompt testing with different AI CLI providers and evaluation types, following Evaluation Driven Development principles.

## Files Structure

```
promptfoo/
├── README.md                    # This file
├── promptfooconfig.yaml         # Main promptfoo configuration
├── prompt-under-test.md         # The prompt being tested
├── eval-script.js               # Custom JavaScript evaluation functions
│
├── Execution providers (generate responses under test)
├── claude_code_provider.ps1     # Claude Code CLI provider (PowerShell)
├── devin_provider.ps1           # Devin CLI provider (PowerShell)
├── gh_copilot_provider.ps1      # GitHub Copilot CLI provider (PowerShell)
├── claude_code_provider.sh      # Claude Code CLI provider (bash)
├── devin_provider.sh            # Devin CLI provider (bash)
├── gh_copilot_provider.sh       # GitHub Copilot CLI provider (bash)
│
└── Rubric graders (judge LLMs used to score llm-rubric assertions)
    ├── claude_grader.ps1        # Claude Code CLI grader (PowerShell)
    ├── devin_grader.ps1         # Devin CLI grader (PowerShell)
    └── gh_copilot_grader.ps1    # GitHub Copilot CLI grader (PowerShell)
```

## Quick Start

### Run Evaluations
```bash
npx promptfoo eval
```

### View Results
Results are generated in `results.html` after each evaluation run.

## Configuration

### Active Provider
The configuration currently uses **Devin CLI (PowerShell version)** as the default provider.

### Available Providers
All providers have both bash (Linux/Mac) and PowerShell (Windows) versions:

- **Claude Code CLI** - Anthropic's Claude Code assistant
- **Devin CLI** - Cognition's Devin AI assistant  
- **GitHub Copilot CLI** - GitHub's Copilot assistant

To switch providers, edit `promptfooconfig.yaml` and uncomment the desired provider.

## Evaluation Types

This demonstration includes three types of evaluations:

### 1. Deterministic Evaluations (contains/equiv)
Simple pass/fail checks based on content presence or exact matches.

**Example:**
```yaml
- vars:
    query: 'What is the difference between let and const in JavaScript?'
  assert:
    - type: contains
      value: 'let'
    - type: contains
      value: 'const'
    - type: contains
      value: 'reassign'
```

### 2. Rubric-Based Evaluations (`llm-rubric`)

Uses a judge LLM to score the response against natural language criteria. Each assertion evaluates a single, independent quality dimension, giving granular pass/fail per dimension in the web UI rather than one opaque score.

#### Grader Provider

The judge LLM is configured under `defaultTest.options.provider`. This project uses `claude_grader.ps1`, which parses the JSON chat array promptfoo sends to graders and passes system and user messages separately via `claude --system-prompt`. Commented alternatives for Devin and GitHub Copilot are in the config.

> **Why a separate grader script?** Promptfoo sends graders a JSON chat array
> (`[{"role":"system",...}, {"role":"user",...}]`), not a plain text string.
> A plain execution provider would pass that raw JSON blob as the prompt, confusing
> the model. The grader scripts parse the array and route each part correctly.
>
> Claude supports `--system-prompt` to replace its default context entirely.
> Devin and Copilot don't have an equivalent flag, so their graders concatenate
> the system instructions and user message into one combined prompt instead.

#### Assertion Parameters

Each `llm-rubric` assertion accepts these parameters:

| Parameter   | Type          | Required | Description |
|-------------|---------------|----------|-------------|
| `value`     | string        | Yes      | The natural language criterion to evaluate. Write it as an observable statement: "The response includes a code example" not "the response is good". |
| `threshold` | float 0.0–1.0 | No       | Minimum score to pass this assertion. Defaults to `0.5` if omitted. |
| `metric`    | string        | No       | Label shown in the promptfoo web UI results table — useful for identifying which dimension failed. |
| `weight`    | number        | No       | Relative importance when computing the test's overall weighted score. `weight: 2` counts twice as much as `weight: 1`. Defaults to `1`. |

#### Example

```yaml
- vars:
    query: 'Explain the concept of recursion in programming'
  description: 'Recursion explanation - rubric with per-dimension scoring'
  assert:
    # Core definition — highest weight; must score at least 0.7
    - type: llm-rubric
      value: The response clearly defines what recursion is in plain language a non-expert could understand
      threshold: 0.7
      metric: clarity
      weight: 2

    # Code example — important for a technical explanation
    - type: llm-rubric
      value: The response includes at least one working code example that demonstrates recursion
      threshold: 0.7
      metric: code-example
      weight: 1.5

    # Base/recursive case — critical for correctness; strict threshold
    - type: llm-rubric
      value: The response explicitly explains both the base case (stopping condition) and the recursive case
      threshold: 0.8
      metric: base-case-explained
      weight: 2

    # Risks — nice to have; lower threshold and weight
    - type: llm-rubric
      value: The response mentions stack overflow or call stack depth as a potential pitfall
      threshold: 0.4
      metric: mentions-risks
      weight: 1
```

#### Design Guidance

- **Set `threshold` based on criticality.** Core requirements warrant `0.7`–`0.8`. Nice-to-have criteria can use `0.4`–`0.5`.
- **Use `weight` to express relative importance.** Don't just vary threshold — a critical dimension should also carry more weight so it influences the overall score proportionally.
- **One criterion per assertion.** Splitting dimensions into separate `llm-rubric` entries gives individual pass/fail per dimension in the web UI, rather than one opaque rubric score.
- **Write criteria as observable statements.** "The response includes at least one working code example" is better than "the response is well-explained".

### 3. Script-Based Evaluations

Custom deterministic evaluation logic written in JavaScript. Functions live in `eval-script.js` and are referenced directly from the config using `file://path:functionName` syntax.

**Example:**
```yaml
- vars:
    query: 'Write a function to validate an email address'
  description: 'Email validation - script-based eval'
  assert:
    - type: javascript
      value: file://eval-script.js:hasCodeFormatting
    - type: javascript
      value: file://eval-script.js:explainsWhy
    - type: javascript
      value: file://eval-script.js:mentionsBestPractices
```

**Functions in `eval-script.js`:**

| Function | Checks |
|----------|--------|
| `hasCodeFormatting(output)` | Response contains a fenced code block |
| `explainsWhy(output)` | Response includes reasoning words (because, since, therefore…) |
| `mentionsBestPractices(output)` | Response mentions best practices or common patterns |
| `isConcise(output)` | Response is under 2000 characters |

Each function returns `{ pass, score, reason }` so promptfoo can display a meaningful failure message.

**Adding your own functions:**
```javascript
module.exports = {
  yourCustomCheck: (output) => {
    const pass = /* your logic */;
    return { pass, score: pass ? 1 : 0, reason: 'Explanation shown on failure' };
  }
};
```

## PowerShell Provider Scripts

The PowerShell scripts (`*.ps1`) are Windows equivalents of the bash scripts and provide the same functionality:

- **claude_code_provider.ps1** - Claude Code CLI with model selection
- **devin_provider.ps1** - Devin CLI with model selection
- **gh_copilot_provider.ps1** - GitHub Copilot CLI with model selection

All PowerShell scripts:
- Use `ConvertFrom-Json` instead of `jq` for JSON parsing
- Include proper error handling for JSON parsing failures
- Handle empty config objects correctly
- Require `-ExecutionPolicy Bypass` flag for Windows execution policies

### Running PowerShell Scripts Directly
```powershell
powershell -ExecutionPolicy Bypass -File .\devin_provider.ps1 "Your prompt here" '{"config": {"model": "SWE-1.6"}}' "context"
```

## Prompt Under Test

The `prompt-under-test.md` file contains the actual prompt being evaluated. Using an external file provides:

- Version control for prompt changes
- Easy editing without modifying configuration
- Reusability across different test configurations
- Clear separation between test logic and prompt content

## EDD Workflow

1. **Define Success Criteria** - Determine what makes a prompt "good" for your use case
2. **Create Evaluation Tests** - Set up deterministic, rubric, and script-based tests
3. **Write Initial Prompt** - Create your prompt in the external file
4. **Run Evaluations** - Test against your criteria
5. **Iterate** - Refine prompt based on evaluation results
6. **Regression Test** - Ensure changes don't break existing successful tests

## Test Cases

The current configuration includes 6 test cases:

1. **JavaScript concepts** (deterministic) - Tests let vs const explanation
2. **Python string reversal** (deterministic) - Tests Python coding knowledge
3. **Recursion explanation** (rubric) - Evaluates completeness of recursion explanation
4. **Error handling best practices** (rubric) - Assesses JavaScript error handling knowledge
5. **Email validation function** (script-based) - Tests code generation quality
6. **Equality operators** (script-based) - Tests explanation quality with custom assertions

## Customization

### For Your Own Use Case

1. Replace `prompt-under-test.md` with your own prompt
2. Modify test cases in `promptfooconfig.yaml` to match your domain
3. Add custom evaluation functions to `eval-script.js` as needed
4. Adjust rubric criteria to reflect your quality standards
5. Switch to your preferred AI provider in the configuration

### Adding New Evaluation Functions

Edit `eval-script.js` to add custom functions:

```javascript
module.exports = {
  yourCustomFunction: (output) => {
    // Your evaluation logic
    return {
      pass: true/false,
      score: 0-1,
      reason: 'Explanation of result'
    };
  }
};
```

## Requirements

- Node.js (for promptfoo)
- PowerShell (on Windows) or bash (on Linux/Mac)
- CLI tools for the providers you want to use:
  - Claude Code CLI (`claude`)
  - Devin CLI (`devin`)
  - GitHub Copilot CLI (`gh copilot`)

## Troubleshooting

### PowerShell Execution Policy
If you get execution policy errors on Windows, use the `-ExecutionPolicy Bypass` flag or run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Provider CLI Installation
Ensure your chosen CLI tool is properly installed and accessible in your PATH.

### JSON Parsing Errors
The PowerShell scripts include error handling for JSON parsing. If you encounter issues, verify the config format is correct.

## License

This demonstration is provided as-is for educational and development purposes.