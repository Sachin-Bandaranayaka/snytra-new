import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { tableId, requestType, notes } = await request.json();

        if (!tableId || !requestType) {
            return NextResponse.json(
                { error: 'Table ID and request type are required' },
                { status: 400 }
            );
        }

        // Validate table exists
        const tableResult = await pool.query(
            `SELECT * FROM tables WHERE id = $1`,
            [tableId]
        );

        if (tableResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Table not found' },
                { status: 404 }
            );
        }

        // Create service request
        const result = await pool.query(
            `INSERT INTO service_requests (table_id, request_type, status, notes)
       VALUES ($1, $2, 'pending', $3)
       RETURNING id`,
            [tableId, requestType, notes || null]
        );

        const requestId = result.rows[0].id;

        // TODO: In a real implementation, send a notification to staff
        // For now, we're just creating the database record

        return NextResponse.json({
            success: true,
            requestId,
            message: 'Service request created successfully'
        });
    } catch (error) {
        console.error('Error creating service request:', error);
        return NextResponse.json(
            { error: 'Failed to create service request' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const requestId = searchParams.get('requestId');

        if (requestId) {
            // Get specific service request
            const result = await pool.query(
                `SELECT * FROM service_requests WHERE id = $1`,
                [requestId]
            );

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Service request not found' },
                    { status: 404 }
                );
            }

            const request = result.rows[0];

            return NextResponse.json({
                request: {
                    id: request.id,
                    tableId: request.table_id,
                    requestType: request.request_type,
                    status: request.status,
                    notes: request.notes,
                    createdAt: request.created_at,
                    resolvedAt: request.resolved_at
                }
            });
        } else {
            // Get all service requests (with optional filter by table)
            const tableId = searchParams.get('tableId');
            let query = `SELECT * FROM service_requests ORDER BY created_at DESC`;
            let params: any[] = [];

            if (tableId) {
                query = `SELECT * FROM service_requests WHERE table_id = $1 ORDER BY created_at DESC`;
                params = [tableId];
            }

            const result = await pool.query(query, params);

            return NextResponse.json({
                requests: result.rows.map(request => ({
                    id: request.id,
                    tableId: request.table_id,
                    requestType: request.request_type,
                    status: request.status,
                    notes: request.notes,
                    createdAt: request.created_at,
                    resolvedAt: request.resolved_at
                }))
            });
        }
    } catch (error) {
        console.error('Error fetching service requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service requests' },
            { status: 500 }
        );
    }
} 