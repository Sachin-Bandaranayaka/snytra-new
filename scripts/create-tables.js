#!/usr/bin/env node

/**
 * Script to create necessary tables for the reservation system
 * 
 * Run this script with:
 * node scripts/create-tables.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function createTables() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('Connecting to database...');
    
    // Create tables if they don't exist
    await pool.query(`
      -- Tables table
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        table_number VARCHAR(50) NOT NULL,
        seats INTEGER,
        qr_code_url VARCHAR(255),
        is_smoking BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'available',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Reservations table
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone_number VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        party_size INTEGER NOT NULL,
        table_id INTEGER REFERENCES tables(id),
        status VARCHAR(50) DEFAULT 'waitlist',
        special_instructions TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Waitlist table
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        party_size INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if tables table is empty and populate with demo data if needed
    const tablesCount = await pool.query('SELECT COUNT(*) FROM tables');
    
    if (parseInt(tablesCount.rows[0].count) === 0) {
      console.log('Populating tables with demo data...');
      
      await pool.query(`
        INSERT INTO tables (table_number, seats, qr_code_url, is_smoking, status)
        VALUES 
          ('1A', 2, 'https://placehold.co/200x200', FALSE, 'available'),
          ('2A', 4, 'https://placehold.co/200x200', FALSE, 'available'),
          ('3A', 6, 'https://placehold.co/200x200', FALSE, 'available'),
          ('4A', 2, 'https://placehold.co/200x200', TRUE, 'available'),
          ('5A', 8, 'https://placehold.co/200x200', FALSE, 'available'),
          ('6A', 4, 'https://placehold.co/200x200', FALSE, 'available'),
          ('7A', 6, 'https://placehold.co/200x200', TRUE, 'available'),
          ('8A', 10, 'https://placehold.co/200x200', FALSE, 'available')
        ON CONFLICT (table_number) DO NOTHING;
      `);
    }
    
    console.log('Tables created and populated successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables().catch(console.error); 