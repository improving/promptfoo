# Devin CLI Installation

Devin for Terminal is a local coding agent that runs directly in your terminal. The `devin` command is used by `devin.js` in this project.

## Requirements

- An active Devin account at [devin.ai](https://devin.ai)
- Internet connection for authentication

---

## macOS

### Option 1: Install Script (Recommended)

Open Terminal and run:

```bash
curl -fsSL https://cli.devin.ai/install.sh | bash
```

Restart your terminal after installation, then verify:

```bash
devin --version
```

### Option 2: Homebrew

```bash
brew install devin
```

---

## Windows

### Option 1: PowerShell Script (Recommended)

Open **PowerShell** (not Git Bash or CMD) and run:

```powershell
irm https://static.devin.ai/cli/setup.ps1 | iex
```

> **Note:** If you see an execution policy error, run this first:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

After installation, restart your terminal and verify:

```powershell
devin --version
```

### Option 2: Direct Download

Download the standalone installer from [cli.devin.ai](https://cli.devin.ai):

- **x86_64** (most Windows PCs)
- **ARM64** (Windows on ARM)

Run the installer and follow the prompts.

---

## Authentication

After installation, run the setup wizard to authenticate:

```bash
devin setup
```

This will walk you through logging in with your Devin account.

---

## Verify Installation

```bash
devin --version
devin -p -- "What is 2+2?"
```

---

## Usage in This Project

This project uses `devin.js` which calls:

```bash
# Provider mode
devin -p --permission-mode auto --model SWE-1.6 -- "your prompt"

# Grader mode
devin -p --model SWE-1.6 -- "your prompt"
```

---

## More Information

- Documentation: [cli.devin.ai/docs](https://cli.devin.ai/docs)
- Troubleshooting: [cli.devin.ai/docs/troubleshooting](https://cli.devin.ai/docs/troubleshooting)
