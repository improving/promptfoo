const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const STUB = path.join(__dirname, 'fixtures', 'stub-cli.js');
const STUBBED = new Set(['devin', 'claude', 'copilot']);

// Providers capture `spawn` at require time, so the stub redirect must be installed first.
const realSpawn = childProcess.spawn;
let DevinProvider;
let ClaudeProvider;
let CopilotProvider;

before(() => {
  childProcess.spawn = (cmd, args = [], opts) => {
    if (STUBBED.has(cmd)) {
      return realSpawn(process.execPath, [STUB, cmd, ...args], opts);
    }
    return realSpawn(cmd, args, opts);
  };
  DevinProvider = require('../devinProvider');
  ClaudeProvider = require('../claudeProvider');
  CopilotProvider = require('../copilotProvider');
});

after(() => {
  childProcess.spawn = realSpawn;
});

const SYSTEM = 'SYSTEM RUBRIC: respond with JSON only';
const MODEL_OUTPUT = 'Answer with & % "quotes" and\nnewlines\n'.repeat(2000);

function graderPrompt() {
  return JSON.stringify([
    { role: 'system', content: SYSTEM },
    { role: 'user', content: MODEL_OUTPUT },
  ]);
}

function parseStub(result) {
  assert.ok(result.output, `expected output, got error: ${result.error}`);
  return JSON.parse(result.output);
}

function argvLength(args) {
  return args.reduce((n, a) => n + a.length, 0);
}

test('devin: long grader prompt reaches the CLI through a file, not argv', async () => {
  const provider = new DevinProvider({ id: 'devin-test', config: {} });
  const result = await provider.callApi(graderPrompt());
  const stub = parseStub(result);

  assert.equal(stub.promptFile, `${SYSTEM}\n\n${MODEL_OUTPUT}`);
  assert.ok(argvLength(stub.args) < 2000, `argv too long: ${argvLength(stub.args)}`);
  assert.ok(!stub.args.some(a => a.includes('quotes')), 'prompt text must not appear in argv');
});

test('devin: provider mode adds auto permissions, grader mode does not', async () => {
  const provider = new DevinProvider({ id: 'devin-test', config: { model: 'SWE-1.6' } });

  const providerMode = parseStub(await provider.callApi('say hello'));
  assert.ok(providerMode.args.includes('--permission-mode'));
  assert.equal(providerMode.promptFile, 'say hello');
  assert.ok(providerMode.args.includes('SWE-1.6'));

  const grader = parseStub(await provider.callApi(graderPrompt()));
  assert.ok(!grader.args.includes('--permission-mode'));
});

test('devin: temp prompt and export files are removed after the call', async () => {
  const provider = new DevinProvider({ id: 'devin-test', config: {} });
  const stub = parseStub(await provider.callApi(graderPrompt()));
  assert.equal(fs.existsSync(stub.promptFilePath), false);
});

test('claude: long grader prompt goes to stdin, system rubric to a system file', async () => {
  const provider = new ClaudeProvider({ id: 'claude-test', config: {} });
  const stub = parseStub(await provider.callApi(graderPrompt()));

  assert.equal(stub.stdin, MODEL_OUTPUT);
  assert.equal(stub.systemFile, SYSTEM);
  assert.ok(argvLength(stub.args) < 2000, `argv too long: ${argvLength(stub.args)}`);
  assert.ok(stub.args.includes('--system-prompt-file'));
  assert.ok(stub.args.includes('haiku'), 'grader mode should use haiku');
});

test('claude: provider mode sends the prompt on stdin with no system file', async () => {
  const provider = new ClaudeProvider({ id: 'claude-test', config: { model: 'sonnet' } });
  const stub = parseStub(await provider.callApi('plain text prompt'));

  assert.equal(stub.stdin, 'plain text prompt');
  assert.equal(stub.systemFile, undefined);
  assert.ok(!stub.args.includes('--system-prompt-file'));
  assert.ok(stub.args.includes('sonnet'));
});

test('claude: system prompt file is removed after the call', async () => {
  const provider = new ClaudeProvider({ id: 'claude-test', config: {} });
  const stub = parseStub(await provider.callApi(graderPrompt()));
  const sysPath = stub.args[stub.args.indexOf('--system-prompt-file') + 1];
  assert.equal(fs.existsSync(sysPath), false);
});

test('copilot: long grader prompt is read from a temp file named in a short instruction', async () => {
  const provider = new CopilotProvider({ id: 'copilot-test', config: {} });
  const stub = parseStub(await provider.callApi(graderPrompt()));

  assert.equal(stub.promptFile, `${SYSTEM}\n\n${MODEL_OUTPUT}`);
  assert.ok(argvLength(stub.args) < 2000, `argv too long: ${argvLength(stub.args)}`);
  assert.ok(!stub.args.some(a => a.includes('quotes')), 'prompt text must not appear in argv');
  assert.equal(fs.existsSync(stub.promptFilePath), false, 'temp prompt file should be removed');
});

test('copilot: file access is limited to the temp directory', async () => {
  const provider = new CopilotProvider({ id: 'copilot-test', config: {} });
  const stub = parseStub(await provider.callApi('hello'));

  assert.equal(stub.args[stub.args.indexOf('--add-dir') + 1], os.tmpdir());
  assert.ok(!stub.args.includes('--allow-all-paths'));
  assert.ok(!stub.args.includes('--allow-all'));
});

test('copilot: model config is passed through', async () => {
  const provider = new CopilotProvider({ id: 'copilot-test', config: { model: 'gpt-5' } });
  const stub = parseStub(await provider.callApi('hello'));
  assert.equal(stub.args[stub.args.indexOf('--model') + 1], 'gpt-5');
});

test('copilot: non-zero exit is reported as an error', async () => {
  const provider = new CopilotProvider({ id: 'copilot-test', config: {} });
  process.env.STUB_FAIL = '1';
  try {
    const result = await provider.callApi('hello');
    assert.ok(result.error, 'expected an error result');
    assert.match(result.error, /stub failure/);
  } finally {
    delete process.env.STUB_FAIL;
  }
});

// On Windows the command line is capped at 32,767 characters, so a 60k argument
// must fail with ENAMETOOLONG. This is the failure the providers avoid.
// On Mac/Linux the limit differs (E2BIG), so the check is Windows-only.
test(
  'windows: a 60k-char argument fails with ENAMETOOLONG (negative control)',
  { skip: process.platform !== 'win32' },
  async () => {
    // spawn can throw synchronously on Windows, so capture both paths
    let err = null;
    try {
      const child = realSpawn(process.execPath, ['-e', '0', 'x'.repeat(60000)], { stdio: 'ignore' });
      err = await new Promise((resolve) => {
        child.on('error', resolve);
        child.on('close', () => resolve(null));
      });
    } catch (e) {
      err = e;
    }
    assert.ok(err, 'expected spawn to fail');
    assert.equal(err.code, 'ENAMETOOLONG');
  },
);
