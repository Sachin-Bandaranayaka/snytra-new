import postgres from 'postgres';

// Get connection string from environment and clean it up
let connectionString = process.env.DATABASE_URL?.trim();

if (connectionString?.startsWith('DATABASE_URL=')) {
    connectionString = connectionString.substring('DATABASE_URL='.length);
}

// Remove quotes that might be wrapping the connection string
connectionString = connectionString?.replace(/^["']|["']$/g, '');

// Use cleaned connection string or fallback to default for development
const finalConnectionString = connectionString || 'postgresql://neondb_owner:npg_k5J2KWgEYndi@ep-shy-field-a40ss9sl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Create a PostgreSQL client
export const sql = postgres(finalConnectionString, {
    ssl: {
        rejectUnauthorized: false,
    },
    idle_timeout: 20,
    max_lifetime: 60 * 30
}); 