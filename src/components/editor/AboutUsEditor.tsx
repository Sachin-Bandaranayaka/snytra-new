'use client';

import { useState, useEffect } from 'react';

// --- Fully Typed Interfaces for your JSON structure ---
interface Principle {
    title: string;
    description: string;
}
interface Feature {
    title: string;
    description: string;
    svgPathD?: string; // Changed from 'svgCode' to 'svgPathD'
}
interface CallToAction {
    title: string;
    description: string;
    link: {
        text: string;
        href: string;
        attributes: {
            target: string;
            rel: string;
            class: string;
        };
    };
}
interface AboutUsData {
    title: string;
    description: string;
    vision: {
        title: string;
        description: string;
        principles: Principle[];
    };
    mission: {
        title: string;
        description: string;
    };
    whyChooseUs: {
        title: string;
        description?: string; // Added optional description to whyChooseUs
        features: Feature[];
    };
    callToAction: CallToAction;
}
interface AboutUsEditorProps {
    initialContent: Partial<AboutUsData>;
    onChange: (newContent: Partial<AboutUsData>) => void;
}

export default function AboutUsEditor({ initialContent, onChange }: AboutUsEditorProps) {
    const [content, setContent] = useState<Partial<AboutUsData>>(initialContent);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const handleUpdate = (newContent: Partial<AboutUsData>) => {
        setContent(newContent);
        onChange(newContent);
    };

    // Generic handler for deeply nested text fields
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
    
    // Handler for arrays of objects
    const handleArrayChange = (arrayPath: string[], index: number, field: string, value: string) => {
        const newContent = JSON.parse(JSON.stringify(content)); // Deep copy
        let currentArray: any[] = arrayPath.reduce((acc, key) => acc[key], newContent);
        currentArray[index][field] = value;
        handleUpdate(newContent);
    };

    const addArrayItem = (arrayPath: string[], newItem: object) => {
        const newContent = JSON.parse(JSON.stringify(content)); // Deep copy
        let current = newContent;
        for (let i = 0; i < arrayPath.length - 1; i++) {
            current = current[arrayPath[i]];
        }
        if (!current[arrayPath[arrayPath.length - 1]]) {
            current[arrayPath[arrayPath.length - 1]] = [];
        }
        current[arrayPath[arrayPath.length - 1]].push(newItem);
        handleUpdate(newContent);
    };

    const removeArrayItem = (arrayPath: string[], index: number) => {
        const newContent = JSON.parse(JSON.stringify(content)); // Deep copy
        let currentArray: any[] = arrayPath.reduce((acc, key) => acc[key], newContent);
        currentArray.splice(index, 1);
        handleUpdate(newContent);
    };

    return (
        <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {/* General Info */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">General</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input type="text" value={content.title || ''} onChange={(e) => handleNestedChange(['title'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Page Description</label>
                <textarea value={content.description || ''} onChange={(e) => handleNestedChange(['description'], e.target.value)} rows={2} className="block w-full border border-gray-300 rounded-md p-2" />
            </div>

            {/* Vision Section */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Vision Section</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vision Title</label>
                <input type="text" value={content.vision?.title || ''} onChange={(e) => handleNestedChange(['vision', 'title'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Vision Description</label>
                <textarea value={content.vision?.description || ''} onChange={(e) => handleNestedChange(['vision', 'description'], e.target.value)} rows={3} className="block w-full border border-gray-300 rounded-md p-2" />

                <h4 className="text-md font-semibold mt-4 mb-2">Principles</h4>
                {content.vision?.principles?.map((principle, index) => (
                    <div key={index} className="border p-3 rounded-md mb-2 bg-gray-50 relative">
                        <input placeholder="Principle Title" value={principle.title} onChange={(e) => handleArrayChange(['vision', 'principles'], index, 'title', e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 mb-2"/>
                        <textarea placeholder="Principle Description" value={principle.description} onChange={(e) => handleArrayChange(['vision', 'principles'], index, 'description', e.target.value)} className="block w-full border border-gray-300 rounded-md p-2"/>
                        <button type="button" onClick={() => removeArrayItem(['vision', 'principles'], index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addArrayItem(['vision', 'principles'], { title: '', description: ''})} className="text-sm text-blue-600 hover:text-blue-800 mt-2">Add Principle</button>
            </div>

            {/* Mission Section - THIS IS THE NEWLY ADDED SECTION */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Mission Section</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission Title</label>
                <input type="text" value={content.mission?.title || ''} onChange={(e) => handleNestedChange(['mission', 'title'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Mission Description</label>
                <textarea value={content.mission?.description || ''} onChange={(e) => handleNestedChange(['mission', 'description'], e.target.value)} rows={3} className="block w-full border border-gray-300 rounded-md p-2" />
            </div>

            {/* Why Choose Us Section */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Why Choose Us Section</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input type="text" value={content.whyChooseUs?.title || ''} onChange={(e) => handleNestedChange(['whyChooseUs', 'title'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Section Description (Optional)</label>
                <textarea value={content.whyChooseUs?.description || ''} onChange={(e) => handleNestedChange(['whyChooseUs', 'description'], e.target.value)} rows={2} className="block w-full border border-gray-300 rounded-md p-2" />
                
                <h4 className="text-md font-semibold mt-4 mb-2">Features</h4>
                {content.whyChooseUs?.features?.map((feature, index) => (
                    <div key={index} className="border p-3 rounded-md mb-2 bg-gray-50 relative">
                        <input placeholder="Feature Title" value={feature.title} onChange={(e) => handleArrayChange(['whyChooseUs', 'features'], index, 'title', e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 mb-2"/>
                        <textarea placeholder="Feature Description" value={feature.description} onChange={(e) => handleArrayChange(['whyChooseUs', 'features'], index, 'description', e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 mb-2"/>
                        {/* Input for SVG Path Data (d attribute) */}
                        <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">SVG Path Data (d attribute)</label>
                        <input 
                            type="text"
                            placeholder="M13 10V3L4 14h7v7l9-11h-7z" 
                            value={feature.svgPathD || ''} 
                            onChange={(e) => handleArrayChange(['whyChooseUs', 'features'], index, 'svgPathD', e.target.value)} 
                            className="block w-full border border-gray-300 rounded-md p-2 font-mono text-xs"
                        />
                        <button type="button" onClick={() => removeArrayItem(['whyChooseUs', 'features'], index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addArrayItem(['whyChooseUs', 'features'], { title: '', description: '', svgPathD: '' })} className="text-sm text-blue-600 hover:text-blue-800 mt-2">Add Feature</button>
            </div>

            {/* Call To Action Section */}
            <div className="p-4 bg-white rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Call To Action Section</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Title</label>
                <input type="text" value={content.callToAction?.title || ''} onChange={(e) => handleNestedChange(['callToAction', 'title'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">CTA Description</label>
                <textarea value={content.callToAction?.description || ''} onChange={(e) => handleNestedChange(['callToAction', 'description'], e.target.value)} rows={2} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Button Text</label>
                <input type="text" value={content.callToAction?.link?.text || ''} onChange={(e) => handleNestedChange(['callToAction', 'link', 'text'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Button Link (URL)</label>
                <input type="text" value={content.callToAction?.link?.href || ''} onChange={(e) => handleNestedChange(['callToAction', 'link', 'href'], e.target.value)} className="block w-full border border-gray-300 rounded-md p-2" />
            </div>
        </div>
    );
}
