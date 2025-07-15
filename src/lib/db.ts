/**
 * Standardized database client for the application
 * Uses the Neon serverless database client for all operations
 */
import { neon, neonConfig } from '@neondatabase/serverless';
import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { logger } from './logger';

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
const isServerless = process.env.VERCEL === '1';

// Get connection string from environment and trim any whitespace/newlines/quotes
let connectionString = process.env.DATABASE_URL?.trim();

if (connectionString?.startsWith('DATABASE_URL=')) {
    connectionString = connectionString.substring('DATABASE_URL='.length);
}

// Remove quotes that might be wrapping the connection string
connectionString = connectionString?.replace(/^["']|["']$/g, '');

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

// Configure neon
neonConfig.fetchConnectionCache = true;

// Create singleton instances to prevent connection pool exhaustion
let _sqlClient: ReturnType<typeof neon> | null = null;
let _pool: Pool | null = null;
let _prisma: PrismaClient | null = null;

/**
 * Get SQL client for raw SQL queries
 * Uses serverless client in production, connection pool in development
 */
export function getSqlClient() {
    if (!_sqlClient) {
        try {
            _sqlClient = neon(connectionString);
            logger.info('SQL client initialized with neon serverless');
        } catch (error) {
            logger.error('Failed to initialize SQL client', { error });
            throw error;
        }
    }
    return _sqlClient;
}

/**
 * Get connection pool for transactions that need persistent connections
 * Only use this when absolutely necessary (complex transactions)
 */
export function getConnectionPool() {
    if (isServerless) {
        throw new Error('Connection pool is not supported in serverless environments. Use getSqlClient instead.');
    }

    if (!_pool) {
        try {
            _pool = new Pool({ connectionString });
            logger.info('Database connection pool initialized');
        } catch (error) {
            logger.error('Failed to initialize connection pool', { error });
            throw error;
        }
    }
    return _pool;
}

/**
 * Get Prisma client for ORM operations
 */
export function getPrismaClient() {
    if (!_prisma) {
        try {
            _prisma = new PrismaClient({
                datasources: {
                    db: {
                        url: connectionString,
                    },
                },
                log: isProduction ? ['error'] : ['query', 'error', 'warn'],
            });
            logger.info('Prisma client initialized');
        } catch (error) {
            logger.error('Failed to initialize Prisma client', { error });
            throw error;
        }
    }
    return _prisma;
}

/**
 * Execute a single query with error handling
 */
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
    try {
        const sql = getSqlClient();
        return await sql(query, params) as T;
    } catch (error) {
        logger.error('Database query failed', { query, params, error });
        throw error;
    }
}

/**
 * Execute a transaction with multiple queries
 */
export async function executeTransaction<T = any>(
    queries: { query: string; params: any[] }[]
): Promise<T[]> {
    if (isServerless) {
        // In serverless, use Prisma for transactions
        const prisma = getPrismaClient();
        return prisma.$transaction(async (tx) => {
            return Promise.all(
                queries.map(({ query, params }) =>
                    tx.$queryRawUnsafe(query, ...params)
                )
            );
        }) as Promise<T[]>;
    } else {
        // In development, use pg Pool for transactions
        const pool = getConnectionPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const results = await Promise.all(
                queries.map(({ query, params }) =>
                    client.query(query, params)
                )
            );
            await client.query('COMMIT');
            return results.map(result => result.rows) as any;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Transaction failed', { error });
            throw error;
        } finally {
            client.release();
        }
    }
}

// For backward compatibility
export const sql = getSqlClient();
export const pool = !isServerless ? getConnectionPool() : undefined;

// Export default client for convenience
export const db = {
    sql: getSqlClient(),
    prisma: getPrismaClient(),
    executeQuery,
    executeTransaction,
};

// Clean up connections on process exit
if (!isServerless && process.env.NODE_ENV !== 'test') {
    process.on('beforeExit', async () => {
        if (_pool) {
            await _pool.end();
        }
        if (_prisma) {
            await _prisma.$disconnect();
        }
        logger.info('Database connections closed');
    });
}

export default db; 