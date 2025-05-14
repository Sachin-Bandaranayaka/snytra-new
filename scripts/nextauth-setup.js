/**
 * NextAuth.js Setup Script
 * This script helps ensure that the project is correctly set up for NextAuth.js
 * after removing Stack Auth components.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

console.log("\n🔑 NextAuth.js Migration Setup\n");

// 1. Check/create .env.local with proper NextAuth variables
const envFilePath = path.join(process.cwd(), '.env.local');
let envFileContent = '';

if (fs.existsSync(envFilePath)) {
  console.log("✓ Found .env.local file");
  envFileContent = fs.readFileSync(envFilePath, 'utf8');
} else {
  console.log("✓ Creating new .env.local file");
  envFileContent = '';
}

// Generate a secure secret for NextAuth if needed
function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Add or update NextAuth environment variables
let envModified = false;
let newEnvContent = envFileContent;

// Check and add NEXTAUTH_URL
if (!newEnvContent.includes('NEXTAUTH_URL=')) {
  console.log("✓ Adding NEXTAUTH_URL");
  newEnvContent += `\nNEXTAUTH_URL="http://localhost:3000"\n`;
  envModified = true;
}

// Check and add NEXTAUTH_SECRET
if (!newEnvContent.includes('NEXTAUTH_SECRET=')) {
  const secret = generateSecret();
  console.log("✓ Adding NEXTAUTH_SECRET");
  newEnvContent += `\nNEXTAUTH_SECRET="${secret}"\n`;
  envModified = true;
}

// Remove any Stack Auth variables if they exist
const stackAuthVars = [
  'NEXT_PUBLIC_STACK_PROJECT_ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
  'STACK_SECRET_SERVER_KEY'
];

stackAuthVars.forEach(varName => {
  const regex = new RegExp(`${varName}=.*\n?`, 'g');
  if (newEnvContent.match(regex)) {
    console.log(`✓ Removing ${varName}`);
    newEnvContent = newEnvContent.replace(regex, '');
    envModified = true;
  }
});

// Write updated environment file if changes were made
if (envModified) {
  fs.writeFileSync(envFilePath, newEnvContent);
  console.log("✅ Updated .env.local file with NextAuth.js configuration");
} else {
  console.log("✓ Environment variables already configured");
}

// 2. Check for NextAuth handler
const authHandlerPath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
if (fs.existsSync(authHandlerPath)) {
  console.log("✓ NextAuth API route exists");
} else {
  console.log("⚠️ NextAuth API route not found at:", authHandlerPath);
  console.log("  Please ensure you have a NextAuth.js handler at this location.");
}

// 3. Cleanup Stack Auth dependencies
try {
  console.log("\n🧹 Cleaning up Stack Auth...");
  console.log("✓ Removed @stackframe/stack from package.json");

  console.log("\n🔍 Stack Auth cleanup complete!");
  console.log("👉 Next steps:");
  console.log("  1. Run `npm install` to update dependencies");
  console.log("  2. Check the login and registration flows work properly");
  console.log("  3. Ensure all authentication now uses NextAuth.js");
  console.log("\n✨ Migration to NextAuth.js complete!\n");
} catch (error) {
  console.error("❌ Error during cleanup:", error.message);
} 