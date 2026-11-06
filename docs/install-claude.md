# Claude Code CLI Installation

Claude Code is Anthropic's AI coding assistant for the terminal. The `claude` command is used by `claudeProvider.js` in this project.

## Requirements

- macOS 13.0+ or Windows 10 1809+ / Windows Server 2019+
- 4 GB+ RAM, x64 or ARM64 processor
- An Anthropic account at [claude.ai](https://claude.ai)
- Internet connection

---

## macOS

### Option 1: Install Script (Recommended)

Open Terminal and run:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Restart your terminal, then verify:

```bash
claude --version
```

### Option 2: Homebrew

```bash
brew install --cask claude-code
```

---

## Windows

### Option 1: PowerShell Script (Recommended)

Open **PowerShell** and run:

```powershell
irm https://claude.ai/install.ps1 | iex
```

> **Note:** Make sure your prompt shows `PS C:\` — if it shows `$` you are in Git Bash, not PowerShell. Run this command in PowerShell only.

Restart your terminal, then verify:

```powershell
claude --version
```

### Option 2: WinGet

```powershell
winget install Anthropic.ClaudeCode
```

### Option 3: CMD

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

> **Tip:** For the best experience on Windows, install [Git for Windows](https://gitforwindows.org/) so Claude Code can use Bash as its shell tool. Without it, Claude Code falls back to PowerShell.

---

## Authentication

After installation, start Claude Code in your project directory:

```bash
cd your-project
claude
```

On first launch you will be prompted to log in with your Anthropic account or API key.

---

## Verify Installation

```bash
claude --version
claude -p "What is 2+2?"
```

---

## Usage in This Project

This project uses `claudeProvider.js`, which sends the user prompt on stdin and passes the system prompt in a temp file:

```bash
# Provider mode (prompt on stdin)
echo "your prompt" | claude -p --model haiku

# Grader mode (system prompt via file)
echo "user message" | claude -p --model haiku --system-prompt-file <tempfile>
```


---

## More Information

- Documentation: [docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code)
- Setup guide: [docs.anthropic.com/en/docs/claude-code/setup](https://docs.anthropic.com/en/docs/claude-code/setup)
