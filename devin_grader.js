#!/usr/bin/env node
// Devin CLI grader for promptfoo llm-rubric assertions
//
// promptfoo sends graders a JSON chat array: [{role, content}, ...]
// Devin's -p flag doesn't have a --system-prompt equivalent, so we
// concatenate the system instructions and user message into one prompt.

const { spawnSync } = require('child_process');

const prompt = process.argv[2];
const options = process.argv[3];

// Parse OPTIONS to get model from config
let model = 'SWE-1.6'; // Default model
if (options && options !== '{}') {
  try {
    const optionsObj = JSON.parse(options);
    if (optionsObj.config && optionsObj.config.model) {
      model = optionsObj.config.model;
    }
  } catch (e) {
    // If JSON parsing fails, use default
    model = 'SWE-1.6';
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

// Combine system and user into one prompt
const fullPrompt = `${systemMsg}\n\n${userMsg}`;

// Use spawnSync with array argument passing to avoid shell escaping issues
const result = spawnSync('devin', ['-p', '--model', model, '--', fullPrompt], {
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
