// Reset password for a specific user
const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    // Email to find the user
    const userEmail = 'sachinbandaranayake505@gmail.com';
    // New password to set
    const newPassword = 'password123';
    
    console.log(`Resetting password for user: ${userEmail}`);
    
    // Find the user
    const user = await prisma.$queryRaw`
      SELECT id, name, email, role 
      FROM users 
      WHERE email = ${userEmail}
    `;
    
    if (!user || !Array.isArray(user) || user.length === 0) {
      console.log(`User with email ${userEmail} not found.`);
      return;
    }
    
    const userData = user[0];
    console.log(`Found user: ${userData.name} (${userData.email}) with role: ${userData.role}`);
    
    // Generate new password hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    await prisma.$executeRaw`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE id = ${userData.id}
    `;
    
    console.log(`Password reset successfully for ${userData.email}`);
    console.log(`New password: ${newPassword}`);
    
  } catch (error) {
    console.error('Password reset failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error('Script error:', e);
    process.exit(1);
  }); 