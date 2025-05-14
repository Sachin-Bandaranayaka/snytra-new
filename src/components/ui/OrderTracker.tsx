import { useState, useEffect } from 'react';
import {
    CheckCircle,
    Clock,
    ChefHat,
    UtensilsCrossed,
    ShoppingBag,
    Truck
} from 'lucide-react';

interface OrderStatusProps {
    orderId: number;
    initialStatus?: string;
}

const statusSteps = [
    { key: 'pending', label: 'Order Received', icon: Clock, color: 'text-[#e75627]' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-[#e75627]' },
    { key: 'ready', label: 'Ready', icon: UtensilsCrossed, color: 'text-[#e75627]' },
    { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-[#e75627]' },
];

const OrderTracker = ({ orderId, initialStatus = 'pending' }: OrderStatusProps) => {
    const [status, setStatus] = useState(initialStatus);
    const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Find the current status index in the steps
    const currentStatusIndex = statusSteps.findIndex(step => step.key === status);

    useEffect(() => {
        // Initial fetch of order status
        fetchOrderStatus();

        // Set up polling for real-time updates every 30 seconds
        const intervalId = setInterval(fetchOrderStatus, 30000);

        return () => clearInterval(intervalId);
    }, [orderId]);

    const fetchOrderStatus = async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${orderId}/status`);

            if (!response.ok) {
                throw new Error(`Failed to fetch order status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setStatus(data.status);
                setEstimatedTime(data.estimatedTime || null);
                setError(null);
            } else {
                setError(data.error || 'Failed to get order status');
            }
        } catch (err: any) {
            console.error('Error fetching order status:', err);
            setError(err.message || 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#e75627] mb-4">Order Status</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <div className="relative">
                {/* Progress Line */}
                <div
                    className="absolute left-5 top-6 h-full w-0.5 bg-gray-200"
                    style={{ height: `${(statusSteps.length - 1) * 4}rem` }}
                ></div>

                {/* Status Steps */}
                <div className="space-y-8">
                    {statusSteps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = index <= currentStatusIndex;
                        const isCurrentStep = index === currentStatusIndex;

                        return (
                            <div key={step.key} className="flex items-start">
                                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full ${isActive ? step.color : 'text-gray-400'
                                    } ${isActive ? 'bg-white' : 'bg-gray-100'}`}>
                                    <StepIcon size={20} />
                                    {isActive && (
                                        <div className={`absolute -inset-1 rounded-full ${isActive ? 'bg-[#e75627]/10' : 'bg-gray-100'
                                            } ${isCurrentStep ? 'animate-pulse' : ''}`}>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {step.label}
                                    </p>
                                    {isCurrentStep && estimatedTime && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {step.key === 'pending' && `Est. preparation time: ${estimatedTime} min`}
                                            {step.key === 'preparing' && `Ready in about ${estimatedTime} min`}
                                            {step.key === 'ready' && `Your order is ready!`}
                                            {step.key === 'completed' && `Enjoy your meal!`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order details */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Order #{orderId}</p>
                    <button
                        onClick={fetchOrderStatus}
                        disabled={loading}
                        className="text-sm text-[#e75627] hover:text-[#d24a1f] disabled:opacity-50">
                        {loading ? 'Updating...' : 'Refresh'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderTracker; 