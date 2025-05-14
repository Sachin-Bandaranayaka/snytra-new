require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

async function applyCartSchema() {
  try {
    console.log('Applying cart schema...');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../lib/cart-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the SQL
    await pool.query(schema);
    
    console.log('Cart schema applied successfully!');
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error applying cart schema:', error);
    process.exit(1);
  }
}

// Run the function
applyCartSchema(); 