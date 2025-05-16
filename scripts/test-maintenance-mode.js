/**
 * Script to run all maintenance mode tests
 */

const { execSync } = require('child_process');
const path = require('path');

// Define test paths
const API_TEST = 'src/app/api/maintenance-status/__tests__/route.test.ts';
const MIDDLEWARE_TEST = 'src/__tests__/middleware.test.ts';
const COMPONENT_TEST = 'src/app/__tests__/InitMaintenanceMode.test.tsx';
const PAGE_TEST = 'src/app/maintenance/__tests__/page.test.tsx';

// Colors for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

/**
 * Run a test and print results
 * @param {string} testPath - Path to the test file
 * @param {string} testName - Name of the test
 */
function runTest(testPath, testName) {
  console.log(`${COLORS.blue}${COLORS.bright}➤ Running ${testName} tests...${COLORS.reset}`);
  
  try {
    execSync(`npx vitest run ${testPath}`, { stdio: 'inherit' });
    console.log(`${COLORS.green}✓ ${testName} tests passed!${COLORS.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}✗ ${testName} tests failed!${COLORS.reset}\n`);
    return false;
  }
}

/**
 * Run all maintenance mode tests
 */
function runAllTests() {
  console.log(`${COLORS.bright}${COLORS.yellow}=== Running Maintenance Mode Tests ===${COLORS.reset}\n`);
  
  const results = [
    { name: 'API', success: runTest(API_TEST, 'API') },
    { name: 'Middleware', success: runTest(MIDDLEWARE_TEST, 'Middleware') },
    { name: 'Components', success: runTest(COMPONENT_TEST, 'Component') },
    { name: 'Pages', success: runTest(PAGE_TEST, 'Page') },
  ];
  
  // Print summary
  console.log(`${COLORS.bright}${COLORS.yellow}=== Test Summary ===${COLORS.reset}`);
  results.forEach(result => {
    console.log(
      `${result.success ? COLORS.green + '✓' : COLORS.red + '✗'} ${result.name} tests: ${
        result.success ? 'PASSED' : 'FAILED'
      }${COLORS.reset}`
    );
  });
  
  const allPassed = results.every(r => r.success);
  console.log(`\n${allPassed ? COLORS.green : COLORS.red}${COLORS.bright}${
    allPassed ? 'All tests passed!' : 'Some tests failed!'
  }${COLORS.reset}`);
  
  process.exit(allPassed ? 0 : 1);
}

// Run all tests
runAllTests(); 