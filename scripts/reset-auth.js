/**
 * This script updates the .env.local file with a new NextAuth secret
 * and provides instructions for clearing cookies and restarting the server.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Path to .env.local file
const envPath = path.join(process.cwd(), '.env.local');

// Generate a new secure random secret
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

const newSecret = generateSecret();

try {
  // Read the existing .env.local file
  console.log('Reading .env.local file...');
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Replace the NEXTAUTH_SECRET line or add it if it doesn't exist
  if (envContent.includes('NEXTAUTH_SECRET=')) {
    console.log('Updating existing NEXTAUTH_SECRET...');
    envContent = envContent.replace(
      /NEXTAUTH_SECRET=.*$/m,
      `NEXTAUTH_SECRET="${newSecret}"`
    );
  } else {
    console.log('Adding NEXTAUTH_SECRET...');
    envContent += `\nNEXTAUTH_SECRET="${newSecret}"\n`;
  }

  // Write the updated content back to .env.local
  fs.writeFileSync(envPath, envContent);
  console.log('Successfully updated .env.local with new NEXTAUTH_SECRET');

  console.log('\n='.repeat(80));
  console.log('NextAuth Reset Complete');
  console.log('='.repeat(80));
  console.log('\nNext steps:');
  console.log('\n1. Clear your browser cookies for this site');
  console.log('\n2. Restart your Next.js server:');
  console.log('\n   npm run dev');
  console.log('\n3. Log in again with your admin credentials');
  console.log('\n='.repeat(80));

} catch (error) {
  console.error('Error updating .env.local file:', error);
  process.exit(1);
} 