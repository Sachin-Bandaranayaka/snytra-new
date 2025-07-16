
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  website: string;
}

interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  position: string;
}

interface AccountCredentials {
  username: string;
  password: string;
  confirmPassword: string;
}

interface LegalCompliance {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
}

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "",
    industry: "",
    size: "",
    website: ""
  });

  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    name: "",
    email: "",
    phone: "",
    position: ""
  });

  const [accountCredentials, setAccountCredentials] = useState<AccountCredentials>({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [legalCompliance, setLegalCompliance] = useState<LegalCompliance>({
    termsAccepted: false,
    privacyAccepted: false,
    marketingOptIn: false
  });

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(companyInfo.name && companyInfo.industry && companyInfo.size);
      case 2:
        return !!(contactDetails.name && contactDetails.email && contactDetails.phone && contactDetails.position);
      case 3:
        return !!(accountCredentials.username && accountCredentials.password && 
               accountCredentials.password === accountCredentials.confirmPassword);
      case 4:
        return legalCompliance.termsAccepted && legalCompliance.privacyAccepted;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError("");
    } else {
      setError("Please fill in all required fields");
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError("Please accept the terms and privacy policy");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const registrationData = {
        companyInfo,
        contactDetails,
        accountCredentials: {
          username: accountCredentials.username,
          password: accountCredentials.password
        },
        legalCompliance: {
          acceptTerms: legalCompliance.termsAccepted,
          acceptPrivacyPolicy: legalCompliance.privacyAccepted,
          marketingOptIn: legalCompliance.marketingOptIn
        }
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // After successful registration, sign in the user
      const result = await signIn("credentials", {
        redirect: false,
        email: contactDetails.email,
        password: accountCredentials.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during registration");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4" data-testid="company-info-step">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Company Information</h2>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                id="companyName"
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter your company name"
              />
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                id="industry"
                value={companyInfo.industry}
                onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                <option value="">Select industry</option>
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
                Company Size *
              </label>
              <select
                id="companySize"
                value={companyInfo.size}
                onChange={(e) => setCompanyInfo({...companyInfo, size: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4" data-testid="contact-details-step">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Contact Details</h2>
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="contactName"
                type="text"
                value={contactDetails.name}
                onChange={(e) => setContactDetails({...contactDetails, name: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={contactDetails.email}
                onChange={(e) => setContactDetails({...contactDetails, email: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                value={contactDetails.phone}
                onChange={(e) => setContactDetails({...contactDetails, phone: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <input
                id="position"
                type="text"
                value={contactDetails.position}
                onChange={(e) => setContactDetails({...contactDetails, position: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Your job title/position"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4" data-testid="account-credentials-step">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Account Credentials</h2>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={accountCredentials.username}
                onChange={(e) => setAccountCredentials({...accountCredentials, username: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={accountCredentials.password}
                onChange={(e) => setAccountCredentials({...accountCredentials, password: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Create a secure password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={accountCredentials.confirmPassword}
                onChange={(e) => setAccountCredentials({...accountCredentials, confirmPassword: e.target.value})}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Confirm your password"
              />
            </div>
            {accountCredentials.password && accountCredentials.confirmPassword && 
             accountCredentials.password !== accountCredentials.confirmPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4" data-testid="legal-compliance-step">
            <h2 className="text-xl font-semibold text-charcoal mb-6">Legal Agreements</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={legalCompliance.termsAccepted}
                  onChange={(e) => setLegalCompliance({...legalCompliance, termsAccepted: e.target.checked})}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="termsAccepted" className="ml-3 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:text-primary-dark transition-colors font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary-dark transition-colors font-medium">
                    Privacy Policy
                  </Link>
                  {' '}*
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  checked={legalCompliance.marketingOptIn}
                  onChange={(e) => setLegalCompliance({...legalCompliance, marketingOptIn: e.target.checked})}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="marketingConsent" className="ml-3 block text-sm text-gray-700">
                  I would like to receive marketing communications and updates
                </label>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-form">
      {/* Left Panel - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Join Snytra Today!</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Create your business account and start managing your restaurant with our comprehensive platform.
            </p>
          </div>
          <div className="w-full max-w-md">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
              <h3 className="text-lg font-semibold mb-3">What You'll Get:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Complete restaurant management suite
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced analytics and insights
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Dedicated customer support
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free 30-day trial
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-yellow bg-opacity-20 rounded-full"></div>
        <div className="absolute top-1/2 left-20 w-16 h-16 bg-beige bg-opacity-15 rounded-full"></div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-charcoal mb-2">Create Business Account</h2>
              <p className="text-gray-600">Join us to get started with your business</p>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        stepNumber <= step
                          ? 'bg-primary text-white shadow-lg'
                          : stepNumber === step + 1
                          ? 'bg-primary bg-opacity-20 text-primary border-2 border-primary'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {stepNumber <= step ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                      stepNumber <= step ? 'text-primary' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 && 'Company'}
                      {stepNumber === 2 && 'Contact'}
                      {stepNumber === 3 && 'Account'}
                      {stepNumber === 4 && 'Legal'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* OAuth buttons - only show on first step */}
            {step === 1 && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Sign up with Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-darkGray">Or continue with form</span>
                  </div>
                </div>
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Form steps */}
            <div className="space-y-6">
              {renderStep()}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Previous
                </button>
              )}
              <div className="ml-auto">
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
