# GitHub Copilot CLI Installation

GitHub Copilot CLI (`copilot`) is GitHub's AI coding assistant for the terminal. The `copilot` command is used by `copilotProvider.js` in this project.

> **Important:** This project uses the standalone `copilot` CLI — **not** the `gh copilot` extension for the GitHub CLI. Make sure you install the correct package as described below.

## Requirements

- Node.js 22 or later (for npm installation)
- An active GitHub Copilot subscription (Pro, Pro+, Business, or Enterprise)
- Internet connection

---

## macOS

### Option 1: npm (Recommended, all platforms)

Requires Node.js 22+. Install with:

```bash
npm install -g @github/copilot
```

Verify installation:

```bash
copilot --version
```

### Option 2: Homebrew

```bash
brew install copilot-cli
```

### Option 3: Install Script

```bash
curl -fsSL https://gh.io/copilot-install | bash
```

---

## Windows

### Option 1: npm (Recommended)

Requires Node.js 22+. Open PowerShell or Command Prompt and run:

```powershell
npm install -g @github/copilot
```

> **Note:** If you have `ignore-scripts=true` in your `~/.npmrc`, use:
> ```powershell
> npm_config_ignore_scripts=false npm install -g @github/copilot
> ```

Verify installation:

```powershell
copilot --version
```

### Option 2: WinGet

```powershell
winget install GitHub.Copilot
```

---

## Authentication

After installation, launch the Copilot CLI and log in:

```bash
copilot
```

At the interactive prompt, type:

```
/login
```

Follow the browser-based authentication flow to sign in with your GitHub account.

---

## Verify Installation

```bash
copilot --version
copilot -p "What is 2+2?" -s
```

---

## Usage in This Project

This project uses `copilotProvider.js`, which calls the `copilot` executable (not `gh copilot`). `copilot -p` ignores piped stdin, so the prompt is written to a temp file and copilot is told to read it:

```bash
copilot -p "Read the file <tempfile> and follow the instructions in it." --allow-all-tools --add-dir <tmpdir> --silent
```

`--add-dir` limits file access to the temp directory. The project no longer uses `cmd.exe` routing; `copilot.exe` is spawned directly.

---

## More Information

- GitHub Docs: [docs.github.com/copilot/how-tos/set-up/install-copilot-cli](https://docs.github.com/copilot/how-tos/set-up/install-copilot-cli)
- npm package: [npmjs.com/package/@github/copilot](https://www.npmjs.com/package/@github/copilot)
- GitHub repo: [github.com/github/copilot-cli](https://github.com/github/copilot-cli)
