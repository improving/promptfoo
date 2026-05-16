# Promptfoo Config with Devin CLI, GitHub Copilot, and Claude Code

This project provides a basic promptfoo configuration that supports Devin CLI, GitHub Copilot CLI, and Claude Code CLI as providers for running LLM evaluations.

## Files

- `promptfooconfig.yaml` - Main promptfoo configuration file
- `devin_provider.sh` - Shell script that wraps Devin CLI with model selection support
- `gh_copilot_provider.sh` - Shell script that wraps GitHub Copilot CLI with model selection support
- `claude_code_provider.sh` - Shell script that wraps Claude Code CLI with model selection support

## Usage

1. Ensure you have promptfoo installed:
   ```bash
   npm install -g promptfoo
   ```

2. Ensure your chosen CLI is installed and configured:
   - Devin CLI: https://cli.devin.ai
   - GitHub Copilot CLI: `gh extension install copilot`
   - Claude Code CLI: https://claude.ai/code

3. Run the evaluation:
   ```bash
   promptfoo eval
   ```

4. View the results in the generated `results.html` file

## Configuration

The `promptfooconfig.yaml` file includes:

- **Prompts**: Three example prompts testing different types of queries
- **Providers**: Supports Devin CLI, GitHub Copilot CLI, and Claude Code CLI via shell script wrappers
- **Tests**: Four test cases with different variables (query, code, task)
- **Output**: Results are saved to `results.html`

## Provider Selection

The configuration includes three providers (Claude Code is currently active for testing):

### Devin CLI
```yaml
providers:
  - id: 'exec: ./devin_provider.sh'
    config:
      model: 'SWE-1.6'
```

### GitHub Copilot CLI
```yaml
providers:
  - id: 'exec: ./gh_copilot_provider.sh'
    config:
      model: 'claude-haiku-4.5'
```

### Claude Code CLI
```yaml
providers:
  - id: 'exec: ./claude_code_provider.sh'
    config:
      model: 'haiku'
```

To switch between providers, comment/uncomment the appropriate provider section in `promptfooconfig.yaml`.

## Model Selection

Each provider supports model selection via the `model` config parameter:

- **Devin CLI**: Modify the `model` value (e.g., `SWE-1.6`)
- **GitHub Copilot CLI**: Modify the `model` value (e.g., `claude-haiku-4.5`)
- **Claude Code CLI**: Modify the `model` value (e.g., `haiku`, `sonnet`)

The shell scripts read this configuration and pass it to the respective CLI using the appropriate model flag.

## Customization

You can modify the configuration to:

- Add more prompts in the `prompts` section
- Add more test cases in the `tests` section
- Change the output format (HTML, JSON, CSV)
- Add assertions to validate responses
- Switch between Devin CLI, GitHub Copilot CLI, and Claude Code CLI providers
- Change the model by modifying the `model` value in the provider config
- Extend any shell script to handle additional OPTIONS or CONTEXT parameters
- Add multiple providers to compare results side-by-side