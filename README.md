# Promptfoo Config with Devin CLI

This project provides a basic promptfoo configuration that uses Devin CLI as a provider for running LLM evaluations.

## Files

- `promptfooconfig.yaml` - Main promptfoo configuration file
- `devin_provider.sh` - Shell script that wraps Devin CLI with model selection support

## Usage

1. Ensure you have promptfoo installed:
   ```bash
   npm install -g promptfoo
   ```

2. Ensure Devin CLI is installed and configured

3. Run the evaluation:
   ```bash
   promptfoo eval
   ```

4. View the results in the generated `results.html` file

## Configuration

The `promptfooconfig.yaml` file includes:

- **Prompts**: Three example prompts testing different types of queries
- **Provider**: Uses `exec: ./devin_provider.sh` with model configuration to call Devin CLI
- **Tests**: Four test cases with different variables (query, code, task)
- **Output**: Results are saved to `results.html`

## Model Selection

The configuration defaults to using the SWE-1.6 model. To use a different model, modify the `model` value in the provider config section of `promptfooconfig.yaml`:

```yaml
providers:
  - id: 'exec: ./devin_provider.sh'
    config:
      model: 'YOUR_MODEL_NAME'
```

Replace `YOUR_MODEL_NAME` with the desired Devin model. The shell script reads this configuration and passes it to Devin CLI using the `--model` flag.

## Customization

You can modify the configuration to:

- Add more prompts in the `prompts` section
- Add more test cases in the `tests` section
- Change the output format (HTML, JSON, CSV)
- Add assertions to validate responses
- Change the model by modifying the `model` value in the provider config
- Extend the shell script to handle additional OPTIONS or CONTEXT parameters