
const { spawn } = require('child_process');

// --- Configuration ---
const SERVER_START_COMMAND = 'node';
const SERVER_START_ARGS = ['dist/index.js'];
const SERVER_START_CWD = '.';
const RPC_REQUEST = JSON.stringify({
  jsonrpc: '2.0',
  method: 'tools/list',
  id: 1,
  params: {}
});
const TEST_TIMEOUT_MS = 15000; // 15 seconds
const SERVER_READY_TIMEOUT_MS = 5000; // 5 seconds

// --- State ---
let serverProcess;
let responseBuffer = '';
let testCompleted = false;

// --- Helper Functions ---
const log = (message) => console.log(`[TestClient] ${message}`);

const cleanupAndExit = (exitCode, message) => {
  if (testCompleted) return;
  testCompleted = true;
  log(message);
  if (serverProcess && !serverProcess.killed) {
    log('Stopping server process...');
    serverProcess.kill('SIGTERM');
  }
  process.exit(exitCode);
};

// --- Main Test Logic ---
log('Starting E2E test...');

// 1. Start the server process
serverProcess = spawn(SERVER_START_COMMAND, SERVER_START_ARGS, {
  cwd: SERVER_START_CWD,
  env: {
    ...process.env,
    // Set dummy env vars to prevent startup errors
    REDMINE_HOST: 'http://localhost:3000',
    REDMINE_API_KEY: 'dummy-key',
  },
  stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr
});

// 2. Set up a global timeout to prevent hangs
const testTimeout = setTimeout(() => {
  cleanupAndExit(1, 'E2E TEST FAILED: Global timeout reached.');
}, TEST_TIMEOUT_MS);

// 3. Handle server process events
serverProcess.on('error', (err) => {
  cleanupAndExit(1, `E2E TEST FAILED: Failed to start server process. Error: ${err.message}`);
});

serverProcess.on('exit', (code) => {
  if (!testCompleted) {
    cleanupAndExit(1, `E2E TEST FAILED: Server process exited prematurely with code ${code}.`);
  }
});

serverProcess.stderr.on('data', (data) => {
  log(`Server STDERR: ${data.toString()}`);
});

// 4. Listen for the server's response on stdout
serverProcess.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  log(`Received data chunk: ${data.toString()}`);

  // Try to parse the response
  try {
    // We might get multiple JSON objects or partial data
    // A simple check for start and end braces
    if (responseBuffer.includes('{') && responseBuffer.includes('}')) {
      // Extract a potential JSON object
      const jsonMatch = responseBuffer.match(/({.*})/s);
      if (jsonMatch && jsonMatch[1]) {
        const response = JSON.parse(jsonMatch[1]);
        log('Successfully parsed JSON-RPC response.');

        // 5. Validate the response
        if (response.result && response.result.tools && Array.isArray(response.result.tools) && response.result.tools.length > 0) {
          log('Validation successful: `result.tools` is a non-empty array.');

          // Check if the corrected enums are present and are strings
          const listUsersTool = response.result.tools.find(t => t.name === 'list_users');
          const listProjectsTool = response.result.tools.find(t => t.name === 'list_projects');

          let usersToolStatusOk = false;
          if (listUsersTool && listUsersTool.inputSchema.properties.status) {
              const statusProp = listUsersTool.inputSchema.properties.status;
              if (statusProp.type === 'string' && JSON.stringify(statusProp.enum) === JSON.stringify(['1', '2', '3'])) {
                  usersToolStatusOk = true;
              }
          }

          let projectsToolStatusOk = false;
          if (listProjectsTool && listProjectsTool.inputSchema.properties.status) {
              const statusProp = listProjectsTool.inputSchema.properties.status;
              if (statusProp.type === 'string' && JSON.stringify(statusProp.enum) === JSON.stringify(['1', '5', '9'])) {
                  projectsToolStatusOk = true;
              }
          }

          if (usersToolStatusOk && projectsToolStatusOk) {
            cleanupAndExit(0, 'E2E TEST PASSED: Schema validation successful.');
          } else {
            cleanupAndExit(1, `E2E TEST FAILED: Schema validation failed. Users OK: ${usersToolStatusOk}, Projects OK: ${projectsToolStatusOk}`);
          }

        } else {
          cleanupAndExit(1, `E2E TEST FAILED: Response format is invalid or tools array is empty. Response: ${JSON.stringify(response)}`);
        }
      }
    }
  } catch (e) {
    cleanupAndExit(1, `E2E TEST FAILED: Error parsing JSON response. Error: ${e.message}. Buffer: ${responseBuffer}`);
  }
});

// 6. Wait for a moment for the server to initialize, then send the request
setTimeout(() => {
  log('Server startup grace period ended. Sending RPC request...');
  serverProcess.stdin.write(RPC_REQUEST + '\\n');
  log(`Sent: ${RPC_REQUEST}`);
}, SERVER_READY_TIMEOUT_MS);
