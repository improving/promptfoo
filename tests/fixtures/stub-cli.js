// Stand-in for the devin, claude, and copilot executables used by the provider tests.
// Reports what it received as JSON so tests can assert on argv, stdin, and prompt files.
const fs = require('fs');

const [, , name, ...args] = process.argv;

function report(stdin) {
  const out = { name, args, stdin };

  const pf = args.indexOf('--prompt-file');
  if (pf >= 0) {
    out.promptFilePath = args[pf + 1];
    out.promptFile = fs.readFileSync(args[pf + 1], 'utf8');
  }

  const sf = args.indexOf('--system-prompt-file');
  if (sf >= 0) {
    out.systemFile = fs.readFileSync(args[sf + 1], 'utf8');
  }

  // copilot receives a short instruction that names the temp file
  const instruction = args.map(a => a.match(/^Read the file (.+) and follow/)).find(Boolean);
  if (instruction) {
    out.promptFilePath = instruction[1];
    out.promptFile = fs.readFileSync(instruction[1], 'utf8');
  }

  if (process.env.STUB_FAIL) {
    process.stderr.write('stub failure');
    process.exit(3);
  }

  process.stdout.write(JSON.stringify(out));
}

// Only claude reads stdin; the devin and copilot providers leave it unused.
if (name === 'claude') {
  let stdin = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', d => { stdin += d; });
  process.stdin.on('end', () => report(stdin));
} else {
  report(null);
}
