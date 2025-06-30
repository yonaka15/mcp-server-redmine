
const { spawn } = require('child_process');

const SERVER_START_COMMAND = 'node';
const SERVER_START_ARGS = ['dist/index.js'];
const SERVER_START_CWD = '.';
const DEBUG_TIMEOUT_MS = 20000; // 20 seconds

const log = (message) => console.log(`[DebugClient] ${message}`);

log('Starting debug session...');

const serverProcess = spawn(SERVER_START_COMMAND, SERVER_START_ARGS, {
  cwd: SERVER_START_CWD,
  env: {
    ...process.env,
    REDMINE_HOST: 'http://localhost:3000',
    REDMINE_API_KEY: 'dummy-key',
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

serverProcess.on('error', (err) => {
  log(`SERVER ERROR: ${err.message}`);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  log(`SERVER EXITED with code ${code}`);
  process.exit(code > 0 ? 1 : 0);
});

serverProcess.stdout.on('data', (data) => {
  log(`SERVER STDOUT: ${data.toString()}`);
});

serverProcess.stderr.on('data', (data) => {
  log(`SERVER STDERR: ${data.toString()}`);
});

setTimeout(() => {
  log('Debug session timed out. Sending RPC request to see what happens...');
  const rpcRequest = JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1, params: {} });
  serverProcess.stdin.write(rpcRequest + '\\n');
}, 5000);

setTimeout(() => {
  log('Final timeout reached. Closing client.');
  if (!serverProcess.killed) {
    serverProcess.kill();
  }
  process.exit(0);
}, DEBUG_TIMEOUT_MS);
