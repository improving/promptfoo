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
├── AGENTS.md                    # Project configuration notes
│
└── Provider Files (loaded by promptfoo via file://)
    ├── claudeProvider.js        # Claude Code CLI (provider + grader)
    ├── devinProvider.js         # Devin CLI (provider + grader)
    ├── copilotProvider.js       # GitHub Copilot CLI (provider + grader)
    ├── agy.js                   # Google Antigravity (AGY) CLI (exec, not yet converted)
    └── kiro.js                  # Kiro CLI (exec, not yet converted)
```

## Quick Start

### Run Evaluations
```bash
npx promptfoo eval --no-cache
```

> **Always use `--no-cache`** when running evaluations. This project uses external provider files (`devinProvider.js`, `claudeProvider.js`, etc.) and an external prompt file (`prompt-under-test.md`). Promptfoo's cache keys are based on the provider string and prompt text — they do not detect changes inside referenced files. Running without `--no-cache` can return stale results after you modify a script or the prompt file.

### View Results
Results are generated in `results.html` after each evaluation run.

## Configuration

### Active Provider
The configuration currently uses **Devin CLI** as the default provider for both generating responses and grading rubric evaluations.

### Available Providers
The file-based providers are Node.js modules that work on Windows, Linux, and Mac:

- **Claude Code CLI** (`claudeProvider.js`) - Anthropic's Claude Code assistant
- **Devin CLI** (`devinProvider.js`) - Cognition's Devin AI assistant
- **GitHub Copilot CLI** (`copilotProvider.js`) - GitHub's Copilot assistant
- **Google Antigravity CLI** (`agy.js`) - Google's Antigravity assistant
- **Kiro CLI** (`kiro.js`) - Amazon's Kiro AI assistant

To switch providers, edit `promptfooconfig.yaml` and uncomment the desired provider.

### How the Providers Work

Each file-based provider exposes `callApi(prompt)`, which auto-detects the mode from the prompt format:

- **Provider mode**: When the prompt is plain text, the provider passes the text to the CLI tool
- **Grader mode**: When the prompt is a JSON array `[{role, content}, ...]`, the provider parses the chat array and combines or routes the system/user messages for the CLI tool

Prompts never go on the command line for Claude (stdin), Devin (temp file), or Copilot (temp file), so long grader prompts don't hit the Windows `ENAMETOOLONG` limit.

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

The judge LLM is configured under `defaultTest.options.provider`. This project uses `devinProvider.js` (which auto-detects grader mode), but the file-based providers for Claude and GitHub Copilot are also available, as are the exec-based Google Antigravity (AGY) and Kiro scripts.

> **How grader mode works**: When the combined scripts receive a JSON chat array
> (`[{"role":"system",...}, {"role":"user",...}]`), they automatically enter grader mode,
> parse the array, and route each part correctly to the CLI tool.
>
> Claude Code supports `--system-prompt` to replace its default context entirely,
> keeping system and user messages separate. Devin, GitHub Copilot, Google Antigravity (AGY), and Kiro don't have an
> equivalent flag, so their scripts concatenate the system instructions and user
> message into one combined prompt instead.

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

For example, the `matchSchema-script.js` file contains a function that checks if the output matches a given JSON schema, and demonstrates how a custom function might be added. 

## Testing Providers Directly

To test a provider without a full eval, run a single prompt against it with `npx promptfoo eval --no-cache` using a small config that points at the provider file, e.g. `providers: ['file://devinProvider.js']`.

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

- Node.js (for promptfoo and CLI scripts)
- CLI tools for the providers you want to use:
  - Claude Code CLI (`claude`)
  - Devin CLI (`devin`)
  - GitHub Copilot CLI (`gh copilot`)
  - Google Antigravity CLI (`agy`)
  - Kiro CLI (`kiro-cli`)
  - _or_ a local Ollama instance (`ollama`)

## Troubleshooting

### Provider CLI Installation
Ensure your chosen CLI tool is properly installed and accessible in your PATH.

### Script Execution Issues
If you encounter issues running the Node.js scripts:
- Verify Node.js is installed: `node --version`
- Check script permissions: `ls -la *.js` (should be executable)
- Test scripts directly using the examples in "Running Scripts Directly" section

### Configuration Errors
If promptfoo reports configuration errors:
- Verify YAML syntax in `promptfooconfig.yaml`
- Check that the referenced script files exist
- Ensure model names match what your CLI tool supports
- For Ollama, ensure the local instance is running and accessible, and that you've set the correct model name and port in the configuration

## License

This demonstration is provided as-is for educational and development purposes.