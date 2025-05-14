// Script to apply the staff management schema
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyStaffSchema() {
  try {
    console.log('Applying staff management schema...');
    const schemaFile = path.join(__dirname, '../lib/staff-schema.sql');
    const schemaSql = fs.readFileSync(schemaFile, 'utf8');

    // Apply the schema
    await pool.query(schemaSql);
    
    console.log('Staff management schema applied successfully!');
  } catch (error) {
    console.error('Error applying staff schema:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

applyStaffSchema(); 