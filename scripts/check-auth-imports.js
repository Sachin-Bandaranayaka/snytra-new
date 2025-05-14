/**
 * Script to detect potential authentication conflicts in the codebase
 * Scans for files that import both NextAuth.js and Stack Auth
 * Run with: node scripts/check-auth-imports.js
 */

const fs = require('fs');
const path = require('path');

// Patterns to look for
const NEXT_AUTH_PATTERN = /next-auth/;
const STACK_AUTH_PATTERN = /['"@]stackframe\/stack['"]/;

// Directory to scan
const SRC_DIR = path.join(process.cwd(), 'src');

// Track stats
const stats = {
  scanned: 0,
  nextAuthOnly: 0,
  stackAuthOnly: 0,
  both: 0,
  filesWithBoth: []
};

// Function to scan a file
function scanFile(filePath) {
  try {
    stats.scanned++;
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasNextAuth = NEXT_AUTH_PATTERN.test(content);
    const hasStackAuth = STACK_AUTH_PATTERN.test(content);
    
    if (hasNextAuth && hasStackAuth) {
      stats.both++;
      stats.filesWithBoth.push(filePath);
    } else if (hasNextAuth) {
      stats.nextAuthOnly++;
    } else if (hasStackAuth) {
      stats.stackAuthOnly++;
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

// Function to recursively scan a directory
function scanDirectory(directory) {
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        // Check file extensions for JS/TS files
        if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
          scanFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${directory}:`, error.message);
  }
}

console.log('\n========= Authentication Import Scanner =========');
console.log('Scanning codebase for potential auth conflicts...\n');

// Start scanning
scanDirectory(SRC_DIR);

// Print results
console.log('Scan complete!');
console.log(`Files scanned: ${stats.scanned}`);
console.log(`Files with NextAuth.js only: ${stats.nextAuthOnly}`);
console.log(`Files with Stack Auth only: ${stats.stackAuthOnly}`);
console.log(`Files with BOTH (potential conflicts): ${stats.both}`);

if (stats.filesWithBoth.length > 0) {
  console.log('\n⚠️  WARNING: Found files with both NextAuth.js and Stack Auth imports!');
  console.log('These files may cause conflicts:');
  
  stats.filesWithBoth.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`- ${relativePath}`);
  });
  
  console.log('\nRecommendation: Review these files and ensure you are not mixing authentication systems.');
  console.log('Choose either NextAuth.js OR Stack Auth, but not both in the same file.');
} else if (stats.stackAuthOnly > 0 && stats.nextAuthOnly > 0) {
  console.log('\n⚠️  WARNING: Your project contains both NextAuth.js and Stack Auth imports in different files.');
  console.log('This might lead to conflicts if both authentication systems are initialized.');
  console.log('Consider standardizing on one authentication system across your application.');
} else if (stats.stackAuthOnly === 0 && stats.nextAuthOnly > 0) {
  console.log('\n✅ Your project appears to be using NextAuth.js consistently.');
  console.log('No Stack Auth imports detected.');
} else if (stats.stackAuthOnly > 0 && stats.nextAuthOnly === 0) {
  console.log('\n✅ Your project appears to be using Stack Auth consistently.');
  console.log('No NextAuth.js imports detected.');
} else {
  console.log('\n❓ No authentication imports detected in the scanned files.');
} 