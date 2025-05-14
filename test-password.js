const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'admin123';
  const storedHash = '$2b$10$z2XeGzMarbGbRfUCeizcG.UtxfZa4Z2miEIBDG7HADk72PsmtrsJG';
  
  try {
    console.log('Testing password match...');
    console.log('Password:', password);
    console.log('Stored hash:', storedHash);
    
    const isMatch = await bcrypt.compare(password, storedHash);
    console.log('Password match result:', isMatch);
    
    // Generate a new hash for verification
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash generated:', newHash);
    
    // Compare with the new hash
    const isNewHashMatch = await bcrypt.compare(password, newHash);
    console.log('New hash match result:', isNewHashMatch);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword(); 