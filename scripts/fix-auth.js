/**
 * This script fixes authentication issues by:
 * 1. Updating the NEXTAUTH_SECRET in .env.local
 * 2. Clearing any remember tokens in the database
 * 3. Providing instructions for clearing browser cookies
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Path to .env.local file
const envPath = path.join(process.cwd(), '.env.local');

// Generate a new secure random secret
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

const newSecret = generateSecret();

async function main() {
  try {
    // Step 1: Update .env.local with new NextAuth secret
    console.log('Reading .env.local file...');
    let envContent = fs.readFileSync(envPath, 'utf8');

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

    // Make sure NEXTAUTH_URL is set correctly
    if (envContent.includes('NEXTAUTH_URL=')) {
      console.log('Ensuring NEXTAUTH_URL is correct...');
      envContent = envContent.replace(
        /NEXTAUTH_URL=.*$/m,
        `NEXTAUTH_URL="http://localhost:3000"`
      );
    } else {
      console.log('Adding NEXTAUTH_URL...');
      envContent += `\nNEXTAUTH_URL="http://localhost:3000"\n`;
    }

    // Write updated content back to .env.local
    fs.writeFileSync(envPath, envContent);
    console.log('Successfully updated .env.local with new authentication secrets');

    // Step 2: Clear all remember tokens in the database
    console.log('Clearing all remember tokens in the database...');
    try {
      const result = await prisma.$executeRaw`UPDATE users SET remember_token = NULL`;
      console.log(`Cleared remember tokens for ${result} users`);
    } catch (dbError) {
      console.warn('Failed to clear remember tokens:', dbError);
      console.warn('You may need to clear them manually in your database');
    }

    console.log('\n==================================================================');
    console.log('                Authentication Reset Complete                     ');
    console.log('==================================================================');
    console.log('\nFOLLOW THESE STEPS TO COMPLETE THE FIX:');
    console.log('\n1. Clear your browser cookies for localhost:3000');
    console.log('   - Go to your browser settings');
    console.log('   - Find "Cookies and site data"');
    console.log('   - Search for "localhost" and delete all cookies');
    console.log('\n2. Kill and restart your Next.js server:');
    console.log('   npm run dev');
    console.log('\n3. Try logging in again at:');
    console.log('   - Admin login: http://localhost:3000/admin/login');
    console.log('\n4. If you still experience issues:');
    console.log('   - Clear browser storage: localStorage and sessionStorage');
    console.log('   - Try using a different browser');
    console.log('   - Check server logs for additional errors');
    console.log('\n==================================================================');

  } catch (error) {
    console.error('Error fixing authentication:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 