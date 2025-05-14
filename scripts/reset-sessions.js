/**
 * This script resets NextAuth sessions in the database
 * Run this when JWT decryption errors occur after changing NEXTAUTH_SECRET
 */

const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Starting session reset...');
  
  try {
    const prisma = new PrismaClient();
    
    // Check if Session table exists before attempting to clear it
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log('Available tables:', tableNames.join(', '));
    
    if (tableNames.includes('Session')) {
      // Clear sessions table
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Session" CASCADE;`);
      console.log('Sessions cleared successfully');
    } else {
      console.log('No Session table found, checking for sessions in other tables...');
      
      // Try to find and clear any NextAuth related sessions in other tables
      if (tableNames.includes('sessions')) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE sessions CASCADE;`);
        console.log('sessions table cleared');
      }
      
      if (tableNames.includes('accounts')) {
        await prisma.$executeRawUnsafe(`DELETE FROM accounts WHERE refresh_token IS NOT NULL;`);
        console.log('accounts table tokens cleared');
      }
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Error clearing sessions:', error);
  }
  
  console.log('\n===========================================');
  console.log('Session reset complete!');
  console.log('===========================================');
  console.log('\nNow:');
  console.log('1. Clear your browser cookies and cache for localhost:3000');
  console.log('2. Restart your Next.js server');
  console.log('3. Try logging in again');
}

main()
  .catch(e => {
    console.error('Failed to reset sessions:', e);
    process.exit(1);
  }); 