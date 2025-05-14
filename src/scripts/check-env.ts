import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Try to load from .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Checking for .env.local file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check all environment variables
console.log('\nEnvironment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '*'.repeat(process.env.EMAIL_PASSWORD.length) : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');

// Check other key environment variables
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'Not set');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '********' : 'Not set');

console.log('\nCurrent Working Directory:', process.cwd()); 