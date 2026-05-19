#!/usr/bin/env node
// Claude Code CLI grader for promptfoo llm-rubric assertions
//
// promptfoo sends graders a JSON chat array: [{role, content}, ...]
// This script parses that array, routes the system message via --system-prompt
// (which replaces Claude Code's default prompt, stripping project context),
// and passes the user message as the actual prompt.

const { spawnSync } = require('child_process');

const prompt = process.argv[2];

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

// --system-prompt replaces Claude Code's default system prompt entirely,
// so the promptfoo rubric grading instructions are used verbatim.
// Use spawnSync with array argument passing to avoid shell escaping issues
const result = spawnSync('claude', ['-p', userMsg, '--system-prompt', systemMsg, '--model', 'haiku'], {
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
