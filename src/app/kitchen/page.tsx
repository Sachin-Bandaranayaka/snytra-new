"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Clock,
    ChefHat,
    CheckCircle,
    Bell,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Filter,
    Timer,
    Volume2,
    VolumeX,
    Wifi,
    WifiOff
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    notes?: string;
}

interface Order {
    id: number;
    tableNumber?: string;
    customerName: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    items: OrderItem[];
    createdAt: string;
    preparationTimeMinutes?: number;
    specialInstructions?: string;
    priority?: 'low' | 'normal' | 'high';
}

export default function KitchenDisplayPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('active'); // 'all', 'active', 'completed'
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timers, setTimers] = useState<Record<number, number>>({});
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Socket integration
    const { socket, isConnected, socketError, joinKitchenStaff } = useSocket();
    const [notifications, setNotifications] = useState<{ message: string, timestamp: Date }[]>([]);

    // Initialize audio elements
    useEffect(() => {
        audioRef.current = new Audio('/sounds/order-alert.mp3');
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Join kitchen staff room when socket is connected
    useEffect(() => {
        if (isConnected) {
            joinKitchenStaff();
        }
    }, [isConnected, joinKitchenStaff]);

    // Listen for socket events
    useEffect(() => {
        if (!socket) return;

        // Listen for new orders
        const handleNewOrder = (data: any) => {
            setOrders(prevOrders => {
                // Check if order already exists
                if (prevOrders.some(order => order.id === data.id)) {
                    return prevOrders;
                }
                // Add new order
                const newOrder = {
                    ...data,
                    status: data.status as any,
                };

                // Play alert sound for new orders
                playAlertSound();

                // Add notification
                addNotification(`New order #${data.id} received`);

                return [newOrder, ...prevOrders];
            });
        };

        // Listen for order status updates
        const handleOrderStatusChange = (data: any) => {
            setOrders(prevOrders => {
                return prevOrders.map(order => {
                    if (order.id === data.orderId) {
                        addNotification(`Order #${data.orderId} status changed to ${data.status}`);
                        return { ...order, status: data.status as any };
                    }
                    return order;
                });
            });
        };

        // Register event listeners
        socket.on('new-order', handleNewOrder);
        socket.on('order-status-change', handleOrderStatusChange);
        socket.on('kitchen-update', (data) => {
            console.log('Kitchen update received:', data);
            fetchOrders(); // Refresh orders on kitchen-specific updates
        });

        // Cleanup on unmount
        return () => {
            socket.off('new-order', handleNewOrder);
            socket.off('order-status-change', handleOrderStatusChange);
            socket.off('kitchen-update');
        };
    }, [socket]);

    // Add a notification
    const addNotification = (message: string) => {
        setNotifications(prev => [
            { message, timestamp: new Date() },
            ...prev.slice(0, 4) // Keep only the 5 most recent notifications
        ]);
    };

    // Fetch orders initially and set up polling for updates
    useEffect(() => {
        fetchOrders();

        // Poll for updates every 30 seconds
        const intervalId = setInterval(fetchOrders, 30000);

        return () => clearInterval(intervalId);
    }, []);

    // Timer effect for preparation times
    useEffect(() => {
        const timerInterval = setInterval(() => {
            setTimers(prevTimers => {
                const newTimers = { ...prevTimers };
                // Decrement each timer by 1 second
                Object.keys(newTimers).forEach(key => {
                    const orderId = parseInt(key);
                    if (newTimers[orderId] > 0) {
                        newTimers[orderId] -= 1;
                    } else if (newTimers[orderId] === 0) {
                        // Play sound when timer reaches zero
                        if (soundEnabled && audioRef.current) {
                            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
                        }
                        // Keep at zero to indicate completion
                        newTimers[orderId] = 0;
                    }
                });
                return newTimers;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [soundEnabled]);

    // Initialize timers when orders change
    useEffect(() => {
        const newTimers: Record<number, number> = {};

        orders.forEach(order => {
            if (order.status === 'preparing' && order.preparationTimeMinutes) {
                // Only initialize timer if it doesn't exist yet or if status just changed to preparing
                if (!timers[order.id]) {
                    newTimers[order.id] = order.preparationTimeMinutes * 60; // convert to seconds
                } else {
                    newTimers[order.id] = timers[order.id]; // keep existing timer
                }
            }
        });

        setTimers(prev => ({ ...prev, ...newTimers }));
    }, [orders]);

    // Format timer display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Filtered orders based on status
    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return ['pending', 'preparing'].includes(order.status);
        if (statusFilter === 'ready') return order.status === 'ready';
        if (statusFilter === 'completed') return ['completed', 'cancelled'].includes(order.status);
        return true;
    });

    // Play alert sound for new orders
    const playAlertSound = () => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    async function fetchOrders() {
        try {
            setIsRefreshing(true);
            const response = await fetch('/api/kitchen/orders');

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Check for new pending orders to play sound alert
                const newPendingOrders = data.orders.filter(
                    (newOrder: Order) =>
                        newOrder.status === 'pending' &&
                        !orders.some(existingOrder => existingOrder.id === newOrder.id)
                );

                if (newPendingOrders.length > 0) {
                    playAlertSound();
                }

                setOrders(data.orders);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch orders');
            }
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }

    async function updateOrderStatus(orderId: number, newStatus: string) {
        try {
            const response = await fetch(`/api/kitchen/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update order status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Update the local state with the new status
                setOrders(orders.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus as any }
                        : order
                ));

                // If status changed to completed, play a sound
                if (newStatus === 'ready' && soundEnabled && audioRef.current) {
                    audioRef.current.play().catch(e => console.error("Error playing sound:", e));
                }
            } else {
                throw new Error(data.error || 'Failed to update order status');
            }
        } catch (err: any) {
            console.error('Error updating order status:', err);
            // You could add toast notifications here
        }
    }

    async function updateOrderPriority(orderId: number, priority: 'low' | 'normal' | 'high') {
        try {
            const response = await fetch(`/api/kitchen/orders/${orderId}/priority`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priority }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update order priority: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Update the local state with the new priority
                setOrders(orders.map(order =>
                    order.id === orderId
                        ? { ...order, priority }
                        : order
                ));
            } else {
                throw new Error(data.error || 'Failed to update order priority');
            }
        } catch (err: any) {
            console.error('Error updating order priority:', err);
        }
    }

    function getOrderStatusDetails(status: string) {
        switch (status) {
            case 'pending':
                return {
                    color: 'bg-blue-100 text-blue-800',
                    icon: <Clock className="w-5 h-5" />,
                    label: 'Pending'
                };
            case 'preparing':
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <ChefHat className="w-5 h-5" />,
                    label: 'Preparing'
                };
            case 'ready':
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="w-5 h-5" />,
                    label: 'Ready'
                };
            case 'completed':
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <CheckCircle className="w-5 h-5" />,
                    label: 'Completed'
                };
            case 'cancelled':
                return {
                    color: 'bg-red-100 text-red-800',
                    icon: <XCircle className="w-5 h-5" />,
                    label: 'Cancelled'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <AlertTriangle className="w-5 h-5" />,
                    label: 'Unknown'
                };
        }
    }

    // Calculate how long ago the order was placed
    function getElapsedTime(createdAt: string) {
        const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000); // minutes

        if (elapsed < 1) return 'Just now';
        if (elapsed === 1) return '1 minute ago';
        if (elapsed < 60) return `${elapsed} minutes ago`;

        const hours = Math.floor(elapsed / 60);
        if (hours === 1) return '1 hour ago';
        return `${hours} hours ago`;
    }

    // Get appropriate actions based on order status
    function getAvailableActions(order: Order) {
        switch (order.status) {
            case 'pending':
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600"
                    >
                        Start Preparing
                    </button>
                );
            case 'preparing':
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600"
                    >
                        Mark as Ready
                    </button>
                );
            case 'ready':
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"
                    >
                        Mark Completed
                    </button>
                );
            default:
                return null;
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Kitchen Display System</h1>
                            <div className="ml-3">
                                {isConnected ? (
                                    <span className="inline-flex items-center text-xs text-green-600">
                                        <Wifi className="w-3 h-3 mr-1" /> Live
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center text-xs text-red-600">
                                        <WifiOff className="w-3 h-3 mr-1" /> Offline
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {soundEnabled ? <Volume2 className="h-4 w-4 mr-1.5" /> : <VolumeX className="h-4 w-4 mr-1.5" />}
                                {soundEnabled ? 'Sound On' : 'Sound Off'}
                            </button>
                            <div className="flex items-center">
                                <span className="mr-2 text-sm text-gray-500">
                                    <Filter className="w-4 h-4 inline mr-1" />
                                    Filter:
                                </span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-300 rounded-md text-sm py-1 pl-2 pr-8"
                                >
                                    <option value="all">All Orders</option>
                                    <option value="active">Active Orders</option>
                                    <option value="ready">Ready for Pickup</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <button
                                onClick={fetchOrders}
                                disabled={isRefreshing}
                                className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {socketError && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-700">
                            <WifiOff className="w-4 h-4 inline mr-1" />
                            {socketError} Manual refresh is still available.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Notifications area */}
                {notifications.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-medium text-gray-500 mb-2">Recent Updates</h2>
                        <div className="bg-white shadow-sm rounded-md p-3 border border-gray-200">
                            <ul className="divide-y divide-gray-100">
                                {notifications.map((notification, index) => (
                                    <li key={index} className="py-2 flex justify-between items-center text-sm">
                                        <span>{notification.message}</span>
                                        <span className="text-xs text-gray-500">
                                            {notification.timestamp.toLocaleTimeString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <ChefHat className="w-16 h-16 text-gray-400 mb-4" />
                        <h2 className="text-xl font-medium text-gray-500">No orders to display</h2>
                        <p className="text-gray-500 mt-1">
                            {statusFilter === 'all'
                                ? 'There are no orders in the system.'
                                : `There are no ${statusFilter} orders at the moment.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrders.map((order) => {
                            const statusDetails = getOrderStatusDetails(order.status);
                            const orderTimer = timers[order.id];
                            const isPreparing = order.status === 'preparing';
                            const timerExpired = isPreparing && orderTimer === 0;

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 
                                    ${order.status === 'pending' ? 'border-blue-500' :
                                            order.status === 'preparing' ?
                                                (timerExpired ? 'border-red-500' : 'border-yellow-500') :
                                                order.status === 'ready' ? 'border-green-500' : 'border-gray-300'
                                        } 
                                        ${order.priority === 'high' ? 'ring-2 ring-red-500' :
                                            order.priority === 'low' ? 'ring-1 ring-blue-300' : ''}
                                    `}
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                                                <p className="text-gray-500 text-sm">
                                                    {order.tableNumber
                                                        ? `Table ${order.tableNumber}`
                                                        : `${order.customerName}`}
                                                </p>
                                                <div className="mt-1 flex space-x-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDetails.color}`}>
                                                        {statusDetails.icon}
                                                        <span className="ml-1">{statusDetails.label}</span>
                                                    </span>

                                                    {order.priority && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                            ${order.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                                order.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'}`}
                                                        >
                                                            {order.priority === 'high' ? '⚡ High' :
                                                                order.priority === 'low' ? '↓ Low' :
                                                                    '→ Normal'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">{getElapsedTime(order.createdAt)}</p>

                                                {isPreparing && order.preparationTimeMinutes && (
                                                    <div className={`flex items-center mt-1 rounded px-2 py-1 text-sm
                                                        ${timerExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        <Timer className="w-4 h-4 mr-1" />
                                                        <span>{formatTime(orderTimer !== undefined ? orderTimer : 0)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-b border-gray-200 py-3 mb-4">
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
                                            <ul className="divide-y divide-gray-200">
                                                {order.items.map((item) => (
                                                    <li key={item.id} className="py-2">
                                                        <div className="flex justify-between">
                                                            <div className="flex">
                                                                <span className="font-medium text-gray-900">{item.quantity}x</span>
                                                                <span className="ml-2 text-gray-900">{item.name}</span>
                                                            </div>
                                                        </div>
                                                        {item.notes && (
                                                            <p className="mt-1 text-sm text-gray-500">{item.notes}</p>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {order.specialInstructions && (
                                            <div className="mb-4">
                                                <h3 className="text-sm font-medium text-gray-500 mb-1">Special Instructions</h3>
                                                <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">{order.specialInstructions}</p>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            {order.status === 'pending' || order.status === 'preparing' ? (
                                                <div className="flex items-center">
                                                    <span className="text-xs text-gray-500 mr-2">Priority:</span>
                                                    <select
                                                        value={order.priority || 'normal'}
                                                        onChange={(e) => updateOrderPriority(order.id, e.target.value as any)}
                                                        className="text-xs border border-gray-300 rounded p-1"
                                                    >
                                                        <option value="low">Low</option>
                                                        <option value="normal">Normal</option>
                                                        <option value="high">High</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}

                                            <div>
                                                {getAvailableActions(order)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Hidden audio for alerts */}
            <audio ref={audioRef} />
        </div>
    );
} 