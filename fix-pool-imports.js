const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with pool import
const findCommand = "find src/app -type f -name \"*.ts\" | xargs grep -l \"import.*pool.*from.*lib/db\"";
console.log('Finding files with pool import...');
const files = execSync(findCommand).toString().trim().split('\n');
console.log(`Found ${files.length} files to fix`);

// Process each file
let successCount = 0;
let errorCount = 0;

files.forEach(filePath => {
  try {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    content = content.replace(
      /import\s*{\s*pool\s*}\s*from\s*['"]@\/lib\/db['"]/g,
      `import { executeQuery } from '@/lib/db'`
    );
    
    // Replace pool.query calls with executeQuery
    content = content.replace(
      /const\s+(?:\{\s*rows(?:\s*:\s*(\w+))?\s*\}|\w+)\s*=\s*await\s+pool\.query/g, 
      (match, capturedGroup) => {
        // If it's in the format const { rows } = await pool.query
        if (match.includes('{ rows')) {
          if (capturedGroup) {
            // Format: const { rows: customName } = await pool.query
            return `const ${capturedGroup} = await executeQuery`;
          } else {
            // Format: const { rows } = await pool.query
            return `const rows = await executeQuery`;
          }
        } else {
          // Format: const result = await pool.query
          return match.replace('pool.query', 'executeQuery');
        }
      }
    );
    
    // Replace result.rows with just result for direct access
    content = content.replace(/(\w+)\.rows/g, (match, variableName) => {
      // Only replace if it's not already "rows.something"
      if (variableName !== 'rows') {
        return variableName;
      }
      return match;
    });
    
    // Replace result.rowCount with result.length
    content = content.replace(/(\w+)\.rowCount/g, (match, variableName) => {
      // Skip if variable is "rows" since that's already been fixed
      if (variableName !== 'rows') {
        return `${variableName}.length`;
      }
      return match;
    });

    // Add type annotation to executeQuery calls for better type safety
    content = content.replace(
      /executeQuery\(/g,
      'executeQuery<any[]>('
    );
    
    // Write the file back
    fs.writeFileSync(filePath, content);
    successCount++;
    console.log(`✅ Successfully processed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    errorCount++;
  }
});

console.log('\n--- Summary ---');
console.log(`Total files processed: ${files.length}`);
console.log(`Successful: ${successCount}`);
console.log(`Failed: ${errorCount}`);
console.log('Note: You may need to manually review some files for complex cases.'); 