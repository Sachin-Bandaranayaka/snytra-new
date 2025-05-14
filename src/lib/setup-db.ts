import { readFileSync } from 'fs';
import { pool } from './db';
import { hash } from 'bcrypt';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setup() {
    try {
        console.log('Starting database setup...');

        // Read the schema SQL file
        const schemaPath = path.resolve(process.cwd(), 'src', 'lib', 'schema.sql');
        const schemaSql = readFileSync(schemaPath, 'utf8');

        // Execute the schema SQL
        await pool.query(schemaSql);
        console.log('Database schema created successfully');

        // Check if there are already users in the database
        const { rows } = await pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(rows[0].count);

        if (userCount === 0) {
            console.log('No users found. Adding sample users...');

            // Sample users to add
            const users = [
                {
                    name: 'Admin User',
                    email: 'admin@restaurant.com',
                    password: 'admin123',
                    role: 'admin'
                },
                {
                    name: 'Manager User',
                    email: 'manager@restaurant.com',
                    password: 'manager123',
                    role: 'manager'
                },
                {
                    name: 'Staff User',
                    email: 'staff@restaurant.com',
                    password: 'staff123',
                    role: 'staff'
                }
            ];

            // Hash passwords and insert users
            for (const user of users) {
                const hashedPassword = await hash(user.password, 10);

                await pool.query(
                    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                    [user.name, user.email, hashedPassword, user.role]
                );

                console.log(`Added user: ${user.email}`);
            }

            console.log('Sample users added successfully');
        } else {
            console.log(`${userCount} users already exist in the database. Skipping sample user creation.`);
        }

        // Check if subscription_events table exists, create if not
        const subscriptionEventsTableQuery = `
        CREATE TABLE IF NOT EXISTS subscription_events (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            event_type VARCHAR(50) NOT NULL,
            plan_id VARCHAR(50) NOT NULL,
            amount DECIMAL(10, 2),
            status VARCHAR(20) NOT NULL,
            session_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(subscriptionEventsTableQuery);
        console.log('✅ subscription_events table ready');

        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        // Close the pool
        await pool.end();
    }
}

// Run the setup function when this script is executed directly
if (require.main === module) {
    setup()
        .then(() => {
            console.log('Setup completed successfully.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

// Export the setup function for programmatic usage
export default setup; 