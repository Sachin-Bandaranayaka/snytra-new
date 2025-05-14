
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/api/admin/reviews/[id]/route.ts');
const backupPath = `${filePath}.backup`;

if (fs.existsSync(backupPath)) {
  // Restore from backup
  fs.copyFileSync(backupPath, filePath);
  fs.unlinkSync(backupPath);
  console.log('Authentication check restored successfully');
  console.log('Backup file deleted');
} else {
  console.error('Backup file not found!');
}
