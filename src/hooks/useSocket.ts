import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

// Define event types
export type OrderStatusUpdate = {
    orderId: number;
    status: string;
    timestamp: string;
};

export type NewOrderEvent = {
    id: number;
    customerName: string;
    tableNumber?: string;
    status: string;
    items: Array<{ id: number; name: string; quantity: number; notes?: string }>;
    priority?: 'low' | 'normal' | 'high';
    specialInstructions?: string;
    createdAt: string;
};

export type StaffMessageEvent = {
    from: string;
    message: string;
    timestamp: string;
};

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketError, setSocketError] = useState<string | null>(null);

    useEffect(() => {
        // Function to initialize the socket connection
        const initSocket = async () => {
            try {
                // Make sure the socket server is initialized
                await fetch('/api/socket');

                // Create Socket.io connection
                const socketConnection = io();

                socketConnection.on('connect', () => {
                    console.log('Socket.io connection established');
                    setIsConnected(true);
                    setSocketError(null);
                });

                socketConnection.on('connect_error', (err) => {
                    console.error('Socket.io connection error:', err);
                    setIsConnected(false);
                    setSocketError('Connection failed. Please try again later.');
                });

                socketConnection.on('disconnect', () => {
                    console.log('Socket.io disconnected');
                    setIsConnected(false);
                });

                setSocket(socketConnection);

                // Clean up on unmount
                return () => {
                    socketConnection.disconnect();
                };
            } catch (error) {
                console.error('Failed to initialize Socket.io:', error);
                setSocketError('Failed to initialize real-time updates. Please refresh the page.');
            }
        };

        initSocket();
    }, []);

    // Join kitchen staff room
    const joinKitchenStaff = () => {
        if (socket && isConnected) {
            socket.emit('join-kitchen');
        }
    };

    // Join restaurant staff room
    const joinRestaurantStaff = () => {
        if (socket && isConnected) {
            socket.emit('join-staff');
        }
    };

    // Join customer room for specific order
    const joinCustomerRoom = (orderId: number) => {
        if (socket && isConnected) {
            socket.emit('join-customer', orderId);
        }
    };

    // Send message between staff members
    const sendStaffMessage = (to: string, message: string) => {
        if (socket && isConnected) {
            socket.emit('staff-message', { to, message });
            return true;
        }
        return false;
    };

    return {
        socket,
        isConnected,
        socketError,
        joinKitchenStaff,
        joinRestaurantStaff,
        joinCustomerRoom,
        sendStaffMessage
    };
}; 