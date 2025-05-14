"use client";

import React, { useState } from 'react';

interface FormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
}

export default function ContactForm() {
    // Form state
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    // Form submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field-specific error when user types
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Basic validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 5) {
            newErrors.message = 'Message is too short';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset submission states
        setSubmitSuccess(false);
        setSubmitError(null);

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong. Please try again.');
            }

            // Success! Clear form and show success message
            setFormData({
                name: '',
                email: '',
                phone: '',
                message: ''
            });
            setSubmitSuccess(true);

        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-darkGray mb-6">You can reach us anytime</p>

            {submitSuccess && (
                <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 border border-green-200">
                    <h3 className="font-bold text-lg">Thank You!</h3>
                    <p>Your message has been sent successfully. We'll get back to you shortly.</p>
                    <p className="mt-2 text-sm">A confirmation email has been sent to your email address.</p>
                </div>
            )}

            {submitError && (
                <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 border border-red-200">
                    <h3 className="font-bold">Something went wrong</h3>
                    <p>{submitError}</p>
                    <p className="mt-2 text-sm">Please try again or contact us directly.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className={submitSuccess ? 'hidden' : ''}>
                <div className="mb-6">
                    <label htmlFor="name" className="block text-sm font-medium text-darkGray mb-1">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.name ? 'border-red-500' : 'border-lightGray'
                            }`}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-darkGray mb-1">
                        E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your e-mail"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.email ? 'border-red-500' : 'border-lightGray'
                            }`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-darkGray mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.phone ? 'border-red-500' : 'border-lightGray'
                            }`}
                    />
                    {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-darkGray mb-1">
                        Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter your message"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.message ? 'border-red-500' : 'border-lightGray'
                            }`}
                    ></textarea>
                    {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-primary text-white py-3 px-6 rounded-lg font-bold transition-colors ${isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'hover:bg-primary/90'
                        }`}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
} 