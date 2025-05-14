import { NextRequest, NextResponse } from 'next/server';
import { initSocketServer, NextApiResponseWithSocket } from '@/lib/socket-server';

export async function GET(req: NextRequest, res: any) {
    try {
        // Initialize Socket.io server
        if (res.socket && res.socket.server) {
            initSocketServer(req as any, res as NextApiResponseWithSocket);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error initializing socket server:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to initialize socket server' },
            { status: 500 }
        );
    }
} 