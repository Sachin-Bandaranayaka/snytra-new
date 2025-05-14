import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: NetServer & {
            io?: SocketIOServer;
        };
    };
};

// Initialize Socket.io server
export const initSocketServer = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
    // Check if Socket.io server is already initialized
    if (!res.socket.server.io) {
        console.log('Initializing Socket.io server...');

        // Create new Socket.io server instance
        const io = new SocketIOServer(res.socket.server);

        // Store the Socket.io server instance on the server object
        res.socket.server.io = io;

        // Set up event handlers
        io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);

            // Rooms for different user types
            socket.on('join-kitchen', () => {
                socket.join('kitchen-staff');
                console.log(`${socket.id} joined kitchen-staff room`);
            });

            socket.on('join-staff', () => {
                socket.join('restaurant-staff');
                console.log(`${socket.id} joined restaurant-staff room`);
            });

            socket.on('join-customer', (orderId) => {
                socket.join(`customer-${orderId}`);
                console.log(`${socket.id} joined customer-${orderId} room`);
            });

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    return res.socket.server.io;
};

// Helper functions to emit events
export const notifyKitchenStaff = (io: SocketIOServer, data: any) => {
    io.to('kitchen-staff').emit('kitchen-update', data);
};

export const notifyOrderStatusChange = (io: SocketIOServer, orderId: number, status: string) => {
    io.to(`customer-${orderId}`).emit('order-status-change', {
        orderId,
        status,
        timestamp: new Date().toISOString()
    });
    io.to('restaurant-staff').emit('order-status-change', {
        orderId,
        status,
        timestamp: new Date().toISOString()
    });
    io.to('kitchen-staff').emit('order-status-change', {
        orderId,
        status,
        timestamp: new Date().toISOString()
    });
};

export const notifyNewOrder = (io: SocketIOServer, orderData: any) => {
    io.to('kitchen-staff').emit('new-order', orderData);
    io.to('restaurant-staff').emit('new-order', orderData);
};

export const sendStaffMessage = (io: SocketIOServer, from: string, to: string, message: string) => {
    io.to(to).emit('staff-message', {
        from,
        message,
        timestamp: new Date().toISOString()
    });
}; 