const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Prompts are passed to callApi and sent to claude on stdin, so long prompts never
// touch the Windows command-line length limit (ENAMETOOLONG).
class ClaudeProvider {
  constructor(options) {
    this.providerId = options.id || 'claude-custom';
    this.config = options.config || {};
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt) {
    let isGraderMode = false;
    try {
      const parsed = JSON.parse(prompt);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].role) {
        isGraderMode = true;
      }
    } catch (e) {
      // Not JSON, provider mode
    }

    let userText = prompt;
    let systemText;
    let model = this.config.model || 'haiku';

    if (isGraderMode) {
      try {
        const messages = JSON.parse(prompt);
        const systemMessage = messages.find(m => m.role === 'system');
        const userMessage = messages.find(m => m.role === 'user');
        if (!systemMessage || !userMessage) {
          throw new Error('Missing system or user message');
        }
        systemText = systemMessage.content;
        userText = userMessage.content;
      } catch (e) {
        systemText = 'You are an evaluator. Respond with only valid JSON: {"pass": bool, "score": 0.0-1.0, "reason": "string"}';
        userText = prompt;
      }
      model = 'haiku';
    }

    const sysFile = systemText !== undefined
      ? path.join(os.tmpdir(), `claude-system-${Date.now()}-${process.pid}.txt`)
      : null;
    const args = ['-p', '--model', model];

    try {
      if (sysFile) {
        fs.writeFileSync(sysFile, systemText, 'utf8');
        // --system-prompt-file replaces Claude Code's default system prompt entirely
        args.push('--system-prompt-file', sysFile);
      }

      return await new Promise((resolve) => {
        const child = spawn('claude', args, { stdio: ['pipe', 'pipe', 'pipe'] });
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');

        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (data) => { stdout += data; });
        child.stderr.on('data', (data) => { stderr += data; });

        child.on('error', (err) => {
          resolve({ error: err.message });
        });

        child.on('close', (code) => {
          if (code !== 0) {
            resolve({ error: stdout || stderr || `claude exited with code ${code}` });
          } else {
            resolve({ output: stdout });
          }
        });

        child.stdin.on('error', () => {
          // Ignore EPIPE if claude exits before reading stdin; the close handler reports the failure
        });
        child.stdin.end(userText, 'utf8');
      });
    } finally {
      if (sysFile) {
        fs.rmSync(sysFile, { force: true });
      }
    }
  }
}

module.exports = ClaudeProvider;
