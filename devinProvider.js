const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

class DevinProvider {
  constructor(options) {
    this.providerId = options.id || 'devin-custom';
    this.config = options.config || {};
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt, context, options) {
    const model = this.config.model || 'SWE-1.6';
    const forcePromptFile = this.config.forcePromptFile || false;
    const trackTokens = this.config.trackTokens !== false; // default true
    const promptFileSizeThreshold = this.config.promptFileSizeThreshold || 32000;

    let isGraderMode = false;
    try {
      const parsed = JSON.parse(prompt);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].role) {
        isGraderMode = true;
      }
    } catch (e) {
      // Not JSON, provider mode
    }

    let fullPrompt;

    if (isGraderMode) {
      let systemMsg, userMsg;
      try {
        const messages = JSON.parse(prompt);
        const systemMessage = messages.find(m => m.role === 'system');
        const userMessage = messages.find(m => m.role === 'user');

        if (!systemMessage || !userMessage) {
          throw new Error('Missing system or user message in grader mode');
        }

        systemMsg = systemMessage.content;
        userMsg = userMessage.content;
      } catch (e) {
        systemMsg = 'You are an evaluator. Respond with only valid JSON: {"pass": bool, "score": 0.0-1.0, "reason": "string"}';
        userMsg = prompt;
      }
      fullPrompt = `${systemMsg}\n\n${userMsg}`;
    } else {
      fullPrompt = prompt;
    }

    const shouldUseFile = forcePromptFile || fullPrompt.length > promptFileSizeThreshold;
    let tmpFile, exportFile;
    
    if (shouldUseFile) {
      tmpFile = path.join(os.tmpdir(), `devin-prompt-${Date.now()}-${process.pid}.txt`);
      fs.writeFileSync(tmpFile, fullPrompt, 'utf8');
    }

    if (trackTokens) {
      exportFile = path.join(os.tmpdir(), `devin-export-${Date.now()}-${process.pid}.json`);
    }

    try {
      const args = ['-p', '--model', model];
      

      if (trackTokens) {
        args.push('--export', exportFile);
      }

      if (!isGraderMode) {
        args.push('--permission-mode', 'auto');
      }

      if (shouldUseFile) {
        args.push('--prompt-file', tmpFile);
      } else {
        args.push('--', fullPrompt);
      }

      const result = await new Promise((resolve, reject) => {
        const child = spawn('devin', args, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => { stdout += data; });
        child.stderr.on('data', (data) => { stderr += data; });

        child.on('error', (err) => {
          resolve({ error: err.message, tokenUsage: trackTokens ? parseTokenUsage(exportFile) : undefined });
        });

        child.on('close', (code) => {
          if (code !== 0) {
            resolve({ error: stdout || stderr || `devin exited with code ${code}`, tokenUsage: trackTokens ? parseTokenUsage(exportFile) : undefined });
          } else {

            let output = stdout;
            if (isGraderMode) {
              const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonMatch) {
                output = jsonMatch[1].trim();
              }
            }

            resolve({ output, tokenUsage: trackTokens ? parseTokenUsage(exportFile) : undefined });
          }
        });
      });

      return result;
    } finally {
      try {
        if (tmpFile) fs.unlinkSync(tmpFile);
        if (exportFile) fs.unlinkSync(exportFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

function parseTokenUsage(exportFilePath) {
  try {
    const data = JSON.parse(fs.readFileSync(exportFilePath, 'utf8'));
    const agentSteps = (data.steps || []).filter(s => s.source === 'agent');
    let promptTokens = 0, completionTokens = 0;
    for (const step of agentSteps) {
      const m = step.metadata?.metrics;
      if (m) {
        promptTokens += (m.input_tokens || 0) + (m.cache_read_tokens || 0) + (m.cache_creation_tokens || 0);
        completionTokens += (m.output_tokens || 0);
      }
    }
    return { total: promptTokens + completionTokens, prompt: promptTokens, completion: completionTokens };
  } catch {
    return { total: 0, prompt: 0, completion: 0 };
  }
}

module.exports = DevinProvider;
