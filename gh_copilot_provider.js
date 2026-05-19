#!/usr/bin/env node
// GitHub Copilot CLI provider for promptfoo with model selection

const { spawnSync } = require('child_process');

const prompt = process.argv[2];
const options = process.argv[3];
const context = process.argv[4];

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
// Use spawnSync with array argument passing to avoid shell escaping issues
const args = ['copilot', '--prompt', prompt, '--allow-all-tools', '--silent'];
if (model) {
  args.push('--model', model);
}

const result = spawnSync('gh', args, {
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
