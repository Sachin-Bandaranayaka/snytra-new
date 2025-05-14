'use client';

import { useState, useEffect, ChangeEvent } from 'react';

interface Review {
    id: number;
    customer_name: string;
    customer_image_url: string | null;
    rating: number;
    review_text: string;
    is_active: boolean;
    display_order: number;
}

interface ReviewFormProps {
    review: Review | null;
    onSubmit: (formData: Omit<Review, 'id'>) => void;
    onCancel: () => void;
}

export default function ReviewForm({ review, onSubmit, onCancel }: ReviewFormProps) {
    const [formData, setFormData] = useState<any>({
        customer_name: '',
        customer_image_url: '',
        rating: 5,
        review_text: '',
        is_active: true,
        display_order: 0,
    });

    const [errors, setErrors] = useState<{
        customer_name?: string;
        rating?: string;
        review_text?: string;
    }>({});

    useEffect(() => {
        if (review) {
            setFormData({
                customer_name: review.customer_name,
                customer_image_url: review.customer_image_url || '',
                rating: review.rating,
                review_text: review.review_text,
                is_active: review.is_active,
                display_order: review.display_order,
            });
        }
    }, [review]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else if (name === 'rating' || name === 'display_order') {
            setFormData({ ...formData, [name]: parseInt(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error when field is being edited
        if (errors[name as keyof typeof errors]) {
            setErrors({ ...errors, [name]: undefined });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const newErrors: any = {};
        if (!formData.customer_name.trim()) {
            newErrors.customer_name = 'Customer name is required';
        }
        if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
            newErrors.rating = 'Rating must be between 1 and 5';
        }
        if (!formData.review_text.trim()) {
            newErrors.review_text = 'Review text is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name *
                    </label>
                    <input
                        type="text"
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        className={`w-full border rounded-md px-3 py-2 ${errors.customer_name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter customer name"
                    />
                    {errors.customer_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="customer_image_url" className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Image URL (Optional)
                    </label>
                    <input
                        type="text"
                        id="customer_image_url"
                        name="customer_image_url"
                        value={formData.customer_image_url}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter image URL"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                        Rating *
                    </label>
                    <select
                        id="rating"
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        className={`w-full border rounded-md px-3 py-2 ${errors.rating ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value={1}>1 Star</option>
                        <option value={2}>2 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={5}>5 Stars</option>
                    </select>
                    {errors.rating && (
                        <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                    </label>
                    <input
                        type="number"
                        id="display_order"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-1">
                    Review Text *
                </label>
                <textarea
                    id="review_text"
                    name="review_text"
                    value={formData.review_text}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full border rounded-md px-3 py-2 ${errors.review_text ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter review text"
                ></textarea>
                {errors.review_text && (
                    <p className="text-red-500 text-xs mt-1">{errors.review_text}</p>
                )}
            </div>

            <div className="mb-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                        Active (display on website)
                    </label>
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                    {review ? 'Update Review' : 'Add Review'}
                </button>
            </div>
        </form>
    );
} 