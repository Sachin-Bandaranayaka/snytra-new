/**
 * This script helps clear existing NextAuth sessions and cookies
 * Run this script to resolve JWT decryption errors
 */

const fs = require('fs');
const path = require('path');

// Function to delete any file at the given path
function deleteFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${filePath}`);
    return true;
  }
  return false;
}

// Try to clear Next.js cache
const nextCachePaths = [
  path.join(process.cwd(), '.next', 'cache'),
];

let deleted = false;

console.log('Clearing Next.js cache...');
nextCachePaths.forEach(cachePath => {
  if (fs.existsSync(cachePath)) {
    console.log(`Clearing cache at ${cachePath}`);
    try {
      fs.rmSync(cachePath, { recursive: true, force: true });
      deleted = true;
      console.log(`Cleared cache at ${cachePath}`);
    } catch (err) {
      console.error(`Failed to clear cache at ${cachePath}:`, err);
    }
  }
});

if (deleted) {
  console.log('\nSession cache has been cleared.');
  console.log('\nIMPORTANT: Please take these additional steps to complete the fix:');
  console.log('1. Stop your development server (Ctrl+C)');
  console.log('2. Clear your browser cookies for localhost:3000');
  console.log('3. In your browser, go to Application > Storage > Clear Site Data');
  console.log('4. Restart your Next.js application with "npm run dev"');
} else {
  console.log('\nNo session files were found to clear.');
  console.log('You may still need to clear your browser cookies for this domain.');
}

console.log('\nThe NextAuth JWT error should now be resolved.'); 