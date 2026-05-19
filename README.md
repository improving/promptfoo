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
├── claude_code_provider.ps1     # Claude Code CLI provider (PowerShell)
├── devin_provider.ps1           # Devin CLI provider (PowerShell)
├── gh_copilot_provider.ps1      # GitHub Copilot CLI provider (PowerShell)
├── claude_code_provider.sh      # Claude Code CLI provider (bash)
├── devin_provider.sh            # Devin CLI provider (bash)
└── gh_copilot_provider.sh       # GitHub Copilot CLI provider (bash)
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

### 2. Rubric-Based Evaluations
Qualitative assessment using predefined criteria and scoring scales.

**Example:**
```yaml
- vars:
    query: 'Explain the concept of recursion in programming'
  rubric: |
    Evaluate the response on a scale of 1-5:
    1. Does it define recursion clearly?
    2. Does it provide a code example?
    3. Does it explain the base case and recursive case?
    4. Does it mention potential issues (stack overflow)?
    5. Is the explanation easy to understand?
```

### 3. Script-Based Evaluations
Custom evaluation logic using JavaScript for complex checks.

**Inline JavaScript:**
```yaml
- vars:
    query: 'Write a function to validate an email address'
  assert:
    - type: javascript
      value: 'output.includes("```") || output.includes("function")'
    - type: javascript
      value: 'output.length > 100'
```

**External JavaScript Functions:**
The `eval-script.js` file contains reusable evaluation functions that can be used for more complex scenarios.

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