
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
            <h2 className="text-xl font-semibold text-charcoal mb-4">Company Information</h2>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                id="companyName"
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="Enter your company name"
              />
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry *
              </label>
              <select
                id="industry"
                value={companyInfo.industry}
                onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
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
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                Company Size *
              </label>
              <select
                id="companySize"
                value={companyInfo.size}
                onChange={(e) => setCompanyInfo({...companyInfo, size: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4" data-testid="contact-details-step">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Contact Details</h2>
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="contactName"
                type="text"
                value={contactDetails.name}
                onChange={(e) => setContactDetails({...contactDetails, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={contactDetails.email}
                onChange={(e) => setContactDetails({...contactDetails, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                value={contactDetails.phone}
                onChange={(e) => setContactDetails({...contactDetails, phone: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position *
              </label>
              <input
                id="position"
                type="text"
                value={contactDetails.position}
                onChange={(e) => setContactDetails({...contactDetails, position: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="Your job title/position"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4" data-testid="account-credentials-step">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Account Credentials</h2>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={accountCredentials.username}
                onChange={(e) => setAccountCredentials({...accountCredentials, username: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={accountCredentials.password}
                onChange={(e) => setAccountCredentials({...accountCredentials, password: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                placeholder="Create a secure password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={accountCredentials.confirmPassword}
                onChange={(e) => setAccountCredentials({...accountCredentials, confirmPassword: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
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
            <h2 className="text-xl font-semibold text-charcoal mb-4">Legal & Compliance</h2>
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={legalCompliance.termsAccepted}
                  onChange={(e) => setLegalCompliance({...legalCompliance, termsAccepted: e.target.checked})}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> *
                </span>
              </label>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={legalCompliance.privacyAccepted}
                  onChange={(e) => setLegalCompliance({...legalCompliance, privacyAccepted: e.target.checked})}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I agree to the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> *
                </span>
              </label>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={legalCompliance.marketingOptIn}
                  onChange={(e) => setLegalCompliance({...legalCompliance, marketingOptIn: e.target.checked})}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I would like to receive marketing communications and updates
                </span>
              </label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md" data-testid="register-form">
      <div className="mb-6 w-full">
        <h1 className="text-2xl font-bold text-center text-charcoal mb-2">Create Business Account</h1>
        <p className="text-darkGray text-center mb-6">Join us to get started with your business experience</p>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* OAuth buttons - only show on first step */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Sign up with Google
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-lightGray"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-darkGray">Or continue with form</span>
              </div>
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Form steps */}
        <div className="space-y-4">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                step === 1 ? 'w-full' : 'ml-auto'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-darkGray">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
