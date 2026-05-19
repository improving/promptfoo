#!/usr/bin/env node
// Devin CLI provider for promptfoo with model selection

const { spawnSync } = require('child_process');

const prompt = process.argv[2];
const options = process.argv[3];
const context = process.argv[4];

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

// Call devin cli with single-turn mode and specified model
// Use -- before prompt to properly separate it from flags
// Use spawnSync with array argument passing to avoid shell escaping issues
const result = spawnSync('devin', ['-p', '--model', model, '--', prompt], {
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
