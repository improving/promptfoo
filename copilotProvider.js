const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// copilot -p takes its prompt as an argument and ignores piped stdin, so the full
// prompt is written to a temp file and copilot is told to read it. This keeps the
// command line short and avoids the Windows length limit (ENAMETOOLONG).
class CopilotProvider {
  constructor(options) {
    this.providerId = options.id || 'copilot-custom';
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

    let fullPrompt = prompt;
    if (isGraderMode) {
      let systemMsg, userMsg;
      try {
        const messages = JSON.parse(prompt);
        const systemMessage = messages.find(m => m.role === 'system');
        const userMessage = messages.find(m => m.role === 'user');
        if (!systemMessage || !userMessage) {
          throw new Error('Missing system or user message');
        }
        systemMsg = systemMessage.content;
        userMsg = userMessage.content;
      } catch (e) {
        systemMsg = 'You are an evaluator. Respond with only valid JSON: {"pass": bool, "score": 0.0-1.0, "reason": "string"}';
        userMsg = prompt;
      }
      // copilot has no --system-prompt, so system and user are combined
      fullPrompt = `${systemMsg}\n\n${userMsg}`;
    }

    const tmpFile = path.join(os.tmpdir(), `copilot-prompt-${Date.now()}-${process.pid}.txt`);

    try {
      fs.writeFileSync(tmpFile, fullPrompt, 'utf8');

      const instruction = `Read the file ${tmpFile} and follow the instructions in it.`;
      const args = ['-p', instruction, '--allow-all-tools', '--add-dir', os.tmpdir(), '--silent'];
      const model = this.config.model || '';
      if (model) {
        args.push('--model', model);
      }

      return await new Promise((resolve) => {
        const child = spawn('copilot', args, { stdio: ['ignore', 'pipe', 'pipe'] });
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
            resolve({ error: stdout || stderr || `copilot exited with code ${code}` });
          } else {
            resolve({ output: stdout });
          }
        });
      });
    } finally {
      try {
        fs.unlinkSync(tmpFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

module.exports = CopilotProvider;
