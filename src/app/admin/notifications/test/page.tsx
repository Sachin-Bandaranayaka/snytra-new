'use client';

import { useState } from 'react';

// Define enums here instead of importing from server components
enum NotificationChannel {
    EMAIL = 'email',
    WHATSAPP = 'whatsapp',
    SMS = 'sms',
    IN_APP = 'in_app'
}

enum NotificationType {
    ORDER_CONFIRMATION = 'order_confirmation',
    RESERVATION_CONFIRMATION = 'reservation_confirmation',
    PAYMENT_CONFIRMATION = 'payment_confirmation',
    ORDER_STATUS_UPDATE = 'order_status_update',
    TABLE_READY = 'table_ready',
    REGISTRATION = 'registration',
    PASSWORD_RESET = 'password_reset',
    GENERAL = 'general'
}

export default function NotificationTestPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        channel: NotificationChannel.EMAIL,
        type: NotificationType.GENERAL,
        recipient: '',
        subject: '',
        content: '',
        templateId: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send notification');
            }

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // WhatsApp test templates
    const whatsappTemplates = [
        { id: 'order_confirmation', name: 'Order Confirmation' },
        { id: 'waitlist_notification', name: 'Waitlist Notification' },
    ];

    // Set default template based on selected type
    const updateTemplateId = (type: string) => {
        let templateId = '';
        if (formData.channel === NotificationChannel.WHATSAPP) {
            if (type === NotificationType.ORDER_CONFIRMATION) {
                templateId = 'order_confirmation';
            } else if (type === NotificationType.TABLE_READY) {
                templateId = 'waitlist_notification';
            }
        }
        setFormData(prev => ({ ...prev, templateId }));
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as NotificationType;
        setFormData(prev => ({ ...prev, type: newType }));
        updateTemplateId(newType);
    };

    const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newChannel = e.target.value as NotificationChannel;
        setFormData(prev => ({ ...prev, channel: newChannel }));

        // Clear subject if not email
        if (newChannel !== NotificationChannel.EMAIL) {
            setFormData(prev => ({ ...prev, subject: '' }));
        }

        // Set template ID if WhatsApp
        if (newChannel === NotificationChannel.WHATSAPP) {
            updateTemplateId(formData.type);
        } else {
            setFormData(prev => ({ ...prev, templateId: '' }));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Notification Test Panel</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Send Test Notification</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notification Channel
                            </label>
                            <select
                                name="channel"
                                value={formData.channel}
                                onChange={handleChannelChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required
                            >
                                {Object.values(NotificationChannel).map(channel => (
                                    <option key={channel} value={channel}>{channel.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notification Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleTypeChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required
                            >
                                {Object.values(NotificationType).map(type => (
                                    <option key={type} value={type}>{type.replace(/_/g, ' ').toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recipient {formData.channel === NotificationChannel.EMAIL ? '(Email)' : '(Phone)'}
                            </label>
                            <input
                                type={formData.channel === NotificationChannel.EMAIL ? 'email' : 'text'}
                                name="recipient"
                                value={formData.recipient}
                                onChange={handleChange}
                                placeholder={formData.channel === NotificationChannel.EMAIL
                                    ? 'recipient@example.com'
                                    : '+1234567890'}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        {formData.channel === NotificationChannel.EMAIL && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Email Subject"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        )}

                        {formData.channel === NotificationChannel.WHATSAPP && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Template ID
                                </label>
                                <select
                                    name="templateId"
                                    value={formData.templateId}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select Template</option>
                                    {whatsappTemplates.map(template => (
                                        <option key={template.id} value={template.id}>{template.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {formData.channel === NotificationChannel.EMAIL && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Content (HTML)
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="<h1>Email Content</h1><p>Your message here...</p>"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows={6}
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-6">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Notification Sent!</h3>
                    <pre className="bg-white p-3 rounded-md overflow-auto text-sm">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                <h3 className="text-lg font-medium text-blue-800 mb-2">API Documentation</h3>
                <p className="mb-3">
                    Use these endpoints to send notifications programmatically:
                </p>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-blue-800">Send Single Notification</h4>
                        <code className="block bg-white p-3 rounded-md overflow-auto text-sm">
                            POST /api/notifications/send
                        </code>
                        <p className="mt-1 text-sm">Example payload:</p>
                        <pre className="bg-white p-3 rounded-md overflow-auto text-sm">
                            {`{
  "channel": "email",
  "type": "general",
  "recipient": "customer@example.com",
  "subject": "Important Update",
  "content": "<h1>Hello!</h1><p>This is a test notification.</p>"
}`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold text-blue-800">Send Multiple Notifications</h4>
                        <code className="block bg-white p-3 rounded-md overflow-auto text-sm">
                            POST /api/notifications/send-multi
                        </code>
                        <p className="mt-1 text-sm">Example payload:</p>
                        <pre className="bg-white p-3 rounded-md overflow-auto text-sm">
                            {`{
  "notifications": [
    {
      "channel": "email",
      "type": "order_confirmation",
      "recipient": "customer@example.com",
      "subject": "Order Confirmed",
      "content": "<h1>Order Confirmed!</h1><p>Your order has been processed.</p>"
    },
    {
      "channel": "whatsapp",
      "type": "order_confirmation",
      "recipient": "+1234567890",
      "templateId": "order_confirmation",
      "data": {
        "name": "John",
        "orderNumber": "12345",
        "total": "59.99"
      }
    }
  ]
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
} 