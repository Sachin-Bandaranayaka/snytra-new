"use client";

import { useState, useEffect } from "react";
import { Metadata } from "next";
import { Switch } from "@mui/material";
import { formControlLabelClasses } from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";

const IOSSwitch = styled(Switch)(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
        padding: 0,
        margin: 2,
        transitionDuration: "300ms",
        "&.Mui-checked": {
            transform: "translateX(16px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
                backgroundColor: theme.palette.primary.main,
                opacity: 1,
                border: 0,
            },
            "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.5,
            },
        },
        "&.Mui-focusVisible .MuiSwitch-thumb": {
            color: "#33cf4d",
            border: "6px solid #fff",
        },
        "&.Mui-disabled .MuiSwitch-thumb": {
            color:
                theme.palette.mode === "light"
                    ? theme.palette.grey[100]
                    : theme.palette.grey[600],
        },
        "&.Mui-disabled + .MuiSwitch-track": {
            opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
        },
    },
    "& .MuiSwitch-thumb": {
        boxSizing: "border-box",
        width: 22,
        height: 22,
    },
    "& .MuiSwitch-track": {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
        opacity: 1,
        transition: theme.transitions.create(["background-color"], {
            duration: 500,
        }),
    },
}));

export default function CookieSettings() {
    const [essential, setEssential] = useState(true);
    const [analytics, setAnalytics] = useState(false);
    const [preferences, setPreferences] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load cookie preferences from localStorage when component mounts
        const cookieSettings = localStorage.getItem("cookieSettings");
        if (cookieSettings) {
            const parsedSettings = JSON.parse(cookieSettings);
            setAnalytics(parsedSettings.analytics || false);
            setPreferences(parsedSettings.preferences || false);
        }
    }, []);

    const handleSave = () => {
        // Save cookie settings to localStorage
        localStorage.setItem(
            "cookieSettings",
            JSON.stringify({
                essential: true, // Always true as it's required
                analytics,
                preferences,
            })
        );

        // Set analytics cookies based on user preference
        if (analytics) {
            // Code to initialize Google Analytics would go here
            console.log("Google Analytics enabled");
        } else {
            // Code to disable Google Analytics would go here
            console.log("Google Analytics disabled");
        }

        // Set preference cookies based on user preference
        if (preferences) {
            console.log("Preference cookies enabled");
        } else {
            // Remove preference cookies
            console.log("Preference cookies disabled");
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <main className="flex flex-col min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-charcoal mb-8">Cookie Settings</h1>
                <p className="mb-8 text-gray-600">
                    We use cookies to enhance your experience on our website. You can choose which types of cookies you allow us to use. Please note that essential cookies are required for the website to function properly.
                </p>

                <div className="space-y-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-semibold text-charcoal text-lg">Essential Cookies</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    These cookies are necessary for the website to function properly and cannot be disabled.
                                </p>
                            </div>
                            <IOSSwitch checked={essential} disabled />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-semibold text-charcoal text-lg">Analytics Cookies</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.
                                </p>
                            </div>
                            <IOSSwitch
                                checked={analytics}
                                onChange={(e) => setAnalytics(e.target.checked)}
                            />
                        </div>
                        {analytics && (
                            <div className="mt-4 border-t pt-4 text-sm text-gray-600">
                                <p>
                                    We use Google Analytics 4 which anonymizes your IP address before logging any data. We use this information to understand how our site is being used and to improve your experience.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-semibold text-charcoal text-lg">Preference Cookies</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    These cookies enable the website to provide enhanced functionality and personalization, such as remembering your preferences.
                                </p>
                            </div>
                            <IOSSwitch
                                checked={preferences}
                                onChange={(e) => setPreferences(e.target.checked)}
                            />
                        </div>
                        {preferences && (
                            <div className="mt-4 border-t pt-4 text-sm text-gray-600">
                                <p>
                                    Preference cookies allow us to remember choices you make such as dark mode, language preferences, and other display settings to provide a more personalized experience.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition duration-200"
                    >
                        Save Preferences
                    </button>
                    {saved && (
                        <p className="mt-4 text-green-600 font-medium animate-fade-in-out">
                            Your preferences have been saved!
                        </p>
                    )}
                </div>

                <div className="mt-12 border-t pt-8">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">More Information</h2>
                    <p className="mb-4 text-gray-600">
                        For more information about how we use cookies and your personal data, please see our{" "}
                        <a href="/privacy-policy" className="text-primary hover:underline">
                            Privacy Policy
                        </a>
                        .
                    </p>
                    <p className="text-gray-600">
                        If you have any questions or concerns about our use of cookies, please contact us at{" "}
                        <a href="mailto:privacy@snytra.com" className="text-primary hover:underline">
                            privacy@snytra.com
                        </a>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
} 