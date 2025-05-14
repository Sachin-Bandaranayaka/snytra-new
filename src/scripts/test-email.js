// Import dotenv to load environment variables
require('dotenv').config({ path: '.env.local' });

// We need to use a different approach for importing TypeScript files in Node.js scripts
// Instead of requiring the TypeScript module directly, we'll use the compiled JavaScript
const path = require('path');
const fs = require('fs');

// Check if TypeScript file exists
const nodemailerTsPath = path.resolve(__dirname, '../lib/nodemailer.ts');
const nodemailerJsPath = path.resolve(__dirname, '../lib/nodemailer.js');

// Function to run the test
async function runTest() {
  try {
    console.log('Checking email configuration...');
    let sendTestEmail;

    if (fs.existsSync(nodemailerJsPath)) {
      console.log('Using compiled JavaScript module');
      sendTestEmail = require('../lib/nodemailer.js').sendTestEmail;
    } else if (fs.existsSync(nodemailerTsPath)) {
      console.log('TypeScript file found, but no compiled JS version');
      console.log('This script needs to be run with ts-node or after compilation');
      console.log('You can either:');
      console.log('1. Build the project with "npm run build" first');
      console.log('2. Or run this script with ts-node: "npx ts-node src/scripts/test-email.ts"');
      process.exit(1);
    } else {
      console.error('Error: nodemailer module not found at expected path');
      console.error('Expected at:', nodemailerTsPath, 'or', nodemailerJsPath);
      process.exit(1);
    }
    
    console.log('Sending test email...');
    const result = await sendTestEmail();
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.data.id);
    } else {
      console.error('❌ Failed to send email:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
runTest(); 