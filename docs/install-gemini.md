# Gemini CLI Installation

Gemini CLI is Google's AI coding assistant for the terminal. The `gemini` command is used by `gemini.js` in this project.

## Requirements

- Node.js 20 or later
- A Google account (for free-tier access) or a Google Cloud / Gemini API key
- Internet connection

---

## macOS

### Option 1: npm (Recommended, all platforms)

Requires Node.js 20+. Install with:

```bash
npm install -g @google/gemini-cli
```

Verify installation:

```bash
gemini --version
```

### Option 2: Homebrew

```bash
brew install gemini-cli
```

### Option 3: Run Without Installing (npx)

```bash
npx @google/gemini-cli
```

---

## Windows

### Option 1: npm (Recommended)

Requires Node.js 20+. Open PowerShell or Command Prompt and run:

```powershell
npm install -g @google/gemini-cli
```

Verify installation:

```powershell
gemini --version
```

### Option 2: WinGet + npm

If Node.js is not installed, install it first via WinGet, then install Gemini CLI:

```powershell
winget install OpenJS.NodeJS.LTS --silent
npm install -g @google/gemini-cli
```

### Option 3: Run Without Installing (npx)

```powershell
npx @google/gemini-cli
```

---

## Authentication

After installation, launch Gemini CLI to authenticate:

```bash
gemini
```

On first launch, you will be prompted to sign in with a Google account (free tier: 60 requests/min, 1,000 requests/day) or enter a Gemini API key for higher limits.

---

## Verify Installation

```bash
gemini --version
gemini -p "What is 2+2?"
```

---

## Usage in This Project

This project uses `gemini.js` which calls:

```bash
# Provider mode
gemini -p "your prompt"

# With a specific model
gemini -p "your prompt" --model gemini-2.5-pro
```

---

## More Information

- Documentation: [google-gemini.github.io/gemini-cli](https://google-gemini.github.io/gemini-cli/)
- npm package: [npmjs.com/package/@google/gemini-cli](https://www.npmjs.com/package/@google/gemini-cli)
- GitHub repo: [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- Installation guide: [github.com/google-gemini/gemini-cli/blob/main/docs/get-started/installation.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/get-started/installation.md)
