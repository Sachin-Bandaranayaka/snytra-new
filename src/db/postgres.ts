import postgres from 'postgres';

// Connection string from environment variable or use a default for development
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_k5J2KWgEYndi@ep-shy-field-a40ss9sl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Create a PostgreSQL client
export const sql = postgres(connectionString, {
    ssl: {
        rejectUnauthorized: false,
    },
    idle_timeout: 20,
    max_lifetime: 60 * 30
}); 