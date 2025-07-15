import { PrismaClient } from '../generated/prisma';

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

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
        db: {
            url: connectionString,
        },
    },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 