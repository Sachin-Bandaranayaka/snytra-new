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
        <main className="min-h-screen bg-gray-50 py-8">
            <SEO
                title="Register | Snytra"
                description="Sign up for Snytra and streamline your business operations."
            />

            <div className="max-w-6xl mx-auto px-4">
                {/* Header section */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Your Account</h1>
                    <p className="text-xl text-gray-600">Join Snytra to streamline your business operations and boost your business.</p>

                    <div className="flex justify-center mt-8 space-x-12">
                        <div className="flex items-center">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Simple Registration</h3>
                                <p className="text-gray-500">Complete a quick 3-step process</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Secure Platform</h3>
                                <p className="text-gray-500">Enterprise-grade security</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration form */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    {/* Progress steps */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'company-info' || currentStep === 'contact-details' ||
                                    currentStep === 'account-setup'
                                    ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    1
                                </div>
                                <span className="text-sm font-medium">Company</span>
                            </div>

                            <div className="w-full mx-2 h-1 bg-gray-200 hidden sm:block">
                                <div className={`h-full ${currentStep === 'contact-details' || currentStep === 'account-setup'
                                    ? 'bg-primary' : 'bg-gray-200'
                                    }`}></div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'contact-details' || currentStep === 'account-setup'
                                    ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    2
                                </div>
                                <span className="text-sm font-medium">Contact</span>
                            </div>

                            <div className="w-full mx-2 h-1 bg-gray-200 hidden sm:block">
                                <div className={`h-full ${currentStep === 'account-setup' ? 'bg-primary' : 'bg-gray-200'
                                    }`}></div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'account-setup' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    3
                                </div>
                                <span className="text-sm font-medium">Account</span>
                            </div>
                        </div>
                    </div>

                    {/* Form error display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="flex items-center text-red-700 text-sm font-medium">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="mb-6 flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-blue-700 font-medium">Processing your registration...</span>
                        </div>
                    )}

                    {/* Form content */}
                    <div className="bg-white rounded-lg border border-gray-100 p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {currentStep === 'company-info' && 'Company Information'}
                            {currentStep === 'contact-details' && 'Contact Details'}
                            {currentStep === 'account-setup' && 'Account Setup'}
                        </h2>

                        {currentStep === 'company-info' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Name*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="companyName"
                                                name="companyName"
                                                value={companyInfo.name}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Your company name"
                                                required
                                            />
                                        </div>
                                        {formErrors.companyName && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.companyName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                                            Industry*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <select
                                                id="industry"
                                                name="industry"
                                                value={companyInfo.industry}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                                required
                                            >
                                                <option value="">Select Industry</option>

                                                {/* Restaurant category */}
                                                <optgroup label="Restaurant">
                                                    <option value="fine-dining">Fine Dining</option>
                                                    <option value="casual-dining">Casual Dining</option>
                                                    <option value="fast-casual">Fast Casual</option>
                                                    <option value="fast-food">Fast Food</option>
                                                    <option value="buffet">Buffet</option>
                                                    <option value="food-truck">Food Truck</option>
                                                    <option value="pizzeria">Pizzeria</option>
                                                    <option value="steak-house">Steak House</option>
                                                    <option value="seafood">Seafood Restaurant</option>
                                                    <option value="barbecue">Barbecue Restaurant</option>
                                                </optgroup>

                                                {/* Cafe category */}
                                                <optgroup label="Cafe">
                                                    <option value="coffee-shop">Coffee Shop</option>
                                                    <option value="dessert-cafe">Dessert Cafe</option>
                                                    <option value="bistro">Bistro</option>
                                                    <option value="tea-house">Tea House</option>
                                                    <option value="internet-cafe">Internet Cafe</option>
                                                </optgroup>

                                                {/* Bakery category */}
                                                <optgroup label="Bakery">
                                                    <option value="bakery-retail">Retail Bakery</option>
                                                    <option value="patisserie">Patisserie</option>
                                                    <option value="artisan-bakery">Artisan Bakery</option>
                                                    <option value="bread-bakery">Bread Bakery</option>
                                                    <option value="pastry-shop">Pastry Shop</option>
                                                    <option value="cake-shop">Cake Shop</option>
                                                </optgroup>

                                                {/* Bar & Nightlife category */}
                                                <optgroup label="Bar & Nightlife">
                                                    <option value="bar">Bar</option>
                                                    <option value="pub">Pub</option>
                                                    <option value="nightclub">Nightclub</option>
                                                    <option value="sports-bar">Sports Bar</option>
                                                    <option value="cocktail-lounge">Cocktail Lounge</option>
                                                    <option value="wine-bar">Wine Bar</option>
                                                    <option value="brewery">Brewery</option>
                                                </optgroup>

                                                {/* Retail category */}
                                                <optgroup label="Retail">
                                                    <option value="grocery">Grocery Store</option>
                                                    <option value="supermarket">Supermarket</option>
                                                    <option value="convenience-store">Convenience Store</option>
                                                    <option value="specialty-food">Specialty Food Store</option>
                                                    <option value="butcher-shop">Butcher Shop</option>
                                                    <option value="deli">Delicatessen</option>
                                                    <option value="liquor-store">Liquor Store</option>
                                                </optgroup>

                                                {/* Hospitality category */}
                                                <optgroup label="Hospitality">
                                                    <option value="hotel">Hotel</option>
                                                    <option value="resort">Resort</option>
                                                    <option value="motel">Motel</option>
                                                    <option value="inn">Inn/B&B</option>
                                                    <option value="hostel">Hostel</option>
                                                    <option value="vacation-rental">Vacation Rental</option>
                                                </optgroup>

                                                {/* Catering & Events category */}
                                                <optgroup label="Catering & Events">
                                                    <option value="catering-service">Catering Service</option>
                                                    <option value="event-venue">Event Venue</option>
                                                    <option value="wedding-venue">Wedding Venue</option>
                                                    <option value="banquet-hall">Banquet Hall</option>
                                                </optgroup>

                                                {/* Other category */}
                                                <optgroup label="Other">
                                                    <option value="ghost-kitchen">Ghost Kitchen</option>
                                                    <option value="meal-prep-service">Meal Prep Service</option>
                                                    <option value="food-delivery">Food Delivery Service</option>
                                                    <option value="meal-kit-service">Meal Kit Service</option>
                                                    <option value="other">Other Food & Beverage</option>
                                                </optgroup>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {formErrors.industry && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.industry}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="businessSize" className="block text-sm font-medium text-gray-700 mb-1">
                                            Business Size*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <select
                                                id="businessSize"
                                                name="businessSize"
                                                value={companyInfo.businessSize}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, businessSize: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                                required
                                            >
                                                <option value="">Select Size</option>
                                                <option value="small">Small (1-10 employees)</option>
                                                <option value="medium">Medium (11-50 employees)</option>
                                                <option value="large">Large (51+ employees)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {formErrors.businessSize && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.businessSize}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="numLocations" className="block text-sm font-medium text-gray-700 mb-1">
                                            Number of Locations*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="number"
                                                id="numLocations"
                                                name="numLocations"
                                                min="1"
                                                value={companyInfo.numLocations}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, numLocations: parseInt(e.target.value) })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                required
                                            />
                                        </div>
                                        {formErrors.numLocations && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.numLocations}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                            Country*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                                </svg>
                                            </div>
                                            <select
                                                id="country"
                                                name="country"
                                                value={companyInfo.country}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, country: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                                required
                                            >
                                                <option value="United States">United States</option>
                                                <option value="Canada">Canada</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Australia">Australia</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {formErrors.country && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                value={companyInfo.address}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="123 Business Street"
                                                required
                                            />
                                        </div>
                                        {formErrors.address && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                            City*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={companyInfo.city}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Your city"
                                                required
                                            />
                                        </div>
                                        {formErrors.city && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                                State/Province*
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    id="state"
                                                    name="state"
                                                    value={companyInfo.state}
                                                    onChange={(e) => setCompanyInfo({ ...companyInfo, state: e.target.value })}
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                    placeholder="Your state/province"
                                                    required
                                                />
                                            </div>
                                            {formErrors.state && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                                                ZIP/Postal Code*
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    id="zipCode"
                                                    name="zipCode"
                                                    value={companyInfo.zipCode}
                                                    onChange={(e) => setCompanyInfo({ ...companyInfo, zipCode: e.target.value })}
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                    placeholder="ZIP/Postal code"
                                                    required
                                                />
                                            </div>
                                            {formErrors.zipCode && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.zipCode}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 'contact-details' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="contactName"
                                                name="contactName"
                                                value={contactDetails.contactName}
                                                onChange={(e) => setContactDetails({ ...contactDetails, contactName: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                        {formErrors.contactName && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.contactName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                            Job Title*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="jobTitle"
                                                name="jobTitle"
                                                value={contactDetails.jobTitle}
                                                onChange={(e) => setContactDetails({ ...contactDetails, jobTitle: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Your job title"
                                                required
                                            />
                                        </div>
                                        {formErrors.jobTitle && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.jobTitle}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="email"
                                                id="contactEmail"
                                                name="contactEmail"
                                                value={contactDetails.contactEmail}
                                                onChange={(e) => setContactDetails({ ...contactDetails, contactEmail: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Your email address"
                                                required
                                            />
                                        </div>
                                        {formErrors.contactEmail && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.contactEmail}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="tel"
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={contactDetails.phoneNumber}
                                                onChange={(e) => setContactDetails({ ...contactDetails, phoneNumber: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Your phone number"
                                                required
                                            />
                                        </div>
                                        {formErrors.phoneNumber && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 'account-setup' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                            Username*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={accountCredentials.username}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, username: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Choose a username"
                                                required
                                            />
                                        </div>
                                        {formErrors.username && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={accountCredentials.password}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, password: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Create a strong password"
                                                required
                                            />
                                        </div>
                                        {formErrors.password && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password*
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={accountCredentials.confirmPassword}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, confirmPassword: e.target.value })}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Confirm your password"
                                                required
                                            />
                                        </div>
                                        {formErrors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label htmlFor="enableTwoFactor" className="block text-sm font-medium text-gray-700">
                                                Two-Factor Authentication
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="enableTwoFactor"
                                                name="enableTwoFactor"
                                                checked={accountCredentials.enableTwoFactor}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, enableTwoFactor: e.target.checked })}
                                                className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-600">
                                                Enable two-factor authentication for added security
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Security Questions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="securityQuestion" className="block text-sm font-medium text-gray-700 mb-1">
                                                Security Question
                                            </label>
                                            <select
                                                id="securityQuestion"
                                                name="securityQuestion"
                                                value={accountCredentials.securityQuestion}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, securityQuestion: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                            >
                                                <option value="">Select a security question</option>
                                                <option value="What was your first pet's name?">What was your first pet's name?</option>
                                                <option value="What was the name of your first school?">What was the name of your first school?</option>
                                                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                                                <option value="What was the make of your first car?">What was the make of your first car?</option>
                                                <option value="What is your favorite book?">What is your favorite book?</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                                                Security Answer
                                            </label>
                                            <input
                                                type="text"
                                                id="securityAnswer"
                                                name="securityAnswer"
                                                value={accountCredentials.securityAnswer}
                                                onChange={(e) => setAccountCredentials({ ...accountCredentials, securityAnswer: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Your answer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Legal & Compliance</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="acceptTerms"
                                                    name="acceptTerms"
                                                    checked={legalCompliance.acceptTerms}
                                                    onChange={(e) => setLegalCompliance({ ...legalCompliance, acceptTerms: e.target.checked })}
                                                    className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                                                    required
                                                />
                                                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-600">
                                                    I accept the <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link>*
                                                </label>
                                            </div>
                                            {formErrors.acceptTerms && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.acceptTerms}</p>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="acceptPrivacyPolicy"
                                                    name="acceptPrivacyPolicy"
                                                    checked={legalCompliance.acceptPrivacyPolicy}
                                                    onChange={(e) => setLegalCompliance({ ...legalCompliance, acceptPrivacyPolicy: e.target.checked })}
                                                    className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                                                    required
                                                />
                                                <label htmlFor="acceptPrivacyPolicy" className="ml-2 block text-sm text-gray-600">
                                                    I accept the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>*
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tax ID / VAT Number
                                                </label>
                                                <input
                                                    type="text"
                                                    id="taxId"
                                                    name="taxId"
                                                    value={legalCompliance.taxId}
                                                    onChange={(e) => setLegalCompliance({ ...legalCompliance, taxId: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                    placeholder="Enter your tax ID"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="businessRegistration" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Business Registration Number
                                                </label>
                                                <input
                                                    type="text"
                                                    id="businessRegistration"
                                                    name="businessRegistration"
                                                    value={legalCompliance.businessRegistration}
                                                    onChange={(e) => setLegalCompliance({ ...legalCompliance, businessRegistration: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                    placeholder="Enter your business registration"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer with navigation buttons */}
                    <div className="mt-8 flex justify-between">
                        <button
                            type="button"
                            disabled={currentStep === 'company-info'}
                            onClick={() => {
                                if (currentStep === 'contact-details') setCurrentStep('company-info');
                                if (currentStep === 'account-setup') setCurrentStep('contact-details');
                            }}
                            className={`flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 ${currentStep === 'company-info' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                                }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (currentStep === 'company-info') {
                                    // Validate company info
                                    const errors: Record<string, string> = {};
                                    if (!companyInfo.name) errors.companyName = 'Company name is required';
                                    if (!companyInfo.industry) errors.industry = 'Industry is required';
                                    if (!companyInfo.businessSize) errors.businessSize = 'Business size is required';
                                    if (!companyInfo.address) errors.address = 'Address is required';
                                    if (!companyInfo.city) errors.city = 'City is required';
                                    if (!companyInfo.state) errors.state = 'State/Province is required';
                                    if (!companyInfo.zipCode) errors.zipCode = 'ZIP/Postal code is required';

                                    if (Object.keys(errors).length > 0) {
                                        setFormErrors(errors);
                                        return;
                                    }

                                    setFormErrors({});
                                    setCurrentStep('contact-details');
                                } else if (currentStep === 'contact-details') {
                                    // Validate contact details
                                    const errors: Record<string, string> = {};
                                    if (!contactDetails.contactName) errors.contactName = 'Full name is required';
                                    if (!contactDetails.contactEmail) errors.contactEmail = 'Email is required';
                                    if (!contactDetails.contactEmail.includes('@')) errors.contactEmail = 'Valid email is required';
                                    if (!contactDetails.phoneNumber) errors.phoneNumber = 'Phone number is required';

                                    if (Object.keys(errors).length > 0) {
                                        setFormErrors(errors);
                                        return;
                                    }

                                    setFormErrors({});
                                    setCurrentStep('account-setup');
                                } else if (currentStep === 'account-setup') {
                                    // Validate account credentials and terms
                                    const errors: Record<string, string> = {};
                                    if (!accountCredentials.username) errors.username = 'Username is required';
                                    if (!accountCredentials.password) errors.password = 'Password is required';
                                    if (accountCredentials.password && accountCredentials.password.length < 8)
                                        errors.password = 'Password must be at least 8 characters';
                                    if (accountCredentials.password !== accountCredentials.confirmPassword)
                                        errors.confirmPassword = 'Passwords do not match';
                                    if (!legalCompliance.acceptTerms)
                                        errors.acceptTerms = 'You must accept the terms and conditions';

                                    if (Object.keys(errors).length > 0) {
                                        setFormErrors(errors);
                                        return;
                                    }

                                    // Handle form submission
                                    handleSubmit();
                                }
                            }}
                            className="flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            {currentStep === 'account-setup' ? (
                                <>
                                    Complete Registration
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    Continue
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 text-center text-gray-600">
                        Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
                    </div>
                </div>
            </div>

            {/* Toast notification component */}
            <Toaster />
        </main>
    );
} 