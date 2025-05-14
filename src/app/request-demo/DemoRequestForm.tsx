"use client";

import React, { useState } from 'react';

interface FormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string;
    businessType: string;
    employeeCount: string;
    preferredDate: string;
    preferredTime: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    businessType?: string;
    employeeCount?: string;
    preferredDate?: string;
    preferredTime?: string;
    message?: string;
}

export default function DemoRequestForm() {
    // Form state
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        businessType: '',
        employeeCount: '',
        preferredDate: '',
        preferredTime: '',
        message: ''
    });

    // Form submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Business type options
    const businessTypes = [
        'Restaurant',
        'Cafe',
        'Fast Food',
        'Fine Dining',
        'Food Truck',
        'Bakery',
        'Bar/Pub',
        'Catering Service',
        'Cloud Kitchen',
        'Other'
    ];

    // Employee count options
    const employeeCounts = [
        '1-5 employees',
        '6-10 employees',
        '11-25 employees',
        '26-50 employees',
        '51-100 employees',
        '100+ employees'
    ];

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.company.trim()) {
            newErrors.company = 'Company name is required';
        }

        if (!formData.businessType) {
            newErrors.businessType = 'Please select your business type';
        }

        if (!formData.preferredDate) {
            newErrors.preferredDate = 'Please select a preferred date';
        }

        if (!formData.preferredTime) {
            newErrors.preferredTime = 'Please select a preferred time';
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
            const response = await fetch('/api/demo-request', {
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
                company: '',
                position: '',
                businessType: '',
                employeeCount: '',
                preferredDate: '',
                preferredTime: '',
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

    // Calculate minimum date for the date picker (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Schedule Your Demo</h2>
            <p className="text-darkGray mb-6">Fill out the form below to schedule a personalized demo with our team.</p>

            {submitSuccess && (
                <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 border border-green-200">
                    <h3 className="font-bold text-lg">Demo Request Submitted!</h3>
                    <p>Thank you for your interest in our platform. One of our representatives will contact you shortly to confirm your demo time.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="mb-2 md:col-span-2">
                        <h3 className="text-lg font-medium text-charcoal">Your Information</h3>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-darkGray mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.name ? 'border-red-500' : 'border-lightGray'}`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-darkGray mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.email ? 'border-red-500' : 'border-lightGray'}`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-darkGray mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.phone ? 'border-red-500' : 'border-lightGray'}`}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-darkGray mb-1">
                            Job Title
                        </label>
                        <input
                            type="text"
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            placeholder="Enter your job title"
                            className="w-full px-4 py-2 border border-lightGray rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {/* Business Information */}
                    <div className="mb-2 md:col-span-2 mt-4">
                        <h3 className="text-lg font-medium text-charcoal">Business Information</h3>
                    </div>

                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-darkGray mb-1">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.company ? 'border-red-500' : 'border-lightGray'}`}
                        />
                        {errors.company && (
                            <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="businessType" className="block text-sm font-medium text-darkGray mb-1">
                            Business Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="businessType"
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.businessType ? 'border-red-500' : 'border-lightGray'}`}
                        >
                            <option value="">Select business type</option>
                            {businessTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.businessType && (
                            <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="employeeCount" className="block text-sm font-medium text-darkGray mb-1">
                            Number of Employees
                        </label>
                        <select
                            id="employeeCount"
                            name="employeeCount"
                            value={formData.employeeCount}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-lightGray rounded-lg focus:ring-primary focus:border-primary"
                        >
                            <option value="">Select number of employees</option>
                            {employeeCounts.map(count => (
                                <option key={count} value={count}>{count}</option>
                            ))}
                        </select>
                    </div>

                    {/* Demo Scheduling */}
                    <div className="mb-2 md:col-span-2 mt-4">
                        <h3 className="text-lg font-medium text-charcoal">Schedule Your Demo</h3>
                    </div>

                    <div>
                        <label htmlFor="preferredDate" className="block text-sm font-medium text-darkGray mb-1">
                            Preferred Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="preferredDate"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleChange}
                            min={minDate}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.preferredDate ? 'border-red-500' : 'border-lightGray'}`}
                        />
                        {errors.preferredDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="preferredTime" className="block text-sm font-medium text-darkGray mb-1">
                            Preferred Time <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="preferredTime"
                            name="preferredTime"
                            value={formData.preferredTime}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${errors.preferredTime ? 'border-red-500' : 'border-lightGray'}`}
                        >
                            <option value="">Select preferred time</option>
                            <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                            <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                            <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                            <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                            <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                            <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                            <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                        </select>
                        {errors.preferredTime && (
                            <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="message" className="block text-sm font-medium text-darkGray mb-1">
                            Additional Information
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Tell us about your specific needs or questions you'd like addressed during the demo"
                            className="w-full px-4 py-2 border border-lightGray rounded-lg focus:ring-primary focus:border-primary"
                        ></textarea>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-primary text-white py-3 px-6 rounded-lg font-bold transition-colors ${isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Request Demo'}
                    </button>
                </div>
            </form>
        </div>
    );
} 