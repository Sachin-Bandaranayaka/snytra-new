/**
 * This script directly deletes a review from the database without NextAuth
 * Use when the API route is failing due to authentication issues
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const reviewId = process.argv[2];

if (!reviewId) {
  console.error('Please provide a review ID as an argument');
  console.error('Example: node scripts/delete-review.js 7');
  process.exit(1);
}

async function deleteReview() {
  console.log(`Attempting to delete review with ID: ${reviewId}`);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to the database');
    
    // Check if the review exists
    const checkResult = await client.query(
      'SELECT id FROM reviews WHERE id = $1',
      [reviewId]
    );
    
    if (checkResult.rows.length === 0) {
      console.error(`Review with ID ${reviewId} not found`);
      return;
    }
    
    // Delete the review
    const result = await client.query(
      'DELETE FROM reviews WHERE id = $1 RETURNING id',
      [reviewId]
    );
    
    if (result.rows.length > 0) {
      console.log(`Successfully deleted review with ID: ${result.rows[0].id}`);
    } else {
      console.log('Review not found or already deleted');
    }
    
  } catch (error) {
    console.error('Error deleting review:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

deleteReview().catch(err => {
  console.error('Fatal error:', err);
}); 