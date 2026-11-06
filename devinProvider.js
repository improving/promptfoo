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

        if (systemMessage && userMessage) {
          systemMsg = systemMessage.content;
          userMsg = userMessage.content;
        } else {
          throw new Error('Missing system or user message');
        }
      } catch (e) {
        systemMsg = 'You are an evaluator. Respond with only valid JSON: {"pass": bool, "score": 0.0-1.0, "reason": "string"}';
        userMsg = prompt;
      }
      fullPrompt = `${systemMsg}\n\n${userMsg}`;
    } else {
      fullPrompt = prompt;
    }

    const tmpFile = path.join(os.tmpdir(), `devin-prompt-${Date.now()}-${process.pid}.txt`);
    const exportFile = path.join(os.tmpdir(), `devin-export-${Date.now()}-${process.pid}.json`);

    try {
      fs.writeFileSync(tmpFile, fullPrompt, 'utf8');

      const args = ['-p', '--prompt-file', tmpFile, '--model', model, '--export', exportFile];
      if (!isGraderMode) {
        args.push('--permission-mode', 'auto');
      }

      const result = await new Promise((resolve, reject) => {
        const child = spawn('devin', args, {
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => { stdout += data; });
        child.stderr.on('data', (data) => { stderr += data; });

        child.on('error', (err) => {
          resolve({ error: err.message, tokenUsage: parseTokenUsage(exportFile) });
        });

        child.on('close', (code) => {
          if (code !== 0) {
            resolve({ error: stdout || stderr || `devin exited with code ${code}`, tokenUsage: parseTokenUsage(exportFile) });
          } else {
            resolve({ output: stdout, tokenUsage: parseTokenUsage(exportFile) });
          }
        });
      });

      return result;
    } finally {
      try {
        fs.unlinkSync(tmpFile);
        fs.unlinkSync(exportFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

function parseTokenUsage(exportFilePath) {
  try {
    const data = JSON.parse(fs.readFileSync(exportFilePath, 'utf8'));

    // Devin exports ATIF v1.7 transcripts. Token metrics live in step.metrics
    // (standard ATIF) with prompt_tokens/completion_tokens, but older exports
    // put them in step.metadata.metrics as input_tokens/output_tokens.
    const allSteps = (data.steps || []);
    const candidateSteps = allSteps.filter(s => s.source === 'agent' || s.source === 'model' || s.source === 'assistant');
    const steps = candidateSteps.length > 0 ? candidateSteps : allSteps.filter(s => !s.metadata?.is_user_input);

    let promptTokens = 0, completionTokens = 0, cachedTokens = 0, cacheCreationTokens = 0;
    for (const step of steps) {
      const m = step.metrics || step.metadata?.metrics || {};
      if (m && Object.keys(m).length > 0) {
        promptTokens += (m.prompt_tokens ?? m.input_tokens ?? 0) + (m.cache_read_input_tokens ?? m.cache_read_tokens ?? 0);
        completionTokens += (m.completion_tokens ?? m.output_tokens ?? 0);
        cachedTokens += (m.cached_tokens ?? m.cache_read_input_tokens ?? m.cache_read_tokens ?? 0);
        cacheCreationTokens += (m.cache_creation_input_tokens ?? m.cache_creation_tokens ?? 0);
      }
    }

    // Legacy fallback: include legacy metadata.metrics cache creation in prompt
    // if no ATIF cache_creation_input_tokens was present.
    promptTokens += cacheCreationTokens;

    return {
      total: promptTokens + completionTokens,
      prompt: promptTokens,
      completion: completionTokens,
      cached: cachedTokens,
      numRequests: 1,
    };
  } catch {
    return { total: 0, prompt: 0, completion: 0, cached: 0, numRequests: 1 };
  }
}

module.exports = DevinProvider;
