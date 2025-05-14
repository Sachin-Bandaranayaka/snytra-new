import db from '@/lib/db';

type ActivityStatus = 'completed' | 'pending' | 'failed';

interface LogActivityParams {
    activityType: string;
    userId?: number;
    userName?: string;
    details?: Record<string, any>;
    status?: ActivityStatus;
}

/**
 * Logs an activity in the system
 */
export async function logActivity({
    activityType,
    userId,
    userName,
    details = {},
    status = 'completed'
}: LogActivityParams) {
    try {
        // Check if the activity_logs table exists
        const tableCheck = await db.sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'activity_logs'
            ) as exists
        `;

        const tableExists = tableCheck[0]?.exists || false;

        // If table doesn't exist, exit silently (we don't want to break functionality)
        if (!tableExists) {
            console.warn('Activity logs table does not exist. Activity not logged.');
            return;
        }

        // Insert the activity log
        const result = await db.sql`
            INSERT INTO activity_logs 
            (activity_type, user_id, user_name, details, status) 
            VALUES 
            (${activityType}, ${userId || null}, ${userName || null}, ${JSON.stringify(details)}, ${status})
            RETURNING id
        `;

        return result[0]?.id;
    } catch (error) {
        // Log the error but don't throw - we don't want activity logging to break the app
        console.error('Error logging activity:', error);
        return null;
    }
}

/**
 * Utility to mark an activity as complete
 */
export async function completeActivity(activityId: number, details?: Record<string, any>) {
    try {
        if (!activityId) return;

        if (details) {
            const result = await db.sql`
                UPDATE activity_logs
                SET status = 'completed', 
                    details = details || ${JSON.stringify(details)}::jsonb
                WHERE id = ${activityId}
                RETURNING id
            `;
            return result[0]?.id;
        } else {
            const result = await db.sql`
                UPDATE activity_logs
                SET status = 'completed'
                WHERE id = ${activityId}
                RETURNING id
            `;
            return result[0]?.id;
        }
    } catch (error) {
        console.error('Error completing activity:', error);
        return null;
    }
}

/**
 * Utility to mark an activity as failed
 */
export async function failActivity(activityId: number, errorDetails?: Record<string, any>) {
    try {
        if (!activityId) return;

        if (errorDetails) {
            const result = await db.sql`
                UPDATE activity_logs
                SET status = 'failed', 
                    details = details || ${JSON.stringify({ error: errorDetails })}::jsonb
                WHERE id = ${activityId}
                RETURNING id
            `;
            return result[0]?.id;
        } else {
            const result = await db.sql`
                UPDATE activity_logs
                SET status = 'failed'
                WHERE id = ${activityId}
                RETURNING id
            `;
            return result[0]?.id;
        }
    } catch (error) {
        console.error('Error failing activity:', error);
        return null;
    }
} 