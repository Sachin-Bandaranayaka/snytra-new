'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestEmailButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

    const sendTestEmail = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await axios.post('/api/send-email', {
                type: 'test',
                data: {
                    to: 'your-email@example.com', // Change this to your email
                    subject: 'Test Email from Restaurant OS',
                    html: '<h1>This is a test email</h1><p>If you receive this, the email service is working correctly!</p>'
                }
            });

            setResult({
                success: true,
                message: 'Email sent successfully!'
            });
        } catch (error: any) {
            setResult({
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Email Testing</h2>

            <button
                onClick={sendTestEmail}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
                {loading ? 'Sending...' : 'Send Test Email'}
            </button>

            {result && (
                <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {result.success ? (
                        <p>{result.message}</p>
                    ) : (
                        <div>
                            <p className="font-semibold">Error sending email:</p>
                            <p>{result.error}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                <p>This will send a test email using the Nodemailer service.</p>
                <p>Make sure to configure your email credentials in the .env.local file.</p>
            </div>
        </div>
    );
} 