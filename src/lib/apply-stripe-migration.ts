import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './db';

async function applyStripeMigration() {
    const client = await pool.connect();

    try {
        console.log('🔄 Applying Stripe-related migrations...');

        // Read the migration SQL file
        const migrationPath = join(process.cwd(), 'src', 'lib', 'stripe-migration.sql');
        const migrationSql = readFileSync(migrationPath, 'utf8');

        // Execute the migration SQL
        await client.query(migrationSql);

        console.log('✅ Stripe migration successfully applied!');
    } catch (error) {
        console.error('❌ Error applying Stripe migration:', error);
        throw error;
    } finally {
        client.release();
    }
}

// If this file is run directly, apply the migration
if (require.main === module) {
    applyStripeMigration()
        .then(() => {
            console.log('Migration process completed successfully.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration process failed:', error);
            process.exit(1);
        });
}

export default applyStripeMigration; 