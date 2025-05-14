// Script to test the login API with database credentials
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Get the API URL from arguments or use default
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Test user credentials
const testUser = {
  email: 'admin@restaurant.com',
  password: 'admin123'
};

// Function to test login
async function testLogin() {
  console.log('Starting login API test...');
  
  try {
    // First, check database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Checking database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Check if the test user exists
    console.log(`Looking for user with email: ${testUser.email}`);
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [testUser.email]);
    
    if (userResult.rows.length === 0) {
      console.log('⚠️ Test user not found in database. Creating test user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      
      // Insert the test user
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['Admin User', testUser.email, hashedPassword, 'admin']
      );
      
      console.log('✅ Test user created successfully');
    } else {
      console.log('✅ Test user found in database');
    }

    // Test the login API
    console.log('Testing login API...');
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login API test successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Login API test failed!');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
    }
    
    // Close the database pool
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testLogin(); 