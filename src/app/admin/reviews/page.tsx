'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReviewForm from './ReviewForm';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/components/providers/StackAdminAuth';

interface Review {
    id: number;
    customer_name: string;
    customer_image_url: string | null;
    rating: number;
    review_text: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export default function ReviewsManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const router = useRouter();

    // Use the custom auth hook that wraps NextAuth
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        // Fetch reviews when the component mounts and auth is ready
        if (isAuthenticated) {
            fetchReviews();
        }
    }, [isAuthenticated]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/reviews');

            if (response.status === 401) {
                console.log("Authentication error, redirecting to login");
                router.push('/admin/login');
                return;
            }

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setReviews(data.reviews);
            setError(null);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = () => {
        setEditingReview(null);
        setShowForm(true);
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setShowForm(true);
    };

    const handleDeleteReview = async (id: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await fetch(`/api/admin/reviews/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            toast.success('Review deleted successfully');
            fetchReviews();
        } catch (err) {
            console.error('Error deleting review:', err);
            toast.error('Failed to delete review');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingReview(null);
    };

    const handleFormSubmit = async (formData: any) => {
        try {
            const method = editingReview ? 'PUT' : 'POST';
            const url = editingReview
                ? `/api/admin/reviews/${editingReview.id}`
                : '/api/admin/reviews';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            toast.success(`Review ${editingReview ? 'updated' : 'added'} successfully`);
            setShowForm(false);
            setEditingReview(null);
            fetchReviews();
        } catch (err) {
            console.error('Error submitting review:', err);
            toast.error(`Failed to ${editingReview ? 'update' : 'add'} review`);
        }
    };

    const toggleReviewStatus = async (review: Review) => {
        try {
            const response = await fetch(`/api/admin/reviews/${review.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...review,
                    is_active: !review.is_active,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            toast.success(`Review ${review.is_active ? 'deactivated' : 'activated'} successfully`);
            fetchReviews();
        } catch (err) {
            console.error('Error toggling review status:', err);
            toast.error('Failed to update review status');
        }
    };

    return (
        <div className="p-6">
            <Toaster position="top-right" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">Reviews Management</h1>
                <button
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                    onClick={handleAddReview}
                >
                    Add New Review
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-pulse">Loading reviews...</div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No reviews found. Add a new review to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reviews.map((review) => (
                                <tr key={review.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                                {review.customer_image_url ? (
                                                    <img
                                                        src={review.customer_image_url}
                                                        alt={review.customer_name}
                                                        className="h-10 w-10 object-cover"
                                                    />
                                                ) : (
                                                    <svg className="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{review.customer_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-md truncate">{review.review_text}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${review.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {review.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {review.display_order}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            onClick={() => handleEditReview(review)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900 mr-3"
                                            onClick={() => handleDeleteReview(review.id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className={`${review.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                            onClick={() => toggleReviewStatus(review)}
                                        >
                                            {review.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingReview ? 'Edit Review' : 'Add New Review'}
                        </h2>
                        <ReviewForm
                            review={editingReview}
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormClose}
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 