// src/components/editor/AiCallingEditor.tsx
'use client';

import { useState, useEffect } from 'react';

// Interfaces for the AI Calling JSON structure
interface Link { text: string; href: string; }
interface FeatureItem { title: string; description: string; }
interface AiCallingData {
    title: string;
    description: string;
    links: Link[];
    features: {
        title: string;
        items: FeatureItem[];
    };
}
interface AiCallingEditorProps {
    initialContent: Partial<AiCallingData>;
    onChange: (newContent: Partial<AiCallingData>) => void;
}

export default function AiCallingEditor({ initialContent, onChange }: AiCallingEditorProps) {
    const [content, setContent] = useState<Partial<AiCallingData>>(initialContent);

    useEffect(() => { setContent(initialContent); }, [initialContent]);

    const handleUpdate = (newContent: Partial<AiCallingData>) => {
        setContent(newContent);
        onChange(newContent);
    };

    const handleNestedChange = (path: string[], value: string) => {
        const newContent = JSON.parse(JSON.stringify(content));
        let current: any = newContent;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]] = { ...current[path[i]] };
        }
        current[path[path.length - 1]] = value;
        handleUpdate(newContent);
    };

    const handleArrayChange = (arrayPath: string[], index: number, field: string, value: string) => {
        const newContent = JSON.parse(JSON.stringify(content));
        let currentArray: any[] = arrayPath.reduce((acc, key) => acc[key], newContent);
        currentArray[index][field] = value;
        handleUpdate(newContent);
    };

    const addArrayItem = (arrayPath: string[], newItem: object) => {
        const newContent = JSON.parse(JSON.stringify(content));
        let current: any = newContent;
        for (let i = 0; i < arrayPath.length - 1; i++) { current = current[arrayPath[i]]; }
        if (!current[arrayPath[arrayPath.length - 1]]) { current[arrayPath[arrayPath.length - 1]] = []; }
        current[arrayPath[arrayPath.length - 1]].push(newItem);
        handleUpdate(newContent);
    };

    const removeArrayItem = (arrayPath: string[], index: number) => {
        const newContent = JSON.parse(JSON.stringify(content));
        let currentArray: any[] = arrayPath.reduce((acc, key) => acc[key], newContent);
        currentArray.splice(index, 1);
        handleUpdate(newContent);
    };

    return (
        <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {/* Hero Section */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Hero Section</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={content.title || ''} onChange={(e) => handleNestedChange(['title'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Description</label>
                <textarea value={content.description || ''} onChange={(e) => handleNestedChange(['description'], e.target.value)} rows={2} className="block w-full border border-gray-300 rounded-md p-2" />

                <h4 className="text-md font-semibold mt-4 mb-2">Links</h4>
                {content.links?.map((link, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 border p-3 rounded-md mb-2 bg-gray-50 relative">
                        <input placeholder="Link Text" value={link.text} onChange={(e) => handleArrayChange(['links'], index, 'text', e.target.value)} className="block w-full border border-gray-300 rounded-md p-2"/>
                        <input placeholder="Link URL (href)" value={link.href} onChange={(e) => handleArrayChange(['links'], index, 'href', e.target.value)} className="block w-full border border-gray-300 rounded-md p-2"/>
                        <button type="button" onClick={() => removeArrayItem(['links'], index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addArrayItem(['links'], { text: '', href: ''})} className="text-sm text-blue-600 hover:text-blue-800 mt-2">Add Link</button>
            </div>
            {/* Features Section */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Features Section</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input type="text" value={content.features?.title || ''} onChange={(e) => handleNestedChange(['features', 'title'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />

                <h4 className="text-md font-semibold mt-4 mb-2">Feature Items</h4>
                {content.features?.items?.map((item, index) => (
                    <div key={index} className="border p-3 rounded-md mb-2 bg-gray-50 relative">
                        <input placeholder="Feature Title" value={item.title} onChange={(e) => handleArrayChange(['features', 'items'], index, 'title', e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 mb-2"/>
                        <textarea placeholder="Feature Description" value={item.description} onChange={(e) => handleArrayChange(['features', 'items'], index, 'description', e.target.value)} className="block w-full border border-gray-300 rounded-md p-2"/>
                        <button type="button" onClick={() => removeArrayItem(['features', 'items'], index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addArrayItem(['features', 'items'], { title: '', description: ''})} className="text-sm text-blue-600 hover:text-blue-800 mt-2">Add Feature Item</button>
            </div>
        </div>
    );
}