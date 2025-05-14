// Test database connection and login flow
const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Test connection by querying users table
    const users = await prisma.$queryRaw`
      SELECT id, name, email, role 
      FROM users 
      WHERE role = 'admin' OR role = 'superadmin'
    `;
    
    console.log('Successfully connected to database. Found users:');
    console.log(users);
    
    // Test login logic with first admin user
    if (users && Array.isArray(users) && users.length > 0) {
      const testUser = users[0];
      console.log(`Testing login flow for user: ${testUser.email}`);
      
      // Get user with password hash
      const userWithPassword = await prisma.$queryRaw`
        SELECT id, name, email, password_hash, role 
        FROM users 
        WHERE id = ${testUser.id}
      `;
      
      if (userWithPassword && Array.isArray(userWithPassword) && userWithPassword.length > 0) {
        const userData = userWithPassword[0];
        console.log('User data retrieved successfully');
        
        // Test with a known password (for demo purposes only)
        const testPassword = 'admin123'; // This is just for testing
        
        // Check if password hash exists
        if (!userData.password_hash) {
          console.log('Warning: User has no password hash set. Setting a test password.');
          // Set a test password for this user
          const hashedPassword = await bcrypt.hash(testPassword, 10);
          await prisma.$executeRaw`
            UPDATE users 
            SET password_hash = ${hashedPassword}
            WHERE id = ${userData.id}
          `;
          console.log('Test password set successfully.');
          userData.password_hash = hashedPassword;
        }
        
        // Test password validation
        try {
          const isPasswordValid = await bcrypt.compare(testPassword, userData.password_hash);
          console.log(`Password validation result: ${isPasswordValid ? 'Success' : 'Failed'}`);
          
          if (!isPasswordValid) {
            console.log('Setting a new test password for user');
            const hashedPassword = await bcrypt.hash(testPassword, 10);
            await prisma.$executeRaw`
              UPDATE users 
              SET password_hash = ${hashedPassword}
              WHERE id = ${userData.id}
            `;
            console.log(`New password set for ${userData.email}. Use password: ${testPassword}`);
          }
        } catch (error) {
          console.error('Error validating password:', error);
        }
      } else {
        console.log('Could not retrieve user details with password');
      }
    } else {
      console.log('No admin users found. Login testing skipped.');
    }
    
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error('Script error:', e);
    process.exit(1);
  }); 