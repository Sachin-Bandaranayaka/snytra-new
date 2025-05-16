/**
 * Helper script to run subscription-related tests
 * 
 * Usage:
 *   node run-subscription-tests.js [option]
 * 
 * Options:
 *   flow - Run subscription flow unit tests
 *   e2e  - Run subscription end-to-end tests
 *   all  - Run all subscription tests
 *   help - Show this help message
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');

// Get command line arguments
const args = process.argv.slice(2);
const option = args[0] || 'help';

// Define test files
const FLOW_TEST = 'src/tests/subscription-flow.test.ts';
const E2E_TEST = 'src/tests/subscription-e2e.test.ts';

// Verify files exist
if (!existsSync(FLOW_TEST)) {
  console.error(`Error: Test file not found: ${FLOW_TEST}`);
  process.exit(1);
}

if (!existsSync(E2E_TEST)) {
  console.error(`Error: Test file not found: ${E2E_TEST}`);
  process.exit(1);
}

// Helper function to run tests
function runTest(testPath) {
  console.log(`Running test: ${testPath}`);
  
  // Use spawn to run the test and pipe output to the console
  const testProcess = spawn('npm', ['test', '--', testPath], { 
    stdio: 'inherit',
    shell: true
  });
  
  return new Promise((resolve, reject) => {
    testProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });
    
    testProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Run tests based on option
async function main() {
  try {
    switch (option) {
      case 'flow':
        await runTest(FLOW_TEST);
        break;
        
      case 'e2e':
        await runTest(E2E_TEST);
        break;
        
      case 'all':
        await runTest(`${FLOW_TEST} ${E2E_TEST}`);
        break;
        
      case 'help':
      default:
        console.log(`
Subscription Test Runner

Usage:
  node run-subscription-tests.js [option]

Options:
  flow - Run subscription flow unit tests
  e2e  - Run subscription end-to-end tests
  all  - Run all subscription tests
  help - Show this help message
        `);
        break;
    }
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

main(); 