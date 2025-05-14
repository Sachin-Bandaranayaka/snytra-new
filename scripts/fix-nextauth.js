/**
 * This script generates a new NextAuth secret and provides instructions
 * to fix JWT decryption errors
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a secure random secret
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

const newSecret = generateSecret();

console.log('='.repeat(80));
console.log('NextAuth Fix Instructions');
console.log('='.repeat(80));
console.log('\n1. Use this new NEXTAUTH_SECRET in your .env.local file:');
console.log(`\nNEXTAUTH_SECRET="${newSecret}"`);
console.log('\n2. Make sure NEXTAUTH_URL is set correctly in .env.local:');
console.log('\nNEXTAUTH_URL="http://localhost:3000"');
console.log('\n3. Clear your browser cookies for this site');
console.log('\n4. Restart your Next.js server:');
console.log('\nnpm run dev');
console.log('\n5. Log in again with your admin credentials');
console.log('\n='.repeat(80)); 