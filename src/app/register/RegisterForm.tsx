"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import SEO from '@/components/SEO';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { FormError } from '@/components/ui/alert';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Form sections for multi-step registration
type RegistrationStep =
    | 'company-info'
    | 'contact-details'
    | 'account-setup';

// Define interface for company information
interface CompanyInfo {
    name: string;
    industry: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    businessSize: string;
    numLocations: number;
}

// Define interface for contact details
interface ContactDetails {
    contactName: string;
    jobTitle: string;
    contactEmail: string;
    phoneNumber: string;
}

// Define interface for account credentials
interface AccountCredentials {
    username: string;
    password: string;
    confirmPassword: string;
    enableTwoFactor: boolean;
    securityQuestion: string;
    securityAnswer: string;
}

// Define interface for plan selection
interface PlanSelection {
    plan: string | null;
    billingCycle: string;
    expectedOrderVolume: string;
    numAdminAccounts: number;
    numStaffAccounts: number;
    numKitchenAccounts: number;
}

// Define interface for legal compliance
interface LegalCompliance {
    acceptTerms: boolean;
    acceptPrivacyPolicy: boolean;
    taxId: string;
    businessRegistration: string;
}

export default function RegisterForm() {
    // Current step in the multi-step form
    const [currentStep, setCurrentStep] = useState<RegistrationStep>('company-info');

    // Form data
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
        name: '',
        industry: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        businessSize: '',
        numLocations: 1
    });

    const [contactDetails, setContactDetails] = useState<ContactDetails>({
        contactName: '',
        jobTitle: '',
        contactEmail: '',
        phoneNumber: ''
    });

    const [accountCredentials, setAccountCredentials] = useState<AccountCredentials>({
        username: '',
        password: '',
        confirmPassword: '',
        enableTwoFactor: false,
        securityQuestion: '',
        securityAnswer: ''
    });

    const [planSelection, setPlanSelection] = useState<PlanSelection>({
        plan: null,
        billingCycle: 'monthly',
        expectedOrderVolume: '',
        numAdminAccounts: 1,
        numStaffAccounts: 1,
        numKitchenAccounts: 1
    });

    const [legalCompliance, setLegalCompliance] = useState<LegalCompliance>({
        acceptTerms: false,
        acceptPrivacyPolicy: false,
        taxId: '',
        businessRegistration: ''
    });

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Initialize toast
    const { toast, Toaster } = useToast();

    const router = useRouter();
    const searchParams = useSearchParams();

    // Get plan from URL if it exists
    useEffect(() => {
        const planFromUrl = searchParams.get('plan');
        if (planFromUrl) {
            setPlanSelection(prev => ({ ...prev, plan: planFromUrl }));
        }
    }, [searchParams]);

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            // Prepare registration data
            const registrationData = {
                companyInfo: {
                    name: companyInfo.name,
                    industry: companyInfo.industry,
                    address: companyInfo.address,
                    city: companyInfo.city,
                    state: companyInfo.state,
                    zipCode: companyInfo.zipCode,
                    country: companyInfo.country,
                    businessSize: companyInfo.businessSize,
                    numLocations: companyInfo.numLocations
                },
                contactDetails: {
                    name: contactDetails.contactName,
                    jobTitle: contactDetails.jobTitle,
                    email: contactDetails.contactEmail,
                    phone: contactDetails.phoneNumber
                },
                accountCredentials: {
                    username: accountCredentials.username,
                    password: accountCredentials.password,
                    enableTwoFactor: accountCredentials.enableTwoFactor,
                    securityQuestion: accountCredentials.securityQuestion,
                    securityAnswer: accountCredentials.securityAnswer
                },
                legalCompliance: {
                    acceptTerms: legalCompliance.acceptTerms,
                    acceptPrivacyPolicy: legalCompliance.acceptPrivacyPolicy,
                    taxId: legalCompliance.taxId,
                    businessRegistration: legalCompliance.businessRegistration
                }
            };

            // Submit registration data
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Registration failed');
            }

            // Show success message
            toast({
                title: 'Registration successful!',
                description: 'Your account has been created successfully.',
                type: 'success',
                duration: 5000,
            });

            // Redirect to dashboard or confirmation page
            router.push('/dashboard');

        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register. Please try again.');

            toast({
                title: 'Registration failed',
                description: err.message || 'An error occurred during registration.',
                type: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Simplified render for brevity
    return (
        <main className="min-h-screen bg-dashboard-bg py-8">
            <SEO
                title="Register | Snytra"
                description="Sign up for Snytra and streamline your business operations."
            />
            <Toaster />

            <div className="max-w-6xl mx-auto px-4">
                {/* Header section with improved styling */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-charcoal">Create Your Account</h1>
                    <p className="text-xl text-darkGray max-w-2xl mx-auto">Join Snytra to streamline your business operations and boost your revenue.</p>

                    <div className="flex flex-col md:flex-row justify-center mt-8 space-y-6 md:space-y-0 md:space-x-12">
                        <div className="flex items-center">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-charcoal">Simple Registration</h3>
                                <p className="text-darkGray">Complete a quick 3-step process</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-charcoal">Secure Process</h3>
                                <p className="text-darkGray">Your data is encrypted and protected</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps indicator */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex justify-between items-center">
                        <div className={`flex flex-col items-center ${currentStep === 'company-info' ? 'text-primary' : 'text-darkGray'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'company-info' ? 'bg-primary text-white' : 'bg-beige text-darkGray border border-lightGray'}`}>
                                1
                            </div>
                            <span className="text-sm font-medium">Company Info</span>
                        </div>

                        <div className="flex-1 h-0.5 mx-4 bg-lightGray">
                            <div className={`h-full bg-primary ${currentStep === 'company-info' ? 'w-0' : currentStep === 'contact-details' ? 'w-1/2' : 'w-full'}`}></div>
                        </div>

                        <div className={`flex flex-col items-center ${currentStep === 'contact-details' ? 'text-primary' : currentStep === 'account-setup' ? 'text-primary' : 'text-darkGray'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'contact-details' || currentStep === 'account-setup' ? 'bg-primary text-white' : 'bg-beige text-darkGray border border-lightGray'}`}>
                                2
                            </div>
                            <span className="text-sm font-medium">Contact Details</span>
                        </div>

                        <div className="flex-1 h-0.5 mx-4 bg-lightGray">
                            <div className={`h-full bg-primary ${currentStep === 'account-setup' ? 'w-full' : 'w-0'}`}></div>
                        </div>

                        <div className={`flex flex-col items-center ${currentStep === 'account-setup' ? 'text-primary' : 'text-darkGray'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'account-setup' ? 'bg-primary text-white' : 'bg-beige text-darkGray border border-lightGray'}`}>
                                3
                            </div>
                            <span className="text-sm font-medium">Account Setup</span>
                        </div>
                    </div>
                </div>

                {/* Form with improved styling */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-lightGray">
                        {error && <FormError message={error} className="mb-6" />}

                        {/* Company Information Step */}
                        {currentStep === 'company-info' && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6 text-charcoal">Company Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-darkGray mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={companyInfo.name}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="Your company name"
                                            required
                                        />
                                        {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="industry" className="block text-sm font-medium text-darkGray mb-1">Industry</label>
                                        <select
                                            id="industry"
                                            name="industry"
                                            value={companyInfo.industry}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            required
                                        >
                                            <option value="">Select industry</option>
                                            <option value="restaurant">Restaurant</option>
                                            <option value="cafe">Cafe</option>
                                            <option value="bar">Bar</option>
                                            <option value="food_truck">Food Truck</option>
                                            <option value="bakery">Bakery</option>
                                            <option value="catering">Catering</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {formErrors.industry && <p className="mt-1 text-sm text-red-600">{formErrors.industry}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="businessSize" className="block text-sm font-medium text-darkGray mb-1">Business Size</label>
                                        <select
                                            id="businessSize"
                                            name="businessSize"
                                            value={companyInfo.businessSize}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, businessSize: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            required
                                        >
                                            <option value="">Select size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201+">201+ employees</option>
                                        </select>
                                        {formErrors.businessSize && <p className="mt-1 text-sm text-red-600">{formErrors.businessSize}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="numLocations" className="block text-sm font-medium text-darkGray mb-1">Number of Locations</label>
                                        <input
                                            type="number"
                                            id="numLocations"
                                            name="numLocations"
                                            min="1"
                                            value={companyInfo.numLocations}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, numLocations: parseInt(e.target.value) })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            required
                                        />
                                        {formErrors.numLocations && <p className="mt-1 text-sm text-red-600">{formErrors.numLocations}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-darkGray mb-1">Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={companyInfo.address}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="Street address"
                                            required
                                        />
                                        {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-darkGray mb-1">City</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={companyInfo.city}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="City"
                                            required
                                        />
                                        {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-darkGray mb-1">State/Province</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={companyInfo.state}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, state: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="State/Province"
                                            required
                                        />
                                        {formErrors.state && <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="zipCode" className="block text-sm font-medium text-darkGray mb-1">ZIP/Postal Code</label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            value={companyInfo.zipCode}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, zipCode: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="ZIP/Postal code"
                                            required
                                        />
                                        {formErrors.zipCode && <p className="mt-1 text-sm text-red-600">{formErrors.zipCode}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-darkGray mb-1">Country</label>
                                        <select
                                            id="country"
                                            name="country"
                                            value={companyInfo.country}
                                            onChange={(e) => setCompanyInfo({ ...companyInfo, country: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            required
                                        >
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {formErrors.country && <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>}
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('contact-details')}
                                        className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        Next: Contact Details
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Contact Details Step */}
                        {currentStep === 'contact-details' && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6 text-charcoal">Contact Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="contactName" className="block text-sm font-medium text-darkGray mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            id="contactName"
                                            name="contactName"
                                            value={contactDetails.contactName}
                                            onChange={(e) => setContactDetails({ ...contactDetails, contactName: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="Your full name"
                                            required
                                        />
                                        {formErrors.contactName && <p className="mt-1 text-sm text-red-600">{formErrors.contactName}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="jobTitle" className="block text-sm font-medium text-darkGray mb-1">Job Title</label>
                                        <input
                                            type="text"
                                            id="jobTitle"
                                            name="jobTitle"
                                            value={contactDetails.jobTitle}
                                            onChange={(e) => setContactDetails({ ...contactDetails, jobTitle: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="Your job title"
                                            required
                                        />
                                        {formErrors.jobTitle && <p className="mt-1 text-sm text-red-600">{formErrors.jobTitle}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="contactEmail" className="block text-sm font-medium text-darkGray mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            id="contactEmail"
                                            name="contactEmail"
                                            value={contactDetails.contactEmail}
                                            onChange={(e) => setContactDetails({ ...contactDetails, contactEmail: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                        {formErrors.contactEmail && <p className="mt-1 text-sm text-red-600">{formErrors.contactEmail}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-darkGray mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={contactDetails.phoneNumber}
                                            onChange={(e) => setContactDetails({ ...contactDetails, phoneNumber: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="(123) 456-7890"
                                            required
                                        />
                                        {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>}
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('company-info')}
                                        className="bg-white border border-lightGray hover:bg-beige text-charcoal font-medium py-3 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        Back: Company Info
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('account-setup')}
                                        className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        Next: Account Setup
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Account Setup Step */}
                        {currentStep === 'account-setup' && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6 text-charcoal">Account Setup</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-darkGray mb-1">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={accountCredentials.username}
                                            onChange={(e) => setAccountCredentials({ ...accountCredentials, username: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="Choose a username"
                                            required
                                        />
                                        {formErrors.username && <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>}
                                    </div>

                                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-darkGray mb-1">Password</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={accountCredentials.password}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, password: e.target.value })}
                                                className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Create a strong password"
                                                required
                                            />
                                            {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-darkGray mb-1">Confirm Password</label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={accountCredentials.confirmPassword}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, confirmPassword: e.target.value })}
                                                className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Confirm your password"
                                                required
                                            />
                                            {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>}
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="enableTwoFactor"
                                                name="enableTwoFactor"
                                                checked={accountCredentials.enableTwoFactor}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, enableTwoFactor: e.target.checked })}
                                                className="h-5 w-5 text-primary focus:ring-primary border-lightGray rounded"
                                            />
                                            <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-darkGray">
                                                Enable Two-Factor Authentication (Recommended)
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="securityQuestion" className="block text-sm font-medium text-darkGray mb-1">Security Question</label>
                                        <select
                                            id="securityQuestion"
                                            name="securityQuestion"
                                            value={accountCredentials.securityQuestion}
                                            onChange={(e) => setAccountCredentials({ ...accountCredentials, securityQuestion: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            required
                                        >
                                            <option value="">Select a security question</option>
                                            <option value="pet">What was your first pet's name?</option>
                                            <option value="school">What was the name of your first school?</option>
                                            <option value="city">In what city were you born?</option>
                                            <option value="mother">What is your mother's maiden name?</option>
                                            <option value="food">What is your favorite food?</option>
                                        </select>
                                        {formErrors.securityQuestion && <p className="mt-1 text-sm text-red-600">{formErrors.securityQuestion}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="securityAnswer" className="block text-sm font-medium text-darkGray mb-1">Security Answer</label>
                                        <input
                                            type="text"
                                            id="securityAnswer"
                                            name="securityAnswer"
                                            value={accountCredentials.securityAnswer}
                                            onChange={(e) => setAccountCredentials({ ...accountCredentials, securityAnswer: e.target.value })}
                                            className="w-full p-3 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="Your answer"
                                            required
                                        />
                                        {formErrors.securityAnswer && <p className="mt-1 text-sm text-red-600">{formErrors.securityAnswer}</p>}
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="acceptTerms"
                                                name="acceptTerms"
                                                checked={legalCompliance.acceptTerms}
                                                onChange={(e) => setLegalCompliance({ ...legalCompliance, acceptTerms: e.target.checked })}
                                                className="h-5 w-5 text-primary focus:ring-primary border-lightGray rounded"
                                                required
                                            />
                                            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-darkGray">
                                                I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                                            </label>
                                        </div>
                                        {formErrors.acceptTerms && <p className="mt-1 text-sm text-red-600">{formErrors.acceptTerms}</p>}
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep('contact-details')}
                                        className="bg-white border border-lightGray hover:bg-beige text-charcoal font-medium py-3 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        Back: Contact Details
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading || !legalCompliance.acceptTerms}
                                        className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Already have an account link */}
                    <div className="text-center mt-6">
                        <p className="text-darkGray">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
} 