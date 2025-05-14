// Fix staff table schema by removing restaurant_id constraint
const { pool } = require('../lib/db');

async function fixStaffTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Fixing staff table schema...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if the staff table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'staff'
      )
    `);
    
    if (tableExists.rows[0].exists) {
      // Drop the existing table
      await client.query('DROP TABLE IF EXISTS staff');
      
      // Create a new staff table without restaurant_id constraint
      await client.query(`
        CREATE TABLE staff (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          hiring_date DATE NOT NULL,
          phone VARCHAR(50),
          profile_image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Staff table fixed successfully!');
    } else {
      console.log('ℹ️ Staff table does not exist, creating new one...');
      
      // Create a new staff table
      await client.query(`
        CREATE TABLE staff (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          hiring_date DATE NOT NULL,
          phone VARCHAR(50),
          profile_image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Staff table created successfully!');
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('❌ Error fixing staff table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// If this file is run directly, fix the table
if (require.main === module) {
  fixStaffTable()
    .then(() => {
      console.log('Table fix completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Table fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixStaffTable; 