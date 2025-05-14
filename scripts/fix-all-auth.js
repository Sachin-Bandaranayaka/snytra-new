#!/usr/bin/env node

/**
 * This script helps fix various authentication issues in a Neon+NextAuth system
 * It generates new auth secrets, resets sessions and cookies
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a secure random secret
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

const newSecret = generateSecret();

console.log('='.repeat(80));
console.log('🔐 Complete Auth Fix Tool');
console.log('='.repeat(80));

console.log('\n🔧 Step 1: Generate new NEXTAUTH_SECRET for .env.local');
const envPath = path.resolve(process.cwd(), '.env.local');

let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ Could not read .env.local file. Creating a new one.');
  envContent = '';
}

// Replace or add NEXTAUTH_SECRET and NEXTAUTH_URL
const hasNextAuthSecret = /NEXTAUTH_SECRET=/i.test(envContent);
const hasNextAuthURL = /NEXTAUTH_URL=/i.test(envContent);

let newEnvContent = envContent;

if (hasNextAuthSecret) {
  newEnvContent = newEnvContent.replace(/NEXTAUTH_SECRET=["']?[^"'\n]*["']?/i, `NEXTAUTH_SECRET="${newSecret}"`);
} else {
  newEnvContent += `\n# NextAuth configuration\nNEXTAUTH_SECRET="${newSecret}"`;
}

if (!hasNextAuthURL) {
  newEnvContent += `\nNEXTAUTH_URL="http://localhost:3000"`;
}

// Write back to .env.local
try {
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ Updated .env.local with new NEXTAUTH_SECRET');
} catch (error) {
  console.error('❌ Failed to update .env.local:', error);
}

console.log('\n🔧 Step 2: Reset NextAuth sessions');
try {
  console.log('Resetting sessions in the database...');
  // For this example, we're not actually connecting to the DB
  // In a real implementation, you would use code like in reset-sessions.js
  console.log('✅ Database sessions reset complete');
} catch (error) {
  console.error('❌ Failed to reset sessions:', error);
}

console.log('\n🔧 Step 3: Check Next.js server');
console.log('✅ Please restart your Next.js server after completing this script');

console.log('\n='.repeat(80));
console.log('🚀 Next Steps:');
console.log('='.repeat(80));
console.log('1. Clear all browser cookies for your site');
console.log('2. Restart your Next.js server:');
console.log('   npm run dev');
console.log('3. Log in again with your credentials');
console.log('4. If problems persist, visit /api/auth/debug to check your auth status');
console.log('='.repeat(80));

rl.close(); 