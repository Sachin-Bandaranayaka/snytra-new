// src/components/editor/ContactUsEditor.tsx

'use client';

import { useState, useEffect } from 'react';

// --- Interfaces for your Contact Us JSON structure ---
interface ContactUsData {
    title: string;
    description: string;
    contactInfo: {
        phone: string;
        email: string;
    };
}

interface ContactUsEditorProps {
    initialContent: Partial<ContactUsData>;
    onChange: (newContent: Partial<ContactUsData>) => void;
}

export default function ContactUsEditor({ initialContent, onChange }: ContactUsEditorProps) {
    const [content, setContent] = useState<Partial<ContactUsData>>(initialContent);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const handleUpdate = (newContent: Partial<ContactUsData>) => {
        setContent(newContent);
        onChange(newContent);
    };

    // Generic handler for nested text fields
    const handleNestedChange = (path: string[], value: string) => {
        const newContent = JSON.parse(JSON.stringify(content)); // Deep copy
        let current: any = newContent;
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            // Ensure path exists
            if (current[key] === undefined) {
                current[key] = {};
            }
            current = current[key];
        }
        current[path[path.length - 1]] = value;
        handleUpdate(newContent);
    };

    return (
        <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {/* General Info */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Contact Page Content</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input type="text" value={content.title || ''} onChange={(e) => handleNestedChange(['title'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Page Description</label>
                <textarea value={content.description || ''} onChange={(e) => handleNestedChange(['description'], e.target.value)} rows={2} className="block w-full border border-gray-300 rounded-md p-2" />
            </div>

            {/* Contact Info Section */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" value={content.contactInfo?.phone || ''} onChange={(e) => handleNestedChange(['contactInfo', 'phone'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Email Address</label>
                <input type="email" value={content.contactInfo?.email || ''} onChange={(e) => handleNestedChange(['contactInfo', 'email'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
            </div>
        </div>
    );
}