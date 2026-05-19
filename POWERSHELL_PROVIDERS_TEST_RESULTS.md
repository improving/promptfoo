# PowerShell Providers Test Results

## Summary
Successfully created and tested PowerShell equivalents of the bash CLI provider scripts for promptfoo.

## Files Created
1. `claude_code_provider.ps1` - Claude Code CLI provider (PowerShell)
2. `devin_provider.ps1` - Devin CLI provider (PowerShell)
3. `gh_copilot_provider.ps1` - GitHub Copilot CLI provider (PowerShell)

## Test Results

### Direct Command Line Testing

#### Claude Code CLI Provider ✓
```powershell
powershell -ExecutionPolicy Bypass -File "claude_code_provider.ps1" "What is 2+2?" '{"config": {"model": "haiku"}}' "test context"
```
**Result:** `2 + 2 = 4` ✓

```powershell
powershell -ExecutionPolicy Bypass -File "claude_code_provider.ps1" "What is 4+4?" '{}' "test context"
```
**Result:** `8` ✓ (default model handling works)

#### Devin CLI Provider ✓
```powershell
powershell -ExecutionPolicy Bypass -File "devin_provider.ps1" "What is 2+2?" '{"config": {"model": "SWE-1.6"}}' "test context"
```
**Result:** `2+2 = 4` ✓

```powershell
powershell -ExecutionPolicy Bypass -File "devin_provider.ps1" "What is 3+3?" '{}' "test context"
```
**Result:** `3+3 = 6` ✓ (default model handling works)

#### GitHub Copilot CLI Provider ✓
```powershell
powershell -ExecutionPolicy Bypass -File "gh_copilot_provider.ps1" "What is 2+2?" '{"config": {"model": "claude-haiku-4.5"}}' "test context"
```
**Result:** `2 + 2 = **4**` ✓

```powershell
powershell -ExecutionPolicy Bypass -File "gh_copilot_provider.ps1" "What is 3+3?" '{}' "test context"
```
**Result:** `6` ✓ (default handling works)

### Promptfoo Integration Testing

#### Claude Code CLI Provider ✓
**Configuration:**
```yaml
- id: 'exec: powershell -ExecutionPolicy Bypass -File ./claude_code_provider.ps1'
  config:
    model: 'haiku'
```
**Result:** Successfully ran 12 test cases through promptfoo ✓

#### Devin CLI Provider ✓
**Configuration:**
```yaml
- id: 'exec: powershell -ExecutionPolicy Bypass -File ./devin_provider.ps1'
  config:
    model: 'SWE-1.6'
```
**Result:** Successfully ran 12 test cases through promptfoo ✓

#### GitHub Copilot CLI Provider ✓
**Configuration:**
```yaml
- id: 'exec: powershell -ExecutionPolicy Bypass -File ./gh_copilot_provider.ps1'
  config:
    model: 'claude-haiku-4.5'
```
**Result:** Successfully ran 12 test cases through promptfoo ✓

## Working Configurations for promptfooconfig.yaml

### Claude Code CLI (PowerShell)
```yaml
- id: 'exec: powershell -ExecutionPolicy Bypass -File ./claude_code_provider.ps1'
  config:
    model: 'haiku'
```

### Devin CLI (PowerShell)
```yaml
- id: 'exec: powershell -ExecutionPolicy Bypass -File ./devin_provider.ps1'
  config:
    model: 'SWE-1.6'
```

### GitHub Copilot CLI (PowerShell)
```yaml
- id: 'exec: powershell -ExecutionPolicy Bypass -File ./gh_copilot_provider.ps1'
  config:
    model: 'claude-haiku-4.5'
```

## Key Improvements Made
1. **Default model handling**: All scripts now properly handle missing or empty config by using default models
2. **JSON parsing**: Used PowerShell's `ConvertFrom-Json` instead of `jq`
3. **Error handling**: Added try-catch blocks for JSON parsing failures
4. **Empty config handling**: Scripts now handle `{}` empty JSON objects correctly

## Usage Notes
- All PowerShell scripts require `-ExecutionPolicy Bypass` flag to run without execution policy errors
- The scripts accept the same arguments as the bash versions: PROMPT, OPTIONS, CONTEXT
- Default models are used when config is not provided or JSON parsing fails
- All three PowerShell providers have been tested and work correctly both directly and through promptfoo