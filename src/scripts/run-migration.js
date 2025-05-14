// Script to run database migrations
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create a database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Path to the migration SQL file
const migrationFilePath = path.resolve(__dirname, '../lib/migrations/add_trial_fields.sql');

async function runMigration() {
  console.log('Starting migration...');
  
  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Start a client from the pool
    const client = await pool.connect();
    
    try {
      // Begin a transaction
      await client.query('BEGIN');
      
      // Execute the migration SQL
      await client.query(migrationSQL);
      
      // Commit the transaction
      await client.query('COMMIT');
      
      console.log('Migration completed successfully!');
    } catch (error) {
      // Roll back the transaction on error
      await client.query('ROLLBACK');
      console.error('Migration failed:', error);
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration(); 