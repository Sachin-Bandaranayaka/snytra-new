/**
 * Script to fix NextAuth configuration issues
 * Run with: node scripts/fix-nextauth-config.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Generate a secure random secret for NextAuth
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Path to .env.local file
const envFile = path.join(process.cwd(), '.env.local');
const newSecret = generateSecret();

console.log('\n========= NextAuth Configuration Fix =========');
console.log('This script will help fix your NextAuth configuration issues.');

// Check if .env.local exists
if (fs.existsSync(envFile)) {
  console.log('\n✓ Found .env.local file');
  
  // Read the file content
  let envContent = fs.readFileSync(envFile, 'utf8');
  let modified = false;
  
  // Check for NEXTAUTH_URL
  if (!envContent.includes('NEXTAUTH_URL=')) {
    console.log('• Adding NEXTAUTH_URL configuration');
    envContent += `\nNEXTAUTH_URL="http://localhost:3000"\n`;
    modified = true;
  } else {
    console.log('✓ NEXTAUTH_URL is already configured');
  }
  
  // Check for NEXTAUTH_SECRET
  if (!envContent.includes('NEXTAUTH_SECRET=')) {
    console.log('• Adding NEXTAUTH_SECRET configuration');
    envContent += `\nNEXTAUTH_SECRET="${newSecret}"\n`;
    modified = true;
  } else {
    console.log('✓ NEXTAUTH_SECRET is already configured');
    console.log('  (Note: If you\'re having issues, you may want to regenerate this secret)');
  }
  
  // Write back to file if modified
  if (modified) {
    fs.writeFileSync(envFile, envContent);
    console.log('\n✅ Updated .env.local with NextAuth configuration');
  } else {
    console.log('\n✓ No changes needed to .env.local');
  }
} else {
  // Create new .env.local file
  console.log('• Creating new .env.local file with NextAuth configuration');
  const newEnvContent = `# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${newSecret}"
`;
  fs.writeFileSync(envFile, newEnvContent);
  console.log('✅ Created .env.local with NextAuth configuration');
}

// Check for potential Stack Auth conflicts
console.log('\n========= Stack Auth Conflict Check =========');
// List of Stack Auth environment variables that could conflict
const stackAuthVars = [
  'NEXT_PUBLIC_STACK_PROJECT_ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
  'STACK_SECRET_SERVER_KEY'
];

let hasStackAuthVars = false;
const envVarsToRemove = [];

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  stackAuthVars.forEach(varName => {
    if (envContent.includes(varName + '=')) {
      hasStackAuthVars = true;
      envVarsToRemove.push(varName);
    }
  });
}

if (hasStackAuthVars) {
  console.log('⚠️  WARNING: Stack Auth environment variables detected!');
  console.log('   This might be causing conflicts with NextAuth.js');
  console.log('   Consider removing or commenting out these variables in .env.local:');
  envVarsToRemove.forEach(varName => {
    console.log(`   - ${varName}`);
  });
} else {
  console.log('✓ No Stack Auth environment variables detected in .env.local');
}

// Provide next steps
console.log('\n========= Next Steps =========');
console.log('1. Restart your Next.js development server');
console.log('2. Make sure you\'re not mixing NextAuth.js and Stack Auth in your code');
console.log('3. Check your code for any instances where you try to use both authentication systems');
console.log('\nIf you\'re explicitly trying to migrate from Stack Auth to NextAuth.js, ensure you have:');
console.log('- Updated all imports to use NextAuth.js instead of Stack Auth');
console.log('- Removed all Stack Auth provider components in your app layout');
console.log('- Updated all authentication logic to use NextAuth.js methods\n'); 