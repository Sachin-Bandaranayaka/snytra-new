#!/usr/bin/env node

/**
 * Script to validate the reservation system configuration
 * - Checks database tables
 * - Tests adding a reservation
 * - Tests adding to waitlist
 * 
 * Run with:
 * node scripts/validate-reservation-system.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function validateSystem() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔄 Connecting to database...');
    
    // Check if tables exist
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('tables', 'reservations', 'waitlist')
    `);
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    console.log('📊 Found tables:', existingTables);
    
    // Verify all required tables exist
    const requiredTables = ['tables', 'reservations', 'waitlist'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('   Please run the create-tables.js script to set up the database tables.');
      process.exit(1);
    }
    
    // Check tables have data
    const tableCount = await pool.query('SELECT COUNT(*) FROM tables');
    console.log(`📋 Tables table has ${tableCount.rows[0].count} records`);
    
    const availableTables = await pool.query(`
      SELECT id, table_number, status 
      FROM tables 
      WHERE status = 'available' 
      LIMIT 3
    `);
    
    console.log('🪑 Available tables:', availableTables.rows);
    
    // Test adding a test reservation
    console.log('🔄 Testing reservation creation...');
    const testReservation = await pool.query(`
      INSERT INTO reservations (
        name, 
        email, 
        phone_number, 
        date, 
        time, 
        party_size, 
        status, 
        special_instructions
      ) VALUES (
        'Test Validation', 
        'test@example.com', 
        '555-1234', 
        CURRENT_DATE + INTERVAL '1 day', 
        '18:00:00', 
        2, 
        'waitlist', 
        'Test validation entry'
      ) RETURNING id, name, date, time, status
    `);
    
    console.log('✅ Test reservation created:', testReservation.rows[0]);
    
    // Test adding to waitlist
    console.log('🔄 Testing waitlist creation...');
    const testWaitlist = await pool.query(`
      INSERT INTO waitlist (
        name, 
        phone_number, 
        party_size
      ) VALUES (
        'Waitlist Test', 
        '555-5678', 
        4
      ) RETURNING id, name, phone_number, party_size, status
    `);
    
    console.log('✅ Test waitlist entry created:', testWaitlist.rows[0]);
    
    // Clean up test data
    await pool.query(`DELETE FROM reservations WHERE name = 'Test Validation'`);
    await pool.query(`DELETE FROM waitlist WHERE name = 'Waitlist Test'`);
    
    // Final validation results
    console.log('\n🎉 Reservation system validated successfully!');
    console.log('✅ Database connection is working');
    console.log('✅ All required tables exist');
    console.log('✅ Test reservation was created and deleted');
    console.log('✅ Test waitlist entry was created and deleted');
    
    console.log('\n📣 System is ready to use. If issues persist:');
    console.log('  1. Check server logs for detailed errors');
    console.log('  2. Make sure frontend is properly sending form data');
    console.log('  3. Verify API routes are correctly handling requests');
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
  } finally {
    await pool.end();
  }
}

validateSystem().catch(console.error); 