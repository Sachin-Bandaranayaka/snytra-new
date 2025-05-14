"use client";

import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';

interface CallWaiterProps {
    tableId: number;
}

const CallWaiter = ({ tableId }: CallWaiterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCallWaiter = async (reason: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/service/call-waiter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tableId,
                    reason,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send request');
            }

            setRequestSent(true);

            // Auto close after 5 seconds
            setTimeout(() => {
                setIsOpen(false);
                // Reset after animation completes
                setTimeout(() => setRequestSent(false), 300);
            }, 5000);
        } catch (err: any) {
            console.error('Error calling waiter:', err);
            setError(err.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Reset after animation completes
        setTimeout(() => {
            setRequestSent(false);
            setError(null);
        }, 300);
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-orange-500 text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                aria-label="Call Waiter"
            >
                <Bell size={24} />
            </button>

            {/* Modal dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
                    {/* Backdrop overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-md">
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="px-6 py-6 sm:px-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {requestSent ? 'Request Sent' : 'Call Waiter'}
                            </h3>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                                    {error}
                                </div>
                            )}

                            {requestSent ? (
                                <div className="text-center py-6">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        A waiter has been notified and will be with you shortly.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-600 mb-4">
                                        Select a reason to call a waiter to your table:
                                    </p>

                                    <div className="grid grid-cols-1 gap-3 mt-4">
                                        <button
                                            onClick={() => handleCallWaiter('assistance')}
                                            disabled={loading}
                                            className="w-full py-3 px-4 text-left rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            I need assistance
                                        </button>
                                        <button
                                            onClick={() => handleCallWaiter('order')}
                                            disabled={loading}
                                            className="w-full py-3 px-4 text-left rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            I want to place an order
                                        </button>
                                        <button
                                            onClick={() => handleCallWaiter('bill')}
                                            disabled={loading}
                                            className="w-full py-3 px-4 text-left rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            I want to pay the bill
                                        </button>
                                        <button
                                            onClick={() => handleCallWaiter('other')}
                                            disabled={loading}
                                            className="w-full py-3 px-4 text-left rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Other
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CallWaiter; 