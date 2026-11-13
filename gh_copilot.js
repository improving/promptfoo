#!/usr/bin/env node
// Combined GitHub Copilot CLI provider and grader for promptfoo
//
// Auto-detects mode based on prompt format:
// - Grader mode: Prompt is JSON array [{role, content}, ...]
// - Provider mode: Prompt is plain text
//
// Grader: Parses JSON chat array, concatenates system + user messages (no --system-prompt)
// Provider: Passes prompt directly to the copilot executable

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Diagnostic log: promptfoo's `exec:` provider only surfaces a truncated
// "Command failed: ..." message on failure, which hides the real cause.
// Full spawn failures (non-zero exit, spawn error) are appended here so the
// actual root cause can be inspected after a failing eval run.
const DEBUG_LOG = path.join(__dirname, 'gh_copilot-debug.log');
function logDebug(entry) {
  try {
    fs.appendFileSync(DEBUG_LOG, `\n[${new Date().toISOString()}] ${entry}\n`);
  } catch (e) {
    // Logging must never crash the provider.
  }
}
process.on('uncaughtException', (err) => {
  logDebug(`UNCAUGHT EXCEPTION: ${err && err.stack}`);
  throw err;
});

// copilot needs to be pointed at the project it should analyze (via its own
// -C flag) so prompt-relative paths resolve. Set via `PROJECT_ROOT=../DMO`
// (or an absolute path) before running `promptfoo eval`; defaults to the cwd
// promptfoo was invoked from when unset.
const PROJECT_ROOT = path.resolve(process.cwd(), process.env.PROJECT_ROOT || '.');

// On Windows, .cmd files (like copilot.cmd) cannot be spawned directly by Node.js.
// cmd.exe /c can resolve them, but cmd.exe's own line-based parser splits a
// command at every literal newline (even inside quotes), truncating any
// multiline prompt. PowerShell doesn't have that problem: passing the prompt
// as a single-quoted string literal preserves embedded newlines verbatim.
//
// Must use pwsh.exe (PowerShell 7+), NOT powershell.exe (Windows PowerShell 5.1):
// `copilot` resolves through a chain of nested `&`-invoked .ps1 wrapper scripts
// (VS Code's copilot.ps1 -> npm's copilot.ps1 -> node npm-loader.js). Windows
// PowerShell 5.1's legacy native-argument marshaling re-stringifies/re-splits
// $args across those hops, breaking a multi-line prompt containing quotes into
// many separate argv entries ("your prompt was not quoted" error from the CLI).
// pwsh.exe preserves array arguments intact across all hops. Falls back to
// powershell.exe only if pwsh isn't installed (older prompts may still break).
const IS_WIN = process.platform === 'win32';
function psQuote(arg) {
  return `'${String(arg).replace(/'/g, "''")}'`;
}
function hasPwsh() {
  const probe = spawnSync('pwsh.exe', ['-NoProfile', '-NonInteractive', '-Command', 'exit 0'], { stdio: 'ignore' });
  return !probe.error;
}
function spawnCopilot(args, opts) {
  if (!IS_WIN) return spawnSync('copilot', args, opts);
  // Without the trailing `exit $LASTEXITCODE`, the shell always exits 0
  // itself, masking copilot's real exit code (e.g. invalid --model errors).
  const script = `& copilot ${args.map(psQuote).join(' ')}; exit $LASTEXITCODE`;
  const shell = hasPwsh() ? 'pwsh.exe' : 'powershell.exe';
  const result = spawnSync(shell, ['-NoProfile', '-NonInteractive', '-Command', script], opts);
  if (result.error || result.status !== 0) {
    logDebug(`spawnCopilot via ${shell} failed: status=${result.status} signal=${result.signal} ` +
      `error=${result.error && result.error.stack} ` +
      `stdout=${JSON.stringify(result.stdout)} stderr=${JSON.stringify(result.stderr)}`);
  }
  return result;
}

const prompt = process.argv[2];
const options = process.argv[3];
const context = process.argv[4];

// Detect mode: if prompt looks like a JSON array, use grader mode
let isGraderMode = false;
try {
  const parsed = JSON.parse(prompt);
  if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].role) {
    isGraderMode = true;
  }
} catch (e) {
  // Not JSON, so provider mode
}

if (isGraderMode) {
  // ===== GRADER MODE =====
  // Parse OPTIONS to get model from config
  let model = ''; // Default to empty (no model flag)
  if (options && options !== '{}') {
    try {
      const optionsObj = JSON.parse(options);
      if (optionsObj.config && optionsObj.config.model) {
        model = optionsObj.config.model;
      }
    } catch (e) {
      // If JSON parsing fails, use default
      model = '';
    }
  }

  // Parse the JSON chat message array that promptfoo sends to graders
  let systemMsg, userMsg;
  try {
    const messages = JSON.parse(prompt);
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessage = messages.find(m => m.role === 'user');

    if (systemMessage && userMessage) {
      systemMsg = systemMessage.content;
      userMsg = userMessage.content;
    } else {
      throw new Error('Missing system or user message');
    }
  } catch (e) {
    // Fallback: treat the whole thing as a user message
    systemMsg = 'You are an evaluator. Respond with only valid JSON: {"pass": bool, "score": 0.0-1.0, "reason": "string"}';
    userMsg = prompt;
  }

  // Combine system and user into one prompt (copilot has no --system-prompt)
  const fullPrompt = `${systemMsg}\n\n${userMsg}`;

  // Build command with optional model flag
  const args = ['--prompt', fullPrompt, '--allow-all-tools', '--silent', '-C', PROJECT_ROOT];
  if (model) {
    args.push('--model', model);
  }

  const result = spawnCopilot(args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(result.stdout || result.stderr);
    process.exit(result.status || 1);
  }

  console.log(result.stdout);
} else {
  // ===== PROVIDER MODE =====
  // Parse OPTIONS to get model from config
  let model = ''; // Default to empty (no model flag)
  if (options && options !== '{}') {
    try {
      const optionsObj = JSON.parse(options);
      if (optionsObj.config && optionsObj.config.model) {
        model = optionsObj.config.model;
      }
    } catch (e) {
      // If JSON parsing fails, use default
      model = '';
    }
  }

  // Build command with optional model flag
  const args = ['--prompt', prompt, '--allow-all-tools', '--silent', '-C', PROJECT_ROOT];
  if (model) {
    args.push('--model', model);
  }

  const result = spawnCopilot(args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(result.stdout || result.stderr);
    process.exit(result.status || 1);
  }

  console.log(result.stdout);
}
